<!--
  Chip de faixa horária (design system, "Formulários"; referência Waymo):
  UButton em pílula de 44 px (alvo de toque mínimo), com texto em etiqueta.
  Inativo em bg-elevated com borda; ativo em bg-primary-100 com text-primary.

  Interface:
  - prop `ativo`: só muda o visual.
  - slot padrão: o rótulo ("Agora", "19h"...).
  - atributos de quem usa vão para o <button>: o papel (`role="tab"` ou
    `role="radio"`), o estado ARIA (`aria-selected`, `aria-checked`,
    `aria-controls`) e o `@click`.
-->
<script setup lang="ts">
defineProps<{ ativo: boolean }>()
</script>

<template>
  <UButton
    :color="ativo ? 'primary' : 'neutral'"
    :variant="ativo ? 'soft' : 'outline'"
    class="h-11 shrink-0 rounded-full px-4 text-xs font-semibold uppercase tracking-wider tabular-nums active:scale-100"
    :class="ativo ? 'bg-primary-100 hover:bg-primary-100 active:bg-primary-100' : 'text-default'"
  >
    <slot />
  </UButton>
</template>
