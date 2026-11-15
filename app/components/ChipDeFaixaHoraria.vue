<!--
  Chip de faixa horária (design system, "Formulários"; referências Careem e
  Airbnb, grade de horários): pílula de 56 px de altura que ocupa a coluna da
  grade, com o início da faixa em destaque ("21h") e o fim embaixo, menor
  ("até 21h30"). Inativo em vidro; ativo na pílula de vidro azul das abas de
  faixa horária (#A9D3F2 translúcido, texto escuro no claro e branco no
  escuro).

  Interface:
  - prop `ativo`: só muda o visual.
  - prop `faixaHoraria`: início da faixa horária, "HH:MM".
  - atributos de quem usa vão para o <button>: o papel (`role="radio"`), o
    estado ARIA (`aria-checked`) e o `@click`.
-->
<script setup lang="ts">
const props = defineProps<{ ativo: boolean, faixaHoraria: string }>()

/** "21h30" de "21h–21h30". */
const fim = computed(() => intervaloDaFaixaHoraria(props.faixaHoraria).split('–')[1])
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    class="grid h-14 w-full place-content-center gap-0 rounded-full px-2 text-center tabular-nums transition-[background-color,box-shadow,color] duration-200 active:scale-[0.98] motion-reduce:transition-none"
    :class="ativo
      ? 'bg-[#A9D3F2]/60 text-[#191919] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.55),inset_0_1px_0_rgb(255_255_255/0.85),0_4px_12px_rgb(31_108_159/0.18)] hover:bg-[#A9D3F2]/60 dark:bg-[#A9D3F2]/40 dark:text-white dark:shadow-[inset_0_0_0_1px_rgb(169_211_242/0.4),inset_0_1px_0_rgb(255_255_255/0.3),0_4px_12px_rgb(0_0_0/0.3)] dark:hover:bg-[#A9D3F2]/40'
      : 'vidro text-default hover:brightness-105'"
  >
    <span class="text-base font-semibold leading-tight">{{ rotuloDaFaixaHoraria(faixaHoraria) }}</span>
    <span
      class="text-[11px] font-medium leading-tight"
      :class="ativo ? 'opacity-80' : 'text-muted'"
    >até {{ fim }}</span>
  </UButton>
</template>
