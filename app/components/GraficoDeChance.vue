<!--
  Gráfico de chance por faixa horária (design system; referência Swarm):
  uma barra por faixa horária das 17h às 23h, com o padrão da faixa de chance
  em --paro-texto. A altura é a chance; Sem dado é uma barra baixa com
  contorno tracejado. A faixa horária selecionada ganha fundo --paro-destaque.
  Tocar numa barra seleciona a faixa horária (v-model).
-->
<script setup lang="ts">
import type { EstadoDaChance } from '~/components/AmostraDeFaixaDeChance.vue'

const props = defineProps<{
  faixasHorarias: FaixaHorariaDaRua[]
  /** Faixa horária de maior chance; null quando a rua está Sem dado a noite toda. */
  melhorFaixaHoraria: string | null
}>()

const selecionada = defineModel<string | null>({ required: true })

const id = useId()

const LEGENDA: EstadoDaChance[] = ['Tranquilo', 'Apertado', 'Difícil', 'Sem dado']

function estadoDe(estimativa: Estimativa): EstadoDaChance {
  return estimativa.tipo === 'chance' ? estimativa.faixaDeChance : 'Sem dado'
}

/** Altura da barra: a chance; um mínimo para o padrão aparecer em 0%. */
function alturaDe(estimativa: Estimativa) {
  return estimativa.tipo === 'chance'
    ? `max(var(--paro-esp-1), ${estimativa.chance}%)`
    : 'var(--paro-esp-2)'
}

function preenchimentoDe(estado: EstadoDaChance) {
  if (estado === 'Tranquilo') return 'currentColor'
  if (estado === 'Apertado') return `url(#${id}-hachura)`
  return `url(#${id}-pontilhado)`
}

/** Só as horas cheias ganham rótulo no eixo, para caber no celular. */
const horasDoEixo = computed(() =>
  props.faixasHorarias.filter(f => f.faixaHoraria.endsWith(':00')).map(f => rotuloDaFaixaHoraria(f.faixaHoraria)))
</script>

<template>
  <section
    class="card"
    :aria-labelledby="`${id}-titulo`"
  >
    <header class="cabecalho">
      <h2
        :id="`${id}-titulo`"
        class="etiqueta"
      >
        Chance ao longo da noite
      </h2>
      <p class="resumo">
        <template v-if="melhorFaixaHoraria">
          Melhor faixa: {{ intervaloDaFaixaHoraria(melhorFaixaHoraria) }}
        </template>
        <template v-else>
          Sem dado a noite toda
        </template>
      </p>
    </header>

    <!-- Padrões das faixas de chance, iguais aos da amostra. -->
    <svg
      class="definicoes"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          :id="`${id}-hachura`"
          width="3.5"
          height="3.5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="3.5"
            stroke="currentColor"
            stroke-width="1.2"
          />
        </pattern>
        <pattern
          :id="`${id}-pontilhado`"
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="2"
            cy="2"
            r="0.8"
            fill="currentColor"
          />
        </pattern>
      </defs>
    </svg>

    <div class="barras">
      <button
        v-for="{ faixaHoraria, estimativa } in faixasHorarias"
        :key="faixaHoraria"
        type="button"
        class="coluna"
        :class="{ selecionada: selecionada === faixaHoraria }"
        :aria-pressed="selecionada === faixaHoraria"
        :aria-label="`${intervaloDaFaixaHoraria(faixaHoraria)}: ${estadoDe(estimativa)}`"
        @click="selecionada = faixaHoraria"
      >
        <svg
          class="barra"
          :style="{ height: alturaDe(estimativa) }"
          aria-hidden="true"
          focusable="false"
        >
          <!-- Traço de 3 px centrado na borda: o SVG corta a metade de fora e sobra 1,5 px. -->
          <rect
            v-if="estimativa.tipo === 'sem-dado'"
            width="100%"
            height="100%"
            rx="3"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-dasharray="4 3"
          />
          <rect
            v-else
            width="100%"
            height="100%"
            rx="3"
            :fill="preenchimentoDe(estimativa.faixaDeChance)"
          />
        </svg>
      </button>
    </div>

    <div
      class="eixo"
      aria-hidden="true"
    >
      <span
        v-for="hora in horasDoEixo"
        :key="hora"
      >{{ hora }}</span>
    </div>

    <ul
      class="legenda"
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
  </section>
</template>

<style scoped>
.card {
  display: grid;
  gap: var(--paro-esp-3);
  padding: var(--paro-esp-4);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-card);
}

@media (min-width: 1024px) {
  .card { padding: var(--paro-esp-6); }
}

.cabecalho {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--paro-esp-1) var(--paro-esp-3);
}

.etiqueta {
  font-size: var(--paro-texto-etiqueta);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--paro-texto-fraco);
}

.resumo {
  font-size: var(--paro-texto-legenda);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.definicoes {
  position: absolute;
  width: 0;
  height: 0;
  color: var(--paro-texto);
}

.barras {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  height: calc(var(--paro-esp-16) * 2);
}

.coluna {
  position: relative;
  color: var(--paro-texto);
  border-radius: var(--paro-raio-amostra);
  cursor: pointer;
}

.coluna.selecionada {
  background: var(--paro-destaque);
}

/* Presa ao pé da coluna: a altura em % é da coluna, que tem altura fixa. */
.barra {
  position: absolute;
  right: var(--paro-esp-1);
  bottom: 0;
  left: var(--paro-esp-1);
  width: calc(100% - 2 * var(--paro-esp-1));
}

/* Cada hora cheia ocupa as duas colunas da hora. */
.eixo {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  margin-top: calc(-1 * var(--paro-esp-2));
  font-size: var(--paro-texto-nota);
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto-fraco);
}

.eixo span {
  padding-left: var(--paro-esp-1);
}

.legenda {
  display: flex;
  flex-wrap: wrap;
  gap: var(--paro-esp-1) var(--paro-esp-4);
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  color: var(--paro-texto-fraco);
}

.legenda li {
  display: flex;
  align-items: center;
  gap: var(--paro-esp-2);
}
</style>
