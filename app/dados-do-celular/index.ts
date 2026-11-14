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
export function armazenamentoEmMemoria(): Armazenamento {
  const itens = new Map<string, string>()
  return {
    getItem: chave => itens.get(chave) ?? null,
    // Como o localStorage, guarda sempre texto.
    setItem: (chave, valor) => { itens.set(chave, String(valor)) },
    removeItem: (chave) => { itens.delete(chave) },
  }
}

/** Início de uma faixa horária, no formato "HH:MM" (ex.: "19:30"). */
export type FaixaHoraria = string

/** Data local da noite, no formato "AAAA-MM-DD". */
export type Noite = string

/**
 * Registro de vaga aberto, como o celular guarda. O código é o que permite
 * mudar a saída prevista ou tocar em "Saí" (ADR 0014); a rua e as faixas
 * horárias ficam aqui para a tela Seu registro de vaga.
 */
export interface RegistroNoCelular {
  codigo: string
  noite: Noite
  ruaCoberta: { id: string, nome: string }
  chegada: FaixaHoraria
  saidaPrevista: FaixaHoraria
}

/**
 * Ponto do carro: a posição exata onde o motorista deixou o carro, lida no
 * registro com localização ligada. Nunca sai do aparelho (ADR 0003).
 */
export interface Ponto {
  lat: number
  lon: number
}

/**
 * Forma de colaborar (ADR 0010): registro com a localização ligada, registro
 * manual, ou nenhuma. Não existe localização contínua.
 */
export type FormaDeColaborar = 'localizacao-ligada' | 'manual' | 'nenhuma'

const CHAVE_DA_ROTINA = 'paro:rotina'
const CHAVE_DO_REGISTRO = 'paro:registro-de-vaga'
const CHAVE_DO_PONTO_DO_CARRO = 'paro:ponto-do-carro'
const CHAVE_DA_FORMA_DE_COLABORAR = 'paro:forma-de-colaborar'
const CHAVE_DA_PRIMEIRA_VISITA = 'paro:primeira-visita-concluida'
const CHAVE_DA_SESSAO_DO_MES = 'paro:sessao-do-mes'
const CHAVE_DA_RESPOSTA_AJUDOU = 'paro:respondeu-ajudou'

/** Mês no formato "AAAA-MM". */
export type Mes = string

/** 16 bytes aleatórios em hexadecimal: o formato que o servidor aceita. */
function sortearId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * O histórico do aparelho: o que "Apagar histórico" limpa. Toda chave nova
 * de histórico entra aqui. A forma de colaborar e a Primeira visita não são
 * histórico, são escolhas da pessoa, e ficam.
 */
const CHAVES_DO_HISTORICO = [CHAVE_DA_ROTINA, CHAVE_DO_REGISTRO, CHAVE_DO_PONTO_DO_CARRO]

/** Tira acento e cedilha: "saídaPrevista" vira "saidaPrevista" (ADR 0026). */
function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '')
}

/**
 * Lê um JSON guardado no aparelho. Versões antigas do app guardavam chaves
 * com acento ("código", "saídaPrevista", "mês"); elas são lidas com o nome
 * novo, para quem já usa o app não perder o registro nem a sessão do mês.
 * Só as chaves do primeiro nível mudam: nenhuma chave aninhada tinha acento.
 */
function lerJsonGuardado<T>(guardado: string): T {
  const valor: unknown = JSON.parse(guardado)
  if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) return valor as T
  return Object.fromEntries(Object.entries(valor).map(([chave, conteudo]) => [semAcento(chave), conteudo])) as T
}

/**
 * Dados do celular: o que fica no aparelho (ADRs 0003, 0004, 0014 e 0015).
 * Guarda a rotina e o registro de vaga aberto, com o código e o ponto do
 * carro. Só o código vai ao servidor, para mudar a saída prevista ou tocar em
 * "Saí"; o resto, e o ponto do carro em especial, nunca sai do aparelho.
 */
