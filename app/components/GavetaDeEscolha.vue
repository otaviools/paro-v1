<!--
  Gaveta de escolha (design system, "Gavetas"; referência Pangea, ajustes do
  mapa): UDrawer com título à esquerda, "Salvar" como link à direita e grupos
  de chips. Aqui, para escolher a faixa horária de saída prevista. Fechar sem
  salvar (Esc, toque fora ou arrastar para baixo) não muda nada.

  Interface (a mesma de antes do UDrawer):
  - prop `titulo`: título da gaveta.
  - prop `grupos`: grupos de faixas horárias, cada um com rótulo e chips.
  - prop `escolhida`: faixa horária já escolhida, marcada ao abrir.
  - prop `salvando`: enquanto salva, o link mostra o carregamento.
  - evento `salvar(faixaHoraria)`: a pessoa tocou em "Salvar" com uma faixa
    marcada. Quem usa fecha a gaveta depois de salvar.
  - métodos pelo ref: `abrir()` e `fechar()`.
-->
<script setup lang="ts">
import type { GrupoDeFaixasHorarias } from '~/utils/saida-prevista'

const props = defineProps<{
  titulo: string
  grupos: GrupoDeFaixasHorarias[]
  escolhida: string | null
  salvando?: boolean
}>()

const emit = defineEmits<{ salvar: [faixaHoraria: string] }>()

const aberta = ref(false)
const marcada = ref<string | null>(null)
const id = useId()

function abrir() {
  marcada.value = props.escolhida
  aberta.value = true
}

function fechar() {
  aberta.value = false
}

/** Sem nenhuma faixa horária marcada, "Salvar" só fecha. */
function salvar() {
  if (marcada.value) emit('salvar', marcada.value)
  else fechar()
}

defineExpose({ abrir, fechar })
</script>

<template>
  <UDrawer
    v-model:open="aberta"
    :title="titulo"
    :ui="{ container: 'gap-5' }"
  >
    <template #actions>
      <UButton
        color="primary"
        variant="link"
        size="lg"
        class="min-h-11 min-w-11 justify-center"
        :loading="salvando"
        :label="salvando ? undefined : 'Salvar'"
        :aria-label="salvando ? 'Salvando' : undefined"
        @click="salvar"
      />
    </template>

    <template #body>
      <div class="grid gap-5">
        <section
          v-for="(grupo, i) in grupos"
          :key="grupo.rotulo"
          class="grid gap-3"
        >
          <h3
            :id="`${id}-grupo-${i}`"
            class="text-xs font-semibold uppercase tracking-wider text-muted"
          >
            {{ grupo.rotulo }}
          </h3>
          <div
            class="flex flex-wrap gap-2"
            role="radiogroup"
            :aria-labelledby="`${id}-grupo-${i}`"
          >
            <ChipDeFaixaHoraria
              v-for="faixaHoraria in grupo.faixasHorarias"
              :key="faixaHoraria"
              role="radio"
              :ativo="marcada === faixaHoraria"
              :aria-checked="marcada === faixaHoraria"
              @click="marcada = faixaHoraria"
            >
              {{ rotuloDaFaixaHoraria(faixaHoraria) }}
            </ChipDeFaixaHoraria>
          </div>
        </section>
      </div>
    </template>
  </UDrawer>
</template>
