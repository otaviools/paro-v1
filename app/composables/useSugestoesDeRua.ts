/** Resultado de `lerSugestoes`. "chave-incorreta": o servidor recusou a chave da equipe (401). */
export type ResultadoDaLeitura
  = | { tipo: 'lidas', sugestoes: SugestaoDeRua[] }
    | { tipo: 'chave-incorreta' }
    | { tipo: 'falha' }

/** Resultado de `apagarSugestao`. */
export type ResultadoDoApagar = 'apagada' | 'chave-incorreta' | 'falha'

function statusDo(erro: unknown) {
  return (erro as { statusCode?: number })?.statusCode
}

/** A chave da equipe vai no cabeçalho Authorization, nunca na URL (ADR 0021). */
const cabecalho = (chave: string) => ({ authorization: `Bearer ${chave}` })

/**
 * Sugestões de rua (ADRs 0013 e 0021): o motorista envia
 * (`POST /api/sugestoes`); a equipe lê e apaga com a chave da equipe
 * (`GET /api/equipe/sugestoes`, `DELETE /api/equipe/sugestoes/:id`). A
 * leitura da equipe é uma ação, e não uma busca com chave de cache, porque
 * depende da chave digitada na tela.
 */
export function useSugestoesDeRua() {
  /** True quando o servidor recebeu a sugestão. */
  async function enviarSugestao(texto: string): Promise<boolean> {
    try {
      await $fetch('/api/sugestoes', { method: 'POST', body: { texto } satisfies CorpoDaSugestao })
      return true
    }
    catch {
      return false
    }
  }

  async function lerSugestoes(chave: string): Promise<ResultadoDaLeitura> {
    try {
      const sugestoes = await $fetch<RespostaDasSugestoes>('/api/equipe/sugestoes', { headers: cabecalho(chave) })
      return { tipo: 'lidas', sugestoes }
    }
    catch (erro) {
      return statusDo(erro) === 401 ? { tipo: 'chave-incorreta' } : { tipo: 'falha' }
    }
  }

  async function apagarSugestao(chave: string, id: SugestaoDeRua['id']): Promise<ResultadoDoApagar> {
    try {
      await $fetch<SemConteudo>(`/api/equipe/sugestoes/${id}`, { method: 'DELETE', headers: cabecalho(chave) })
      return 'apagada'
    }
    catch (erro) {
      return statusDo(erro) === 401 ? 'chave-incorreta' : 'falha'
    }
  }

  return { enviarSugestao, lerSugestoes, apagarSugestao }
}
