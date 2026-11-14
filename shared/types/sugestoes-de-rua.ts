import type { Data } from './area-coberta'

/** Corpo de `POST /api/sugestoes` (ADR 0013): só o texto, sem identificador. */
export interface CorpoDaSugestao {
  texto: string
}

/** Sugestão de rua guardada, como a equipe lê. */
export interface SugestaoDeRua {
  id: number
  texto: string
  data: Data
}

/** Resposta de `GET /api/equipe/sugestoes`: da mais antiga para a mais nova. */
export type RespostaDasSugestoes = SugestaoDeRua[]
