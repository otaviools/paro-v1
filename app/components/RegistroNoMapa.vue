<!--
  Seu registro de vaga sobre o mapa do desktop, ao lado da legenda: com um
  registro de vaga aberto nesta noite e fora da aba Vaga, mostra a saída
  prevista, a rua coberta e a chegada, com um ponto verde piscando que avisa
  que o registro está ativo. "Mudar saída" abre a aba Vaga. Tem a largura da
  legenda (248 px) e, lado a lado com ela, a mesma altura. Entra subindo
  12 px e aparecendo, e sai descendo; com movimento reduzido, troca na hora e
  o ponto fica parado.

  Lê só os Dados do celular (ADR 0003); nada sai do aparelho. Como eles não
  avisam quando mudam, o registro é lido de novo a cada troca de tela: assim o
  card aparece ao sair da aba Vaga depois de registrar e some depois do "Saí".
-->
<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import type { RegistroNoCelular } from '~/dados-do-celular'

const route = useRoute()
/** Noite de agora; lida no navegador, para saber se o registro ainda vale (ADR 0014). */
const { agora } = useAgora()

const registro = ref<RegistroNoCelular | null>(null)

watch([agora, () => route.fullPath], ([valor]) => {
  registro.value = valor ? dadosDoCelularDoAparelho().registroAtual(valor.noite) : null
}, { immediate: true })

/** Na aba Vaga o mesmo card já está no painel da direita. */
const visivel = computed(() => registro.value !== null && !route.path.startsWith('/minha-vaga'))
</script>

<template>
  <Transition
    enter-active-class="transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
    enter-from-class="opacity-0 translate-y-3"
    leave-active-class="transition-[opacity,translate] duration-200 ease-in motion-reduce:transition-none"
    leave-to-class="opacity-0 translate-y-3"
  >
    <UCard
      v-if="visivel && registro"
      as="section"
      class="w-62"
      aria-labelledby="titulo-registro-no-mapa"
      :ui="{ root: 'flex flex-col', body: 'flex flex-1 flex-col gap-1 p-4 sm:p-4' }"
    >
      <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
        <!-- Ponto verde piscando: o registro está ativo. -->
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
        id="titulo-registro-no-mapa"
        class="mt-1 text-lg font-bold leading-tight tabular-nums"
      >
        Saída prevista: {{ rotuloDaFaixaHoraria(registro.saidaPrevista) }}
      </h2>
      <p class="text-sm font-semibold">
        {{ registro.ruaCoberta.nome }}
      </p>
      <p class="text-xs font-medium tabular-nums text-muted">
        Chegada: {{ rotuloDaFaixaHoraria(registro.chegada) }}
      </p>
      <UButton
        to="/minha-vaga"
        color="neutral"
        variant="outline"
        icon="i-lucide-clock"
        label="Mudar saída"
        class="mt-auto min-h-11 self-start px-4 text-sm font-medium"
        :ui="{ leadingIcon: 'size-4' }"
      />
    </UCard>
  </Transition>
</template>
