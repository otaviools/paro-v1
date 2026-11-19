<!--
  Primeira visita (design system, "Fluxos"; referências Tinder e Waymo): três
  telas cheias, sem barra de abas. A primeira apresenta o Parô; a segunda
  pede a forma de colaborar em cards de escolha única, com "Nenhuma por
  enquanto" já escolhida: tudo começa desligado e não existe localização
  contínua (ADR 0010). A terceira oferece importar a grade horária da ESAMC
  em PDF (ADR 0035), opcional. O aviso de privacidade abre numa gaveta a partir de um
  link. A escolha e o fim da Primeira visita ficam nos Dados do celular, e a
  Primeira visita não aparece de novo.
-->
<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import type { FormaDeColaborar } from '~/dados-do-celular'
import { DIAS_DA_SEMANA, ENDERECO_DO_PORTAL } from '~/grade-horaria'
import type { GradeHoraria } from '~/grade-horaria'

definePageMeta({ semBarraDeAbas: true, foraDoPainelDesktop: true })

const passo = ref<'boas-vindas' | 'forma-de-colaborar' | 'grade-horaria'>('boas-vindas')
const forma = ref<FormaDeColaborar>('nenhuma')

const formas: { valor: FormaDeColaborar, titulo: string, descricao: string }[] = [
  {
    valor: 'localizacao-ligada',
    titulo: 'Com localização ligada',
    descricao: 'Lê a posição uma vez e propõe a rua mais próxima. O ponto do carro fica só no celular.',
  },
  {
    valor: 'manual',
    titulo: 'Manual',
    descricao: 'Você escolhe a rua numa lista, sem usar a localização.',
  },
  {
    valor: 'nenhuma',
    titulo: 'Nenhuma por enquanto',
    descricao: 'Só consultar a chance. Dá para ligar depois em Ajustes.',
  },
]

const cards: { icone: string, titulo: string, texto: string }[] = [
  {
    icone: 'i-lucide-user-x',
    titulo: 'Sem cadastro',
    texto: 'Sem conta, sem login e sem dados seus.',
  },
  {
    icone: 'i-lucide-info',
    titulo: 'Chance, não garantia',
    texto: 'Com que frequência a rua teve vaga nas noites anteriores.',
  },
  {
    icone: 'i-lucide-car',
    titulo: 'Avise quem está chegando',
    texto: 'Se quiser, registre a vaga com a saída prevista.',
  },
]

/**
 * Ação principal (design system, "Padrões de navegação"): fixa no rodapé no
 * celular; no desktop, logo abaixo do conteúdo, na mesma largura da coluna.
 */
const rodape = 'fixed inset-x-0 bottom-0 z-10 mx-auto grid max-w-160 gap-1 bg-default/70 backdrop-blur-xl lg:backdrop-blur-none px-5 pt-3 pb-[calc(--spacing(3)+env(safe-area-inset-bottom))] lg:static lg:w-full lg:max-w-md lg:bg-transparent lg:px-0 lg:pt-6 lg:pb-0'

const privacidade = ref<{ abrir: () => void }>()

// --- Grade horária (ADR 0035) -------------------------------------------------

const importador = ref<{ escolherPdf: () => void, editar: (grade: GradeHoraria | null) => void }>()
const grade = ref<GradeHoraria | null>(null)
const diasComAula = computed(() => DIAS_DA_SEMANA.filter(d => grade.value?.[d]).length)

function salvarGrade(nova: GradeHoraria) {
  dadosDoCelularDoAparelho().definirGradeHoraria(nova)
  grade.value = nova
}

function comecar() {
  const dados = dadosDoCelularDoAparelho()
  dados.definirFormaDeColaborar(forma.value)
  dados.concluirPrimeiraVisita()
  navigateTo('/', { replace: true })
}
</script>

