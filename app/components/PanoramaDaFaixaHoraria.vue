<!--
  Abas de faixa horária, card de melhor chance e lista das ruas cobertas do
  Panorama da noite. Usado no Início do celular e na barra lateral do painel
  desktop; a tela que usa chama o usePanoramaDaNoite e passa o resultado.
-->
<script setup lang="ts">
type Panorama = ReturnType<typeof usePanoramaDaNoite>['panorama']['value']

defineProps<{
  abas: { valor: string, rotulo: string }[]
  panorama: Panorama
  carregando: boolean
  erro: boolean
}>()

const faixaHoraria = defineModel<string | null>('faixaHoraria', { required: true })

const id = useId()
</script>

<template>
  <div class="abas" role="tablist" aria-label="Faixa horária">
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

  <div v-if="carregando" class="card-esqueleto" aria-hidden="true" />
  <CardDeMelhorChance
    v-else-if="panorama?.faixaHorária"
    class="melhor-chance"
    :faixa-horaria="panorama.faixaHorária"
    :melhor-chance="panorama.melhorChance"
  />

  <section :id="`${id}-ruas`" role="tabpanel" :aria-labelledby="`${id}-titulo`">
    <h2 :id="`${id}-titulo`" class="etiqueta">
      Ruas cobertas<template v-if="!carregando && panorama?.faixaHorária"> · {{ rotuloDaFaixaHoraria(panorama.faixaHorária) }}</template>
    </h2>

    <ListaDeRuasCobertas
      class="lista"
      :panorama="panorama"
      :carregando="carregando"
      :erro="erro"
    />
  </section>
</template>

<style scoped>
.abas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--paro-esp-2);
  margin-top: var(--paro-esp-6);
}

.melhor-chance,
.card-esqueleto {
  margin-top: var(--paro-esp-6);
}

/* Esqueleto no formato do card de melhor chance. */
.card-esqueleto {
  height: calc(var(--paro-esp-16) * 2 + var(--paro-esp-4));
  background: var(--paro-superficie-suave);
  border-radius: var(--paro-raio-card);
}

.etiqueta {
  margin-top: var(--paro-esp-8);
  font-size: var(--paro-texto-etiqueta);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto-fraco);
}

.lista {
  margin-top: var(--paro-esp-3);
}
</style>
