<!--
  Barra de abas flutuante do mobile (design system, "Padrões de navegação").
  No desktop não existe: a navegação fica na barra lateral do PainelDesktop.
  Pílula de vidro (ADR 0034): superfície translúcida com desfoque, que deixa
  o conteúdo de baixo aparecer. O fundo da aba ativa desliza até a aba
  escolhida em 250 ms e o ícone dela cresce um pouco, como nas abas de faixa horária (referência Bump). A barra
  fica fora do <NuxtPage />, então a animação acontece na troca de tela. Com
  movimento reduzido, troca na hora.
-->
<script setup lang="ts">
const abas = [
  { para: '/', rotulo: 'Início', icone: 'i-lucide-house' },
  { para: '/mapa', rotulo: 'Mapa', icone: 'i-lucide-map' },
  { para: '/minha-vaga', rotulo: 'Vaga', icone: 'i-lucide-car' },
  { para: '/ajustes', rotulo: 'Ajustes', icone: 'i-lucide-settings' },
]

const route = useRoute()

/** Aba da tela atual; Registrar vaga e Voltar até o carro contam como Vaga. */
const indiceAtivo = computed(() =>
  abas.findIndex(aba => (aba.para === '/' ? route.path === '/' : route.path.startsWith(aba.para))))
</script>

<template>
  <!-- Alinhada às bordas do conteúdo das telas (até 640 px, margem de 20 px). -->
  <nav
    class="fixed inset-x-5 bottom-[calc(--spacing(3)+env(safe-area-inset-bottom))] z-10 mx-auto flex h-16 max-w-150 vidro rounded-full p-1 lg:hidden"
    aria-label="Navegação principal"
  >
    <!-- Fundo da aba ativa: as abas têm a mesma largura, então ele anda de 100% em 100%. -->
    <span class="pointer-events-none absolute inset-1">
      <span
        v-if="indiceAtivo >= 0"
        class="absolute inset-y-0 left-0 w-1/4 rounded-full bg-primary-100 transition-transform duration-250 ease-out motion-reduce:transition-none"
        :style="{ transform: `translateX(${indiceAtivo * 100}%)` }"
        aria-hidden="true"
      />
    </span>
    <NuxtLink
      v-for="(aba, indice) in abas"
      :key="aba.para"
      :to="aba.para"
      class="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-full text-sm font-medium leading-tight transition-colors duration-250 motion-reduce:transition-none"
      :class="indice === indiceAtivo ? 'text-primary' : 'text-muted'"
    >
      <UIcon
        :name="aba.icone"
        class="size-5 transition-transform duration-250 ease-out motion-reduce:transition-none"
        :class="indice === indiceAtivo && 'scale-110'"
        aria-hidden="true"
      />
      <span>{{ aba.rotulo }}</span>
    </NuxtLink>
  </nav>
</template>
