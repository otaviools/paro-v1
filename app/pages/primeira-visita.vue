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
    valor: 'localização-ligada',
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

const privacidade = ref<{ abrir: () => void }>()

function comecar() {
  const dados = dadosDoCelularDoAparelho()
  dados.definirFormaDeColaborar(forma.value)
  dados.concluirPrimeiraVisita()
  navigateTo('/', { replace: true })
}
</script>

<template>
  <main class="primeira-visita">
    <template v-if="passo === 'boas-vindas'">
      <section
        class="conteudo"
        aria-labelledby="titulo-boas-vindas"
      >
        <h1
          id="titulo-boas-vindas"
          class="titulo"
        >
          Chance de vaga nas ruas cobertas
        </h1>
        <p class="explicacao">
          O Parô mostra em quais ruas cobertas e faixas horárias costuma haver vaga à noite, para você decidir
          antes de sair de casa.
        </p>

        <ul class="cards">
          <li class="card">
            <UIcon
              name="i-lucide-user-x"
              class="icone-card"
              aria-hidden="true"
            />
            <h2 class="nome-card">
              Sem cadastro
            </h2>
            <p class="texto-card">
              Sem conta e sem login. O Parô não pede nada que identifique você.
            </p>
          </li>
          <li class="card">
            <UIcon
              name="i-lucide-info"
              class="icone-card"
              aria-hidden="true"
            />
            <h2 class="nome-card">
              Chance, não garantia
            </h2>
            <p class="texto-card">
              A chance diz com que frequência a rua coberta não estava cheia em noites anteriores, sempre com a base.
            </p>
          </li>
          <li class="card">
            <UIcon
              name="i-lucide-car"
              class="icone-card"
              aria-hidden="true"
            />
            <h2 class="nome-card">
              Avise quem está chegando
            </h2>
            <p class="texto-card">
              Se quiser, registre a sua vaga com a saída prevista. É opcional.
            </p>
          </li>
        </ul>

        <button
          type="button"
          class="link"
          aria-haspopup="dialog"
          @click="privacidade?.abrir()"
        >
          Como o Parô trata os seus dados
        </button>
      </section>

      <footer class="rodape">
        <button
          type="button"
          class="principal"
          @click="passo = 'forma-de-colaborar'"
        >
          Continuar
        </button>
      </footer>
    </template>

    <template v-else>
      <button
        type="button"
        class="voltar"
        aria-label="Voltar"
        @click="passo = 'boas-vindas'"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="icone-voltar"
          aria-hidden="true"
        />
      </button>

      <section
        class="conteudo"
        aria-labelledby="titulo-forma"
      >
        <h1
          id="titulo-forma"
          class="titulo"
        >
          Como você quer colaborar?
        </h1>
        <p class="explicacao">
          Ao estacionar, você pode fazer um registro de vaga para avisar quem está chegando quando a sua vaga deve
          ficar livre. Tudo começa desligado, e você muda quando quiser em Ajustes.
        </p>

        <!-- Card de escolha única (design system, "Formulários"). -->
        <div
          class="escolhas"
          role="radiogroup"
          aria-labelledby="titulo-forma"
        >
          <button
            v-for="opcao in formas"
            :key="opcao.valor"
            type="button"
            role="radio"
            class="escolha"
            :class="{ escolhida: forma === opcao.valor }"
            :aria-checked="forma === opcao.valor"
            @click="forma = opcao.valor"
          >
            <span class="nome-card">{{ opcao.titulo }}</span>
            <span class="texto-card">{{ opcao.descricao }}</span>
          </button>
        </div>

        <p class="nota">
          A localização nunca é acompanhada e a posição exata nunca sai do celular.
          <button
            type="button"
            class="link link-na-linha"
            aria-haspopup="dialog"
            @click="privacidade?.abrir()"
          >
            Como o Parô trata os seus dados
          </button>
        </p>
      </section>

      <footer class="rodape">
        <button
          type="button"
          class="principal"
          @click="comecar"
        >
          Começar
        </button>
      </footer>
    </template>

    <Gaveta
      ref="privacidade"
      titulo="Como o Parô trata os seus dados"
    >
      <AvisoDePrivacidade />
    </Gaveta>
  </main>
</template>

<style scoped>
.primeira-visita {
  max-width: var(--paro-largura-conteudo);
  min-height: 100dvh;
  margin: 0 auto;
  padding: var(--paro-esp-12) var(--paro-margem) var(--paro-esp-8);
}

