import { dadosDoCelularDoAparelho } from '~/dados-do-celular'

/**
 * A Primeira visita abre antes de qualquer tela até ser concluída, e só uma
 * vez. Quem a concluiu e volta ao endereço dela vai para o Início. Roda só
 * no navegador, porque a marca fica nos Dados do celular.
 */
export default defineNuxtRouteMiddleware((para) => {
  if (import.meta.server) return
  const concluída = dadosDoCelularDoAparelho().primeiraVisitaConcluída()
  if (!concluída && para.path !== '/primeira-visita') return navigateTo('/primeira-visita', { replace: true })
  if (concluída && para.path === '/primeira-visita') return navigateTo('/', { replace: true })
})
