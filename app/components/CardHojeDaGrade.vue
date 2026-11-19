<!--
  Card "Hoje" do Início (ADR 0035; design system, "Cards", como o card de
  melhor chance): em dia com aula na grade horária, diz a hora da primeira
  aula, a melhor chegada (faixa horária e rua coberta, com a faixa de chance)
  e a saída prevista sugerida, a faixa horária em que a última aula acaba.
  O card inteiro leva ao Detalhe da rua na faixa horária da chegada.

  Aparece só em dia com aula e some quando há um registro de vaga aberto (aí
  vale o card do registro) ou quando a primeira aula já começou. Sem grade
  horária, não aparece. Lê o celular e o servidor só no navegador.
-->
<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import { saidaPrevistaDaAula } from '~/grade-horaria'
import type { HojeDaGrade } from '~/composables/useHojeDaGrade'

const route = useRoute()
const { agora } = useAgora()
const { data: faixasHorarias } = useFaixasHorarias()
const { ler } = useHojeDaGrade()

const hoje = ref<HojeDaGrade | null>(null)
const temRegistro = ref(false)

onMounted(async () => {
  hoje.value = await ler()
})

// O card do registro de vaga toma o lugar deste; relê ao voltar para a tela.
watch([agora, () => route.fullPath], ([valor]) => {
  temRegistro.value = valor ? dadosDoCelularDoAparelho().registroAtual(valor.noite) !== null : false
}, { immediate: true })

/** A aula começou: a faixa horária de agora já chegou à da aula, ou já passou das 23h. */
const aulaComecou = computed(() => {
  const aulas = hoje.value?.aulas
  if (!aulas || !agora.value) return false
  if (agora.value.faixaHoraria) return agora.value.faixaHoraria >= aulas.inicio
  return new Date().getHours() >= 17
})

const visivel = computed(() => Boolean(hoje.value?.aulas) && !temRegistro.value && !aulaComecou.value)

const saidaPrevista = computed(() =>
  hoje.value?.aulas ? saidaPrevistaDaAula(hoje.value.aulas.fim, faixasHorarias.value ?? []) : null)

const id = useId()
</script>

<template>
  <UCard
    v-if="visivel && hoje?.aulas"
    as="section"
    :aria-labelledby="id"
    class="relative"
    :class="hoje.melhorChegada && 'transition-[filter] has-[a:hover]:brightness-105 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary'"
    :ui="{ body: 'grid gap-2' }"
  >
    <h2
      :id="id"
      class="text-xs font-semibold uppercase tracking-wider tabular-nums text-muted"
    >
      Hoje · aula às {{ rotuloDaFaixaHoraria(hoje.aulas.inicio) }}
    </h2>

    <template v-if="hoje.melhorChegada">
      <p class="flex items-center justify-between gap-3 text-base font-semibold leading-tight">
        <NuxtLink
          :to="{ path: `/ruas/${hoje.melhorChegada.rua.id}`, query: { faixaHoraria: hoje.melhorChegada.faixaHoraria } }"
          class="outline-none after:absolute after:inset-0 after:rounded-paro-lg"
        >
          Chegue {{ rotuloDaFaixaHoraria(hoje.melhorChegada.faixaHoraria) }} na {{ hoje.melhorChegada.rua.nome }}
        </NuxtLink>
        <UIcon
          name="i-lucide-chevron-right"
          class="size-5 shrink-0 text-muted"
          aria-hidden="true"
        />
      </p>
      <p class="flex items-center gap-2 text-xs font-medium tabular-nums text-muted">
        <AmostraDeFaixaDeChance :estado="hoje.melhorChegada.estimativa.faixaDeChance" />
        <span>
          <strong class="font-semibold text-default">{{ hoje.melhorChegada.estimativa.faixaDeChance }}</strong>
          · {{ hoje.melhorChegada.estimativa.chance }}%
          <template v-if="saidaPrevista"> · saída prevista {{ rotuloDaFaixaHoraria(saidaPrevista) }}</template>
        </span>
      </p>
    </template>

    <p
      v-else
      class="text-sm"
    >
      Nenhuma rua coberta tem chance conhecida a tempo da aula.
      <template v-if="saidaPrevista">
        Saída prevista: {{ rotuloDaFaixaHoraria(saidaPrevista) }}.
      </template>
    </p>
  </UCard>
</template>
