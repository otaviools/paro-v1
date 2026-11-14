<!--
  Legenda do mapa (referência Lime, "zonas e estacionamento"): cada faixa de
  chance com o seu padrão em 32 px, o rótulo e uma explicação própria, sem
  depender de cor (ADR 0006 e design system, "Faixas de chance").
-->
<script setup lang="ts">
import type { EstadoDaChance } from '~/components/AmostraDeFaixaDeChance.vue'

const itens: { estado: EstadoDaChance, explicacao: string }[] = [
  { estado: 'Tranquilo', explicacao: 'Chance de 70% ou mais.' },
  { estado: 'Apertado', explicacao: 'Chance de 40% a 69%.' },
  { estado: 'Difícil', explicacao: 'Chance abaixo de 40%.' },
  { estado: 'Sem dado', explicacao: 'Ainda não temos observações suficientes nesta faixa horária' },
]
</script>

<template>
  <ul class="legenda">
    <li
      v-for="item in itens"
      :key="item.estado"
      class="item"
    >
      <AmostraDeFaixaDeChance
        :estado="item.estado"
        :tamanho="32"
      />
      <p class="texto">
        <strong class="rotulo">{{ item.estado }}</strong>
        <span class="explicacao">{{ item.explicacao }}</span>
      </p>
    </li>
  </ul>
</template>

<style scoped>
.legenda {
  display: grid;
  gap: var(--paro-esp-3);
}

.item {
  display: flex;
  align-items: center;
  gap: var(--paro-esp-3);
}

.texto {
  display: grid;
}

.rotulo {
  font-size: var(--paro-texto-corpo);
  font-weight: 600;
}

.explicacao {
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  color: var(--paro-texto-fraco);
}
</style>
