<!--
  Bloco do registro de vaga no Início (design system, "Fluxos": Voltar ao carro;
  referência Rivian): com um registro de vaga aberto nesta noite, mostra a
  saída prevista e a rua coberta, com a entrada para "Voltar até o carro" no
  registro com localização ligada. Sem registro aberto, não aparece. Lê só os
  Dados do celular; nada sai do aparelho.
-->
<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import type { RegistroNoCelular } from '~/dados-do-celular'

/** Noite de agora; lida no navegador, para saber se o registro ainda vale (ADR 0014). */
const { agora } = useAgora()

const registro = ref<RegistroNoCelular | null>(null)
/** Só o registro com localização ligada tem ponto do carro (ADR 0003). */
const temPontoDoCarro = ref(false)

watch(agora, (valor) => {
  if (!valor) return
  const dados = dadosDoCelularDoAparelho()
  registro.value = dados.registroAtual(valor.noite)
  temPontoDoCarro.value = dados.pontoDoCarro(valor.noite) !== null
}, { immediate: true })
</script>

<template>
  <!-- Card Seu registro de vaga (design system, "Cards"; referência Waymo). -->
  <UCard
    v-if="registro"
    as="section"
    aria-labelledby="titulo-registro-de-vaga"
    :ui="{ body: 'grid gap-1' }"
  >
    <p class="text-xs font-semibold uppercase tracking-wider text-muted">
      Seu registro de vaga
    </p>
    <h2
      id="titulo-registro-de-vaga"
      class="mt-1 text-xl font-bold leading-tight tabular-nums"
    >
      Saída prevista: {{ rotuloDaFaixaHoraria(registro.saidaPrevista) }}
    </h2>
    <p class="text-sm font-semibold">
      {{ registro.ruaCoberta.nome }}
    </p>

    <!-- Linha de ações com ícone e rótulo, separada por uma borda. -->
    <div class="mt-3 flex flex-wrap gap-2 border-t border-default pt-3">
      <UButton
        v-if="temPontoDoCarro"
        to="/minha-vaga/carro"
        color="neutral"
        variant="outline"
        size="lg"
        class="min-h-11 font-medium"
        icon="i-lucide-map-pin"
        label="Voltar até o carro"
        :ui="{ leadingIcon: 'size-4' }"
      />
      <UButton
        to="/minha-vaga"
        color="neutral"
        variant="outline"
        size="lg"
        class="min-h-11 font-medium"
        icon="i-lucide-car"
        label="Ver minha vaga"
        :ui="{ leadingIcon: 'size-4' }"
      />
    </div>
  </UCard>
</template>