/* Botão de ícone (design system, "Botões"). */
.voltar {
  display: grid;
  place-items: center;
  width: calc(var(--paro-esp-8) + var(--paro-esp-2));
  height: calc(var(--paro-esp-8) + var(--paro-esp-2));
  margin-top: calc(var(--paro-esp-8) * -1);
  margin-bottom: var(--paro-esp-4);
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-botao);
  cursor: pointer;
}

@media (min-width: 1024px) {
  .voltar {
    width: calc(var(--paro-esp-8) + var(--paro-esp-1));
    height: calc(var(--paro-esp-8) + var(--paro-esp-1));
  }
}

.icone-voltar {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
}

.conteudo {
  display: grid;
  gap: var(--paro-esp-6);
}

@media (prefers-reduced-motion: no-preference) {
  .conteudo {
    animation: entrar 300ms cubic-bezier(0.16, 1, 0.3, 1);
  }
}

@keyframes entrar {
  from { opacity: 0; transform: translateY(var(--paro-esp-2)); }
  to { opacity: 1; transform: translateY(0); }
}

.titulo {
  font-size: var(--paro-texto-titulo);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.explicacao {
  max-width: 70ch;
  margin-top: calc(var(--paro-esp-4) * -1);
  font-size: var(--paro-texto-corpo);
  color: var(--paro-texto-fraco);
}

.cards,
.escolhas {
  display: grid;
  gap: var(--paro-esp-3);
}

@media (min-width: 1024px) {
  .cards,
  .escolhas { gap: var(--paro-esp-4); }
}

/* Cards (design system, "Cards"): superfície, borda de 1 px, raio de 16 px. */
.card,
.escolha {
  display: grid;
  gap: var(--paro-esp-1);
  padding: var(--paro-esp-4);
  text-align: left;
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-card);
}

@media (min-width: 1024px) {
  .card,
  .escolha { padding: var(--paro-esp-6); }
}

.escolha {
  cursor: pointer;
}

/* O escolhido com borda de 1,5 px em --paro-texto; o padding perde 0,5 px. */
.escolha.escolhida {
  padding: calc(var(--paro-esp-4) - 0.5px);
  border: 1.5px solid var(--paro-texto);
}

@media (min-width: 1024px) {
  .escolha.escolhida { padding: calc(var(--paro-esp-6) - 0.5px); }
}

.icone-card {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
  margin-bottom: var(--paro-esp-1);
}

.nome-card {
  font-size: var(--paro-texto-card);
  font-weight: 600;
  line-height: 1.2;
}

.texto-card {
  max-width: 70ch;
  font-size: var(--paro-texto-legenda);
  color: var(--paro-texto-fraco);
}

.nota {
  max-width: 70ch;
  font-size: var(--paro-texto-legenda);
  color: var(--paro-texto-fraco);
}

/* Botão link (design system, "Botões"). */
.link {
  justify-self: start;
  min-height: calc(var(--paro-esp-8) + var(--paro-esp-3));
  font-size: var(--paro-texto-interface);
  font-weight: 600;
  text-align: left;
  color: var(--paro-destaque-texto);
  cursor: pointer;
}

/* Na nota, o link vai para a linha de baixo, com o alvo de toque inteiro. */
.link-na-linha {
  display: block;
}

/* Ação principal fixa no rodapé (design system, "Padrões de navegação"). */
.rodape {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  max-width: var(--paro-largura-conteudo);
  margin: 0 auto;
  padding: var(--paro-esp-3) var(--paro-margem) calc(var(--paro-esp-3) + env(safe-area-inset-bottom));
  background: var(--paro-fundo);
}

/* Botão principal (design system, "Botões"). */
.principal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(var(--paro-esp-12) + var(--paro-esp-1));
  font-size: var(--paro-texto-botao);
  font-weight: 600;
  color: var(--paro-acao-texto);
  background: var(--paro-acao);
  border-radius: var(--paro-raio-botao);
  cursor: pointer;
}

.principal:hover,
.principal:active {
  background: var(--paro-acao-hover);
}

.principal:active {
  transform: scale(0.98);
}

@media (min-width: 1024px) {
  .principal { height: calc(var(--paro-esp-8) + var(--paro-esp-3)); }
}
</style>
