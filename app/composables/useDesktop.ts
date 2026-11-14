/**
 * Largura em que o Parô vira o painel de três colunas (design system,
 * "Padrões de navegação › Desktop"). É a mesma dos `@media (min-width: 1024px)`
 * do CSS.
 */
export const CONSULTA_DO_DESKTOP = '(min-width: 1024px)'

/**
 * Se a janela está na largura do desktop. Falso no servidor e até o app
 * montar, porque só o navegador sabe a largura; o `app.vue` acompanha a
 * consulta e atualiza este estado. O CSS já arruma o layout antes disso: o
 * estado só decide o que montar (barra lateral e mapa do painel).
 */
export function useDesktop() {
  return useState('desktop', () => false)
}
