import { dadosDoCelularDoAparelho } from '~/dados-do-celular'

/**
 * A Primeira visita abre antes de qualquer tela até ser concluída, e só uma
 * vez. Quem a concluiu e volta ao endereço dela vai para o Início. Roda só
 * no navegador, porque a marca fica nos Dados do celular. As telas da equipe
 * (`/equipe/...`) não são do motorista e ficam fora.
 */
export default defineNuxtRouteMiddleware((para) => {
  if (import.meta.server) return
  if (para.path.startsWith('/equipe/')) return
  const concluida = dadosDoCelularDoAparelho().primeiraVisitaConcluida()
  if (!concluida && para.path !== '/primeira-visita') return navigateTo('/primeira-visita', { replace: true })
  if (concluida && para.path === '/primeira-visita') return navigateTo('/', { replace: true })
})
