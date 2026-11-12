import { areaCoberta } from '../area-coberta'

/** Faixas horárias da área coberta, em ordem (usadas na escolha da rotina). */
export default defineEventHandler(() => areaCoberta.faixasHorárias())
