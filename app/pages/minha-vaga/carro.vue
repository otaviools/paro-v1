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
const { agora, erro: erroDoAgora } = useAgora()

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
  <main class="fixed inset-0 bg-(--paro-mapa-fundo)">
    <!-- Mapa em tela cheia; o painel fica por cima, no rodapé (referência Rivian). -->
    <!-- O painel cobre o rodapé do mapa. -->
    <MapaDaArea
      v-if="pontoDoCarro"
      class="absolute inset-0 [--mapa-margem-inferior:--spacing(48)] [--mapa-margem-superior:--spacing(12)]"
      :ruas="semRuas"
      :ponto-do-carro="pontoDoCarro"
      :posicao-atual="posicaoAtual"
      :etiqueta-do-carro="distancia"
    />

    <!-- Botão de ícone (design system, "Botões"), no topo esquerdo. -->
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-arrow-left"
      class="absolute top-[calc(--spacing(3)+env(safe-area-inset-top))] left-5 z-2 size-10 justify-center lg:left-8 lg:size-9"
      aria-label="Voltar"
      @click="voltar"
    />

    <!--
      Painel no rodapé, como a gaveta sobre o mapa: raio de 24 px no topo. No
      desktop, flutua acima do rodapé, com os quatro cantos arredondados.
    -->
    <section
      class="absolute inset-x-0 bottom-0 z-2 mx-auto grid max-w-160 gap-2 rounded-t-paro-lg border border-b-0 border-default bg-elevated px-5 pt-6 pb-[calc(--spacing(3)+env(safe-area-inset-bottom))] motion-safe:transition-[opacity,translate] motion-safe:duration-250 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:starting:translate-y-2 motion-safe:starting:opacity-0 lg:bottom-8 lg:rounded-paro-lg lg:border-b lg:px-8"
      aria-labelledby="titulo-carro"
    >
      <h1
        id="titulo-carro"
        class="text-2xl font-bold leading-tight tracking-tight"
      >
        Voltar até o carro
      </h1>

      <div
        v-if="!lido && !erroDoAgora"
        class="h-16 rounded-paro-md bg-muted"
        aria-busy="true"
        aria-label="Carregando"
      />

      <p
        v-else-if="erroDoAgora"
        class="max-w-[70ch] text-xs font-medium text-muted"
      >
        Não foi possível carregar agora. Tente de novo em instantes.
      </p>

      <template v-else-if="registro && pontoDoCarro">
        <p class="text-sm font-semibold">
          {{ registro.ruaCoberta.nome }}
        </p>
        <p class="text-xs font-medium tabular-nums text-muted">
          Chegada: {{ rotuloDaFaixaHoraria(registro.chegada) }}
        </p>
        <template v-if="!localizacaoLigada">
          <p class="max-w-[70ch] text-xs font-medium text-muted">
            A localização está desligada em Ajustes, então o mapa mostra só o ponto do carro.
          </p>
          <UButton
            to="/ajustes"
            color="neutral"
            size="xl"
            block
            class="mt-3 h-13 text-lg lg:h-11"
            label="Abrir Ajustes"
          />
        </template>
        <template v-else>
          <p
            v-if="distancia"
            class="flex max-w-[70ch] items-start gap-2 text-xs font-medium tabular-nums text-muted"
            role="status"
          >
            <UIcon
              name="i-lucide-footprints"
              class="mt-px size-4 shrink-0"
              aria-hidden="true"
            />
            Você está a {{ distancia }} do carro.
          </p>
          <p
            v-else-if="erroDaPosicao"
            class="flex max-w-[70ch] items-start gap-2 text-xs font-medium text-error"
            role="alert"
          >
            <UIcon
              name="i-lucide-circle-alert"
              class="mt-px size-4 shrink-0"
              aria-hidden="true"
            />
            {{ erroDaPosicao }}
          </p>

          <UButton
            color="neutral"
            size="xl"
            block
            class="mt-3 h-13 text-lg lg:h-11"
            :loading="localizando"
            :label="localizando ? undefined : 'Atualizar minha posição'"
            :aria-label="localizando ? 'Lendo a sua posição' : undefined"
            :aria-busy="localizando"
            @click="atualizarPosicao"
          />
        </template>
      </template>

      <template v-else-if="!registro">
        <p class="max-w-[70ch] text-xs font-medium text-muted">
          Nenhum registro de vaga aberto nesta noite.
        </p>
        <UButton
          to="/minha-vaga"
          color="neutral"
          size="xl"
          block
          class="mt-3 h-13 text-lg lg:h-11"
          label="Ver minha vaga"
        />
      </template>

      <template v-else>
        <p class="max-w-[70ch] text-xs font-medium text-muted">
          Este registro de vaga não tem o ponto do carro. O ponto só fica guardado no celular quando a vaga é
          registrada com a localização.
        </p>
        <UButton
          to="/minha-vaga"
          color="neutral"
          size="xl"
          block
          class="mt-3 h-13 text-lg lg:h-11"
          label="Ver minha vaga"
        />
      </template>
    </section>
  </main>
</template>
