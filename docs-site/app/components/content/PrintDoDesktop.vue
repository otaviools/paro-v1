<script setup lang="ts">
// Print do desktop numa janela do macOS sobre o fundo azul-papel. `nome` é o
// arquivo em docs/imagens sem extensão: <nome>-claro.png no tema claro e
// <nome>.png no escuro.
const props = withDefaults(defineProps<{
  nome: string
  alt: string
  titulo?: string
}>(), {
  titulo: 'paro-v1.vercel.app'
})

const figura = useTemplateRef<HTMLElement>('figura')
useSurgirAoRolar(figura)
</script>

<template>
  <figure
    ref="figura"
    class="surgir-ao-rolar not-prose my-6"
  >
    <FundoPapel>
      <JanelaMac :titulo="props.titulo">
        <UColorModeImage
          :light="`/imagens/${props.nome}-claro.png`"
          :dark="`/imagens/${props.nome}.png`"
          :alt="props.alt"
          class="h-auto w-full"
          loading="lazy"
        />
      </JanelaMac>
    </FundoPapel>
  </figure>
</template>
