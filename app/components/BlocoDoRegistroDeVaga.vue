<!--
  Bloco do registro de vaga no Início (design system, "Fluxos": Voltar ao carro;
  referência Rivian): com um registro de vaga aberto nesta noite, mostra a
  saída prevista e a rua coberta, com a entrada para "Voltar até o carro" no
  registro com localização ligada. Sem registro aberto, não aparece. Lê só os
  Dados do celular; nada sai do aparelho.
-->
<script setup lang="ts">
import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import type { RegistroNoCelular } from '~/dados-do-celular'

/** Noite de agora; lida no navegador, para saber se o registro ainda vale (ADR 0014). */
const { data: agora } = useFetch('/api/agora', { key: 'agora-inicio', server: false })

const registro = ref<RegistroNoCelular | null>(null)
/** Só o registro com localização ligada tem ponto do carro (ADR 0003). */
const temPontoDoCarro = ref(false)

watch(agora, (valor) => {
  if (!valor) return
  const dados = dadosDoCelularDoAparelho()
  registro.value = dados.registroAtual(valor.noite)
  temPontoDoCarro.value = dados.pontoDoCarro(valor.noite) !== null
}, { immediate: true })
</script>

<template>
  <!-- Card Seu registro de vaga (design system, "Cards"; referência Waymo). -->
  <section v-if="registro" class="card" aria-labelledby="titulo-registro-de-vaga">
    <p class="etiqueta">Seu registro de vaga</p>
    <h2 id="titulo-registro-de-vaga" class="saida">Saída prevista: {{ rotuloDaFaixaHoraria(registro.saídaPrevista) }}</h2>
    <p class="rua">{{ registro.ruaCoberta.nome }}</p>

    <div class="acoes">
      <NuxtLink v-if="temPontoDoCarro" to="/minha-vaga/carro" class="secundario">
        <UIcon name="i-lucide-map-pin" class="icone" aria-hidden="true" />
        Voltar até o carro
      </NuxtLink>
      <NuxtLink to="/minha-vaga" class="secundario">
        <UIcon name="i-lucide-car" class="icone" aria-hidden="true" />
        Ver minha vaga
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.card {
  display: grid;
  gap: var(--paro-esp-1);
  padding: var(--paro-esp-4);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-card);
}

@media (min-width: 1024px) {
  .card { padding: var(--paro-esp-6); }
}

.etiqueta {
  font-size: var(--paro-texto-etiqueta);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--paro-texto-fraco);
}

.saida {
  margin-top: var(--paro-esp-1);
  font-size: var(--paro-texto-stat);
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.rua {
  font-size: var(--paro-texto-corpo);
  font-weight: 600;
}

/* Linha de ações com ícone e rótulo, separada por --paro-borda. */
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--paro-esp-2);
  margin-top: var(--paro-esp-3);
  padding-top: var(--paro-esp-3);
  border-top: 1px solid var(--paro-borda);
}

/* Botão secundário (design system, "Botões"). */
.secundario {
  display: flex;
  align-items: center;
  gap: var(--paro-esp-2);
  min-height: calc(var(--paro-esp-8) + var(--paro-esp-3));
  padding: 0 var(--paro-esp-4);
  font-size: var(--paro-texto-interface);
  font-weight: 500;
  color: var(--paro-texto);
  background: var(--paro-superficie);
  border: 1px solid var(--paro-borda);
  border-radius: var(--paro-raio-botao);
  cursor: pointer;
}

.secundario:active {
  transform: scale(0.98);
}

.icone {
  flex: none;
  width: var(--paro-esp-4);
  height: var(--paro-esp-4);
}
</style>
