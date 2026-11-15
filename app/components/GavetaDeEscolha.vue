<!--
  Gaveta de escolha (design system, "Gavetas"; referências Careem e Airbnb,
  escolha de horário): UDrawer com título à esquerda e botão de fechar à
  direita, grupos de faixas horárias numa grade de 4 colunas (chips do mesmo
  tamanho) e "Salvar" como ação principal cheia no rodapé, com o horário
  marcado ("Salvar · saída 21h30"). Aqui, para escolher a faixa horária de
  saída prevista. Fechar sem salvar (botão, Esc, toque fora ou arrastar para
  baixo) não muda nada. No desktop, abre embaixo do painel da direita, com a
  largura dele (432 px), onde a pessoa estava.

  Interface (a mesma de antes do UDrawer):
  - prop `titulo`: título da gaveta.
  - prop `grupos`: grupos de faixas horárias, cada um com rótulo e chips.
  - prop `escolhida`: faixa horária já escolhida, marcada ao abrir.
  - prop `salvando`: enquanto salva, o botão mostra o carregamento.
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

/** "Salvar · saída 21h30", ou só "Salvar" sem faixa marcada. */
const rotuloDoSalvar = computed(() =>
  marcada.value ? `Salvar · saída ${rotuloDaFaixaHoraria(marcada.value)}` : 'Salvar')

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
    :ui="{
      container: 'gap-5',
      header: 'flex items-center justify-between gap-3',
      content: 'lg:mx-0 lg:ml-auto lg:max-w-108',
    }"
  >
    <template #actions>
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-x"
        aria-label="Fechar"
        class="size-9 justify-center"
        @click="fechar"
      />
    </template>

    <template #body>
      <div class="grid gap-6">
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
            class="grid grid-cols-4 gap-2"
            role="radiogroup"
            :aria-labelledby="`${id}-grupo-${i}`"
          >
            <ChipDeFaixaHoraria
              v-for="faixaHoraria in grupo.faixasHorarias"
              :key="faixaHoraria"
              role="radio"
              :faixa-horaria="faixaHoraria"
              :ativo="marcada === faixaHoraria"
              :aria-checked="marcada === faixaHoraria"
              @click="marcada = faixaHoraria"
            />
          </div>
        </section>
      </div>
    </template>

    <!-- Ação principal (design system, "Botões"): cheia, largura total. -->
    <template #footer>
      <UButton
        color="neutral"
        size="xl"
        block
        class="h-13 text-lg tabular-nums lg:h-11"
        :loading="salvando"
        :label="salvando ? 'Salvando' : rotuloDoSalvar"
        @click="salvar"
      />
    </template>
  </UDrawer>
</template>
