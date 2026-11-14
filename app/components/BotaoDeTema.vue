<!--
  Botão sol/lua que alterna entre tema claro e escuro, com o novo tema se
  espalhando em círculo a partir do botão (useTrocaDeTema). Fica na barra
  lateral do desktop e ao lado do título do Início no celular. Só renderiza
  no navegador, porque o tema escolhido não é conhecido no servidor.
-->
<script setup lang="ts">
const { escuro, definirEscuro } = useTrocaDeTema()

// O UButton chama o clique sem currentTarget; o botão vem do target.
function trocar(evento: MouseEvent) {
  definirEscuro(!escuro.value, (evento.target as Element | null)?.closest('button'))
}
</script>

<template>
  <ClientOnly>
    <UButton
      color="neutral"
      variant="ghost"
      :icon="escuro ? 'i-lucide-moon' : 'i-lucide-sun'"
      :aria-label="escuro ? 'Mudar para modo claro' : 'Mudar para modo escuro'"
      @click="trocar"
    />
    <template #fallback>
      <span class="size-8" />
    </template>
  </ClientOnly>
</template>
