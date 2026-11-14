<!--
  Ajustes (referências Grok, Waymo e Pangea): rotina, forma de colaborar em
  linhas com seletor, a sugestão de rua, o aviso de privacidade e "Apagar
  histórico" no fim da lista, sempre com confirmação. Rotina e forma de
  colaborar ficam só no celular (ADRs 0004, 0010 e 0015); a sugestão de rua
  vai ao servidor só com o texto (ADR 0013).
-->
<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import type { DadosDoCelular, FormaDeColaborar } from '~/dados-do-celular'

// No desktop, abre no painel da direita, com o mapa ao lado.
definePageMeta({ painelDesktop: 'direita' })

const { data: faixasHorarias } = await useFaixasHorarias()
/** Noite de agora; lida no navegador, para saber se há um registro de vaga aberto. */
const { lerNoite } = useAgora()

/** A rotina e a forma de colaborar ficam só no celular: são lidas e guardadas no navegador. */
let dados: DadosDoCelular | undefined
const rotina = ref<string | null>(null)
const forma = ref<FormaDeColaborar>('nenhuma')

onMounted(() => {
  dados = dadosDoCelularDoAparelho()
  rotina.value = dados.rotina()
  forma.value = dados.formaDeColaborar()
})

function escolher(faixaHoraria: string | null) {
  dados?.definirRotina(faixaHoraria)
  rotina.value = faixaHoraria
}

// --- Forma de colaborar (ADR 0010) ---------------------------------------------

function mudarForma(nova: FormaDeColaborar) {
  dados?.definirFormaDeColaborar(nova)
  forma.value = nova
}

/** Ligar o registro de vaga começa no manual: a localização continua desligada. */
function mudarRegistro(ligado: boolean) {
  mudarForma(ligado ? 'manual' : 'nenhuma')
}

function mudarLocalizacao(ligada: boolean) {
  mudarForma(ligada ? 'localizacao-ligada' : 'manual')
}

// --- Sugestão de rua (ADR 0013) -----------------------------------------------

const sugestao = ref<{ abrir: () => void, fechar: () => void }>()
const formularioDeSugestao = ref<{ limpar: () => void }>()

function sugestaoEnviada() {
  sugestao.value?.fechar()
  avisar('Sugestão enviada para a equipe.')
}

// --- Privacidade e Apagar histórico ---------------------------------------------

const privacidade = ref<{ abrir: () => void }>()
const confirmacao = ref<{ abrir: () => void, fechar: () => void }>()
/** Registro de vaga aberto nesta noite: sem o código, não dá mais para tocar em "Saí" (ADR 0014). */
const temRegistroAberto = ref(false)

const { avisar } = useAvisoFlutuanteStore()

/**
 * Sem a noite de agora (ainda carregando ou sem conexão), não dá para saber
 * se o registro guardado ainda vale: o aviso aparece por precaução.
 */
async function pedirConfirmacao() {
  dados ??= dadosDoCelularDoAparelho()
  const noite = await lerNoite()
  temRegistroAberto.value = noite ? dados.registroAtual(noite) !== null : true
  confirmacao.value?.abrir()
}

function apagarHistorico() {
  dados ??= dadosDoCelularDoAparelho()
  dados.apagarHistorico()
  rotina.value = null
  confirmacao.value?.fechar()
  avisar('Histórico apagado deste celular.')
}
</script>

