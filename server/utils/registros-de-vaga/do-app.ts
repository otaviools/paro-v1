import { areaCoberta } from '#shared/utils/area-coberta'
import { bancoDoApp } from '../banco/do-app'
import { criarRegistrosDeVaga } from '.'

/** Registros de vaga do app, no banco do app. */
export const registrosDeVagaDoApp = criarRegistrosDeVaga({ banco: bancoDoApp, areaCoberta })
