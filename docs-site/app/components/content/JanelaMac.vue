<script setup lang="ts">
// Janela do macOS: barra com os três botões e o título no meio, raio e sombra.
defineProps<{
  titulo?: string
}>()
</script>

<template>
  <div class="overflow-hidden rounded-paro-lg bg-elevated shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_24px_48px_-20px_rgb(33_44_74/0.45)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_24px_48px_-20px_rgb(0_0_0/0.8)]">
    <div class="relative flex h-8 items-center border-b border-default bg-muted px-3">
      <BotoesDaJanela />
      <span
        v-if="titulo"
        class="absolute inset-x-16 truncate text-center text-xs text-muted"
      >
        {{ titulo }}
      </span>
    </div>
    <slot />
  </div>
</template>
