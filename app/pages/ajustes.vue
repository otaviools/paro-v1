<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import type { DadosDoCelular } from '~/dados-do-celular'

const { data: faixasHorarias } = await useFetch('/api/faixas-horarias')

/** A rotina fica só no celular (ADR 0015): é lida e guardada no navegador. */
let dados: DadosDoCelular | undefined
const rotina = ref<string | null>(null)

onMounted(() => {
  dados = dadosDoCelularDoAparelho()
  rotina.value = dados.rotina()
})

function escolher(faixaHoraria: string | null) {
  dados?.definirRotina(faixaHoraria)
  rotina.value = faixaHoraria
}
</script>

<template>
  <main class="ajustes">
    <h1 class="titulo">Ajustes</h1>

    <section class="secao" aria-labelledby="titulo-rotina">
      <h2 id="titulo-rotina" class="etiqueta">Rotina</h2>

      <div class="card">
        <h3 id="nome-rotina" class="nome">Horário de chegada habitual</h3>
        <p class="explicacao">
          O Parô abre na faixa horária em que você costuma chegar. Sem rotina, abre em Agora.
          Fica guardada só neste celular.
        </p>

        <div class="opcoes" role="radiogroup" aria-labelledby="nome-rotina">
          <ChipDeFaixaHoraria
            role="radio"
            :ativo="rotina === null"
            :aria-checked="rotina === null"
            @click="escolher(null)"
          >
            Sem rotina
          </ChipDeFaixaHoraria>
          <ChipDeFaixaHoraria
            v-for="faixaHoraria in faixasHorarias"
            :key="faixaHoraria"
            role="radio"
            :ativo="rotina === faixaHoraria"
            :aria-checked="rotina === faixaHoraria"
            @click="escolher(faixaHoraria)"
          >
            {{ rotuloDaFaixaHoraria(faixaHoraria) }}
          </ChipDeFaixaHoraria>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.ajustes {
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

.secao {
  margin-top: var(--paro-esp-8);
}

.etiqueta {
  font-size: var(--paro-texto-etiqueta);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--paro-texto-fraco);
}

.card {
  display: grid;
  gap: var(--paro-esp-2);
  margin-top: var(--paro-esp-3);
  padding: var(--paro-esp-4);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-card);
}

@media (min-width: 1024px) {
  .card { padding: var(--paro-esp-6); }
}

.nome {
  font-size: var(--paro-texto-card);
  font-weight: 600;
  line-height: 1.2;
}

.explicacao {
  font-size: var(--paro-texto-legenda);
  color: var(--paro-texto-fraco);
}

.opcoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--paro-esp-2);
  margin-top: var(--paro-esp-2);
}
</style>
