<!--
  Título de uma tela que abre no painel da direita do desktop (Ajustes, Minha
  vaga). No celular, é o h1 de sempre, no topo da página. No desktop, sobe
  para o topo do painel, à esquerda do botão de fechar (#topo-do-painel no
  app.vue), e o conteúdo sobe junto. Só um dos dois fica visível por vez; o
  escondido sai também da leitura de tela (display: none).

  Interface: o texto do título vai no slot padrão. Sem props nem eventos.
-->
<template>
  <h1 class="text-2xl font-bold leading-tight tracking-tight lg:hidden">
    <slot />
  </h1>
  <ClientOnly>
    <Teleport
      to="#topo-do-painel"
      defer
    >
      <h1 class="hidden text-2xl font-bold leading-tight tracking-tight lg:block">
        <slot />
      </h1>
    </Teleport>
  </ClientOnly>
</template>
