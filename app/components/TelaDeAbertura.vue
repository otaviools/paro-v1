<!--
  Tela de abertura: cobre o app enquanto ele carrega pela primeira vez, com só
  o símbolo do Parô (o "ô" azul, public/simbolo.svg) pulsando no centro. Vem
  pronta no HTML do servidor, então aparece antes de qualquer JavaScript; some
  com esmaecer de 300 ms quando a primeira tela e os dados dela ficam prontos
  (app:suspense:resolve). Com movimento reduzido, o ô fica parado.

  Interface: sem props, slots nem eventos.
-->
<script setup lang="ts">
const aberta = ref(true)

// Some quando a primeira tela e os dados dela ficam prontos (fim do Suspense
// da hidratação), sem esperar o navegador ficar ocioso.
const nuxtApp = useNuxtApp()
nuxtApp.hooks.hookOnce('app:suspense:resolve', () => {
  aberta.value = false
})
onMounted(() => {
  if (!nuxtApp.isHydrating) aberta.value = false
})
</script>

<template>
  <Transition
    leave-active-class="transition-opacity duration-300 ease-out motion-reduce:transition-none"
    leave-to-class="opacity-0"
  >
    <div
      v-if="aberta"
      class="fixed inset-0 z-100 grid place-items-center fundo-azul"
      role="status"
      aria-label="Carregando o Parô"
    >
      <!--
        Símbolo do Parô (public/simbolo.svg): quadro de 64 com o ô no centro e
        folga em volta, então o pulso de 12% não é cortado.
      -->
      <img
        src="/simbolo.svg"
        alt=""
        width="64"
        height="64"
        class="size-24 motion-safe:animate-[pulsar-o_1.4s_ease-in-out_infinite]"
      >
    </div>
  </Transition>
</template>
