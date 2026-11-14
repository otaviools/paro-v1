<!--
  Início. No celular, a tela do Início. No desktop, o Início vira o painel de
  três colunas: a barra lateral e o mapa ficam no PainelDesktop, e esta página
  não mostra nada, porque o painel da direita começa fechado.
-->
<script setup lang="ts">
const { desktop } = storeToRefs(usePainelDesktopStore())
</script>

<template>
  <InicioDoCelular v-if="!desktop" />
</template>
