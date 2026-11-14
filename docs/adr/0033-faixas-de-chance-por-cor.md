# Faixas de chance por cor e rótulo, sem padrão

A ADR 0006 comunicava a faixa de chance por rótulo e padrão de preenchimento (sólido, hachura e pontilhado), todos na cor do texto. Para melhorar a acessibilidade, decidimos trocar o padrão por cor, que se lê mais rápido que um padrão pequeno: **Tranquilo** em verde (`#22C55E`), **Apertado** em amarelo (`#FACC15`) e **Difícil** em vermelho (`#EF4444`), da paleta padrão do Tailwind, iguais nos temas claro e escuro. **Sem dado** continua com contorno tracejado na cor do texto. O rótulo continua sempre junto da cor. Os cortes de 70% e 40% e o número só no detalhe da ADR 0006 não mudam.

## Considered Options

- **Cor mais padrão:** cada faixa com a cor e o padrão de antes. Quem não distingue verde e vermelho ainda separa as faixas pelo padrão, mas o desenho fica mais carregado.
- **Cores de sinal do Parô** (`--ui-success`, `--ui-warning`, `--ui-error`): mudam com o tema, mas no tema claro o amarelo puxa para ocre.

## Consequences

- Substitui a parte de padrão da ADR 0006; o resto dela continua valendo.
- Quem não distingue verde e vermelho depende do rótulo. No mapa, o rótulo fica na etiqueta de cada trecho.
- O amarelo e o verde têm contraste baixo sobre o fundo claro (`#F7F6F3`), abaixo de 3:1 para elementos gráficos. A legibilidade vem do rótulo, não da cor.
