<!--
  Abas de faixa horária, card de melhor chance e lista das ruas cobertas do
  Panorama da noite. Usado no Início do celular e na barra lateral do painel
  desktop; a tela que usa chama o usePanoramaDaNoite e passa o resultado.
-->
<script setup lang="ts">
defineProps<{
  abas: { valor: string, rotulo: string }[]
  /** Null ou undefined enquanto carrega. */
  panorama: Panorama | null | undefined
  carregando: boolean
  erro: boolean
}>()

const faixaHoraria = defineModel<string | null>('faixaHoraria', { required: true })

const id = useId()
</script>

<template>
  <div
    class="mt-6 flex flex-wrap gap-2"
    role="tablist"
    aria-label="Faixa horária"
  >
    <ChipDeFaixaHoraria
      v-for="aba in abas"
      :key="aba.valor"
      role="tab"
      :aria-selected="faixaHoraria === aba.valor"
      :ativo="faixaHoraria === aba.valor"
      :aria-controls="`${id}-ruas`"
      @click="faixaHoraria = aba.valor"
    >
      {{ aba.rotulo }}
    </ChipDeFaixaHoraria>
  </div>

  <!-- Esqueleto no formato do card de melhor chance. -->
  <div
    v-if="carregando"
    class="mt-6 h-36 rounded-paro-lg bg-muted"
    aria-hidden="true"
  />
  <CardDeMelhorChance
    v-else-if="panorama?.faixaHoraria"
    class="mt-6"
    :faixa-horaria="panorama.faixaHoraria"
    :melhor-chance="panorama.melhorChance"
  />

  <section
    :id="`${id}-ruas`"
    role="tabpanel"
    :aria-labelledby="`${id}-titulo`"
  >
    <h2
      :id="`${id}-titulo`"
      class="mt-8 text-xs font-semibold uppercase tracking-wider tabular-nums text-muted"
    >
      Ruas cobertas<template v-if="!carregando && panorama?.faixaHoraria">
        · {{ rotuloDaFaixaHoraria(panorama.faixaHoraria) }}
      </template>
    </h2>

    <ListaDeRuasCobertas
      class="mt-3"
      :panorama="panorama"
      :carregando="carregando"
      :erro="erro"
    />
  </section>
</template>
