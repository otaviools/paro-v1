<!--
  Mapa do celular (design system, "Padrões de navegação"; referência Lime):
  mapa em tela cheia com as ruas cobertas no padrão da faixa de chance e as
  mesmas abas de faixa horária do Início. Tocar num trecho abre a gaveta de
  resumo; expandir abre o Detalhe da rua. A lista por chance fica numa gaveta.
  No desktop, o mapa fica no centro do PainelDesktop.
-->
<script setup lang="ts">
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
    return 'Agora está fora da área coberta, que vai das 17h às 23h. Escolha 19h, 21h ou 22h para ver a chance.'
  }
  return null
})

const mapa = ref<{ centralizar: () => void }>()

// --- Gaveta de resumo ------------------------------------------------------

const idSelecionado = ref<string | null>(null)

const selecionada = computed(() =>
  panorama.value?.ruas.find(r => r.rua.id === idSelecionado.value) ?? null,
)

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

// Arrastar a alça para cima expande; para baixo fecha.
const LIMIAR_DO_ARRASTO = 48
const inicioDoArrasto = ref<number | null>(null)
const arrasto = ref(0)

function comecarArrasto(evento: PointerEvent) {
  inicioDoArrasto.value = evento.clientY
  ;(evento.currentTarget as HTMLElement).setPointerCapture(evento.pointerId)
}

function arrastar(evento: PointerEvent) {
  if (inicioDoArrasto.value === null) return
  arrasto.value = evento.clientY - inicioDoArrasto.value
}

function soltar() {
  if (inicioDoArrasto.value === null) return
  const deslocamento = arrasto.value
  inicioDoArrasto.value = null
  arrasto.value = 0
  if (deslocamento < -LIMIAR_DO_ARRASTO) expandir()
  else if (deslocamento > LIMIAR_DO_ARRASTO) fecharResumo()
}

// --- Gavetas do celular: lista e legenda ----------------------------------

const gavetaDaLista = ref<HTMLDialogElement>()
const gavetaDaLegenda = ref<HTMLDialogElement>()

function abrir(gaveta: HTMLDialogElement | undefined) {
  fecharResumo()
  gaveta?.showModal()
}
</script>

