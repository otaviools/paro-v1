<!--
  Chance ao longo da noite (Detalhe da rua), em mapa de calor no estilo do
  GitHub, desenhado pelo ECharts como o das Métricas: colunas são as horas
  (17h a 22h) e as duas linhas são a primeira e a segunda meia hora (":00" e
  ":30"). Cada quadrado é uma faixa horária, na cor da faixa de chance
  (verde, amarelo ou vermelho, ADR 0033); Sem dado é um quadrado vazio com
  contorno tracejado na cor do texto.

  O ECharts só desenha. Por cima de cada quadrado fica um botão transparente
  do mesmo tamanho: tocar ou usar o teclado seleciona a faixa horária
  (v-model), com o anel de foco, o rótulo para leitores de tela e o balão
  nativo (title). A faixa selecionada ganha um contorno na cor do texto. Os
  rótulos das horas e das meias horas ficam em HTML, alinhados à grade.
-->
<script setup lang="ts">
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CustomChart } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'
import type { EstadoDaChance } from '~/components/AmostraDeFaixaDeChance.vue'

use([CustomChart, GridComponent, SVGRenderer])

const props = defineProps<{
  faixasHorarias: FaixaHorariaDaRua[]
}>()

const selecionada = defineModel<string | null>({ required: true })

const id = useId()

const LEGENDA: EstadoDaChance[] = ['Tranquilo', 'Apertado', 'Difícil', 'Sem dado']
const MEIAS_HORAS = [':00', ':30']

/** Folga entre os quadrados (a mesma do gap da grade de botões) e altura de cada linha, em px. */
const FOLGA = 4
const ALTURA_DA_LINHA = 40

function estadoDe(estimativa: Estimativa): EstadoDaChance {
  return estimativa.tipo === 'chance' ? estimativa.faixaDeChance : 'Sem dado'
}

function descricaoDe({ faixaHoraria, estimativa }: FaixaHorariaDaRua) {
  const chance = estimativa.tipo === 'chance' ? `, ${Math.round(estimativa.chance)}%` : ''
  return `${intervaloDaFaixaHoraria(faixaHoraria)}: ${estadoDe(estimativa)}${chance}`
}

/** As horas da noite, "HH", na ordem das faixas horárias. */
const horas = computed(() => [...new Set(props.faixasHorarias.map(f => f.faixaHoraria.slice(0, 2)))])

/** Coluna (hora) e linha (meia hora) de cada faixa horária na grade. */
function posicaoDe(faixaHoraria: string) {
  return { coluna: horas.value.indexOf(faixaHoraria.slice(0, 2)), linha: faixaHoraria.endsWith(':30') ? 1 : 0 }
}

const cores = useCoresDoTema({ texto: 'var(--ui-text)' })

const opcao = computed<EChartsOption>(() => ({
  animationDuration: 300,
  grid: { left: 0, right: 0, top: 0, bottom: 0 },
  xAxis: { type: 'category', data: horas.value, show: false },
  yAxis: { type: 'category', data: MEIAS_HORAS, inverse: true, show: false },
  series: [
    {
      type: 'custom',
      silent: true,
      data: props.faixasHorarias.map(({ faixaHoraria, estimativa }) => {
        const { coluna, linha } = posicaoDe(faixaHoraria)
        return [coluna, linha, estimativa.tipo === 'chance' ? estimativa.faixaDeChance : '']
      }),
      renderItem: (params, api) => {
        const centro = api.coord([api.value(0), api.value(1)])
        const [largura = 0, altura = 0] = api.size!([1, 1]) as number[]
        const w = Math.max(2, largura - FOLGA)
        const h = Math.max(2, altura - FOLGA)
        const faixa = props.faixasHorarias[params.dataIndex]
        const forma = { x: centro[0]! - w / 2, y: centro[1]! - h / 2, width: w, height: h, r: 6 }
        if (!faixa || faixa.estimativa.tipo !== 'chance') {
          // Sem dado: contorno tracejado, 1,5 px para dentro, para o traço não sair do quadrado.
          return {
            type: 'rect',
            shape: { ...forma, x: forma.x + 0.75, y: forma.y + 0.75, width: w - 1.5, height: h - 1.5 },
            style: { fill: 'transparent', stroke: cores.value.texto, lineWidth: 1.5, lineDash: [4, 3] },
          }
        }
        return { type: 'rect', shape: forma, style: { fill: corDaFaixaDeChance(faixa.estimativa.faixaDeChance) } }
      },
    },
  ],
}))
</script>

<template>
  <UCard
    as="section"
    :aria-labelledby="`${id}-titulo`"
    :ui="{ body: 'grid gap-3 p-4 sm:p-4 lg:p-6' }"
  >
    <h2
      :id="`${id}-titulo`"
      class="text-xs font-semibold uppercase tracking-wider text-muted"
    >
      Chance ao longo da noite
    </h2>

    <div class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1.5">
      <!-- Rótulos das meias horas, à esquerda de cada linha. -->
      <div
        class="grid text-xs tabular-nums text-muted"
        :style="{ gridTemplateRows: `repeat(2, ${ALTURA_DA_LINHA}px)` }"
        aria-hidden="true"
      >
        <span
          v-for="meia in MEIAS_HORAS"
          :key="meia"
          class="self-center"
        >{{ meia }}</span>
      </div>

      <div
        class="relative"
        :style="{ height: `${ALTURA_DA_LINHA * 2}px` }"
      >
        <ClientOnly>
          <VChart
            :option="opcao"
            class="absolute inset-0"
            autoresize
            aria-hidden="true"
          />
        </ClientOnly>

        <!-- Um botão transparente por quadrado, por cima do gráfico; a folga é a mesma do desenho. -->
        <div
          class="absolute grid"
          :style="{
            inset: `${FOLGA / 2}px`,
            gap: `${FOLGA}px`,
            gridTemplateColumns: `repeat(${horas.length}, minmax(0, 1fr))`,
            gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
          }"
        >
          <button
            v-for="faixa in faixasHorarias"
            :key="faixa.faixaHoraria"
            type="button"
            class="cursor-pointer rounded-[6px] transition-shadow duration-150 focus-visible:outline-offset-2"
            :class="{ 'shadow-[0_0_0_2px_var(--ui-text)]': selecionada === faixa.faixaHoraria }"
            :style="{
              gridColumn: posicaoDe(faixa.faixaHoraria).coluna + 1,
              gridRow: posicaoDe(faixa.faixaHoraria).linha + 1,
            }"
            :aria-pressed="selecionada === faixa.faixaHoraria"
            :aria-label="descricaoDe(faixa)"
            :title="descricaoDe(faixa)"
            @click="selecionada = faixa.faixaHoraria"
          />
        </div>
      </div>

      <!-- Rótulos das horas, embaixo de cada coluna. -->
      <span aria-hidden="true" />
      <div
        class="grid text-center text-xs tabular-nums text-muted"
        :style="{ gridTemplateColumns: `repeat(${horas.length}, minmax(0, 1fr))` }"
        aria-hidden="true"
      >
        <span
          v-for="hora in horas"
          :key="hora"
        >{{ rotuloDaFaixaHoraria(`${hora}:00`) }}</span>
      </div>
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
