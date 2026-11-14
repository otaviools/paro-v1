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
