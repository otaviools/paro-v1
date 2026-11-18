import { describe, expect, it } from 'vitest'
import type { ConfiguracaoDaAreaCoberta } from '#shared/utils/area-coberta'
import { criarMetricasFicticias } from './ficticias'
import { PeriodoInvalido } from '.'

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

const metricas = criarMetricasFicticias(configuracao)

// 03/05/2027 é segunda-feira; 31/05/2027 também.
const relatorio = metricas.relatorio('2027-05-01', '2027-05-31')

describe('Métricas fictícias', () => {
  it('só traz as semanas que já teriam sido consolidadas: a semana seguinte terminou', () => {
    expect(relatorio.recorrencia.map(s => s.semana)).toEqual(['2027-05-03', '2027-05-10', '2027-05-17'])
    for (const s of relatorio.recorrencia) {
      expect(s.voltaramNaSemanaSeguinte).toBeGreaterThan(0)
      expect(s.voltaramNaSemanaSeguinte).toBeLessThanOrEqual(s.motoristas)
    }
  })

  it('traz respostas e registros só de segunda a sexta, e registros só das noites já fechadas', () => {
    const fimDeSemana = ['2027-05-01', '2027-05-02', '2027-05-08', '2027-05-09']
    expect(relatorio.ajudou.some(d => fimDeSemana.includes(d.data))).toBe(false)
    expect(relatorio.registrosPorNoite.some(n => fimDeSemana.includes(n.noite))).toBe(false)
    expect(relatorio.registrosPorNoite.at(-1)?.noite).toBe('2027-05-28')
  })

  it('registra só nas ruas cobertas e faixas horárias da área coberta, com o total da noite', () => {
    for (const noite of relatorio.registrosPorNoite) {
      expect(noite.total).toBe(noite.porRuaEFaixaHoraria.reduce((soma, t) => soma + t.quantidade, 0))
      for (const t of noite.porRuaEFaixaHoraria) {
        expect(['rua-a', 'rua-b']).toContain(t.ruaCoberta)
        expect(t.quantidade).toBeGreaterThan(0)
      }
    }
  })

  it('dá sempre os mesmos números para o mesmo dia, em qualquer período pedido', () => {
    const outroPeriodo = metricas.relatorio('2027-05-10', '2027-05-31')
    const dia = (r: typeof relatorio) => r.ajudou.find(d => d.data === '2027-05-12')
    expect(dia(outroPeriodo)).toEqual(dia(relatorio))
    expect(metricas.relatorio('2027-05-01', '2027-05-31')).toEqual(relatorio)
  })

  it('recusa um período inválido, como as métricas reais', () => {
    expect(() => metricas.relatorio('2027-05-31', '2027-05-01')).toThrow(PeriodoInvalido)
    expect(() => metricas.relatorio('2026-01-01', '2027-05-31')).toThrow(PeriodoInvalido)
  })
})
