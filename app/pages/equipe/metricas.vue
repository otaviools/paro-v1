<!--
  Métricas da equipe (Área da equipe; referências Mintlify, Exa e Zoom no
  desktop, Linktree e YouTube Studio no celular). Lê GET /api/equipe/metricas
  com a chave da equipe, a mesma de Observações (useChaveDaEquipe).

  - Período em abas de vidro: 30 dias, 90 dias ou 1 ano, até hoje. Não há
    "7 dias" porque uma semana só entra 2 semanas depois, quando dá para
    saber quem voltou (consolidação diária, ADR 0021).
  - Três números: motoristas por semana (média) e quantos voltaram na
    semana seguinte, quanto "A previsão ajudou?" teve de "sim", e os
    registros de vaga das noites fechadas.
  - Mapa de calor (ECharts, estilo GitHub): registros por dia da semana e
    faixa horária, para ver quando o pessoal mais estaciona.
  - Gráficos (ECharts): motoristas por semana (barras agrupadas: na semana e voltaram), registros por
    noite e as ruas com mais registros.
  Pedindo a chave, a tela vira uma coluna estreita no centro; com as
  métricas, fica larga. A cada requisição, o carregamento aparece por cima.
  Na demonstração (NUXT_FONTE_DE_OBSERVACOES diferente de "reais"), o
  servidor devolve métricas fictícias e a tela mostra o aviso amarelo.
  Tudo anônimo: identificador mensal, respostas sem identificador e totais
  por rua e faixa horária (ADR 0004).
-->
<script setup lang="ts">
import { parseDate } from '@internationalized/date'
import { areaCoberta } from '#shared/utils/area-coberta'

definePageMeta({ semBarraDeAbas: true, foraDoPainelDesktop: true })
useHead({ title: 'Métricas | Parô', meta: [{ name: 'robots', content: 'noindex' }] })

const { lerChaveDaSessao, guardarChaveNaSessao } = useChaveDaEquipe()
const { lerMetricas } = useMetricasDeUso()

/** Chave aceita pelo servidor; enquanto for null, a tela pede a chave. */
const chave = ref<string | null>(null)
const metricas = ref<RespostaDasMetricas | null>(null)
const carregando = ref(false)
const erroDaChave = ref<string | null>(null)
const erroDasMetricas = ref<string | null>(null)

const PERIODOS = [
  { valor: '30', rotulo: '30 dias' },
  { valor: '90', rotulo: '90 dias' },
  { valor: '365', rotulo: '1 ano' },
]
const periodo = ref<string | null>('30')

/** De e até do período escolhido: até a noite de hoje, inclusive. */
function intervalo(dias: number) {
  const ate = areaCoberta.noiteDe(new Date())
  return { de: parseDate(ate).subtract({ days: dias - 1 }).toString(), ate }
}

function sair(motivo: string | null = null) {
  guardarChaveNaSessao(null)
  chave.value = null
  metricas.value = null
  erroDaChave.value = motivo
}

async function carregar(valor: string) {
  carregando.value = true
  erroDaChave.value = null
  erroDasMetricas.value = null
  const { de, ate } = intervalo(Number(periodo.value ?? 30))
  const resultado = await lerMetricas(valor, de, ate)
  carregando.value = false
  if (resultado.tipo === 'lidas') {
    metricas.value = resultado.resposta
    chave.value = valor
    guardarChaveNaSessao(valor)
  }
  else if (resultado.tipo === 'chave-incorreta') sair('Chave da equipe incorreta.')
  else if (chave.value) erroDasMetricas.value = 'Não foi possível carregar. Tente de novo.'
  else erroDaChave.value = 'Não foi possível carregar. Tente de novo.'
}

/**
 * Até ler a chave guardada na aba (só no navegador) e, se houver, carregar
 * com ela, a tela mostra só o carregamento, sem o formulário da chave.
 */
const retomando = ref(true)

onMounted(async () => {
  const guardada = lerChaveDaSessao()
  if (guardada) await carregar(guardada)
  retomando.value = false
})

watch(periodo, () => {
  if (chave.value) carregar(chave.value)
})

// --- Números ------------------------------------------------------------------

/** "AAAA-MM-DD" → "DD/MM". */
function diaEMes(valor: string) {
  const [, mes, dia] = valor.split('-')
  return `${dia}/${mes}`
}

