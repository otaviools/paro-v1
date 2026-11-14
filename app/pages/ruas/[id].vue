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

const { data: rua, error, refresh } = await useFetch<RuaAoLongoDaNoite>(() => `/api/ruas/${route.params.id}`)

/** As saídas previstas mudam ao longo da noite; o app consulta o servidor de novo (ADR 0018). */
const INTERVALO_DE_ATUALIZACAO = 90_000
let atualizacao: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  atualizacao = setInterval(() => refresh(), INTERVALO_DE_ATUALIZACAO)
})
onBeforeUnmount(() => clearInterval(atualizacao))

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

/** Volta para a tela anterior; aberto direto pelo link, vai para o Início. */
function voltar() {
  if (window.history.state?.back) router.back()
  else navigateTo('/')
}

// "Como chegar" avisa antes de abrir outro app (ADR 0020).
const aviso = ref<HTMLDialogElement>()
const link = ref<string>()

function comoChegar() {
  if (!rua.value) return
  link.value = linkDoComoChegar(rua.value.meioDoTrecho, navigator.userAgent)
  aviso.value?.showModal()
}

function fecharAviso() {
  aviso.value?.close()
}
</script>

<template>
  <main class="detalhe">
    <button
      type="button"
      class="voltar"
      aria-label="Voltar"
      @click="voltar"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="icone-voltar"
        aria-hidden="true"
      />
    </button>

    <p
      v-if="error?.statusCode === 404"
      class="mensagem"
    >
      Esta rua não é uma das ruas cobertas.
    </p>
    <p
      v-else-if="error"
      class="mensagem"
    >
      Não foi possível carregar a chance agora. Tente de novo em instantes.
    </p>

    <template v-else-if="rua">
      <AvisoDeDemonstracao
        v-if="rua.demonstracao"
        class="aviso"
      />

      <h1 class="nome">
        {{ rua.rua.nome }}
      </h1>
      <p class="distancia">
        <UIcon
          name="i-lucide-footprints"
          class="icone"
          aria-hidden="true"
        />
        {{ distanciaAPe(rua.distanciaAoDestino) }} até o destino
      </p>

      <GraficoDeChance
        v-model="faixaHorariaSelecionada"
        class="grafico"
        :faixas-horarias="rua.faixasHorarias"
        :melhor-faixa-horaria="rua.melhorFaixaHoraria"
      />

      <section
        v-if="selecionada"
        class="bloco"
        aria-labelledby="titulo-bloco"
        aria-live="polite"
      >
        <h2
          id="titulo-bloco"
          class="titulo-bloco"
        >
          <UIcon
            name="i-lucide-clock"
            class="icone"
            aria-hidden="true"
          />
          {{ intervaloDaFaixaHoraria(selecionada.faixaHoraria) }}
        </h2>

        <dl class="dados">
          <div class="dado">
            <dt>Faixa de chance</dt>
            <dd class="faixa-de-chance">
              <AmostraDeFaixaDeChance :estado="estadoDe(selecionada.estimativa)" />
              {{ estadoDe(selecionada.estimativa) }}
            </dd>
          </div>
          <div
            v-if="selecionada.estimativa.tipo === 'chance'"
            class="dado"
          >
            <dt>Chance</dt>
            <dd>{{ textoDaChanceComBase(selecionada.estimativa.chance, selecionada.estimativa.base) }}</dd>
          </div>
        </dl>

        <p
          v-if="selecionada.estimativa.tipo === 'sem-dado'"
          class="sem-dado"
        >
          Ainda não temos observações suficientes nesta faixa horária
        </p>
      </section>

      <!-- Bloco de dado à parte da chance: dado declarado, não observado (ADR 0009). -->
      <section
        class="bloco saidas"
        aria-labelledby="titulo-saidas"
      >
        <h2
          id="titulo-saidas"
          class="titulo-bloco"
        >
          <UIcon
            name="i-lucide-log-out"
            class="icone"
            aria-hidden="true"
          />
          Saídas previstas nesta noite
        </h2>

        <dl
          v-if="rua.saidasPrevistas.length"
          class="dados"
        >
          <div
            v-for="saida in rua.saidasPrevistas"
            :key="saida.faixaHoraria"
            class="dado"
          >
            <dt>{{ intervaloDaFaixaHoraria(saida.faixaHoraria) }}</dt>
            <dd>{{ textoDasSaidas(saida.quantidade) }}</dd>
          </div>
        </dl>
        <p
          v-else
          class="sem-saidas"
        >
          Ninguém registrou saída prevista nesta rua hoje.
        </p>

        <p class="nota">
          Informadas por quem estacionou aqui. Não entram na chance.
        </p>
      </section>
    </template>

    <footer
      v-if="rua"
      class="rodape"
    >
      <button
        type="button"
        class="principal"
        @click="comoChegar"
      >
        <UIcon
          name="i-lucide-navigation"
          class="icone-botao"
          aria-hidden="true"
        />
        Como chegar
      </button>
    </footer>

    <dialog
      ref="aviso"
      class="gaveta"
      aria-labelledby="titulo-aviso"
      @click.self="fecharAviso"
    >
      <div
        class="alca"
        aria-hidden="true"
      />
      <h2
        id="titulo-aviso"
        class="titulo-aviso"
      >
        Abrir outro app?
      </h2>
      <p class="texto-aviso">
        "Como chegar" abre o app de navegação do celular com a {{ rua?.rua.nome }} como destino.
        Esse app recebe a rua de destino e a sua posição.
      </p>
      <a
        :href="link"
        class="principal"
        @click="fecharAviso"
      >Abrir app de navegação</a>
      <button
        type="button"
        class="link"
        @click="fecharAviso"
      >
        Cancelar
      </button>
    </dialog>
  </main>
