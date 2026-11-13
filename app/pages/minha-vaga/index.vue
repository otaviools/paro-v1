<!--
  Minha vaga. Com um registro de vaga aberto nesta noite, mostra a Vaga ativa
  (referências Waymo e Lime): card com a saída prevista como título, a rua
  coberta e a linha de ações com "Mudar saída", e "Saí" fixo no rodapé. Sem
  registro, leva para Registrar vaga no modo manual.
-->
<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import type { DadosDoCelular, RegistroNoCelular } from '~/dados-do-celular'

/** Noite e faixa horária de agora; lidas no navegador, na hora de abrir a tela. */
const { data: agora, error: erroDoAgora } = useFetch('/api/agora', { key: 'agora-minha-vaga', server: false })
const { data: faixasHorarias } = useFetch('/api/faixas-horarias', { server: false })

let dados: DadosDoCelular | undefined
const registro = ref<RegistroNoCelular | null>(null)
const lido = ref(false)

// O registro guardado só vale na noite em que foi feito (ADR 0014).
watch(agora, (valor) => {
  if (!valor) return
  dados ??= dadosDoCelularDoAparelho()
  registro.value = dados.registroAtual(valor.noite)
  lido.value = true
}, { immediate: true })

/** Confirmação de registro, mostrada uma vez depois de Registrar vaga. */
const vagaRecemRegistrada = useState('vaga-recem-registrada', () => false)
const confirmarRegistro = ref(false)
onMounted(() => {
  confirmarRegistro.value = vagaRecemRegistrada.value
  vagaRecemRegistrada.value = false
})

const { avisar } = useAvisoFlutuante()

/** O servidor recusou o código: o registro foi encerrado ou é de outra noite. */
function esquecerRegistro() {
  dados?.apagarRegistro()
  registro.value = null
  confirmarRegistro.value = false
  avisar('Este registro não vale mais nesta noite. Registre a vaga de novo se precisar.')
}

function statusDo(erro: unknown) {
  return (erro as { statusCode?: number }).statusCode
}

// --- Mudar saída -------------------------------------------------------------

const gaveta = ref<{ abrir: () => void, fechar: () => void }>()
const mudandoSaida = ref(false)

/** A saída prevista pode ir da faixa horária de agora (ou da chegada) até 22h30. */
const grupos = computed(() => {
  if (!registro.value) return []
  const agoraFaixa = agora.value?.faixaHorária ?? registro.value.chegada
  const aPartirDe = agoraFaixa > registro.value.chegada ? agoraFaixa : registro.value.chegada
  return gruposDaSaidaPrevista(faixasHorarias.value ?? [], aPartirDe)
})

async function mudarSaida(saidaPrevista: string) {
  if (!registro.value || mudandoSaida.value) return
  mudandoSaida.value = true
  try {
    await $fetch('/api/registros/saida', {
      method: 'PATCH',
      body: { código: registro.value.código, saídaPrevista: saidaPrevista },
    })
    dados?.mudarSaídaDoRegistro(saidaPrevista)
    registro.value = { ...registro.value, saídaPrevista: saidaPrevista }
    gaveta.value?.fechar()
    avisar(`Saída prevista mudada para ${rotuloDaFaixaHoraria(saidaPrevista)}.`)
  }
  catch (erro) {
    gaveta.value?.fechar()
    if (statusDo(erro) === 404) esquecerRegistro()
    else avisar('Não foi possível mudar a saída agora. Tente de novo em instantes.')
  }
  finally {
    mudandoSaida.value = false
  }
}

// --- Saí -----------------------------------------------------------------------

const saindo = ref(false)

async function sair() {
  if (!registro.value || saindo.value) return
  saindo.value = true
  try {
    await $fetch('/api/registros/encerrar', { method: 'POST', body: { código: registro.value.código } })
  }
  catch (erro) {
    // Código recusado: o registro já não conta, então o "Saí" vale do mesmo jeito.
    if (statusDo(erro) !== 404) {
      saindo.value = false
      avisar('Não foi possível avisar a saída agora. Tente de novo em instantes.')
      return
    }
  }
  dados?.apagarRegistro()
  avisar('Saída registrada. Obrigado por avisar quem está chegando.')
  await navigateTo('/')
}
</script>