<template>
  <main
    class="tela"
    @keydown.esc="fecharResumo"
  >
    <!-- Abas sobre o mapa. -->
    <section
      class="painel"
      aria-label="Faixa horária e ruas cobertas"
    >
      <AvisoDeDemonstracao v-if="panorama?.demonstracao" />

      <!-- O título fica só para leitores de tela; o mapa ocupa a tela. -->
      <h1 class="titulo">
        Mapa
      </h1>

      <div
        class="abas"
        role="tablist"
        aria-label="Faixa horária"
      >
        <ChipDeFaixaHoraria
          v-for="aba in abas"
          :key="aba.valor"
          role="tab"
          :aria-selected="faixaHoraria === aba.valor"
          :ativo="faixaHoraria === aba.valor"
          @click="faixaHoraria = aba.valor"
        >
          {{ aba.rotulo }}
        </ChipDeFaixaHoraria>
      </div>

      <p
        v-if="mensagem"
        class="mensagem"
      >
        {{ mensagem }}
      </p>
    </section>

    <div class="area-do-mapa">
      <MapaDaArea
        ref="mapa"
        class="mapa"
        :ruas="ruasNoMapa"
        @selecionar-rua="selecionar"
      />

      <!-- Botões de ícone flutuando no canto direito (referência Lime). -->
      <div class="controles">
        <button
          type="button"
          class="botao-icone"
          aria-label="Lista das ruas cobertas"
          @click="abrir(gavetaDaLista)"
        >
          <UIcon
            name="i-lucide-list"
            class="icone"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          class="botao-icone"
          aria-label="Legenda"
          @click="abrir(gavetaDaLegenda)"
        >
          <UIcon
            name="i-lucide-circle-help"
            class="icone"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          class="botao-icone"
          aria-label="Centralizar nas ruas cobertas"
          @click="mapa?.centralizar()"
        >
          <UIcon
            name="i-lucide-locate-fixed"
            class="icone"
            aria-hidden="true"
          />
        </button>
      </div>

      <!--
        Gaveta de resumo da rua tocada (referência Lime). Vai para o <body>
        para ficar por cima da barra de abas.
      -->
      <Teleport to="body">
        <section
          v-if="selecionada"
          class="resumo"
          :style="arrasto ? { transform: `translateY(${Math.max(arrasto, -LIMIAR_DO_ARRASTO)}px)` } : undefined"
          aria-labelledby="titulo-resumo"
          @keydown.esc="fecharResumo"
        >
          <button
            type="button"
            class="alca-toque"
            aria-label="Expandir para o Detalhe da rua"
            @click="expandir"
            @pointerdown="comecarArrasto"
            @pointermove="arrastar"
            @pointerup="soltar"
            @pointercancel="soltar"
          >
            <span
              class="alca"
              aria-hidden="true"
            />
          </button>

          <div class="cabecalho">
            <h2
              id="titulo-resumo"
              class="nome"
            >
              {{ selecionada.rua.nome }}
            </h2>
            <button
              type="button"
              class="botao-icone"
              aria-label="Fechar"
              @click="fecharResumo"
            >
              <UIcon
                name="i-lucide-x"
                class="icone"
                aria-hidden="true"
              />
            </button>
          </div>

          <p class="linha">
            <AmostraDeFaixaDeChance :estado="estadoDaEstimativa(selecionada.estimativa)" />
            <span>
              <strong class="rotulo">{{ estadoDaEstimativa(selecionada.estimativa) }}</strong>
              <template v-if="rotuloDaFaixa"> · {{ rotuloDaFaixa }}</template>
            </span>
          </p>
          <p class="linha">
            {{ selecionada.estimativa.tipo === 'chance'
              ? textoDaBase(selecionada.estimativa.base)
              : 'Ainda não temos observações suficientes nesta faixa horária' }}
          </p>
          <p class="linha">
            <UIcon
              name="i-lucide-footprints"
              class="icone-pequeno"
              aria-hidden="true"
            />
            {{ distanciaAPe(selecionada.distanciaAoDestino) }} até o destino
          </p>

          <button
            type="button"
            class="principal"
            @click="expandir"
          >
            Ver detalhe da rua
          </button>
        </section>
      </Teleport>
    </div>

    <!-- Lista por chance numa gaveta. -->
    <dialog
      ref="gavetaDaLista"
      class="gaveta"
      aria-labelledby="titulo-lista"
      @click.self="gavetaDaLista?.close()"
    >
      <div
        class="alca"
        aria-hidden="true"
      />
      <div class="cabecalho">
        <h2
          id="titulo-lista"
          class="titulo-gaveta"
        >
          Ruas cobertas<template v-if="!carregando && rotuloDaFaixa">
            · {{ rotuloDaFaixa }}
          </template>
        </h2>
        <button
          type="button"
          class="botao-icone"
          aria-label="Fechar"
          @click="gavetaDaLista?.close()"
        >
          <UIcon
            name="i-lucide-x"
            class="icone"
            aria-hidden="true"
          />
        </button>
      </div>
      <ListaDeRuasCobertas
        :panorama="panorama"
        :carregando="carregando"
        :erro="Boolean(error)"
      />
    </dialog>

    <!-- Legenda numa gaveta, com botão grande para fechar (referência Lime). -->
    <dialog
      ref="gavetaDaLegenda"
      class="gaveta"
      aria-labelledby="titulo-legenda"
      @click.self="gavetaDaLegenda?.close()"
    >
      <div
        class="alca"
        aria-hidden="true"
      />
      <h2
        id="titulo-legenda"
        class="titulo-gaveta"
      >
        Legenda
      </h2>
      <LegendaDoMapa />
      <button
        type="button"
        class="principal"
        @click="gavetaDaLegenda?.close()"
      >
        Fechar
      </button>
    </dialog>
  </main>
</template>

<style scoped>
/* Mapa em tela cheia; a barra de abas flutua por cima. */
.tela {
  --altura-da-barra: calc(var(--paro-esp-16) + var(--paro-esp-3) + env(safe-area-inset-bottom));

  position: fixed;
  inset: 0;
}

.area-do-mapa {
  position: absolute;
  inset: 0;
}

.mapa {
  position: absolute;
  inset: 0;
  /* O que fica por cima do mapa: aviso e abas no topo, barra de abas embaixo. */
  --mapa-margem-superior: calc(var(--paro-esp-16) * 2 + var(--paro-esp-3));
  --mapa-margem-inferior: var(--altura-da-barra);
}

