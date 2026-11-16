<!--
  Formulário de uma observação (ADR 0011; design system, "Formulários"):
  data, faixa horária, rua coberta, total de vagas e vagas ocupadas, com a
  conferência da ocupação ("rua cheia" a partir de 85%) antes de registrar.
  Usado na tela da equipe: dentro da página no celular e no painel lateral no
  desktop. No celular, faixa horária e rua abrem gavetas (a grade de horários
  e os cards de rua de Registrar vaga), como a rotina em Ajustes; no desktop,
  listas suspensas. Depois de registrar, data e faixa horária ficam, para lançar a
  próxima rua da mesma ronda.

  Interface:
  - prop `chave`: chave da equipe aceita pelo servidor.
  - prop `observacoes`: as já registradas, para avisar quando registrar corrige.
  - evento `registrada(observacao)`: o servidor gravou (ou corrigiu).
  - evento `chave-incorreta`: o servidor recusou a chave.
-->
<script setup lang="ts">
import { parseDate } from '@internationalized/date'
import type { CalendarDate } from '@internationalized/date'
import { areaCoberta } from '#shared/utils/area-coberta'

const props = defineProps<{
  chave: string
  observacoes: ObservacaoRegistrada[]
}>()

const emit = defineEmits<{
  'registrada': [observacao: ObservacaoRegistrada]
  'chave-incorreta': []
}>()

/** Ocupação a partir da qual a rua conta como cheia (ADR 0005). */
const OCUPACAO_DE_RUA_CHEIA = 85

const { registrarObservacao } = useObservacoes()

const opcoesDeRua = areaCoberta.ruasCobertas().map(r => ({ label: r.nome, value: r.id }))
/** Cards de rua da gaveta do celular, como em Registrar vaga. */
const cardsDeRua = areaCoberta.ruasCobertas().map(r => ({
  value: r.id,
  label: r.nome,
  description: distanciaAPe(r.distanciaAoDestinoMetros),
  icon: 'i-lucide-signpost',
}))
const nomeDaRua = (id: string) => opcoesDeRua.find(o => o.value === id)?.label ?? id
const opcoesDeFaixa = areaCoberta.faixasHorarias().map(f => ({ label: intervaloDaFaixaHoraria(f), value: f }))
const hoje = () => areaCoberta.noiteDe(new Date())

const data = ref(hoje())

/*
 * Data no UInputDate (dia, mês e ano em campos, no formato do idioma do app)
 * e no calendário ao lado; a API recebe "AAAA-MM-DD". Sem datas futuras.
 */
const dataNoCampo = computed({
  get: () => parseDate(data.value),
  set: (valor: CalendarDate | undefined) => { if (valor) data.value = valor.toString() },
})
const hojeNoCampo = computed(() => parseDate(hoje()))
const calendarioAberto = ref(false)

// --- Gavetas do celular -------------------------------------------------------------

const gavetaDaDataAberta = ref(false)
const ontem = computed(() => hojeNoCampo.value.subtract({ days: 1 }).toString())

/** "Hoje, 16/11/2026", "Ontem, 15/11/2026" ou só "12/11/2026". */
const rotuloDaData = computed(() => {
  const [ano, mes, dia] = data.value.split('-')
  const completa = `${dia}/${mes}/${ano}`
  if (data.value === hoje()) return `Hoje, ${completa}`
  if (data.value === ontem.value) return `Ontem, ${completa}`
  return completa
})

function escolherData(valor: string) {
  data.value = valor
  gavetaDaDataAberta.value = false
}

function escolherDataNoCalendario(valor: unknown) {
  if (valor && typeof (valor as CalendarDate).toString === 'function') escolherData((valor as CalendarDate).toString())
}

const gavetaDaFaixa = ref<{ abrir: () => void, fechar: () => void }>()
const gruposDaFaixa = [{ rotulo: 'Faixas horárias', faixasHorarias: areaCoberta.faixasHorarias() }]

function escolherFaixa(valor: string) {
  faixaHoraria.value = valor
  gavetaDaFaixa.value?.fechar()
}

const gavetaDaRuaAberta = ref(false)

function escolherRua(valor: string) {
  ruaCoberta.value = valor
  gavetaDaRuaAberta.value = false
}
const ruaCoberta = ref<string | undefined>(undefined)
const faixaHoraria = ref<string | undefined>(undefined)
const totalDeVagas = ref<number | null>(null)
const vagasOcupadas = ref<number | null>(null)
const registrando = ref(false)
const erro = ref<string | null>(null)

