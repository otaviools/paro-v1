<!--
  Registrar vaga (referências Pangea e Lime): a rua coberta escolhida no
  seletor de opção com ícone e a saída prevista escolhida na gaveta de
  escolha. A chegada é a faixa horária de agora. O registro leva só a rua
  coberta e as faixas horárias (ADRs 0003 e 0004); o código volta para o
  celular (ADR 0014). A barra de abas some nesta tela.

  A tela segue a forma de colaborar dos Dados do celular (ADR 0010). Com a
  localização ligada, "Usar minha localização" lê a posição uma vez, só quando
  tocado, e a Área coberta propõe a rua coberta mais próxima, que o
  colaborador pode trocar. O cálculo é feito aqui no celular: a posição vira o
  ponto do carro, guardado só nos Dados do celular, e nunca vai ao servidor
  (ADR 0003). No registro manual, o botão não aparece: a rua é escolhida na
  lista, sem ponto do carro. Com a forma "nenhuma", o registro está desligado
  e a tela volta para Minha vaga.
-->
<script setup lang="ts">
import { areaCoberta } from '#shared/utils/area-coberta'
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import type { DadosDoCelular, FormaDeColaborar, Ponto } from '~/dados-do-celular'

// No desktop, abre no painel da direita, como Minha vaga.
definePageMeta({ semBarraDeAbas: true, painelDesktop: 'direita' })

const router = useRouter()

const { data: ruas } = await useRuasCobertas()
const { data: faixasHorarias } = await useFaixasHorarias()
/** Noite e faixa horária de agora; lidas no navegador, na hora de abrir a tela. */
const { agora, erro: erroDoAgora } = useAgora()
const { registrar: registrarVaga } = useRegistroDeVaga()

let dados: DadosDoCelular | undefined

/** Forma de colaborar; lida no navegador, ao abrir a tela. */
const forma = ref<FormaDeColaborar | null>(null)
onMounted(() => {
  dados ??= dadosDoCelularDoAparelho()
  forma.value = dados.formaDeColaborar()
  if (forma.value === 'nenhuma') navigateTo('/minha-vaga', { replace: true })
})
const comLocalizacao = computed(() => forma.value === 'localizacao-ligada')

// Com um registro aberto nesta noite, a tela é Seu registro de vaga.
watch(agora, (valor) => {
  if (!valor) return
  dados ??= dadosDoCelularDoAparelho()
  if (dados.registroAtual(valor.noite)) navigateTo('/minha-vaga', { replace: true })
}, { immediate: true })

const ruaEscolhida = ref<string | null>(null)
const saidaPrevista = ref<string | null>(null)
const erroDaRua = ref<string | null>(null)
const erroDaSaida = ref<string | null>(null)
const erroDoEnvio = ref<string | null>(null)
const enviando = ref(false)

const grupos = computed(() =>
  agora.value?.faixaHoraria ? gruposDaSaidaPrevista(faixasHorarias.value ?? [], agora.value.faixaHoraria) : [],
)

const gaveta = ref<{ abrir: () => void, fechar: () => void }>()

/** Opções do seletor de rua coberta, com a distância a pé até o destino. */
const opcoesDeRua = computed(() => (ruas.value ?? []).map(rua => ({
  value: rua.id,
  label: rua.nome,
  description: distanciaAPe(rua.distanciaAoDestino),
  icon: 'i-lucide-signpost',
})))

function escolherRua(id: string) {
  ruaEscolhida.value = id
  erroDaRua.value = null
}

// --- Localização ligada ---------------------------------------------------

/** Ponto do carro lido neste registro; null no modo manual. */
const pontoDoCarro = ref<Ponto | null>(null)
/** Rua coberta proposta pela localização; o colaborador pode trocar. */
const ruaProposta = ref<string | null>(null)
const localizando = ref(false)
const erroDaLocalizacao = ref<string | null>(null)

async function usarMinhaLocalizacao() {
  if (localizando.value) return
  localizando.value = true
  erroDaLocalizacao.value = null
  const leitura = await lerLocalizacao()
  localizando.value = false
  if (leitura.tipo === 'lida') {
    pontoDoCarro.value = leitura.ponto
    ruaProposta.value = areaCoberta.ruaMaisProxima(leitura.ponto).id
    escolherRua(ruaProposta.value)
    return
  }
  // Sem localização, o registro segue no modo manual, sem ponto do carro.
  pontoDoCarro.value = null
  ruaProposta.value = null
  erroDaLocalizacao.value = leitura.tipo === 'negada'
    ? 'A localização não foi liberada. Escolha a rua coberta na lista; sem a localização, o registro não guarda o ponto do carro.'
    : 'Não foi possível ler a sua localização agora. Escolha a rua coberta na lista; sem a localização, o registro não guarda o ponto do carro.'
}

