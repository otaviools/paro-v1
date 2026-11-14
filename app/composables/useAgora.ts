/**
 * Noite e faixa horária de agora (`GET /api/agora`). Lidas só no navegador,
 * na hora de abrir a tela, porque o relógio que vale é o do servidor no
 * momento em que o celular pergunta. Todas as telas usam a mesma chave.
 */
export function useAgora() {
  const { data: agora, error, status, refresh } = useFetch<RespostaDeAgora>('/api/agora', { key: 'agora', server: false })

  // Com a chave compartilhada, a tela que abre encontra a leitura da tela
  // anterior, e o Nuxt não busca de novo. Cada tela lê a hora de agora ao
  // abrir, então uma leitura já concluída é refeita.
  if (status.value === 'success') refresh()

  /**
   * Noite de agora, mesmo se a leitura da tela ainda não terminou. Sem
   * conexão, devolve null.
   */
  async function lerNoite(): Promise<Data | null> {
    if (agora.value) return agora.value.noite
    const lida = await $fetch<RespostaDeAgora>('/api/agora').catch(() => null)
    return lida?.noite ?? null
  }

  return { agora, erro: error, lerNoite }
}
