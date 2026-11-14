import { dadosDoCelularDoAparelho } from '~/dados-do-celular'

/**
 * Uma visita por abertura do app (Métricas de uso, ADR 0004): manda só o
 * identificador mensal sorteado no celular. O mês vem do relógio do
 * aparelho; o servidor guarda uma visita por identificador e data. Uma falha
 * (sem conexão, por exemplo) não atrapalha o app. As telas da equipe
 * (`/equipe/...`) não contam como visita de motorista.
 */
export default defineNuxtPlugin(() => {
  if (window.location.pathname.startsWith('/equipe/')) return
  const agora = new Date()
  const mes = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`
  const idMensal = dadosDoCelularDoAparelho().idDeSessaoDoMes(mes)
  $fetch('/api/sessoes', { method: 'POST', body: { idMensal } satisfies CorpoDaSessao }).catch(() => {})
})
