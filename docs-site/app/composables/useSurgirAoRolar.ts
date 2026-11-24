import { useIntersectionObserver } from '@vueuse/core'
import type { Ref } from 'vue'

// Entrada ao rolar (movimento.css): na primeira vez que o elemento entra na tela,
// ganha a classe `surgiu` e deixa de ser observado. A classe `surgir-ao-rolar`
// fica no próprio elemento, no template.
export function useSurgirAoRolar(alvo: Ref<HTMLElement | null>) {
  const { stop } = useIntersectionObserver(alvo, ([entrada]) => {
    if (!entrada?.isIntersecting) return
    entrada.target.classList.add('surgiu')
    stop()
  }, { rootMargin: '0px 0px -10% 0px' })
}
