/**
 * Troca entre tema claro e escuro com o novo tema se espalhando em círculo a
 * partir do controle tocado (View Transitions API). Sem suporte no navegador,
 * com movimento reduzido pedido no sistema ou com a página escondida, a troca
 * é instantânea. Usado pelo BotaoDeTema e pela linha "Tema escuro" de Ajustes.
 */
export function useTrocaDeTema() {
  const colorMode = useColorMode()
  const escuro = computed(() => colorMode.value === 'dark')

  /** Liga ou desliga o tema escuro; `origem` é o controle tocado, centro do círculo. */
  async function definirEscuro(ligar: boolean, origem?: Element | null) {
    const proximo = ligar ? 'dark' : 'light'
    if (colorMode.value === proximo) return

    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || semMovimento || document.visibilityState !== 'visible') {
      colorMode.preference = proximo
      return
    }

    // Centro do círculo: o controle (ou o meio da tela); raio: até o canto mais distante.
    const caixa = origem?.getBoundingClientRect()
    const x = caixa ? caixa.left + caixa.width / 2 : innerWidth / 2
    const y = caixa ? caixa.top + caixa.height / 2 : innerHeight / 2
    const raio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

    const transicao = document.startViewTransition(async () => {
      colorMode.preference = proximo
      await nextTick()
    })
    // Se o navegador pular a transição, o tema já trocou sem animação.
    try {
      await transicao.ready
    }
    catch {
      return
    }

    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${raio}px at ${x}px ${y}px)`] },
      { duration: 500, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
    )
  }

  return { escuro, definirEscuro }
}
