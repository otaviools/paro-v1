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
  <nav class="barra" aria-label="Navegação principal">
    <NuxtLink v-for="aba in abas" :key="aba.para" :to="aba.para" class="aba">
      <UIcon :name="aba.icone" class="icone" aria-hidden="true" />
      <span>{{ aba.rotulo }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.barra {
  position: fixed;
  right: var(--paro-margem);
  bottom: calc(var(--paro-esp-3) + env(safe-area-inset-bottom));
  left: var(--paro-margem);
  z-index: 10;
  display: flex;
  gap: var(--paro-esp-1);
  /* Alinhada às bordas do conteúdo das telas. */
  max-width: calc(var(--paro-largura-conteudo) - 2 * var(--paro-margem));
  height: var(--paro-esp-16);
  margin: 0 auto;
  padding: var(--paro-esp-1);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-abas);
}

.aba {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--paro-esp-1);
  font-size: var(--paro-texto-interface);
  font-weight: 500;
  line-height: 1.2;
  color: var(--paro-texto-fraco);
  border-radius: var(--paro-raio-card);
}

.aba[aria-current='page'] {
  color: var(--paro-destaque-texto);
  background: var(--paro-destaque);
}

.icone {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
}

@media (min-width: 1024px) {
  .barra { display: none; }
}
</style>
