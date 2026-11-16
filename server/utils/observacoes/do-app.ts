import { areaCoberta } from '#shared/utils/area-coberta'
import { bancoDoApp } from '../banco/do-app'
import { criarObservacoesReais } from './reais'

/** Observações reais do app, no banco do app. */
export const observacoesReaisDoApp = criarObservacoesReais({ banco: bancoDoApp, areaCoberta })
