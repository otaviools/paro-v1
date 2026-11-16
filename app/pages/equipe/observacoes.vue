<!--
  Tela da equipe: registra as observações feitas em campo (ADRs 0005, 0008 e
  0011; design system, "Formulários" e "Tabelas"). Cada observação é a
  contagem de uma rua coberta numa faixa horária e data: total de vagas e
  vagas ocupadas. Lançar de novo a mesma rua, faixa horária e data corrige a
  anterior. Sem conta: a chave da equipe é digitada aqui, vai no cabeçalho
  Authorization e fica só nesta aba do navegador (sessionStorage), como em
  Sugestões de rua. A chance só usa estas observações quando a fonte do app
  é "reais" (NUXT_FONTE_DE_OBSERVACOES, ADR 0012); a tela mostra qual está
  ativa.
-->
<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { areaCoberta } from '#shared/utils/area-coberta'

definePageMeta({ semBarraDeAbas: true, foraDoPainelDesktop: true })
useHead({ title: 'Observações · Parô', meta: [{ name: 'robots', content: 'noindex' }] })

/** Ocupação a partir da qual a rua conta como cheia (ADR 0005). */
const OCUPACAO_DE_RUA_CHEIA = 85

/** Onde a chave fica enquanto a aba estiver aberta (a mesma de Sugestões de rua). */
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

const digitada = ref('')
/** Chave aceita pelo servidor; enquanto for null, a tela pede a chave. */
const chave = ref<string | null>(null)
const observacoes = ref<ObservacaoRegistrada[]>([])
const fonte = ref<FonteDeObservacoes>('ficticias')
const carregando = ref(false)
const erroDaChave = ref<string | null>(null)
const erroDaLista = ref<string | null>(null)

const { lerObservacoes, registrarObservacao, apagarObservacao } = useObservacoes()
const { avisar } = useAvisoFlutuanteStore()

function sair(motivo: string | null = null) {
  guardarChaveNaSessao(null)
  chave.value = null
  observacoes.value = []
  erroDaChave.value = motivo
}

