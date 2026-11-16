import type { Data, FaixaHoraria } from './area-coberta'

/**
 * Corpo de `POST /api/equipe/observacoes`: uma contagem feita em campo pela
 * equipe (ADR 0011). Lançar de novo a mesma rua, faixa horária e data
 * corrige a contagem anterior.
 */
export interface CorpoDaObservacao {
  data: Data
  ruaCoberta: string
  faixaHoraria: FaixaHoraria
  totalDeVagas: number
  vagasOcupadas: number
}

/** Observação guardada, como a equipe lê. */
export interface ObservacaoRegistrada extends CorpoDaObservacao {
  id: number
}

/** Fonte de observações que o app usa para a chance (ADR 0012). */
export type FonteDeObservacoes = 'reais' | 'ficticias'

/** Resposta de `GET /api/equipe/observacoes`: da mais nova para a mais antiga. */
export interface RespostaDasObservacoes {
  /** Fonte que o app está usando agora para a chance. */
  fonte: FonteDeObservacoes
  observacoes: ObservacaoRegistrada[]
}
