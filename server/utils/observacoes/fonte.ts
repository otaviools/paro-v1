import { configuracaoDaAreaCoberta } from '#shared/utils/area-coberta/configuracao'
import { criarObservacoesFicticias } from './ficticias'
import type { Observacoes } from '.'

/**
 * Fonte de observações ativa no app. Até haver observações reais (semestre de
 * 2027), só existe a fonte de observações fictícias (ADRs 0011 e 0012).
 */
export const observacoesDoApp: Observacoes = criarObservacoesFicticias(configuracaoDaAreaCoberta)
