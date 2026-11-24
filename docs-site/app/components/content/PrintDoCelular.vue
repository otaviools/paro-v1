<script setup lang="ts">
// Prints do celular lado a lado sobre o fundo azul-papel, sem janela.
// `nomes`: arquivos em docs/imagens sem extensão, separados por vírgula.
// `alts`: textos alternativos na mesma ordem, separados por "|".
const props = defineProps<{
  nomes: string
  alts: string
}>()

const prints = computed(() => {
  const alts = props.alts.split('|').map(alt => alt.trim())
  return props.nomes.split(',').map((nome, indice) => ({
    nome: nome.trim(),
    alt: alts[indice] ?? ''
  }))
})

const figura = useTemplateRef<HTMLElement>('figura')
useSurgirAoRolar(figura)
</script>

<template>
  <figure
    ref="figura"
    class="surgir-ao-rolar com-atraso not-prose my-6"
  >
    <FundoPapel>
      <div
        class="grid gap-3 sm:gap-4"
        :class="prints.length > 2 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid-cols-2'"
      >
        <UColorModeImage
          v-for="(print, indice) in prints"
          :key="print.nome"
          :style="{ '--atraso': `${indice * 80}ms` }"
          :light="`/imagens/${print.nome}-claro.png`"
          :dark="`/imagens/${print.nome}.png`"
          :alt="print.alt"
          class="h-auto w-full rounded-[1.25rem] shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_16px_32px_-16px_rgb(33_44_74/0.5)]"
          loading="lazy"
        />
      </div>
    </FundoPapel>
  </figure>
</template>
