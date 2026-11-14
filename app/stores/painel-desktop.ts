import { defineStore } from 'pinia'
import { ref } from 'vue'

/** Estado do painel desktop, compartilhado entre o app, o PainelDesktop e as telas. */
export const usePainelDesktopStore = defineStore('painel-desktop', () => {
  /**
   * Se a janela está na largura do desktop. Falso no servidor e até o app
   * montar, porque só o navegador sabe a largura; o `app.vue` acompanha a
   * consulta e atualiza este estado. O CSS já arruma o layout antes disso: o
   * estado só decide o que montar (barra lateral e mapa do painel).
   */
  const desktop = ref(false)

  /**
   * Se a barra lateral do desktop está aberta. O botão no canto do mapa abre e
   * fecha; o mapa e o centro ocupam o espaço dela quando fechada.
   */
  const lateralAberta = ref(true)

  return { desktop, lateralAberta }
})
