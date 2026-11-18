<!--
  Aviso "Dados de demonstração" (ADR 0012; design system, "Cards › Aviso"):
  um botão redondo com o ícone de laboratório no sinal de alerta (warning),
  ao lado do logotipo no Início e no topo do Detalhe da rua. Tocar abre um balão com o título e a explicação. O nome acessível já
  diz "Dados de demonstração", então o aviso é lido mesmo sem abrir.

  Interface: sem props, slots nem eventos. Classes de quem usa vão para o botão.
-->
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <UPopover
    mode="click"
    :content="{ side: 'bottom', align: 'start', sideOffset: 8 }"
  >
    <UButton
      v-bind="$attrs"
      color="warning"
      variant="soft"
      icon="i-lucide-flask-conical"
      aria-label="Dados de demonstração: a chance vem de observações fictícias"
      class="size-9 justify-center"
      :ui="{ leadingIcon: 'size-4.5' }"
    />

    <template #content>
      <div
        role="note"
        class="grid max-w-64 gap-1 p-3"
      >
        <p class="text-sm font-semibold text-warning">
          Dados de demonstração
        </p>
        <p class="text-xs font-medium text-muted">
          A chance vem de observações fictícias, não de contagens nas ruas.
        </p>
      </div>
    </template>
  </UPopover>
</template>
