/** Início do pico de saída (glossário: das 21h às 22h59). */
const INICIO_DO_PICO_DE_SAIDA = '21:00'

export interface GrupoDeFaixasHorarias {
  rotulo: string
  faixasHorarias: string[]
}

/**
 * Faixas horárias que podem ser a saída prevista, a partir de `aPartirDe`,
 * em dois grupos de chips: antes do pico de saída e o pico de saída. Grupos
 * vazios ficam de fora.
 */
export function gruposDaSaidaPrevista(faixasHorarias: string[], aPartirDe: string): GrupoDeFaixasHorarias[] {
  const possiveis = faixasHorarias.filter((f) => f >= aPartirDe)
  return [
    { rotulo: 'Antes do pico de saída', faixasHorarias: possiveis.filter((f) => f < INICIO_DO_PICO_DE_SAIDA) },
    { rotulo: 'Pico de saída · 21h às 23h', faixasHorarias: possiveis.filter((f) => f >= INICIO_DO_PICO_DE_SAIDA) },
  ].filter((g) => g.faixasHorarias.length > 0)
}
