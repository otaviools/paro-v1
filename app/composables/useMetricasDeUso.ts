/** Resultado de `lerMetricas`. "chave-incorreta": o servidor recusou a chave da equipe (401). */
export type ResultadoDaLeituraDeMetricas
  = | { tipo: 'lidas', resposta: RespostaDasMetricas }
    | { tipo: 'chave-incorreta' }
    | { tipo: 'falha' }

/**
 * Métricas de uso para a equipe (`GET /api/equipe/metricas`): recorrência
 * das semanas fechadas, respostas de "A previsão ajudou hoje?" e registros
 * das noites fechadas entre `de` e `ate`. A chave da equipe vai no cabeçalho
 * Authorization, nunca na URL (ADR 0021).
 */
export function useMetricasDeUso() {
  async function lerMetricas(chave: string, de: Data, ate: Data): Promise<ResultadoDaLeituraDeMetricas> {
    try {
      const resposta = await $fetch<RespostaDasMetricas>('/api/equipe/metricas', {
        query: { de, ate },
        headers: { authorization: `Bearer ${chave}` },
      })
      return { tipo: 'lidas', resposta }
    }
    catch (erro) {
      return (erro as { statusCode?: number })?.statusCode === 401 ? { tipo: 'chave-incorreta' } : { tipo: 'falha' }
    }
  }

  return { lerMetricas }
}
