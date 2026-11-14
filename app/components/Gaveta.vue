<!-- eslint-disable vue/multi-word-component-names -- nome em português de uma palavra só (ADR 0026) -->
<!--
  Gaveta de texto (design system, "Gavetas"): UDrawer que sobe do rodapé, com
  raio de 24 px no topo, alça de 32 × 4 px, título e botão de fechar. Aqui,
  para o aviso de privacidade (referência Tinder) e para confirmações. Esc,
  toque fora ou arrastar para baixo fecham sem fazer nada.

  Interface (a mesma de antes do UDrawer):
  - prop `titulo`: título da gaveta.
  - slot padrão: o conteúdo, com rolagem própria.
  - evento `fechada`: a gaveta fechou, por qualquer caminho.
  - métodos pelo ref: `abrir()` e `fechar()`.
-->
<script setup lang="ts">
defineProps<{ titulo: string }>()

const emit = defineEmits<{ fechada: [] }>()

const aberta = ref(false)

function abrir() {
  aberta.value = true
}

function fechar() {
  aberta.value = false
}

watch(aberta, (valor, antes) => {
  if (antes && !valor) emit('fechada')
})

defineExpose({ abrir, fechar })
</script>

<template>
  <UDrawer
    v-model:open="aberta"
    :title="titulo"
    :close="{ color: 'neutral', variant: 'outline', class: 'size-10 justify-center lg:size-9' }"
    :ui="{ container: 'min-h-0 overflow-hidden', body: 'min-h-0 overflow-y-auto' }"
  >
    <template #body>
      <slot />
    </template>
  </UDrawer>
</template>
