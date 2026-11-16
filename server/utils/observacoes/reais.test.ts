import { beforeEach, describe, expect, it } from 'vitest'
import { criarAreaCoberta } from '#shared/utils/area-coberta'
import type { ConfiguracaoDaAreaCoberta } from '#shared/utils/area-coberta'
import { criarBancoDeTeste } from '../../testes/banco-de-teste'
import { fonteDeObservacoes } from './fonte'
import { criarObservacoesReais, ObservacaoInvalida } from './reais'

const configuracao: ConfiguracaoDaAreaCoberta = {
  provisoria: true,
  fusoHorario: 'America/Sao_Paulo',
  destino: { nome: 'Entrada de pedestres principal', ponto: { lat: -18.9, lon: -48.27 } },
  ruasCobertas: [
    { id: 'rua-a', nome: 'Rua A', trecho: { de: 'Esquina 1', ate: 'Esquina 2', meio: { lat: -18.901, lon: -48.271 }, linha: [] }, distanciaAoDestinoMetros: 300 },
    { id: 'rua-b', nome: 'Rua B', trecho: { de: 'Esquina 3', ate: 'Esquina 4', meio: { lat: -18.902, lon: -48.272 }, linha: [] }, distanciaAoDestinoMetros: 120 },
  ],
  calendarioLetivo: [
    { id: '2027-1', de: '2027-02-15', ate: '2027-06-30', diasDeAula: [1, 2, 3, 4, 5], provas: [], feriados: [], ferias: [] },
    { id: '2027-2', de: '2027-08-02', ate: '2027-12-10', diasDeAula: [1, 2, 3, 4, 5], provas: [], feriados: [], ferias: [] },
  ],
}

/** Quarta-feira, 05/05/2027, 19h10 em Uberlândia (UTC-3). */
const agora = new Date('2027-05-05T22:10:00Z')

const contagem = { data: '2027-05-05', ruaCoberta: 'rua-a', faixaHoraria: '19:00', totalDeVagas: 20, vagasOcupadas: 18 }

let observacoes: ReturnType<typeof criarObservacoesReais>

beforeEach(async () => {
  observacoes = criarObservacoesReais({ banco: await criarBancoDeTeste(), areaCoberta: criarAreaCoberta(configuracao) })
})

describe('Observações reais', () => {
  it('registra a contagem e a entrega à Chance no semestre da data', async () => {
    await observacoes.registrar(contagem, agora)

    expect(await observacoes.doSemestre('2027-1')).toEqual([
      { data: '2027-05-05', ruaCoberta: 'rua-a', faixaHoraria: '19:00', totalDeVagas: 20, vagasOcupadas: 18 },
    ])
  })

  it('não é demonstração', () => {
    expect(observacoes.eDemonstracao()).toBe(false)
  })

  it('observação de outro semestre não conta no semestre atual', async () => {
    await observacoes.registrar(contagem, new Date('2027-09-01T22:10:00Z'))
    await observacoes.registrar({ ...contagem, data: '2027-09-01' }, new Date('2027-09-01T22:10:00Z'))

    expect((await observacoes.doSemestre('2027-2')).map(o => o.data)).toEqual(['2027-09-01'])
    expect((await observacoes.doSemestre('2027-1')).map(o => o.data)).toEqual(['2027-05-05'])
  })

  it('lançar de novo a mesma rua, faixa horária e data corrige a anterior', async () => {
    const primeira = await observacoes.registrar(contagem, agora)
    const corrigida = await observacoes.registrar({ ...contagem, vagasOcupadas: 5 }, agora)

    expect(corrigida.id).toBe(primeira.id)
    expect(await observacoes.listar()).toEqual([{ ...contagem, id: primeira.id, vagasOcupadas: 5 }])
  })

  it('lista da mais nova para a mais antiga e apaga pelo id', async () => {
    const antiga = await observacoes.registrar({ ...contagem, data: '2027-05-03' }, agora)
    const nova = await observacoes.registrar(contagem, agora)

    expect((await observacoes.listar()).map(o => o.id)).toEqual([nova.id, antiga.id])

    await observacoes.apagar(antiga.id)
    expect((await observacoes.listar()).map(o => o.id)).toEqual([nova.id])
  })

  it.each([
    ['data futura', { data: '2027-05-06' }],
    ['data inexistente', { data: '2027-02-30' }],
    ['rua fora da área coberta', { ruaCoberta: 'rua-z' }],
    ['faixa horária fora da área coberta', { faixaHoraria: '16:30' }],
    ['total de vagas zero', { totalDeVagas: 0 }],
    ['total de vagas não inteiro', { totalDeVagas: 2.5 }],
    ['mais vagas ocupadas que o total', { vagasOcupadas: 21 }],
    ['vagas ocupadas negativas', { vagasOcupadas: -1 }],
  ])('recusa %s', async (_, troca) => {
    await expect(observacoes.registrar({ ...contagem, ...troca }, agora)).rejects.toBeInstanceOf(ObservacaoInvalida)
    expect(await observacoes.listar()).toEqual([])
  })
})

describe('Fonte de observações do app', () => {
  it('usa as reais só com NUXT_FONTE_DE_OBSERVACOES = "reais"', () => {
    expect(fonteDeObservacoes('reais')).toBe('reais')
    expect(fonteDeObservacoes(undefined)).toBe('ficticias')
    expect(fonteDeObservacoes('ficticias')).toBe('ficticias')
    expect(fonteDeObservacoes('REAIS')).toBe('ficticias')
  })
})