<template>
  <div class="lg:grid lg:h-dvh lg:grid-cols-2 lg:overflow-hidden">
    <!--
      No desktop (lg), duas colunas na altura exata da tela, sem rolagem
      (referência Cosmos, cadastro na web): marca à esquerda, Primeira visita à
      direita. Coluna da esquerda: painel recortado (16 px de margem, raio de
      24 px, bg-muted; referências Lindy, Base44 e Buffer) com grade de pontos e
      brilho azul de fundo, o logotipo, a frase "Chance, não garantia" e as
      isolinhas da marca surgindo de baixo. O
      espaço entre o painel e o conteúdo faz a divisão entre as colunas.
    -->
    <aside class="hidden lg:block lg:h-dvh lg:p-4">
      <div class="relative h-full overflow-hidden rounded-paro-lg bg-muted">
        <!--
          Detalhes de fundo, por baixo de tudo: grade de pontos de 1 px a cada
          20 px, sumindo nas bordas (referência Luma), e um brilho difuso no azul
          do logotipo (#6EA8FF) saindo de baixo, atrás do miolo das isolinhas
          (referências Lovable e Suno).
        -->
        <div
          class="absolute inset-0 bg-[radial-gradient(color-mix(in_oklab,var(--ui-text)_18%,transparent)_1px,transparent_1px)] bg-size-[20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
          aria-hidden="true"
        />
        <div
          class="absolute -bottom-56 left-1/2 size-140 -translate-x-1/2 rounded-full bg-[#6EA8FF] opacity-30 blur-3xl dark:opacity-20"
          aria-hidden="true"
        />
        <LogoDoParo class="absolute top-8 left-8 z-1 h-12" />
        <p class="absolute inset-x-8 top-[30%] z-1 text-center text-3xl font-bold leading-tight tracking-tight text-highlighted">
          Chance, não garantia
        </p>
        <!--
          Isolinhas da marca, grandes, com o miolo azul na borda de baixo e metade
          para fora, como se surgissem de baixo para cima; somem em direção ao topo.
          Entra subindo 48 px em 700 ms; com movimento reduzido, já aparece parado.
        -->
        <div
          class="absolute inset-x-0 bottom-0 flex translate-y-1/2 justify-center opacity-80 [mask-image:linear-gradient(to_top,black_50%,transparent_100%)] motion-safe:animate-[surgir-de-baixo_700ms_cubic-bezier(0.16,1,0.3,1)]"
          aria-hidden="true"
        >
          <img
            src="/grafismos/detalhe-2-isolinhas-fundo-claro.svg"
            alt=""
            width="400"
            height="200"
            class="h-auto w-[180%] max-w-none shrink-0 dark:hidden"
          >
          <img
            src="/grafismos/detalhe-2-isolinhas-fundo-escuro.svg"
            alt=""
            width="400"
            height="200"
            class="hidden h-auto w-[180%] max-w-none shrink-0 dark:block"
          >
        </div>
      </div>
    </aside>

    <!--
      Raiz <div>, e não <main>: o servidor desenha a tela pedida (o Início, por
      exemplo) e o middleware leva para cá só no navegador, antes da hidratação.
      Com a mesma tag na raiz, o Vue aproveitaria o <main> do servidor sem trocar
      as classes (o lg:hidden do Início esconderia esta tela no desktop); com
      outra tag, ele troca o elemento.
    -->
    <!--
      No desktop, a coluna de 448 px fica no centro da metade direita, na
      vertical e na horizontal; o botão de tema e o de voltar vão para os cantos.
      Em telas baixas, em que o conteúdo não cabe, só esta coluna rola.
    -->
    <main class="mx-auto min-h-dvh w-full max-w-160 px-5 pt-12 pb-[calc(--spacing(32)+env(safe-area-inset-bottom))] lg:relative lg:flex lg:h-dvh lg:min-h-0 lg:max-w-none lg:flex-col lg:items-center lg:justify-center-safe lg:overflow-y-auto lg:px-16 lg:py-12">
      <template v-if="passo === 'boas-vindas'">
        <!-- Topo das boas-vindas: logotipo do Parô (36 px) à esquerda e botão de tema à direita. -->
        <!-- No desktop, o logotipo fica na coluna da esquerda: aqui sobra só o botão de tema. -->
        <div class="mb-8 flex items-center justify-between gap-3 lg:absolute lg:top-8 lg:right-8 lg:mb-0">
          <LogoDoParo class="h-9 lg:hidden" />
          <div class="flex items-center gap-1">
            <BotaoDoGithub />
            <BotaoDeTema />
          </div>
        </div>

        <section
          class="grid gap-6 motion-safe:animate-[slide-in-from-bottom-and-fade_300ms_cubic-bezier(0.16,1,0.3,1)] lg:w-full lg:max-w-md"
          aria-labelledby="titulo-boas-vindas"
        >
          <h1
            id="titulo-boas-vindas"
            class="text-2xl font-bold leading-tight tracking-tight"
          >
            Chance de vaga nas ruas cobertas
          </h1>
          <p class="-mt-4 max-w-[70ch] text-sm text-muted">
            Veja onde costuma ter vaga à noite antes de sair de casa.
          </p>

          <!-- No desktop, cards compactos: ícone ao lado do título e do texto. -->
          <ul class="grid gap-3">
            <UCard
              v-for="card in cards"
              :key="card.titulo"
              as="li"
              :ui="{ body: 'grid gap-1 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-x-3 lg:p-4' }"
            >
              <UIcon
                :name="card.icone"
                class="mb-1 size-5 lg:row-span-2 lg:mt-0.5 lg:mb-0"
                aria-hidden="true"
              />
              <h2 class="text-base font-semibold leading-tight">
                {{ card.titulo }}
              </h2>
              <p class="max-w-[70ch] text-xs text-muted">
                {{ card.texto }}
              </p>
            </UCard>
          </ul>
        </section>

        <!-- Rodapé: "Continuar" e, embaixo dele, o link do aviso de privacidade. -->
        <footer :class="rodape">
          <UButton
            color="neutral"
            size="xl"
            block
            label="Continuar"
            class="h-13 text-lg lg:h-11"
            @click="passo = 'forma-de-colaborar'"
          />
          <UButton
            color="primary"
            variant="link"
            label="Como o Parô trata os seus dados"
            aria-haspopup="dialog"
            class="min-h-11 justify-self-center px-0 text-sm"
            @click="privacidade?.abrir()"
          />
        </footer>
      </template>

      <template v-else-if="passo === 'forma-de-colaborar'">
        <UButton
          color="neutral"
          variant="outline"
          square
          icon="i-lucide-arrow-left"
          aria-label="Voltar"
          class="-mt-8 mb-4 size-10 justify-center lg:absolute lg:top-8 lg:left-8 lg:m-0 lg:size-9"
          :ui="{ leadingIcon: 'size-5' }"
          @click="passo = 'boas-vindas'"
        />

        <section
          class="grid gap-6 motion-safe:animate-[slide-in-from-bottom-and-fade_300ms_cubic-bezier(0.16,1,0.3,1)] lg:w-full lg:max-w-md"
          aria-labelledby="titulo-forma"
        >
          <h1
            id="titulo-forma"
            class="text-2xl font-bold leading-tight tracking-tight"
          >
            Como você quer colaborar?
          </h1>
          <p class="-mt-4 max-w-[70ch] text-sm text-muted">
            Ao estacionar, avise quando a vaga deve ficar livre. Tudo começa desligado.
          </p>

          <!--
            Card de escolha única (design system, "Formulários"): sem o círculo do
            rádio; o escolhido ganha borda mais grossa em border-inverted.
          -->
          <URadioGroup
            v-model="forma"
            :items="formas"
            value-key="valor"
            label-key="titulo"
            description-key="descricao"
            variant="card"
            indicator="hidden"
            color="neutral"
            aria-labelledby="titulo-forma"
            :ui="{
              fieldset: 'gap-3',
              item: 'cursor-pointer rounded-paro-lg bg-elevated p-4 has-data-[state=checked]:border-inverted has-data-[state=checked]:ring-[0.5px] has-data-[state=checked]:ring-inverted has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary',
              wrapper: 'items-start gap-1 text-start',
              label: 'text-base font-semibold leading-tight',
              description: 'max-w-[70ch] text-xs',
            }"
          />
        </section>

        <!-- Rodapé: "Começar" e, embaixo dele, o link do aviso de privacidade. -->
        <footer :class="rodape">
          <UButton
            color="neutral"
            size="xl"
            block
            label="Continuar"
            class="h-13 text-lg lg:h-11"
            @click="passo = 'grade-horaria'"
          />
          <UButton
            color="primary"
            variant="link"
            label="Como o Parô trata os seus dados"
            aria-haspopup="dialog"
            class="min-h-11 justify-self-center px-0 text-sm"
            @click="privacidade?.abrir()"
          />
        </footer>
      </template>

      <template v-else>
        <UButton
          color="neutral"
          variant="outline"
          square
          icon="i-lucide-arrow-left"
          aria-label="Voltar"
          class="-mt-8 mb-4 size-10 justify-center lg:absolute lg:top-8 lg:left-8 lg:m-0 lg:size-9"
          :ui="{ leadingIcon: 'size-5' }"
          @click="passo = 'forma-de-colaborar'"
        />

        <section
          class="grid gap-6 motion-safe:animate-[slide-in-from-bottom-and-fade_300ms_cubic-bezier(0.16,1,0.3,1)] lg:w-full lg:max-w-md"
          aria-labelledby="titulo-grade"
        >
          <h1
            id="titulo-grade"
            class="text-2xl font-bold leading-tight tracking-tight"
          >
            Estuda na ESAMC?
          </h1>
          <p class="-mt-4 max-w-[70ch] text-sm text-muted">
            Importe o horário de aulas e o Parô sugere a melhor chegada e a saída de cada dia. É opcional.
          </p>

          <UCard :ui="{ body: 'grid gap-3' }">
            <template v-if="grade">
              <p class="flex items-center gap-2 text-sm font-semibold">
                <UIcon
                  name="i-lucide-circle-check"
                  class="size-5 shrink-0 text-success"
                  aria-hidden="true"
                />
                Grade salva: {{ diasComAula === 1 ? '1 dia com aula' : `${diasComAula} dias com aula` }}
              </p>
              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-pencil"
                label="Conferir a grade"
                block
                aria-haspopup="dialog"
                class="min-h-11 text-sm"
                @click="importador?.editar(grade)"
              />
            </template>
            <template v-else>
              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-file-up"
                label="Importar horário de aulas (PDF)"
                block
                class="min-h-11 text-sm"
                @click="importador?.escolherPdf()"
              />
              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-pencil"
                label="Preencher à mão"
                block
                aria-haspopup="dialog"
                class="min-h-11 text-sm"
                @click="importador?.editar(null)"
              />
            </template>
            <p class="max-w-[70ch] text-xs text-muted">
              No seu navegador, abra o horário de aulas no
              <ULink
                :to="ENDERECO_DO_PORTAL"
                target="_blank"
                rel="noopener noreferrer"
                class="font-medium text-primary underline underline-offset-2"
              >
                portal da ESAMC<span class="sr-only"> (abre em nova aba)</span>
              </ULink>
              e use Imprimir › Salvar como PDF. O PDF não sai do celular.
            </p>
          </UCard>
        </section>

        <footer :class="rodape">
          <UButton
            color="neutral"
            size="xl"
            block
            :label="grade ? 'Começar' : 'Pular e começar'"
            class="h-13 text-lg lg:h-11"
            @click="comecar"
          />
        </footer>

        <ImportarGradeHoraria
          ref="importador"
          @salvar="salvarGrade"
        />
      </template>

      <Gaveta
        ref="privacidade"
        titulo="Como o Parô trata os seus dados"
      >
        <AvisoDePrivacidade />
      </Gaveta>
    </main>
  </div>
</template>