<template>
  <main class="minha-vaga">
    <h1 class="titulo">Minha vaga</h1>

    <div v-if="!lido && !erroDoAgora" class="esqueleto" aria-busy="true" aria-label="Carregando" />

    <p v-else-if="erroDoAgora" class="mensagem">
      Não foi possível carregar agora. Tente de novo em instantes.
    </p>

    <template v-else-if="registro">
      <aside v-if="confirmarRegistro" class="confirmacao" role="status">
        <UIcon name="i-lucide-circle-check" class="icone" aria-hidden="true" />
        <p>Vaga registrada. Quem está chegando já vê a sua saída prevista no detalhe da rua.</p>
      </aside>

      <!-- Card Vaga ativa (design system, "Cards"; referência Waymo). -->
      <section class="card" aria-labelledby="titulo-vaga">
        <p class="etiqueta">Vaga ativa</p>
        <h2 id="titulo-vaga" class="saida">Saída prevista: {{ rotuloDaFaixaHoraria(registro.saídaPrevista) }}</h2>
        <p class="rua">{{ registro.ruaCoberta.nome }}</p>
        <p class="chegada">Chegada: {{ rotuloDaFaixaHoraria(registro.chegada) }}</p>

        <div class="acoes">
          <button type="button" class="secundario" aria-haspopup="dialog" @click="gaveta?.abrir()">
            <UIcon name="i-lucide-clock" class="icone" aria-hidden="true" />
            Mudar saída
          </button>
        </div>
      </section>

      <footer class="rodape">
        <button type="button" class="principal" :aria-busy="saindo" @click="sair">
          <UIcon v-if="saindo" name="i-lucide-loader-circle" class="carregando" aria-label="Avisando a saída" />
          <template v-else>
            <UIcon name="i-lucide-log-out" class="icone-botao" aria-hidden="true" />
            Saí
          </template>
        </button>
      </footer>

      <GavetaDeEscolha
        ref="gaveta"
        titulo="Mudar saída prevista"
        :grupos="grupos"
        :escolhida="registro.saídaPrevista"
        :salvando="mudandoSaida"
        @salvar="mudarSaida"
      />
    </template>

    <template v-else>
      <section class="card" aria-labelledby="titulo-sem-vaga">
        <h2 id="titulo-sem-vaga" class="nome-card">Nenhuma vaga registrada nesta noite</h2>
        <p class="explicacao">
          Quando estacionar numa rua coberta, registre a vaga com a saída prevista para avisar quem está chegando.
          O registro leva só a rua coberta e as faixas horárias de chegada e de saída, sem a sua posição e sem
          nada que identifique você.
        </p>
      </section>

      <footer class="rodape">
        <NuxtLink to="/minha-vaga/registrar" class="principal">Registrar vaga</NuxtLink>
      </footer>
    </template>
  </main>
</template>

<style scoped>
/* Espaço extra no fim para a ação principal, que fica acima da barra de abas. */
.minha-vaga {
  max-width: var(--paro-largura-conteudo);
  margin: 0 auto;
  padding: var(--paro-esp-8) var(--paro-margem) calc(var(--paro-esp-16) + var(--paro-esp-8));
}

.titulo {
  font-size: var(--paro-texto-titulo);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.esqueleto {
  height: calc(var(--paro-esp-16) * 2 + var(--paro-esp-12));
  margin-top: var(--paro-esp-6);
  background: var(--paro-superficie-suave);
  border-radius: var(--paro-raio-card);
}

.mensagem {
  margin-top: var(--paro-esp-6);
  padding: var(--paro-esp-4);
  font-size: var(--paro-texto-corpo);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-linha);
}

/* Card Aviso com o sinal de sucesso (confirmação de registro). */
.confirmacao {
  display: flex;
  align-items: center;
  gap: var(--paro-esp-3);
  margin-top: var(--paro-esp-6);
  padding: var(--paro-esp-3) var(--paro-esp-4);
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  color: var(--paro-sucesso-texto);
  background: var(--paro-sucesso);
  border-radius: var(--paro-raio-linha);
}

.card {
  display: grid;
  gap: var(--paro-esp-1);
  margin-top: var(--paro-esp-6);
  padding: var(--paro-esp-4);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-card);
}

.confirmacao + .card {
  margin-top: var(--paro-esp-3);
}

@media (min-width: 1024px) {
  .card { padding: var(--paro-esp-6); }
}

.etiqueta {
  font-size: var(--paro-texto-etiqueta);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--paro-texto-fraco);
}

.saida {
  margin-top: var(--paro-esp-1);
  font-size: var(--paro-texto-stat);
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.rua {
  font-size: var(--paro-texto-corpo);
  font-weight: 600;
}

.chegada {
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto-fraco);
}

/* Linha de ações com ícone e rótulo, separada por --paro-borda. */
.acoes {
  display: flex;
  gap: var(--paro-esp-2);
  margin-top: var(--paro-esp-3);
  padding-top: var(--paro-esp-3);
  border-top: 1px solid var(--paro-borda);
}

/* Botão secundário (design system, "Botões"). */
.secundario {
  display: flex;
  align-items: center;
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

.nome-card {
  font-size: var(--paro-texto-card);
  font-weight: 600;
  line-height: 1.2;
}

.explicacao {
  max-width: 70ch;
  margin-top: var(--paro-esp-1);
  font-size: var(--paro-texto-legenda);
  color: var(--paro-texto-fraco);
}

.icone {
  flex: none;
  width: var(--paro-esp-4);
  height: var(--paro-esp-4);
}

/* Ação principal fixa, logo acima da barra de abas flutuante. */
.rodape {
  position: fixed;
  right: 0;
  bottom: calc(var(--paro-esp-16) + var(--paro-esp-3) + env(safe-area-inset-bottom));
  left: 0;
  z-index: 10;
  max-width: var(--paro-largura-conteudo);
  margin: 0 auto;
  padding: var(--paro-esp-3) var(--paro-margem);
}

/* Botão principal (design system, "Botões"). */
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

.icone-botao,
.carregando {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
}

.carregando {
  animation: girar 1s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}
</style>
