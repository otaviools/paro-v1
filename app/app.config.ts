/*
 * Ajustes do Nuxt UI para o design system do Parô (ADRs 0027 e 0028). As
 * cores ficam nas variáveis --ui-* do main.css; aqui ficam os raios e os
 * detalhes que valem para todo componente do Nuxt UI, para as telas usarem
 * <UButton>, <UCard>, <UAlert>, <UDrawer>, <USwitch> e <UToast> sem repetir
 * classes. Cada ajuste soma às classes do tema padrão (tailwind-merge).
 *
 * Como cada peça do design system vira componente do Nuxt UI:
 *
 * - Botão principal: <UButton color="neutral" size="xl" block> (52 px com h-13).
 * - Botão secundário: <UButton color="neutral" variant="outline">.
 * - Botão de ícone: <UButton color="neutral" variant="outline" square icon="...">.
 * - Botão link: <UButton color="primary" variant="link">.
 * - Botão destrutivo: <UButton color="error" variant="link">.
 * - Card: <UCard> (variante outline, a padrão).
 * - Aviso: <UAlert color="warning|success|error|primary" variant="soft">.
 * - Gaveta: <UDrawer>, ou os componentes Gaveta e GavetaDeEscolha.
 */
export default defineAppConfig({
  ui: {
    // O tailwind-merge passa a conhecer os raios próprios: `rounded-paro-lg`
    // substitui o `rounded-lg` do tema padrão em vez de somar com ele.
    tv: {
      twMergeConfig: {
        extend: {
          theme: {
            radius: ['paro-sm', 'paro-md', 'paro-lg'],
          },
        },
      },
    },

    // Botões (design system, "Botões"): raio de 12 px, sem pílula.
    button: {
      slots: {
        base: 'rounded-paro-md font-semibold',
      },
      compoundVariants: [
        {
          // Principal: pressionado ou com cursor em bg-neutral-800, encolhe 2%.
          color: 'neutral',
          variant: 'solid',
          class: 'hover:bg-neutral-800 active:bg-neutral-800 active:scale-[0.98]',
        },
        {
          // Secundário e de ícone: superfície e borda da paleta.
          color: 'neutral',
          variant: 'outline',
          class: 'bg-elevated ring-default hover:bg-muted active:bg-muted active:scale-[0.98]',
        },
      ],
    },

    // Cards (design system, "Cards"): bg-elevated, borda de 1 px, raio de 24 px, sem sombra.
    card: {
      slots: {
        root: 'rounded-paro-lg',
      },
      variants: {
        variant: {
          outline: {
            root: 'bg-elevated ring-default',
          },
        },
      },
    },

    // Avisos (design system, "Cards › Aviso"): fundo pastel do sinal (tom 100) e texto do mesmo par.
    alert: {
      slots: {
        root: 'rounded-paro-md px-4 py-3 gap-3',
        title: 'font-semibold',
        description: 'opacity-100',
        icon: 'size-4 mt-0.5',
      },
      compoundVariants: [
        { color: 'primary', variant: 'soft', class: { root: 'bg-primary-100 text-primary' } },
        { color: 'success', variant: 'soft', class: { root: 'bg-success-100 text-success' } },
        { color: 'warning', variant: 'soft', class: { root: 'bg-warning-100 text-warning' } },
        { color: 'error', variant: 'soft', class: { root: 'bg-error-100 text-error' } },
      ],
    },

    // Gavetas (design system, "Gavetas"): bg-elevated, raio de 24 px no topo, alça de 32 × 4 px.
    // Ficam acima da barra de abas (z-10), como o <dialog> de antes.
    drawer: {
      slots: {
        overlay: 'z-40',
        content: 'z-50 bg-elevated ring-default',
        container: 'gap-4 px-5 pt-3 pb-[calc(--spacing(8)+env(safe-area-inset-bottom))]',
        title: 'text-base font-semibold text-default',
        handle: '!bg-accented',
      },
      compoundVariants: [
        {
          direction: 'bottom',
          inset: false,
          class: { content: 'mx-auto w-full max-w-160 max-h-[85dvh] rounded-t-paro-lg' },
        },
        {
          direction: ['top', 'bottom'],
          class: { handle: '!w-8 !h-1 mt-3' },
        },
      ],
    },

    // Seletor liga/desliga (design system, "Linha com seletor"): ligado em bg-inverted, sem sombra.
    switch: {
      slots: {
        thumb: 'shadow-none bg-default data-[state=unchecked]:bg-inverted/50',
      },
    },
  },
})
