<!--
  Aviso "Dados de demonstração" (ADR 0012; design system, "Cards › Aviso"):
  UAlert com o sinal de alerta, fixo no topo do Início, do Mapa e do Detalhe
  da rua, sem botão de fechar.

  Interface: sem props, slots nem eventos. Classes de quem usa (margens) vão
  para a raiz.
-->
<template>
  <UAlert
    role="note"
    color="warning"
    variant="soft"
    icon="i-lucide-info"
    title="Dados de demonstração"
    description="A chance vem de observações fictícias, não de contagens nas ruas."
    :ui="{ title: 'text-sm', description: 'text-xs font-medium' }"
  />
</template>
