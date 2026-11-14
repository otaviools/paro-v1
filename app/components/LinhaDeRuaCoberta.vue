<!--
  Linha de rua coberta (design system, "Cards"; referências Pangea e Waymo):
  amostra do padrão, nome da rua, rótulo e base no subtítulo e a distância a
  pé numa etiqueta (UBadge) à direita. A linha inteira é um link para o
  Detalhe da rua. Raio de 12 px, como as linhas de lista.

  Interface:
  - `rua`: id e nome da rua coberta.
  - `estimativa`: chance ou Sem dado na faixa horária.
  - `distanciaAoDestino`: em metros, em linha reta.
  - `faixaHoraria`: início da faixa horária ("HH:MM"), levado ao Detalhe da
    rua; null ou ausente abre o detalhe sem faixa escolhida.
  Sem slots nem eventos.

  Em lista estreita (até 20 rem), a distância desce para baixo do nome.
-->
<script setup lang="ts">
const props = defineProps<{
  rua: { id: string, nome: string }
  estimativa: Estimativa
  distanciaAoDestino: number
  faixaHoraria?: string | null
}>()

const estado = computed(() => estadoDaEstimativa(props.estimativa))

/** Base, ou o texto obrigatório de Sem dado (design system). */
const subtitulo = computed(() =>
  props.estimativa.tipo === 'chance'
    ? textoDaBase(props.estimativa.base)
    : 'Ainda não temos observações suficientes nesta faixa horária',
)
</script>

<template>
  <div class="@container">
    <NuxtLink
      :to="{ path: `/ruas/${rua.id}`, query: { faixaHoraria: faixaHoraria ?? undefined } }"
      class="flex min-h-14 items-center gap-3 rounded-paro-md border border-default bg-elevated px-4 py-3 transition-colors hover:bg-muted @max-[20rem]:flex-wrap"
    >
      <AmostraDeFaixaDeChance :estado="estado" />
      <span class="grid min-w-0 flex-1 @max-[20rem]:basis-[calc(100%-1.5rem)]">
        <span class="text-sm font-semibold">{{ rua.nome }}</span>
        <span class="text-xs font-medium tabular-nums text-muted">
          <strong class="font-semibold text-default">{{ estado }}</strong> · {{ subtitulo }}
        </span>
      </span>
      <UBadge
        color="neutral"
        variant="soft"
        :label="distanciaAPe(distanciaAoDestino)"
        class="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium tabular-nums text-muted @max-[20rem]:ml-6"
      />
    </NuxtLink>
  </div>
</template>
