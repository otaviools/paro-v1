<!--
  Painel desktop de três colunas (design system, "Padrões de navegação ›
  Desktop"; referência Turo), a partir de 1024 px. Este componente monta a
  barra lateral de 280 px e o mapa da área no centro. A terceira coluna, o
  painel da direita de 360 px, é o próprio <NuxtPage /> do app.vue: o Detalhe
  da rua, Minha vaga e Ajustes abrem nele pelas rotas de sempre, então os links
  diretos continuam funcionando e o conteúdo não é duplicado. Voltar até o
  carro abre no centro, no lugar do mapa da área.
-->
<script setup lang="ts">
const props = defineProps<{
  /** Onde a página da rota abre: no painel da direita, no centro, ou em nenhum (painel fechado). */
  painel?: 'direita' | 'centro'
}>()

const route = useRoute()

const { abas, faixaHoraria, panorama, error, carregando } = usePanoramaDaNoite()
const ruasNoMapa = useRuasNoMapa(panorama)

const navegacao = [
  { para: '/', rotulo: 'Início', icone: 'i-lucide-house' },
  { para: '/minha-vaga', rotulo: 'Minha vaga', icone: 'i-lucide-car' },
  { para: '/ajustes', rotulo: 'Ajustes', icone: 'i-lucide-settings' },
]

/** Minha vaga inclui Registrar vaga e Voltar até o carro; o Início inclui o Mapa e o Detalhe da rua. */
function ativo(para: string) {
  if (para === '/minha-vaga') return route.path.startsWith('/minha-vaga')
  if (para === '/ajustes') return route.path === '/ajustes'
  return !route.path.startsWith('/minha-vaga') && route.path !== '/ajustes'
}

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
  <aside class="lateral" aria-label="Parô">
    <!-- PROVISÓRIO: nome em texto até os arquivos do logotipo entrarem no repositório. -->
    <p class="marca">Parô</p>

    <nav class="navegacao" aria-label="Navegação principal">
      <NuxtLink
        v-for="item in navegacao"
        :key="item.para"
        :to="item.para"
        class="item"
        :class="{ ativo: ativo(item.para) }"
        :aria-current="ativo(item.para) ? 'page' : undefined"
      >
        <UIcon :name="item.icone" class="icone" aria-hidden="true" />
        <span>{{ item.rotulo }}</span>
      </NuxtLink>
    </nav>

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
  </aside>

  <!-- Centro: mapa da área. Voltar até o carro abre aqui, no lugar dele. -->
  <div v-if="props.painel !== 'centro'" class="centro" :class="{ 'com-painel': props.painel === 'direita' }">
    <MapaDaArea ref="mapa" class="mapa" :ruas="ruasNoMapa" @selecionar-rua="abrirRua" />

    <div class="controles">
      <button type="button" class="botao-icone" aria-label="Centralizar nas ruas cobertas" @click="mapa?.centralizar()">
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
/* Barra lateral de 280 px, com rolagem própria. */
.lateral {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  width: var(--paro-largura-lateral);
  padding: var(--paro-esp-8) var(--paro-esp-6);
  overflow-y: auto;
  background: var(--paro-fundo);
  border-right: 1px solid var(--paro-borda);
}

/* Figtree 22 px, o tamanho de --paro-texto-stat. */
.marca {
  font-size: var(--paro-texto-stat);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.navegacao {
  display: grid;
  gap: var(--paro-esp-1);
  margin-top: var(--paro-esp-6);
}

/* Item com ícone e rótulo; o ativo segue a aba ativa da barra de abas. */
.item {
  display: flex;
  align-items: center;
  gap: var(--paro-esp-3);
  min-height: var(--paro-alvo-de-toque);
  padding: 0 var(--paro-esp-3);
  font-size: var(--paro-texto-interface);
  font-weight: 500;
  color: var(--paro-texto-fraco);
  border-radius: var(--paro-raio-linha);
}

.item:hover {
  color: var(--paro-texto);
}

.item.ativo {
  color: var(--paro-destaque-texto);
  background: var(--paro-destaque);
}

.icone {
  flex: none;
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
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

/* Centro: o mapa ocupa o espaço entre a barra lateral e o painel da direita. */
.centro {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: var(--paro-largura-lateral);
}

.centro.com-painel {
  right: var(--paro-largura-painel);
}

.mapa {
  position: absolute;
  inset: 0;
}

/* Botão de ícone (design system, "Botões"), no canto direito do mapa. */
.controles {
  position: absolute;
  top: var(--paro-margem);
  right: var(--paro-margem);
  z-index: 2;
  display: grid;
  gap: var(--paro-esp-2);
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