async function carregar(valor: string) {
  carregando.value = true
  erroDaChave.value = null
  erroDaLista.value = null
  const resultado = await lerObservacoes(valor)
  carregando.value = false
  if (resultado.tipo === 'lidas') {
    observacoes.value = resultado.resposta.observacoes
    fonte.value = resultado.resposta.fonte
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

// --- Nova observação -----------------------------------------------------------

const ruas = areaCoberta.ruasCobertas()
const nomeDaRua = (id: string) => ruas.find(r => r.id === id)?.nome ?? id
const opcoesDeRua = ruas.map(r => ({ label: r.nome, value: r.id }))
const opcoesDeFaixa = areaCoberta.faixasHorarias().map(f => ({ label: intervaloDaFaixaHoraria(f), value: f }))

const hoje = () => areaCoberta.noiteDe(new Date())

const data = ref(hoje())
const ruaCoberta = ref<string | undefined>(undefined)
const faixaHoraria = ref<string | undefined>(undefined)
const totalDeVagas = ref<number | null>(null)
const vagasOcupadas = ref<number | null>(null)
const registrando = ref(false)
const erroDoFormulario = ref<string | null>(null)

/** Ocupação da contagem digitada, para a equipe conferir antes de registrar. */
const ocupacao = computed(() => {
  const total = totalDeVagas.value
  const ocupadas = vagasOcupadas.value
  if (!total || total < 1 || ocupadas === null || ocupadas < 0 || ocupadas > total) return null
  return Math.round((ocupadas * 100) / total)
})

/** Já existe uma observação desta rua, faixa horária e data: registrar corrige. */
const substitui = computed(() => observacoes.value.some(o =>
  o.data === data.value && o.ruaCoberta === ruaCoberta.value && o.faixaHoraria === faixaHoraria.value))

async function registrar() {
  if (!chave.value || registrando.value) return
  erroDoFormulario.value = null
  if (!ruaCoberta.value || !faixaHoraria.value || totalDeVagas.value === null || vagasOcupadas.value === null) {
    erroDoFormulario.value = 'Preencha todos os campos.'
    return
  }
  registrando.value = true
  const resultado = await registrarObservacao(chave.value, {
    data: data.value,
    ruaCoberta: ruaCoberta.value,
    faixaHoraria: faixaHoraria.value,
    totalDeVagas: totalDeVagas.value,
    vagasOcupadas: vagasOcupadas.value,
  })
  registrando.value = false
  if (resultado.tipo === 'registrada') {
    const nova = resultado.observacao
    observacoes.value = [nova, ...observacoes.value.filter(o => o.id !== nova.id)]
      .sort((a, b) => b.data.localeCompare(a.data) || a.faixaHoraria.localeCompare(b.faixaHoraria) || a.ruaCoberta.localeCompare(b.ruaCoberta))
    avisar(`Observação registrada: ${nomeDaRua(nova.ruaCoberta)}, ${rotuloDaFaixaHoraria(nova.faixaHoraria)}.`)
    // Data e faixa horária ficam, para lançar a próxima rua da mesma ronda.
    ruaCoberta.value = undefined
    totalDeVagas.value = null
    vagasOcupadas.value = null
  }
  else if (resultado.tipo === 'invalida') erroDoFormulario.value = `${resultado.mensagem}.`
  else if (resultado.tipo === 'chave-incorreta') sair('Chave da equipe incorreta.')
  else erroDoFormulario.value = 'Não foi possível registrar. Tente de novo.'
}

// --- Apagar uma observação lançada por engano -------------------------------------

const confirmacaoAberta = ref(false)
const aApagar = ref<ObservacaoRegistrada | null>(null)
const apagando = ref(false)

function pedirConfirmacao(observacao: ObservacaoRegistrada) {
  aApagar.value = observacao
  erroDaLista.value = null
  confirmacaoAberta.value = true
}

async function apagar() {
  const observacao = aApagar.value
  if (!observacao || !chave.value || apagando.value) return
  apagando.value = true
  const resultado = await apagarObservacao(chave.value, observacao.id)
  apagando.value = false
  confirmacaoAberta.value = false
  if (resultado === 'apagada') {
    observacoes.value = observacoes.value.filter(o => o.id !== observacao.id)
    avisar('Observação apagada.')
  }
  else if (resultado === 'chave-incorreta') sair('Chave da equipe incorreta.')
  else erroDaLista.value = 'Não foi possível apagar. Tente de novo.'
}

// --- Tabela --------------------------------------------------------------------

/** "AAAA-MM-DD" → "DD/MM/AAAA". */
function dataCompleta(valor: string) {
  const [ano, mes, dia] = valor.split('-')
  return `${dia}/${mes}/${ano}`
}

const ocupacaoDe = (o: ObservacaoRegistrada) => Math.round((o.vagasOcupadas * 100) / o.totalDeVagas)

/*
 * Tabela (design system, "Tabelas"): sem caixa, linhas separadas por 1 px em
 * border-default, cabeçalho em etiqueta, linhas de 48 px. Abaixo de lg, cada
 * linha vira um bloco: data e faixa em cima, rua e contagem embaixo,
 * "Apagar" à direita.
 */
const colunas: TableColumn<ObservacaoRegistrada>[] = [
  { accessorKey: 'data', header: 'Data', meta: { class: { td: 'whitespace-nowrap tabular-nums text-muted max-lg:text-xs' } } },
  { accessorKey: 'faixaHoraria', header: 'Faixa', meta: { class: { td: 'whitespace-nowrap tabular-nums max-lg:text-xs max-lg:text-muted' } } },
  { accessorKey: 'ruaCoberta', header: 'Rua', meta: { class: { td: 'text-default max-lg:col-span-2' } } },
  { id: 'contagem', header: 'Ocupadas / total', meta: { class: { td: 'whitespace-nowrap font-mono tabular-nums max-lg:col-span-2' } } },
  {
    id: 'acao',
    meta: { class: { th: 'pe-0', td: 'pe-0 text-end max-lg:col-start-3 max-lg:row-span-2 max-lg:row-start-1' } },
  },
]
</script>

<template>
  <main class="mx-auto max-w-160 px-5 py-8 lg:px-8">
    <h1 class="text-2xl font-bold leading-tight tracking-tight">
      Observações
    </h1>
    <p class="mt-2 max-w-[70ch] text-xs text-muted">
      Contagens feitas em campo pela equipe: em cada rua coberta e faixa horária, o total de vagas e quantas
      estavam ocupadas. A chance usa as observações do semestre em dias letivos normais.
    </p>

    <UCard
      v-if="!chave"
      as="form"
      class="mt-8"
      novalidate
      :ui="{ body: 'grid gap-4' }"
      @submit.prevent="entrar"
    >
      <UFormField
        label="Chave da equipe"
        description="Fica só nesta aba do navegador e some ao fechá-la."
        :error="erroDaChave ?? false"
        size="lg"
        :ui="{ label: 'font-semibold', description: 'text-xs', container: 'mt-2', error: 'text-xs font-medium' }"
      >
        <UInput
          v-model="digitada"
          type="password"
          autocomplete="off"
          class="w-full"
          :ui="{ base: 'h-12 rounded-paro-md bg-elevated text-sm lg:h-10' }"
        />
        <template #error="{ error: mensagem }">
          <span
            class="flex items-center gap-2"
            role="alert"
          >
            <UIcon
              name="i-lucide-circle-alert"
              class="size-4 shrink-0"
              aria-hidden="true"
            />
            {{ mensagem }}
          </span>
        </template>
      </UFormField>

      <UButton
        type="submit"
        color="neutral"
        size="xl"
        block
        class="h-13 text-lg lg:h-11"
        :loading="carregando"
        :label="carregando ? undefined : 'Ver observações'"
        :aria-label="carregando ? 'Carregando' : undefined"
        :aria-busy="carregando"
      />
    </UCard>

    <template v-else>
      <!-- Qual fonte a chance está usando agora (ADR 0012). -->
      <UAlert
        class="mt-6"
        :color="fonte === 'reais' ? 'success' : 'warning'"
        variant="soft"
        :icon="fonte === 'reais' ? 'i-lucide-circle-check' : 'i-lucide-flask-conical'"
        :title="fonte === 'reais' ? 'A chance usa estas observações' : 'A chance ainda usa dados de demonstração'"
        :description="fonte === 'reais'
          ? 'O aviso de dados de demonstração não aparece mais no app.'
          : 'As observações daqui ficam guardadas, mas só entram na chance quando NUXT_FONTE_DE_OBSERVACOES for &quot;reais&quot; no servidor.'"
        :ui="{ title: 'text-sm', description: 'text-xs font-medium' }"
      />

      <!-- Nova observação (design system, "Formulários"). -->
      <UCard
        as="form"
        class="mt-6"
        novalidate
        aria-labelledby="titulo-nova"
        :ui="{ body: 'grid gap-4' }"
        @submit.prevent="registrar"
      >
        <h2
          id="titulo-nova"
          class="text-base font-semibold"
        >
          Nova observação
        </h2>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField
            label="Data"
            :ui="{ label: 'font-semibold', container: 'mt-2' }"
          >
            <UInput
              v-model="data"
              type="date"
              :max="hoje()"
              class="w-full"
              :ui="{ base: 'h-12 rounded-paro-md bg-elevated text-sm tabular-nums lg:h-10' }"
            />
          </UFormField>
          <UFormField
            label="Faixa horária"
            :ui="{ label: 'font-semibold', container: 'mt-2' }"
          >
            <USelect
              v-model="faixaHoraria"
              :items="opcoesDeFaixa"
              value-key="value"
              placeholder="Escolha"
              class="h-12 w-full rounded-paro-md tabular-nums lg:h-10"
            />
          </UFormField>
        </div>

        <UFormField
          label="Rua coberta"
          :ui="{ label: 'font-semibold', container: 'mt-2' }"
        >
          <USelect
            v-model="ruaCoberta"
            :items="opcoesDeRua"
            value-key="value"
            placeholder="Escolha"
            class="h-12 w-full rounded-paro-md lg:h-10"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField
            label="Total de vagas"
            :ui="{ label: 'font-semibold', container: 'mt-2' }"
          >
            <UInput
              v-model.number="totalDeVagas"
              type="number"
              inputmode="numeric"
              min="1"
              class="w-full"
              :ui="{ base: 'h-12 rounded-paro-md bg-elevated font-mono text-sm tabular-nums lg:h-10' }"
            />
          </UFormField>
          <UFormField
            label="Vagas ocupadas"
            :ui="{ label: 'font-semibold', container: 'mt-2' }"
          >
            <UInput
              v-model.number="vagasOcupadas"
              type="number"
              inputmode="numeric"
              min="0"
              class="w-full"
              :ui="{ base: 'h-12 rounded-paro-md bg-elevated font-mono text-sm tabular-nums lg:h-10' }"
            />
          </UFormField>
        </div>

        <!-- Conferência antes de registrar: ocupação e se a rua conta como cheia. -->
        <p
          v-if="ocupacao !== null"
          class="text-xs font-medium tabular-nums text-muted"
          aria-live="polite"
        >
          Ocupação de {{ ocupacao }}%:
          <strong class="font-semibold text-default">{{ ocupacao >= OCUPACAO_DE_RUA_CHEIA ? 'rua cheia' : 'rua não cheia' }}</strong>
          (cheia a partir de {{ OCUPACAO_DE_RUA_CHEIA }}%).
          <template v-if="substitui">
            Já existe uma observação desta rua nesta faixa e data; registrar corrige a anterior.
          </template>
        </p>

        <p
          v-if="erroDoFormulario"
          class="flex items-center gap-2 text-xs font-medium text-error"
          role="alert"
        >
          <UIcon
            name="i-lucide-circle-alert"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          {{ erroDoFormulario }}
        </p>

        <UButton
          type="submit"
          color="neutral"
          size="xl"
          block
          class="h-13 text-lg lg:h-11"
          :loading="registrando"
          :label="registrando ? undefined : (substitui ? 'Corrigir observação' : 'Registrar observação')"
          :aria-label="registrando ? 'Registrando' : undefined"
          :aria-busy="registrando"
        />
      </UCard>

      <section
        class="mt-8 grid gap-3"
        aria-labelledby="titulo-lista"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="titulo-lista"
            class="text-xs font-semibold uppercase tracking-wider text-muted"
          >
            {{ observacoes.length === 1 ? '1 observação' : `${observacoes.length} observações` }}
          </h2>
          <div class="flex gap-4">
            <UButton
              color="primary"
              variant="link"
              icon="i-lucide-refresh-cw"
              label="Atualizar"
              class="min-h-11 px-0 text-sm"
              :aria-busy="carregando"
              @click="carregar(chave)"
            />
            <UButton
              color="primary"
              variant="link"
              icon="i-lucide-log-out"
              label="Sair"
              class="min-h-11 px-0 text-sm"
              @click="sair()"
            />
          </div>
        </div>

        <p
          v-if="erroDaLista"
          class="flex items-center gap-2 text-xs font-medium text-error"
          role="alert"
        >
          <UIcon
            name="i-lucide-circle-alert"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          {{ erroDaLista }}
        </p>

        <p
          v-if="observacoes.length === 0"
          class="py-4 text-sm text-muted"
        >
          Nenhuma observação registrada.
        </p>

        <UTable
          v-else
          :data="observacoes"
          :columns="colunas"
          :ui="{
            root: 'overflow-visible',
            thead: 'max-lg:sr-only',
            tbody: 'divide-y-0 max-lg:block',
            tr: 'border-b border-default max-lg:grid max-lg:grid-cols-[auto_minmax(0,1fr)_auto] max-lg:items-center max-lg:gap-x-3 max-lg:py-3',
            th: 'ps-0 pe-3 pt-0 pb-2 text-xs font-semibold uppercase tracking-wider text-muted',
            td: 'h-12 py-2 ps-0 pe-3 align-middle text-sm max-lg:h-auto max-lg:p-0',
          }"
        >
          <template #data-cell="{ row }">
            {{ dataCompleta(row.original.data) }}
          </template>
          <template #faixaHoraria-cell="{ row }">
            {{ intervaloDaFaixaHoraria(row.original.faixaHoraria) }}
          </template>
          <template #ruaCoberta-cell="{ row }">
            {{ nomeDaRua(row.original.ruaCoberta) }}
          </template>
          <template #contagem-cell="{ row }">
            {{ row.original.vagasOcupadas }} / {{ row.original.totalDeVagas }}
            <span class="ms-1 text-xs text-muted">({{ ocupacaoDe(row.original) }}%)</span>
          </template>
          <template #acao-header>
            <span class="sr-only">Ação</span>
          </template>
          <template #acao-cell="{ row }">
            <UButton
              color="error"
              variant="link"
              icon="i-lucide-trash-2"
              label="Apagar"
              aria-haspopup="dialog"
              class="min-h-11 px-0 text-sm"
              @click="pedirConfirmacao(row.original)"
            />
          </template>
        </UTable>
      </section>
    </template>

    <!-- Confirmação (UModal), como em Sugestões de rua. -->
    <UModal
      v-model:open="confirmacaoAberta"
      title="Apagar observação?"
      :close="{ color: 'neutral', variant: 'outline', square: true, class: 'size-10 justify-center lg:size-9' }"
      :ui="{
        overlay: 'z-40',
        content: 'z-50 divide-y-0 rounded-paro-lg bg-elevated ring-default',
        title: 'text-base font-semibold text-default',
        body: 'py-0 sm:py-0',
        footer: 'grid grid-cols-2 gap-2',
      }"
    >
      <template #body>
        <p
          v-if="aApagar"
          class="max-w-[70ch] text-sm"
        >
          {{ nomeDaRua(aApagar.ruaCoberta) }}, {{ intervaloDaFaixaHoraria(aApagar.faixaHoraria) }} de
          {{ dataCompleta(aApagar.data) }} sai do servidor e deixa de contar na chance. Não dá para desfazer.
        </p>
      </template>

      <template #footer>
        <UButton
          color="primary"
          variant="link"
          block
          label="Cancelar"
          class="min-h-13 text-sm"
          @click="confirmacaoAberta = false"
        />
        <UButton
          color="neutral"
          variant="outline"
          block
          icon="i-lucide-trash-2"
          :label="apagando ? undefined : 'Apagar'"
          :aria-label="apagando ? 'Apagando' : undefined"
          class="min-h-13 text-sm text-error"
          :loading="apagando"
          :aria-busy="apagando"
          @click="apagar"
        />
      </template>
    </UModal>
  </main>
</template>
