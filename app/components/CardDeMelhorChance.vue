<!--
  Card de melhor chance (design system, "Cards"; referência Pangea): UCard
  com etiqueta da faixa horária, nome da rua, amostra do padrão com rótulo,
  base, distância a pé e "Previsão, não garantia.". Sem melhor chance (todas
  as ruas Sem dado), diz que ainda não há dados para a faixa horária.

  Interface:
  - `faixaHoraria`: início da faixa horária, "HH:MM".
  - `melhorChance`: a rua com a melhor chance, ou null.
  Sem slots nem eventos. Classes de quem usa (margens) vão para a raiz.
-->
<script setup lang="ts">
const props = defineProps<{
  faixaHoraria: string
  melhorChance: MelhorChance | null
}>()

const rotulo = computed(() => rotuloDaFaixaHoraria(props.faixaHoraria))
const id = useId()
</script>

<template>
  <UCard
    as="section"
    :aria-labelledby="id"
    :ui="{ body: 'grid gap-2' }"
  >
    <h2
      :id="id"
      class="text-xs font-semibold uppercase tracking-wider tabular-nums text-muted"
    >
      Melhor chance · {{ rotulo }}
    </h2>

    <template v-if="melhorChance">
      <p class="text-base font-semibold leading-tight">
        {{ melhorChance.rua.nome }}
      </p>
      <p class="flex items-center gap-2 text-xs font-medium tabular-nums text-muted">
        <AmostraDeFaixaDeChance :estado="melhorChance.estimativa.faixaDeChance" />
        <span>
          <strong class="font-semibold text-default">{{ melhorChance.estimativa.faixaDeChance }}</strong>
          · {{ textoDaBase(melhorChance.estimativa.base) }}
        </span>
      </p>
      <p class="flex items-center gap-2 text-xs font-medium tabular-nums text-muted">
        <UIcon
          name="i-lucide-footprints"
          class="size-3 shrink-0"
          aria-hidden="true"
        />
        <span>{{ distanciaAPe(melhorChance.distanciaAoDestino) }}</span>
      </p>
      <p class="text-xs text-muted">
        Previsão, não garantia.
      </p>
    </template>

    <p
      v-else
      class="text-sm"
    >
      Ainda não há dados para {{ rotulo }}. Nenhuma rua coberta tem observações suficientes nesta faixa horária.
    </p>
  </UCard>
</template>
