<!--
  Registrar vaga (referências Pangea e Lime): a rua coberta escolhida no
  seletor de opção com ícone e a saída prevista escolhida na gaveta de
  escolha. A chegada é a faixa horária de agora. O registro leva só a rua
  coberta e as faixas horárias (ADRs 0003 e 0004); o código volta para o
  celular (ADR 0014). A barra de abas some nesta tela.

  "Usar minha localização" lê a posição uma vez, só quando tocado (ADR 0010),
  e a Área coberta propõe a rua coberta mais próxima, que o colaborador pode
  trocar. O cálculo é feito aqui no celular: a posição vira o ponto do carro,
  guardado só nos Dados do celular, e nunca vai ao servidor (ADR 0003). Sem a
  localização, vale o modo manual: a rua escolhida na lista, sem ponto do carro.
-->
<script setup lang="ts">
import { areaCoberta } from '~~/server/area-coberta'
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import type { DadosDoCelular, Ponto } from '~/dados-do-celular'

definePageMeta({ semBarraDeAbas: true })

const router = useRouter()

const { data: ruas } = await useFetch('/api/ruas')
const { data: faixasHorarias } = await useFetch('/api/faixas-horarias')
/** Noite e faixa horária de agora; lidas no navegador, na hora de abrir a tela. */
const { data: agora, error: erroDoAgora } = useFetch('/api/agora', { key: 'agora-registrar', server: false })

let dados: DadosDoCelular | undefined

// Com um registro aberto nesta noite, a tela é a Vaga ativa.
watch(agora, (valor) => {
  if (!valor) return
  dados ??= dadosDoCelularDoAparelho()
  if (dados.registroAtual(valor.noite)) navigateTo('/minha-vaga', { replace: true })
}, { immediate: true })

const ruaEscolhida = ref<string | null>(null)
const saidaPrevista = ref<string | null>(null)
const erroDaRua = ref<string | null>(null)
const erroDaSaida = ref<string | null>(null)
const erroDoEnvio = ref<string | null>(null)
const enviando = ref(false)

const grupos = computed(() =>
  agora.value?.faixaHorária ? gruposDaSaidaPrevista(faixasHorarias.value ?? [], agora.value.faixaHorária) : [],
)

const gaveta = ref<{ abrir: () => void, fechar: () => void }>()

function escolherRua(id: string) {
  ruaEscolhida.value = id
  erroDaRua.value = null
}

// --- Localização ligada ---------------------------------------------------

/** Ponto do carro lido neste registro; null no modo manual. */
const pontoDoCarro = ref<Ponto | null>(null)
/** Rua coberta proposta pela localização; o colaborador pode trocar. */
const ruaProposta = ref<string | null>(null)
const localizando = ref(false)
const erroDaLocalizacao = ref<string | null>(null)

async function usarMinhaLocalizacao() {
  if (localizando.value) return
  localizando.value = true
  erroDaLocalizacao.value = null
  const leitura = await lerLocalizacao()
  localizando.value = false
  if (leitura.tipo === 'lida') {
    pontoDoCarro.value = leitura.ponto
    ruaProposta.value = areaCoberta.ruaMaisPróxima(leitura.ponto).id
    escolherRua(ruaProposta.value)
    return
  }
  // Sem localização, o registro segue no modo manual, sem ponto do carro.
  pontoDoCarro.value = null
  ruaProposta.value = null
  erroDaLocalizacao.value = leitura.tipo === 'negada'
    ? 'A localização não foi liberada. Escolha a rua coberta na lista; sem a localização, o registro não guarda o ponto do carro.'
    : 'Não foi possível ler a sua localização agora. Escolha a rua coberta na lista; sem a localização, o registro não guarda o ponto do carro.'
}

function escolherSaida(faixaHoraria: string) {
  saidaPrevista.value = faixaHoraria
  erroDaSaida.value = null
  gaveta.value?.fechar()
}

const vagaRecemRegistrada = useState('vaga-recem-registrada', () => false)

async function registrar() {
  erroDaRua.value = ruaEscolhida.value ? null : 'Escolha a rua coberta onde você estacionou.'
  erroDaSaida.value = saidaPrevista.value ? null : 'Escolha a faixa horária em que você pretende sair.'
  const rua = ruas.value?.find((r) => r.id === ruaEscolhida.value)
  if (!rua || !saidaPrevista.value || enviando.value) return

  enviando.value = true
  erroDoEnvio.value = null
  try {
    const registrado = await $fetch('/api/registros', {
      method: 'POST',
      body: { ruaCoberta: rua.id, saídaPrevista: saidaPrevista.value },
    })
    dados ??= dadosDoCelularDoAparelho()
    dados.guardarRegistro({
      código: registrado.código,
      noite: registrado.noite,
      ruaCoberta: { id: rua.id, nome: rua.nome },
      chegada: registrado.chegada,
      saídaPrevista: saidaPrevista.value,
    }, pontoDoCarro.value ?? undefined)
    vagaRecemRegistrada.value = true
    await navigateTo('/minha-vaga', { replace: true })
  }
  catch (erro) {
    const { statusCode, data } = erro as { statusCode?: number, data?: { message?: string } }
    erroDoEnvio.value = statusCode === 400 && data?.message
      ? `${data.message}.`
      : 'Não foi possível registrar agora. Tente de novo em instantes.'
  }
  finally {
    enviando.value = false
  }
}

