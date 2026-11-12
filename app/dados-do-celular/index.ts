/**
 * Armazenamento do aparelho. `localStorage` satisfaz esta interface; nos
 * testes, o armazenamento em memória fica no lugar dele.
 */
export interface Armazenamento {
  getItem(chave: string): string | null
  setItem(chave: string, valor: string): void
  removeItem(chave: string): void
}

/** Substituto do `localStorage` nos testes, com o mesmo comportamento. */
export function armazenamentoEmMemória(): Armazenamento {
  const itens = new Map<string, string>()
  return {
    getItem: (chave) => itens.get(chave) ?? null,
    // Como o localStorage, guarda sempre texto.
    setItem: (chave, valor) => { itens.set(chave, String(valor)) },
    removeItem: (chave) => { itens.delete(chave) },
  }
}

/** Início de uma faixa horária, no formato "HH:MM" (ex.: "19:30"). */
export type FaixaHorária = string

const CHAVE_DA_ROTINA = 'paro:rotina'

/**
 * Dados do celular: o que nunca sai do aparelho (ADRs 0004 e 0015). Neste
 * momento, só a rotina. Nada daqui é enviado ao servidor.
 */
export function criarDadosDoCelular(armazenamento: Armazenamento) {
  return {
    /** Faixa horária de chegada habitual, ou null sem rotina. */
    rotina(): FaixaHorária | null {
      return armazenamento.getItem(CHAVE_DA_ROTINA)
    },

    /** Guarda a rotina; null tira a rotina, e o app volta a abrir em Agora. */
    definirRotina(faixaHorária: FaixaHorária | null): void {
      if (faixaHorária === null) armazenamento.removeItem(CHAVE_DA_ROTINA)
      else armazenamento.setItem(CHAVE_DA_ROTINA, faixaHorária)
    },
  }
}

export type DadosDoCelular = ReturnType<typeof criarDadosDoCelular>

/**
 * Dados do celular do aparelho, sobre o `localStorage`. Só no navegador.
 * Se o `localStorage` estiver bloqueado (navegação privada, por exemplo),
 * os dados ficam em memória até a página fechar.
 */
export function dadosDoCelularDoAparelho(): DadosDoCelular {
  try {
    const armazenamento = window.localStorage
    armazenamento.getItem(CHAVE_DA_ROTINA)
    return criarDadosDoCelular(armazenamento)
  }
  catch {
    return criarDadosDoCelular(armazenamentoEmMemória())
  }
}
