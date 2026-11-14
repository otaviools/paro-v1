<!--
  Aviso flutuante (design system, "Gavetas, avisos flutuantes e carregamento";
  referência Waymo): UToast em vidro (ADR 0034), raio de 12 px, some em 3 s.
  A cor vem do tipo: sucesso em verde com ícone de check; erro em vermelho com
  ícone de alerta. Fundo do sinal translúcido com desfoque, texto do mesmo par. O <UApp> do app.vue põe os toasts embaixo, no centro, acima da
  barra de abas e da ação principal fixa no rodapé, para não cobrir "Saí" em
  Minha vaga; um aviso novo troca o anterior.

  Interface: sem props, slots nem eventos; fica uma vez só, no app.vue. As
  telas avisam pela store: `useAvisoFlutuanteStore().avisar('Texto.')`, ou
  `avisar('Texto.', 'erro')` para falhas.
-->
<script setup lang="ts">
import { DURACAO_DO_AVISO } from '~/stores/aviso-flutuante'
import type { TipoDeAviso } from '~/stores/aviso-flutuante'

/** Vidro tingido pela cor do sinal: fundo translúcido, desfoque, borda e sombra suaves. */
const ESTILO: Record<TipoDeAviso, { icone: string, raiz: string, texto: string }> = {
  sucesso: {
    icone: 'i-lucide-circle-check',
    raiz: 'bg-success-100/75 ring-success/25',
    texto: 'text-success',
  },
  erro: {
    icone: 'i-lucide-circle-alert',
    raiz: 'bg-error-100/75 ring-error/25',
    texto: 'text-error',
  },
}

const avisosNaTela = useToast()
const avisoFlutuante = useAvisoFlutuanteStore()

// Cada `avisar` vira um toast, mesmo quando o texto repete o do aviso anterior.
const parar = avisoFlutuante.$onAction(({ name, args }) => {
  if (name !== 'avisar') return
  const estilo = ESTILO[(args[1] as TipoDeAviso | undefined) ?? 'sucesso']
  avisosNaTela.add({
    title: args[0] as string,
    icon: estilo.icone,
    duration: DURACAO_DO_AVISO,
    close: false,
    progress: false,
    ui: {
      root: `items-center gap-3 rounded-paro-md px-4 py-3 ring-1 shadow-[0_8px_24px_rgb(0_0_0/0.12)] backdrop-blur-xl backdrop-saturate-180 ${estilo.raiz}`,
      icon: `size-5 shrink-0 ${estilo.texto}`,
      title: `text-sm font-medium ${estilo.texto}`,
    },
  })
})

onBeforeUnmount(parar)
</script>

<!-- Não desenha nada: o <UApp> desenha os toasts. -->
<template>
  <span hidden />
</template>
