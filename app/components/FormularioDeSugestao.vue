<!--
  Formulário da sugestão de rua (ADR 0013; design system, "Formulários ›
  Campo de texto"), aberto numa gaveta a partir de Ajustes. Texto livre
  curto, sem lista de ruas cobertas e sem campo de dado pessoal. A sugestão
  vai só com o texto; o servidor guarda o texto e a data, e a equipe apaga
  depois de ler (ADR 0021). Não muda o mapa.
-->
<script setup lang="ts">
const emit = defineEmits<{ enviada: [] }>()

const id = useId()
const texto = ref('')
const enviando = ref(false)
const erro = ref<string | null>(null)

function limpar() {
  texto.value = ''
  erro.value = null
}

defineExpose({ limpar })

async function enviar() {
  if (enviando.value) return
  if (texto.value.trim().length < MINIMO_DA_SUGESTAO) {
    erro.value = 'Escreva o nome da rua ou do trecho.'
    return
  }
  enviando.value = true
  erro.value = null
  try {
    await $fetch('/api/sugestoes', { method: 'POST', body: { texto: texto.value } satisfies CorpoDaSugestao })
    limpar()
    emit('enviada')
  }
  catch {
    erro.value = 'Não foi possível enviar. Tente de novo.'
  }
  finally {
    enviando.value = false
  }
}
</script>

<template>
  <form
    class="formulario"
    novalidate
    @submit.prevent="enviar"
  >
    <p class="texto">
      Sugira uma rua ou trecho fora da área coberta para a equipe observar. A sugestão não muda o mapa: serve de
      pista para quando a área coberta crescer.
    </p>

    <div class="campo">
      <label
        :for="`${id}-texto`"
        class="rotulo"
      >Rua ou trecho</label>
      <input
        :id="`${id}-texto`"
        v-model="texto"
        type="text"
        class="entrada"
        :maxlength="MAXIMO_DA_SUGESTAO"
        autocomplete="off"
        enterkeyhint="send"
        :aria-invalid="erro !== null"
        :aria-describedby="`${id}-aviso ${id}-contagem${erro ? ` ${id}-erro` : ''}`"
      >
      <p
        :id="`${id}-contagem`"
        class="contagem"
      >
        {{ texto.length }} de {{ MAXIMO_DA_SUGESTAO }} caracteres
      </p>
      <p
        v-if="erro"
        :id="`${id}-erro`"
        class="erro"
        role="alert"
      >
        <UIcon
          name="i-lucide-circle-alert"
          class="icone"
          aria-hidden="true"
        />
        {{ erro }}
      </p>
    </div>

    <aside
      :id="`${id}-aviso`"
      class="aviso"
    >
      <UIcon
        name="i-lucide-info"
        class="icone"
        aria-hidden="true"
      />
      <p>
        Não escreva nome, telefone, placa ou outro dado pessoal. A sugestão vai sem nada que identifique você e é
        apagada depois que a equipe lê.
      </p>
    </aside>

    <button
      type="submit"
      class="principal"
      :aria-busy="enviando"
    >
      <UIcon
        v-if="enviando"
        name="i-lucide-loader-circle"
        class="icone carregando"
        aria-label="Enviando"
      />
      <template v-else>
        Enviar sugestão
      </template>
    </button>
  </form>
</template>

<style scoped>
.formulario {
  display: grid;
  gap: var(--paro-esp-4);
}

.texto {
  max-width: 70ch;
  font-size: var(--paro-texto-corpo);
}

.campo {
  display: grid;
  gap: var(--paro-esp-2);
}

/* Rótulo sempre visível acima do campo (design system, "Formulários"). */
.rotulo {
  font-size: var(--paro-texto-interface);
  font-weight: 600;
}

/* Campo de texto (design system, "Formulários"): 48 px, superfície, borda, raio 10 px. */
.entrada {
  height: var(--paro-esp-12);
  padding: 0 var(--paro-esp-3);
  font-size: var(--paro-texto-corpo);
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-botao);
}

@media (min-width: 1024px) {
  .entrada { height: calc(var(--paro-esp-8) + var(--paro-esp-2)); }
}

.contagem {
  justify-self: end;
  font-size: var(--paro-texto-nota);
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto-fraco);
}

/* Erro em texto de perigo abaixo do campo, com ícone (design system, "Formulários"). */
.erro {
  display: flex;
  align-items: center;
  gap: var(--paro-esp-2);
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  color: var(--paro-perigo-texto);
}

/* Card Aviso (design system, "Cards"): sinal de alerta, texto do mesmo par, raio 12 px. */
.aviso {
  display: flex;
  align-items: flex-start;
  gap: var(--paro-esp-3);
  padding: var(--paro-esp-3) var(--paro-esp-4);
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  color: var(--paro-alerta-texto);
  background: var(--paro-alerta);
  border-radius: var(--paro-raio-linha);
}

.aviso .icone {
  margin-top: 0.1em;
}

.icone {
  flex: none;
  width: var(--paro-esp-4);
  height: var(--paro-esp-4);
}

/* Botão principal (design system, "Botões"), no fim da gaveta. */
.principal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--paro-esp-2);
  width: 100%;
  height: calc(var(--paro-esp-12) + var(--paro-esp-1));
  font-size: var(--paro-texto-botao);
  font-weight: 600;
  color: var(--paro-acao-texto);
  background: var(--paro-acao);
  border-radius: var(--paro-raio-botao);
  cursor: pointer;
}

.principal:hover,
.principal:active {
  background: var(--paro-acao-hover);
}

.principal:active {
  transform: scale(0.98);
}

@media (min-width: 1024px) {
  .principal { height: calc(var(--paro-esp-8) + var(--paro-esp-3)); }
}

.carregando {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
  animation: girar 1s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}
</style>
