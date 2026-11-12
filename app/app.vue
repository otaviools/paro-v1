<template>
  <UApp>
    <div class="conteudo">
      <NuxtPage />
    </div>
    <BarraDeAbas />
  </UApp>
</template>

<style scoped>
/* Espaço para a barra de abas flutuante não cobrir o fim da página. */
.conteudo {
  padding-bottom: calc(var(--paro-esp-16) + var(--paro-esp-3) + env(safe-area-inset-bottom));
}
</style>
