import type { Data, FaixaHorária } from '../area-coberta'

/**
 * Contagem feita em campo, numa noite, das vagas existentes e ocupadas de uma
 * rua coberta numa faixa horária. Observações fictícias têm o mesmo formato
 * (ADR 0012). Sem nenhum dado de pessoa.
 */
export interface Observação {
  ruaCoberta: string
  faixaHorária: FaixaHorária
  data: Data
  totalDeVagas: number
  vagasOcupadas: number
}

/**
 * Fonte das observações. Há um adapter por fonte (observações reais ou
 * fictícias) e cada um entrega só a sua: as duas nunca se misturam (ADR 0012).
 */
export interface Observações {
  doSemestre(semestre: string): Promise<Observação[]>
  /** Verdadeiro quando a fonte é de observações fictícias. */
  éDemonstração(): boolean
}
