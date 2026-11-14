<!--
  Card de melhor chance (design system, "Cards"): etiqueta com a faixa
  horária, nome da rua, amostra do padrão com rótulo, base, distância a pé e
  "Previsão, não garantia.". Sem melhor chance (todas as ruas Sem dado), diz
  que ainda não há dados para a faixa horária.
-->
<script setup lang="ts">
const props = defineProps<{
  /** Início da faixa horária, "HH:MM". */
  faixaHoraria: string
  melhorChance: MelhorChance | null
}>()

const rotulo = computed(() => rotuloDaFaixaHoraria(props.faixaHoraria))
const id = useId()
</script>

<template>
  <section
    class="card"
    :aria-labelledby="id"
  >
    <h2
      :id="id"
      class="etiqueta"
    >
      Melhor chance · {{ rotulo }}
    </h2>

    <template v-if="melhorChance">
      <p class="nome">
        {{ melhorChance.rua.nome }}
      </p>
      <p class="linha">
        <AmostraDeFaixaDeChance :estado="melhorChance.estimativa.faixaDeChance" />
        <span>
          <strong class="rotulo">{{ melhorChance.estimativa.faixaDeChance }}</strong>
          · {{ textoDaBase(melhorChance.estimativa.base) }}
        </span>
      </p>
      <p class="linha">
        <UIcon
          name="i-lucide-footprints"
          class="icone"
          aria-hidden="true"
        />
        <span>{{ distanciaAPe(melhorChance.distanciaAoDestino) }}</span>
      </p>
      <p class="nota">
        Previsão, não garantia.
      </p>
    </template>

    <p
      v-else
      class="sem-dados"
    >
      Ainda não há dados para {{ rotulo }}. Nenhuma rua coberta tem observações suficientes nesta faixa horária.
    </p>
  </section>
</template>

<style scoped>
.card {
  display: grid;
  gap: var(--paro-esp-2);
  padding: var(--paro-esp-4);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-card);
}

@media (min-width: 1024px) {
  .card { padding: var(--paro-esp-6); }
}

.etiqueta {
  font-size: var(--paro-texto-etiqueta);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto-fraco);
}

.nome {
  font-size: var(--paro-texto-card);
  font-weight: 600;
  line-height: 1.2;
}

.linha {
  display: flex;
  align-items: center;
  gap: var(--paro-esp-2);
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto-fraco);
}

.rotulo {
  font-weight: 600;
  color: var(--paro-texto);
}

.icone {
  flex: none;
  width: var(--paro-esp-3);
  height: var(--paro-esp-3);
}

.nota {
  font-size: var(--paro-texto-nota);
  color: var(--paro-texto-fraco);
}

.sem-dados {
  font-size: var(--paro-texto-corpo);
}
</style>