function escolherSaida(faixaHoraria: string) {
  saidaPrevista.value = faixaHoraria
  erroDaSaida.value = null
  gaveta.value?.fechar()
}

const confirmacaoDeRegistro = useConfirmacaoDeRegistroStore()

async function registrar() {
  erroDaRua.value = ruaEscolhida.value ? null : 'Escolha a rua coberta onde você estacionou.'
  erroDaSaida.value = saidaPrevista.value ? null : 'Escolha a faixa horária em que você pretende sair.'
  const rua = ruas.value?.find(r => r.id === ruaEscolhida.value)
  if (!rua || !saidaPrevista.value || enviando.value) return

  enviando.value = true
  erroDoEnvio.value = null
  try {
    const resultado = await registrarVaga({ ruaCoberta: rua.id, saidaPrevista: saidaPrevista.value })
    if (resultado.tipo === 'falha') {
      erroDoEnvio.value = resultado.motivo
        ? `${resultado.motivo}.`
        : 'Não foi possível registrar agora. Tente de novo em instantes.'
      return
    }
    const { registrado } = resultado
    dados ??= dadosDoCelularDoAparelho()
    dados.guardarRegistro({
      codigo: registrado.codigo,
      noite: registrado.noite,
      ruaCoberta: { id: rua.id, nome: rua.nome },
      chegada: registrado.chegada,
      saidaPrevista: saidaPrevista.value,
    }, pontoDoCarro.value ?? undefined)
    confirmacaoDeRegistro.marcar()
    await navigateTo('/minha-vaga', { replace: true })
  }
  catch {
    erroDoEnvio.value = 'Não foi possível registrar agora. Tente de novo em instantes.'
  }
  finally {
    enviando.value = false
  }
}

/** Volta para a tela anterior; aberto direto pelo link, vai para Minha vaga. */
function voltar() {
  if (window.history.state?.back) router.back()
  else navigateTo('/minha-vaga')
}
</script>

