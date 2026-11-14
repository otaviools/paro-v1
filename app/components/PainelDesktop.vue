<!--
  Painel desktop de três colunas (design system, "Padrões de navegação ›
  Desktop"; referência Turo), a partir de 1024 px. Este componente monta a
  barra lateral de 340 px (USidebar do Nuxt UI) e o mapa da área no centro. A
  terceira coluna, o painel da direita de 432 px, é o próprio <NuxtPage /> do
  app.vue: o Detalhe da rua, Minha vaga e Ajustes abrem nele pelas rotas de
  sempre, então os links diretos continuam funcionando e o conteúdo não é
  duplicado. Voltar até o carro abre no centro, no lugar do mapa da área.
-->
<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const props = defineProps<{
  /** Onde a página da rota abre: no painel da direita, no centro, ou em nenhum (painel fechado). */
  painel?: LugarNoPainelDesktop
}>()

const route = useRoute()
const { lateralAberta } = storeToRefs(usePainelDesktopStore())

const { abas, faixaHoraria, panorama, error, carregando } = usePanoramaDaNoite()
const ruasNoMapa = useRuasNoMapa(panorama)

/** Minha vaga inclui Registrar vaga e Voltar até o carro; o Início inclui o Mapa e o Detalhe da rua. */
function ativo(para: string) {
  if (para === '/minha-vaga') return route.path.startsWith('/minha-vaga')
  if (para === '/ajustes') return route.path === '/ajustes'
  return !route.path.startsWith('/minha-vaga') && route.path !== '/ajustes'
}

const navegacao = computed<NavigationMenuItem[]>(() => [
  { label: 'Início', icon: 'i-lucide-house', to: '/', active: ativo('/') },
  { label: 'Vaga', icon: 'i-lucide-car', to: '/minha-vaga', active: ativo('/minha-vaga') },
  { label: 'Ajustes', icon: 'i-lucide-settings', to: '/ajustes', active: ativo('/ajustes') },
])

const mapa = ref<{ centralizar: () => void }>()

/**
 * Controles do canto direito do mapa: a 32 px da borda, ou a 32 px do painel
 * da direita (432 + 32 px) quando ele está aberto por cima do mapa.
 */
const classeDoCantoDireito = computed(() => [
  'transition-[right] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
  props.painel === 'direita' ? 'right-116' : 'right-8',
])

/** Tocar num trecho abre o Detalhe da rua completo no painel da direita. */
function abrirRua(id: string) {
  navigateTo({
    path: `/ruas/${id}`,
    query: { faixaHoraria: panorama.value?.faixaHoraria ?? undefined },
  })
}
</script>

<template>
  <!--
    Barra lateral de 340 px (w-85), com rolagem própria e margem lateral de 24 px.
    A barra de rolagem é fina e suave: polegar com 20% da cor do texto (35% com
    o cursor em cima) e trilho transparente.
  -->
  <USidebar
    v-model:open="lateralAberta"
    collapsible="offcanvas"
    breakpoint="lg"
    aria-label="Parô"
    :ui="{
      root: '[--sidebar-width:--spacing(85)]',
      container: 'bg-default border-default',
      inner: 'divide-transparent',
      header: 'min-h-0 px-6 pt-8',
      body: 'gap-0 p-6 [scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--ui-text)_20%,transparent)_transparent] hover:[scrollbar-color:color-mix(in_oklab,var(--ui-text)_35%,transparent)_transparent]',
    }"
  >
    <template #header>
      <!-- Logotipo do Parô (design system, "Logotipo"), 36 px de altura. -->
      <p class="flex-1">
        <LogoDoParo class="h-9" />
      </p>
      <BotaoDeTema />
    </template>

    <!-- Item ativo em pílula de vidro (ADR 0034), como as abas de faixa horária. -->
    <UNavigationMenu
      :items="navegacao"
      orientation="vertical"
      color="neutral"
      aria-label="Navegação principal"
      :ui="{
        list: 'grid gap-1',
        link: 'gap-3 min-h-11 px-4 py-0 text-sm font-medium text-muted hover:text-default rounded-full before:hidden data-active:text-primary data-active:vidro',
        linkLeadingIcon: 'size-5 text-current group-hover:text-current group-data-active:text-current',
      }"
    />

    <section
      class="mt-8 border-t border-default pt-2"
      aria-label="Faixa horária e ruas cobertas"
    >
      <AvisoDeDemonstracao
        v-if="panorama?.demonstracao"
        class="mt-6"
      />

      <PanoramaDaFaixaHoraria
        v-model:faixa-horaria="faixaHoraria"
        :abas="abas"
        :panorama="panorama"
        :carregando="carregando"
        :erro="Boolean(error)"
      />

      <PerguntaAjudou class="mt-8" />
    </section>
  </USidebar>

  <!--
    Centro: o mapa da área, da barra lateral até a borda direita da tela.
    Voltar até o carro abre aqui, no lugar dele. O painel da direita (432 px)
    abre por cima do mapa, sem mudar a largura dele (sem salto de layout); só
    a borda esquerda acompanha a barra lateral, em 300 ms. Os controles do
    canto direito (centralizar e legenda) se afastam do painel no mesmo ritmo.
  -->
  <div
    v-if="props.painel !== 'centro'"
    class="fixed inset-y-0 right-0 transition-[left] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
    :class="lateralAberta ? 'left-85' : 'left-0'"
  >
    <MapaDaArea
      ref="mapa"
      class="absolute inset-0"
      :ruas="ruasNoMapa"
      @selecionar-rua="abrirRua"
    />

    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-locate-fixed"
      class="absolute top-8 z-2 size-9 justify-center"
      :class="classeDoCantoDireito"
      aria-label="Centralizar nas ruas cobertas"
      @click="mapa?.centralizar()"
    />

    <!--
      Canto inferior do mapa: Seu registro de vaga (quando há um aberto, fora
      da aba Vaga) à esquerda da legenda (referência Turo), com a mesma largura e altura dela.
      Com o painel da direita aberto, o mapa visível fica estreito: o registro
      vai para cima da legenda.
    -->
    <div
      class="absolute bottom-8 z-2 flex items-stretch gap-4"
      :class="[classeDoCantoDireito, props.painel === 'direita' && 'flex-col']"
    >
      <RegistroNoMapa />
      <UCard
        as="section"
        class="w-62"
        :ui="{ body: 'grid gap-3 p-4 sm:p-4' }"
        aria-labelledby="titulo-legenda-do-painel"
      >
        <h2
          id="titulo-legenda-do-painel"
          class="text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Legenda
        </h2>
        <LegendaDoMapa />
      </UCard>
    </div>
  </div>
</template>
