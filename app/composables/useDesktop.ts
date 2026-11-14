/**
 * Largura em que o Parô vira o painel de três colunas (design system,
 * "Padrões de navegação › Desktop"). É a mesma dos `@media (min-width: 1024px)`
 * do CSS.
 */
export const CONSULTA_DO_DESKTOP = '(min-width: 1024px)'

/** Onde a página da rota abre no painel desktop. */
export type LugarNoPainelDesktop = 'direita' | 'centro'

declare module '#app' {
  interface PageMeta {
    /** No desktop, a página abre no painel da direita ou no centro; sem isso, o painel fica fechado. */
    painelDesktop?: LugarNoPainelDesktop
    /** A página fica fora do painel desktop e continua como no celular (Primeira visita, equipe). */
    foraDoPainelDesktop?: boolean
  }
}

/**
 * Se a janela está na largura do desktop. Falso no servidor e até o app
 * montar, porque só o navegador sabe a largura; o `app.vue` acompanha a
 * consulta e atualiza este estado. O CSS já arruma o layout antes disso: o
 * estado só decide o que montar (barra lateral e mapa do painel).
 */
export function useDesktop() {
  return useState('desktop', () => false)
}

/**
 * Se a barra lateral do desktop está aberta. O botão no canto do mapa abre e
 * fecha; o mapa e o centro ocupam o espaço dela quando fechada.
 */
export function useLateralAberta() {
  return useState('lateral-aberta', () => true)
}