/** Ocupação da contagem digitada, para conferir antes de registrar. */
const ocupacao = computed(() => {
  const total = totalDeVagas.value
  const ocupadas = vagasOcupadas.value
  if (!total || total < 1 || ocupadas === null || ocupadas < 0 || ocupadas > total) return null
  return Math.round((ocupadas * 100) / total)
})

/** Já existe uma observação desta rua, faixa horária e data: registrar corrige. */
const substitui = computed(() => props.observacoes.some(o =>
  o.data === data.value && o.ruaCoberta === ruaCoberta.value && o.faixaHoraria === faixaHoraria.value))

async function registrar() {
  if (registrando.value) return
  erro.value = null
  if (!ruaCoberta.value || !faixaHoraria.value || totalDeVagas.value === null || vagasOcupadas.value === null) {
    erro.value = 'Preencha todos os campos.'
    return
  }
  registrando.value = true
  const resultado = await registrarObservacao(props.chave, {
    data: data.value,
    ruaCoberta: ruaCoberta.value,
    faixaHoraria: faixaHoraria.value,
    totalDeVagas: totalDeVagas.value,
    vagasOcupadas: vagasOcupadas.value,
  })
  registrando.value = false
  if (resultado.tipo === 'registrada') {
    emit('registrada', resultado.observacao)
    ruaCoberta.value = undefined
    totalDeVagas.value = null
    vagasOcupadas.value = null
  }
  else if (resultado.tipo === 'invalida') erro.value = `${resultado.mensagem}.`
  else if (resultado.tipo === 'chave-incorreta') emit('chave-incorreta')
  else erro.value = 'Não foi possível registrar. Tente de novo.'
}
</script>

