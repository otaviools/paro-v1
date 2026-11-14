<!--
  Tela da equipe: lê e apaga as sugestões de rua (ADRs 0013 e 0021; design
  system, "Formulários › Campo de texto" e "Tabelas"). Sem conta: a chave da
  equipe é digitada aqui, vai no cabeçalho Authorization e fica só nesta aba
  do navegador (sessionStorage), nunca na URL nem no servidor. Cada sugestão
  é apagada pela equipe depois de lida, sempre com confirmação.
-->
<script setup lang="ts">
definePageMeta({ semBarraDeAbas: true, foraDoPainelDesktop: true })
useHead({ title: 'Sugestões de rua · Parô', meta: [{ name: 'robots', content: 'noindex' }] })

/** Onde a chave fica enquanto a aba estiver aberta. */
const CHAVE_NA_SESSAO = 'paro:chave-da-equipe'

function lerChaveDaSessao(): string | null {
  try {
    return sessionStorage.getItem(CHAVE_NA_SESSAO)
  }
  catch {
    return null
  }
}

function guardarChaveNaSessao(valor: string | null) {
  try {
    if (valor === null) sessionStorage.removeItem(CHAVE_NA_SESSAO)
    else sessionStorage.setItem(CHAVE_NA_SESSAO, valor)
  }
  catch {
    // Sem sessionStorage (navegação privada restrita): a chave fica só na memória desta tela.
  }
}

const id = useId()
const digitada = ref('')
/** Chave aceita pelo servidor; enquanto for null, a tela pede a chave. */
const chave = ref<string | null>(null)
const sugestoes = ref<SugestaoDeRua[]>([])
const carregando = ref(false)
const erroDaChave = ref<string | null>(null)
const erroDaLista = ref<string | null>(null)

const { lerSugestoes, apagarSugestao } = useSugestoesDeRua()

function sair(motivo: string | null = null) {
  guardarChaveNaSessao(null)
  chave.value = null
  sugestoes.value = []
  erroDaChave.value = motivo
}

async function carregar(valor: string) {
  carregando.value = true
  erroDaChave.value = null
  erroDaLista.value = null
  const resultado = await lerSugestoes(valor)
  carregando.value = false
  if (resultado.tipo === 'lidas') {
    sugestoes.value = resultado.sugestoes
    chave.value = valor
    guardarChaveNaSessao(valor)
    digitada.value = ''
  }
  else if (resultado.tipo === 'chave-incorreta') sair('Chave da equipe incorreta.')
  else if (chave.value) erroDaLista.value = 'Não foi possível carregar. Tente de novo.'
  else erroDaChave.value = 'Não foi possível carregar. Tente de novo.'
}

function entrar() {
  const valor = digitada.value.trim()
  if (!valor) {
    erroDaChave.value = 'Digite a chave da equipe.'
    return
  }
  carregar(valor)
}

onMounted(() => {
  const guardada = lerChaveDaSessao()
  if (guardada) carregar(guardada)
})

// --- Apagar depois de ler (ADR 0021) --------------------------------------------

const confirmacao = ref<{ abrir: () => void, fechar: () => void }>()
const aApagar = ref<SugestaoDeRua | null>(null)
const apagando = ref(false)
const { avisar } = useAvisoFlutuante()

function pedirConfirmacao(sugestao: SugestaoDeRua) {
  aApagar.value = sugestao
  erroDaLista.value = null
  confirmacao.value?.abrir()
}

async function apagar() {
  const sugestao = aApagar.value
  if (!sugestao || !chave.value || apagando.value) return
  apagando.value = true
  const resultado = await apagarSugestao(chave.value, sugestao.id)
  apagando.value = false
  confirmacao.value?.fechar()
  if (resultado === 'apagada') {
    sugestoes.value = sugestoes.value.filter(s => s.id !== sugestao.id)
    avisar('Sugestão apagada.')
  }
  else if (resultado === 'chave-incorreta') sair('Chave da equipe incorreta.')
  else erroDaLista.value = 'Não foi possível apagar. Tente de novo.'
}

/** "AAAA-MM-DD" → "DD/MM/AAAA". */
function dataCompleta(data: string) {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}
</script>

