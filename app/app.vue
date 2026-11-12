<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <UApp>
    <div class="conteudo">
      <NuxtPage />
    </div>
    <!-- Telas que abrem por cima (Detalhe da rua) escondem a barra de abas. -->
    <BarraDeAbas v-if="!route.meta.semBarraDeAbas" />
  </UApp>
</template>

<style scoped>
/*
 * Espaço para a barra de abas flutuante, ou para a ação principal fixa no
 * rodapé, não cobrir o fim da página.
 */
.conteudo {
  padding-bottom: calc(var(--paro-esp-16) + var(--paro-esp-3) + env(safe-area-inset-bottom));
}
</style>
