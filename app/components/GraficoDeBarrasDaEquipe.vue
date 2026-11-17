<!--
  Gráfico de barras das Métricas da equipe, em ECharts (referências Mintlify
  e Exa). Só a parte do ECharts que o gráfico usa entra no pacote: barras,
  grade, balão, zoom e o desenho em SVG. As cores vêm das variáveis do tema
  (--ui-primary, texto, borda e fundo elevado), pelo useCoresDoTema, e
  mudam junto com o tema claro ou escuro.

  - Os dados entram como dataset do ECharts (referência "dataset-simple1"
    dos exemplos): cada barra é uma linha, e cada série lê uma coluna.
  - Vertical: uma barra por período (semana ou noite). Com `parte`, barras
    agrupadas: em cada período, o valor (claro) e a parte (cheia) lado a
    lado, com a legenda do ECharts no topo (ex.: motoristas na semana e que
    voltaram). O eixo de baixo mostra só os rótulos que cabem. Embaixo, o
    controle deslizante de zoom (dataZoom, referência "intraday-breaks-2"
    dos exemplos do ECharts): arrastar as alças escolhe o trecho; arrastar o
    gráfico move o trecho; Ctrl + roda do mouse (ou pinça no celular) dá zoom.
    A roda sozinha continua rolando a página.
  - Horizontal: uma barra por item, com o rótulo à esquerda e o valor no fim
    (ex.: ruas com mais registros). A altura cresce com o número de itens.
  Passar o cursor (ou tocar) mostra o balão com a descrição da barra. Só no
  navegador: no servidor, fica o espaço do gráfico vazio.

  Interface:
  - prop `barras`: rótulo, valor e, opcional, `parte` (um pedaço do valor).
  - prop `descreve`: texto do balão e da lista para leitores de tela.
  - prop `horizontal`: barras deitadas, para listas como a de ruas.
  - prop `legenda`: nomes do valor e da parte na legenda, com `parte`.