<template>
  <main class="equipe">
    <h1 class="titulo">
      Sugestões de rua
    </h1>
    <p class="explicacao">
      Ruas ou trechos fora da área coberta sugeridos pelos motoristas, sem identificação. Apague cada sugestão
      depois de ler: é texto livre e pode conter dado pessoal.
    </p>

    <form
      v-if="!chave"
      class="card"
      novalidate
      @submit.prevent="entrar"
    >
      <div class="campo">
        <label
          :for="`${id}-chave`"
          class="rotulo"
        >Chave da equipe</label>
        <input
          :id="`${id}-chave`"
          v-model="digitada"
          type="password"
          class="entrada"
          autocomplete="off"
          :aria-invalid="erroDaChave !== null"
          :aria-describedby="`${id}-nota${erroDaChave ? ` ${id}-erro` : ''}`"
        >
        <p
          :id="`${id}-nota`"
          class="nota"
        >
          Fica só nesta aba do navegador e some ao fechá-la.
        </p>
        <p
          v-if="erroDaChave"
          :id="`${id}-erro`"
          class="erro"
          role="alert"
        >
          <UIcon
            name="i-lucide-circle-alert"
            class="icone-pequeno"
            aria-hidden="true"
          />
          {{ erroDaChave }}
        </p>
      </div>

      <button
        type="submit"
        class="principal"
        :aria-busy="carregando"
      >
        <UIcon
          v-if="carregando"
          name="i-lucide-loader-circle"
          class="carregando"
          aria-label="Carregando"
        />
        <template v-else>
          Ver sugestões
        </template>
      </button>
    </form>

    <section
      v-else
      class="secao"
      aria-labelledby="titulo-lista"
    >
      <div class="topo">
        <h2
          id="titulo-lista"
          class="etiqueta"
        >
          {{ sugestoes.length === 1 ? '1 sugestão' : `${sugestoes.length} sugestões` }}
        </h2>
        <div class="acoes">
          <button
            type="button"
            class="link"
            :aria-busy="carregando"
            @click="carregar(chave)"
          >
            <UIcon
              name="i-lucide-refresh-cw"
              class="icone-pequeno"
              aria-hidden="true"
            />
            Atualizar
          </button>
          <button
            type="button"
            class="link"
            @click="sair()"
          >
            <UIcon
              name="i-lucide-log-out"
              class="icone-pequeno"
              aria-hidden="true"
            />
            Sair
          </button>
        </div>
      </div>

      <p
        v-if="erroDaLista"
        class="erro"
        role="alert"
      >
        <UIcon
          name="i-lucide-circle-alert"
          class="icone-pequeno"
          aria-hidden="true"
        />
        {{ erroDaLista }}
      </p>

      <p
        v-if="sugestoes.length === 0"
        class="vazio"
      >
        Nenhuma sugestão de rua para ler.
      </p>

      <!-- Tabela (design system, "Tabelas"); no celular, cada linha vira um bloco. -->
      <table
        v-else
        class="tabela"
      >
        <thead>
          <tr>
            <th scope="col">
              Data
            </th>
            <th scope="col">
              Sugestão
            </th>
            <th scope="col">
              <span class="so-leitor">Ação</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="sugestao in sugestoes"
            :key="sugestao.id"
          >
            <td class="data">
              {{ dataCompleta(sugestao.data) }}
            </td>
            <td class="texto">
              {{ sugestao.texto }}
            </td>
            <td class="acao">
              <button
                type="button"
                class="destrutivo"
                aria-haspopup="dialog"
                @click="pedirConfirmacao(sugestao)"
              >
                <UIcon
                  name="i-lucide-trash-2"
                  class="icone-pequeno"
                  aria-hidden="true"
                />
                Apagar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <Gaveta
      ref="confirmacao"
      titulo="Apagar sugestão?"
    >
      <div class="confirmacao">
        <p class="texto-confirmacao">
          "{{ aApagar?.texto }}" sai do servidor. Não dá para desfazer.
        </p>
        <div class="botoes">
          <button
            type="button"
            class="link link-grande"
            @click="confirmacao?.fechar()"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="secundario destrutivo-confirmar"
            :aria-busy="apagando"
            @click="apagar"
          >
            <UIcon
              v-if="apagando"
              name="i-lucide-loader-circle"
              class="carregando"
              aria-label="Apagando"
            />
            <template v-else>
              <UIcon
                name="i-lucide-trash-2"
                class="icone-pequeno"
                aria-hidden="true"
              />
              Apagar
            </template>
          </button>
        </div>
      </div>
    </Gaveta>
  </main>
</template>

