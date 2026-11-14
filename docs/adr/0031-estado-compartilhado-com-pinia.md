# Estado compartilhado no celular com Pinia

O estado compartilhado entre telas ficava em `useState` do Nuxt, espalhado em composables (largura de desktop, barra lateral aberta, aviso flutuante), e o que precisa durar entre aberturas do app ficava no módulo Dados do celular, sobre `localStorage`. Decidimos usar Pinia (`@pinia/nuxt`) para todo estado compartilhado entre telas, em stores em `app/stores/`, uma por assunto. Os Dados do celular continuam sendo o único lugar que lê e grava no aparelho (ADRs 0003, 0004 e 0015): uma store pode carregar dele e gravar nele, mas nunca acessa o `localStorage` diretamente.

## Considered Options

- **`useState` do Nuxt dentro de composables:** já estava em uso e não exige dependência nova, mas não tem as ferramentas de inspeção nem a organização por store do Pinia.

## Consequences

- Entra a dependência `@pinia/nuxt`.
- Os `useState` que guardam estado compartilhado passam para stores.
- Os testes dos Dados do celular continuam como estão (armazenamento em memória). Stores que tiverem regra própria são testadas com o armazenamento em memória dos Dados do celular.