/** Volta para a tela anterior; aberto direto pelo link, vai para Minha vaga. */
function voltar() {
  if (window.history.state?.back) router.back()
  else navigateTo('/minha-vaga')
}
</script>

<template>
  <main class="registrar">
    <button type="button" class="voltar" aria-label="Voltar" @click="voltar">
      <UIcon name="i-lucide-arrow-left" class="icone-voltar" aria-hidden="true" />
    </button>

    <h1 class="titulo">Registrar vaga</h1>
    <p class="explicacao">
      Avise quem está chegando quando a sua vaga deve ficar livre. O registro leva só a rua coberta e as
      faixas horárias de chegada e de saída, sem a sua posição e sem nada que identifique você.
    </p>

    <div v-if="!agora && !erroDoAgora" class="esqueleto" aria-busy="true" aria-label="Carregando" />

    <p v-else-if="erroDoAgora" class="mensagem">
      Não foi possível carregar agora. Tente de novo em instantes.
    </p>

    <p v-else-if="agora && agora.faixaHorária === null" class="mensagem">
      O registro de vaga vale das 17h às 23h, o horário da área coberta. Registre quando estacionar nesse horário.
    </p>

    <form v-else id="registro" class="formulario" novalidate @submit.prevent="registrar">
      <section class="secao" aria-labelledby="rotulo-rua">
        <h2 id="rotulo-rua" class="etiqueta">Rua coberta</h2>

        <button
          type="button"
          class="secundario"
          :aria-busy="localizando"
          :aria-describedby="erroDaLocalizacao ? 'erro-localizacao' : 'nota-localizacao'"
          @click="usarMinhaLocalizacao"
        >
          <UIcon v-if="localizando" name="i-lucide-loader-circle" class="icone carregando" aria-hidden="true" />
          <UIcon v-else name="i-lucide-locate" class="icone" aria-hidden="true" />
          {{ localizando ? 'Lendo a sua localização' : 'Usar minha localização' }}
        </button>
        <p v-if="erroDaLocalizacao" id="erro-localizacao" class="erro" role="alert">
          <UIcon name="i-lucide-circle-alert" class="icone" aria-hidden="true" />
          {{ erroDaLocalizacao }}
        </p>
        <p v-else-if="ruaProposta" id="nota-localizacao" class="nota" role="status">
          <UIcon name="i-lucide-locate" class="icone" aria-hidden="true" />
          {{ ruaEscolhida === ruaProposta
            ? 'Rua proposta pela sua localização. Se não for esta, toque na rua certa.'
            : 'Rua trocada. O ponto do carro continua guardado só neste celular.' }}
        </p>
        <p v-else id="nota-localizacao" class="nota">
          Com a localização, o celular propõe a rua coberta mais próxima e guarda o ponto do carro só neste
          aparelho, para Voltar até o carro. Ou escolha a rua na lista.
        </p>

        <div class="opcoes" role="radiogroup" aria-labelledby="rotulo-rua" :aria-describedby="erroDaRua ? 'erro-rua' : undefined">
          <button
            v-for="rua in ruas"
            :key="rua.id"
            type="button"
            role="radio"
            class="opcao"
            :class="{ escolhida: ruaEscolhida === rua.id }"
            :aria-checked="ruaEscolhida === rua.id"
            @click="escolherRua(rua.id)"
          >
            <UIcon name="i-lucide-signpost" class="icone-opcao" aria-hidden="true" />
            <span class="nome-opcao">{{ rua.nome }}</span>
            <span class="distancia-opcao">{{ distanciaAPe(rua.distânciaAoDestino) }}</span>
          </button>
        </div>
        <p v-if="erroDaRua" id="erro-rua" class="erro">
          <UIcon name="i-lucide-circle-alert" class="icone" aria-hidden="true" />
          {{ erroDaRua }}
        </p>
      </section>

      <section class="secao">
        <h2 id="rotulo-saida" class="etiqueta">Saída prevista</h2>
        <button
          type="button"
          class="campo"
          aria-labelledby="rotulo-saida valor-saida"
          :aria-describedby="erroDaSaida ? 'erro-saida' : undefined"
          aria-haspopup="dialog"
          @click="gaveta?.abrir()"
        >
          <span id="valor-saida" :class="{ vazio: !saidaPrevista }">
            {{ saidaPrevista ? intervaloDaFaixaHoraria(saidaPrevista) : 'Escolher faixa horária' }}
          </span>
          <UIcon name="i-lucide-chevron-down" class="icone" aria-hidden="true" />
        </button>
        <p v-if="erroDaSaida" id="erro-saida" class="erro">
          <UIcon name="i-lucide-circle-alert" class="icone" aria-hidden="true" />
          {{ erroDaSaida }}
        </p>
      </section>

      <p v-if="erroDoEnvio" class="erro" role="alert">
        <UIcon name="i-lucide-circle-alert" class="icone" aria-hidden="true" />
        {{ erroDoEnvio }}
      </p>
    </form>

    <footer v-if="agora?.faixaHorária" class="rodape">
      <button type="submit" form="registro" class="principal" :aria-busy="enviando">
        <UIcon v-if="enviando" name="i-lucide-loader-circle" class="carregando" aria-label="Registrando" />
        <template v-else>Registrar vaga</template>
      </button>
    </footer>

    <GavetaDeEscolha
      ref="gaveta"
      titulo="Saída prevista"
      :grupos="grupos"
      :escolhida="saidaPrevista"
      @salvar="escolherSaida"
    />
  </main>
