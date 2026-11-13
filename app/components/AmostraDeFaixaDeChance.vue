<script setup lang="ts">
/**
 * Amostra do padrão de uma faixa de chance (ADR 0006 e design system,
 * "Faixas de chance"): sólido, hachura, pontilhado ou contorno tracejado,
 * sempre em --paro-texto. Decorativa: o rótulo vai sempre ao lado, em texto.
 * Tem 12 px nas listas e no card e 32 px na legenda do mapa; o traço e o
 * espaçamento dos padrões não mudam com o tamanho.
 */
export type EstadoDaChance = 'Tranquilo' | 'Apertado' | 'Difícil' | 'Sem dado'

withDefaults(defineProps<{ estado: EstadoDaChance, tamanho?: 12 | 32 }>(), { tamanho: 12 })

const id = useId()
</script>

<template>
  <svg class="amostra" :class="{ grande: tamanho === 32 }" :viewBox="`0 0 ${tamanho} ${tamanho}`" aria-hidden="true" focusable="false">
    <defs>
      <pattern
        :id="`${id}-hachura`"
        width="3.5"
        height="3.5"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line x1="0" y1="0" x2="0" y2="3.5" stroke="currentColor" stroke-width="1.2" />
      </pattern>
      <pattern :id="`${id}-pontilhado`" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.8" fill="currentColor" />
      </pattern>
    </defs>

    <rect v-if="estado === 'Tranquilo'" :width="tamanho" :height="tamanho" rx="3" fill="currentColor" />
    <rect v-else-if="estado === 'Apertado'" :width="tamanho" :height="tamanho" rx="3" :fill="`url(#${id}-hachura)`" />
    <rect v-else-if="estado === 'Difícil'" :width="tamanho" :height="tamanho" rx="3" :fill="`url(#${id}-pontilhado)`" />
    <rect
      v-else
      x="0.75"
      y="0.75"
      :width="tamanho - 1.5"
      :height="tamanho - 1.5"
      rx="3"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-dasharray="4 3"
    />
  </svg>
</template>

<style scoped>
/* Amostra de 12 px nas listas e no card; 32 px na legenda do mapa (design system). */
.amostra {
  flex: none;
  width: var(--paro-esp-3);
  height: var(--paro-esp-3);
  color: var(--paro-texto);
}

.amostra.grande {
  width: var(--paro-esp-8);
  height: var(--paro-esp-8);
}
</style>
