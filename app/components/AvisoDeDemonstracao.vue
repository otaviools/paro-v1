<!-- Card Aviso com o sinal de alerta, sem botão de fechar (ADR 0012). -->
<template>
  <aside
    class="aviso"
    role="note"
  >
    <UIcon
      name="i-lucide-info"
      class="icone"
      aria-hidden="true"
    />
    <p>
      <strong>Dados de demonstração</strong>
      <span>A chance vem de observações fictícias, não de contagens nas ruas.</span>
    </p>
  </aside>
</template>

<style scoped>
.aviso {
  display: flex;
  align-items: center;
  gap: var(--paro-esp-3);
  padding: var(--paro-esp-3) var(--paro-esp-4);
  background: var(--paro-alerta);
  color: var(--paro-alerta-texto);
  border-radius: var(--paro-raio-linha);
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
}

.icone {
  flex: none;
  width: var(--paro-esp-4);
  height: var(--paro-esp-4);
}

p {
  display: grid;
}

strong {
  font-size: var(--paro-texto-interface);
  font-weight: 600;
}
</style>
