<!--
  Aviso flutuante (design system, "Gavetas, avisos flutuantes e carregamento";
  referência Waymo): UToast em bg-inverted com text-inverted, raio de 12 px,
  some em 3 s. O <UApp> do app.vue põe os toasts embaixo, no centro, acima da
  barra de abas e da ação principal fixa no rodapé, para não cobrir "Saí" em
  Minha vaga; um aviso novo troca o anterior.

  Interface: sem props, slots nem eventos; fica uma vez só, no app.vue. As
  telas avisam pela store: `useAvisoFlutuanteStore().avisar('Texto.')`.
-->
<script setup lang="ts">
import { DURACAO_DO_AVISO } from '~/stores/aviso-flutuante'

const toast = useToast()
const store = useAvisoFlutuanteStore()

// Cada `avisar` vira um toast, mesmo quando o texto repete o do aviso anterior.
const parar = store.$onAction(({ name, args }) => {
  if (name !== 'avisar') return
  toast.add({
    title: args[0] as string,
    duration: DURACAO_DO_AVISO,
    close: false,
    progress: false,
    ui: {
      root: 'rounded-paro-md bg-inverted px-4 py-3 shadow-none ring-0',
      title: 'text-sm font-medium text-inverted',
    },
  })
})

onBeforeUnmount(parar)
</script>

<!-- Não desenha nada: o <UApp> desenha os toasts. -->
<template>
  <span hidden />
</template>