/* Abas e avisos sobre o mapa, no topo; só os próprios elementos recebem toque. */
.painel {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 2;
  display: grid;
  gap: var(--paro-esp-3);
  padding: calc(var(--paro-esp-3) + env(safe-area-inset-top)) var(--paro-margem) 0;
  pointer-events: none;
}

.painel > * {
  pointer-events: auto;
}

.abas {
  display: flex;
  gap: var(--paro-esp-2);
  overflow-x: auto;
  scrollbar-width: none;
}

.abas > * {
  flex: none;
}

.mensagem {
  padding: var(--paro-esp-4);
  font-size: var(--paro-texto-corpo);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-linha);
}

.titulo {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  font-size: var(--paro-texto-titulo);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

/* Botões de ícone (design system, "Botões"), acima da barra de abas no celular. */
.controles {
  position: absolute;
  right: var(--paro-margem);
  bottom: calc(var(--altura-da-barra) + var(--paro-esp-3));
  z-index: 2;
  display: grid;
  gap: var(--paro-esp-2);
}

.botao-icone {
  display: grid;
  flex: none;
  place-items: center;
  width: calc(var(--paro-esp-8) + var(--paro-esp-2));
  height: calc(var(--paro-esp-8) + var(--paro-esp-2));
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-botao);
  cursor: pointer;
}

.icone {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
}

.icone-pequeno {
  flex: none;
  width: var(--paro-esp-3);
  height: var(--paro-esp-3);
}

/* Gaveta sobre o mapa: raio de 16 px no topo, alça de 32 × 4 px, botão de fechar. */
.resumo {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  display: grid;
  gap: var(--paro-esp-2);
  max-width: var(--paro-largura-conteudo);
  margin: 0 auto;
  padding: 0 var(--paro-margem) calc(var(--paro-esp-6) + env(safe-area-inset-bottom));
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-bottom: 0;
  border-radius: var(--paro-raio-card) var(--paro-raio-card) 0 0;
}

/* Alvo de toque de 44 px em volta da alça. */
.alca-toque {
  display: grid;
  place-items: center;
  height: calc(var(--paro-esp-8) + var(--paro-esp-3));
  cursor: grab;
  touch-action: none;
}

.alca {
  justify-self: center;
  width: var(--paro-esp-8);
  height: var(--paro-esp-1);
  background: var(--paro-borda);
  border-radius: var(--paro-raio-pilula);
}

.cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--paro-esp-3);
}

.nome {
  font-size: var(--paro-texto-card);
  font-weight: 600;
  line-height: 1.2;
}

.linha {
  display: flex;
  align-items: center;
  gap: var(--paro-esp-2);
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto-fraco);
}

.rotulo {
  font-weight: 600;
  color: var(--paro-texto);
}

/* Botão principal (design system, "Botões"). */
.principal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(var(--paro-esp-12) + var(--paro-esp-1));
  margin-top: var(--paro-esp-2);
  font-size: var(--paro-texto-botao);
  font-weight: 600;
  color: var(--paro-acao-texto);
  background: var(--paro-acao);
  border-radius: var(--paro-raio-botao);
  cursor: pointer;
}

.principal:hover,
.principal:active {
  background: var(--paro-acao-hover);
}

.principal:active {
  transform: scale(0.98);
}

/* Gavetas do celular (lista e legenda). */
.gaveta {
  width: 100%;
  max-width: var(--paro-largura-conteudo);
  max-height: 85dvh;
  margin: auto auto 0;
  padding: var(--paro-esp-3) var(--paro-margem) calc(var(--paro-esp-6) + env(safe-area-inset-bottom));
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-bottom: 0;
  border-radius: var(--paro-raio-card) var(--paro-raio-card) 0 0;
}

.gaveta[open] {
  display: grid;
  gap: var(--paro-esp-4);
}

.titulo-gaveta {
  font-size: var(--paro-texto-card);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: no-preference) {
  .gaveta[open],
  .resumo {
    animation: entrar 250ms cubic-bezier(0.16, 1, 0.3, 1);
  }
}

@keyframes entrar {
  from { opacity: 0; transform: translateY(var(--paro-esp-2)); }
  to { opacity: 1; transform: translateY(0); }
}

/* No desktop, o Mapa do celular não aparece; antes de o app montar, o CSS já o esconde. */
@media (min-width: 1024px) {
  .tela,
  .resumo {
    display: none;
  }
}
</style>
