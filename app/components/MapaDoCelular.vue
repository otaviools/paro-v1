<!--
  Mapa do celular (design system, "Padrões de navegação"; referência Lime):
  mapa em tela cheia com as ruas cobertas no padrão da faixa de chance e as
  mesmas abas de faixa horária do Início. Tocar num trecho abre a gaveta de
  resumo; expandir abre o Detalhe da rua. A lista por chance fica numa gaveta.
  No desktop, o mapa fica no centro do PainelDesktop.
-->
<script setup lang="ts">
import type { DrawerProps } from '@nuxt/ui'

const { abas, faixaHoraria, panorama, error, carregando } = usePanoramaDaNoite()

const ruasNoMapa = useRuasNoMapa(panorama)

const rotuloDaFaixa = computed(() =>
  panorama.value?.faixaHoraria ? rotuloDaFaixaHoraria(panorama.value.faixaHoraria) : null,
)

/** Mensagem no lugar das ruas quando não há chance para mostrar. */
const mensagem = computed(() => {
  if (carregando.value) return null
  if (error.value) return 'Não foi possível carregar a chance agora. Tente de novo em instantes.'
  if (panorama.value?.faixaHoraria === null) {
    return 'Agora está fora da área coberta, que vai das 17h às 23h. Escolha 18h, 19h ou 20h para ver a chance.'
  }
  return null
})

const mapa = ref<{ centralizar: () => void }>()

// --- Gaveta de resumo ------------------------------------------------------

const idSelecionado = ref<string | null>(null)

const selecionada = computed(() =>
  panorama.value?.ruas.find(r => r.rua.id === idSelecionado.value) ?? null,
)

/** A última rua do resumo: continua na gaveta enquanto ela fecha. */
const resumo = ref<NonNullable<typeof selecionada.value> | null>(null)
watch(selecionada, (valor) => {
  if (valor) resumo.value = valor
})

function selecionar(id: string) {
  idSelecionado.value = id
}

function fecharResumo() {
  idSelecionado.value = null
}

/** Segundo ponto de parada da gaveta: o Detalhe da rua. */
function expandir() {
  if (!selecionada.value) return
  navigateTo({
    path: `/ruas/${selecionada.value.rua.id}`,
    query: { faixaHoraria: panorama.value?.faixaHoraria ?? undefined },
  })
}

// Arrastar a gaveta para cima expande; para baixo, o próprio UDrawer fecha.
const LIMIAR_DO_ARRASTO = 48
let inicioDoArrasto: number | null = null

function comecarArrasto(evento: PointerEvent) {
  inicioDoArrasto = evento.clientY
}

function soltar(evento: PointerEvent) {
  if (inicioDoArrasto === null) return
  const deslocamento = evento.clientY - inicioDoArrasto
  inicioDoArrasto = null
  if (deslocamento < -LIMIAR_DO_ARRASTO) expandir()
}

/**
 * Escuta o toque na gaveta inteira (alça, título e corpo). O tipo do `content`
 * do UDrawer não lista eventos nativos, mas o Vue os repassa ao elemento.
 */
const eventosDoResumo = { onPointerdown: comecarArrasto, onPointerup: soltar } as DrawerProps['content']

/** O UDrawer avisa que fechou (Esc, toque fora, arrastar para baixo, botão de fechar). */
function aoMudarResumo(aberto: boolean) {
  if (!aberto) fecharResumo()
}

// --- Gavetas do celular: lista e legenda ----------------------------------

const listaAberta = ref(false)
const legendaAberta = ref(false)

function abrirLista() {
  fecharResumo()
  listaAberta.value = true
}

function abrirLegenda() {
  fecharResumo()
  legendaAberta.value = true
}

/** Botão de ícone (design system, "Botões"): 40 px, bg-elevated e borda. */
const botaoDeFechar = { color: 'neutral', variant: 'outline', class: 'size-10 justify-center' } as const
</script>