-->
<script setup lang="ts">
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { DatasetComponent, DataZoomComponent, GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'

use([BarChart, DatasetComponent, DataZoomComponent, GridComponent, LegendComponent, TooltipComponent, SVGRenderer])

interface Barra { rotulo: string, valor: number, parte?: number }

const props = defineProps<{
  barras: Barra[]
  descreve: (barra: Barra) => string
  horizontal?: boolean
  legenda?: { valor: string, parte: string }
}>()

/** Cores do tema para o ECharts, relidas quando o tema muda. */
const coresDoTema = useCoresDoTema({
  primaria: 'var(--ui-primary)',
  texto: 'var(--ui-text)',
  apagado: 'var(--ui-text-muted)',
  borda: 'var(--ui-border)',
  fundo: 'var(--ui-bg-elevated)',
})

const comParte = computed(() => props.barras.some(b => b.parte !== undefined))

/** Espaço da legenda no topo, quando há `parte`. */
const ALTURA_DA_LEGENDA = 32

/** Altura: fixa no vertical (com o controle de zoom embaixo e a legenda); no horizontal, 36 px por item. */
const altura = computed(() => {
  if (props.horizontal) return `${Math.max(1, props.barras.length) * 36 + 8}px`
  return `${232 + (comParte.value ? ALTURA_DA_LEGENDA : 0)}px`
})

const opcao = computed<EChartsOption>(() => {
  const c = { ...coresDoTema.value, primariaTransparente: comOpacidade(coresDoTema.value.primaria, 0.15) }
  const eixoDeCategorias = {
    type: 'category' as const,
    inverse: props.horizontal,
    axisTick: { show: false },
    axisLine: { show: !props.horizontal, lineStyle: { color: c.borda } },
    axisLabel: props.horizontal
      ? { color: c.texto, fontSize: 13, width: 150, overflow: 'truncate' as const }
      : { color: c.apagado, fontSize: 11, hideOverlap: true },
  }
  const eixoDeValores = {
    type: 'value' as const,
    show: !props.horizontal,
    minInterval: 1,
    splitNumber: 3,
    axisLabel: { color: c.apagado, fontSize: 11 },
    splitLine: { lineStyle: { color: c.borda, type: 'dashed' as const } },
  }
  const raio = props.horizontal ? [0, 999, 999, 0] : [3, 3, 0, 0]
  const nomes = props.legenda ?? { valor: 'Valor', parte: 'Parte' }
  const series: NonNullable<EChartsOption['series']> & unknown[] = [
    {
      type: 'bar',
      name: nomes.valor,
      encode: props.horizontal ? { x: 'valor', y: 'rotulo' } : { x: 'rotulo', y: 'valor' },
      barMaxWidth: props.horizontal ? 10 : (comParte.value ? 24 : 48),
      itemStyle: { color: comParte.value ? comOpacidade(c.primaria, 0.35) : c.primaria, borderRadius: raio },
      label: props.horizontal ? { show: true, position: 'right', color: c.apagado, fontSize: 12 } : { show: false },
      showBackground: props.horizontal,
      backgroundStyle: { color: c.borda, borderRadius: 999 },
      emphasis: { disabled: true },
    },
  ]
  if (comParte.value) {
    series.push({
      type: 'bar',
      name: nomes.parte,
      encode: { x: 'rotulo', y: 'parte' },
      barMaxWidth: 24,
      barGap: '15%',
      itemStyle: { color: c.primaria, borderRadius: raio },
      emphasis: { disabled: true },
    })
  }
  return {
    animationDuration: 400,
    dataset: {
      dimensions: comParte.value ? ['rotulo', 'valor', 'parte'] : ['rotulo', 'valor'],
      source: props.barras.map(b => ({ rotulo: b.rotulo, valor: b.valor, parte: b.parte ?? 0 })),
    },
    legend: {
      show: comParte.value,
      top: 0,
      left: 0,
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 16,
      selectedMode: false,
      textStyle: { color: c.apagado, fontSize: 12 },
    },
    grid: props.horizontal
      ? { left: 0, right: 48, top: 4, bottom: 4, containLabel: true }
      : { left: 0, right: 4, top: comParte.value ? ALTURA_DA_LEGENDA + 8 : 8, bottom: 48, containLabel: true },
    dataZoom: props.horizontal
      ? []
      : [
          { type: 'inside', xAxisIndex: 0, zoomOnMouseWheel: 'ctrl', moveOnMouseWheel: false, preventDefaultMouseMove: false },
          {
            type: 'slider',
            xAxisIndex: 0,
            height: 24,
            bottom: 4,
            borderColor: c.borda,
            backgroundColor: 'transparent',
            fillerColor: c.primariaTransparente,
            dataBackground: { lineStyle: { color: c.apagado, opacity: 0.6 }, areaStyle: { color: c.apagado, opacity: 0.15 } },
            selectedDataBackground: { lineStyle: { color: c.primaria }, areaStyle: { color: c.primaria, opacity: 0.25 } },
            handleStyle: { color: c.fundo, borderColor: c.primaria },
            moveHandleStyle: { color: c.primaria, opacity: 0.6 },
            emphasis: { handleStyle: { borderColor: c.primaria }, moveHandleStyle: { color: c.primaria, opacity: 1 } },
            textStyle: { color: c.apagado, fontSize: 11 },
            brushSelect: false,
          },
        ],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: c.borda, opacity: 0.5 } },
      backgroundColor: c.fundo,
      borderColor: c.borda,
      textStyle: { color: c.texto, fontSize: 12 },
      formatter: (params: unknown) => {
        const primeiro = (Array.isArray(params) ? params[0] : params) as { dataIndex: number }
        const barra = props.barras[primeiro.dataIndex]
        return barra ? props.descreve(barra) : ''
      },
    },
    xAxis: props.horizontal ? eixoDeValores : eixoDeCategorias,
    yAxis: props.horizontal ? eixoDeCategorias : eixoDeValores,
    series,
  }
})
</script>

<template>
  <div>
    <ClientOnly>
      <VChart
        :option="opcao"
        :style="{ height: altura }"
        autoresize
        aria-hidden="true"
      />
      <template #fallback>
        <div :style="{ height: altura }" />
      </template>
    </ClientOnly>

    <!-- O mesmo conteúdo em texto, para leitores de tela. -->
    <ul class="sr-only">
      <li
        v-for="barra in barras"
        :key="barra.rotulo"
      >
        {{ descreve(barra) }}
      </li>
    </ul>
  </div>
</template>
