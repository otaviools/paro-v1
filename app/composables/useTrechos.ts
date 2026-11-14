/**
 * Linha de cada trecho das ruas cobertas, para o Mapa da área
 * (`GET /api/trechos`). As linhas não mudam com a faixa horária e são lidas
 * uma vez, no navegador.
 */
export function useTrechos() {
  const { data: trechos } = useFetch<RespostaDosTrechos>('/api/trechos', { key: 'trechos', server: false })
  return { trechos }
}
