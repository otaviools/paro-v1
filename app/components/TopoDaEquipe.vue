<!--
  Topo da Área da equipe: botão de voltar e as abas Observações e Métricas,
  no controle segmentado de vidro das abas de faixa horária. As duas telas
  usam a mesma chave da equipe (useChaveDaEquipe), então trocar de aba não
  pede a chave de novo. Trocar de aba substitui a página no histórico, para
  "voltar" sair da Área da equipe.
-->
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const ABAS = [
  { valor: 'observacoes', rotulo: 'Observações' },
  { valor: 'metricas', rotulo: 'Métricas' },
]

const aba = computed({
  get: () => (route.path.endsWith('/metricas') ? 'metricas' : 'observacoes'),
  set: (valor: string | null) => {
    if (valor) navigateTo(`/equipe/${valor}`, { replace: true })
  },
})

/** Volta para a tela anterior; aberta direto pelo link, vai para Ajustes. */
function voltar() {
  if (window.history.state?.back) router.back()
  else navigateTo('/ajustes')
}
</script>

<template>
  <div class="mb-6 flex items-center gap-3">
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-arrow-left"
      aria-label="Voltar"
      class="size-10 shrink-0 justify-center"
      @click="voltar"
    />
    <AbasDeFaixaHoraria
      v-model="aba"
      :abas="ABAS"
      rotulo="Área da equipe"
      class="max-w-sm"
    />
  </div>
</template>