const porcentagem = (parte: number, todo: number) => Math.round((parte * 100) / todo)

const recorrencia = computed(() => metricas.value?.recorrencia ?? [])
const motoristas = computed(() => {
  const semanas = recorrencia.value
  if (semanas.length === 0) return null
  const soma = semanas.reduce((total, s) => total + s.motoristas, 0)
  const voltaram = semanas.reduce((total, s) => total + s.voltaramNaSemanaSeguinte, 0)
  return { media: Math.round(soma / semanas.length), voltaram: soma ? porcentagem(voltaram, soma) : 0, semanas: semanas.length }
})

const ajudou = computed(() => {
  const dias = metricas.value?.ajudou ?? []
  const sim = dias.reduce((total, d) => total + d.sim, 0)
  const nao = dias.reduce((total, d) => total + d.nao, 0)
  return sim + nao === 0 ? null : { sim, nao, porcentagem: porcentagem(sim, sim + nao) }
})

const noites = computed(() => metricas.value?.registrosPorNoite ?? [])
const registros = computed(() => {
  if (noites.value.length === 0) return null
  const total = noites.value.reduce((soma, n) => soma + n.total, 0)
  return { total, mediaPorNoite: Math.round(total / noites.value.length) }
})

// --- Gráficos -----------------------------------------------------------------

const barrasDeMotoristas = computed(() => recorrencia.value.map(s => ({
  rotulo: diaEMes(s.semana),
  valor: s.motoristas,
  parte: s.voltaramNaSemanaSeguinte,
})))
const descreveSemana = (b: { rotulo: string, valor: number, parte?: number }) =>
  `Semana de ${b.rotulo}: ${b.valor} motoristas, ${b.parte ?? 0} voltaram`

/** Todas as noites do período, com zero nas que não tiveram registro. */
const barrasDeRegistros = computed(() => {
  if (!metricas.value) return []
  const totais = new Map(noites.value.map(n => [n.noite, n.total]))
  const barras: { rotulo: string, valor: number }[] = []
  const ate = parseDate(metricas.value.ate)
  for (let dia = parseDate(metricas.value.de); dia.compare(ate) <= 0; dia = dia.add({ days: 1 })) {
    const data = dia.toString()
    barras.push({ rotulo: diaEMes(data), valor: totais.get(data) ?? 0 })
  }
  return barras
})
const descreveNoite = (b: { rotulo: string, valor: number }) =>
  `Noite de ${b.rotulo}: ${b.valor === 1 ? '1 registro' : `${b.valor} registros`}`

const ruas = areaCoberta.ruasCobertas()
const nomeDaRua = (id: string) => ruas.find(r => r.id === id)?.nome ?? id

// --- Mapa de calor: registros por dia da semana e faixa horária ------------------

const DIAS_DA_SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']
const NOMES_DOS_DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const faixasHorarias = areaCoberta.faixasHorarias()

/** Dia da semana de uma noite, de 0 (segunda) a 6 (domingo). */
const diaDaSemanaDe = (noite: string) => (parseDate(noite).toDate('UTC').getUTCDay() + 6) % 7

/**
 * Registros somados por dia da semana e faixa horária. De segunda a sexta
 * sempre; sábado e domingo só aparecem se tiverem algum registro.
 */
const mapaDeCalor = computed(() => {
  const valores = DIAS_DA_SEMANA.map(() => faixasHorarias.map(() => 0))
  for (const noite of noites.value) {
    const dia = diaDaSemanaDe(noite.noite)
    for (const t of noite.porRuaEFaixaHoraria) {
      const coluna = faixasHorarias.indexOf(t.faixaHoraria)
      if (coluna >= 0) valores[dia]![coluna]! += t.quantidade
    }
  }
  const dias = DIAS_DA_SEMANA.map((_, d) => d).filter(d => d < 5 || valores[d]!.some(v => v > 0))
  return { dias, linhas: dias.map(d => DIAS_DA_SEMANA[d]!), valores: dias.map(d => valores[d]!) }
})
const descreveQuadrado = (linha: number, coluna: number, valor: number) =>
  `${NOMES_DOS_DIAS[mapaDeCalor.value.dias[linha]!]}, ${intervaloDaFaixaHoraria(faixasHorarias[coluna]!)}: ${valor === 1 ? '1 registro' : `${valor} registros`}`

