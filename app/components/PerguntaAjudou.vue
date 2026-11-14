<!--
  Pergunta "A previsão ajudou hoje?" no Início (Métricas de uso; design
  system, "Cards" e "Botões"): card simples, sem cor forte, com dois botões
  secundários. Aparece uma vez por noite: depois de responder, o celular
  guarda que respondeu nesta noite e o card some. A resposta vai ao servidor
  só com sim ou não, sem identificador.
-->
<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'

/** Noite de agora; mesma busca do bloco do registro de vaga no Início. */
const { agora } = useAgora()
const { responderAjudou } = useAjudou()

const visivel = ref(false)
/** A resposta que está indo ao servidor; o botão dela mostra o indicador de carregando. */
const enviando = ref<boolean | null>(null)
const erro = ref(false)

watch(agora, (valor) => {
  if (!valor) return
  visivel.value = !dadosDoCelularDoAparelho().respondeuAjudou(valor.noite)
}, { immediate: true })

const { avisar } = useAvisoFlutuanteStore()

async function responder(ajudou: boolean) {
  if (!agora.value || enviando.value !== null) return
  enviando.value = ajudou
  erro.value = false
  try {
    if (!await responderAjudou(ajudou)) {
      erro.value = true
      return
    }
    if (agora.value) dadosDoCelularDoAparelho().marcarRespostaAjudou(agora.value.noite)
    visivel.value = false
    avisar('Obrigado pela resposta.')
  }
  catch {
    erro.value = true
  }
  finally {
    enviando.value = null
  }
}
</script>

<template>
  <UCard
    v-if="visivel"
    as="section"
    aria-labelledby="titulo-ajudou"
    :ui="{ body: 'grid gap-3' }"
  >
    <h2
      id="titulo-ajudou"
      class="text-base font-semibold"
    >
      A previsão ajudou hoje?
    </h2>

    <!-- Duas pílulas de vidro pequenas lado a lado, ícone ao lado do texto. -->
    <div class="flex flex-wrap gap-2">
      <UButton
        color="neutral"
        variant="outline"
        class="min-h-11 px-4 text-sm font-medium"
        :ui="{ leadingIcon: 'size-4' }"
        icon="i-lucide-thumbs-up"
        label="Sim"
        :loading="enviando === true"
        :aria-busy="enviando === true"
        @click="responder(true)"
      />
      <UButton
        color="neutral"
        variant="outline"
        class="min-h-11 px-4 text-sm font-medium"
        :ui="{ leadingIcon: 'size-4' }"
        icon="i-lucide-thumbs-down"
        label="Não"
        :loading="enviando === false"
        :aria-busy="enviando === false"
        @click="responder(false)"
      />
    </div>

    <!-- Erro em texto de perigo, com ícone; nunca só cor. -->
    <p
      v-if="erro"
      class="flex items-center gap-2 text-sm text-error"
      role="alert"
    >
      <UIcon
        name="i-lucide-circle-alert"
        class="size-4 shrink-0"
        aria-hidden="true"
      />
      Não foi possível enviar. Tente de novo.
    </p>
  </UCard>
</template>
