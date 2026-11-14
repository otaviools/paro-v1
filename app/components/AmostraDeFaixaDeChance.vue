<script setup lang="ts">
/**
 * Amostra do padrão de uma faixa de chance (ADR 0006 e design system,
 * "Faixas de chance"): sólido, hachura, pontilhado ou contorno tracejado,
 * sempre na cor do texto (text-default). Decorativa: o rótulo vai sempre ao
 * lado, em texto. Feita à mão (ADR 0028), porque o Nuxt UI não tem padrão.
 *
 * Interface:
 * - `estado`: Tranquilo, Apertado, Difícil ou Sem dado.
 * - `tamanho`: 12 (padrão, listas e card) ou 32 (legenda do mapa), em px.
 *
 * O traço e o espaçamento dos padrões não mudam com o tamanho. O raio é o
 * --radius-paro-sm (6 px) na amostra de 32 px e a metade dele na de 12 px,
 * para a amostra pequena não virar círculo.
 */
export type EstadoDaChance = FaixaDeChance | 'Sem dado'

const props = withDefaults(defineProps<{ estado: EstadoDaChance, tamanho?: 12 | 32 }>(), { tamanho: 12 })

const id = useId()

const raio = computed(() => (props.tamanho === 32 ? 6 : 3))
</script>

<template>
  <svg
    class="shrink-0 text-default"
    :class="tamanho === 32 ? 'size-8' : 'size-3'"
    :viewBox="`0 0 ${tamanho} ${tamanho}`"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <pattern
        :id="`${id}-hachura`"
        width="3.5"
        height="3.5"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="3.5"
          stroke="currentColor"
          stroke-width="1.2"
        />
      </pattern>
      <pattern
        :id="`${id}-pontilhado`"
        width="4"
        height="4"
        patternUnits="userSpaceOnUse"
      >
        <circle
          cx="2"
          cy="2"
          r="0.8"
          fill="currentColor"
        />
      </pattern>
    </defs>

    <rect
      v-if="estado === 'Tranquilo'"
      :width="tamanho"
      :height="tamanho"
      :rx="raio"
      fill="currentColor"
    />
    <rect
      v-else-if="estado === 'Apertado'"
      :width="tamanho"
      :height="tamanho"
      :rx="raio"
      :fill="`url(#${id}-hachura)`"
    />
    <rect
      v-else-if="estado === 'Difícil'"
      :width="tamanho"
      :height="tamanho"
      :rx="raio"
      :fill="`url(#${id}-pontilhado)`"
    />
    <rect
      v-else
      x="0.75"
      y="0.75"
      :width="tamanho - 1.5"
      :height="tamanho - 1.5"
      :rx="raio"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-dasharray="4 3"
    />
  </svg>
</template>
