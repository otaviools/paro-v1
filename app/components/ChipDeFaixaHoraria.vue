<!--
  Chip de faixa horária (design system, "Formulários"): pílula de 32 px com
  texto em etiqueta. O papel (aba ou opção) e o estado ARIA vêm de quem usa;
  `ativo` só muda o visual.
-->
<script setup lang="ts">
defineProps<{ ativo: boolean }>()
</script>

<template>
  <button type="button" class="chip" :class="{ ativo }">
    <slot />
  </button>
</template>

<style scoped>
.chip {
  height: var(--paro-alvo-de-toque);
  padding: 0 var(--paro-esp-4);
  font-size: var(--paro-texto-etiqueta);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-pilula);
  cursor: pointer;
}

.chip.ativo {
  color: var(--paro-destaque-texto);
  background: var(--paro-destaque);
  border-color: var(--paro-destaque);
}
</style>
