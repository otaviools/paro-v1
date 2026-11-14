import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/** Quanto tempo o aviso flutuante fica na tela (design system: some em 3 s). */
export const DURACAO_DO_AVISO = 3000

/** Confirmação de algo que deu certo, ou falha. Define a cor e o ícone do aviso. */
export type TipoDeAviso = 'sucesso' | 'erro'

/**
 * Aviso flutuante de confirmação (design system, "Gavetas, avisos flutuantes
 * e carregamento"). Fica no app, fora das telas, para continuar visível
 * depois de trocar de tela (ex.: "Saí" → Início).
 */
export const useAvisoFlutuanteStore = defineStore('aviso-flutuante', () => {
  const texto = ref<string | null>(null)
  const tipo = ref<TipoDeAviso>('sucesso')
  let temporizador: ReturnType<typeof setTimeout> | undefined

  /**
   * Mostra o aviso por 3 s. Um aviso novo troca o anterior e recomeça a
   * contagem. Sem tipo, é uma confirmação ('sucesso'); falhas passam 'erro'.
   */
  function avisar(mensagem: string, tipoDoAviso: TipoDeAviso = 'sucesso') {
    texto.value = mensagem
    tipo.value = tipoDoAviso
    clearTimeout(temporizador)
    temporizador = setTimeout(() => {
      texto.value = null
    }, DURACAO_DO_AVISO)
  }

  // Só o `avisar` muda o texto: as telas leem por um computed.
  return { texto: computed(() => texto.value), tipo: computed(() => tipo.value), avisar }
})
