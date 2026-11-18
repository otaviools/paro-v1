/** Onde a chave da equipe fica enquanto a aba estiver aberta. */
const CHAVE_NA_SESSAO = 'paro:chave-da-equipe'

/**
 * Chave da equipe guardada só nesta aba do navegador (sessionStorage), para a
 * equipe digitar uma vez e trocar entre Observações, Sugestões e Métricas sem digitar de
 * novo. Nunca vai para a URL nem para o servidor além do cabeçalho
 * Authorization (ADR 0021). Sem sessionStorage (navegação privada restrita),
 * ler devolve null e guardar não faz nada.
 */
export function useChaveDaEquipe() {
  function lerChaveDaSessao(): string | null {
    try {
      return sessionStorage.getItem(CHAVE_NA_SESSAO)
    }
    catch {
      return null
    }
  }

  /** Guarda a chave aceita; null apaga (ao sair ou quando o servidor recusa). */
  function guardarChaveNaSessao(valor: string | null) {
    try {
      if (valor === null) sessionStorage.removeItem(CHAVE_NA_SESSAO)
      else sessionStorage.setItem(CHAVE_NA_SESSAO, valor)
    }
    catch {
      // Sem sessionStorage: a chave fica só na memória da tela.
    }
  }

  return { lerChaveDaSessao, guardarChaveNaSessao }
}
