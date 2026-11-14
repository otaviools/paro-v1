<!--
  Conteúdo do Início no celular: aviso de demonstração, bloco do registro de
  vaga, Panorama da noite por faixa horária e a pergunta "A previsão ajudou
  hoje?". No desktop, as abas, a melhor chance, a lista e a pergunta ficam na
  barra lateral do PainelDesktop.
-->
<script setup lang="ts">
const { abas, faixaHoraria, panorama, error, carregando } = usePanoramaDaNoite()
</script>

<template>
  <main class="inicio">
    <AvisoDeDemonstracao
      v-if="panorama?.demonstracao"
      class="aviso"
    />

    <h1 class="titulo">
      Início
    </h1>

    <BlocoDoRegistroDeVaga class="registro-de-vaga" />

    <PanoramaDaFaixaHoraria
      v-model:faixa-horaria="faixaHoraria"
      :abas="abas"
      :panorama="panorama"
      :carregando="carregando"
      :erro="Boolean(error)"
    />

    <PerguntaAjudou class="ajudou" />
  </main>
</template>

<style scoped>
.inicio {
  max-width: var(--paro-largura-conteudo);
  margin: 0 auto;
  padding: var(--paro-esp-8) var(--paro-margem);
}

/* Antes de o app montar, o CSS já esconde o Início do celular no desktop. */
@media (min-width: 1024px) {
  .inicio { display: none; }
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

.registro-de-vaga {
  margin-top: var(--paro-esp-6);
}

.ajudou {
  margin-top: var(--paro-esp-8);
}
</style>
