<!--
  Formulário da sugestão de rua (ADR 0013; design system, "Formulários ›
  Campo de texto"), aberto numa gaveta a partir de Ajustes. Texto livre
  curto, sem lista de ruas cobertas e sem campo de dado pessoal. A sugestão
  vai só com o texto; o servidor guarda o texto e a data, e a equipe apaga
  depois de ler (ADR 0021). Não muda o mapa.
-->
<script setup lang="ts">
const emit = defineEmits<{ enviada: [] }>()

const { enviarSugestao } = useSugestoesDeRua()
const texto = ref('')
const enviando = ref(false)
const erro = ref<string | null>(null)

function limpar() {
  texto.value = ''
  erro.value = null
}

defineExpose({ limpar })

async function enviar() {
  if (enviando.value) return
  if (texto.value.trim().length < MINIMO_DA_SUGESTAO) {
    erro.value = 'Escreva o nome da rua ou do trecho.'
    return
  }
  enviando.value = true
  erro.value = null
  const enviada = await enviarSugestao(texto.value)
  enviando.value = false
  if (!enviada) {
    erro.value = 'Não foi possível enviar. Tente de novo.'
    return
  }
  limpar()
  emit('enviada')
}
</script>

<template>
  <form
    class="grid gap-4"
    novalidate
    @submit.prevent="enviar"
  >
    <p class="max-w-[70ch] text-sm">
      Sugira uma rua ou trecho fora da área coberta para a equipe observar. A sugestão não muda o mapa: serve de
      pista para quando a área coberta crescer.
    </p>

    <!--
      Rótulo sempre visível acima do campo; a contagem fica à direita do rótulo
      e o erro, em texto de perigo com ícone, abaixo do campo (design system,
      "Formulários"). O UFormField liga os dois ao campo por aria-describedby.
    -->
    <UFormField
      label="Rua ou trecho"
      :hint="`${texto.length} de ${MAXIMO_DA_SUGESTAO} caracteres`"
      :error="erro ?? false"
      size="lg"
      :ui="{ label: 'font-semibold', hint: 'text-xs tabular-nums', error: 'text-xs font-medium' }"
    >
      <UInput
        v-model="texto"
        type="text"
        :maxlength="MAXIMO_DA_SUGESTAO"
        autocomplete="off"
        enterkeyhint="send"
        class="w-full"
        :ui="{ base: 'h-12 rounded-paro-md bg-elevated text-sm lg:h-10' }"
      />
      <template #error="{ error: mensagem }">
        <span
          class="flex items-center gap-2"
          role="alert"
        >
          <UIcon
            name="i-lucide-circle-alert"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          {{ mensagem }}
        </span>
      </template>
    </UFormField>

    <UAlert
      color="warning"
      variant="soft"
      icon="i-lucide-info"
      description="Não escreva nome, telefone, placa ou outro dado pessoal. A sugestão vai sem nada que identifique você e é apagada depois que a equipe lê."
      :ui="{ description: 'text-xs font-medium' }"
    />

    <UButton
      type="submit"
      color="neutral"
      size="xl"
      block
      class="h-13 text-lg lg:h-11"
      :loading="enviando"
      :label="enviando ? undefined : 'Enviar sugestão'"
      :aria-label="enviando ? 'Enviando' : undefined"
      :aria-busy="enviando"
    />
  </form>
</template>
