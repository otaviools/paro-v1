# Vidro nas superfícies e pílula nos botões; fundo tingido no Detalhe da rua

O design system pedia uma interface plana: borda de 1 px, sem sombra, sem degradê e sem vidro, com botões de raio 12 px e nunca em pílula. Usando o Luma como referência de padrão visual, decidimos:

- **Pílula:** todo botão é pílula; o de ícone é círculo. As abas de faixa horária e a barra de abas também são pílula.
- **Vidro nas superfícies:** a barra de abas, as abas de faixa horária, os botões de ícone e os secundários, os cards e as linhas de rua coberta usam a classe `vidro` do `main.css`: fundo claro com 55% de opacidade (no escuro, película branca de 8%), desfoque de 20 px com saturação, borda fina e brilho de 1 px no topo. Avisos e gavetas continuam com fundo sólido.
- **Fundo tingido:** o Detalhe da rua tem um degradê suave no topo, na cor da faixa de chance da faixa horária selecionada (ADR 0033).

Do Luma entram só esses padrões. A paleta, a fonte, o nome e a marca continuam os do Parô.

## Considered Options

- **Manter tudo plano:** mais simples, mas os controles que flutuam sobre o mapa e a lista se misturavam com o conteúdo.
- **Copiar a identidade do Luma (cores, ícones, marca):** descartado. O design system proíbe marca, cor e texto dos apps de referência, e o Parô passaria a parecer outro app.

## Consequences

- Substitui, nesses pontos, o princípio "plano e silencioso" e a regra "botões nunca são pílula" do design system. Os três raios da ADR 0027 continuam valendo para cards, campos, linhas e avisos; o princípio "sem sombra" deixa de valer para as superfícies de vidro.
- O vidro depende de `backdrop-filter`. Sem suporte, a superfície fica só translúcida, ainda legível.
- O fundo tingido usa as cores da ADR 0033; Sem dado não tem tinta.
