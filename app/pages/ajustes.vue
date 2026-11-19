<!--
  Ajustes (referências Grok, Waymo e Pangea): a rotina, pela grade horária
  (ADR 0035), a forma de colaborar em linhas com seletor, a sugestão de rua,
  o aviso de privacidade e "Apagar histórico" no fim da lista, sempre com
  confirmação. Grade horária e forma de colaborar ficam só no celular (ADRs
  0004, 0010, 0015 e 0035); a sugestão de rua vai ao servidor só com o texto
  (ADR 0013). Não há mais campo para o horário de chegada habitual; uma
  rotina já guardada continua valendo até salvar uma grade.
-->
<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import type { DadosDoCelular, FormaDeColaborar } from '~/dados-do-celular'
import { DIAS_DA_SEMANA, NOMES_DOS_DIAS } from '~/grade-horaria'
import type { GradeHoraria } from '~/grade-horaria'

// No desktop, abre no painel da direita, com o mapa ao lado e margem de 24 px (lg:px-6).
definePageMeta({ painelDesktop: 'direita' })

/** Noite de agora; lida no navegador, para saber se há um registro de vaga aberto. */
const { lerNoite } = useAgora()

/** A grade horária e a forma de colaborar ficam só no celular: são lidas e guardadas no navegador. */
let dados: DadosDoCelular | undefined
const forma = ref<FormaDeColaborar>('nenhuma')
/** Grade horária importada (ADR 0035). */
const grade = ref<GradeHoraria | null>(null)

onMounted(() => {
  dados = dadosDoCelularDoAparelho()
  forma.value = dados.formaDeColaborar()
  grade.value = dados.gradeHoraria()
})

const importador = ref<{ escolherPdf: () => void, editar: (grade: GradeHoraria | null) => void }>()

function salvarGrade(nova: GradeHoraria) {
  dados ??= dadosDoCelularDoAparelho()
  dados.definirGradeHoraria(nova)
  grade.value = nova
  avisar('Grade horária salva. O Início abre na melhor chegada de cada dia.')
}

function removerGrade() {
  dados ??= dadosDoCelularDoAparelho()
  dados.definirGradeHoraria(null)
  grade.value = null
  avisar('Grade horária removida deste celular.')
}

/** Dias com aula da grade, em ordem: "Segunda · 19h às 21h50". */
const diasDaGrade = computed(() => DIAS_DA_SEMANA.flatMap((dia) => {
  const aulas = grade.value?.[dia]
  return aulas ? [{ dia, nome: NOMES_DOS_DIAS[dia], inicio: aulas.inicio, fim: aulas.fim }] : []
}))

// --- Forma de colaborar (ADR 0010) ---------------------------------------------

function mudarForma(nova: FormaDeColaborar) {
  dados?.definirFormaDeColaborar(nova)
  forma.value = nova
}

/** Ligar o registro de vaga começa no manual: a localização continua desligada. */
function mudarRegistro(ligado: boolean) {
  mudarForma(ligado ? 'manual' : 'nenhuma')
}

const { escuro, definirEscuro } = useTrocaDeTema()

/** O círculo da troca de tema parte do seletor tocado (o elemento em foco). */
function mudarTema(ligado: boolean) {
  definirEscuro(ligado, document.activeElement)
}

function mudarLocalizacao(ligada: boolean) {
  mudarForma(ligada ? 'localizacao-ligada' : 'manual')
}

// --- Sugestão de rua (ADR 0013) -----------------------------------------------

const sugestao = ref<{ abrir: () => void, fechar: () => void }>()
const formularioDeSugestao = ref<{ limpar: () => void }>()

function sugestaoEnviada() {
  sugestao.value?.fechar()
  avisar('Sugestão enviada para a equipe.')
}

// --- Privacidade e Apagar histórico ---------------------------------------------

const privacidade = ref<{ abrir: () => void }>()
/** Confirmação de "Apagar histórico" (UModal). */
const confirmacaoAberta = ref(false)
/** Registro de vaga aberto nesta noite: sem o código, não dá mais para tocar em "Saí" (ADR 0014). */
const temRegistroAberto = ref(false)

const { avisar } = useAvisoFlutuanteStore()

/**
 * Sem a noite de agora (ainda carregando ou sem conexão), não dá para saber
 * se o registro guardado ainda vale: o aviso aparece por precaução.
 */
async function pedirConfirmacao() {
  dados ??= dadosDoCelularDoAparelho()
  const noite = await lerNoite()
  temRegistroAberto.value = noite ? dados.registroAtual(noite) !== null : true
  confirmacaoAberta.value = true
}

function apagarHistorico() {
  dados ??= dadosDoCelularDoAparelho()
  dados.apagarHistorico()
  grade.value = null
  confirmacaoAberta.value = false
  avisar('Histórico apagado deste celular.')
}
</script>

