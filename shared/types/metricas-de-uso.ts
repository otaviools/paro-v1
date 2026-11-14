import type { Data } from './area-coberta'
import type { TotalDeRegistros } from './registros-de-vaga'

/** Corpo de `POST /api/sessoes`: só o identificador mensal sorteado no celular (ADR 0004). */
export interface CorpoDaSessao {
  idMensal: string
}

/** Corpo de `POST /api/ajudou`: a resposta a "A previsão ajudou hoje?". */
export interface CorpoDoAjudou {
  ajudou: boolean
}

/** Query de `GET /api/equipe/metricas`: período de até 366 dias. */
export interface ConsultaDasMetricas {
  de: Data
  ate: Data
}

/** Recorrência de uma semana (de segunda a domingo). */
export interface RecorrenciaDaSemana {
  /** Segunda-feira da semana. */
  semana: Data
  /** Motoristas distintos na semana, pelo identificador mensal. */
  motoristas: number
  /** Desses, quantos voltaram na semana seguinte. */
  voltaramNaSemanaSeguinte: number
}

/** Respostas a "A previsão ajudou hoje?" numa data. */
export interface RespostasDoDia {
  data: Data
  sim: number
  nao: number
}

/** Total de registros de vaga de uma noite fechada, gravado pelo fechamento da noite. */
export interface RegistrosDaNoite {
  noite: Data
  total: number
  porRuaEFaixaHoraria: TotalDeRegistros[]
}

export interface Relatorio {
  recorrencia: RecorrenciaDaSemana[]
  ajudou: RespostasDoDia[]
  registrosPorNoite: RegistrosDaNoite[]
}

/** Resposta de `GET /api/equipe/metricas`: o período pedido e o relatório. */
export type RespostaDasMetricas = ConsultaDasMetricas & Relatorio