export function criarDadosDoCelular(armazenamento: Armazenamento) {
  function registroGuardado(): RegistroNoCelular | null {
    const guardado = armazenamento.getItem(CHAVE_DO_REGISTRO)
    return guardado === null ? null : lerJsonGuardado<RegistroNoCelular>(guardado)
  }

  /**
   * Registro de vaga aberto na `noite`, ou null. O código expira no fim da
   * noite (ADR 0014): um registro de outra noite é apagado do aparelho, com o
   * ponto do carro.
   */
  function registroAtual(noite: Noite): RegistroNoCelular | null {
    const registro = registroGuardado()
    if (registro === null || registro.noite === noite) return registro
    armazenamento.removeItem(CHAVE_DO_REGISTRO)
    armazenamento.removeItem(CHAVE_DO_PONTO_DO_CARRO)
    return null
  }

  return {
    /** Faixa horária de chegada habitual, ou null sem rotina. */
    rotina(): FaixaHoraria | null {
      return armazenamento.getItem(CHAVE_DA_ROTINA)
    },

    /** Guarda a rotina; null tira a rotina, e o app volta a abrir em Agora. */
    definirRotina(faixaHoraria: FaixaHoraria | null): void {
      if (faixaHoraria === null) armazenamento.removeItem(CHAVE_DA_ROTINA)
      else armazenamento.setItem(CHAVE_DA_ROTINA, faixaHoraria)
    },

    /**
     * Guarda o registro de vaga que acabou de ser feito, com o código, e o
     * ponto do carro quando a localização foi lida no registro.
     */
    guardarRegistro(registro: RegistroNoCelular, pontoDoCarro?: Ponto): void {
      armazenamento.setItem(CHAVE_DO_REGISTRO, JSON.stringify(registro))
      // O registro manual não tem ponto do carro, nem herda o de um registro anterior.
      if (pontoDoCarro) armazenamento.setItem(CHAVE_DO_PONTO_DO_CARRO, JSON.stringify(pontoDoCarro))
      else armazenamento.removeItem(CHAVE_DO_PONTO_DO_CARRO)
    },

    /**
     * Ponto do carro do registro aberto na `noite`, ou null. Vale enquanto
     * o registro vale: some com ele no fim da noite.
     */
    pontoDoCarro(noite: Noite): Ponto | null {
      if (registroAtual(noite) === null) return null
      const guardado = armazenamento.getItem(CHAVE_DO_PONTO_DO_CARRO)
      return guardado === null ? null : JSON.parse(guardado) as Ponto
    },

    registroAtual,

    /** Forma de colaborar escolhida; desligada ('nenhuma') até a pessoa escolher (ADR 0010). */
    formaDeColaborar(): FormaDeColaborar {
      const guardada = armazenamento.getItem(CHAVE_DA_FORMA_DE_COLABORAR)
      // Versões antigas do app guardavam a forma com acento.
      const forma = guardada === null ? null : semAcento(guardada)
      return forma === 'localizacao-ligada' || forma === 'manual' ? forma : 'nenhuma'
    },

    /** Guarda a forma de colaborar escolhida na Primeira visita ou em Ajustes. */
    definirFormaDeColaborar(forma: FormaDeColaborar): void {
      armazenamento.setItem(CHAVE_DA_FORMA_DE_COLABORAR, forma)
    },

    /** Se a Primeira visita já foi feita neste aparelho; ela aparece só uma vez. */
    primeiraVisitaConcluida(): boolean {
      return armazenamento.getItem(CHAVE_DA_PRIMEIRA_VISITA) !== null
    },

    concluirPrimeiraVisita(): void {
      armazenamento.setItem(CHAVE_DA_PRIMEIRA_VISITA, 'sim')
    },

    /** Guarda a nova saída prevista do registro aberto, depois que o servidor aceitou. */
    mudarSaidaDoRegistro(saidaPrevista: FaixaHoraria): void {
      const registro = registroGuardado()
      if (registro === null) return
      armazenamento.setItem(CHAVE_DO_REGISTRO, JSON.stringify({ ...registro, saidaPrevista }))
    },

    /**
     * Apaga o registro, o código e o ponto do carro: depois do "Saí", ou
     * quando o servidor recusa o código.
     */
    apagarRegistro(): void {
      armazenamento.removeItem(CHAVE_DO_REGISTRO)
      armazenamento.removeItem(CHAVE_DO_PONTO_DO_CARRO)
    },

    /**
     * Identificador de sessão do `mes` (ADR 0004): um número sorteado no
     * aparelho, que troca quando o mês muda. É a única coisa que vai ao
     * servidor a cada visita, nunca junto com um registro de vaga.
     */
    idDeSessaoDoMes(mes: Mes): string {
      const guardada = armazenamento.getItem(CHAVE_DA_SESSAO_DO_MES)
      const sessao = guardada === null ? null : lerJsonGuardado<{ mes: Mes, id: string }>(guardada)
      if (sessao?.mes === mes) return sessao.id
      const id = sortearId()
      armazenamento.setItem(CHAVE_DA_SESSAO_DO_MES, JSON.stringify({ mes, id }))
      return id
    },

    /**
     * Se "A previsão ajudou hoje?" já foi respondida neste aparelho na
     * `noite`. A pergunta aparece uma vez por noite; a resposta vai ao
     * servidor sem identificador, e só o celular sabe que respondeu.
     */
    respondeuAjudou(noite: Noite): boolean {
      return armazenamento.getItem(CHAVE_DA_RESPOSTA_AJUDOU) === noite
    },

    marcarRespostaAjudou(noite: Noite): void {
      armazenamento.setItem(CHAVE_DA_RESPOSTA_AJUDOU, noite)
    },

    /**
     * "Apagar histórico" (ADR 0004): limpa a rotina, o registro de vaga com o
     * código e o ponto do carro. Limpa só o celular; sem o código, o registro
     * aberto no servidor não pode mais ser alterado e expira no fim da noite
     * (ADR 0014).
     */
    apagarHistorico(): void {
      for (const chave of CHAVES_DO_HISTORICO) armazenamento.removeItem(chave)
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
    return criarDadosDoCelular(armazenamentoEmMemoria())
  }
}
