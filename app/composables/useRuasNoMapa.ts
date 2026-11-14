import type { Ref } from 'vue'
import type { RuaNoMapa } from '~/components/MapaDaArea.vue'

interface PanoramaComRuas {
  ruas: { rua: { id: string, nome: string }, estimativa: Parameters<typeof estadoDaEstimativa>[0] }[]
}

/**
 * Ruas cobertas do Panorama da noite com a linha de cada trecho, para o Mapa
 * da área. As linhas não mudam com a faixa horária e são lidas uma vez.
 * Usado pelo Mapa do celular e pelo mapa do painel desktop.
 */
export function useRuasNoMapa(panorama: Ref<PanoramaComRuas | null | undefined>) {
  const { data: trechos } = useFetch('/api/trechos', { key: 'trechos', server: false })

  return computed<RuaNoMapa[]>(() => {
    const linhas = new Map((trechos.value ?? []).map(t => [t.id, t.linha]))
    return (panorama.value?.ruas ?? []).flatMap(({ rua, estimativa }) => {
      const linha = linhas.get(rua.id)
      return linha ? [{ id: rua.id, nome: rua.nome, estado: estadoDaEstimativa(estimativa), linha }] : []
    })
  })
}
