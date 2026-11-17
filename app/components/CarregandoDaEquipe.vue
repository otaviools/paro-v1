<!--
  Carregamento da Área da equipe: o círculo girando dentro de uma pílula de
  vidro, com "Carregando…" ao lado. Aparece enquanto a tela confere a chave
  guardada na aba e a cada requisição das Métricas. Com movimento reduzido,
  o círculo não gira.
-->
<template>
  <div
    class="flex justify-center"
    role="status"
  >
    <span class="vidro flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
      <UIcon
        name="i-lucide-loader-circle"
        class="size-5 animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
      Carregando…
    </span>
  </div>
</template>
