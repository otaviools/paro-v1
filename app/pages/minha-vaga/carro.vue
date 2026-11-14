<!--
  Voltar até o carro (referência Rivian; etiqueta sobre o mapa da Lime): o
  Mapa da área com o ponto do carro, a posição atual e a distância em linha
  reta, sem calcular rota (ADR 0020). O ponto do carro vem só dos Dados do
  celular (ADR 0003). A posição atual é lida uma vez ao abrir a tela e de novo
  só quando a pessoa toca em "Atualizar minha posição"; nunca é acompanhada
  (ADR 0010), nem guardada, nem enviada. Com a localização desligada em
  Ajustes, a posição atual não é lida e o mapa mostra só o ponto do carro.
  A barra de abas some nesta tela.
-->
<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import type { Ponto, RegistroNoCelular } from '~/dados-do-celular'
import type { RuaNoMapa } from '~/components/MapaDaArea.vue'

// No desktop, abre no centro, no lugar do mapa da área.
definePageMeta({ semBarraDeAbas: true, painelDesktop: 'centro' })

const router = useRouter()

/** Noite de agora; lida no navegador, para saber se o registro ainda vale. */
const { data: agora, error: erroDoAgora } = useFetch<RespostaDeAgora>('/api/agora', { key: 'agora-carro', server: false })

/** O mapa desta tela mostra só o carro e a posição atual, sem as ruas cobertas. */
const semRuas: RuaNoMapa[] = []

const registro = ref<RegistroNoCelular | null>(null)
const pontoDoCarro = ref<Ponto | null>(null)
const lido = ref(false)
/** A posição atual só é lida com a forma de colaborar "localização ligada". */
const localizacaoLigada = ref(false)

// --- Posição atual -------------------------------------------------------------

const posicaoAtual = ref<Ponto | null>(null)
const localizando = ref(false)
const erroDaPosicao = ref<string | null>(null)

async function atualizarPosicao() {
  if (localizando.value) return
  localizando.value = true
  const leitura = await lerLocalizacao()
  localizando.value = false
  if (leitura.tipo === 'lida') {
    posicaoAtual.value = leitura.ponto
    erroDaPosicao.value = null
    return
  }
  erroDaPosicao.value = leitura.tipo === 'negada'
    ? 'A localização não foi liberada, então o mapa mostra só o ponto do carro.'
    : 'Não foi possível ler a sua posição agora. O mapa mostra só o ponto do carro.'
}

watch(agora, (valor) => {
  if (!valor) return
  const dados = dadosDoCelularDoAparelho()
  registro.value = dados.registroAtual(valor.noite)
  pontoDoCarro.value = dados.pontoDoCarro(valor.noite)
  localizacaoLigada.value = dados.formaDeColaborar() === 'localizacao-ligada'
  lido.value = true
  if (pontoDoCarro.value && localizacaoLigada.value) atualizarPosicao()
}, { immediate: true })

const distancia = computed(() =>
  pontoDoCarro.value && posicaoAtual.value
    ? distanciaEmLinhaRetaTexto(distanciaEmLinhaReta(posicaoAtual.value, pontoDoCarro.value))
    : null,
)

/** Volta para a tela anterior; aberto direto pelo link, vai para o Início. */
function voltar() {
  if (window.history.state?.back) router.back()
  else navigateTo('/')
}
</script>

<template>
  <main class="tela">
    <MapaDaArea
      v-if="pontoDoCarro"
      class="mapa"
      :ruas="semRuas"
      :ponto-do-carro="pontoDoCarro"
      :posicao-atual="posicaoAtual"
      :etiqueta-do-carro="distancia"
    />

    <button
      type="button"
      class="botao-icone voltar"
      aria-label="Voltar"
      @click="voltar"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="icone"
        aria-hidden="true"
      />
    </button>

    <section
      class="painel"
      aria-labelledby="titulo-carro"
    >
      <h1
        id="titulo-carro"
        class="titulo"
      >
        Voltar até o carro
      </h1>

      <div
        v-if="!lido && !erroDoAgora"
        class="esqueleto"
        aria-busy="true"
        aria-label="Carregando"
      />

      <p
        v-else-if="erroDoAgora"
        class="linha"
      >
        Não foi possível carregar agora. Tente de novo em instantes.
      </p>

      <template v-else-if="registro && pontoDoCarro">
        <p class="rua">
          {{ registro.ruaCoberta.nome }}
        </p>
        <p class="linha">
          Chegada: {{ rotuloDaFaixaHoraria(registro.chegada) }}
        </p>
        <template v-if="!localizacaoLigada">
          <p class="linha">
            A localização está desligada em Ajustes, então o mapa mostra só o ponto do carro.
          </p>
          <NuxtLink
            to="/ajustes"
            class="principal"
          >Abrir Ajustes</NuxtLink>
        </template>
        <template v-else>
          <p
            v-if="distancia"
            class="linha"
            role="status"
          >
            <UIcon
              name="i-lucide-footprints"
              class="icone-pequeno"
              aria-hidden="true"
            />
            Você está a {{ distancia }} do carro.
          </p>
          <p
            v-else-if="erroDaPosicao"
            class="erro"
            role="alert"
          >
            <UIcon
              name="i-lucide-circle-alert"
              class="icone-pequeno"
              aria-hidden="true"
            />
            {{ erroDaPosicao }}
          </p>

          <button
            type="button"
            class="principal"
            :aria-busy="localizando"
            @click="atualizarPosicao"
          >
            <UIcon
              v-if="localizando"
              name="i-lucide-loader-circle"
              class="carregando"
              aria-label="Lendo a sua posição"
            />
            <template v-else>
              Atualizar minha posição
            </template>
          </button>
        </template>
      </template>

      <template v-else-if="!registro">
        <p class="linha">
          Nenhum registro de vaga aberto nesta noite.
        </p>
        <NuxtLink
          to="/minha-vaga"
          class="principal"
        >Ver minha vaga</NuxtLink>
      </template>

      <template v-else>
        <p class="linha">
          Este registro de vaga não tem o ponto do carro. O ponto só fica guardado no celular quando a vaga é
          registrada com a localização.
        </p>
        <NuxtLink
          to="/minha-vaga"
          class="principal"
        >Ver minha vaga</NuxtLink>
      </template>
    </section>
  </main>