/** Ruas com mais registros no período, da maior para a menor. */
const ruasComMaisRegistros = computed(() => {
  const porRua = new Map<string, number>()
  for (const noite of noites.value) {
    for (const t of noite.porRuaEFaixaHoraria) porRua.set(t.ruaCoberta, (porRua.get(t.ruaCoberta) ?? 0) + t.quantidade)
  }
  return [...porRua]
    .map(([rua, total]) => ({ rotulo: nomeDaRua(rua), valor: total }))
    .sort((a, b) => b.valor - a.valor)
})
const descreveRua = (b: { rotulo: string, valor: number }) =>
  `${b.rotulo}: ${b.valor === 1 ? '1 registro' : `${b.valor} registros`}`
</script>

<template>
  <main
    class="mx-auto max-w-160 px-5 pt-4 pb-8 lg:px-8 lg:pt-8"
    :class="chave ? 'lg:max-w-6xl' : 'lg:max-w-md'"
  >
    <TopoDaEquipe />

    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold leading-tight tracking-tight">
          Métricas
        </h1>
        <p class="mt-2 max-w-[70ch] text-xs text-muted">
          Uso do Parô, sem identificar ninguém: motoristas por semana, respostas de "A previsão ajudou?" e
          registros de vaga das noites já fechadas.
        </p>
      </div>
      <AbasDeFaixaHoraria
        v-if="chave"
        v-model="periodo"
        :abas="PERIODOS"
        rotulo="Período"
        class="lg:max-w-xs"
      />
    </div>

    <!--
      Carregamento, chave ou conteúdo: cada um entra com a transição das telas
      (classes "pagina" do main.css), já que o conteúdo só chega depois de
      conferir a chave, quando a transição da troca de tela já acabou.
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
        acao="Ver métricas"
        :carregando="carregando"
        :erro="erroDaChave"
        @entrar="carregar"
      />

      <div
        v-else
        key="conteudo"
        class="cascata"
      >
        <p
          v-if="erroDasMetricas"
          class="mt-6 flex items-center gap-2 text-xs font-medium text-error"
          role="alert"
        >
          <UIcon
            name="i-lucide-circle-alert"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          {{ erroDasMetricas }}
        </p>

        <!-- Demonstração (ADR 0012): enquanto a chance usa observações fictícias, as métricas também são. -->
        <UAlert
          v-if="metricas?.fonte === 'ficticias'"
          class="mt-6"
          color="warning"
          variant="soft"
          icon="i-lucide-flask-conical"
          title="Métricas de demonstração"
          description="Números fictícios, para ver como a tela funciona. Os dados reais aparecem quando NUXT_FONTE_DE_OBSERVACOES for &quot;reais&quot; no servidor."
          :ui="{ title: 'text-sm', description: 'text-xs font-medium' }"
        />

        <!--
        Resultados. A cada requisição (período, Atualizar), ficam esmaecidos
        e o carregamento aparece por cima, no topo da área.
      -->
        <div
          class="relative"
          :aria-busy="carregando"
        >
          <div
            class="transition-opacity duration-200 motion-reduce:transition-none"
            :class="{ 'pointer-events-none opacity-40': carregando }"
          >
            <!-- Três números do período (referências Zoom e Arcade). -->
            <section
              class="mt-6 grid gap-3 sm:grid-cols-3 lg:gap-4"
              aria-label="Resumo do período"
            >
              <UCard :ui="{ body: 'grid gap-1 p-5 sm:p-5' }">
                <p class="text-xs font-semibold uppercase tracking-wider text-muted">
                  Motoristas por semana
                </p>
                <p class="text-3xl font-bold tabular-nums">
                  {{ motoristas ? motoristas.media : '—' }}
                </p>
                <p class="text-xs text-muted">
                  <template v-if="motoristas">
                    {{ motoristas.voltaram }}% voltaram na semana seguinte
                  </template>
                  <template v-else>
                    Nenhuma semana fechada no período.
                  </template>
                </p>
              </UCard>
              <UCard :ui="{ body: 'grid gap-1 p-5 sm:p-5' }">
                <p class="text-xs font-semibold uppercase tracking-wider text-muted">
                  A previsão ajudou
                </p>
                <p class="text-3xl font-bold tabular-nums">
                  {{ ajudou ? `${ajudou.porcentagem}%` : '—' }}
                </p>
                <p class="text-xs text-muted">
                  <template v-if="ajudou">
                    {{ ajudou.sim }} sim · {{ ajudou.nao }} não
                  </template>
                  <template v-else>
                    Nenhuma resposta no período.
                  </template>
                </p>
              </UCard>
              <UCard :ui="{ body: 'grid gap-1 p-5 sm:p-5' }">
                <p class="text-xs font-semibold uppercase tracking-wider text-muted">
                  Registros de vaga
                </p>
                <p class="text-3xl font-bold tabular-nums">
                  {{ registros ? registros.total : '—' }}
                </p>
                <p class="text-xs text-muted">
                  <template v-if="registros">
                    Média de {{ registros.mediaPorNoite }} por noite com registro
                  </template>
                  <template v-else>
                    Nenhuma noite fechada com registro.
                  </template>
                </p>
              </UCard>
            </section>

            <div class="mt-4 grid grid-cols-1 gap-3 lg:mt-6 lg:grid-cols-2 lg:gap-4">
              <UCard
                aria-labelledby="titulo-motoristas"
                :ui="{ body: 'grid gap-4 p-5 sm:p-5' }"
              >
                <h2
                  id="titulo-motoristas"
                  class="text-sm font-semibold"
                >
                  Motoristas por semana
                </h2>
                <GraficoDeBarrasDaEquipe
                  v-if="barrasDeMotoristas.length > 0"
                  :barras="barrasDeMotoristas"
                  :descreve="descreveSemana"
                  :legenda="{ valor: 'Na semana', parte: 'Voltaram' }"
                />
                <p
                  v-else
                  class="py-6 text-sm text-muted"
                >
                  Uma semana entra aqui 2 semanas depois de terminar, quando dá para saber quem voltou.
                </p>
              </UCard>

              <UCard
                aria-labelledby="titulo-noites"
                :ui="{ body: 'grid gap-4 p-5 sm:p-5' }"
              >
                <h2
                  id="titulo-noites"
                  class="text-sm font-semibold"
                >
                  Registros por noite
                </h2>
                <GraficoDeBarrasDaEquipe
                  v-if="registros"
                  :barras="barrasDeRegistros"
                  :descreve="descreveNoite"
                />
                <p
                  v-else
                  class="py-6 text-sm text-muted"
                >
                  A noite entra aqui depois do fechamento, às 0h30.
                </p>
              </UCard>

              <UCard
                class="lg:col-span-2"
                aria-labelledby="titulo-calor"
                :ui="{ body: 'grid gap-4 p-5 sm:p-5' }"
              >
                <h2
                  id="titulo-calor"
                  class="text-sm font-semibold"
                >
                  Registros por dia e horário
                </h2>
                <MapaDeCalorDaEquipe
                  v-if="registros"
                  :linhas="mapaDeCalor.linhas"
                  :colunas="faixasHorarias"
                  :valores="mapaDeCalor.valores"
                  :descreve="descreveQuadrado"
                />
                <p
                  v-else
                  class="py-6 text-sm text-muted"
                >
                  Nenhum registro de vaga nas noites fechadas do período.
                </p>
              </UCard>

              <UCard
                class="lg:col-span-2"
                aria-labelledby="titulo-ruas"
                :ui="{ body: 'grid gap-4 p-5 sm:p-5' }"
              >
                <h2
                  id="titulo-ruas"
                  class="text-sm font-semibold"
                >
                  Ruas com mais registros
                </h2>
                <GraficoDeBarrasDaEquipe
                  v-if="ruasComMaisRegistros.length > 0"
                  :barras="ruasComMaisRegistros"
                  :descreve="descreveRua"
                  horizontal
                />
                <p
                  v-else
                  class="py-6 text-sm text-muted"
                >
                  Nenhum registro de vaga nas noites fechadas do período.
                </p>
              </UCard>
            </div>
          </div>
          <CarregandoDaEquipe
            v-if="carregando"
            class="absolute inset-x-0 top-24"
          />
        </div>

        <div class="mt-6 flex gap-4">
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
    </Transition>
  </main>
</template>
