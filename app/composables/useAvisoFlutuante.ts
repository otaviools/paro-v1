/** Quanto tempo o aviso flutuante fica na tela (design system: some em 3 s). */
const DURACAO_DO_AVISO = 3000

let temporizador: ReturnType<typeof setTimeout> | undefined

/**
 * Aviso flutuante de confirmação (design system, "Gavetas, avisos flutuantes
 * e carregamento"). Fica no app, fora das telas, para continuar visível
 * depois de trocar de tela (ex.: "Saí" → Início).
 */
export function useAvisoFlutuante() {
  const texto = useState<string | null>('aviso-flutuante', () => null)

  function avisar(mensagem: string) {
    texto.value = mensagem
    clearTimeout(temporizador)
    temporizador = setTimeout(() => {
      texto.value = null
    }, DURACAO_DO_AVISO)
  }

  return { texto: readonly(texto), avisar }
}
