import type { MaybeRefOrGetter } from 'vue'

/** As saídas previstas mudam ao longo da noite; o app consulta o servidor de novo (ADR 0018). */
const INTERVALO_DE_ATUALIZACAO = 90_000

/**
 * Ruas cobertas para escolher no registro de vaga (`GET /api/ruas`).
 * Devolve a busca do Nuxt, então a tela pode usar `await`.
 */
export function useRuasCobertas() {
  return useFetch<RespostaDasRuas>('/api/ruas', { key: 'ruas-cobertas' })
}

/**
 * Uma rua coberta ao longo da noite, para o Detalhe da rua
 * (`GET /api/ruas/:id`). Enquanto a tela está aberta, a leitura se repete a
 * cada 90 s, porque as saídas previstas mudam. Devolve a busca do Nuxt, então
 * a tela pode usar `await`.
 */
export function useRuaCoberta(id: MaybeRefOrGetter<string>) {
  const busca = useFetch<RuaAoLongoDaNoite>(() => `/api/ruas/${toValue(id)}`, {
    key: () => `rua-coberta-${toValue(id)}`,
  })

  let atualizacao: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    atualizacao = setInterval(() => busca.refresh(), INTERVALO_DE_ATUALIZACAO)
  })
  onBeforeUnmount(() => clearInterval(atualizacao))

  return busca
}
