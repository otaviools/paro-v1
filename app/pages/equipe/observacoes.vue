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

  No celular, o formulário fica na página, acima da lista. No desktop
  (referências Deel e Mercury), a tela fica larga: três números de resumo no
  topo, filtros por rua e data, a tabela e o botão "Nova observação", que
  abre o formulário num painel lateral à direita, sem sair da lista.
-->
<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { parseDate } from '@internationalized/date'
import type { CalendarDate } from '@internationalized/date'
import { areaCoberta } from '#shared/utils/area-coberta'

definePageMeta({ semBarraDeAbas: true, foraDoPainelDesktop: true })
useHead({ title: 'Observações | Parô', meta: [{ name: 'robots', content: 'noindex' }] })

/** Mínimo de noites para uma rua ter chance numa faixa horária (ADR 0007). */
const MINIMO_DE_OBSERVACOES = 4

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

const { lerObservacoes, apagarObservacao } = useObservacoes()

/** Volta para a tela anterior; aberta direto pelo link, vai para Ajustes. */
const router = useRouter()
function voltar() {
  if (window.history.state?.back) router.back()
  else navigateTo('/ajustes')
}
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

/** Painel lateral do formulário no desktop. */
const painelAberto = ref(false)

/** Põe a observação nova (ou corrigida) na lista, da mais nova para a mais antiga. */
function registrada(nova: ObservacaoRegistrada) {
  observacoes.value = [nova, ...observacoes.value.filter(o => o.id !== nova.id)]
    .sort((a, b) => b.data.localeCompare(a.data) || a.faixaHoraria.localeCompare(b.faixaHoraria) || a.ruaCoberta.localeCompare(b.ruaCoberta))
  avisar(`Observação registrada: ${nomeDaRua(nova.ruaCoberta)}, ${rotuloDaFaixaHoraria(nova.faixaHoraria)}.`)
}

// --- Resumo (desktop) --------------------------------------------------------------

const semestreAtual = computed(() => areaCoberta.semestreDe(areaCoberta.noiteDe(new Date())))

/** Observações que contam para a chance: do semestre atual, em dias letivos normais. */
const queContam = computed(() => observacoes.value.filter(o =>
  areaCoberta.semestreDe(o.data) === semestreAtual.value && areaCoberta.eDiaLetivoNormal(o.data)))

/** Combinações de rua e faixa horária com noites suficientes para ter chance. */
const combinacoesComChance = computed(() => {
  const noites = new Map<string, Set<string>>()
  for (const o of queContam.value) {
    const k = `${o.ruaCoberta}|${o.faixaHoraria}`
    noites.set(k, (noites.get(k) ?? new Set()).add(o.data))
  }
  return [...noites.values()].filter(d => d.size >= MINIMO_DE_OBSERVACOES).length
})
const totalDeCombinacoes = ruas.length * areaCoberta.faixasHorarias().length

const ultimaContagem = computed(() => observacoes.value[0]?.data ?? null)

// --- Filtros (desktop) ---------------------------------------------------------------

const TODAS = 'todas'
const filtroDeRua = ref(TODAS)
const filtroDeData = ref('')
const opcoesDoFiltroDeRua = [{ label: 'Todas as ruas', value: TODAS }, ...ruas.map(r => ({ label: r.nome, value: r.id }))]

const filtradas = computed(() => observacoes.value.filter(o =>
  (filtroDeRua.value === TODAS || o.ruaCoberta === filtroDeRua.value)
  && (!filtroDeData.value || o.data === filtroDeData.value)))

/** Filtro de data no UInputDate; vazio mostra todas as datas. */
const filtroDeDataNoCampo = computed({
  get: () => (filtroDeData.value ? parseDate(filtroDeData.value) : undefined),
  set: (valor: CalendarDate | undefined) => { filtroDeData.value = valor ? valor.toString() : '' },
})

const filtrando = computed(() => filtroDeRua.value !== TODAS || Boolean(filtroDeData.value))

/** O servidor recusou a chave dentro do painel: fecha o painel e pede a chave de novo. */
function chaveRecusadaNoPainel() {
  painelAberto.value = false
  sair('Chave da equipe incorreta.')
}

