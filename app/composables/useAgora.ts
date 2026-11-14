/**
 * Noite e faixa horária de agora (`GET /api/agora`). Lidas só no navegador,
 * na hora de abrir a tela, porque o relógio que vale é o do servidor no
 * momento em que o celular pergunta. Todas as telas usam a mesma chave.
 */
export function useAgora() {
  const { data: agora, error } = useFetch<RespostaDeAgora>('/api/agora', { key: 'agora', server: false })

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
