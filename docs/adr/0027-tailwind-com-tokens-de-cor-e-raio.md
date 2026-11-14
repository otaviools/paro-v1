# Estilo com Tailwind; cores nas variáveis do Nuxt UI e só três raios próprios

Os componentes eram estilizados com `<style scoped>` e muitos tokens `--paro-*` (cores, tipografia, espaçamento, raios, larguras), enquanto os componentes do Nuxt UI recebiam classes Tailwind pela prop `ui`. Havia dois jeitos de estilizar. Decidimos estilizar tudo com classes utilitárias do Tailwind no template. As cores da paleta Papel, claras e escuras, entram nas variáveis de cor do Nuxt UI (`--ui-bg`, `--ui-bg-elevated`, `--ui-bg-muted`, `--ui-border`, `--ui-text`, `--ui-text-muted`, `--ui-primary`, `--ui-success`, `--ui-warning`, `--ui-error` e as demais), e os componentes usam as classes semânticas do Nuxt UI (`bg-default`, `bg-elevated`, `text-muted`, `border-default`, `text-primary`, `bg-inverted`...), sem nomes `paro` para cor. Os únicos tokens próprios são três raios, declarados no `@theme`:

```css
--radius-paro-sm: 6px;   /* amostras de faixa de chance */
--radius-paro-md: 12px;  /* botões, campos, linhas da lista, avisos, itens de menu */
--radius-paro-lg: 24px;  /* cards, gavetas, barra de abas, painéis */
```

A pílula (`rounded-full`) continua só em chips e etiquetas. Espaçamento e tipografia usam a escala padrão do Tailwind, sem tokens próprios. Os tamanhos de texto do design system foram levados ao tamanho mais próximo da escala: 26 px para `text-2xl` (24), 22 para `text-xl` (20), 17 para `text-lg` (18), 16 para `text-base`, 15 para `text-sm` (14), 13 e 11 para `text-xs` (12).

## Considered Options

- **Tokens de cor próprios (`--color-paro-*`):** classes como `bg-paro-fundo`. Rejeitada para não manter um segundo vocabulário de cores ao lado do que o Nuxt UI já usa em todos os seus componentes.
- **CSS scoped com tokens para tudo:** era o estado do código. Mantém os valores exatos do design system, mas cria um segundo sistema ao lado do Tailwind que o Nuxt UI já usa.
- **Valores arbitrários exatos (`text-[15px]`):** fiel ao design, mas espalha números soltos pelo template.
- **Raios 10, 12, 16 e 20 px (modelo "Arredondado"):** a escolha anterior do design system, trocada por três raios para simplificar.

## Consequences

- Os componentes com `<style scoped>` precisam ser reescritos com classes Tailwind, e os tokens `--paro-*` saem do `main.css`: as cores passam para as variáveis `--ui-*` e os raios para `--radius-paro-*`.
- O design system (`docs/design/design-system.md`) precisa ser atualizado: a tabela de cores passa a dizer qual variável do Nuxt UI recebe cada cor, mais os raios, os tamanhos de texto e a regra "componentes usam sempre tokens".
- Os tamanhos de texto ficam um pouco diferentes dos escolhidos antes (por exemplo, o título passa de 26 para 24 px e o corpo de 15 para 14 px).
