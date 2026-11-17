import type { Data } from '#shared/types/area-coberta'
import type { RecorrenciaDaSemana, RegistrosDaNoite, Relatorio, RespostasDoDia } from '#shared/types/metricas-de-uso'
import { criarAreaCoberta } from '#shared/utils/area-coberta'
import type { ConfiguracaoDaAreaCoberta } from '#shared/utils/area-coberta'
import { datasEntre, exigirPeriodoValido } from '.'

/** Número entre 0 e 1 sorteado a partir de um texto: o mesmo texto dá sempre o mesmo número. */
function sorteioDe(texto: string): number {
  let h = 2166136261
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  h ^= h >>> 13
  h = Math.imul(h, 0x5BD1E995)
  h ^= h >>> 15
  return (h >>> 0) / 4294967296
}

/** Inteiro entre `min` e `max`, inclusive, sorteado a partir de um texto. */
const inteiroDe = (texto: string, min: number, max: number) => min + Math.floor(sorteioDe(texto) * (max - min + 1))

/** Dia da semana de uma data: 1 é segunda-feira, 7 é domingo. */
function diaDaSemana(data: Data): number {
  return new Date(`${data}T12:00:00Z`).getUTCDay() || 7
}

function somarDias(data: Data, dias: number): Data {
  const d = new Date(`${data}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

/**
 * Métricas de uso fictícias, para a tela de Métricas da demonstração (ADR
 * 0012), enquanto o app usa as observações fictícias. Seguem as mesmas
 * regras das reais, para a tela se comportar igual:
 * - uma semana (de segunda a domingo) só entra depois que a semana seguinte
 *   termina, como na consolidação diária (ADR 0021);
 * - respostas de "A previsão ajudou hoje?" e registros de vaga só em dias de
 *   segunda a sexta; registros só das noites já fechadas, antes de `ate`;
 * - registros por rua coberta e faixa horária da área coberta, mais nas
 *   ruas perto do destino.
 * Cada número sai de um sorteio pela data, então o mesmo dia tem sempre os
 * mesmos números, em qualquer período pedido.
 */
export function criarMetricasFicticias(configuracao: ConfiguracaoDaAreaCoberta) {
  const areaCoberta = criarAreaCoberta(configuracao)
  const ruas = [...areaCoberta.ruasCobertas()].sort((a, b) => a.distanciaAoDestinoMetros - b.distanciaAoDestinoMetros)
  const faixasHorarias = areaCoberta.faixasHorarias()

  function recorrencia(de: Data, ate: Data): RecorrenciaDaSemana[] {
    return datasEntre(de, ate)
      .filter(data => diaDaSemana(data) === 1 && somarDias(data, 14) <= ate)
      .map((semana) => {
        const motoristas = inteiroDe(`motoristas:${semana}`, 38, 92)
        const voltaram = Math.round(motoristas * (0.42 + 0.25 * sorteioDe(`voltaram:${semana}`)))
        return { semana, motoristas, voltaramNaSemanaSeguinte: voltaram }
      })
  }

  function ajudou(de: Data, ate: Data): RespostasDoDia[] {
    return datasEntre(de, ate)
      .filter(data => diaDaSemana(data) <= 5)
      .map((data) => {
        const respostas = inteiroDe(`respostas:${data}`, 2, 9)
        const sim = Math.round(respostas * (0.62 + 0.3 * sorteioDe(`sim:${data}`)))
        return { data, sim, nao: respostas - sim }
      })
  }

  function registrosPorNoite(de: Data, ate: Data): RegistrosDaNoite[] {
    return datasEntre(de, ate)
      .filter(noite => noite < ate && diaDaSemana(noite) <= 5)
      .map((noite) => {
        const porRuaEFaixaHoraria = ruas.flatMap((rua, posicao) => faixasHorarias.map(faixaHoraria => ({
          ruaCoberta: rua.id,
          faixaHoraria,
          // A rua mais perto do destino recebe até 6 registros por faixa; a mais longe, até 2.
          quantidade: inteiroDe(`registros:${noite}:${rua.id}:${faixaHoraria}`, 0, Math.max(2, 6 - posicao)),
        }))).filter(t => t.quantidade > 0)
        return { noite, total: porRuaEFaixaHoraria.reduce((soma, t) => soma + t.quantidade, 0), porRuaEFaixaHoraria }
      })
  }

  return {
    /** O mesmo contrato de `relatorio` das métricas reais, com período de até 366 dias. */
    relatorio(de: Data, ate: Data): Relatorio {
      exigirPeriodoValido(de, ate)
      return { recorrencia: recorrencia(de, ate), ajudou: ajudou(de, ate), registrosPorNoite: registrosPorNoite(de, ate) }
    },
  }
}
