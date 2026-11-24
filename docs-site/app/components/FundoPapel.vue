<script setup lang="ts">
// Fundo azul-papel das prints (referência: Framer no Mobbin): o tom 100 do
// primary com as isolinhas do Parô por cima, bem fracas.
</script>

<template>
  <div class="fundo-papel relative isolate overflow-hidden rounded-paro-lg bg-primary-100 px-4 pt-6 pb-4 sm:px-10 sm:pt-10 sm:pb-8">
    <div
      aria-hidden="true"
      class="isolinhas pointer-events-none absolute inset-0 -z-10"
    />
    <slot />
  </div>
</template>

<style>
/* Sem scoped: com scoped, `:global(.dark) .isolinhas` vira só `.dark` e cai no <html>. */
.fundo-papel .isolinhas {
  background-image: url('/grafismos/detalhe-2-isolinhas-fundo-claro.svg');
  background-size: 640px auto;
  background-position: center;
  opacity: 0.18;
}

.dark .fundo-papel .isolinhas {
  background-image: url('/grafismos/detalhe-2-isolinhas-fundo-escuro.svg');
  opacity: 0.22;
}
</style>
