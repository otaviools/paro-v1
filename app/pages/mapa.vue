<!--
  Mapa. No celular, o mapa em tela cheia. No desktop, Início e Mapa são uma
  tela só, o painel de três colunas: a aba Mapa não aparece e esta página
  mostra o mesmo que o Início, com o painel da direita fechado.
-->
<script setup lang="ts">
const desktop = useDesktop()
</script>

<template>
  <MapaDoCelular v-if="!desktop" />
</template>
