/** Ponto no mapa, em graus. */
export interface Ponto {
  lat: number
  lon: number
}

/** Data local no formato "AAAA-MM-DD". */
export type Data = string

/** Início de uma faixa horária de 30 minutos, no formato "HH:MM" (ex.: "19:30"). */
export type FaixaHoraria = string

/** Resposta de `GET /api/agora`: a noite e a faixa horária de agora. */
export interface RespostaDeAgora {
  noite: Data
  /** Null fora da área coberta (antes das 17h ou a partir das 23h). */
  faixaHoraria: FaixaHoraria | null
}

/** Resposta de `GET /api/faixas-horarias`: as faixas horárias da área coberta, em ordem. */
export type RespostaDasFaixasHorarias = FaixaHoraria[]

/** Rua coberta na escolha do registro manual. */
export interface RuaParaEscolher {
  id: string
  nome: string
  /** Distância a pé do meio do trecho até o destino, em metros. */
  distanciaAoDestino: number
}

/** Resposta de `GET /api/ruas`: ruas cobertas, da mais perto à mais longe do destino. */
export type RespostaDasRuas = RuaParaEscolher[]

/** Linha do trecho de uma rua coberta, que o Mapa da área desenha (ADR 0024). */
export interface TrechoNoMapa {
  id: string
  linha: Ponto[]
}

/** Resposta de `GET /api/trechos`: a linha do trecho de cada rua coberta. */
export type RespostaDosTrechos = TrechoNoMapa[]