</template>

<style scoped>
.detalhe {
  max-width: var(--paro-largura-conteudo);
  margin: 0 auto;
  padding: var(--paro-esp-4) var(--paro-margem) var(--paro-esp-8);
}

/* Botão de ícone (design system, "Botões"). */
.voltar {
  display: grid;
  place-items: center;
  width: calc(var(--paro-esp-8) + var(--paro-esp-2));
  height: calc(var(--paro-esp-8) + var(--paro-esp-2));
  margin-bottom: var(--paro-esp-4);
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-botao);
  cursor: pointer;
}

/* No desktop, o painel da direita tem o próprio botão de fechar. */
@media (min-width: 1024px) {
  .voltar { display: none; }
}

.icone-voltar {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
}

.aviso {
  margin-bottom: var(--paro-esp-6);
}

.nome {
  font-size: var(--paro-texto-stat);
  font-weight: 700;
  line-height: 1.2;
}

.distancia {
  display: flex;
  align-items: center;
  gap: var(--paro-esp-2);
  margin-top: var(--paro-esp-1);
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto-fraco);
}

.icone {
  flex: none;
  width: var(--paro-esp-4);
  height: var(--paro-esp-4);
}

.grafico {
  margin-top: var(--paro-esp-6);
}

/* Card Bloco de dado: título com ícone e linhas separadas por --paro-borda. */
.bloco {
  margin-top: var(--paro-esp-3);
  padding: var(--paro-esp-4);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-card);
}

@media (min-width: 1024px) {
  .bloco { padding: var(--paro-esp-6); }
}

.titulo-bloco {
  display: flex;
  align-items: center;
  gap: var(--paro-esp-2);
  font-size: var(--paro-texto-card);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.dados {
  margin-top: var(--paro-esp-2);
}

.dado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--paro-esp-3);
  padding: var(--paro-esp-3) 0;
  font-size: var(--paro-texto-corpo);
  font-variant-numeric: tabular-nums;
}

.dado + .dado {
  border-top: 1px solid var(--paro-borda);
}

.dado dt {
  font-size: var(--paro-texto-legenda);
  color: var(--paro-texto-fraco);
}

.dado dd {
  font-weight: 600;
  text-align: right;
}

.faixa-de-chance {
  display: flex;
  align-items: center;
  gap: var(--paro-esp-2);
}

.sem-dado {
  padding-top: var(--paro-esp-3);
  font-size: var(--paro-texto-corpo);
  border-top: 1px solid var(--paro-borda);
}

.sem-saidas {
  padding: var(--paro-esp-3) 0;
  font-size: var(--paro-texto-corpo);
}

.nota {
  padding-top: var(--paro-esp-3);
  font-size: var(--paro-texto-nota);
  color: var(--paro-texto-fraco);
  border-top: 1px solid var(--paro-borda);
}

.mensagem {
  padding: var(--paro-esp-4);
  font-size: var(--paro-texto-corpo);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-linha);
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
  gap: var(--paro-esp-2);
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

.icone-botao {
  width: var(--paro-esp-5);
  height: var(--paro-esp-5);
}

/* Gaveta com o aviso de que "Como chegar" abre outro app (ADR 0020). */
.gaveta {
  width: 100%;
  max-width: var(--paro-largura-conteudo);
  margin: auto auto 0;
  padding: var(--paro-esp-3) var(--paro-margem) calc(var(--paro-esp-6) + env(safe-area-inset-bottom));
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-bottom: 0;
  border-radius: var(--paro-raio-card) var(--paro-raio-card) 0 0;
}

.gaveta[open] {
  display: grid;
  gap: var(--paro-esp-4);
}

.alca {
  justify-self: center;
  width: var(--paro-esp-8);
  height: var(--paro-esp-1);
  background: var(--paro-borda);
  border-radius: var(--paro-raio-pilula);
}

.titulo-aviso {
  font-size: var(--paro-texto-card);
  font-weight: 600;
}

.texto-aviso {
  font-size: var(--paro-texto-corpo);
}

/* Botão link (design system, "Botões"). */
.link {
  justify-self: center;
  min-height: calc(var(--paro-esp-8) + var(--paro-esp-3));
  padding: 0 var(--paro-esp-4);
  font-size: var(--paro-texto-interface);
  font-weight: 500;
  color: var(--paro-destaque-texto);
  cursor: pointer;
}

@media (prefers-reduced-motion: no-preference) {
  .gaveta[open] {
    animation: entrar 250ms cubic-bezier(0.16, 1, 0.3, 1);
  }
}

@keyframes entrar {
  from { opacity: 0; transform: translateY(var(--paro-esp-2)); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
