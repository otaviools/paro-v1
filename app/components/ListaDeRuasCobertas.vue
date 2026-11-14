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
    <!-- Esqueleto no formato da linha de rua coberta, com brilho (referências Google e Finimize). -->
    <li
      v-for="n in 5"
      :key="n"
      class="flex min-h-14 items-center gap-3 vidro rounded-paro-md px-4 py-3"
    >
      <USkeleton class="brilho size-3 rounded-paro-sm bg-muted" />
      <span class="grid flex-1 gap-2">
        <USkeleton class="brilho h-3.5 w-2/5 bg-muted" />
        <USkeleton class="brilho h-3 w-3/5 bg-muted" />
      </span>
      <USkeleton class="brilho h-6 w-16 rounded-full bg-muted" />
    </li>
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
    description="Agora está fora da área coberta, que vai das 17h às 23h."
    :ui="{ title: 'text-sm', description: 'text-sm' }"
  />

  <!-- Ao chegar, a lista aparece com esmaecer de 150 ms; com movimento reduzido, na hora. -->
  <ul
    v-else
    class="grid gap-3 transition-opacity duration-150 ease-out starting:opacity-0 motion-reduce:transition-none"
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
