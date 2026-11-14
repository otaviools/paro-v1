import type { FaixaHoraria, Ponto } from './area-coberta'
import type { Estimativa } from './chance'

/** Faixa horária pedida pelo motorista: uma das faixas horárias ou "agora". */
export type FaixaHorariaPedida = FaixaHoraria | 'agora'

/** Query de `GET /api/panorama`. Sem `faixaHoraria`, vale "agora". */
export interface ConsultaDoPanorama {
  faixaHoraria?: FaixaHorariaPedida
}

export interface RuaNoPanorama {
  rua: { id: string, nome: string }
  estimativa: Estimativa
  /**
   * Registros de vaga abertos da noite com saída prevista nesta rua coberta e
   * faixa horária. À parte da chance, que vem só das observações (ADR 0009).
   */
  saidasPrevistas: number
  /** Distância a pé do meio do trecho até o destino, em metros. */
  distanciaAoDestino: number
}

/** Rua coberta com chance (nunca Sem dado), que pode ser a melhor chance. */
export interface MelhorChance extends RuaNoPanorama {
  estimativa: Extract<Estimativa, { tipo: 'chance' }>
}

/** Resposta de `GET /api/panorama`. */
export interface Panorama {
  /** Faixa horária mostrada; null quando "agora" está fora da área coberta. */
  faixaHoraria: FaixaHoraria | null
  /** Ruas cobertas por chance; vazia quando `faixaHoraria` é null. */
  ruas: RuaNoPanorama[]
  /**
   * Rua coberta de maior chance na faixa horária; em empate, a mais perto do
   * destino. Ruas Sem dado não concorrem: null quando todas estão Sem dado.
   */
  melhorChance: MelhorChance | null
  /** Verdadeiro enquanto a chance vier de observações fictícias (ADR 0012). */
  demonstracao: boolean
}

/** Estimativa de uma rua coberta numa faixa horária da noite. */
export interface FaixaHorariaDaRua {
  faixaHoraria: FaixaHoraria
  estimativa: Estimativa
}

/**
 * Resposta de `GET /api/ruas/:id`: uma rua coberta em todas as faixas
 * horárias da noite (Detalhe da rua).
 */
export interface RuaAoLongoDaNoite {
  rua: { id: string, nome: string }
  /** Distância a pé do meio do trecho até o destino, em metros. */
  distanciaAoDestino: number
  /** Ponto da rua coberta: o meio do trecho, destino de "Como chegar" (ADRs 0020 e 0024). */
  meioDoTrecho: Ponto
  /** Estimativa de cada faixa horária das 17h às 23h, em ordem. */
  faixasHorarias: FaixaHorariaDaRua[]
  /**
   * Saídas previstas da noite na rua, só nas faixas horárias que têm alguma,
   * em ordem. À parte da chance (ADR 0009).
   */
  saidasPrevistas: { faixaHoraria: FaixaHoraria, quantidade: number }[]
  /**
   * Faixa horária de maior chance da rua; em empate, a mais cedo. Faixas
   * horárias Sem dado não concorrem: null quando a rua está Sem dado a noite toda.
   */
  melhorFaixaHoraria: FaixaHoraria | null
  /** Verdadeiro enquanto a chance vier de observações fictícias (ADR 0012). */
  demonstracao: boolean
}