<template>
  <main class="ajustes">
    <h1 class="titulo">
      Ajustes
    </h1>

    <section
      class="secao"
      aria-labelledby="titulo-rotina"
    >
      <h2
        id="titulo-rotina"
        class="etiqueta"
      >
        Rotina
      </h2>

      <div class="card">
        <h3
          id="nome-rotina"
          class="nome"
        >
          Horário de chegada habitual
        </h3>
        <p class="explicacao">
          O Parô abre na faixa horária em que você costuma chegar. Sem rotina, abre em Agora.
          Fica guardada só neste celular.
        </p>

        <div
          class="opcoes"
          role="radiogroup"
          aria-labelledby="nome-rotina"
        >
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

    <section
      class="secao"
      aria-labelledby="titulo-forma"
    >
      <h2
        id="titulo-forma"
        class="etiqueta"
      >
        Forma de colaborar
      </h2>

      <div class="card linhas">
        <LinhaComSeletor
          titulo="Registrar vagas"
          explicacao="Ao estacionar, registre a vaga com a saída prevista para avisar quem está chegando. Desligado, o registro de vaga não aparece."
          icone="i-lucide-car"
          :ligado="forma !== 'nenhuma'"
          @mudar="mudarRegistro"
        />
        <LinhaComSeletor
          v-if="forma !== 'nenhuma'"
          class="separada"
          titulo="Usar localização"
          explicacao="Ao registrar, o celular lê a sua posição uma vez e propõe a rua coberta mais próxima. Desligada, você escolhe a rua numa lista e o Parô não lê a localização. A permissão do navegador se tira nos ajustes dele."
          icone="i-lucide-locate"
          :ligado="forma === 'localizacao-ligada'"
          @mudar="mudarLocalizacao"
        />
      </div>
    </section>

    <section
      class="secao"
      aria-labelledby="titulo-sugestao"
    >
      <h2
        id="titulo-sugestao"
        class="etiqueta"
      >
        Sugestão de rua
      </h2>

      <div class="card">
        <button
          type="button"
          class="linha-link"
          aria-haspopup="dialog"
          @click="sugestao?.abrir()"
        >
          <UIcon
            name="i-lucide-map-pin-plus"
            class="icone"
            aria-hidden="true"
          />
          <span class="nome-linha">Sugerir rua ou trecho</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="icone"
            aria-hidden="true"
          />
        </button>
      </div>
    </section>

    <section
      class="secao"
      aria-labelledby="titulo-privacidade"
    >
      <h2
        id="titulo-privacidade"
        class="etiqueta"
      >
        Privacidade
      </h2>

      <div class="card">
        <button
          type="button"
          class="linha-link"
          aria-haspopup="dialog"
          @click="privacidade?.abrir()"
        >
          <UIcon
            name="i-lucide-shield"
            class="icone"
            aria-hidden="true"
          />
          <span class="nome-linha">Como o Parô trata os seus dados</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="icone"
            aria-hidden="true"
          />
        </button>
      </div>

      <!-- Ação de apagar no fim da lista (referência Grok); sempre com confirmação. -->
      <div class="apagar">
        <button
          type="button"
          class="destrutivo"
          aria-haspopup="dialog"
          @click="pedirConfirmacao"
        >
          <UIcon
            name="i-lucide-trash-2"
            class="icone"
            aria-hidden="true"
          />
          Apagar histórico
        </button>
        <p class="explicacao">
          Limpa deste celular a rotina, o registro de vaga com o código e o ponto do carro.
        </p>
      </div>
    </section>

    <Gaveta
      ref="sugestao"
      titulo="Sugerir rua ou trecho"
      @fechada="formularioDeSugestao?.limpar()"
    >
      <FormularioDeSugestao
        ref="formularioDeSugestao"
        @enviada="sugestaoEnviada"
      />
    </Gaveta>

    <Gaveta
      ref="privacidade"
      titulo="Como o Parô trata os seus dados"
    >
      <AvisoDePrivacidade />
    </Gaveta>

    <Gaveta
      ref="confirmacao"
      titulo="Apagar histórico?"
    >
      <div class="confirmacao">
        <p class="texto">
          Apaga deste celular a rotina, o registro de vaga com o código e o ponto do carro. Não dá para desfazer.
          A forma de colaborar continua como está.
        </p>

        <aside
          v-if="temRegistroAberto"
          class="aviso-perigo"
          role="alert"
        >
          <UIcon
            name="i-lucide-circle-alert"
            class="icone-pequeno"
            aria-hidden="true"
          />
          <div class="aviso-textos">
            <p>
              Se você tem um registro de vaga aberto nesta noite: sem o código, não dá mais para mudar a saída prevista
              nem tocar em "Saí", e a sua saída prevista continua contando para quem está chegando até o fim da noite.
            </p>
            <NuxtLink
              to="/minha-vaga"
              class="link-perigo"
              @click="confirmacao?.fechar()"
            >
              Tocar em "Saí" antes, em Minha vaga
            </NuxtLink>
          </div>
        </aside>

        <div class="botoes">
          <button
            type="button"
            class="link"
            @click="confirmacao?.fechar()"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="secundario destrutivo-confirmar"
            @click="apagarHistorico"
          >
            <UIcon
              name="i-lucide-trash-2"
              class="icone-pequeno"
              aria-hidden="true"
            />
            Apagar
          </button>
        </div>
      </div>
    </Gaveta>
  </main>
