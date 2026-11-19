<!--
  Histórico de vagas da aba Vaga (ADR 0004; referências Bolt e Citi Bike):
  as vagas das noites passadas do semestre, guardadas só neste celular. Cada
  linha tem o ícone de carro, a rua coberta e, embaixo, a noite, a chegada e
  a saída: "saiu 22h" quando a pessoa tocou em "Saí", "prevista 22h" quando
  a noite acabou sem o "Saí". Linhas sem caixa, separadas por 1 px, como as
  tabelas do design system. Sem vagas, a tela não mostra esta seção.

  Interface:
  - prop `vagas`: da noite mais recente para a mais antiga.
  - prop `semestre`: id do semestre letivo ("2027-1"), ou null fora dele.
-->
<script setup lang="ts">
import type { VagaNoHistorico } from '~/dados-do-celular'

const props = defineProps<{ vagas: VagaNoHistorico[], semestre: string | null }>()

const DIAS_DA_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/** "2027-05-05" → "Qua, 05/05". */
function noiteCurta(noite: string) {
  const [ano, mes, dia] = noite.split('-').map(Number) as [number, number, number]
  const diaDaSemana = DIAS_DA_SEMANA[new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()]
  return `${diaDaSemana}, ${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`
}

/** "2027-1" → "1º semestre"; sem semestre, só "Histórico". */
const titulo = computed(() => {
  const numero = props.semestre?.match(/^\d{4}-(\d)/)?.[1]
  return numero ? `Histórico · ${numero}º semestre` : 'Histórico'
})
</script>

<template>
  <section
    class="mt-8"
    aria-labelledby="titulo-historico"
  >
    <h2
      id="titulo-historico"
      class="text-xs font-semibold uppercase tracking-wider text-muted"
    >
      {{ titulo }}
    </h2>

    <ul class="mt-2">
      <li
        v-for="(vaga, indice) in vagas"
        :key="`${vaga.noite}-${indice}`"
        class="flex items-center gap-3 border-b border-default py-3"
      >
        <span
          class="vidro flex size-10 shrink-0 items-center justify-center rounded-paro-md"
          aria-hidden="true"
        >
          <UIcon
            name="i-lucide-car"
            class="size-5 text-muted"
          />
        </span>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold">
            {{ vaga.ruaCoberta.nome }}
          </p>
          <p class="text-xs font-medium tabular-nums text-muted">
            {{ noiteCurta(vaga.noite) }} · {{ rotuloDaFaixaHoraria(vaga.chegada) }}
            <span aria-hidden="true">→</span>
            <span class="sr-only">até</span>
            {{ vaga.saiu ? 'saiu' : 'prevista' }} {{ rotuloDaFaixaHoraria(vaga.saida) }}
          </p>
        </div>
      </li>
    </ul>
  </section>
</template>
