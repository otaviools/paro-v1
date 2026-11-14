<!--
  Conteúdo do Início no celular: logotipo, aviso de demonstração, bloco do registro de
  vaga, Panorama da noite por faixa horária e a pergunta "A previsão ajudou
  hoje?". No desktop, as abas, a melhor chance, a lista e a pergunta ficam na
  barra lateral do PainelDesktop.
-->
<script setup lang="ts">
const { abas, faixaHoraria, panorama, error, carregando } = usePanoramaDaNoite()
</script>

<template>
  <!-- Antes de o app montar, o CSS já esconde o Início do celular no desktop (lg:hidden). -->
  <main class="mx-auto max-w-160 px-5 py-8 lg:hidden">
    <!-- Topo: logotipo do Parô (36 px) à esquerda e botão de tema à direita. -->
    <div class="mb-6 flex items-center justify-between gap-3">
      <LogoDoParo class="h-9" />
      <BotaoDeTema />
    </div>

    <AvisoDeDemonstracao
      v-if="panorama?.demonstracao"
      class="mb-6"
    />

    <h1 class="text-2xl font-bold leading-tight tracking-tight">
      Início
    </h1>

    <BlocoDoRegistroDeVaga class="mt-6" />

    <PanoramaDaFaixaHoraria
      v-model:faixa-horaria="faixaHoraria"
      :abas="abas"
      :panorama="panorama"
      :carregando="carregando"
      :erro="Boolean(error)"
    />

    <PerguntaAjudou class="mt-8" />
  </main>
</template>
