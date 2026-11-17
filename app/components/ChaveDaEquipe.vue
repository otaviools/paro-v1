<!--
  Formulário da chave da equipe (Área da equipe: Observações e Métricas).
  A chave é digitada aqui e a tela que o usa confere com o servidor; enquanto
  confere, o botão fica carregando.

  Interface:
  - prop `carregando`: o servidor está conferindo a chave.
  - prop `erro`: mensagem embaixo do campo ("Chave da equipe incorreta."), ou null.
  - prop `acao`: texto do botão ("Ver observações", "Ver métricas").
  - evento `entrar(chave)`: a chave digitada, sem espaços nas pontas. Vazia
    não emite: o próprio formulário pede para digitar.
-->
<script setup lang="ts">
const props = defineProps<{ carregando: boolean, erro: string | null, acao: string }>()
const emit = defineEmits<{ entrar: [chave: string] }>()

const digitada = ref('')
const vazia = ref(false)
const mensagem = computed(() => (vazia.value ? 'Digite a chave da equipe.' : props.erro))

function entrar() {
  const valor = digitada.value.trim()
  vazia.value = !valor
  if (valor) emit('entrar', valor)
}
</script>

<template>
  <UCard
    as="form"
    class="lg:max-w-md"
    novalidate
    :ui="{ body: 'grid gap-4' }"
    @submit.prevent="entrar"
  >
    <UFormField
      label="Chave da equipe"
      description="Fica só nesta aba do navegador e some ao fechá-la."
      :error="mensagem ?? false"
      size="lg"
      :ui="{ label: 'font-semibold', description: 'text-xs', container: 'mt-2', error: 'text-xs font-medium' }"
    >
      <UInput
        v-model="digitada"
        type="password"
        autocomplete="off"
        class="w-full"
        :ui="{ base: 'h-12 rounded-paro-md bg-elevated text-sm lg:h-10' }"
      />
      <template #error="{ error: texto }">
        <span
          class="flex items-center gap-2"
          role="alert"
        >
          <UIcon
            name="i-lucide-circle-alert"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          {{ texto }}
        </span>
      </template>
    </UFormField>

    <UButton
      type="submit"
      color="neutral"
      size="xl"
      block
      class="h-13 text-lg lg:h-11"
      :loading="carregando"
      :label="carregando ? undefined : acao"
      :aria-label="carregando ? 'Carregando' : undefined"
      :aria-busy="carregando"
    />
  </UCard>
</template>
