/**
 * Pergunta "O Parô ajudou hoje?" (Métricas de uso, `POST /api/ajudou`).
 * Manda só a resposta, sem identificação.
 */
export function useAjudou() {
  /** True quando o servidor recebeu a resposta. */
  async function responderAjudou(ajudou: boolean): Promise<boolean> {
    try {
      await $fetch('/api/ajudou', { method: 'POST', body: { ajudou } satisfies CorpoDoAjudou })
      return true
    }
    catch {
      return false
    }
  }

  return { responderAjudou }
}
