<!--
  Lista das ruas cobertas por chance numa faixa horária (Início e Mapa): uma
  LinhaDeRuaCoberta por rua, que abre o Detalhe da rua. Mostra também o
  esqueleto e, com UAlert, o erro e "fora da área coberta".

  Interface:
  - `panorama`: Panorama da noite; null ou undefined enquanto carrega.
  - `carregando`: mostra o esqueleto.
  - `erro`: mostra o aviso de erro.
  Sem slots nem eventos.
-->
<script setup lang="ts">
defineProps<{
  panorama: Panorama | null | undefined
  carregando: boolean
  erro: boolean
}>()
</script>

<template>
  <ul
    v-if="carregando"
    class="grid gap-3"
    aria-busy="true"
    aria-label="Carregando ruas cobertas"
  >
    <li
      v-for="n in 5"
      :key="n"
      class="min-h-14 rounded-paro-md bg-muted"
    />
  </ul>

  <UAlert
    v-else-if="erro"
    color="error"
    variant="soft"
    icon="i-lucide-circle-alert"
    title="Erro ao carregar"
    description="Não foi possível carregar a chance agora. Tente de novo em instantes."
    :ui="{ title: 'text-sm', description: 'text-sm' }"
  />

  <UAlert
    v-else-if="panorama && panorama.faixaHoraria === null"
    color="warning"
    variant="soft"
    icon="i-lucide-clock"
    title="Fora do horário de cobertura"
    description="Agora está fora da área coberta, que vai das 17h às 23h. Escolha 19h, 21h ou 22h para ver a chance."
    :ui="{ title: 'text-sm', description: 'text-sm' }"
  />

  <ul
    v-else
    class="grid gap-3"
  >
    <li
      v-for="{ rua, estimativa, distanciaAoDestino } in panorama?.ruas"
      :key="rua.id"
    >
      <LinhaDeRuaCoberta
        :rua="rua"
        :estimativa="estimativa"
        :distancia-ao-destino="distanciaAoDestino"
        :faixa-horaria="panorama?.faixaHoraria"
      />
    </li>
  </ul>
</template>
