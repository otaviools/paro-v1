<!--
  Tela da equipe: lê e apaga as sugestões de rua (ADRs 0013 e 0021; design
  system, "Formulários › Campo de texto" e "Tabelas"). É uma aba da Área da
  equipe (TopoDaEquipe), ao lado de Observações e Métricas, com a mesma
  chave (useChaveDaEquipe): vai no cabeçalho Authorization e fica só nesta
  aba do navegador (sessionStorage), nunca na URL nem no servidor. Cada
  sugestão é apagada pela equipe depois de lida, sempre com confirmação.
-->
<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ semBarraDeAbas: true, foraDoPainelDesktop: true })
useHead({ title: 'Sugestões | Parô', meta: [{ name: 'robots', content: 'noindex' }] })

const { lerChaveDaSessao, guardarChaveNaSessao } = useChaveDaEquipe()

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
  }
  else if (resultado.tipo === 'chave-incorreta') sair('Chave da equipe incorreta.')
  else if (chave.value) erroDaLista.value = 'Não foi possível carregar. Tente de novo.'
  else erroDaChave.value = 'Não foi possível carregar. Tente de novo.'
}

/**
 * Até ler a chave guardada na aba (só no navegador) e, se houver, carregar
 * com ela, a tela mostra só o carregamento, sem o formulário da chave: assim
 * trocar de aba na Área da equipe não pisca o formulário.
 */
const retomando = ref(true)

onMounted(async () => {
  const guardada = lerChaveDaSessao()
  if (guardada) await carregar(guardada)
  retomando.value = false
})

// --- Apagar depois de ler (ADR 0021) --------------------------------------------

/** Confirmação de apagar (UModal). */
const confirmacaoAberta = ref(false)
const aApagar = ref<SugestaoDeRua | null>(null)
const apagando = ref(false)
const { avisar } = useAvisoFlutuanteStore()

function pedirConfirmacao(sugestao: SugestaoDeRua) {
  aApagar.value = sugestao
  erroDaLista.value = null
  confirmacaoAberta.value = true
}

async function apagar() {
  const sugestao = aApagar.value
  if (!sugestao || !chave.value || apagando.value) return
  apagando.value = true
  const resultado = await apagarSugestao(chave.value, sugestao.id)
  apagando.value = false
  confirmacaoAberta.value = false
  if (resultado === 'apagada') {
    sugestoes.value = sugestoes.value.filter(s => s.id !== sugestao.id)
    avisar('Sugestão apagada.')
  }
  else if (resultado === 'chave-incorreta') sair('Chave da equipe incorreta.')
  else erroDaLista.value = 'Não foi possível apagar. Tente de novo.'
}

/*
 * Tabela (design system, "Tabelas"): sem caixa, linhas separadas por 1 px em
 * border-default, cabeçalho em etiqueta, linhas de 48 px, sem listras nem
 * bordas verticais. Abaixo de lg, cada linha vira um bloco: data e texto à
 * esquerda, "Apagar" à direita.
 */
const colunas: TableColumn<SugestaoDeRua>[] = [
  {
    accessorKey: 'data',
    header: 'Data',
    meta: { class: { td: 'whitespace-nowrap tabular-nums text-muted max-lg:text-xs' } },
  },
  {
    accessorKey: 'texto',
    header: 'Sugestão',
    meta: { class: { td: 'text-default whitespace-normal wrap-anywhere max-lg:col-start-1 max-lg:row-start-2' } },
  },
  {
    id: 'acao',
    meta: { class: { th: 'pe-0', td: 'pe-0 text-end max-lg:col-start-2 max-lg:row-span-2 max-lg:row-start-1' } },
  },
]

/** "AAAA-MM-DD" → "DD/MM/AAAA". */
function dataCompleta(data: string) {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}
</script>

<template>
  <main
    class="mx-auto max-w-160 px-5 pt-4 pb-8 lg:px-8 lg:pt-8"
    :class="chave ? 'lg:max-w-6xl' : 'lg:max-w-md'"
  >
    <!-- Voltar e abas da Área da equipe (Observações, Sugestões e Métricas). -->
    <TopoDaEquipe />

    <h1 class="text-2xl font-bold leading-tight tracking-tight">
      Sugestões de rua
    </h1>
    <p class="mt-2 max-w-[70ch] text-xs text-muted">
      Ruas ou trechos fora da área coberta sugeridos pelos motoristas, sem identificação. Apague cada sugestão
      depois de ler: é texto livre e pode conter dado pessoal.
    </p>

    <!--
      Carregamento, chave ou lista: cada um entra com a transição das telas
      (classes "pagina" do main.css), como em Observações e Métricas.
    -->
    <Transition
      name="pagina"
      :duration="{ enter: 700, leave: 0 }"
    >
      <CarregandoDaEquipe
        v-if="retomando"
        key="carregando"
        class="mt-16"
      />

      <ChaveDaEquipe
        v-else-if="!chave"
        key="chave"
        class="mt-8"
        acao="Ver sugestões"
        :carregando="carregando"
        :erro="erroDaChave"
        @entrar="carregar"
      />

      <section
        v-else
        key="lista"
        class="cascata mt-8 grid gap-3"
        aria-labelledby="titulo-lista"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="titulo-lista"
            class="text-xs font-semibold uppercase tracking-wider text-muted"
          >
            {{ sugestoes.length === 1 ? '1 sugestão' : `${sugestoes.length} sugestões` }}
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
          v-if="sugestoes.length === 0"
          class="py-4 text-sm text-muted"
        >
          Nenhuma sugestão de rua para ler.
        </p>

        <UTable
          v-else
          :data="sugestoes"
          :columns="colunas"
          :ui="{
            root: 'overflow-visible',
            thead: 'max-lg:sr-only',
            tbody: 'divide-y-0 max-lg:block',
            tr: 'border-b border-default max-lg:grid max-lg:grid-cols-[minmax(0,1fr)_auto] max-lg:items-center max-lg:gap-x-3 max-lg:py-3',
            th: 'ps-0 pe-3 pt-0 pb-2 text-xs font-semibold uppercase tracking-wider text-muted',
            td: 'h-12 py-2 ps-0 pe-3 align-middle text-sm max-lg:h-auto max-lg:p-0',
          }"
        >
          <template #data-cell="{ row }">
            {{ dataCompleta(row.original.data) }}
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
    </Transition>

    <!-- Confirmação (UModal), como em Ajustes. -->
    <UModal
      v-model:open="confirmacaoAberta"
      title="Apagar sugestão?"
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
        <p class="max-w-[70ch] text-sm wrap-anywhere">
          "{{ aApagar?.texto }}" sai do servidor. Não dá para desfazer.
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
