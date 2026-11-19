<!--
  Importar e conferir a grade horária (ADR 0035). `escolherPdf()` abre o
  seletor de arquivo; o PDF é lido no próprio navegador (lerGradeDoPdf) e
  nunca sai do celular. Depois da leitura, a pessoa confere a grade numa
  lista por dia, com o início da primeira aula e o fim da última, e pode
  corrigir cada dia antes de salvar. Se o PDF não tem texto ou não é uma
  grade, a janela explica como salvar pelo Chrome e oferece preencher a mesma
  lista à mão. `editar(grade)` abre a lista direto, para corrigir ou
  preencher sem PDF.

  Interface:
  - `escolherPdf()` e `editar(grade | null)`, pelo ref.
  - evento `salvar(grade)`: a grade conferida, só com os dias com aula. Quem
    usa guarda nos Dados do celular.
-->
<script setup lang="ts">
import { DIAS_DA_SEMANA, NOMES_DOS_DIAS, eAulaDaNoite } from '~/grade-horaria'
import type { DiaDaSemana, GradeHoraria } from '~/grade-horaria'
import { Time } from '@internationalized/date'

const emit = defineEmits<{ salvar: [grade: GradeHoraria] }>()

type Estado = 'lendo' | 'ilegivel' | 'conferindo'
const aberta = ref(false)
const estado = ref<Estado>('conferindo')
const entrada = ref<HTMLInputElement>()

/** Linhas da lista: todo dia aparece; "temAula" desligado é dia sem aula. */
interface Linha { dia: DiaDaSemana, temAula: boolean, inicio: string, fim: string }
const linhas = ref<Linha[]>([])
/** Dias que só tinham aula fora das 17h às 23h, vindos do PDF. */
const foraDaNoite = ref<DiaDaSemana[]>([])
const tentouSalvar = ref(false)

function preencher(grade: GradeHoraria | null) {
  linhas.value = DIAS_DA_SEMANA.map((dia) => {
    const aulas = grade?.[dia]
    return { dia, temAula: Boolean(aulas), inicio: aulas?.inicio ?? '19:00', fim: aulas?.fim ?? '21:50' }
  })
  tentouSalvar.value = false
}

function escolherPdf() {
  if (entrada.value) {
    entrada.value.value = ''
    entrada.value.click()
  }
}

async function lerArquivo(evento: Event) {
  const arquivo = (evento.target as HTMLInputElement).files?.[0]
  if (!arquivo) return
  estado.value = 'lendo'
  aberta.value = true
  const { lerGradeDoPdf } = await import('~/grade-horaria/ler-pdf')
  const leitura = await lerGradeDoPdf(arquivo)
  if (leitura.tipo === 'ilegivel') {
    estado.value = 'ilegivel'
    return
  }
  preencher(leitura.grade)
  foraDaNoite.value = leitura.foraDaNoite
  estado.value = 'conferindo'
}

function editar(grade: GradeHoraria | null) {
  preencher(grade)
  foraDaNoite.value = []
  estado.value = 'conferindo'
  aberta.value = true
}

function preencherAMao() {
  preencher(null)
  foraDaNoite.value = []
  estado.value = 'conferindo'
}

/** "19:00" ⇄ Time, para o UInputTime do desktop; o campo nativo do celular usa o texto. */
function paraTime(horario: string): Time | undefined {
  const [h, m] = horario.split(':').map(Number)
  return h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m) ? undefined : new Time(h, m)
}
function deTime(valor: unknown): string {
  return valor instanceof Time ? `${String(valor.hour).padStart(2, '0')}:${String(valor.minute).padStart(2, '0')}` : ''
}

const invalida = (linha: Linha) => linha.temAula && !eAulaDaNoite({ inicio: linha.inicio, fim: linha.fim })
const algumDia = computed(() => linhas.value.some(l => l.temAula))

function salvar() {
  tentouSalvar.value = true
  if (!algumDia.value || linhas.value.some(invalida)) return
  const grade: GradeHoraria = {}
  for (const linha of linhas.value) {
    if (linha.temAula) grade[linha.dia] = { inicio: linha.inicio, fim: linha.fim }
  }
  emit('salvar', grade)
  aberta.value = false
}

const titulo = computed(() => ({
  lendo: 'Lendo a grade horária',
  ilegivel: 'Não deu para ler este PDF',
  conferindo: 'Confira a sua grade horária',
})[estado.value])

defineExpose({ escolherPdf, editar })
</script>

