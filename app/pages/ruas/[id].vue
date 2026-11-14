<!--
  Detalhe da rua: abre por cima, com botão de voltar no topo esquerdo e
  "Como chegar" fixo no rodapé (design system, "Padrões de navegação").
  Mostra a faixa de chance de cada faixa horária da noite e, na faixa horária
  selecionada, a chance em número com a base (ADR 0006). As saídas previstas
  da noite ficam num bloco à parte da chance (ADR 0009) e são lidas de novo a
  cada 90 segundos (ADR 0018).
-->
<script setup lang="ts">
import type { EstadoDaChance } from '~/components/AmostraDeFaixaDeChance.vue'

// No desktop, abre no painel da direita, com o mapa ao lado.
definePageMeta({ semBarraDeAbas: true, painelDesktop: 'direita' })

const route = useRoute()
const router = useRouter()

/** Atualiza sozinha enquanto a tela está aberta, porque as saídas previstas mudam (ADR 0018). */
const { data: rua, error } = await useRuaCoberta(() => String(route.params.id))

/** "1 saída prevista", "3 saídas previstas". */
function textoDasSaidas(quantidade: number) {
  return quantidade === 1 ? '1 saída prevista' : `${quantidade} saídas previstas`
}

/** Faixa horária vinda do Início; sem ela, a melhor faixa horária. */
const escolhida = ref<string | null>(typeof route.query.faixaHoraria === 'string' ? route.query.faixaHoraria : null)

const selecionada = computed(() => {
  const faixasHorarias = rua.value?.faixasHorarias ?? []
  return faixasHorarias.find(f => f.faixaHoraria === escolhida.value)
    ?? faixasHorarias.find(f => f.faixaHoraria === rua.value?.melhorFaixaHoraria)
    ?? faixasHorarias[0]
    ?? null
})

const faixaHorariaSelecionada = computed({
  get: () => selecionada.value?.faixaHoraria ?? null,
  set: (faixaHoraria) => { escolhida.value = faixaHoraria },
})

type Estimativa = NonNullable<typeof selecionada.value>['estimativa']

function estadoDe(estimativa: Estimativa): EstadoDaChance {
  return estimativa.tipo === 'chance' ? estimativa.faixaDeChance : 'Sem dado'
}

/**
 * Tinta do fundo (ADR 0034): a cor da faixa de chance da faixa horária
 * selecionada, num degradê suave do topo. Sem dado, sem tinta.
 */
const tinta = computed(() => {
  const estimativa = selecionada.value?.estimativa
  return estimativa?.tipo === 'chance' ? corDaFaixaDeChance(estimativa.faixaDeChance) : 'transparent'
})

/** Volta para a tela anterior; aberto direto pelo link, vai para o Início. */
function voltar() {
  if (window.history.state?.back) router.back()
  else navigateTo('/')
}

// "Como chegar" avisa antes de abrir outro app (ADR 0020).
const avisoAberto = ref(false)
const link = ref<string>()

function comoChegar() {
  if (!rua.value) return
  link.value = linkDoComoChegar(rua.value.meioDoTrecho, navigator.userAgent)
  avisoAberto.value = true
}

function fecharAviso() {
  avisoAberto.value = false
}
</script>

