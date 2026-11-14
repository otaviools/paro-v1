<!--
  Painel desktop de três colunas (design system, "Padrões de navegação ›
  Desktop"; referência Turo), a partir de 1024 px. Este componente monta a
  barra lateral de 280 px (USidebar do Nuxt UI) e o mapa da área no centro. A
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
const lateralAberta = useLateralAberta()

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
    query: { faixaHoraria: panorama.value?.faixaHorária ?? undefined },
  })
}
</script>

<template>
  <USidebar
    v-model:open="lateralAberta"
    collapsible="offcanvas"
    breakpoint="lg"
    aria-label="Parô"
    :ui="{
      root: '[--sidebar-width:var(--paro-largura-lateral)]',
      container: 'lateral-container',
      inner: 'divide-transparent',
      header: 'lateral-header',
      body: 'lateral-body',
    }"
  >
    <template #header>
      <!-- PROVISÓRIO: nome em texto até os arquivos do logotipo entrarem no repositório. -->
      <p class="marca">Parô</p>
    </template>

    <UNavigationMenu
      :items="navegacao"
      orientation="vertical"
      color="neutral"
      class="navegacao"
      aria-label="Navegação principal"
      :ui="{
        list: 'grid gap-(--paro-esp-1)',
        link: 'gap-(--paro-esp-3) min-h-(--paro-alvo-de-toque) px-(--paro-esp-3) py-0 text-(length:--paro-texto-interface) font-medium text-(--paro-texto-fraco) hover:text-(--paro-texto) before:rounded-(--paro-raio-linha) hover:before:bg-transparent data-active:text-(--paro-destaque-texto) data-active:before:bg-(--paro-destaque)',
        linkLeadingIcon: 'size-(--paro-esp-5) text-current group-hover:text-current group-data-active:text-current',
      }"
    />

    <section class="panorama" aria-label="Faixa horária e ruas cobertas">
      <AvisoDeDemonstracao v-if="panorama?.demonstração" class="aviso" />

      <PanoramaDaFaixaHoraria
        v-model:faixa-horaria="faixaHoraria"
        :abas="abas"
        :panorama="panorama"
        :carregando="carregando"
        :erro="Boolean(error)"
      />

      <PerguntaAjudou class="ajudou" />
    </section>
  </USidebar>

  <!-- Centro: mapa da área. Voltar até o carro abre aqui, no lugar dele. -->
  <div
    v-if="props.painel !== 'centro'"
    class="centro"
    :class="{ 'com-painel': props.painel === 'direita', 'sem-lateral': !lateralAberta }"
  >
    <MapaDaArea
      ref="mapa"
      class="mapa"
      :ruas="ruasNoMapa"
      @selecionar-rua="abrirRua"
    />

    <!-- Abre e fecha a barra lateral (botão do exemplo do USidebar). -->
    <div class="controles controles-esquerda">
      <button
        type="button"
        class="botao-icone"
        :aria-label="lateralAberta ? 'Esconder a barra lateral' : 'Mostrar a barra lateral'"
        :aria-expanded="lateralAberta"
        @click="lateralAberta = !lateralAberta"
      >
        <UIcon name="i-lucide-panel-left" class="icone" aria-hidden="true" />
      </button>
    </div>

    <div class="controles">
      <button
        type="button"
        class="botao-icone"
        aria-label="Centralizar nas ruas cobertas"
        @click="mapa?.centralizar()"
      >
        <UIcon name="i-lucide-locate-fixed" class="icone" aria-hidden="true" />
      </button>
    </div>

    <!-- Legenda no canto inferior do mapa (referência Turo). -->
    <section class="legenda-do-mapa" aria-labelledby="titulo-legenda-do-painel">
      <h2 id="titulo-legenda-do-painel" class="etiqueta">Legenda</h2>
      <LegendaDoMapa />
    </section>
  </div>
</template>

<style scoped>
/* Barra lateral de 280 px (USidebar), com as cores da paleta Papel. */
:deep(.lateral-container) {
  background: var(--paro-fundo);
  border-color: var(--paro-borda);
}

:deep(.lateral-header) {
  min-height: 0;
  padding: var(--paro-esp-8) var(--paro-esp-6) 0;
}

:deep(.lateral-body) {
  gap: 0;
  padding: var(--paro-esp-6);
}

/* Figtree 22 px, o tamanho de --paro-texto-stat. */
.marca {
  font-size: var(--paro-texto-stat);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--paro-texto);
}

.panorama {
  margin-top: var(--paro-esp-8);
  padding-top: var(--paro-esp-2);
  border-top: 1px solid var(--paro-borda);
}

.aviso {
  margin-top: var(--paro-esp-6);
}

.ajudou {
  margin-top: var(--paro-esp-8);
}

.icone {
  flex: none;
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
}

/* Centro: o mapa ocupa o espaço entre a barra lateral e o painel da direita. */
.centro {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: var(--paro-largura-lateral);
  transition: left 200ms ease-out;
}

.centro.sem-lateral {
  left: 0;
}

.centro.com-painel {
  right: var(--paro-largura-painel);
}

@media (prefers-reduced-motion: reduce) {
  .centro {
    transition: none;
  }
}

.mapa {
  position: absolute;
  inset: 0;
}

/* Botão de ícone (design system, "Botões"), nos cantos de cima do mapa. */
.controles {
  position: absolute;
  top: var(--paro-margem);
  right: var(--paro-margem);
  z-index: 2;
  display: grid;
  gap: var(--paro-esp-2);
}

.controles-esquerda {
  right: auto;
  left: var(--paro-margem);
}

.botao-icone {
  display: grid;
  place-items: center;
  width: calc(var(--paro-esp-8) + var(--paro-esp-1));
  height: calc(var(--paro-esp-8) + var(--paro-esp-1));
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-botao);
  cursor: pointer;
}

.legenda-do-mapa {
  position: absolute;
  right: var(--paro-margem);
  bottom: var(--paro-margem);
  z-index: 2;
  display: grid;
  gap: var(--paro-esp-3);
  width: calc(var(--paro-largura-lateral) - var(--paro-esp-8));
  padding: var(--paro-esp-4);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-card);
}

.etiqueta {
  font-size: var(--paro-texto-etiqueta);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--paro-texto-fraco);
}
</style>
