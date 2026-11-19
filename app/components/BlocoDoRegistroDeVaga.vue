<!--
  Bloco do registro de vaga no Início (design system, "Fluxos": Voltar ao carro;
  referência Rivian): com um registro de vaga aberto nesta noite, mostra a
  saída prevista e a rua coberta. Embaixo, "Saí" (ação principal: avisa a
  saída e encerra o registro, como na aba Vaga), "Voltar até o carro" no
  registro com localização ligada e "Ver minha vaga". Sem registro aberto, não
  aparece. Lê os Dados do celular (ADR 0003); o "Saí" só manda o código do
  registro.
-->
<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import type { RegistroNoCelular } from '~/dados-do-celular'

/** Noite de agora; lida no navegador, para saber se o registro ainda vale (ADR 0014). */
const { agora } = useAgora()

const registro = ref<RegistroNoCelular | null>(null)
/** Só o registro com localização ligada tem ponto do carro (ADR 0003). */
const temPontoDoCarro = ref(false)
const { encerrar } = useRegistroDeVaga()
const { avisar } = useAvisoFlutuanteStore()

watch(agora, (valor) => {
  if (!valor) return
  const dados = dadosDoCelularDoAparelho()
  registro.value = dados.registroAtual(valor.noite)
  temPontoDoCarro.value = dados.pontoDoCarro(valor.noite) !== null
}, { immediate: true })

/** "Saí": o mesmo da aba Vaga. Depois de avisar, o card some. */
const saindo = ref(false)
async function sair() {
  if (!registro.value || saindo.value) return
  saindo.value = true
  // Código recusado conta como encerrado: o registro já não conta, então o "Saí" vale do mesmo jeito.
  const resultado = await encerrar(registro.value.codigo)
  saindo.value = false
  if (resultado === 'falha') {
    avisar('Não foi possível avisar a saída agora. Tente de novo em instantes.', 'erro')
    return
  }
  dadosDoCelularDoAparelho().apagarRegistro()
  registro.value = null
  temPontoDoCarro.value = false
  avisar('Saída registrada. Obrigado por avisar quem está chegando.')
}
</script>

<template>
  <!-- Card Seu registro de vaga (design system, "Cards"; referência Waymo). -->
  <UCard
    v-if="registro"
    as="section"
    aria-labelledby="titulo-registro-de-vaga"
    :ui="{ body: 'grid gap-1' }"
  >
    <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
      <!-- Ponto verde piscando: o registro está ativo (como no card sobre o mapa do desktop). -->
      <span
        class="relative flex size-2.5"
        aria-hidden="true"
      >
        <span class="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
        <span class="relative inline-flex size-2.5 rounded-full bg-success" />
      </span>
      Seu registro de vaga
      <span class="sr-only">(ativo)</span>
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

    <!--
      Ações de largura total, uma por linha, ícone ao lado do texto: "Saí" é a
      principal (cheia); as outras são pílulas de vidro.
    -->
    <div class="mt-3 grid gap-2 border-t border-default pt-3">
      <UButton
        color="neutral"
        icon="i-lucide-log-out"
        block
        class="min-h-11 px-4 text-sm font-semibold"
        :loading="saindo"
        :label="saindo ? undefined : 'Saí'"
        :aria-label="saindo ? 'Avisando a saída' : undefined"
        :aria-busy="saindo"
        :ui="{ leadingIcon: 'size-4' }"
        @click="sair"
      />
      <UButton
        v-if="temPontoDoCarro"
        to="/minha-vaga/carro"
        color="neutral"
        variant="outline"
        icon="i-lucide-map-pin"
        label="Voltar até o carro"
        block
        class="min-h-11 px-4 text-sm font-medium"
        :ui="{ leadingIcon: 'size-4' }"
      />
      <UButton
        to="/minha-vaga"
        color="neutral"
        variant="outline"
        icon="i-lucide-car"
        label="Ver minha vaga"
        block
        class="min-h-11 px-4 text-sm font-medium"
        :ui="{ leadingIcon: 'size-4' }"
      />
    </div>
  </UCard>
</template>
