<!--
  Aviso flutuante (design system, "Gavetas, avisos flutuantes e carregamento";
  referência Waymo): fundo --paro-texto, texto --paro-fundo, raio de 12 px,
  some em 3 s. Fica acima da barra de abas e da ação principal fixa no
  rodapé, para não cobrir "Saí" em Minha vaga.
-->
<script setup lang="ts">
const { texto } = useAvisoFlutuante()
</script>

<template>
  <div
    class="regiao"
    role="status"
    aria-live="polite"
  >
    <Transition name="aviso">
      <p
        v-if="texto"
        class="aviso"
      >
        {{ texto }}
      </p>
    </Transition>
  </div>
</template>

<style scoped>
.regiao {
  position: fixed;
  right: var(--paro-margem);
  /* Barra de abas (64 + 12) + botão principal (52) + espaços de 12. */
  bottom: calc(var(--paro-esp-16) + var(--paro-esp-12) + var(--paro-esp-1) + var(--paro-esp-3) * 3 + env(safe-area-inset-bottom));
  left: var(--paro-margem);
  z-index: 30;
  max-width: calc(var(--paro-largura-conteudo) - 2 * var(--paro-margem));
  margin: 0 auto;
  pointer-events: none;
}

.aviso {
  padding: var(--paro-esp-3) var(--paro-esp-4);
  font-size: var(--paro-texto-interface);
  font-weight: 500;
  color: var(--paro-fundo);
  background: var(--paro-texto);
  border-radius: var(--paro-raio-linha);
}

@media (prefers-reduced-motion: no-preference) {
  .aviso-enter-active,
  .aviso-leave-active {
    transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .aviso-enter-from,
  .aviso-leave-to {
    opacity: 0;
    transform: translateY(var(--paro-esp-2));
  }
}
</style>
