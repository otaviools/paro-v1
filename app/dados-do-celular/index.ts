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

/** Data local da noite, no formato "AAAA-MM-DD". */
export type Noite = string

/**
 * Registro de vaga aberto, como o celular guarda. O código é o que permite
 * mudar a saída prevista ou tocar em "Saí" (ADR 0014); a rua e as faixas
 * horárias ficam aqui para a tela Vaga ativa.
 */
export interface RegistroNoCelular {
  código: string
  noite: Noite
  ruaCoberta: { id: string, nome: string }
  chegada: FaixaHorária
  saídaPrevista: FaixaHorária
}

const CHAVE_DA_ROTINA = 'paro:rotina'
const CHAVE_DO_REGISTRO = 'paro:registro-de-vaga'

/**
 * Dados do celular: o que fica no aparelho (ADRs 0004, 0014 e 0015). Guarda a
 * rotina e o registro de vaga aberto, com o código. Só o código vai ao
 * servidor, para mudar a saída prevista ou tocar em "Saí"; o resto nunca sai
 * do aparelho.
 */
export function criarDadosDoCelular(armazenamento: Armazenamento) {
  function registroGuardado(): RegistroNoCelular | null {
    const guardado = armazenamento.getItem(CHAVE_DO_REGISTRO)
    return guardado === null ? null : JSON.parse(guardado) as RegistroNoCelular
  }

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

    /** Guarda o registro de vaga que acabou de ser feito, com o código. */
    guardarRegistro(registro: RegistroNoCelular): void {
      armazenamento.setItem(CHAVE_DO_REGISTRO, JSON.stringify(registro))
    },

    /**
     * Registro de vaga aberto na `noite`, ou null. O código expira no fim da
     * noite (ADR 0014): um registro de outra noite é apagado do aparelho.
     */
    registroAtual(noite: Noite): RegistroNoCelular | null {
      const registro = registroGuardado()
      if (registro === null || registro.noite === noite) return registro
      armazenamento.removeItem(CHAVE_DO_REGISTRO)
      return null
    },

    /** Guarda a nova saída prevista do registro aberto, depois que o servidor aceitou. */
    mudarSaídaDoRegistro(saídaPrevista: FaixaHorária): void {
      const registro = registroGuardado()
      if (registro === null) return
      armazenamento.setItem(CHAVE_DO_REGISTRO, JSON.stringify({ ...registro, saídaPrevista }))
    },

    /** Apaga o registro e o código: depois do "Saí", ou quando o servidor recusa o código. */
    apagarRegistro(): void {
      armazenamento.removeItem(CHAVE_DO_REGISTRO)
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
