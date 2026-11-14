/**
 * Área coberta do app para as rotas de `server/api`, pelo auto-import do
 * Nitro (ADR 0029). O módulo fica em `shared/utils/area-coberta/`, porque o
 * celular também usa `ruaMaisProxima` (ADR 0003); subpastas de `shared/utils/`
 * não têm auto-import.
 */
export { areaCoberta } from '#shared/utils/area-coberta'
