<script setup lang="ts">
/**
 * Amostra de uma faixa de chance (ADR 0033 e design system, "Faixas de
 * chance"): quadrado verde, amarelo ou vermelho, ou contorno tracejado na cor
 * do texto para Sem dado. Decorativa: o rótulo vai sempre ao lado, em texto.
 * Feita à mão (ADR 0028), porque o Nuxt UI não tem amostra.
 *
 * Interface:
 * - `estado`: Tranquilo, Apertado, Difícil ou Sem dado.
 * - `tamanho`: 12 (padrão, listas e card) ou 32 (legenda do mapa), em px.
 *
 * O traço do tracejado não muda com o tamanho. O raio é o
 * --radius-paro-sm (6 px) na amostra de 32 px e a metade dele na de 12 px,
 * para a amostra pequena não virar círculo.
 */
export type EstadoDaChance = FaixaDeChance | 'Sem dado'

const props = withDefaults(defineProps<{ estado: EstadoDaChance, tamanho?: 12 | 32 }>(), { tamanho: 12 })

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
    <rect
      v-if="estado !== 'Sem dado'"
      :width="tamanho"
      :height="tamanho"
      :rx="raio"
      :fill="corDaFaixaDeChance(estado)"
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
