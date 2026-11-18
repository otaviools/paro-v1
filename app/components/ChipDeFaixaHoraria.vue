<!--
  Chip de faixa horária (design system, "Formulários"; referências Careem e
  Airbnb, grade de horários): pílula de 56 px de altura que ocupa a coluna da
  grade, só com o início da faixa ("21h"); o fim ("até 21h30") fica só para
  leitores de tela. Inativo em vidro; ativo em vidro-escolhido, como as abas de
  faixa horária.

  Interface:
  - prop `ativo`: só muda o visual.
  - prop `faixaHoraria`: início da faixa horária, "HH:MM". Sem ela, o chip
    mostra só o slot padrão, numa linha (ex.: "Sem rotina").
  - atributos de quem usa vão para o <button>: o papel (`role="radio"`), o
    estado ARIA (`aria-checked`) e o `@click`.
-->
<script setup lang="ts">
const props = defineProps<{ ativo: boolean, faixaHoraria?: string }>()

/** "21h30" de "21h–21h30". */
const fim = computed(() => props.faixaHoraria && intervaloDaFaixaHoraria(props.faixaHoraria).split('–')[1])
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    class="grid h-14 w-full place-content-center gap-0 rounded-paro-md px-2 text-center tabular-nums transition-[background-color,box-shadow,color] duration-200 active:scale-[0.98] motion-reduce:transition-none"
    :class="ativo
      ? 'vidro-escolhido'
      : 'vidro text-default hover:brightness-105'"
  >
    <template v-if="faixaHoraria">
      <span class="text-base font-semibold leading-tight">{{ rotuloDaFaixaHoraria(faixaHoraria) }}</span>
      <span class="sr-only">até {{ fim }}</span>
    </template>
    <span
      v-else
      class="text-base font-semibold leading-tight"
    ><slot /></span>
  </UButton>
</template>