</template>

<style scoped>
.registrar {
  max-width: var(--paro-largura-conteudo);
  margin: 0 auto;
  padding: var(--paro-esp-4) var(--paro-margem) var(--paro-esp-8);
}

/* Botão de ícone (design system, "Botões"). */
.voltar {
  display: grid;
  place-items: center;
  width: calc(var(--paro-esp-8) + var(--paro-esp-2));
  height: calc(var(--paro-esp-8) + var(--paro-esp-2));
  margin-bottom: var(--paro-esp-4);
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-botao);
  cursor: pointer;
}

@media (min-width: 1024px) {
  .voltar {
    width: calc(var(--paro-esp-8) + var(--paro-esp-1));
    height: calc(var(--paro-esp-8) + var(--paro-esp-1));
  }
}

.icone-voltar {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
}

.titulo {
  font-size: var(--paro-texto-titulo);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.explicacao {
  max-width: 70ch;
  margin-top: var(--paro-esp-2);
  font-size: var(--paro-texto-legenda);
  color: var(--paro-texto-fraco);
}

.formulario {
  display: grid;
  gap: var(--paro-esp-8);
  margin-top: var(--paro-esp-8);
}

.secao {
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

/* Botão secundário (design system, "Botões"). */
.secundario {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--paro-esp-2);
  width: 100%;
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

.secundario .carregando {
  width: var(--paro-esp-4);
  height: var(--paro-esp-4);
}

.nota {
  display: flex;
  align-items: flex-start;
  gap: var(--paro-esp-2);
  max-width: 70ch;
  font-size: var(--paro-texto-legenda);
  color: var(--paro-texto-fraco);
}

.nota .icone,
.erro .icone {
  margin-top: 0.1em;
}

/* Seletor de opção com ícone (design system, "Formulários"; referência Pangea). */
.opcoes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--paro-esp-2);
}

.opcao {
  display: grid;
  align-content: start;
  justify-items: start;
  gap: var(--paro-esp-1);
  padding: var(--paro-esp-3);
  text-align: left;
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-botao);
  cursor: pointer;
}

.opcao.escolhida {
  color: var(--paro-destaque-texto);
  background: var(--paro-destaque);
  /* Borda de 1,5 px; o padding perde 0,5 px para a opção não mudar de tamanho. */
  padding: calc(var(--paro-esp-3) - 0.5px);
  border: 1.5px solid var(--paro-destaque-texto);
}

.icone-opcao {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
  margin-bottom: var(--paro-esp-1);
}

.nome-opcao {
  font-size: var(--paro-texto-interface);
  font-weight: 600;
  line-height: 1.2;
}

.distancia-opcao {
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto-fraco);
}

/* Texto fraco nunca sobre o destaque: na opção escolhida, o texto do par. */
.opcao.escolhida .distancia-opcao {
  color: var(--paro-destaque-texto);
}

/* Campo (design system, "Formulários"): 48 px, superfície, borda, raio 10 px. */
.campo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--paro-esp-3);
  width: 100%;
  height: var(--paro-esp-12);
  padding: 0 var(--paro-esp-4);
  font-size: var(--paro-texto-interface);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-botao);
  cursor: pointer;
}

@media (min-width: 1024px) {
  .campo { height: calc(var(--paro-esp-8) + var(--paro-esp-2)); }
}

.vazio {
  color: var(--paro-texto-fraco);
}

.icone {
  flex: none;
  width: var(--paro-esp-4);
  height: var(--paro-esp-4);
}

/* Erro em texto de perigo, com ícone, nunca só cor (design system, "Formulários"). */
.erro {
  display: flex;
  align-items: flex-start;
  gap: var(--paro-esp-2);
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  color: var(--paro-perigo-texto);
}

.mensagem {
  margin-top: var(--paro-esp-8);
  padding: var(--paro-esp-4);
  font-size: var(--paro-texto-corpo);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-linha);
}

.esqueleto {
  height: calc(var(--paro-esp-16) * 4);
  margin-top: var(--paro-esp-8);
  background: var(--paro-superficie-suave);
  border-radius: var(--paro-raio-card);
}

/* Ação principal fixa no rodapé (design system, "Padrões de navegação"). */
.rodape {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  max-width: var(--paro-largura-conteudo);
  margin: 0 auto;
  padding: var(--paro-esp-3) var(--paro-margem) calc(var(--paro-esp-3) + env(safe-area-inset-bottom));
  background: var(--paro-fundo);
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

.carregando {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
  animation: girar 1s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}
</style>