<template>
  <!-- Mapa em tela cheia; a barra de abas flutua por cima. No desktop, o CSS já o esconde antes de o app montar. -->
  <main class="fixed inset-0 lg:hidden">
    <!-- Abas e avisos sobre o mapa, no topo; só os próprios elementos recebem toque. -->
    <section
      class="pointer-events-none absolute inset-x-0 top-0 z-2 grid gap-3 px-5 pt-[calc(--spacing(3)+env(safe-area-inset-top))] *:pointer-events-auto"
      aria-label="Faixa horária e ruas cobertas"
    >
      <AvisoDeDemonstracao v-if="panorama?.demonstracao" />

      <!-- O título fica só para leitores de tela; o mapa ocupa a tela. -->
      <h1 class="sr-only">
        Mapa
      </h1>

      <AbasDeFaixaHoraria
        v-model="faixaHoraria"
        :abas="abas"
      />

      <UAlert
        v-if="mensagem"
        :color="error ? 'error' : 'warning'"
        variant="soft"
        :icon="error ? 'i-lucide-circle-alert' : 'i-lucide-clock'"
        :title="error ? 'Erro ao carregar' : 'Fora do horário de cobertura'"
        :description="mensagem"
        :ui="{ title: 'text-sm', description: 'text-sm' }"
      />
    </section>

    <div class="absolute inset-0">
      <!-- O que fica por cima do mapa: aviso e abas no topo (140 px), barra de abas embaixo. -->
      <MapaDaArea
        ref="mapa"
        class="absolute inset-0 [--mapa-margem-inferior:calc(--spacing(19)+env(safe-area-inset-bottom))] [--mapa-margem-superior:--spacing(35)]"
        :ruas="ruasNoMapa"
        @selecionar-rua="selecionar"
      />

      <!-- Botões de ícone flutuando no canto direito, acima da barra de abas (referência Lime). -->
      <div class="absolute right-5 bottom-[calc(--spacing(22)+env(safe-area-inset-bottom))] z-2 grid gap-2">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-list"
          class="size-10 justify-center"
          aria-label="Lista das ruas cobertas"
          @click="abrirLista"
        />
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-circle-help"
          class="size-10 justify-center"
          aria-label="Legenda"
          @click="abrirLegenda"
        />
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-locate-fixed"
          class="size-10 justify-center"
          aria-label="Centralizar nas ruas cobertas"
          @click="mapa?.centralizar()"
        />
      </div>
    </div>

    <!--
      Gaveta de resumo da rua tocada (referência Lime). Não é modal: o mapa
      continua tocável, e tocar noutro trecho troca a rua do resumo.
    -->
    <UDrawer
      :open="Boolean(selecionada)"
      :modal="false"
      :overlay="false"
      :title="resumo?.rua.nome"
      :close="botaoDeFechar"
      :content="eventosDoResumo"
      :ui="{ container: 'gap-2 pb-[calc(--spacing(6)+env(safe-area-inset-bottom))]' }"
      @update:open="aoMudarResumo"
    >
      <template
        v-if="resumo"
        #body
      >
        <div class="grid gap-2 text-xs font-medium tabular-nums text-muted">
          <p class="flex items-center gap-2">
            <AmostraDeFaixaDeChance :estado="estadoDaEstimativa(resumo.estimativa)" />
            <span>
              <strong class="font-semibold text-default">{{ estadoDaEstimativa(resumo.estimativa) }}</strong>
              <template v-if="rotuloDaFaixa"> · {{ rotuloDaFaixa }}</template>
            </span>
          </p>
          <p>
            {{ resumo.estimativa.tipo === 'chance'
              ? textoDaBase(resumo.estimativa.base)
              : 'Não temos observações suficientes nesta faixa horária' }}
          </p>
          <p class="flex items-center gap-2">
            <UIcon
              name="i-lucide-footprints"
              class="size-3 shrink-0"
              aria-hidden="true"
            />
            {{ distanciaAPe(resumo.distanciaAoDestino) }} até o destino
          </p>
        </div>
      </template>

      <template #footer>
        <UButton
          color="neutral"
          size="xl"
          block
          class="mt-2 h-13 text-lg"
          label="Ver detalhe da rua"
          @click="expandir"
        />
      </template>
    </UDrawer>

    <!-- Lista por chance numa gaveta. -->
    <UDrawer
      v-model:open="listaAberta"
      :close="botaoDeFechar"
      :ui="{ title: 'tabular-nums' }"
    >
      <template #title>
        Ruas cobertas<template v-if="!carregando && rotuloDaFaixa">
          · {{ rotuloDaFaixa }}
        </template>
      </template>
      <template #body>
        <ListaDeRuasCobertas
          :panorama="panorama"
          :carregando="carregando"
          :erro="Boolean(error)"
        />
      </template>
    </UDrawer>

    <!-- Legenda numa gaveta, com botão grande para fechar (referência Lime). -->
    <UDrawer
      v-model:open="legendaAberta"
      title="Legenda"
    >
      <template #body>
        <LegendaDoMapa />
      </template>
      <template #footer>
        <UButton
          color="neutral"
          size="xl"
          block
          class="h-13 text-lg"
          label="Fechar"
          @click="legendaAberta = false"
        />
      </template>
    </UDrawer>
  </main>
</template>
