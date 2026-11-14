<!--
  Lista das ruas cobertas por chance numa faixa horária (Início e Mapa):
  linha de rua coberta com amostra do padrão, nome, rótulo e base, e a
  distância a pé à direita (design system, "Cards"). Cada linha abre o
  Detalhe da rua. Mostra também o esqueleto, o erro e "fora da área coberta".
-->
<script setup lang="ts">
defineProps<{
  /** Panorama da noite; null ou undefined enquanto carrega. */
  panorama: Panorama | null | undefined
  carregando: boolean
  erro: boolean
}>()

/** Base, ou o texto obrigatório de Sem dado (design system). */
function subtitulo(estimativa: Estimativa) {
  if (estimativa.tipo !== 'chance') return 'Ainda não temos observações suficientes nesta faixa horária'
  return textoDaBase(estimativa.base)
}
</script>

<template>
  <ul
    v-if="carregando"
    class="lista"
    aria-busy="true"
    aria-label="Carregando ruas cobertas"
  >
    <li
      v-for="n in 5"
      :key="n"
      class="linha esqueleto"
    />
  </ul>

  <p
    v-else-if="erro"
    class="mensagem"
  >
    Não foi possível carregar a chance agora. Tente de novo em instantes.
  </p>

  <p
    v-else-if="panorama && panorama.faixaHoraria === null"
    class="mensagem"
  >
    Agora está fora da área coberta, que vai das 17h às 23h. Escolha 19h, 21h ou 22h para ver a chance.
  </p>

  <ul
    v-else
    class="lista"
  >
    <li
      v-for="{ rua, estimativa, distanciaAoDestino } in panorama?.ruas"
      :key="rua.id"
    >
      <NuxtLink
        class="linha"
        :to="{ path: `/ruas/${rua.id}`, query: { faixaHoraria: panorama?.faixaHoraria } }"
      >
        <AmostraDeFaixaDeChance :estado="estadoDaEstimativa(estimativa)" />
        <div class="texto">
          <span class="nome">{{ rua.nome }}</span>
          <span class="subtitulo">
            <strong class="rotulo">{{ estadoDaEstimativa(estimativa) }}</strong> · {{ subtitulo(estimativa) }}
          </span>
        </div>
        <span class="distancia">{{ distanciaAPe(distanciaAoDestino) }}</span>
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped>
.lista {
  display: grid;
  gap: var(--paro-esp-3);
  container-type: inline-size;
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

/* Lista estreita (barra lateral do desktop): a distância desce para baixo do nome. */
@container (max-width: 320px) {
  .linha {
    flex-wrap: wrap;
  }

  .texto {
    flex-basis: calc(100% - var(--paro-esp-6));
  }

  .distancia {
    margin-left: var(--paro-esp-6);
  }
}

.mensagem {
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
