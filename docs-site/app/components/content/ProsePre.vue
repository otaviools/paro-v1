<script setup lang="ts">
// Bloco de código como janela do macOS (referência: terminal do ToDesktop no
// Mobbin): barra com os três botões, o nome do arquivo (ou a linguagem) no
// meio e o botão de copiar à direita. Substitui o ProsePre do Nuxt UI.
import { useClipboard } from '@vueuse/core'

const props = withDefaults(defineProps<{
  code?: string
  language?: string
  filename?: string
  highlights?: number[]
  hideHeader?: boolean
  meta?: string
  class?: string
}>(), {
  code: '',
  language: undefined,
  filename: undefined,
  highlights: undefined,
  meta: undefined,
  class: undefined
})

const { copy, copied } = useClipboard()
const pre = useTemplateRef<HTMLPreElement>('pre')

const titulo = computed(() => props.filename || props.language || '')

function copiar() {
  copy(props.code || pre.value?.textContent || '')
}
</script>

<template>
  <div class="my-5 overflow-hidden rounded-paro-md border border-default bg-muted">
    <div
      v-if="!props.hideHeader"
      class="relative flex h-9 items-center border-b border-default bg-elevated px-3"
    >
      <BotoesDaJanela />
      <span
        v-if="titulo"
        class="absolute inset-x-20 truncate text-center font-mono text-xs text-muted"
      >
        {{ titulo }}
      </span>
      <UButton
        :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
        color="neutral"
        variant="ghost"
        size="xs"
        class="ms-auto"
        :aria-label="copied ? 'Copiado' : 'Copiar código'"
        @click="copiar"
      />
    </div>
    <pre
      ref="pre"
      class="overflow-x-auto px-4 py-3 font-mono text-sm/6"
      :class="props.class"
    ><slot /></pre>
  </div>
</template>
