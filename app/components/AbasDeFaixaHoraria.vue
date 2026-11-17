<!--
  Abas de faixa horária (Agora, 18h, 19h, 20h e a rotina, quando é outra):
  UButtons lado a lado num controle segmentado em pílula de vidro (ADR 0034;
  referência Bump, "trocar estilo do mapa"). Uma pílula de vidro azul desliza
  até a aba escolhida em 200 ms: o azul claro #A9D3F2 (o primary do tema
  escuro) translúcido, com borda fina e brilho de 1 px no topo, como o vidro.
  No claro, 60% de opacidade e texto escuro; no escuro, 40% e texto branco,
  para manter o contraste sobre o fundo escuro. Com
  movimento reduzido, troca na hora. Altura de 48 px (botões de 40 px mais a
  folga de 4 px), acima do alvo de toque mínimo de 44 px.
  Usado no Início, na barra lateral do desktop e no Mapa.

  Interface:
  - prop `abas`: as abas, vindas do usePanoramaDaNoite.
  - prop `controla`: id do painel que as abas mudam (aria-controls), opcional.
  - prop `rotulo`: nome do grupo de abas para leitores de tela; padrão
    "Faixa horária". Também usado na Área da equipe e no período das Métricas.
  - v-model: o valor da aba escolhida ('agora' ou a faixa horária).
-->
<script setup lang="ts">
const props = defineProps<{
  abas: { valor: string, rotulo: string }[]
  controla?: string
  rotulo?: string
}>()

const escolhida = defineModel<string | null>({ required: true })

/** As abas têm a mesma largura; o fundo ocupa a fatia da aba escolhida. */
const fundo = computed(() => {
  const indice = props.abas.findIndex(aba => aba.valor === escolhida.value)
  const largura = 100 / Math.max(props.abas.length, 1)
  return indice < 0 ? null : { left: `${indice * largura}%`, width: `${largura}%` }
})
</script>

<template>
  <div
    class="vidro w-full rounded-full p-1"
    role="tablist"
    :aria-label="rotulo ?? 'Faixa horária'"
  >
    <!-- Grade interna: a porcentagem do fundo conta só a área das abas, sem a folga. -->
    <div class="relative grid auto-cols-fr grid-flow-col">
      <span
        v-if="fundo"
        class="absolute inset-y-0 rounded-full bg-[#A9D3F2]/60 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.55),inset_0_1px_0_rgb(255_255_255/0.85),0_4px_12px_rgb(31_108_159/0.18)] backdrop-blur-xl backdrop-saturate-180 transition-[left] duration-200 ease-out motion-reduce:transition-none dark:bg-[#A9D3F2]/40 dark:shadow-[inset_0_0_0_1px_rgb(169_211_242/0.4),inset_0_1px_0_rgb(255_255_255/0.3),0_4px_12px_rgb(0_0_0/0.3)]"
        :style="fundo"
        aria-hidden="true"
      />
      <UButton
        v-for="aba in abas"
        :key="aba.valor"
        role="tab"
        :aria-selected="escolhida === aba.valor"
        :aria-controls="controla"
        color="neutral"
        variant="ghost"
        class="relative h-10 justify-center tabular-nums transition-colors duration-200 hover:bg-transparent active:bg-transparent"
        :class="escolhida === aba.valor ? 'text-[#191919] hover:text-[#191919] dark:text-white dark:hover:text-white' : 'text-default hover:text-highlighted'"
        @click="escolhida = aba.valor"
      >
        {{ aba.rotulo }}
      </UButton>
    </div>
  </div>
</template>
