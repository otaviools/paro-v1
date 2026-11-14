<!--
  Minha vaga. Com um registro de vaga aberto nesta noite, mostra Seu registro de vaga
  (referências Waymo e Lime): card com a saída prevista como título, a rua
  coberta e a linha de ações com "Mudar saída" e, no registro com localização
  ligada, "Voltar até o carro"; "Saí" fixo no rodapé. Sem registro, leva para
  Registrar vaga; com a forma de colaborar "nenhuma", o registro de vaga está
  desligado e a tela leva para Ajustes (ADR 0010). Um registro aberto continua
  com "Saí" mesmo depois de desligar a colaboração.
-->
<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import type { DadosDoCelular, FormaDeColaborar, RegistroNoCelular } from '~/dados-do-celular'

// No desktop, abre no painel da direita, com o mapa ao lado.
definePageMeta({ painelDesktop: 'direita' })

/** Noite e faixa horária de agora; lidas no navegador, na hora de abrir a tela. */
const { agora, erro: erroDoAgora } = useAgora()
const { data: faixasHorarias } = useFaixasHorarias()
const { alterarSaida, encerrar } = useRegistroDeVaga()

let dados: DadosDoCelular | undefined
const registro = ref<RegistroNoCelular | null>(null)
/** Só o registro com localização ligada tem ponto do carro (ADR 0003). */
const temPontoDoCarro = ref(false)
const lido = ref(false)
const forma = ref<FormaDeColaborar>('nenhuma')

// O registro guardado só vale na noite em que foi feito (ADR 0014).
watch(agora, (valor) => {
  if (!valor) return
  dados ??= dadosDoCelularDoAparelho()
  registro.value = dados.registroAtual(valor.noite)
  temPontoDoCarro.value = dados.pontoDoCarro(valor.noite) !== null
  forma.value = dados.formaDeColaborar()
  lido.value = true
}, { immediate: true })

/** Confirmação de registro, mostrada uma vez depois de Registrar vaga. */
const confirmacaoDeRegistro = useConfirmacaoDeRegistroStore()
const confirmarRegistro = ref(false)
onMounted(() => {
  confirmarRegistro.value = confirmacaoDeRegistro.consumir()
})

const { avisar } = useAvisoFlutuanteStore()

/** O servidor recusou o código: o registro foi encerrado ou é de outra noite. */
function esquecerRegistro() {
  dados?.apagarRegistro()
  registro.value = null
  temPontoDoCarro.value = false
  confirmarRegistro.value = false
  avisar('Este registro não vale mais nesta noite. Registre a vaga de novo se precisar.')
}

// --- Mudar saída -------------------------------------------------------------

const gaveta = ref<{ abrir: () => void, fechar: () => void }>()
const mudandoSaida = ref(false)

/** A saída prevista pode ir da faixa horária de agora (ou da chegada) até 22h30. */
const grupos = computed(() => {
  if (!registro.value) return []
  const agoraFaixa = agora.value?.faixaHoraria ?? registro.value.chegada
  const aPartirDe = agoraFaixa > registro.value.chegada ? agoraFaixa : registro.value.chegada
  return gruposDaSaidaPrevista(faixasHorarias.value ?? [], aPartirDe)
})

async function mudarSaida(saidaPrevista: string) {
  if (!registro.value || mudandoSaida.value) return
  mudandoSaida.value = true
  try {
    const resultado = await alterarSaida(registro.value.codigo, saidaPrevista)
    gaveta.value?.fechar()
    if (resultado === 'registro-invalido') return esquecerRegistro()
    if (resultado === 'falha') return avisar('Não foi possível mudar a saída agora. Tente de novo em instantes.')
    dados?.mudarSaidaDoRegistro(saidaPrevista)
    if (registro.value) registro.value = { ...registro.value, saidaPrevista: saidaPrevista }
    avisar(`Saída prevista mudada para ${rotuloDaFaixaHoraria(saidaPrevista)}.`)
  }
  catch {
    gaveta.value?.fechar()
    avisar('Não foi possível mudar a saída agora. Tente de novo em instantes.')
  }
  finally {
    mudandoSaida.value = false
  }
}

// --- Saí -----------------------------------------------------------------------

const saindo = ref(false)

async function sair() {
  if (!registro.value || saindo.value) return
  saindo.value = true
  // Código recusado conta como encerrado: o registro já não conta, então o "Saí" vale do mesmo jeito.
  if (await encerrar(registro.value.codigo) === 'falha') {
    saindo.value = false
    avisar('Não foi possível avisar a saída agora. Tente de novo em instantes.')
    return
  }
  dados?.apagarRegistro()
  avisar('Saída registrada. Obrigado por avisar quem está chegando.')
  await navigateTo('/')
}
</script>

