import type { RouterConfig } from '@nuxt/schema'

/**
 * Rolagem ao trocar de tela. Tela nova abre no topo (desde o cabeçalho), e
 * voltar devolve a rolagem de antes. Espera a tela nova ficar pronta
 * (page:finish, fim do carregamento dela) para rolar: antes disso a tela
 * antiga ainda está à vista. O padrão do Nuxt espera o fim da transição de
 * saída, que aqui é instantânea (.pagina-leave-active no main.css), e a tela
 * abria no meio, na rolagem da anterior. Só trocar a query (a faixa horária
 * do Detalhe da rua) não rola.
 */
export default <RouterConfig>{
  scrollBehavior(to, from, posicaoSalva) {
    if (to.path === from.path) return false

    const nuxtApp = useNuxtApp()
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce('page:finish', () => {
        setTimeout(() => resolve(posicaoSalva ?? { left: 0, top: 0 }), 0)
      })
    })
  },
}
