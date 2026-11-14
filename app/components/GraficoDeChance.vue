<!--
  Gráfico de chance por faixa horária (design system; referência Swarm):
  uma barra por faixa horária das 17h às 23h, na cor da faixa de chance
  (verde, amarelo ou vermelho, ADR 0033). A altura é a chance; Sem dado é uma barra baixa com
  contorno tracejado. A faixa horária selecionada ganha fundo bg-primary-100.
  Feito à mão (ADR 0028), com classes do Tailwind e cores do Nuxt UI.
  Tocar numa barra seleciona a faixa horária (v-model).
-->
<script setup lang="ts">
import type { EstadoDaChance } from '~/components/AmostraDeFaixaDeChance.vue'

const props = defineProps<{
  faixasHorarias: FaixaHorariaDaRua[]
  /** Faixa horária de maior chance; null quando a rua está Sem dado a noite toda. */
  melhorFaixaHoraria: string | null
}>()

const selecionada = defineModel<string | null>({ required: true })

const id = useId()

const LEGENDA: EstadoDaChance[] = ['Tranquilo', 'Apertado', 'Difícil', 'Sem dado']

function estadoDe(estimativa: Estimativa): EstadoDaChance {
  return estimativa.tipo === 'chance' ? estimativa.faixaDeChance : 'Sem dado'
}

/** Altura da barra: a chance; um mínimo para a cor aparecer em 0%. */
function alturaDe(estimativa: Estimativa) {
  return estimativa.tipo === 'chance'
    ? `max(var(--spacing), ${estimativa.chance}%)`
    : 'calc(var(--spacing) * 2)'
}

/** Só as horas cheias ganham rótulo no eixo, para caber no celular. */
const horasDoEixo = computed(() =>
  props.faixasHorarias.filter(f => f.faixaHoraria.endsWith(':00')).map(f => rotuloDaFaixaHoraria(f.faixaHoraria)))
</script>

<template>
  <UCard
    as="section"
    :aria-labelledby="`${id}-titulo`"
    :ui="{ body: 'grid gap-3 p-4 sm:p-4 lg:p-6' }"
  >
    <header class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h2
        :id="`${id}-titulo`"
        class="text-xs font-semibold uppercase tracking-wider text-muted"
      >
        Chance ao longo da noite
      </h2>
      <p class="text-xs font-semibold tabular-nums">
        <template v-if="melhorFaixaHoraria">
          Melhor faixa: {{ intervaloDaFaixaHoraria(melhorFaixaHoraria) }}
        </template>
        <template v-else>
          Sem dado a noite toda
        </template>
      </p>
    </header>

    <div class="grid h-32 auto-cols-fr grid-flow-col">
      <button
        v-for="{ faixaHoraria, estimativa } in faixasHorarias"
        :key="faixaHoraria"
        type="button"
        class="relative cursor-pointer rounded-paro-sm text-default"
        :class="{ 'bg-primary-100': selecionada === faixaHoraria }"
        :aria-pressed="selecionada === faixaHoraria"
        :aria-label="`${intervaloDaFaixaHoraria(faixaHoraria)}: ${estadoDe(estimativa)}`"
        @click="selecionada = faixaHoraria"
      >
        <!-- Presa ao pé da coluna: a altura em % é da coluna, que tem altura fixa. -->
        <svg
          class="absolute inset-x-1 bottom-0 w-[calc(100%---spacing(2))]"
          :style="{ height: alturaDe(estimativa) }"
          aria-hidden="true"
          focusable="false"
        >
          <!-- Traço de 3 px centrado na borda: o SVG corta a metade de fora e sobra 1,5 px. -->
          <rect
            v-if="estimativa.tipo === 'sem-dado'"
            width="100%"
            height="100%"
            rx="3"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-dasharray="4 3"
          />
          <rect
            v-else
            width="100%"
            height="100%"
            rx="3"
            :fill="corDaFaixaDeChance(estimativa.faixaDeChance)"
          />
        </svg>
      </button>
    </div>

    <!-- Cada hora cheia ocupa as duas colunas da hora. -->
    <div
      class="-mt-2 grid auto-cols-fr grid-flow-col text-xs tabular-nums text-muted *:pl-1"
      aria-hidden="true"
    >
      <span
        v-for="hora in horasDoEixo"
        :key="hora"
      >{{ hora }}</span>
    </div>

    <ul
      class="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-muted *:flex *:items-center *:gap-2"
      aria-label="Legenda"
    >
      <li
        v-for="estado in LEGENDA"
        :key="estado"
      >
        <AmostraDeFaixaDeChance :estado="estado" />
        {{ estado }}
      </li>
    </ul>
  </UCard>
</template>
