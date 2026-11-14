import type { Data } from './area-coberta'

export type FaixaDeChance = 'Tranquilo' | 'Apertado' | 'Difícil'

export interface Base {
  /** Número de observações que sustentam a chance. */
  observacoes: number
  /** Data da observação mais recente. */
  ultima: Data
}

export type Estimativa
  = | { tipo: 'chance', faixaDeChance: FaixaDeChance, /** Em %, de 0 a 100. */ chance: number, base: Base }
    | { tipo: 'sem-dado' }
