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
  <AbasDeFaixaHoraria
    v-model="faixaHoraria"
    class="mt-6"
    :abas="abas"
    :controla="`${id}-ruas`"
  />

  <!-- Esqueleto no formato do card de melhor chance, com brilho (referências Google e Finimize). -->
  <div
    v-if="carregando"
    class="mt-6 grid gap-2.5 vidro rounded-paro-lg p-4 sm:p-6"
    aria-hidden="true"
  >
    <USkeleton class="brilho h-3 w-28 bg-muted" />
    <USkeleton class="brilho h-4 w-1/2 bg-muted" />
    <USkeleton class="brilho h-3 w-3/5 bg-muted" />
    <USkeleton class="brilho h-3 w-1/4 bg-muted" />
    <USkeleton class="brilho h-3 w-1/3 bg-muted" />
  </div>
  <!-- Ao chegar, o card aparece com esmaecer de 150 ms; com movimento reduzido, na hora. -->
  <CardDeMelhorChance
    v-else-if="panorama?.faixaHoraria"
    class="mt-6 transition-opacity duration-150 ease-out starting:opacity-0 motion-reduce:transition-none"
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
