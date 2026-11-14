/** Resultado de `registrar`: o registro feito, ou o motivo da recusa do servidor quando há um. */
export type ResultadoDoRegistro
  = | { tipo: 'registrado', registrado: Registrado }
    | { tipo: 'falha', motivo: string | null }

/**
 * Resultado de `alterarSaida`. "registro-invalido": o servidor recusou o
 * código, porque o registro foi encerrado ou é de outra noite.
 */
export type ResultadoDaSaida = 'alterada' | 'registro-invalido' | 'falha'

/** Resultado de `encerrar`. */
export type ResultadoDoEncerramento = 'encerrado' | 'falha'

function statusDo(erro: unknown) {
  return (erro as { statusCode?: number }).statusCode
}

/**
 * Registro de vaga (ADR 0014): registrar a vaga, mudar a saída prevista e
 * avisar "Saí" (`POST /api/registros`, `PATCH /api/registros/saida`,
 * `POST /api/registros/encerrar`). Cada ação devolve o resultado em termos
 * do domínio; a tela só escolhe o texto.
 */
export function useRegistroDeVaga() {
  async function registrar(corpo: CorpoDoRegistro): Promise<ResultadoDoRegistro> {
    try {
      const registrado = await $fetch<Registrado>('/api/registros', { method: 'POST', body: corpo })
      return { tipo: 'registrado', registrado }
    }
    catch (erro) {
      const { statusCode, data } = erro as { statusCode?: number, data?: { message?: string } }
      return { tipo: 'falha', motivo: statusCode === 400 && data?.message ? data.message : null }
    }
  }

  async function alterarSaida(codigo: string, saidaPrevista: FaixaHoraria): Promise<ResultadoDaSaida> {
    try {
      await $fetch<RespostaDaSaida>('/api/registros/saida', {
        method: 'PATCH',
        body: { codigo, saidaPrevista } satisfies CorpoDaSaida,
      })
      return 'alterada'
    }
    catch (erro) {
      return statusDo(erro) === 404 ? 'registro-invalido' : 'falha'
    }
  }

  /** Código recusado (404): o registro já não conta, então o "Saí" vale do mesmo jeito. */
  async function encerrar(codigo: string): Promise<ResultadoDoEncerramento> {
    try {
      await $fetch<RespostaDoEncerramento>('/api/registros/encerrar', {
        method: 'POST',
        body: { codigo } satisfies CorpoDoEncerramento,
      })
      return 'encerrado'
    }
    catch (erro) {
      return statusDo(erro) === 404 ? 'encerrado' : 'falha'
    }
  }

  return { registrar, alterarSaida, encerrar }
}
