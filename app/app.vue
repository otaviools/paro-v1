<script setup lang="ts">
import { pt_br } from '@nuxt/ui/locale'
import type { ToasterProps } from '@nuxt/ui'
import { DURACAO_DO_AVISO } from '~/stores/aviso-flutuante'

const route = useRoute()

// --- Painel desktop (design system, "Padrões de navegação › Desktop") ---------
//
// A partir de 1024 px, o app vira o painel de três colunas. O PainelDesktop
// monta a barra lateral e o mapa; a página da rota fica sempre aqui, no mesmo
// <NuxtPage />, que vira o painel da direita (ou o centro, em Voltar até o
// carro). A página declara onde abre com `painelDesktop` no definePageMeta;
// sem isso, o painel da direita fica fechado. A Primeira visita e as telas da
// equipe (`foraDoPainelDesktop`) continuam como no celular.

const { desktop, lateralAberta } = storeToRefs(usePainelDesktopStore())

onMounted(() => {
  const consulta = window.matchMedia(CONSULTA_DO_DESKTOP)
  desktop.value = consulta.matches
  consulta.addEventListener('change', (evento) => {
    desktop.value = evento.matches
  })
  // Na página toda: o foco pode estar na barra lateral ou no mapa.
  document.addEventListener('keydown', aoTeclar)
})

const noPainelDesktop = computed(() => !route.meta.foraDoPainelDesktop)
const painel = computed(() => route.meta.painelDesktop)

/** Fechar o painel da direita volta ao Início, onde ele começa fechado. */
function fecharPainel() {
  navigateTo('/')
}

/** Esc fecha o painel, menos quando há uma gaveta aberta: aí o Esc é dela. */
function aoTeclar(evento: KeyboardEvent) {
  if (evento.key !== 'Escape' || !desktop.value || painel.value !== 'direita') return
  // Gavetas (UDrawer) e modais do Nuxt UI são role="dialog" com data-state="open".
  if (document.querySelector('dialog[open], [role="dialog"][data-state="open"]')) return
  // Em campo de texto, o Esc é do campo; não fecha o painel no meio do que a pessoa escreve.
  const alvo = evento.target as HTMLElement | null
  if (alvo?.closest('input, textarea, select, [contenteditable="true"]')) return
  fecharPainel()
}

/*
 * Aviso flutuante (UToast), embaixo e no centro, acima da barra de abas
 * (64 + 12 px) e da ação principal fixa no rodapé (52 + 12 px), com folga de
 * 12 px. Um aviso por vez: o novo troca o anterior.
 */
const lugarDosAvisos: ToasterProps = {
  position: 'bottom-center',
  duration: DURACAO_DO_AVISO,
  max: 1,
  progress: false,
  ui: {
    viewport: 'bottom-[calc(--spacing(38)+env(safe-area-inset-bottom))] w-[calc(100%-2.5rem)] max-w-150 sm:w-[calc(100%-2.5rem)]',
  },
}
</script>

<template>
  <UApp
    :locale="pt_br"
    :toaster="lugarDosAvisos"
  >
    <PainelDesktop
      v-if="desktop && noPainelDesktop"
      :painel="painel"
    />
    <!--
      Embaixo, espaço para a barra de abas flutuante ou para a ação principal
      fixa no rodapé não cobrir o fim da página. No desktop (lg), a página vira
      o painel da direita (360 px), o centro (Voltar até o carro) ou some
      (painel fechado). O [contain:layout] faz dos elementos fixos da página
      (a ação principal no rodapé) filhos do painel, e não da janela.
      TEMPORÁRIO: o painel da direita põe --paro-margem em 24 px, para as
      telas que ainda usam o token (#37, #38 e #39).
    -->
    <div
      class="pb-[calc(--spacing(19)+env(safe-area-inset-bottom))]"
      :class="noPainelDesktop && {
        'lg:fixed lg:inset-y-0 lg:right-0 lg:z-3 lg:grid lg:w-90 lg:grid-rows-[auto_minmax(0,1fr)] lg:border-l lg:border-default lg:bg-default lg:pb-0 lg:[contain:layout] lg:[--paro-margem:1.5rem]': painel === 'direita',
        'lg:fixed lg:inset-y-0 lg:right-0 lg:pb-0 lg:[contain:layout]': painel === 'centro',
        'lg:left-100': painel === 'centro' && lateralAberta,
        'lg:left-0': painel === 'centro' && !lateralAberta,
        'lg:hidden': !painel,
      }"
    >
      <!-- Só aparece no desktop, com o painel da direita aberto. -->
      <header
        v-if="noPainelDesktop && painel === 'direita'"
        class="hidden justify-end px-6 pt-4 lg:flex"
      >
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-x"
          aria-label="Fechar painel"
          class="size-9 justify-center"
          @click="fecharPainel"
        />
      </header>
      <div :class="noPainelDesktop && painel === 'direita' && 'lg:overflow-y-auto lg:pb-19'">
        <NuxtPage />
      </div>
    </div>
    <!-- Telas que abrem por cima (Detalhe da rua) escondem a barra de abas; no desktop ela não existe. -->
    <BarraDeAbas v-if="!route.meta.semBarraDeAbas" />
    <AvisoFlutuante />
  </UApp>
</template>