<template>
  <input
    ref="entrada"
    type="file"
    accept="application/pdf,.pdf"
    class="sr-only"
    tabindex="-1"
    aria-hidden="true"
    @change="lerArquivo"
  >

  <UModal
    v-model:open="aberta"
    :title="titulo"
    :dismissible="estado !== 'lendo'"
    :close="estado === 'lendo' ? false : { color: 'neutral', variant: 'outline', square: true, class: 'size-10 justify-center lg:size-9' }"
    :ui="{
      overlay: 'z-40',
      content: 'z-50 divide-y-0 rounded-paro-lg bg-elevated ring-default',
      title: 'text-base font-semibold text-default',
      body: 'grid gap-4 py-0 sm:py-0',
      footer: 'grid grid-cols-2 gap-2',
    }"
  >
    <template #body>
      <!-- Lendo (referências Hypelist e GoPay): uma folha com linhas e a faixa de leitura descendo. -->
      <div
        v-if="estado === 'lendo'"
        class="grid justify-items-center gap-3 py-6 text-center"
        role="status"
      >
        <div
          class="relative h-24 w-19 overflow-hidden rounded-paro-sm border border-default bg-default"
          aria-hidden="true"
        >
          <div class="grid gap-2 px-3 pt-4">
            <span class="h-1.5 rounded-full bg-accented" />
            <span class="h-1.5 w-3/4 rounded-full bg-accented" />
            <span class="h-1.5 rounded-full bg-accented" />
            <span class="h-1.5 w-1/2 rounded-full bg-accented" />
            <span class="h-1.5 w-5/6 rounded-full bg-accented" />
          </div>
          <span class="faixa-de-leitura absolute inset-x-0 top-2 h-0.5 bg-primary" />
        </div>
        <p class="text-sm text-muted">
          O PDF é lido neste celular e não sai dele.
        </p>
      </div>

      <template v-else-if="estado === 'ilegivel'">
        <p class="max-w-[70ch] text-sm">
          O arquivo não tem o texto da grade. Acontece com o PDF do "Microsoft Print to PDF", que desenha as letras.
        </p>
        <ol class="grid list-decimal gap-1 ps-5 text-sm text-muted">
          <li>Abra o horário de aulas no portal da ESAMC, no Chrome.</li>
          <li>Toque em Imprimir e escolha <strong class="font-semibold text-default">Salvar como PDF</strong>.</li>
          <li>Importe o arquivo novo aqui.</li>
        </ol>
      </template>

      <template v-else>
        <p class="max-w-[70ch] text-xs text-muted">
          Início da primeira aula e fim da última, só das aulas da noite. Fica só neste celular; o PDF não é guardado.
        </p>

        <ul class="grid">
          <li
            v-for="linha in linhas"
            :key="linha.dia"
            class="grid gap-2 border-b border-default py-3"
          >
            <div class="flex items-center justify-between gap-3">
              <span
                :id="`dia-${linha.dia}`"
                class="text-sm font-semibold"
              >
                {{ NOMES_DOS_DIAS[linha.dia] }}
              </span>
              <USwitch
                v-model="linha.temAula"
                :label="linha.temAula ? 'Com aula' : 'Sem aula'"
                :aria-describedby="`dia-${linha.dia}`"
                :ui="{ label: 'text-xs font-medium text-muted' }"
              />
            </div>
            <div
              v-if="linha.temAula"
              class="grid grid-cols-2 gap-2"
            >
              <UFormField
                label="Primeira aula"
                :ui="{ label: 'text-xs font-medium text-muted' }"
              >
                <!-- Celular: campo nativo, com a roda de horas do sistema. -->
                <UInput
                  v-model="linha.inicio"
                  type="time"
                  class="w-full lg:hidden"
                  :ui="{ base: 'h-11 rounded-paro-md bg-default tabular-nums' }"
                />
                <!-- Desktop: horas e minutos em campos, no formato 24 h, só do tamanho do horário. -->
                <UInputTime
                  :model-value="paraTime(linha.inicio)"
                  :hour-cycle="24"
                  class="hidden w-fit lg:inline-flex"
                  :ui="{ base: 'w-fit rounded-full bg-default px-3 tabular-nums' }"
                  @update:model-value="valor => linha.inicio = deTime(valor)"
                />
              </UFormField>
              <UFormField
                label="Fim da última"
                :ui="{ label: 'text-xs font-medium text-muted' }"
              >
                <!-- Celular: campo nativo, com a roda de horas do sistema. -->
                <UInput
                  v-model="linha.fim"
                  type="time"
                  class="w-full lg:hidden"
                  :ui="{ base: 'h-11 rounded-paro-md bg-default tabular-nums' }"
                />
                <!-- Desktop: horas e minutos em campos, no formato 24 h, só do tamanho do horário. -->
                <UInputTime
                  :model-value="paraTime(linha.fim)"
                  :hour-cycle="24"
                  class="hidden w-fit lg:inline-flex"
                  :ui="{ base: 'w-fit rounded-full bg-default px-3 tabular-nums' }"
                  @update:model-value="valor => linha.fim = deTime(valor)"
                />
              </UFormField>
            </div>
            <p
              v-if="tentouSalvar && invalida(linha)"
              class="flex items-center gap-2 text-xs font-medium text-error"
              role="alert"
            >
              <UIcon
                name="i-lucide-circle-alert"
                class="size-4 shrink-0"
                aria-hidden="true"
              />
              A primeira aula precisa começar entre 17h e 23h, e a última acabar depois dela.
            </p>
            <p
              v-if="foraDaNoite.includes(linha.dia)"
              class="text-xs text-muted"
            >
              No PDF, só tem aulas fora das 17h às 23h; ficou sem aula.
            </p>
          </li>
        </ul>

        <p
          v-if="tentouSalvar && !algumDia"
          class="flex items-center gap-2 text-xs font-medium text-error"
          role="alert"
        >
          <UIcon
            name="i-lucide-circle-alert"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          Marque pelo menos um dia com aula.
        </p>
      </template>
    </template>

    <template
      v-if="estado !== 'lendo'"
      #footer
    >
      <template v-if="estado === 'ilegivel'">
        <UButton
          color="neutral"
          variant="outline"
          block
          label="Preencher à mão"
          class="min-h-13 text-sm"
          @click="preencherAMao"
        />
        <UButton
          color="neutral"
          block
          icon="i-lucide-file-up"
          label="Outro PDF"
          class="min-h-13 text-sm"
          @click="escolherPdf"
        />
      </template>
      <template v-else>
        <UButton
          color="primary"
          variant="link"
          block
          label="Cancelar"
          class="min-h-13 text-sm"
          @click="aberta = false"
        />
        <UButton
          color="neutral"
          block
          label="Salvar grade"
          class="min-h-13 text-sm"
          @click="salvar"
        />
      </template>
    </template>
  </UModal>
</template>
