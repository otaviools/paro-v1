<!--
  Ajustes (referências Grok, Waymo e Pangea): rotina, forma de colaborar em
  linhas com seletor, a sugestão de rua, o aviso de privacidade e "Apagar
  histórico" no fim da lista, sempre com confirmação. Rotina e forma de
  colaborar ficam só no celular (ADRs 0004, 0010 e 0015); a sugestão de rua
  vai ao servidor só com o texto (ADR 0013).
-->
<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import type { DadosDoCelular, FormaDeColaborar } from '~/dados-do-celular'

// No desktop, abre no painel da direita, com o mapa ao lado e margem de 24 px (lg:px-6).
definePageMeta({ painelDesktop: 'direita' })

const { data: faixasHorarias } = await useFaixasHorarias()
/** Noite de agora; lida no navegador, para saber se há um registro de vaga aberto. */
const { lerNoite } = useAgora()

/** A rotina e a forma de colaborar ficam só no celular: são lidas e guardadas no navegador. */
let dados: DadosDoCelular | undefined
const rotina = ref<string | null>(null)
const forma = ref<FormaDeColaborar>('nenhuma')

onMounted(() => {
  dados = dadosDoCelularDoAparelho()
  rotina.value = dados.rotina()
  forma.value = dados.formaDeColaborar()
})

function escolher(faixaHoraria: string | null) {
  dados?.definirRotina(faixaHoraria)
  rotina.value = faixaHoraria
}

// --- Forma de colaborar (ADR 0010) ---------------------------------------------

function mudarForma(nova: FormaDeColaborar) {
  dados?.definirFormaDeColaborar(nova)
  forma.value = nova
}

/** Ligar o registro de vaga começa no manual: a localização continua desligada. */
function mudarRegistro(ligado: boolean) {
  mudarForma(ligado ? 'manual' : 'nenhuma')
}

function mudarLocalizacao(ligada: boolean) {
  mudarForma(ligada ? 'localizacao-ligada' : 'manual')
}

// --- Sugestão de rua (ADR 0013) -----------------------------------------------

const sugestao = ref<{ abrir: () => void, fechar: () => void }>()
const formularioDeSugestao = ref<{ limpar: () => void }>()

function sugestaoEnviada() {
  sugestao.value?.fechar()
  avisar('Sugestão enviada para a equipe.')
}

// --- Privacidade e Apagar histórico ---------------------------------------------

const privacidade = ref<{ abrir: () => void }>()
/** Confirmação de "Apagar histórico" (UModal). */
const confirmacaoAberta = ref(false)
/** Registro de vaga aberto nesta noite: sem o código, não dá mais para tocar em "Saí" (ADR 0014). */
const temRegistroAberto = ref(false)

const { avisar } = useAvisoFlutuanteStore()

/**
 * Sem a noite de agora (ainda carregando ou sem conexão), não dá para saber
 * se o registro guardado ainda vale: o aviso aparece por precaução.
 */
async function pedirConfirmacao() {
  dados ??= dadosDoCelularDoAparelho()
  const noite = await lerNoite()
  temRegistroAberto.value = noite ? dados.registroAtual(noite) !== null : true
  confirmacaoAberta.value = true
}

function apagarHistorico() {
  dados ??= dadosDoCelularDoAparelho()
  dados.apagarHistorico()
  rotina.value = null
  confirmacaoAberta.value = false
  avisar('Histórico apagado deste celular.')
}
</script>

