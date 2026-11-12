<script setup lang="ts">
import type { EstadoDaChance } from '~/components/AmostraDeFaixaDeChance.vue'
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'

/** Faixas horárias fixas das abas do Início, além de Agora. */
const HORARIOS_DAS_ABAS = ['19:00', '21:00', '22:00']

/** Rotina do celular; lida só no navegador, depois de montar. */
const rotina = ref<string | null>(null)

/** Agora, 19h, 21h e 22h; a rotina ganha a sua aba quando não é uma delas. */
const abas = computed(() => {
  const horarios = rotina.value && !HORARIOS_DAS_ABAS.includes(rotina.value)
    ? [...HORARIOS_DAS_ABAS, rotina.value].sort()
    : HORARIOS_DAS_ABAS
  return [
    { valor: 'agora', rotulo: 'Agora' },
    ...horarios.map((h) => ({ valor: h, rotulo: rotuloDaFaixaHoraria(h) })),
  ]
})

/** Null até ler a rotina; depois, a faixa horária da aba escolhida. */
const faixaHoraria = ref<string | null>(null)

// A faixa horária inicial depende da rotina, que só existe no celular: a
// busca roda no navegador, depois de ler a rotina.
const { data: panorama, status, error, execute } = useFetch('/api/panorama', {
  query: { faixaHoraria },
  server: false,
  immediate: false,
})

onMounted(() => {
  rotina.value = dadosDoCelularDoAparelho().rotina()
  faixaHoraria.value = rotina.value ?? 'agora'
  execute()
})

const carregando = computed(() => status.value === 'idle' || status.value === 'pending')

type Estimativa = NonNullable<typeof panorama.value>['ruas'][number]['estimativa']

function estadoDe(estimativa: Estimativa): EstadoDaChance {
  return estimativa.tipo === 'chance' ? estimativa.faixaDeChance : 'Sem dado'
}

/** Base, ou o texto obrigatório de Sem dado (design system). */
function subtitulo(estimativa: Estimativa) {
  if (estimativa.tipo !== 'chance') return 'Ainda não temos observações suficientes nesta faixa horária'
  return textoDaBase(estimativa.base)
}
</script>

<template>
  <main class="inicio">
    <AvisoDeDemonstracao v-if="panorama?.demonstração" class="aviso" />

    <h1 class="titulo">Início</h1>

    <div class="abas" role="tablist" aria-label="Faixa horária">
      <ChipDeFaixaHoraria
        v-for="aba in abas"
        :key="aba.valor"
        role="tab"
        :aria-selected="faixaHoraria === aba.valor"
        :ativo="faixaHoraria === aba.valor"
        aria-controls="ruas-cobertas"
        @click="faixaHoraria = aba.valor"
      >
        {{ aba.rotulo }}
      </ChipDeFaixaHoraria>
    </div>

    <div v-if="carregando" class="card-esqueleto" aria-hidden="true" />
    <CardDeMelhorChance
      v-else-if="panorama?.faixaHorária"
      class="melhor-chance"
      :faixa-horaria="panorama.faixaHorária"
      :melhor-chance="panorama.melhorChance"
    />

    <section id="ruas-cobertas" role="tabpanel" aria-labelledby="titulo-ruas">
      <h2 id="titulo-ruas" class="etiqueta">
        Ruas cobertas<template v-if="!carregando && panorama?.faixaHorária"> · {{ rotuloDaFaixaHoraria(panorama.faixaHorária) }}</template>
      </h2>

      <ul v-if="carregando" class="lista" aria-busy="true" aria-label="Carregando ruas cobertas">
        <li v-for="n in 5" :key="n" class="linha esqueleto" />
      </ul>

      <p v-else-if="error" class="mensagem">
        Não foi possível carregar a chance agora. Tente de novo em instantes.
      </p>

      <p v-else-if="panorama && panorama.faixaHorária === null" class="mensagem">
        Agora está fora da área coberta, que vai das 17h às 23h. Escolha 19h, 21h ou 22h para ver a chance.
      </p>

      <ul v-else class="lista">
        <li v-for="{ rua, estimativa, distânciaAoDestino } in panorama?.ruas" :key="rua.id" class="linha">
          <AmostraDeFaixaDeChance :estado="estadoDe(estimativa)" />
          <div class="texto">
            <span class="nome">{{ rua.nome }}</span>
            <span class="subtitulo">
              <strong class="rotulo">{{ estadoDe(estimativa) }}</strong> · {{ subtitulo(estimativa) }}
            </span>
          </div>
          <span class="distancia">{{ distanciaAPe(distânciaAoDestino) }}</span>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.inicio {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--paro-esp-8) var(--paro-margem);
}

.aviso {
  margin-bottom: var(--paro-esp-6);
}

.titulo {
  font-size: var(--paro-texto-titulo);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.abas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--paro-esp-2);
  margin-top: var(--paro-esp-6);
}

.melhor-chance,
.card-esqueleto {
  margin-top: var(--paro-esp-6);
}

/* Esqueleto no formato do card de melhor chance. */
.card-esqueleto {
  height: calc(var(--paro-esp-16) * 2 + var(--paro-esp-4));
  background: var(--paro-superficie-suave);
  border-radius: var(--paro-raio-card);
}

.etiqueta {
  margin-top: var(--paro-esp-8);
  font-size: var(--paro-texto-etiqueta);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto-fraco);
}

.lista {
  display: grid;
  gap: var(--paro-esp-3);
  margin-top: var(--paro-esp-3);
}

.linha {
  display: flex;
  align-items: center;
  gap: var(--paro-esp-3);
  min-height: 56px;
  padding: var(--paro-esp-3) var(--paro-esp-4);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-linha);
}

.texto {
  display: grid;
  flex: 1;
  min-width: 0;
}

.nome {
  font-size: var(--paro-texto-corpo);
  font-weight: 600;
}

.subtitulo {
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto-fraco);
}

.rotulo {
  font-weight: 600;
  color: var(--paro-texto);
}

.distancia {
  flex: none;
  padding: var(--paro-esp-1) var(--paro-esp-3);
  font-size: var(--paro-texto-legenda);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--paro-texto-fraco);
  background: var(--paro-superficie-suave);
  border-radius: var(--paro-raio-pilula);
}

.mensagem {
  margin-top: var(--paro-esp-3);
  padding: var(--paro-esp-4);
  font-size: var(--paro-texto-corpo);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-linha);
}

.esqueleto {
  background: var(--paro-superficie-suave);
  border-color: transparent;
}
</style>
