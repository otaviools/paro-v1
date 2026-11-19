<!--
  Conteúdo do Início no celular: logotipo, aviso de demonstração, saudação com
  apelido engraçado ("Boa noite, Ímã de Vaga"), bloco do registro de
  vaga, Panorama da noite por faixa horária e a pergunta "A previsão ajudou
  hoje?". No desktop, as abas, a melhor chance, a lista e a pergunta ficam na
  barra lateral do PainelDesktop.
-->
<script setup lang="ts">
const { abas, faixaHoraria, panorama, error, carregando } = usePanoramaDaNoite()

/*
 * Título: saudação do horário com um apelido engraçado ("Boa noite, Ímã de
 * Vaga"). Os dois só existem no navegador (o relógio é o do aparelho e o
 * sorteio daria outro nome no servidor); até lá, o título é "Início", que a
 * tela de abertura cobre. O apelido fica o mesmo ao trocar de tela e muda ao
 * abrir o app de novo.
 */
const nomeEngracado = useState<string | null>('nome-engracado', () => null)
const saudacao = ref<string | null>(null)

onMounted(() => {
  saudacao.value = saudacaoDoHorario(new Date().getHours())
  nomeEngracado.value ??= sortearNomeEngracado()
})

const titulo = computed(() =>
  saudacao.value && nomeEngracado.value ? `${saudacao.value}, ${nomeEngracado.value}` : 'Início',
)
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

    <h1 class="text-2xl font-bold leading-tight tracking-tight text-balance">
      {{ titulo }}
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
