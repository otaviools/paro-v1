import { areaCoberta } from '#shared/utils/area-coberta'

/** Faixas horárias da área coberta, em ordem (usadas na escolha da rotina). */
export default defineEventHandler((): RespostaDasFaixasHorarias => areaCoberta.faixasHorarias())
