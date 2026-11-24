# Demo de chance na página de entrada

> **Descartado em 2026-11-24.** O usuário viu a demo funcionando e pediu para voltar a capa com a print. A implementação foi removida.

## Intenção

Trocar a print da capa do site de documentação (`docs-site/content/index.md`) por uma demonstração interativa da chance. Quem lê escolhe uma faixa horária e vê, nas cinco ruas cobertas, a chance, a faixa de chance e a base. Assim entende o Parô sem abrir outra página. Isso tira da capa o padrão genérico de título, botões e print.

## Decisões do usuário

1. **Dados:** um retrato gerado do app. Um script em `docs-site/` roda o mesmo código do app (observações fictícias com a semente fixa e o cálculo da chance) e grava um JSON com as 5 ruas cobertas e as 12 faixas horárias, das 17h às 22h30. O site lê esse JSON. Para atualizar, roda o script de novo.
2. **Posição:** no lugar da janela do macOS, logo abaixo dos botões da capa. A print do desktop sai da entrada e continua nas páginas internas.
3. **Cada rua mostra:** nome e distância a pé; barra da chance na cor da faixa; percentual e rótulo (Tranquilo, Apertado, Difícil); e a base em texto pequeno ("8 de 9 noites"). Sem dado aparece com barra tracejada e "3 observações, mínimo 4". Em cima, a melhor chance da faixa horária em destaque, com rótulo "Demonstração · dados fictícios".
4. **Ordem:** fixa, por distância ao destino. Ao trocar a faixa horária, só as barras mudam de largura e de cor, em 400 ms, com `transform: scaleX`.
5. **Início:** abre em 19h, no pico de chegada, e fica parada até a pessoa escolher outra faixa horária. A página pré-renderizada já vem com os números de 19h.

## Caminhos considerados

- **Retrato gerado do app (escolhido):** números idênticos aos da demonstração do app, e o site não depende do app no ar.
- **JSON escrito à mão:** mais simples, mas pode divergir do app.
- **Ao vivo pela API do app:** exige CORS no app e quebra se o app cair.

## Restrições

- Cores das faixas de chance e o tracejado do Sem dado iguais ao design system do app (ADR 0033): o rótulo sempre junto da cor.
- Termos do glossário: rua coberta, faixa horária, chance, faixa de chance, base, Sem dado, melhor chance.
- Acessível por teclado: as faixas horárias são um grupo de opções (setas mudam a faixa). O percentual e o rótulo estão em texto, não só na cor.
- Com movimento reduzido, as barras trocam sem transição.
- Sem rolagem lateral a 375 px. No celular, as faixas horárias rolam na horizontal dentro do próprio bloco.

## Fica para o construtor

Nome do script e do JSON, o componente da demo, como o script carrega o TypeScript do app (por exemplo, com `jiti`, que já vem com o Nuxt), e o acabamento visual dentro da paleta Papel e do vidro.

## Pronto quando

A demo aparece na capa nos dois temas e no celular. Trocar a faixa horária atualiza as cinco ruas e a melhor chance, com os mesmos números que o app mostra na demonstração. O teclado funciona. Lint, typecheck, testes e build passam. Sem commit até o usuário pedir.
