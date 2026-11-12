import type { Data, FaixaHorária } from '../area-coberta'
import type { Observação } from '../observacoes'
import { configuracaoDaChance } from './configuracao'
import type { ConfiguracaoDaChance } from './configuracao'

export type { ConfiguracaoDaChance } from './configuracao'

export type FaixaDeChance = 'Tranquilo' | 'Apertado' | 'Difícil'

export interface Base {
  /** Número de observações que sustentam a chance. */
  observações: number
  /** Data da observação mais recente. */
  última: Data
}

export type Estimativa =
  | { tipo: 'chance', faixaDeChance: FaixaDeChance, /** Em %, de 0 a 100. */ chance: number, base: Base }
  | { tipo: 'sem-dado' }

/** Chave do mapa de estimativas para uma rua coberta numa faixa horária. */
export function chave(ruaCoberta: string, faixaHorária: FaixaHorária): string {
  return `${ruaCoberta}|${faixaHorária}`
}

/** Calendário letivo de que a Chance precisa (a Área coberta satisfaz). */
export interface Calendário {
  semestreDe(data: Data): string | null
  éDiaLetivoNormal(data: Data): boolean
}

/**
 * Transforma observações em estimativas por rua coberta e faixa horária.
 * Uma combinação ausente do mapa é Sem dado. Cálculo puro, sem banco nem relógio.
 */
export function estimar(
  observações: Observação[],
  semestre: string,
  calendário: Calendário,
  configuracao: ConfiguracaoDaChance = configuracaoDaChance,
): Map<string, Estimativa> {
  const grupos = new Map<string, Observação[]>()
  // Só contam observações do semestre atual em dias letivos normais (ADRs 0007 e 0008).
  const consideradas = observações.filter((o) =>
    calendário.semestreDe(o.data) === semestre && calendário.éDiaLetivoNormal(o.data))
  for (const o of consideradas) {
    const k = chave(o.ruaCoberta, o.faixaHorária)
    grupos.set(k, [...(grupos.get(k) ?? []), o])
  }

  const estimativas = new Map<string, Estimativa>()
  for (const [k, grupo] of grupos) {
    const dias = new Set(grupo.map((o) => o.data))
    if (dias.size < configuracao.mínimoDeObservações) continue

    const ruaCheia = (o: Observação) =>
      o.vagasOcupadas * 100 >= configuracao.ocupaçãoDeRuaCheia * o.totalDeVagas
    const naoCheias = grupo.filter((o) => !ruaCheia(o)).length
    const chance = (naoCheias * 100) / grupo.length

    estimativas.set(k, {
      tipo: 'chance',
      faixaDeChance: faixaDeChanceDe(naoCheias, grupo.length, configuracao.cortes),
      chance,
      base: { observações: grupo.length, última: [...dias].sort().at(-1)! },
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
export function estimativaDe(estimativas: Map<string, Estimativa>, ruaCoberta: string, faixaHorária: FaixaHorária): Estimativa {
  return estimativas.get(chave(ruaCoberta, faixaHorária)) ?? { tipo: 'sem-dado' }
}
