<script setup lang="ts">
const { data: ruas, status } = await useFetch('/api/ruas')

function distanciaAPe(metros: number) {
  return `${metros} m a pé`
}
</script>

<template>
  <main class="inicio">
    <h1 class="titulo">Início</h1>

    <section aria-labelledby="ruas-cobertas">
      <h2 id="ruas-cobertas" class="etiqueta">Ruas cobertas</h2>

      <ul v-if="status !== 'pending'" class="lista">
        <li v-for="rua in ruas" :key="rua.id" class="linha">
          <span class="nome">{{ rua.nome }}</span>
          <span class="distancia">{{ distanciaAPe(rua.distanciaAoDestinoMetros) }}</span>
        </li>
      </ul>

      <ul v-else class="lista" aria-busy="true" aria-label="Carregando ruas cobertas">
        <li v-for="n in 5" :key="n" class="linha esqueleto" />
      </ul>
    </section>
  </main>
</template>

<style scoped>
.inicio {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--paro-esp-8) var(--paro-margem);
}

.titulo {
  font-size: var(--paro-texto-titulo);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.etiqueta {
  margin-top: var(--paro-esp-8);
  font-size: var(--paro-texto-etiqueta);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--paro-texto-fraco);
}

.lista {
  display: grid;
  gap: var(--paro-esp-3);
  margin-top: var(--paro-esp-3);
}

.linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--paro-esp-3);
  min-height: 56px;
  padding: var(--paro-esp-3) var(--paro-esp-4);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-linha);
}

.nome {
  font-size: var(--paro-texto-corpo);
  font-weight: 600;
}

.distancia {
  flex: none;
  padding: var(--paro-esp-1) var(--paro-esp-3);
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto-fraco);
  background: var(--paro-superficie-suave);
  border-radius: var(--paro-raio-pilula);
}

.esqueleto {
  background: var(--paro-superficie-suave);
  border-color: transparent;
}
</style>
