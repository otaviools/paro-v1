/**
 * Visita do mês (Métricas de uso, ADR 0004, `POST /api/sessoes`): manda só o
 * identificador mensal sorteado no celular. Uma falha (sem conexão, por
 * exemplo) não atrapalha o app e é ignorada.
 */
export function useSessao() {
  function contarVisita(idMensal: string) {
    $fetch('/api/sessoes', { method: 'POST', body: { idMensal } satisfies CorpoDaSessao }).catch(() => {})
  }

  return { contarVisita }
}