<template>
  <main class="mx-auto max-w-160 px-5 py-8 lg:px-6">
    <h1 class="text-2xl font-bold leading-tight tracking-tight">
      Ajustes
    </h1>

    <section
      class="mt-8"
      aria-labelledby="titulo-rotina"
    >
      <h2
        id="titulo-rotina"
        class="text-xs font-semibold uppercase tracking-wider text-muted"
      >
        Rotina
      </h2>

      <UCard
        class="mt-3"
        :ui="{ body: 'grid gap-2' }"
      >
        <h3
          id="nome-rotina"
          class="text-base font-semibold leading-tight"
        >
          Horário de chegada habitual
        </h3>
        <p class="max-w-[70ch] text-xs text-muted">
          O Parô abre na faixa horária em que você costuma chegar. Sem rotina, abre em Agora.
          Fica guardada só neste celular.
        </p>

        <div
          class="mt-2 flex flex-wrap gap-2"
          role="radiogroup"
          aria-labelledby="nome-rotina"
        >
          <ChipDeFaixaHoraria
            role="radio"
            :ativo="rotina === null"
            :aria-checked="rotina === null"
            @click="escolher(null)"
          >
            Sem rotina
          </ChipDeFaixaHoraria>
          <ChipDeFaixaHoraria
            v-for="faixaHoraria in faixasHorarias"
            :key="faixaHoraria"
            role="radio"
            :ativo="rotina === faixaHoraria"
            :aria-checked="rotina === faixaHoraria"
            @click="escolher(faixaHoraria)"
          >
            {{ rotuloDaFaixaHoraria(faixaHoraria) }}
          </ChipDeFaixaHoraria>
        </div>
      </UCard>
    </section>

    <section
      class="mt-8"
      aria-labelledby="titulo-forma"
    >
      <h2
        id="titulo-forma"
        class="text-xs font-semibold uppercase tracking-wider text-muted"
      >
        Forma de colaborar
      </h2>

      <!-- Linhas do mesmo card separadas por border-default (referência Waymo). -->
      <UCard class="mt-3">
        <LinhaComSeletor
          titulo="Registrar vagas"
          explicacao="Ao estacionar, registre a vaga com a saída prevista para avisar quem está chegando. Desligado, o registro de vaga não aparece."
          icone="i-lucide-car"
          :ligado="forma !== 'nenhuma'"
          @mudar="mudarRegistro"
        />
        <LinhaComSeletor
          v-if="forma !== 'nenhuma'"
          class="mt-4 border-t border-default pt-4"
          titulo="Usar localização"
          explicacao="Ao registrar, o celular lê a sua posição uma vez e propõe a rua coberta mais próxima. Desligada, você escolhe a rua numa lista e o Parô não lê a localização. A permissão do navegador se tira nos ajustes dele."
          icone="i-lucide-locate"
          :ligado="forma === 'localizacao-ligada'"
          @mudar="mudarLocalizacao"
        />
      </UCard>
    </section>

    <section
      class="mt-8"
      aria-labelledby="titulo-sugestao"
    >
      <h2
        id="titulo-sugestao"
        class="text-xs font-semibold uppercase tracking-wider text-muted"
      >
        Sugestão de rua
      </h2>

      <!-- Linha com ícone, rótulo e seta (referência Waymo). -->
      <UCard
        class="mt-3"
        :ui="{ body: 'py-1 sm:py-2' }"
      >
        <UButton
          color="neutral"
          variant="link"
          block
          icon="i-lucide-map-pin-plus"
          trailing-icon="i-lucide-chevron-right"
          label="Sugerir rua ou trecho"
          aria-haspopup="dialog"
          class="min-h-11 gap-3 px-0 text-sm text-default hover:text-default active:text-default"
          :ui="{ leadingIcon: 'size-5', trailingIcon: 'ms-auto size-5' }"
          @click="sugestao?.abrir()"
        />
      </UCard>
    </section>

    <section
      class="mt-8"
      aria-labelledby="titulo-privacidade"
    >
      <h2
        id="titulo-privacidade"
        class="text-xs font-semibold uppercase tracking-wider text-muted"
      >
        Privacidade
      </h2>

      <UCard
        class="mt-3"
        :ui="{ body: 'py-1 sm:py-2' }"
      >
        <UButton
          color="neutral"
          variant="link"
          block
          icon="i-lucide-shield"
          trailing-icon="i-lucide-chevron-right"
          label="Como o Parô trata os seus dados"
          aria-haspopup="dialog"
          class="min-h-11 gap-3 px-0 text-sm text-default hover:text-default active:text-default"
          :ui="{ leadingIcon: 'size-5', trailingIcon: 'ms-auto size-5' }"
          @click="privacidade?.abrir()"
        />
      </UCard>

      <!-- Ação de apagar no fim da lista (referência Grok); sempre com confirmação. -->
      <div class="mt-6 grid gap-1">
        <UButton
          color="error"
          variant="link"
          icon="i-lucide-trash-2"
          label="Apagar histórico"
          aria-haspopup="dialog"
          class="min-h-11 justify-self-start px-0 text-sm"
          @click="pedirConfirmacao"
        />
        <p class="max-w-[70ch] text-xs text-muted">
          Limpa deste celular a rotina, o registro de vaga com o código e o ponto do carro.
        </p>
      </div>
    </section>

    <Gaveta
      ref="sugestao"
      titulo="Sugerir rua ou trecho"
      @fechada="formularioDeSugestao?.limpar()"
    >
      <FormularioDeSugestao
        ref="formularioDeSugestao"
        @enviada="sugestaoEnviada"
      />
    </Gaveta>

    <Gaveta
      ref="privacidade"
      titulo="Como o Parô trata os seus dados"
    >
      <AvisoDePrivacidade />
    </Gaveta>

    <!-- Confirmação (UModal), acima da barra de abas (z-10), como as gavetas. -->
    <UModal
      v-model:open="confirmacaoAberta"
      title="Apagar histórico?"
      :close="{ color: 'neutral', variant: 'outline', square: true, class: 'size-10 justify-center lg:size-9' }"
      :ui="{
        overlay: 'z-40',
        content: 'z-50 divide-y-0 rounded-paro-lg bg-elevated ring-default',
        title: 'text-base font-semibold text-default',
        body: 'grid gap-4 py-0 sm:py-0',
        footer: 'grid grid-cols-2 gap-2',
      }"
    >
      <template #body>
        <p class="max-w-[70ch] text-sm">
          Apaga deste celular a rotina, o registro de vaga com o código e o ponto do carro. Não dá para desfazer.
          A forma de colaborar continua como está.
        </p>

        <UAlert
          v-if="temRegistroAberto"
          role="alert"
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          :ui="{ description: 'grid gap-2 text-xs font-medium' }"
        >
          <template #description>
            <p>
              Se você tem um registro de vaga aberto nesta noite: sem o código, não dá mais para mudar a saída prevista
              nem tocar em "Saí", e a sua saída prevista continua contando para quem está chegando até o fim da noite.
            </p>
            <NuxtLink
              to="/minha-vaga"
              class="font-semibold underline"
              @click="confirmacaoAberta = false"
            >
              Tocar em "Saí" antes, em Minha vaga
            </NuxtLink>
          </template>
        </UAlert>
      </template>

      <template #footer>
        <UButton
          color="primary"
          variant="link"
          block
          label="Cancelar"
          class="min-h-13 text-sm"
          @click="confirmacaoAberta = false"
        />
        <UButton
          color="neutral"
          variant="outline"
          block
          icon="i-lucide-trash-2"
          label="Apagar"
          class="min-h-13 text-sm text-error"
          @click="apagarHistorico"
        />
      </template>
    </UModal>
  </main>
</template>
