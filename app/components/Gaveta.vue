<!-- eslint-disable vue/multi-word-component-names -- nome em português de uma palavra só; troca pelo UDrawer fica para a ADR 0028 -->
<!--
  Gaveta de texto (design system, "Gavetas"): sobe do rodapé, raio de 16 px no
  topo, alça de 32 × 4 px e botão de fechar. Aqui, para o aviso de
  privacidade (referência Tinder) e para confirmações. Esc ou toque fora
  fecham sem fazer nada.
-->
<script setup lang="ts">
defineProps<{ titulo: string }>()

const emit = defineEmits<{ fechada: [] }>()

const gaveta = ref<HTMLDialogElement>()
const id = useId()

function abrir() {
  gaveta.value?.showModal()
}

function fechar() {
  gaveta.value?.close()
}

defineExpose({ abrir, fechar })
</script>

<template>
  <dialog
    ref="gaveta"
    class="gaveta"
    :aria-labelledby="`${id}-titulo`"
    @click.self="fechar"
    @close="emit('fechada')"
  >
    <div
      class="alca"
      aria-hidden="true"
    />
    <header class="topo">
      <h2
        :id="`${id}-titulo`"
        class="titulo"
      >
        {{ titulo }}
      </h2>
      <button
        type="button"
        class="fechar"
        aria-label="Fechar"
        @click="fechar"
      >
        <UIcon
          name="i-lucide-x"
          class="icone"
          aria-hidden="true"
        />
      </button>
    </header>
    <div class="corpo">
      <slot />
    </div>
  </dialog>
</template>

<style scoped>
.gaveta {
  width: 100%;
  max-width: var(--paro-largura-conteudo);
  max-height: 85dvh;
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
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: var(--paro-esp-4);
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

/* Botão de ícone (design system, "Botões"). */
.fechar {
  display: grid;
  flex: none;
  place-items: center;
  width: calc(var(--paro-esp-8) + var(--paro-esp-2));
  height: calc(var(--paro-esp-8) + var(--paro-esp-2));
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-botao);
  cursor: pointer;
}

@media (min-width: 1024px) {
  .fechar {
    width: calc(var(--paro-esp-8) + var(--paro-esp-1));
    height: calc(var(--paro-esp-8) + var(--paro-esp-1));
  }
}

.icone {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
}

.corpo {
  overflow-y: auto;
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
