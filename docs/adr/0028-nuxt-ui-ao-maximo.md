# Nuxt UI ao máximo, inclusive nos componentes do domínio

O app tinha muitos componentes feitos à mão (botões, gavetas com `<dialog>`, seletor liga/desliga, aviso flutuante, chips, cards) ao lado de componentes do Nuxt UI como `USidebar` e `UNavigationMenu`. Decidimos usar o Nuxt UI ao máximo, inclusive nos componentes do domínio. Toda peça de interface começa por um componente do Nuxt UI (`UButton`, `UDrawer`, `USlideover`, `UModal`, `USwitch`, `UToast`, `UAlert`, `UCard`, `UInput`, `UTabs`, `URadioGroup`, `UBadge`, `UNavigationMenu`, `USidebar`...), ajustado pela prop `ui`, pelas variantes e pelas cores das variáveis `--ui-*` (ADR 0027). Os componentes do domínio, como o card de melhor chance, a linha de rua coberta, as abas de faixa horária e a gaveta de saída prevista, são composições desses componentes. Só é feito à mão o que o Nuxt UI não tem: a amostra do padrão de faixa de chance, o gráfico de chance por faixa horária e o Mapa da área (MapLibre, ADR 0017).

## Considered Options

- **Componentes próprios, Nuxt UI só no layout:** mantém o controle total do visual, mas repete acessibilidade, foco, teclado e animação que o Nuxt UI já resolve.
- **Nuxt UI só para o que não é do domínio:** deixa a fronteira subjetiva e mantém dois estilos de botão, gaveta e card.

## Consequences

- Os componentes feitos à mão que têm equivalente no Nuxt UI precisam ser trocados: botões, gavetas, seletor liga/desliga, aviso flutuante (por `UToast`), avisos (por `UAlert`), chips e cards.
- Alguns detalhes do design system podem mudar para seguir o comportamento do componente do Nuxt UI (por exemplo, a animação e os pontos de parada das gavetas). Quando a diferença importar, ajusta-se pela prop `ui` antes de voltar a fazer à mão.
