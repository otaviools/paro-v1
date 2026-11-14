<!--
  Pergunta "A previsão ajudou hoje?" no Início (Métricas de uso; design
  system, "Cards" e "Botões"): card simples, sem cor forte, com dois botões
  secundários. Aparece uma vez por noite: depois de responder, o celular
  guarda que respondeu nesta noite e o card some. A resposta vai ao servidor
  só com sim ou não, sem identificador.
-->
<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'

/** Noite de agora; mesma busca do bloco do registro de vaga no Início. */
const { data: agora } = useFetch('/api/agora', { key: 'agora-inicio', server: false })

const visivel = ref(false)
/** A resposta que está indo ao servidor; o botão dela mostra o indicador de carregando. */
const enviando = ref<boolean | null>(null)
const erro = ref(false)

watch(agora, (valor) => {
  if (!valor) return
  visivel.value = !dadosDoCelularDoAparelho().respondeuAjudou(valor.noite)
}, { immediate: true })

const { avisar } = useAvisoFlutuante()

async function responder(ajudou: boolean) {
  if (!agora.value || enviando.value !== null) return
  enviando.value = ajudou
  erro.value = false
  try {
    await $fetch('/api/ajudou', { method: 'POST', body: { ajudou } })
    dadosDoCelularDoAparelho().marcarRespostaAjudou(agora.value.noite)
    visivel.value = false
    avisar('Obrigado pela resposta.')
  }
  catch {
    erro.value = true
  }
  finally {
    enviando.value = null
  }
}
</script>

<template>
  <section v-if="visivel" class="card" aria-labelledby="titulo-ajudou">
    <h2 id="titulo-ajudou" class="titulo">A previsão ajudou hoje?</h2>

    <div class="botoes">
      <button type="button" class="secundario" :aria-busy="enviando === true" @click="responder(true)">
        <UIcon v-if="enviando === true" name="i-lucide-loader-circle" class="icone carregando" aria-label="Enviando" />
        <template v-else>
          <UIcon name="i-lucide-thumbs-up" class="icone" aria-hidden="true" />
          Sim
        </template>
      </button>
      <button type="button" class="secundario" :aria-busy="enviando === false" @click="responder(false)">
        <UIcon v-if="enviando === false" name="i-lucide-loader-circle" class="icone carregando" aria-label="Enviando" />
        <template v-else>
          <UIcon name="i-lucide-thumbs-down" class="icone" aria-hidden="true" />
          Não
        </template>
      </button>
    </div>

    <p v-if="erro" class="erro" role="alert">
      <UIcon name="i-lucide-circle-alert" class="icone" aria-hidden="true" />
      Não foi possível enviar. Tente de novo.
    </p>
  </section>
</template>

<style scoped>
/* Card (design system, "Cards"): superfície, borda de 1 px, raio de 16 px, sem sombra. */
.card {
  display: grid;
  gap: var(--paro-esp-3);
  padding: var(--paro-esp-4);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-card);
}

@media (min-width: 1024px) {
  .card { padding: var(--paro-esp-6); }
}

.titulo {
  font-size: var(--paro-texto-card);
  font-weight: 600;
}

/* Dois botões secundários lado a lado (design system, "Botões"). */
.botoes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--paro-esp-2);
}

.secundario {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--paro-esp-2);
  min-height: calc(var(--paro-esp-8) + var(--paro-esp-3));
  padding: 0 var(--paro-esp-4);
  font-size: var(--paro-texto-interface);
  font-weight: 500;
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-botao);
  cursor: pointer;
}

.secundario:active {
  transform: scale(0.98);
}

.icone {
  flex: none;
  width: var(--paro-esp-4);
  height: var(--paro-esp-4);
}

/* Carregando (design system, "Botões"): indicador no lugar do texto, mesma largura. */
.carregando {
  animation: girar 1s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

/* Erro em texto de perigo, com ícone; nunca só cor. */
.erro {
  display: flex;
  align-items: center;
  gap: var(--paro-esp-2);
  font-size: var(--paro-texto-interface);
  color: var(--paro-perigo-texto);
}
</style>