<template>
  <main class="relative isolate mx-auto max-w-160 px-5 pt-4 pb-8 lg:px-6">
    <!--
      Fundo tingido pela cor da faixa de chance selecionada (ADR 0034;
      referência Luma, que tinge pelo cartaz do evento). Fica parado no topo
      da tela e troca de cor em 500 ms quando muda a faixa horária.
    -->
    <div
      class="pointer-events-none fixed inset-x-0 top-0 -z-10 h-112 opacity-25 transition-colors duration-500 [mask-image:linear-gradient(to_bottom,black,transparent)] motion-reduce:transition-none"
      :style="{ backgroundColor: tinta }"
      aria-hidden="true"
    />

    <!-- No desktop, o painel da direita tem o próprio botão de fechar. -->
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-arrow-left"
      aria-label="Voltar"
      class="mb-4 size-10 justify-center lg:hidden"
      @click="voltar"
    />

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :title="error.statusCode === 404 ? 'Rua não encontrada' : 'Erro ao carregar'"
      :description="error.statusCode === 404
        ? 'Esta rua não é uma das ruas cobertas.'
        : 'Não foi possível carregar a chance agora. Tente de novo em instantes.'"
      :ui="{ title: 'text-sm', description: 'text-sm' }"
    />

    <template v-else-if="rua">
      <AvisoDeDemonstracao
        v-if="rua.demonstracao"
        class="mb-6"
      />

      <h1 class="text-xl font-bold leading-tight">
        {{ rua.rua.nome }}
      </h1>
      <p class="mt-1 flex items-center gap-2 text-xs font-medium tabular-nums text-muted">
        <UIcon
          name="i-lucide-footprints"
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        {{ distanciaAPe(rua.distanciaAoDestino) }} até o destino
      </p>

      <GraficoDeChance
        v-model="faixaHorariaSelecionada"
        class="mt-6"
        :faixas-horarias="rua.faixasHorarias"
        :melhor-faixa-horaria="rua.melhorFaixaHoraria"
      />

      <!-- Bloco de dado (design system, "Cards"): título com ícone e linhas separadas por border-default. -->
      <UCard
        v-if="selecionada"
        as="section"
        class="mt-3"
        aria-labelledby="titulo-bloco"
        aria-live="polite"
        :ui="{ body: 'p-4 sm:p-4 lg:p-6' }"
      >
        <h2
          id="titulo-bloco"
          class="flex items-center gap-2 text-base font-semibold tabular-nums"
        >
          <UIcon
            name="i-lucide-clock"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          {{ intervaloDaFaixaHoraria(selecionada.faixaHoraria) }}
        </h2>

        <dl class="mt-2 divide-y divide-default">
          <div class="flex items-center justify-between gap-3 py-3 text-sm tabular-nums">
            <dt class="text-xs text-muted">
              Faixa de chance
            </dt>
            <dd class="flex items-center gap-2 text-right font-semibold">
              <AmostraDeFaixaDeChance :estado="estadoDe(selecionada.estimativa)" />
              {{ estadoDe(selecionada.estimativa) }}
            </dd>
          </div>
          <div
            v-if="selecionada.estimativa.tipo === 'chance'"
            class="flex items-center justify-between gap-3 py-3 text-sm tabular-nums"
          >
            <dt class="text-xs text-muted">
              Chance
            </dt>
            <dd class="text-right font-semibold">
              {{ textoDaChanceComBase(selecionada.estimativa.chance, selecionada.estimativa.base) }}
            </dd>
          </div>
        </dl>

        <p
          v-if="selecionada.estimativa.tipo === 'sem-dado'"
          class="border-t border-default pt-3 text-sm"
        >
          Não temos observações suficientes nesta faixa horária
        </p>
      </UCard>

      <!-- Bloco de dado à parte da chance: dado declarado, não observado (ADR 0009). -->
      <UCard
        as="section"
        class="mt-3"
        aria-labelledby="titulo-saidas"
        :ui="{ body: 'p-4 sm:p-4 lg:p-6' }"
      >
        <h2
          id="titulo-saidas"
          class="flex items-center gap-2 text-base font-semibold tabular-nums"
        >
          <UIcon
            name="i-lucide-log-out"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          Saídas previstas nesta noite
        </h2>

        <dl
          v-if="rua.saidasPrevistas.length"
          class="mt-2 divide-y divide-default"
        >
          <div
            v-for="saida in rua.saidasPrevistas"
            :key="saida.faixaHoraria"
            class="flex items-center justify-between gap-3 py-3 text-sm tabular-nums"
          >
            <dt class="text-xs text-muted">
              {{ intervaloDaFaixaHoraria(saida.faixaHoraria) }}
            </dt>
            <dd class="text-right font-semibold">
              {{ textoDasSaidas(saida.quantidade) }}
            </dd>
          </div>
        </dl>
        <p
          v-else
          class="py-3 text-sm"
        >
          Ninguém registrou saída prevista nesta rua hoje.
        </p>

        <p class="border-t border-default pt-3 text-xs text-muted">
          Informadas por quem estacionou aqui. Não entram na chance.
        </p>
      </UCard>
    </template>

    <!-- Ação principal fixa no rodapé (design system, "Padrões de navegação"). -->
    <footer
      v-if="rua"
      class="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-160 bg-default px-5 pt-3 pb-[calc(--spacing(3)+env(safe-area-inset-bottom))] lg:px-6"
    >
      <UButton
        color="neutral"
        size="xl"
        block
        icon="i-lucide-navigation"
        label="Como chegar"
        class="h-13 text-lg lg:h-11"
        @click="comoChegar"
      />
    </footer>

    <!-- Aviso de que "Como chegar" abre outro app (ADR 0020). -->
    <UDrawer
      v-model:open="avisoAberto"
      title="Abrir outro app?"
    >
      <template #body>
        <p class="text-sm">
          "Como chegar" abre o app de navegação do celular com a {{ rua?.rua.nome }} como destino.
          Esse app recebe a rua de destino e a sua posição.
        </p>
      </template>
      <template #footer>
        <UButton
          color="neutral"
          size="xl"
          block
          :to="link"
          external
          label="Abrir app de navegação"
          class="h-13 text-lg"
          @click="fecharAviso"
        />
        <UButton
          color="primary"
          variant="link"
          label="Cancelar"
          class="min-h-11 self-center px-4 text-sm font-medium"
          @click="fecharAviso"
        />
      </template>
    </UDrawer>
  </main>
</template>
