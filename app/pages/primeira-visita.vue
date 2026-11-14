<!--
  Primeira visita (design system, "Fluxos"; referências Tinder e Waymo): duas
  telas cheias, sem barra de abas. A primeira apresenta o Parô; a segunda
  pede a forma de colaborar em cards de escolha única, com "Nenhuma por
  enquanto" já escolhida: tudo começa desligado e não existe localização
  contínua (ADR 0010). O aviso de privacidade abre numa gaveta a partir de um
  link. A escolha e o fim da Primeira visita ficam nos Dados do celular, e a
  Primeira visita não aparece de novo.
-->
<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import type { FormaDeColaborar } from '~/dados-do-celular'

definePageMeta({ semBarraDeAbas: true, foraDoPainelDesktop: true })

const passo = ref<'boas-vindas' | 'forma-de-colaborar'>('boas-vindas')
const forma = ref<FormaDeColaborar>('nenhuma')

const formas: { valor: FormaDeColaborar, titulo: string, descricao: string }[] = [
  {
    valor: 'localizacao-ligada',
    titulo: 'Com localização ligada',
    descricao: 'Ao registrar a vaga, o celular lê a sua posição uma vez e propõe a rua coberta mais próxima. '
      + 'O ponto do carro fica só neste celular, para Voltar até o carro.',
  },
  {
    valor: 'manual',
    titulo: 'Manual',
    descricao: 'Você escolhe a rua coberta numa lista. A localização não é usada, e Voltar até o carro não fica disponível.',
  },
  {
    valor: 'nenhuma',
    titulo: 'Nenhuma por enquanto',
    descricao: 'Só consultar a chance. O registro de vaga fica desligado até você mudar em Ajustes.',
  },
]

const cards: { icone: string, titulo: string, texto: string }[] = [
  {
    icone: 'i-lucide-user-x',
    titulo: 'Sem cadastro',
    texto: 'Sem conta e sem login. O Parô não pede nada que identifique você.',
  },
  {
    icone: 'i-lucide-info',
    titulo: 'Chance, não garantia',
    texto: 'A chance diz com que frequência a rua coberta não estava cheia em noites anteriores, sempre com a base.',
  },
  {
    icone: 'i-lucide-car',
    titulo: 'Avise quem está chegando',
    texto: 'Se quiser, registre a sua vaga com a saída prevista. É opcional.',
  },
]

/** Ação principal fixa no rodapé (design system, "Padrões de navegação"). */
const rodape = 'fixed inset-x-0 bottom-0 z-10 mx-auto max-w-160 bg-default px-5 pt-3 pb-[calc(--spacing(3)+env(safe-area-inset-bottom))] lg:px-8'

const privacidade = ref<{ abrir: () => void }>()

function comecar() {
  const dados = dadosDoCelularDoAparelho()
  dados.definirFormaDeColaborar(forma.value)
  dados.concluirPrimeiraVisita()
  navigateTo('/', { replace: true })
}
</script>

<template>
  <div>
    <!--
      Raiz <div>, e não <main>: o servidor desenha a tela pedida (o Início, por
      exemplo) e o middleware leva para cá só no navegador, antes da hidratação.
      Com a mesma tag na raiz, o Vue aproveitaria o <main> do servidor sem trocar
      as classes (o lg:hidden do Início esconderia esta tela no desktop); com
      outra tag, ele troca o elemento.
    -->
    <main class="mx-auto min-h-dvh max-w-160 px-5 pt-12 pb-8 lg:px-8">
      <template v-if="passo === 'boas-vindas'">
        <section
          class="grid gap-6 motion-safe:animate-[slide-in-from-bottom-and-fade_300ms_cubic-bezier(0.16,1,0.3,1)]"
          aria-labelledby="titulo-boas-vindas"
        >
          <h1
            id="titulo-boas-vindas"
            class="text-2xl font-bold leading-tight tracking-tight"
          >
            Chance de vaga nas ruas cobertas
          </h1>
          <p class="-mt-4 max-w-[70ch] text-sm text-muted">
            O Parô mostra em quais ruas cobertas e faixas horárias costuma haver vaga à noite, para você decidir
            antes de sair de casa.
          </p>

          <ul class="grid gap-3 lg:gap-4">
            <UCard
              v-for="card in cards"
              :key="card.titulo"
              as="li"
              :ui="{ body: 'grid gap-1' }"
            >
              <UIcon
                :name="card.icone"
                class="mb-1 size-5"
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

          <UButton
            color="primary"
            variant="link"
            label="Como o Parô trata os seus dados"
            aria-haspopup="dialog"
            class="min-h-11 justify-self-start px-0 text-sm"
            @click="privacidade?.abrir()"
          />
        </section>

        <footer :class="rodape">
          <UButton
            color="neutral"
            size="xl"
            block
            label="Continuar"
            class="h-13 text-lg lg:h-11"
            @click="passo = 'forma-de-colaborar'"
          />
        </footer>
      </template>

      <template v-else>
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-arrow-left"
          aria-label="Voltar"
          class="-mt-8 mb-4 size-10 justify-center lg:size-9"
          :ui="{ leadingIcon: 'size-5' }"
          @click="passo = 'boas-vindas'"
        />

        <section
          class="grid gap-6 motion-safe:animate-[slide-in-from-bottom-and-fade_300ms_cubic-bezier(0.16,1,0.3,1)]"
          aria-labelledby="titulo-forma"
        >
          <h1
            id="titulo-forma"
            class="text-2xl font-bold leading-tight tracking-tight"
          >
            Como você quer colaborar?
          </h1>
          <p class="-mt-4 max-w-[70ch] text-sm text-muted">
            Ao estacionar, você pode fazer um registro de vaga para avisar quem está chegando quando a sua vaga deve
            ficar livre. Tudo começa desligado, e você muda quando quiser em Ajustes.
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
              fieldset: 'gap-3 lg:gap-4',
              item: 'cursor-pointer rounded-paro-lg bg-elevated p-4 lg:p-6 has-data-[state=checked]:border-inverted has-data-[state=checked]:ring-[0.5px] has-data-[state=checked]:ring-inverted has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary',
              wrapper: 'items-start gap-1 text-start',
              label: 'text-base font-semibold leading-tight',
              description: 'max-w-[70ch] text-xs',
            }"
          />

          <p class="max-w-[70ch] text-xs text-muted">
            A localização nunca é acompanhada e a posição exata nunca sai do celular.
            <!-- O link vai para a linha de baixo, com o alvo de toque inteiro. -->
            <UButton
              color="primary"
              variant="link"
              label="Como o Parô trata os seus dados"
              aria-haspopup="dialog"
              class="flex min-h-11 px-0 text-sm"
              @click="privacidade?.abrir()"
            />
          </p>
        </section>

        <footer :class="rodape">
          <UButton
            color="neutral"
            size="xl"
            block
            label="Começar"
            class="h-13 text-lg lg:h-11"
            @click="comecar"
          />
        </footer>
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
