<!--
  Legenda do mapa (referência Lime, "zonas e estacionamento"): cada faixa de
  chance com a sua amostra de cor em 32 px, o rótulo e uma explicação própria
  (ADR 0033 e design system, "Faixas de chance").
-->
<script setup lang="ts">
import type { EstadoDaChance } from '~/components/AmostraDeFaixaDeChance.vue'

const itens: { estado: EstadoDaChance, explicacao: string }[] = [
  { estado: 'Tranquilo', explicacao: 'Chance de 70% ou mais.' },
  { estado: 'Apertado', explicacao: 'Chance de 40% a 69%.' },
  { estado: 'Difícil', explicacao: 'Chance abaixo de 40%.' },
  { estado: 'Sem dado', explicacao: 'Não temos observações suficientes nesta faixa horária' },
]
</script>

<template>
  <ul class="grid gap-3">
    <li
      v-for="item in itens"
      :key="item.estado"
      class="flex items-center gap-3"
    >
      <AmostraDeFaixaDeChance
        :estado="item.estado"
        :tamanho="32"
      />
      <p class="grid">
        <strong class="text-sm font-semibold">{{ item.estado }}</strong>
        <span class="text-xs font-medium text-muted">{{ item.explicacao }}</span>
      </p>
    </li>
  </ul>
</template>
