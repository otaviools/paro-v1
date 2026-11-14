/**
 * Parâmetros da Chance. São escolhas da equipe e podem ser recalibrados
 * depois das primeiras semanas de dados (ADR 0006), por isso ficam aqui e
 * não espalhados pelo código.
 */
export interface ConfiguracaoDaChance {
  /** Ocupação, em %, a partir da qual a rua coberta está cheia (ADR 0005). */
  ocupacaoDeRuaCheia: number
  /** Mínimo de observações em dias diferentes para sair de Sem dado (ADR 0007). */
  minimoDeObservacoes: number
  /** Cortes das faixas de chance, em % (ADR 0006). */
  cortes: { tranquilo: number, apertado: number }
}

export const configuracaoDaChance: ConfiguracaoDaChance = {
  ocupacaoDeRuaCheia: 85,
  minimoDeObservacoes: 4,
  cortes: { tranquilo: 70, apertado: 40 },
}
