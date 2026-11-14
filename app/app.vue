<script setup lang="ts">
const route = useRoute()

// --- Painel desktop (design system, "Padrões de navegação › Desktop") ---------
//
// A partir de 1024 px, o app vira o painel de três colunas. O PainelDesktop
// monta a barra lateral e o mapa; a página da rota fica sempre aqui, no mesmo
// <NuxtPage />, que vira o painel da direita (ou o centro, em Voltar até o
// carro). A página declara onde abre com `painelDesktop` no definePageMeta;
// sem isso, o painel da direita fica fechado. A Primeira visita e as telas da
// equipe (`foraDoPainelDesktop`) continuam como no celular.

const desktop = useDesktop()

onMounted(() => {
  const consulta = window.matchMedia(CONSULTA_DO_DESKTOP)
  desktop.value = consulta.matches
  consulta.addEventListener('change', (evento) => { desktop.value = evento.matches })
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
  if (document.querySelector('dialog[open]')) return
  // Em campo de texto, o Esc é do campo; não fecha o painel no meio do que a pessoa escreve.
  const alvo = evento.target as HTMLElement | null
  if (alvo?.closest('input, textarea, select, [contenteditable="true"]')) return
  fecharPainel()
}
</script>

<template>
  <UApp>
    <PainelDesktop v-if="desktop && noPainelDesktop" :painel="painel" />
    <div
      class="conteudo"
      :class="noPainelDesktop && {
        'painel-direita': painel === 'direita',
        'painel-centro': painel === 'centro',
        'painel-fechado': !painel,
      }"
    >
      <!-- Só aparece no desktop, com o painel da direita aberto. -->
      <header v-if="noPainelDesktop && painel === 'direita'" class="topo-do-painel">
        <button type="button" class="fechar" aria-label="Fechar painel" @click="fecharPainel">
          <UIcon name="i-lucide-x" class="icone" aria-hidden="true" />
        </button>
      </header>
      <div class="rolagem">
        <NuxtPage />
      </div>
    </div>
    <!-- Telas que abrem por cima (Detalhe da rua) escondem a barra de abas; no desktop ela não existe. -->
    <BarraDeAbas v-if="!route.meta.semBarraDeAbas" />
    <AvisoFlutuante />
  </UApp>
</template>

<style scoped>
/*
 * Espaço para a barra de abas flutuante, ou para a ação principal fixa no
 * rodapé, não cobrir o fim da página.
 */
.conteudo {
  padding-bottom: calc(var(--paro-esp-16) + var(--paro-esp-3) + env(safe-area-inset-bottom));
}

.topo-do-painel {
  display: none;
}

@media (min-width: 1024px) {
  /* Painel fechado: só a barra lateral e o mapa. */
  .painel-fechado {
    display: none;
  }

  /*
   * Painel da direita de 360 px. O `contain: layout` faz dos elementos fixos
   * da página (a ação principal no rodapé) filhos do painel, e não da janela.
   * A margem lateral do painel é de 24 px, como a da barra lateral.
   */
  .painel-direita {
    --paro-margem: var(--paro-esp-6);

    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    width: var(--paro-largura-painel);
    padding-bottom: 0;
    background: var(--paro-fundo);
    border-left: 1px solid var(--paro-borda);
    contain: layout;
  }

  .painel-direita .rolagem {
    padding-bottom: calc(var(--paro-esp-16) + var(--paro-esp-3));
    overflow-y: auto;
  }

  .topo-do-painel {
    display: flex;
    justify-content: flex-end;
    padding: var(--paro-esp-4) var(--paro-margem) 0;
  }

  /* Voltar até o carro: no centro, no lugar do mapa da área. */
  .painel-centro {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: var(--paro-largura-lateral);
    padding-bottom: 0;
    contain: layout;
  }
}

/* Botão de ícone (design system, "Botões"), 36 px no desktop. */
.fechar {
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

.icone {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
}
</style>