<template>
  <main class="mx-auto max-w-160 px-5 py-8 lg:px-6 lg:pt-0">
    <!-- No desktop, o título sobe para o topo do painel, ao lado do fechar. -->
    <TituloDoPainel>
      Ajustes
    </TituloDoPainel>

    <section
      class="mt-8 lg:mt-6"
      aria-labelledby="titulo-aparencia"
    >
      <h2
        id="titulo-aparencia"
        class="text-xs font-semibold uppercase tracking-wider text-muted"
      >
        Aparência
      </h2>

      <UCard class="mt-3">
        <!-- O tema escolhido só é conhecido no navegador. -->
        <ClientOnly>
          <LinhaComSeletor
            titulo="Tema escuro"
            explicacao=""
            icone="i-lucide-moon"
            :ligado="escuro"
            @mudar="mudarTema"
          />
        </ClientOnly>
      </UCard>
    </section>

    <section
      class="mt-8"
      aria-labelledby="titulo-rotina"
    >
      <h2
        id="titulo-rotina"
        class="text-xs font-semibold uppercase tracking-wider text-muted"
      >
        Rotina
      </h2>

      <!-- Com grade horária (ADR 0035): os dias com aula, editar e remover. -->
      <UCard
        v-if="grade"
        class="mt-3"
        :ui="{ body: 'grid gap-2' }"
      >
        <h3 class="text-base font-semibold leading-tight">
          Grade horária
        </h3>
        <p class="max-w-[70ch] text-xs text-muted">
          Em dia com aula, o Parô abre na melhor chegada para a primeira aula e sugere a saída prevista no fim da
          última. Em dia sem aula, abre em Agora. Fica guardada só neste celular.
        </p>
        <ul class="mt-1 grid">
          <li
            v-for="item in diasDaGrade"
            :key="item.dia"
            class="flex items-center justify-between gap-3 border-b border-default py-2 text-sm last:border-b-0"
          >
            <span class="font-medium">{{ item.nome }}</span>
            <span class="tabular-nums text-muted">
              {{ rotuloDaFaixaHoraria(item.inicio) }} às {{ rotuloDaFaixaHoraria(item.fim) }}
            </span>
          </li>
        </ul>
        <div class="mt-2 grid grid-cols-2 gap-2">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-pencil"
            label="Editar"
            block
            class="min-h-11 text-sm"
            aria-haspopup="dialog"
            @click="importador?.editar(grade)"
          />
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-file-up"
            label="Novo PDF"
            block
            class="min-h-11 text-sm"
            @click="importador?.escolherPdf()"
          />
        </div>
        <UButton
          color="error"
          variant="link"
          icon="i-lucide-x"
          label="Remover grade"
          class="min-h-11 justify-self-start px-0 text-sm"
          @click="removerGrade"
        />
      </UCard>

      <UCard
        v-else
        class="mt-3"
        :ui="{ body: 'grid gap-2' }"
      >
        <h3 class="text-base font-semibold leading-tight">
          Grade horária
        </h3>

        <!-- Grade horária da ESAMC em PDF (ADR 0035). -->
        <div class="mt-2 grid gap-2">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-file-up"
            label="Importar grade horária (PDF)"
            block
            class="min-h-11 text-sm"
            @click="importador?.escolherPdf()"
          />
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-pencil"
            label="Preencher a grade à mão"
            block
            aria-haspopup="dialog"
            class="min-h-11 text-smp"
            @click="importador?.editar(null)"
          />
          <p class="max-w-[70ch] text-xs text-muted">
            No portal da ESAMC, salve o horário em Imprimir › Salvar como PDF. O PDF não é guardado.
          </p>
        </div>
      </UCard>

      <ImportarGradeHoraria
        ref="importador"
        @salvar="salvarGrade"
      />
    </section>

    <section
      class="mt-8"
      aria-labelledby="titulo-forma"
    >
      <h2
        id="titulo-forma"
        class="text-xs font-semibold uppercase tracking-wider text-muted"
      >
        Forma de colaborar
      </h2>

      <!-- Linhas do mesmo card separadas por border-default (referência Waymo). -->
      <UCard class="mt-3">
        <LinhaComSeletor
          titulo="Registrar vagas"
          explicacao=""
          icone="i-lucide-car"
          :ligado="forma !== 'nenhuma'"
          @mudar="mudarRegistro"
        />
        <LinhaComSeletor
          v-if="forma !== 'nenhuma'"
          class="mt-4 border-t border-default pt-4"
          titulo="Usar localização"
          explicacao=""
          icone="i-lucide-locate"
          :ligado="forma === 'localizacao-ligada'"
          @mudar="mudarLocalizacao"
        />
      </UCard>
    </section>

    <section
      class="mt-8"
      aria-labelledby="titulo-sugestao"
    >
      <h2
        id="titulo-sugestao"
        class="text-xs font-semibold uppercase tracking-wider text-muted"
      >
        Sugestão de rua
      </h2>

      <!-- Linha com ícone, rótulo e seta (referência Waymo). -->
      <UCard
        class="mt-3"
        :ui="{ body: 'py-1 sm:py-2' }"
      >
        <UButton
          color="neutral"
          variant="link"
          block
          icon="i-lucide-map-pin-plus"
          trailing-icon="i-lucide-chevron-right"
          label="Sugerir rua ou trecho"
          aria-haspopup="dialog"
          class="min-h-11 gap-3 px-0 text-sm text-default hover:text-default active:text-default"
          :ui="{ leadingIcon: 'size-5', trailingIcon: 'ms-auto size-5' }"
          @click="sugestao?.abrir()"
        />
      </UCard>
    </section>

    <section
      class="mt-8"
      aria-labelledby="titulo-privacidade"
    >
      <h2
        id="titulo-privacidade"
        class="text-xs font-semibold uppercase tracking-wider text-muted"
      >
        Privacidade
      </h2>

      <UCard
        class="mt-3"
        :ui="{ body: 'py-1 sm:py-2' }"
      >
        <UButton
          color="neutral"
          variant="link"
          block
          icon="i-lucide-shield"
          trailing-icon="i-lucide-chevron-right"
          label="Como o Parô trata os seus dados"
          aria-haspopup="dialog"
          class="min-h-11 gap-3 px-0 text-sm text-default hover:text-default active:text-default"
          :ui="{ leadingIcon: 'size-5', trailingIcon: 'ms-auto size-5' }"
          @click="privacidade?.abrir()"
        />
      </UCard>
    </section>

    <!--
      Área da equipe: entrada para Observações (ADR 0011) e Métricas, que pedem a
      chave da equipe. Fica perto do fim de Ajustes, antes do Apagar histórico,
      para a equipe registrar as contagens de campo pelo celular sem decorar o
      endereço.
    -->
    <section
      class="mt-8"
      aria-labelledby="titulo-equipe"
    >
      <h2
        id="titulo-equipe"
        class="text-xs font-semibold uppercase tracking-wider text-muted"
      >
        Equipe
      </h2>

      <UCard
        class="mt-3"
        :ui="{ body: 'py-1 sm:py-2' }"
      >
        <UButton
          to="/equipe/observacoes"
          color="neutral"
          variant="link"
          block
          icon="i-lucide-clipboard-list"
          trailing-icon="i-lucide-chevron-right"
          label="Área da equipe"
          class="min-h-11 gap-3 px-0 text-sm text-default hover:text-default active:text-default"
          :ui="{ leadingIcon: 'size-5', trailingIcon: 'ms-auto size-5' }"
        />
      </UCard>
      <p class="mt-2 max-w-[70ch] text-xs text-muted">
        Só para a equipe do Parô: registrar as contagens feitas nas ruas e ver as métricas de uso, com a chave da equipe.
      </p>
    </section>

    <!-- Ação de apagar por último, no fim de Ajustes (referência Grok); sempre com confirmação. -->
    <div class="mt-8 grid gap-1">
      <UButton
        color="error"
        variant="link"
        icon="i-lucide-trash-2"
        label="Apagar histórico"
        aria-haspopup="dialog"
        class="min-h-11 justify-self-start px-0 text-sm"
        @click="pedirConfirmacao"
      />
      <p class="max-w-[70ch] text-xs text-muted">
        Limpa deste celular a rotina, o registro de vaga com o código e o ponto do carro.
      </p>
    </div>

    <Gaveta
      ref="sugestao"
      titulo="Sugerir rua ou trecho"
      @fechada="formularioDeSugestao?.limpar()"
    >
      <FormularioDeSugestao
        ref="formularioDeSugestao"
        @enviada="sugestaoEnviada"
      />
    </Gaveta>

    <Gaveta
      ref="privacidade"
      titulo="Como o Parô trata os seus dados"
    >
      <AvisoDePrivacidade />
    </Gaveta>

    <!-- Confirmação (UModal), acima da barra de abas (z-10), como as gavetas. -->
    <UModal
      v-model:open="confirmacaoAberta"
      title="Apagar histórico?"
      :close="{ color: 'neutral', variant: 'outline', square: true, class: 'size-10 justify-center lg:size-9' }"
      :ui="{
        overlay: 'z-40',
        content: 'z-50 divide-y-0 rounded-paro-lg bg-elevated ring-default',
        title: 'text-base font-semibold text-default',
        body: 'grid gap-4 py-0 sm:py-0',
        footer: 'grid grid-cols-2 gap-2',
      }"
    >
      <template #body>
        <p class="max-w-[70ch] text-sm">
          Apaga deste celular a rotina, a grade horária, o registro de vaga com o código, o ponto do carro e o histórico de vagas. Não dá para desfazer.
          A forma de colaborar continua como está.
        </p>

        <UAlert
          v-if="temRegistroAberto"
          role="alert"
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          :ui="{ description: 'grid gap-2 text-xs font-medium' }"
        >
          <template #description>
            <p>
              Se você tem um registro de vaga aberto nesta noite: sem o código, não dá mais para mudar a saída prevista
              nem tocar em "Saí", e a sua saída prevista continua contando para quem está chegando até o fim da noite.
            </p>
            <NuxtLink
              to="/minha-vaga"
              class="font-semibold underline"
              @click="confirmacaoAberta = false"
            >
              Tocar em "Saí" antes, em Minha vaga
            </NuxtLink>
          </template>
        </UAlert>
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
          label="Apagar"
          class="min-h-13 text-sm text-error"
          @click="apagarHistorico"
        />
      </template>
    </UModal>
  </main>
</template>
