<!--
  Gaveta de escolha (design system, "Gavetas"; referência Pangea, ajustes do
  mapa): título à esquerda, "Salvar" como link à direita e grupos de chips.
  Aqui, para escolher a faixa horária de saída prevista. Fechar sem salvar
  (Esc ou toque fora) não muda nada.
-->
<script setup lang="ts">
import type { GrupoDeFaixasHorarias } from '~/utils/saida-prevista'

const props = defineProps<{
  titulo: string
  grupos: GrupoDeFaixasHorarias[]
  /** Faixa horária já escolhida, marcada ao abrir. */
  escolhida: string | null
  /** Enquanto salva, o link mostra o carregamento. */
  salvando?: boolean
}>()

const emit = defineEmits<{ salvar: [faixaHoraria: string] }>()

const gaveta = ref<HTMLDialogElement>()
const marcada = ref<string | null>(null)
const id = useId()

function abrir() {
  marcada.value = props.escolhida
  gaveta.value?.showModal()
}

function fechar() {
  gaveta.value?.close()
}

/** Sem nenhuma faixa horária marcada, "Salvar" só fecha. */
function salvar() {
  if (marcada.value) emit('salvar', marcada.value)
  else fechar()
}

defineExpose({ abrir, fechar })
</script>

<template>
  <dialog ref="gaveta" class="gaveta" :aria-labelledby="`${id}-titulo`" @click.self="fechar">
    <div class="alca" aria-hidden="true" />
    <header class="topo">
      <h2 :id="`${id}-titulo`" class="titulo">{{ titulo }}</h2>
      <button type="button" class="link" :disabled="salvando" @click="salvar">
        <UIcon v-if="salvando" name="i-lucide-loader-circle" class="carregando" aria-label="Salvando" />
        <template v-else>Salvar</template>
      </button>
    </header>

    <section v-for="(grupo, i) in grupos" :key="grupo.rotulo" class="grupo">
      <h3 :id="`${id}-grupo-${i}`" class="etiqueta">{{ grupo.rotulo }}</h3>
      <div class="chips" role="radiogroup" :aria-labelledby="`${id}-grupo-${i}`">
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
  </dialog>
</template>

<style scoped>
.gaveta {
  width: 100%;
  max-width: var(--paro-largura-conteudo);
  margin: auto auto 0;
  padding: var(--paro-esp-3) var(--paro-margem) calc(var(--paro-esp-8) + env(safe-area-inset-bottom));
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-bottom: 0;
  border-radius: var(--paro-raio-card) var(--paro-raio-card) 0 0;
}

.gaveta[open] {
  display: grid;
  gap: var(--paro-esp-5);
}

.alca {
  justify-self: center;
  width: var(--paro-esp-8);
  height: var(--paro-esp-1);
  background: var(--paro-borda);
  border-radius: var(--paro-raio-pilula);
}

.topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--paro-esp-3);
}

.titulo {
  font-size: var(--paro-texto-card);
  font-weight: 600;
  line-height: 1.2;
}

/* Botão link (design system, "Botões"). */
.link {
  display: grid;
  place-items: center;
  min-width: calc(var(--paro-esp-8) + var(--paro-esp-3));
  min-height: calc(var(--paro-esp-8) + var(--paro-esp-3));
  font-size: var(--paro-texto-interface);
  font-weight: 600;
  color: var(--paro-destaque-texto);
  cursor: pointer;
}

.carregando {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
  animation: girar 1s linear infinite;
}

.grupo {
  display: grid;
  gap: var(--paro-esp-3);
}

.etiqueta {
  font-size: var(--paro-texto-etiqueta);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--paro-texto-fraco);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--paro-esp-2);
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: no-preference) {
  .gaveta[open] {
    animation: entrar 250ms cubic-bezier(0.16, 1, 0.3, 1);
  }
}

@keyframes entrar {
  from { opacity: 0; transform: translateY(var(--paro-esp-2)); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
