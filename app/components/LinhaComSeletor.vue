<!--
  Linha com seletor liga/desliga (design system, "Formulários"; referências
  Grok e Pangea): ícone, título, parágrafo explicativo em text-muted e o
  USwitch à direita, ligado em bg-inverted.

  Interface:
  - prop `titulo`: nome do seletor; é o rótulo acessível do USwitch.
  - prop `explicacao`: parágrafo abaixo do título; descreve o USwitch.
  - prop `icone`: nome do ícone Lucide (`i-lucide-...`).
  - prop `ligado`: estado atual. A linha não guarda estado próprio.
  - evento `mudar(ligado)`: a pessoa tocou no seletor; quem usa decide.
-->
<script setup lang="ts">
defineProps<{
  titulo: string
  explicacao: string
  icone: string
  ligado: boolean
}>()

const emit = defineEmits<{ mudar: [ligado: boolean] }>()

const id = useId()
</script>

<template>
  <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
    <UIcon
      :name="icone"
      class="mt-0.5 size-5"
      aria-hidden="true"
    />
    <div class="grid gap-1">
      <p
        :id="`${id}-titulo`"
        class="text-sm font-semibold leading-tight"
      >
        {{ titulo }}
      </p>
      <p
        :id="`${id}-explicacao`"
        class="max-w-[70ch] text-xs text-muted"
      >
        {{ explicacao }}
      </p>
    </div>
    <!-- Trilho de 44 × 24 px; o ::after estende o alvo de toque para 44 × 44 px. -->
    <USwitch
      :model-value="ligado"
      color="neutral"
      size="xl"
      :ui="{ base: 'relative after:absolute after:inset-x-0 after:-inset-y-2.5' }"
      :aria-labelledby="`${id}-titulo`"
      :aria-describedby="`${id}-explicacao`"
      @update:model-value="emit('mudar', $event)"
    />
  </div>
</template>