<template>
  <form
    class="grid gap-4"
    novalidate
    @submit.prevent="registrar"
  >
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField
        label="Data"
        :ui="{ label: 'font-semibold', container: 'mt-2' }"
      >
        <!-- Celular: campo que abre a gaveta com "Hoje", "Ontem" e o calendário. -->
        <UButton
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-calendar"
          aria-haspopup="dialog"
          class="h-12 w-full justify-between rounded-paro-md bg-elevated px-3 text-base font-normal tabular-nums text-default lg:hidden"
          :ui="{ trailingIcon: 'size-5 text-dimmed' }"
          @click="gavetaDaDataAberta = true"
        >
          {{ rotuloDaData }}
        </UButton>
        <UInputDate
          v-model="dataNoCampo"
          :max-value="hojeNoCampo"
          class="hidden w-full lg:flex"
          :ui="{ base: 'h-10 rounded-paro-md bg-elevated text-sm tabular-nums' }"
        >
          <template #trailing>
            <UPopover
              v-model:open="calendarioAberto"
              :content="{ align: 'end', sideOffset: 8 }"
            >
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-calendar"
                aria-label="Escolher no calendário"
                class="px-0"
              />
              <template #content>
                <UCalendar
                  v-model="dataNoCampo"
                  :max-value="hojeNoCampo"
                  class="p-2"
                  @update:model-value="calendarioAberto = false"
                />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </UFormField>
      <UFormField
        label="Faixa horária"
        :ui="{ label: 'font-semibold', container: 'mt-2' }"
      >
        <!-- Celular: campo que abre a gaveta com a grade de horários. -->
        <UButton
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-chevron-down"
          aria-haspopup="dialog"
          class="h-12 w-full justify-between rounded-paro-md bg-elevated px-3 text-base font-normal tabular-nums lg:hidden"
          :class="faixaHoraria ? 'text-default' : 'text-dimmed'"
          :ui="{ trailingIcon: 'size-5 text-dimmed' }"
          @click="gavetaDaFaixa?.abrir()"
        >
          {{ faixaHoraria ? intervaloDaFaixaHoraria(faixaHoraria) : 'Escolha' }}
        </UButton>
        <USelect
          v-model="faixaHoraria"
          :items="opcoesDeFaixa"
          value-key="value"
          placeholder="Escolha"
          class="hidden h-10 w-full rounded-paro-md tabular-nums lg:flex"
        />
      </UFormField>
    </div>

    <UFormField
      label="Rua coberta"
      :ui="{ label: 'font-semibold', container: 'mt-2' }"
    >
      <!-- Celular: campo que abre a gaveta com os cards de rua. -->
      <UButton
        color="neutral"
        variant="outline"
        trailing-icon="i-lucide-chevron-down"
        aria-haspopup="dialog"
        class="h-12 w-full justify-between rounded-paro-md bg-elevated px-3 text-base font-normal lg:hidden"
        :class="ruaCoberta ? 'text-default' : 'text-dimmed'"
        :ui="{ trailingIcon: 'size-5 text-dimmed' }"
        @click="gavetaDaRuaAberta = true"
      >
        {{ ruaCoberta ? nomeDaRua(ruaCoberta) : 'Escolha' }}
      </UButton>
      <USelect
        v-model="ruaCoberta"
        :items="opcoesDeRua"
        value-key="value"
        placeholder="Escolha"
        class="hidden h-10 w-full rounded-paro-md lg:flex"
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
      v-if="erro"
      class="flex items-center gap-2 text-xs font-medium text-error"
      role="alert"
    >
      <UIcon
        name="i-lucide-circle-alert"
        class="size-4 shrink-0"
        aria-hidden="true"
      />
      {{ erro }}
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

    <!-- Gavetas do celular. -->
    <UDrawer
      v-model:open="gavetaDaDataAberta"
      title="Data"
      :ui="{ container: 'gap-5', header: 'flex items-center justify-between gap-3' }"
    >
      <template #actions>
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-x"
          aria-label="Fechar"
          class="size-9 justify-center"
          @click="gavetaDaDataAberta = false"
        />
      </template>
      <template #body>
        <div class="grid gap-5">
          <!-- Atalhos: a ronda costuma ser lançada na mesma noite ou na seguinte. -->
          <div
            class="grid grid-cols-2 gap-2"
            role="radiogroup"
            aria-label="Atalhos de data"
          >
            <ChipDeFaixaHoraria
              role="radio"
              :ativo="data === hoje()"
              :aria-checked="data === hoje()"
              @click="escolherData(hoje())"
            >
              Hoje
            </ChipDeFaixaHoraria>
            <ChipDeFaixaHoraria
              role="radio"
              :ativo="data === ontem"
              :aria-checked="data === ontem"
              @click="escolherData(ontem)"
            >
              Ontem
            </ChipDeFaixaHoraria>
          </div>
          <!-- Calendário grande, com os dias futuros apagados; tocar num dia escolhe e fecha. -->
          <UCalendar
            :model-value="dataNoCampo"
            :max-value="hojeNoCampo"
            size="xl"
            class="w-full"
            :ui="{ cell: 'flex justify-center', cellTrigger: 'size-11 text-base' }"
            @update:model-value="escolherDataNoCalendario"
          />
        </div>
      </template>
    </UDrawer>
    <GavetaDeEscolha
      ref="gavetaDaFaixa"
      titulo="Faixa horária"
      acao="faixa"
      :grupos="gruposDaFaixa"
      :escolhida="faixaHoraria ?? null"
      @salvar="escolherFaixa"
    />
    <UDrawer
      v-model:open="gavetaDaRuaAberta"
      title="Rua coberta"
      :ui="{ container: 'gap-5', header: 'flex items-center justify-between gap-3' }"
    >
      <template #actions>
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-x"
          aria-label="Fechar"
          class="size-9 justify-center"
          @click="gavetaDaRuaAberta = false"
        />
      </template>
      <template #body>
        <!-- Cards de rua, como em Registrar vaga; tocar escolhe e fecha. -->
        <URadioGroup
          :model-value="ruaCoberta"
          :items="cardsDeRua"
          variant="card"
          indicator="hidden"
          color="primary"
          orientation="horizontal"
          aria-label="Rua coberta"
          :ui="{
            fieldset: 'grid grid-cols-2 gap-2',
            item: 'group rounded-paro-md bg-elevated p-3 text-default has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary-100 has-data-[state=checked]:text-primary has-data-[state=checked]:shadow-[inset_0_0_0_0.5px_var(--ui-primary)]',
            wrapper: 'grid justify-items-start gap-1 text-left',
            icon: 'mb-1 size-5',
            label: 'text-sm font-semibold leading-tight text-current',
            description: 'text-xs font-medium tabular-nums text-muted group-has-data-[state=checked]:text-primary',
          }"
          @update:model-value="escolherRua"
        />
      </template>
    </UDrawer>
  </form>
</template>
