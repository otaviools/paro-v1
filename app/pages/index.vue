<script setup lang="ts">
const { abas, faixaHoraria, panorama, error, carregando } = usePanoramaDaNoite()
</script>

<template>
  <main class="inicio">
    <AvisoDeDemonstracao v-if="panorama?.demonstração" class="aviso" />

    <h1 class="titulo">Início</h1>

    <div class="abas" role="tablist" aria-label="Faixa horária">
      <ChipDeFaixaHoraria
        v-for="aba in abas"
        :key="aba.valor"
        role="tab"
        :aria-selected="faixaHoraria === aba.valor"
        :ativo="faixaHoraria === aba.valor"
        aria-controls="ruas-cobertas"
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

    <section id="ruas-cobertas" role="tabpanel" aria-labelledby="titulo-ruas">
      <h2 id="titulo-ruas" class="etiqueta">
        Ruas cobertas<template v-if="!carregando && panorama?.faixaHorária"> · {{ rotuloDaFaixaHoraria(panorama.faixaHorária) }}</template>
      </h2>

      <ListaDeRuasCobertas
        class="lista"
        :panorama="panorama"
        :carregando="carregando"
        :erro="Boolean(error)"
      />
    </section>
  </main>
</template>

<style scoped>
.inicio {
  max-width: var(--paro-largura-conteudo);
  margin: 0 auto;
  padding: var(--paro-esp-8) var(--paro-margem);
}

.aviso {
  margin-bottom: var(--paro-esp-6);
}

.titulo {
  font-size: var(--paro-texto-titulo);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

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