<template>
  <main class="mx-auto max-w-160 px-5 pt-4 pb-8 lg:px-6">
    <!-- Botão de ícone (design system, "Botões"). -->
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-arrow-left"
      class="mb-4 size-10 justify-center lg:size-9"
      aria-label="Voltar"
      @click="voltar"
    />

    <h1 class="text-2xl font-bold leading-tight tracking-tight">
      Registrar vaga
    </h1>
    <p class="mt-2 max-w-[70ch] text-xs text-muted">
      Avise quem está chegando quando a sua vaga deve ficar livre. O registro leva só a rua coberta e as
      faixas horárias de chegada e de saída, sem a sua posição e sem nada que identifique você.
    </p>

    <div
      v-if="!agora && !erroDoAgora"
      class="mt-8 h-64 rounded-paro-lg bg-muted"
      aria-busy="true"
      aria-label="Carregando"
    />

    <UAlert
      v-else-if="erroDoAgora"
      class="mt-8"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Erro ao carregar"
      description="Não foi possível carregar agora. Tente de novo em instantes."
      :ui="{ title: 'text-sm', description: 'text-sm' }"
    />

    <UAlert
      v-else-if="agora && agora.faixaHoraria === null"
      class="mt-8"
      color="warning"
      variant="soft"
      icon="i-lucide-clock"
      title="Fora do horário de cobertura"
      description="O registro de vaga vale das 17h às 23h, o horário da área coberta. Registre quando estacionar nesse horário."
      :ui="{ title: 'text-sm', description: 'text-sm' }"
    />

    <form
      v-else
      id="registro"
      class="mt-8 grid gap-8"
      novalidate
      @submit.prevent="registrar"
    >
      <section
        class="grid gap-3"
        aria-labelledby="rotulo-rua"
      >
        <h2
          id="rotulo-rua"
          class="text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Rua coberta
        </h2>

        <UButton
          v-if="comLocalizacao"
          color="neutral"
          variant="outline"
          size="lg"
          block
          class="min-h-11 font-medium"
          icon="i-lucide-locate"
          :loading="localizando"
          :label="localizando ? 'Lendo a sua localização' : 'Usar minha localização'"
          :aria-busy="localizando"
          :aria-describedby="erroDaLocalizacao ? 'erro-localizacao' : 'nota-localizacao'"
          :ui="{ leadingIcon: 'size-4' }"
          @click="usarMinhaLocalizacao"
        />
        <p
          v-if="!comLocalizacao"
          id="nota-localizacao"
          class="max-w-[70ch] text-xs text-muted"
        >
          Escolha na lista a rua coberta onde você estacionou. No registro manual, a localização não é usada.
        </p>
        <p
          v-else-if="erroDaLocalizacao"
          id="erro-localizacao"
          class="flex max-w-[70ch] items-start gap-2 text-xs font-medium text-error"
          role="alert"
        >
          <UIcon
            name="i-lucide-circle-alert"
            class="mt-px size-4 shrink-0"
            aria-hidden="true"
          />
          {{ erroDaLocalizacao }}
        </p>
        <p
          v-else-if="ruaProposta"
          id="nota-localizacao"
          class="flex max-w-[70ch] items-start gap-2 text-xs text-muted"
          role="status"
        >
          <UIcon
            name="i-lucide-locate"
            class="mt-px size-4 shrink-0"
            aria-hidden="true"
          />
          {{ ruaEscolhida === ruaProposta
            ? 'Rua proposta pela sua localização. Se não for esta, toque na rua certa.'
            : 'Rua trocada. O ponto do carro continua guardado só neste celular.' }}
        </p>
        <p
          v-else
          id="nota-localizacao"
          class="max-w-[70ch] text-xs text-muted"
        >
          Com a localização, o celular propõe a rua coberta mais próxima e guarda o ponto do carro só neste
          aparelho, para Voltar até o carro. Ou escolha a rua na lista.
        </p>

        <!--
          Seletor de opção com ícone (design system, "Formulários"; referência
          Pangea): a escolhida em bg-primary-100 com borda de 1,5 px em
          --ui-primary (a borda de 1 px mais 0,5 px de sombra por dentro, para
          a opção não mudar de tamanho).
        -->
        <URadioGroup
          :model-value="ruaEscolhida ?? undefined"
          :items="opcoesDeRua"
          variant="card"
          indicator="hidden"
          color="primary"
          orientation="horizontal"
          aria-labelledby="rotulo-rua"
          :aria-describedby="erroDaRua ? 'erro-rua' : undefined"
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
        <p
          v-if="erroDaRua"
          id="erro-rua"
          class="flex items-start gap-2 text-xs font-medium text-error"
        >
          <UIcon
            name="i-lucide-circle-alert"
            class="mt-px size-4 shrink-0"
            aria-hidden="true"
          />
          {{ erroDaRua }}
        </p>
      </section>

      <section class="grid gap-3">
        <h2
          id="rotulo-saida"
          class="text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Saída prevista
        </h2>
        <!-- Campo (design system, "Formulários"): 48 px, bg-elevated, borda, rounded-paro-md. -->
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          block
          class="h-12 justify-between px-4 font-medium tabular-nums lg:h-10"
          trailing-icon="i-lucide-chevron-down"
          aria-labelledby="rotulo-saida valor-saida"
          :aria-describedby="erroDaSaida ? 'erro-saida' : undefined"
          aria-haspopup="dialog"
          :ui="{ trailingIcon: 'size-4' }"
          @click="gaveta?.abrir()"
        >
          <span
            id="valor-saida"
            :class="{ 'text-muted': !saidaPrevista }"
          >
            {{ saidaPrevista ? intervaloDaFaixaHoraria(saidaPrevista) : 'Escolher faixa horária' }}
          </span>
        </UButton>
        <p
          v-if="erroDaSaida"
          id="erro-saida"
          class="flex items-start gap-2 text-xs font-medium text-error"
        >
          <UIcon
            name="i-lucide-circle-alert"
            class="mt-px size-4 shrink-0"
            aria-hidden="true"
          />
          {{ erroDaSaida }}
        </p>
      </section>

      <p
        v-if="erroDoEnvio"
        class="flex items-start gap-2 text-xs font-medium text-error"
        role="alert"
      >
        <UIcon
          name="i-lucide-circle-alert"
          class="mt-px size-4 shrink-0"
          aria-hidden="true"
        />
        {{ erroDoEnvio }}
      </p>
    </form>

    <!-- Ação principal fixa no rodapé (design system, "Padrões de navegação"). -->
    <footer
      v-if="agora?.faixaHoraria"
      class="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-160 bg-default px-5 pt-3 pb-[calc(--spacing(3)+env(safe-area-inset-bottom))] lg:px-6"
    >
      <UButton
        type="submit"
        form="registro"
        color="neutral"
        size="xl"
        block
        class="h-13 text-lg lg:h-11"
        :loading="enviando"
        :label="enviando ? undefined : 'Registrar vaga'"
        :aria-label="enviando ? 'Registrando' : undefined"
        :aria-busy="enviando"
      />
    </footer>

    <GavetaDeEscolha
      ref="gaveta"
      titulo="Saída prevista"
      :grupos="grupos"
      :escolhida="saidaPrevista"
      @salvar="escolherSaida"
    />
  </main>
</template>
