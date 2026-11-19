<!--
  Aviso flutuante (design system, "Gavetas, avisos flutuantes e carregamento";
  referência Waymo): UToast num card de vidro que segue o tema (claro no claro,
  escuro no escuro), mais opaco que os cards, raio de 12 px, some em 3 s. O texto vem com uma
  bolinha ao lado: verde (o verde de Tranquilo) para sucesso, vermelha (o
  vermelho de Difícil) para erro, com um halo suave da mesma cor. O <UApp> do
  app.vue põe o aviso logo acima da barra de abas no celular e no canto
  superior direito no desktop; um aviso novo troca o anterior.

  Interface: sem props, slots nem eventos; fica uma vez só, no app.vue. As
  telas avisam pela store: `useAvisoFlutuanteStore().avisar('Texto.')`, ou
  `avisar('Texto.', 'erro')` para falhas.
-->
<script setup lang="ts">
import { DURACAO_DO_AVISO } from '~/stores/aviso-flutuante'
import type { TipoDeAviso } from '~/stores/aviso-flutuante'

/** Bolinha do tipo de aviso, desenhada no ::before do card, com halo de 4 px. */
const BOLINHA: Record<TipoDeAviso, string> = {
  sucesso: 'before:bg-green-500 before:ring-green-500/20',
  erro: 'before:bg-red-500 before:ring-red-500/20',
}

/**
 * Card de vidro do tema; `aviso-flutuante` (main.css) deixa o fundo mais
 * opaco que o dos cards, para o aviso ler bem sobre qualquer tela.
 */
const CARD = 'aviso-flutuante vidro items-center gap-3 rounded-paro-md px-4 py-3'
  + ' before:size-2 before:shrink-0 before:rounded-full before:ring-4 before:content-[\'\']'

const avisosNaTela = useToast()
const avisoFlutuante = useAvisoFlutuanteStore()

// Cada `avisar` vira um toast, mesmo quando o texto repete o do aviso anterior.
const parar = avisoFlutuante.$onAction(({ name, args }) => {
  if (name !== 'avisar') return
  const tipo = (args[1] as TipoDeAviso | undefined) ?? 'sucesso'
  avisosNaTela.add({
    title: args[0] as string,
    duration: DURACAO_DO_AVISO,
    close: false,
    progress: false,
    ui: {
      root: `${CARD} ${BOLINHA[tipo]}`,
      title: 'text-sm font-medium text-highlighted',
    },
  })
})

onBeforeUnmount(parar)
</script>

<!-- Não desenha nada: o <UApp> desenha os toasts. -->
<template>
  <span hidden />
</template>
