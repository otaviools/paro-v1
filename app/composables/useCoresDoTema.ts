/**
 * Cores do tema prontas para quem desenha fora do CSS, como o ECharts: cada
 * expressão CSS de cor (ex.: `var(--ui-primary)`) vira a cor calculada pelo
 * navegador, em rgba, e é relida quando o tema muda entre claro e escuro.
 * No servidor e antes de montar, devolve as próprias expressões.
 *
 * Exemplo: `useCoresDoTema({ texto: 'var(--ui-text)', borda: 'var(--ui-border)' })`.
 */
export function useCoresDoTema<T extends Record<string, string>>(expressoes: T): Readonly<ShallowRef<T>> {
  const cores = shallowRef(expressoes) as ShallowRef<T>

  function ler() {
    const amostra = document.createElement('span')
    amostra.style.display = 'none'
    document.body.append(amostra)
    const lidas = {} as Record<string, string>
    for (const [nome, expressao] of Object.entries(expressoes)) {
      amostra.style.color = ''
      amostra.style.color = expressao
      lidas[nome] = emRgba(getComputedStyle(amostra).color)
    }
    amostra.remove()
    cores.value = lidas as T
  }

  const colorMode = useColorMode()
  onMounted(ler)
  watch(() => colorMode.value, () => nextTick(ler))

  return cores
}

/** Os canais RGBA de uma cor CSS qualquer (oklch, color-mix...), pintando 1 pixel num canvas. */
function canaisDe(cor: string): [number, number, number, number] | null {
  if (typeof document === 'undefined') return null
  const contexto = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!contexto) return null
  // Uma cor que o canvas não entende (ex.: var(...), antes de montar) é ignorada: sem canais.
  const marcador = '#010203'
  contexto.fillStyle = marcador
  contexto.fillStyle = cor
  if (contexto.fillStyle === marcador && cor.toLowerCase() !== marcador) return null
  contexto.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0, a = 255] = contexto.getImageData(0, 0, 1, 1).data
  return [r, g, b, a / 255]
}

/** A cor em rgba, que o ECharts e qualquer navegador entendem. Só no navegador. */
function emRgba(cor: string) {
  const canais = canaisDe(cor)
  return canais ? `rgba(${canais[0]}, ${canais[1]}, ${canais[2]}, ${Number(canais[3].toFixed(3))})` : cor
}

/**
 * A mesma cor com outra opacidade, em rgba. No servidor, devolve um
 * color-mix, que serve no CSS e é trocado pelo rgba ao montar.
 */
export function comOpacidade(cor: string, opacidade: number) {
  const canais = canaisDe(cor)
  return canais
    ? `rgba(${canais[0]}, ${canais[1]}, ${canais[2]}, ${opacidade})`
    : `color-mix(in oklab, ${cor} ${Math.round(opacidade * 100)}%, transparent)`
}
