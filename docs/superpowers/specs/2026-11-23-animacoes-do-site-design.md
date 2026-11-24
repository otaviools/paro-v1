# Animações do site de documentação

## Intenção

Dar movimento ao site de documentação (`docs-site/`) com o mesmo vocabulário do app: cascata de baixo para cima e esmaecimento curto. O site deve parecer parte do Parô, sem chamar mais atenção que o conteúdo.

## Decisões do usuário

1. **Entrada da capa:** título, texto, botões e a janela do macOS entram em cascata. Cada bloco sobe 12 px e aparece em 360 ms, 40 ms depois do anterior, com a curva `cubic-bezier(0.16, 1, 0.3, 1)`. São os valores da `surgir-bloco` do app.
2. **Troca de página:** a página nova aparece em 200 ms, só com opacidade e sem deslocamento, como a `pagina` do app.
3. **Janelas e prints ao rolar:** sobem 16 px e aparecem em cerca de 500 ms, só na primeira vez que entram na tela. As prints do celular entram uma depois da outra, com 80 ms de intervalo.
4. **Cartões da entrada:** um brilho suave no azul do primary segue o cursor dentro do cartão, o contorno do vidro clareia e o cartão sobe 2 px. Sem cursor, como no celular, nada acontece.
5. **Logotipo:** sem animação. O usuário pediu para tirar depois de ver funcionando.

Referências do Mobbin: Shopify Editions e Framer Motion (capa), Framer e FLORA (cartões), Mintlify e Vercel (busca, que já existe).

## Caminhos considerados

- **CSS e `useIntersectionObserver` do `@vueuse/core`, que já é dependência (escolhido):** keyframes em CSS, como o app faz, e o observador só para disparar a entrada ao rolar. Não acrescenta biblioteca.
- **`@vueuse/motion` ou `motion-v`:** dão animação declarativa nos componentes, mas acrescentam uma dependência para efeitos que o CSS já resolve, e se afastam do jeito como o app anima.

## Restrições

- Com `prefers-reduced-motion: reduce`, nada se move: os elementos aparecem direto, no lugar final, como no app.
- Sem rolagem lateral a 375 px e sem pulo de layout: as animações usam só `opacity`, `translate` e `scale`.
- Conteúdo visível sem JavaScript: um elemento que espera a rolagem fica visível se o observador não rodar (por exemplo, na pré-renderização).

## Fica para o construtor

Nomes das classes e dos componentes, o raio e a intensidade exata do brilho dos cartões, dentro da paleta Papel.

## Pronto quando

As quatro animações funcionam no navegador nos dois temas; com movimento reduzido, nada se move; lint, typecheck, testes e build passam. Sem commit até o usuário pedir.
