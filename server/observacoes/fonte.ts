import { configuracaoDaAreaCoberta } from '../area-coberta/configuracao'
import { criarObservaçõesFictícias } from './ficticias'
import type { Observações } from '.'

/**
 * Fonte de observações ativa no app. Até haver observações reais (semestre de
 * 2027), só existe a fonte de observações fictícias (ADRs 0011 e 0012).
 */
export const observaçõesDoApp: Observações = criarObservaçõesFictícias(configuracaoDaAreaCoberta)
