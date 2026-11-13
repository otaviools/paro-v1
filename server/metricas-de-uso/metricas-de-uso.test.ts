import { beforeEach, describe, expect, it } from 'vitest'
import { criarAreaCoberta } from '../area-coberta'
import type { ConfiguracaoDaAreaCoberta } from '../area-coberta'
import { criarBancoDeTeste } from '../banco/teste'
import { criarRegistrosDeVaga } from '../registros-de-vaga'
import { criarMetricasDeUso, IdMensalInválido } from '.'

const configuracao: ConfiguracaoDaAreaCoberta = {
  provisoria: true,
  fusoHorario: 'America/Sao_Paulo',
  destino: { nome: 'Entrada de pedestres principal', ponto: { lat: -18.9, lon: -48.27 } },
  ruasCobertas: [
    { id: 'rua-a', nome: 'Rua A', trecho: { de: 'Esquina 1', ate: 'Esquina 2', meio: { lat: -18.901, lon: -48.271 }, linha: [] }, distanciaAoDestinoMetros: 300 },
    { id: 'rua-b', nome: 'Rua B', trecho: { de: 'Esquina 3', ate: 'Esquina 4', meio: { lat: -18.902, lon: -48.272 }, linha: [] }, distanciaAoDestinoMetros: 120 },
  ],
  calendarioLetivo: [],
}

let registros: ReturnType<typeof criarRegistrosDeVaga>
let metricas: ReturnType<typeof criarMetricasDeUso>

beforeEach(async () => {
  const banco = await criarBancoDeTeste()
  registros = criarRegistrosDeVaga({ banco, areaCoberta: criarAreaCoberta(configuracao) })
  metricas = criarMetricasDeUso({ banco, registrosDeVaga: registros })
})

// Semanas de segunda a domingo: 03/05/2027 é segunda-feira.
const ID_A = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const ID_B = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
const ID_C = 'cccccccccccccccccccccccccccccccc'

describe('Métricas de uso', () => {
  it('conta quantos motoristas da semana voltaram na semana seguinte', async () => {
    // Semana de 03/05: A, B e C. Semana de 10/05: só A volta.
    await metricas.registrarSessão(ID_A, '2027-05-03')
    await metricas.registrarSessão(ID_B, '2027-05-05')
    await metricas.registrarSessão(ID_C, '2027-05-09')
    await metricas.registrarSessão(ID_A, '2027-05-12')

    await metricas.consolidar('2027-05-17')

    const { recorrência } = await metricas.relatório('2027-05-01', '2027-05-31')
    expect(recorrência).toEqual([
      { semana: '2027-05-03', motoristas: 3, voltaramNaSemanaSeguinte: 1 },
    ])
  })

  it('consolida as sessões com mais de 60 dias em totais e apaga essas sessões (ADR 0021)', async () => {
    // Em 01/05/2027, 01/03 tem 61 dias e 02/03 tem 60. As duas são da semana de 01/03.
    await metricas.registrarSessão(ID_A, '2027-03-01')
    await metricas.registrarSessão(ID_B, '2027-03-02')

    const consolidação = await metricas.consolidar('2027-05-01')

    expect(consolidação).toEqual({ semanasConsolidadas: ['2027-03-01'], sessõesApagadas: 1 })
    const { recorrência } = await metricas.relatório('2027-03-01', '2027-03-31')
    expect(recorrência).toEqual([
      { semana: '2027-03-01', motoristas: 2, voltaramNaSemanaSeguinte: 0 },
    ])
  })

  it('consolidar de novo não duplica os totais nem muda o que já foi consolidado', async () => {
    await metricas.registrarSessão(ID_A, '2027-03-01')
    await metricas.registrarSessão(ID_B, '2027-03-02')
    await metricas.registrarSessão(ID_A, '2027-03-09')
    await metricas.consolidar('2027-05-01')

    const deNovo = await metricas.consolidar('2027-05-01')
    // No dia seguinte, a sessão de 02/03 passa dos 60 dias; a semana de 01/03 já tinha sido consolidada.
    const noDiaSeguinte = await metricas.consolidar('2027-05-02')

    expect(deNovo).toEqual({ semanasConsolidadas: [], sessõesApagadas: 0 })
    expect(noDiaSeguinte).toEqual({ semanasConsolidadas: [], sessõesApagadas: 1 })
    const { recorrência } = await metricas.relatório('2027-03-01', '2027-03-31')
    expect(recorrência).toEqual([
      { semana: '2027-03-01', motoristas: 2, voltaramNaSemanaSeguinte: 1 },
      { semana: '2027-03-08', motoristas: 1, voltaramNaSemanaSeguinte: 0 },
    ])
  })

  it('conta as respostas de "A previsão ajudou hoje?" por data', async () => {
    await metricas.responderAjudou(true, '2027-05-05')
    await metricas.responderAjudou(false, '2027-05-05')
    await metricas.responderAjudou(true, '2027-05-05')
    await metricas.responderAjudou(true, '2027-05-06')
    await metricas.responderAjudou(false, '2027-06-01')

    const { ajudou } = await metricas.relatório('2027-05-01', '2027-05-31')

    expect(ajudou).toEqual([
      { data: '2027-05-05', sim: 2, não: 1 },
      { data: '2027-05-06', sim: 1, não: 0 },
    ])
  })

  it('mostra o total de registros por noite que o fechamento da noite gravou', async () => {
    /** Quarta-feira, 05/05/2027, 19h10 em Uberlândia (UTC-3). */
    const agora = new Date('2027-05-05T22:10:00Z')
    await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saídaPrevista: '21:30' }, agora)
    await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saídaPrevista: '22:00' }, agora)
    await registros.registrar({ ruaCoberta: 'rua-b', chegada: '18:30', saídaPrevista: '21:00' }, agora)
    await registros.fecharNoite('2027-05-05')

    const { registrosPorNoite } = await metricas.relatório('2027-05-01', '2027-05-31')

    expect(registrosPorNoite).toEqual([
      {
        noite: '2027-05-05',
        total: 3,
        porRuaEFaixaHorária: [
          { ruaCoberta: 'rua-a', faixaHorária: '19:00', quantidade: 2 },
          { ruaCoberta: 'rua-b', faixaHorária: '18:30', quantidade: 1 },
        ],
      },
    ])
  })

  it('recusa um identificador mensal que não é um número sorteado, para não guardar texto livre', async () => {
    await expect(metricas.registrarSessão('fulano@exemplo.com', '2027-05-05')).rejects.toThrow(IdMensalInválido)
    await expect(metricas.registrarSessão('', '2027-05-05')).rejects.toThrow(IdMensalInválido)
  })
})
