<!--
  Linha com seletor liga/desliga (design system, "Formulários"; referências
  Grok e Pangea): ícone, título, parágrafo explicativo em texto fraco e o
  seletor à direita, ligado em --paro-acao.
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
  <div class="linha">
    <UIcon :name="icone" class="icone" aria-hidden="true" />
    <div class="textos">
      <p :id="`${id}-titulo`" class="titulo">{{ titulo }}</p>
      <p :id="`${id}-explicacao`" class="explicacao">{{ explicacao }}</p>
    </div>
    <button
      type="button"
      role="switch"
      class="seletor"
      :class="{ ligado }"
      :aria-checked="ligado"
      :aria-labelledby="`${id}-titulo`"
      :aria-describedby="`${id}-explicacao`"
      @click="emit('mudar', !ligado)"
    >
      <span class="botao" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.linha {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--paro-esp-3);
}

.icone {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
  margin-top: 0.1em;
}

.textos {
  display: grid;
  gap: var(--paro-esp-1);
}

.titulo {
  font-size: var(--paro-texto-corpo);
  font-weight: 600;
  line-height: 1.2;
}

.explicacao {
  max-width: 70ch;
  font-size: var(--paro-texto-legenda);
  color: var(--paro-texto-fraco);
}

/*
 * Seletor: trilho de 44 × 24 px dentro de um alvo de toque de 44 × 44 px.
 * Desligado em superfície suave com borda; ligado em --paro-acao.
 */
.seletor {
  display: grid;
  align-items: center;
  width: calc(var(--paro-esp-8) + var(--paro-esp-3));
  height: calc(var(--paro-esp-8) + var(--paro-esp-3));
  margin-top: calc(var(--paro-esp-3) * -1);
  cursor: pointer;
}

.seletor::before {
  content: '';
  grid-area: 1 / 1;
  height: var(--paro-esp-6);
  background: var(--paro-superficie-suave);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-pilula);
}

.seletor.ligado::before {
  background: var(--paro-acao);
  border-color: var(--paro-acao);
}

.botao {
  grid-area: 1 / 1;
  width: var(--paro-esp-4);
  height: var(--paro-esp-4);
  margin-left: var(--paro-esp-1);
  background: var(--paro-texto-fraco);
  border-radius: var(--paro-raio-pilula);
}

.seletor.ligado .botao {
  background: var(--paro-acao-texto);
  transform: translateX(var(--paro-esp-5));
}

@media (prefers-reduced-motion: no-preference) {
  .botao {
    transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
  }
}
</style>
