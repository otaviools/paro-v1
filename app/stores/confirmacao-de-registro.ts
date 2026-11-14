import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Confirmação de registro, mostrada uma vez em Minha vaga depois de Registrar
 * vaga. Registrar vaga marca; Minha vaga consome ao abrir.
 */
export const useConfirmacaoDeRegistroStore = defineStore('confirmacao-de-registro', () => {
  const pendente = ref(false)

  /** Registrar vaga acabou de registrar: Minha vaga mostra a confirmação. */
  function marcar() {
    pendente.value = true
  }

  /** True só na primeira leitura depois de marcar. */
  function consumir(): boolean {
    const mostrar = pendente.value
    pendente.value = false
    return mostrar
  }

  return { marcar, consumir }
})
