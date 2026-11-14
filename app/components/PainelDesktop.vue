<!--
  Painel desktop de três colunas (design system, "Padrões de navegação ›
  Desktop"; referência Turo), a partir de 1024 px. Este componente monta a
  barra lateral de 400 px (USidebar do Nuxt UI) e o mapa da área no centro. A
  terceira coluna, o painel da direita de 360 px, é o próprio <NuxtPage /> do
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
  { label: 'Minha vaga', icon: 'i-lucide-car', to: '/minha-vaga', active: ativo('/minha-vaga') },
  { label: 'Ajustes', icon: 'i-lucide-settings', to: '/ajustes', active: ativo('/ajustes') },
])

const mapa = ref<{ centralizar: () => void }>()

/** Tocar num trecho abre o Detalhe da rua completo no painel da direita. */
function abrirRua(id: string) {
  navigateTo({
    path: `/ruas/${id}`,
    query: { faixaHoraria: panorama.value?.faixaHoraria ?? undefined },
  })
}
</script>

<template>
  <!-- Barra lateral de 400 px (w-100), com rolagem própria e margem lateral de 24 px. -->
  <USidebar
    v-model:open="lateralAberta"
    collapsible="offcanvas"
    breakpoint="lg"
    aria-label="Parô"
    :ui="{
      root: '[--sidebar-width:--spacing(100)]',
      container: 'bg-default border-default',
      inner: 'divide-transparent',
      header: 'min-h-0 px-6 pt-8',
      body: 'gap-0 p-6',
    }"
  >
    <template #header>
      <!-- PROVISÓRIO: nome em texto até os arquivos do logotipo entrarem no repositório. -->
      <p class="text-xl font-bold leading-tight tracking-tight">
        Parô
      </p>
    </template>

    <UNavigationMenu
      :items="navegacao"
      orientation="vertical"
      color="neutral"
      aria-label="Navegação principal"
      :ui="{
        list: 'grid gap-1',
        link: 'gap-3 min-h-11 px-3 py-0 text-sm font-medium text-muted hover:text-default before:rounded-paro-md hover:before:bg-transparent data-active:text-primary data-active:before:bg-primary-100',
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
    Centro: o mapa da área, entre a barra lateral e o painel da direita (360 px).
    Voltar até o carro abre aqui, no lugar dele.
  -->
  <div
    v-if="props.painel !== 'centro'"
    class="fixed inset-y-0 right-0 transition-[left] duration-200 ease-out motion-reduce:transition-none"
    :class="[lateralAberta ? 'left-100' : 'left-0', { 'right-90': props.painel === 'direita' }]"
  >
    <MapaDaArea
      ref="mapa"
      class="absolute inset-0"
      :ruas="ruasNoMapa"
      @selecionar-rua="abrirRua"
    />

    <!-- Abre e fecha a barra lateral (botão do exemplo do USidebar). -->
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-panel-left"
      class="absolute top-8 left-8 z-2 size-9 justify-center"
      :aria-label="lateralAberta ? 'Esconder a barra lateral' : 'Mostrar a barra lateral'"
      :aria-expanded="lateralAberta"
      @click="lateralAberta = !lateralAberta"
    />

    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-locate-fixed"
      class="absolute top-8 right-8 z-2 size-9 justify-center"
      aria-label="Centralizar nas ruas cobertas"
      @click="mapa?.centralizar()"
    />

    <!-- Legenda no canto inferior do mapa (referência Turo). -->
    <UCard
      as="section"
      class="absolute right-8 bottom-8 z-2 w-62"
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
</template>