</template>

<style scoped>
/* Mapa em tela cheia; o painel fica por cima, no rodapé (referência Rivian). */
.tela {
  position: fixed;
  inset: 0;
  background: var(--paro-mapa-fundo);
}

.mapa {
  position: absolute;
  inset: 0;
  /* O painel cobre o rodapé do mapa. */
  --mapa-margem-superior: var(--paro-esp-12);
  --mapa-margem-inferior: calc(var(--paro-esp-16) * 3);
}

/* Botão de ícone (design system, "Botões"), no topo esquerdo. */
.botao-icone {
  display: grid;
  place-items: center;
  width: calc(var(--paro-esp-8) + var(--paro-esp-2));
  height: calc(var(--paro-esp-8) + var(--paro-esp-2));
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-botao);
  cursor: pointer;
}

.voltar {
  position: absolute;
  top: calc(var(--paro-esp-3) + env(safe-area-inset-top));
  left: var(--paro-margem);
  z-index: 2;
}

.icone {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
}

.icone-pequeno {
  flex: none;
  width: var(--paro-esp-4);
  height: var(--paro-esp-4);
  margin-top: 0.1em;
}

/* Painel no rodapé, como a gaveta sobre o mapa: raio de 16 px no topo. */
.painel {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  display: grid;
  gap: var(--paro-esp-2);
  max-width: var(--paro-largura-conteudo);
  margin: 0 auto;
  padding: var(--paro-esp-6) var(--paro-margem) calc(var(--paro-esp-3) + env(safe-area-inset-bottom));
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-bottom: 0;
  border-radius: var(--paro-raio-card) var(--paro-raio-card) 0 0;
}

@media (prefers-reduced-motion: no-preference) {
  .painel {
    animation: entrar 250ms cubic-bezier(0.16, 1, 0.3, 1);
  }
}

@keyframes entrar {
  from { opacity: 0; transform: translateY(var(--paro-esp-2)); }
  to { opacity: 1; transform: translateY(0); }
}

.titulo {
  font-size: var(--paro-texto-titulo);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.rua {
  font-size: var(--paro-texto-corpo);
  font-weight: 600;
}

.linha {
  display: flex;
  align-items: flex-start;
  gap: var(--paro-esp-2);
  max-width: 70ch;
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto-fraco);
}

/* Erro em texto de perigo, com ícone, nunca só cor (design system, "Formulários"). */
.erro {
  display: flex;
  align-items: flex-start;
  gap: var(--paro-esp-2);
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  color: var(--paro-perigo-texto);
}

.esqueleto {
  height: var(--paro-esp-16);
  background: var(--paro-superficie-suave);
  border-radius: var(--paro-raio-linha);
}

/* Botão principal (design system, "Botões"), embaixo do painel. */
.principal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(var(--paro-esp-12) + var(--paro-esp-1));
  margin-top: var(--paro-esp-3);
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

.carregando {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
  animation: girar 1s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

@media (min-width: 1024px) {
  .botao-icone {
    width: calc(var(--paro-esp-8) + var(--paro-esp-1));
    height: calc(var(--paro-esp-8) + var(--paro-esp-1));
  }

  .principal {
    height: calc(var(--paro-esp-8) + var(--paro-esp-3));
  }

  .painel {
    bottom: var(--paro-margem);
    border-bottom: 1px solid var(--paro-borda);
    border-radius: var(--paro-raio-card);
  }
}
</style>
