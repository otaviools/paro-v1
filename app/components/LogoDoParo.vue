<!--
  Logotipo do Parô a partir dos arquivos originais em public/logo/ (design
  system, "Logotipo"), sem recolorir: a versão de fundo claro no tema claro e
  a de fundo escuro no escuro. O texto alternativo é o nome. A altura vem de
  quem usa, pela classe (por exemplo, h-9); a largura acompanha a proporção.
-->
<template>
  <span class="inline-flex">
    <img
      src="/logo/logo-paro-fundo-claro.svg"
      alt="Parô"
      width="248"
      height="133"
      class="h-full w-auto dark:hidden"
    >
    <img
      src="/logo/logo-paro-fundo-escuro.svg"
      alt="Parô"
      width="248"
      height="133"
      class="hidden h-full w-auto dark:block"
    >
  </span>
</template>