</template>

<style scoped>
.ajustes {
  max-width: var(--paro-largura-conteudo);
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
  max-width: 70ch;
  font-size: var(--paro-texto-legenda);
  color: var(--paro-texto-fraco);
}

.opcoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--paro-esp-2);
  margin-top: var(--paro-esp-2);
}

/* Linhas do mesmo card separadas por --paro-borda (referência Waymo). */
.linhas {
  gap: 0;
}

.separada {
  margin-top: var(--paro-esp-4);
  padding-top: var(--paro-esp-4);
  border-top: 1px solid var(--paro-borda);
}

/* Linha com ícone, rótulo e seta (referência Waymo). */
.linha-link {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--paro-esp-3);
  min-height: calc(var(--paro-esp-8) + var(--paro-esp-3));
  text-align: left;
  color: var(--paro-texto);
  cursor: pointer;
}

.nome-linha {
  font-size: var(--paro-texto-corpo);
  font-weight: 600;
}

.icone {
  flex: none;
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
}

.icone-pequeno {
  flex: none;
  width: var(--paro-esp-4);
  height: var(--paro-esp-4);
}

.apagar {
  display: grid;
  gap: var(--paro-esp-1);
  margin-top: var(--paro-esp-6);
}

/* Botão destrutivo (design system, "Botões"): texto de perigo, sem fundo. */
.destrutivo {
  display: flex;
  align-items: center;
  justify-self: start;
  gap: var(--paro-esp-2);
  min-height: calc(var(--paro-esp-8) + var(--paro-esp-3));
  font-size: var(--paro-texto-corpo);
  font-weight: 600;
  color: var(--paro-perigo-texto);
  cursor: pointer;
}

.confirmacao {
  display: grid;
  gap: var(--paro-esp-4);
}

.texto {
  max-width: 70ch;
  font-size: var(--paro-texto-corpo);
}

/* Card Aviso com o sinal de perigo; só o texto do próprio par sobre o fundo. */
.aviso-perigo {
  display: flex;
  align-items: flex-start;
  gap: var(--paro-esp-3);
  padding: var(--paro-esp-3) var(--paro-esp-4);
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  color: var(--paro-perigo-texto);
  background: var(--paro-perigo);
  border-radius: var(--paro-raio-linha);
}

.aviso-perigo .icone-pequeno {
  margin-top: 0.1em;
}

.aviso-textos {
  display: grid;
  gap: var(--paro-esp-2);
}

.link-perigo {
  font-weight: 600;
  text-decoration: underline;
}

.botoes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--paro-esp-2);
}

/* Botão link (design system, "Botões"): "Cancelar". */
.link {
  min-height: calc(var(--paro-esp-12) + var(--paro-esp-1));
  font-size: var(--paro-texto-interface);
  font-weight: 600;
  color: var(--paro-destaque-texto);
  cursor: pointer;
}

/* Botão secundário (design system, "Botões"). */
.secundario {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--paro-esp-2);
  min-height: calc(var(--paro-esp-12) + var(--paro-esp-1));
  padding: 0 var(--paro-esp-4);
  font-size: var(--paro-texto-interface);
  font-weight: 600;
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-botao);
  cursor: pointer;
}

.secundario:active {
  transform: scale(0.98);
}

/* Na confirmação, o botão de apagar leva o texto de perigo. */
.destrutivo-confirmar {
  color: var(--paro-perigo-texto);
}
</style>
