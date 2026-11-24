# Telas em movimento na página de entrada

> **Descartado em 2026-11-24.** O vídeo do Início foi aprovado, mas depois o usuário pediu para retirar a parte dos vídeos. A seção, os componentes, as composições do HyperFrames e os vídeos foram removidos.

## Intenção

Mostrar as telas do Parô em vídeos curtos de motion graphics, em cartões, numa seção nova da página de entrada do site de documentação (`docs-site/content/index.md`). A capa continua como estava, com a print do desktop na janela do macOS. A ideia é a página parecer viva e própria do Parô, sem trocar o conteúdo da documentação por uma demo.

## Decisões do usuário

1. **Técnica:** vídeos renderizados por código a partir das prints reais de `docs/imagens/`.
2. **Telas (6):** Desktop com mapa (`desktop-inicio`), Início, Mapa, Detalhe da rua, Vaga e Ajustes (`celular-*`). A Área da equipe fica de fora.
3. **Arranjo:** seção nova "As telas do Parô" logo abaixo da capa. O cartão do desktop fica largo em cima e os cinco do celular embaixo (5 colunas no desktop, rolagem lateral no celular). Cada cartão tem o vídeo, o nome da tela e uma frase, e leva à seção da tela em Telas (`/produto/telas#...`). Os cartões "O que tem aqui" continuam.
4. **Estilo:** câmera e destaques. A tela entra, a câmera aproxima e desliza até o ponto importante, um contorno azul do Parô destaca o elemento, um toque pulsa no botão e uma etiqueta curta aparece (por exemplo, "86% · Tranquilo"). Ritmo calmo, como o app. Sem som, em loop de cerca de 6 s.
5. **Temas:** uma versão clara e uma escura por tela, 12 vídeos no total. O site troca junto com o tema, como já faz com as prints.

## Roteiro de cada vídeo (proposta do construtor, ajustável)

| Tela | Ponto destacado | Etiqueta |
| --- | --- | --- |
| Desktop com mapa | Barra lateral com a melhor chance, depois o mapa com as ruas pintadas e a legenda | "Barra lateral + mapa" |
| Início | Card da melhor chance | a rua e "Tranquilo" |
| Mapa | Uma rua pintada e a legenda | "Faixa de chance por cor" |
| Detalhe da rua | Chance ao longo da noite e a melhor faixa horária | "Melhor faixa horária" |
| Vaga | Registro de vaga e saída prevista | "Saída prevista" |
| Ajustes | Grade horária e forma de colaborar | "Grade horária" |

As etiquetas usam só o que está na print e os termos do glossário.

## Como montar (decisão do construtor)

- **Ferramenta:** HyperFrames (composições em HTML e CSS renderizadas em vídeo), do mesmo jeito que o site é feito e sem licença comercial a observar. O código das composições fica em `docs-site/motion/`, e os vídeos prontos em `docs-site/public/videos/`.
- **Formato:** WebM (VP9) com MP4 (H.264) de reserva, e um quadro parado (poster) de cada vídeo. Tamanho do celular na proporção das prints (cerca de 390 × 844); do desktop, 16:10.
- **No site:** `<video muted loop playsinline preload="none">` com o poster. Começa a tocar quando o cartão entra na tela e pausa quando sai. Com movimento reduzido, mostra só o poster. A versão do tema em uso é a única baixada.

## Restrições

- Peso de cada vídeo em torno de 300 a 600 KB.
- Sem rolagem lateral da página a 375 px; a rolagem lateral fica dentro da fileira de cartões.
- Os vídeos não podem mostrar nada que não esteja nas prints (nenhum dado inventado).
- Se uma print mudar, renderiza de novo (um comando).

## Pronto quando

A seção aparece na página de entrada com os 6 cartões, os vídeos tocam ao aparecer e pausam ao sair, trocam com o tema e respeitam o movimento reduzido. Conferido no navegador nos dois temas e no celular. Lint, typecheck, testes e build passam. Sem commit até o usuário pedir.
