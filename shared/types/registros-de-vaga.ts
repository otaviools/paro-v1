import type { Data, FaixaHoraria } from './area-coberta'

/**
 * Corpo de `POST /api/registros`: a rua coberta e a saída prevista. Nunca
 * leva coordenadas: o ponto do carro fica só no celular (ADR 0003).
 */
export interface CorpoDoRegistro {
  ruaCoberta: string
  saidaPrevista: FaixaHoraria
}

/**
 * Resposta de `POST /api/registros`: o que o celular guarda depois de
 * registrar (Dados do celular).
 */
export interface Registrado {
  /** Código aleatório de uso único; o servidor guarda só o hash (ADR 0014). */
  codigo: string
  noite: Data
  chegada: FaixaHoraria
}

/** Corpo de `PATCH /api/registros/saida`. O código vai no corpo, nunca na URL. */
export interface CorpoDaSaida {
  codigo: string
  saidaPrevista: FaixaHoraria
}

/** Resposta de `PATCH /api/registros/saida`. */
export interface RespostaDaSaida {
  saidaPrevista: FaixaHoraria
}

/** Corpo de `POST /api/registros/encerrar` (o "Saí"). O código vai no corpo, nunca na URL. */
export interface CorpoDoEncerramento {
  codigo: string
}

/** Resposta de `POST /api/registros/encerrar`. */
export interface RespostaDoEncerramento {
  encerrado: true
}

/**
 * Total de registros por noite (ADR 0021): quantos registros de vaga chegaram
 * numa rua coberta e faixa horária, numa noite fechada. Sem identificador nem código.
 */
export interface TotalDeRegistros {
  ruaCoberta: string
  /** Faixa horária de chegada dos registros. */
  faixaHoraria: FaixaHoraria
  quantidade: number
}

/** Resposta de `GET /api/cron/fechar-noites`, a rotina diária (ADR 0021). */
export interface RespostaDoFechamentoDasNoites {
  noitesFechadas: Data[]
  semanasConsolidadas: Data[]
  sessoesApagadas: number
}
