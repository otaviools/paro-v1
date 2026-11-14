import type { Data, FaixaHoraria } from '#shared/types/area-coberta'
import type { Estimativa, FaixaDeChance } from '#shared/types/chance'
import type { Observacao } from '../observacoes'
import { configuracaoDaChance } from './configuracao'
import type { ConfiguracaoDaChance } from './configuracao'

/** Chave do mapa de estimativas para uma rua coberta numa faixa horária. */
function chave(ruaCoberta: string, faixaHoraria: FaixaHoraria): string {
  return `${ruaCoberta}|${faixaHoraria}`
}

/** Calendário letivo de que a Chance precisa (a Área coberta satisfaz). */
export interface Calendario {
  semestreDe(data: Data): string | null
  eDiaLetivoNormal(data: Data): boolean
}

/**
 * Transforma observações em estimativas por rua coberta e faixa horária.
 * Uma combinação ausente do mapa é Sem dado. Cálculo puro, sem banco nem relógio.
 */
export function estimar(
  observacoes: Observacao[],
  semestre: string,
  calendario: Calendario,
  configuracao: ConfiguracaoDaChance = configuracaoDaChance,
): Map<string, Estimativa> {
  const grupos = new Map<string, Observacao[]>()
  // Só contam observações do semestre atual em dias letivos normais (ADRs 0007 e 0008).
  const consideradas = observacoes.filter(o =>
    calendario.semestreDe(o.data) === semestre && calendario.eDiaLetivoNormal(o.data))
  for (const o of consideradas) {
    const k = chave(o.ruaCoberta, o.faixaHoraria)
    grupos.set(k, [...(grupos.get(k) ?? []), o])
  }

  const estimativas = new Map<string, Estimativa>()
  for (const [k, grupo] of grupos) {
    const dias = new Set(grupo.map(o => o.data))
    if (dias.size < configuracao.minimoDeObservacoes) continue

    const ruaCheia = (o: Observacao) =>
      o.vagasOcupadas * 100 >= configuracao.ocupacaoDeRuaCheia * o.totalDeVagas
    const naoCheias = grupo.filter(o => !ruaCheia(o)).length
    const chance = (naoCheias * 100) / grupo.length

    estimativas.set(k, {
      tipo: 'chance',
      faixaDeChance: faixaDeChanceDe(naoCheias, grupo.length, configuracao.cortes),
      chance,
      base: { observacoes: grupo.length, ultima: [...dias].sort().at(-1)! },
    })
  }
  return estimativas
}

/** Compara em números inteiros, para que 7 de 10 seja exatamente 70%. */
function faixaDeChanceDe(naoCheias: number, total: number, cortes: ConfiguracaoDaChance['cortes']): FaixaDeChance {
  if (naoCheias * 100 >= cortes.tranquilo * total) return 'Tranquilo'
  if (naoCheias * 100 >= cortes.apertado * total) return 'Apertado'
  return 'Difícil'
}

/** Estimativa de uma rua coberta numa faixa horária; Sem dado quando não há. */
export function estimativaDe(estimativas: Map<string, Estimativa>, ruaCoberta: string, faixaHoraria: FaixaHoraria): Estimativa {
  return estimativas.get(chave(ruaCoberta, faixaHoraria)) ?? { tipo: 'sem-dado' }
}
