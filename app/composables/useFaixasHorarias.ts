/**
 * Faixas horárias da área coberta (`GET /api/faixas-horarias`). Não mudam
 * durante a noite. Devolve a busca do Nuxt, então a tela pode usar `await`.
 */
export function useFaixasHorarias() {
  return useFetch<RespostaDasFaixasHorarias>('/api/faixas-horarias', { key: 'faixas-horarias' })
}