<style scoped>
.equipe {
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

.explicacao {
  max-width: 70ch;
  margin-top: var(--paro-esp-2);
  font-size: var(--paro-texto-legenda);
  color: var(--paro-texto-fraco);
}

.card {
  display: grid;
  gap: var(--paro-esp-4);
  margin-top: var(--paro-esp-8);
  padding: var(--paro-esp-4);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-card);
}

@media (min-width: 1024px) {
  .card { padding: var(--paro-esp-6); }
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

.nota {
  font-size: var(--paro-texto-nota);
  color: var(--paro-texto-fraco);
}

/* Erro em texto de perigo, com ícone (design system, "Formulários"). */
.erro {
  display: flex;
  align-items: center;
  gap: var(--paro-esp-2);
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  color: var(--paro-perigo-texto);
}

.secao {
  display: grid;
  gap: var(--paro-esp-3);
  margin-top: var(--paro-esp-8);
}

.topo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--paro-esp-2);
}

.etiqueta {
  font-size: var(--paro-texto-etiqueta);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--paro-texto-fraco);
}

.acoes {
  display: flex;
  gap: var(--paro-esp-4);
}

/* Botão link (design system, "Botões"). */
.link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--paro-esp-2);
  min-height: calc(var(--paro-esp-8) + var(--paro-esp-3));
  font-size: var(--paro-texto-interface);
  font-weight: 600;
  color: var(--paro-destaque-texto);
  cursor: pointer;
}

.link-grande {
  min-height: calc(var(--paro-esp-12) + var(--paro-esp-1));
}

.vazio {
  padding: var(--paro-esp-4) 0;
  font-size: var(--paro-texto-corpo);
  color: var(--paro-texto-fraco);
}

/*
 * Tabela (design system, "Tabelas"): sem caixa, linhas separadas por 1 px em
 * --paro-borda, cabeçalho em etiqueta, linhas de 48 px, sem listras nem
 * bordas verticais.
 */
.tabela {
  width: 100%;
  border-collapse: collapse;
}

.tabela th {
  padding: 0 var(--paro-esp-3) var(--paro-esp-2) 0;
  font-size: var(--paro-texto-etiqueta);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: left;
  text-transform: uppercase;
  color: var(--paro-texto-fraco);
  border-bottom: 1px solid var(--paro-borda);
}

.tabela td {
  height: var(--paro-esp-12);
  padding: var(--paro-esp-2) var(--paro-esp-3) var(--paro-esp-2) 0;
  font-size: var(--paro-texto-corpo);
  vertical-align: middle;
  border-bottom: 1px solid var(--paro-borda);
}

.data {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto-fraco);
}

.texto {
  overflow-wrap: anywhere;
}

.tabela .acao {
  padding-right: 0;
  text-align: right;
}

/* No celular, toda tabela vira lista de linhas (design system, "Tabelas"). */
@media (max-width: 1023px) {
  .tabela thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .tabela tbody,
  .tabela tr {
    display: block;
  }

  .tabela tr {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: var(--paro-esp-3);
    padding: var(--paro-esp-3) 0;
    border-bottom: 1px solid var(--paro-borda);
  }

  .tabela td {
    height: auto;
    padding: 0;
    border-bottom: 0;
  }

  .tabela .data {
    grid-column: 1;
    font-size: var(--paro-texto-legenda);
  }

  .tabela .texto {
    grid-column: 1;
    grid-row: 2;
  }

  .tabela .acao {
    grid-column: 2;
    grid-row: 1 / span 2;
  }
}

.so-leitor {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Botão destrutivo (design system, "Botões"): texto de perigo, sem fundo, sempre com confirmação. */
.destrutivo {
  display: inline-flex;
  align-items: center;
  gap: var(--paro-esp-2);
  min-height: calc(var(--paro-esp-8) + var(--paro-esp-3));
  font-size: var(--paro-texto-interface);
  font-weight: 600;
  color: var(--paro-perigo-texto);
  cursor: pointer;
}

.icone-pequeno {
  flex: none;
  width: var(--paro-esp-4);
  height: var(--paro-esp-4);
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

.confirmacao {
  display: grid;
  gap: var(--paro-esp-4);
}

.texto-confirmacao {
  max-width: 70ch;
  font-size: var(--paro-texto-corpo);
  overflow-wrap: anywhere;
}

.botoes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--paro-esp-2);
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

.destrutivo-confirmar {
  color: var(--paro-perigo-texto);
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
