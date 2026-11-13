import { dadosDoCelularDoAparelho } from '~/dados-do-celular'

/**
 * Uma visita por abertura do app (Métricas de uso, ADR 0004): manda só o
 * identificador mensal sorteado no celular. O mês vem do relógio do
 * aparelho; o servidor guarda uma visita por identificador e data. Uma falha
 * (sem conexão, por exemplo) não atrapalha o app.
 */
export default defineNuxtPlugin(() => {
  const agora = new Date()
  const mês = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`
  const idMensal = dadosDoCelularDoAparelho().idDeSessãoDoMês(mês)
  $fetch('/api/sessoes', { method: 'POST', body: { idMensal } }).catch(() => {})
})
