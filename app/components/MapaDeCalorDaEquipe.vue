<!--
  Mapa de calor das Métricas da equipe, em ECharts, no estilo do gráfico de
  contribuições do GitHub: uma grade de células com cantos arredondados e
  3 px de folga entre elas; cada célula ocupa a coluna toda, então a grade
  se estica na largura do card. Linhas são dias da semana; colunas, faixas horárias (só
  as horas cheias ganham rótulo). Cada quadrado escurece em 5 níveis, como no
  GitHub: vazio (zero) e quatro tons de --ui-primary, pelos quartis dos
  valores acima de zero. Embaixo, a escala "menos … mais".

  Os quadrados são desenhados por uma série custom (renderItem), para ter a
  folga entre eles sobre o fundo de vidro do card. Passar o cursor (ou
  tocar) mostra o balão com a descrição do quadrado. Só no navegador; os
  leitores de tela recebem o mesmo conteúdo numa tabela escondida.

  Interface:
  - prop `linhas`: rótulos das linhas, de cima para baixo (ex.: "seg").
  - prop `colunas`: faixas horárias das colunas, "HH:MM".
  - prop `valores`: valores[linha][coluna].
  - prop `descreve`: texto do balão e da tabela para cada quadrado.
-->
<script setup lang="ts">
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CustomChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'

use([CustomChart, GridComponent, TooltipComponent, SVGRenderer])

const props = defineProps<{
  linhas: string[]
  colunas: string[]
  valores: number[][]
  descreve: (linha: number, coluna: number, valor: number) => string
}>()

const cores = useCoresDoTema({
  primaria: 'var(--ui-primary)',
  vazio: 'var(--ui-border)',
  texto: 'var(--ui-text)',
  apagado: 'var(--ui-text-muted)',
  fundo: 'var(--ui-bg-elevated)',
})

const OPACIDADES = [0.3, 0.55, 0.8, 1]

/** Os 5 tons da escala: vazio e quatro de primary. */
const tons = computed(() => [cores.value.vazio, ...OPACIDADES.map(o => comOpacidade(cores.value.primaria, o))])

/**
 * Limites dos níveis 1 a 3: os quartis dos valores acima de zero, como no
 * GitHub. Assim os quatro tons aparecem mesmo quando os valores são parecidos.
 */
const limites = computed(() => {
  const positivos = props.valores.flat().filter(v => v > 0).sort((a, b) => a - b)
  const quartil = (q: number) => positivos[Math.min(positivos.length - 1, Math.floor(q * positivos.length))] ?? 0
  return [quartil(0.25), quartil(0.5), quartil(0.75)]
})

/** Nível de 0 (zero) a 4 (quartil mais alto). */
function nivelDe(valor: number) {
  if (valor <= 0) return 0
  const [q1 = 0, q2 = 0, q3 = 0] = limites.value
  if (valor <= q1) return 1
  if (valor <= q2) return 2
  if (valor <= q3) return 3
  return 4
}

/** Folga entre os quadrados, em px. */
const FOLGA = 3
const ALTURA_DA_LINHA = 28
const ALTURA_DO_EIXO = 24
const altura = computed(() => `${props.linhas.length * ALTURA_DA_LINHA + ALTURA_DO_EIXO}px`)

const opcao = computed<EChartsOption>(() => {
  const c = cores.value
  const dados = props.valores.flatMap((linha, l) => linha.map((valor, coluna) => [coluna, l, valor]))
  return {
    animationDuration: 300,
    grid: { left: 0, right: 0, top: 0, bottom: ALTURA_DO_EIXO, containLabel: true },
    xAxis: {
      type: 'category',
      data: props.colunas,
      position: 'bottom',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: {
        interval: (indice: number) => props.colunas[indice]?.endsWith(':00') ?? false,
        formatter: (faixaHoraria: string) => rotuloDaFaixaHoraria(faixaHoraria),
        color: c.apagado,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'category',
      data: props.linhas,
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { color: c.apagado, fontSize: 11, margin: 8 },
    },
    tooltip: {
      backgroundColor: c.fundo,
      borderColor: c.vazio,
      textStyle: { color: c.texto, fontSize: 12 },
      formatter: (params: unknown) => {
        const [coluna, linha, valor] = (params as { value: number[] }).value as [number, number, number]
        return props.descreve(linha, coluna, valor)
      },
    },
    series: [
      {
        type: 'custom',
        data: dados,
        encode: { x: 0, y: 1, tooltip: 2 },
        renderItem: (_params, api) => {
          const centro = api.coord([api.value(0), api.value(1)])
          const [largura = 0, alturaDaCelula = 0] = api.size!([1, 1]) as number[]
          const w = Math.max(2, largura - FOLGA)
          const h = Math.max(2, alturaDaCelula - FOLGA)
          return {
            type: 'rect',
            shape: { x: centro[0]! - w / 2, y: centro[1]! - h / 2, width: w, height: h, r: 3 },
            style: { fill: tons.value[nivelDe(Number(api.value(2)))] },
          }
        },
      },
    ],
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

    <!-- Escala, como no GitHub. -->
    <div
      class="mt-2 flex items-center justify-end gap-1 text-xs text-muted"
      aria-hidden="true"
    >
      <span class="me-1">Menos</span>
      <span
        v-for="(tom, nivel) in tons"
        :key="nivel"
        class="size-3 rounded-[3px]"
        :style="{ backgroundColor: tom }"
      />
      <span class="ms-1">Mais</span>
    </div>

    <!-- O mesmo conteúdo em tabela, para leitores de tela. -->
    <table class="sr-only">
      <tbody>
        <tr
          v-for="(linha, l) in linhas"
          :key="linha"
        >
          <td
            v-for="(_, coluna) in colunas"
            :key="coluna"
          >
            {{ descreve(l, coluna, valores[l]?.[coluna] ?? 0) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
