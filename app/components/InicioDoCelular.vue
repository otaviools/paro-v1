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
    <!--
      Topo: logotipo do Parô (36 px) com o aviso de demonstração (ícone de
      laboratório) ao lado, à esquerda, e os botões do GitHub e de tema à direita.
    -->
    <div class="mb-6 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <LogoDoParo class="h-9" />
        <AvisoDeDemonstracao v-if="panorama?.demonstracao" />
      </div>
      <div class="flex items-center gap-1">
        <BotaoDoGithub />
        <BotaoDeTema />
      </div>
    </div>

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
