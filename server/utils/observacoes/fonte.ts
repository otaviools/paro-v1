import type { FonteDeObservacoes } from '#shared/types/observacoes'
import { configuracaoDaAreaCoberta } from '#shared/utils/area-coberta/configuracao'
import { observacoesReaisDoApp } from './do-app'
import { criarObservacoesFicticias } from './ficticias'
import type { Observacoes } from '.'

const observacoesFicticias = criarObservacoesFicticias(configuracaoDaAreaCoberta)

/**
 * Fonte de observações que o app usa para a chance, escolhida pela variável
 * de ambiente `NUXT_FONTE_DE_OBSERVACOES`: "reais" usa as observações da
 * equipe, no banco; qualquer outro valor (ou nenhum) usa as fictícias, até
 * haver observações reais (ADRs 0011 e 0012). Nunca as duas juntas.
 */
export function fonteDeObservacoes(valor = process.env.NUXT_FONTE_DE_OBSERVACOES): FonteDeObservacoes {
  return valor === 'reais' ? 'reais' : 'ficticias'
}

/** A fonte é lida a cada uso, para valer a configuração do ambiente sem cache. */
function fonteAtiva(): Observacoes {
  return fonteDeObservacoes() === 'reais' ? observacoesReaisDoApp : observacoesFicticias
}

/** Fonte de observações ativa no app. */
export const observacoesDoApp: Observacoes = {
  doSemestre: semestre => fonteAtiva().doSemestre(semestre),
  eDemonstracao: () => fonteAtiva().eDemonstracao(),
}
