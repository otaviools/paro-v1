/**
 * Cor de cada faixa de chance (ADR 0033): verde, amarelo e vermelho da paleta
 * padrão do Tailwind (green-500, yellow-400, red-500), iguais nos dois temas.
 * Sem dado não tem cor: continua com contorno tracejado na cor do texto.
 * Fica em hex porque o mapa (MapLibre) desenha em canvas e não lê classes.
 */
export function corDaFaixaDeChance(faixaDeChance: FaixaDeChance) {
  switch (faixaDeChance) {
    case 'Tranquilo': return '#22C55E'
    case 'Apertado': return '#FACC15'
    case 'Difícil': return '#EF4444'
  }
}