function limparFiltros() {
  filtroDeRua.value = TODAS
  filtroDeData.value = ''
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
  <main class="mx-auto max-w-160 px-5 pt-4 pb-8 lg:max-w-6xl lg:px-8 lg:pt-8">
    <!-- Voltar: a tela não tem barra de abas; volta para Ajustes, de onde a equipe entra. -->
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-arrow-left"
      aria-label="Voltar"
      class="mb-4 size-10 justify-center lg:size-9"
      @click="voltar"
    />

    <!-- Cabeçalho; no desktop, "Nova observação" à direita (referência Deel). -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold leading-tight tracking-tight">
          Observações
        </h1>
        <p class="mt-2 max-w-[70ch] text-xs text-muted">
          Contagens feitas em campo pela equipe: em cada rua coberta e faixa horária, o total de vagas e quantas
          estavam ocupadas. A chance usa as observações do semestre em dias letivos normais.
        </p>
      </div>
      <UButton
        v-if="chave"
        color="neutral"
        size="lg"
        icon="i-lucide-plus"
        label="Nova observação"
        aria-haspopup="dialog"
        class="hidden lg:inline-flex"
        @click="painelAberto = true"
      />
    </div>

    <UCard
      v-if="!chave"
      as="form"
      class="mt-8 lg:max-w-md"
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

      <!-- Resumo no desktop (referência Deel): três números do semestre. -->
      <section
        class="mt-6 hidden grid-cols-3 gap-4 lg:grid"
        aria-label="Resumo do semestre"
      >
        <UCard :ui="{ body: 'grid gap-1 p-5 sm:p-5' }">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted">
            Observações no semestre
          </p>
          <p class="text-3xl font-bold tabular-nums">
            {{ queContam.length }}
          </p>
          <p class="text-xs text-muted">
            Em dias letivos normais; {{ observacoes.length }} no total.
          </p>
        </UCard>
        <UCard :ui="{ body: 'grid gap-1 p-5 sm:p-5' }">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted">
            Ruas e faixas com chance
          </p>
          <p class="text-3xl font-bold tabular-nums">
            {{ combinacoesComChance }}<span class="text-base font-semibold text-muted"> de {{ totalDeCombinacoes }}</span>
          </p>
          <p class="text-xs text-muted">
            Com {{ MINIMO_DE_OBSERVACOES }} noites ou mais; as outras ficam Sem dado.
          </p>
        </UCard>
        <UCard :ui="{ body: 'grid gap-1 p-5 sm:p-5' }">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted">
            Última contagem
          </p>
          <p class="text-3xl font-bold tabular-nums">
            {{ ultimaContagem ? dataCompleta(ultimaContagem) : '—' }}
          </p>
          <p class="text-xs text-muted">
            A equipe observa 1 noite por semana.
          </p>
        </UCard>
      </section>

      <!-- Celular: o formulário fica na página, acima da lista. -->
      <UCard
        class="mt-6 lg:hidden"
        aria-labelledby="titulo-nova"
        :ui="{ body: 'grid gap-4' }"
      >
        <h2
          id="titulo-nova"
          class="text-base font-semibold"
        >
          Nova observação
        </h2>
        <FormularioDeObservacao
          :chave="chave"
          :observacoes="observacoes"
          @registrada="registrada"
          @chave-incorreta="sair('Chave da equipe incorreta.')"
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
            <template v-if="filtrando">
              {{ filtradas.length }} de {{ observacoes.length }} observações
            </template>
            <template v-else>
              {{ observacoes.length === 1 ? '1 observação' : `${observacoes.length} observações` }}
            </template>
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

        <!-- Filtros no desktop: rua e data. -->
        <div
          v-if="observacoes.length > 0"
          class="hidden items-center gap-3 lg:flex"
        >
          <USelect
            v-model="filtroDeRua"
            :items="opcoesDoFiltroDeRua"
            value-key="value"
            aria-label="Filtrar por rua"
            class="h-10 w-56 rounded-paro-md"
          />
          <UInputDate
            v-model="filtroDeDataNoCampo"
            aria-label="Filtrar por data"
            class="w-44"
            :ui="{ base: 'h-10 rounded-paro-md bg-elevated text-sm tabular-nums' }"
          />
          <UButton
            v-if="filtrando"
            color="primary"
            variant="link"
            icon="i-lucide-x"
            label="Limpar filtros"
            class="min-h-11 px-0 text-sm"
            @click="limparFiltros"
          />
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
        <p
          v-else-if="filtradas.length === 0"
          class="py-4 text-sm text-muted"
        >
          Nenhuma observação com esses filtros.
        </p>

        <UTable
          v-else
          :data="filtradas"
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

      <!-- Desktop: formulário num painel lateral à direita (referências Mercury e Base44). -->
      <USlideover
        v-model:open="painelAberto"
        title="Nova observação"
        description="Lance a contagem de uma rua coberta numa faixa horária."
        side="right"
        :close="{ color: 'neutral', variant: 'outline', square: true, class: 'size-9 justify-center' }"
        :ui="{
          overlay: 'z-40',
          content: 'z-50 max-w-md bg-elevated ring-default',
          title: 'text-base font-semibold text-default',
          description: 'text-xs text-muted',
        }"
      >
        <template #body>
          <FormularioDeObservacao
            :chave="chave"
            :observacoes="observacoes"
            @registrada="registrada"
            @chave-incorreta="chaveRecusadaNoPainel"
          />
        </template>
      </USlideover>
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
