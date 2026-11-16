/** Resultado de `lerObservacoes`. "chave-incorreta": o servidor recusou a chave da equipe (401). */
export type ResultadoDaLeituraDeObservacoes
  = | { tipo: 'lidas', resposta: RespostaDasObservacoes }
    | { tipo: 'chave-incorreta' }
    | { tipo: 'falha' }

/** Resultado de `registrarObservacao`; "invalida" traz a mensagem do servidor. */
export type ResultadoDoRegistroDeObservacao
  = | { tipo: 'registrada', observacao: ObservacaoRegistrada }
    | { tipo: 'invalida', mensagem: string }
    | { tipo: 'chave-incorreta' }
    | { tipo: 'falha' }

/** Resultado de `apagarObservacao`. */
export type ResultadoDoApagarObservacao = 'apagada' | 'chave-incorreta' | 'falha'

function statusDo(erro: unknown) {
  return (erro as { statusCode?: number })?.statusCode
}

function mensagemDo(erro: unknown) {
  return (erro as { data?: { message?: string } })?.data?.message
}

/** A chave da equipe vai no cabeçalho Authorization, nunca na URL (ADR 0021). */
const cabecalho = (chave: string) => ({ authorization: `Bearer ${chave}` })

/**
 * Observações reais da equipe (ADR 0011): ler, registrar e apagar com a chave
 * da equipe (`/api/equipe/observacoes`). São ações, e não buscas com chave de
 * cache, porque dependem da chave digitada na tela.
 */
export function useObservacoes() {
  async function lerObservacoes(chave: string): Promise<ResultadoDaLeituraDeObservacoes> {
    try {
      const resposta = await $fetch<RespostaDasObservacoes>('/api/equipe/observacoes', { headers: cabecalho(chave) })
      return { tipo: 'lidas', resposta }
    }
    catch (erro) {
      return statusDo(erro) === 401 ? { tipo: 'chave-incorreta' } : { tipo: 'falha' }
    }
  }

  async function registrarObservacao(chave: string, corpo: CorpoDaObservacao): Promise<ResultadoDoRegistroDeObservacao> {
    try {
      const observacao = await $fetch<ObservacaoRegistrada>('/api/equipe/observacoes', {
        method: 'POST',
        headers: cabecalho(chave),
        body: corpo,
      })
      return { tipo: 'registrada', observacao }
    }
    catch (erro) {
      const status = statusDo(erro)
      if (status === 401) return { tipo: 'chave-incorreta' }
      if (status === 400) return { tipo: 'invalida', mensagem: mensagemDo(erro) ?? 'Confira os campos.' }
      return { tipo: 'falha' }
    }
  }

  async function apagarObservacao(chave: string, id: ObservacaoRegistrada['id']): Promise<ResultadoDoApagarObservacao> {
    try {
      await $fetch<SemConteudo>(`/api/equipe/observacoes/${id}`, { method: 'DELETE', headers: cabecalho(chave) })
      return 'apagada'
    }
    catch (erro) {
      return statusDo(erro) === 401 ? 'chave-incorreta' : 'falha'
    }
  }

  return { lerObservacoes, registrarObservacao, apagarObservacao }
}
