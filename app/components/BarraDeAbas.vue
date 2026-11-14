<!--
  Barra de abas flutuante do mobile (design system, "Padrões de navegação").
  No desktop não existe: a navegação fica na barra lateral do PainelDesktop.
-->
<script setup lang="ts">
const abas = [
  { para: '/', rotulo: 'Início', icone: 'i-lucide-house' },
  { para: '/mapa', rotulo: 'Mapa', icone: 'i-lucide-map' },
  { para: '/minha-vaga', rotulo: 'Minha vaga', icone: 'i-lucide-car' },
  { para: '/ajustes', rotulo: 'Ajustes', icone: 'i-lucide-settings' },
]
</script>

<template>
  <!-- Alinhada às bordas do conteúdo das telas (até 640 px, margem de 20 px). -->
  <nav
    class="fixed inset-x-5 bottom-[calc(--spacing(3)+env(safe-area-inset-bottom))] z-10 mx-auto flex h-16 max-w-150 gap-1 rounded-paro-lg border border-default bg-elevated p-1 lg:hidden"
    aria-label="Navegação principal"
  >
    <NuxtLink
      v-for="aba in abas"
      :key="aba.para"
      :to="aba.para"
      class="flex flex-1 flex-col items-center justify-center gap-1 rounded-paro-lg text-sm font-medium leading-tight text-muted aria-[current=page]:bg-primary-100 aria-[current=page]:text-primary"
    >
      <UIcon
        :name="aba.icone"
        class="size-5"
        aria-hidden="true"
      />
      <span>{{ aba.rotulo }}</span>
    </NuxtLink>
  </nav>
</template>