<template>
  <main class="mx-auto max-w-160 px-5 pt-8 pb-24 lg:px-6 lg:pb-8">
    <!-- Espaço extra no fim para a ação principal, que fica acima da barra de abas; no desktop, não há barra. -->
    <h1 class="text-2xl font-bold leading-tight tracking-tight">
      Minha vaga
    </h1>

    <div
      v-if="!lido && !erroDoAgora"
      class="mt-6 h-44 rounded-paro-lg bg-muted"
      aria-busy="true"
      aria-label="Carregando"
    />

    <UAlert
      v-else-if="erroDoAgora"
      class="mt-6"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Erro ao carregar"
      description="Não foi possível carregar agora. Tente de novo em instantes."
      :ui="{ title: 'text-sm', description: 'text-sm' }"
    />

    <template v-else-if="registro">
      <!-- Aviso com o sinal de sucesso (confirmação de registro). -->
      <UAlert
        v-if="confirmarRegistro"
        role="status"
        class="mt-6"
        color="success"
        variant="soft"
        icon="i-lucide-circle-check"
        description="Vaga registrada. Quem está chegando já vê a sua saída prevista no detalhe da rua."
        :ui="{ description: 'text-xs font-medium' }"
      />

      <!-- Card Seu registro de vaga (design system, "Cards"; referência Waymo). -->
      <UCard
        as="section"
        aria-labelledby="titulo-vaga"
        :class="confirmarRegistro ? 'mt-3' : 'mt-6'"
        :ui="{ body: 'grid gap-1' }"
      >
        <p class="text-xs font-semibold uppercase tracking-wider text-muted">
          Seu registro de vaga
        </p>
        <h2
          id="titulo-vaga"
          class="mt-1 text-xl font-bold leading-tight tabular-nums"
        >
          Saída prevista: {{ rotuloDaFaixaHoraria(registro.saidaPrevista) }}
        </h2>
        <p class="text-sm font-semibold">
          {{ registro.ruaCoberta.nome }}
        </p>
        <p class="text-xs font-medium tabular-nums text-muted">
          Chegada: {{ rotuloDaFaixaHoraria(registro.chegada) }}
        </p>

        <!-- Linha de ações com ícone e rótulo, separada por uma borda. -->
        <div class="mt-3 flex flex-wrap gap-2 border-t border-default pt-3">
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            class="min-h-11 font-medium"
            icon="i-lucide-clock"
            label="Mudar saída"
            aria-haspopup="dialog"
            :ui="{ leadingIcon: 'size-4' }"
            @click="gaveta?.abrir()"
          />
          <UButton
            v-if="temPontoDoCarro"
            to="/minha-vaga/carro"
            color="neutral"
            variant="outline"
            size="lg"
            class="min-h-11 font-medium"
            icon="i-lucide-map-pin"
            label="Voltar até o carro"
            :ui="{ leadingIcon: 'size-4' }"
          />
        </div>
      </UCard>

      <!-- Ação principal fixa, logo acima da barra de abas flutuante; no desktop, no rodapé do painel. -->
      <footer class="fixed inset-x-0 bottom-[calc(--spacing(19)+env(safe-area-inset-bottom))] z-10 mx-auto max-w-160 px-5 py-3 lg:bottom-0 lg:bg-default lg:px-6">
        <UButton
          color="neutral"
          size="xl"
          block
          class="h-13 text-lg lg:h-11"
          icon="i-lucide-log-out"
          :loading="saindo"
          :label="saindo ? undefined : 'Saí'"
          :aria-label="saindo ? 'Avisando a saída' : undefined"
          :aria-busy="saindo"
          :ui="{ leadingIcon: 'size-5' }"
          @click="sair"
        />
      </footer>

      <GavetaDeEscolha
        ref="gaveta"
        titulo="Mudar saída prevista"
        :grupos="grupos"
        :escolhida="registro.saidaPrevista"
        :salvando="mudandoSaida"
        @salvar="mudarSaida"
      />
    </template>

    <template v-else-if="forma === 'nenhuma'">
      <UCard
        as="section"
        class="mt-6"
        aria-labelledby="titulo-desligado"
        :ui="{ body: 'grid gap-1' }"
      >
        <h2
          id="titulo-desligado"
          class="text-base font-semibold leading-tight"
        >
          Registro de vaga desligado
        </h2>
        <p class="max-w-[70ch] text-xs text-muted">
          Você escolheu só consultar a chance. Para registrar a vaga e avisar quem está chegando quando ela deve
          ficar livre, escolha uma forma de colaborar em Ajustes.
        </p>
      </UCard>

      <footer class="fixed inset-x-0 bottom-[calc(--spacing(19)+env(safe-area-inset-bottom))] z-10 mx-auto max-w-160 px-5 py-3 lg:bottom-0 lg:bg-default lg:px-6">
        <UButton
          to="/ajustes"
          color="neutral"
          size="xl"
          block
          class="h-13 text-lg lg:h-11"
          label="Escolher forma de colaborar"
        />
      </footer>
    </template>

    <template v-else>
      <UCard
        as="section"
        class="mt-6"
        aria-labelledby="titulo-sem-vaga"
        :ui="{ body: 'grid gap-1' }"
      >
        <h2
          id="titulo-sem-vaga"
          class="text-base font-semibold leading-tight"
        >
          Nenhuma vaga registrada nesta noite
        </h2>
        <p class="max-w-[70ch] text-xs text-muted">
          Quando estacionar numa rua coberta, registre a vaga com a saída prevista para avisar quem está chegando.
          O registro leva só a rua coberta e as faixas horárias de chegada e de saída, sem a sua posição e sem
          nada que identifique você.
        </p>
      </UCard>

      <footer class="fixed inset-x-0 bottom-[calc(--spacing(19)+env(safe-area-inset-bottom))] z-10 mx-auto max-w-160 px-5 py-3 lg:bottom-0 lg:bg-default lg:px-6">
        <UButton
          to="/minha-vaga/registrar"
          color="neutral"
          size="xl"
          block
          class="h-13 text-lg lg:h-11"
          label="Registrar vaga"
        />
      </footer>
    </template>
  </main>
</template>
