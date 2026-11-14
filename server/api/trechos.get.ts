import { areaCoberta } from '#shared/utils/area-coberta'

/**
 * Linha do trecho de cada rua coberta, para o Mapa da área desenhar (ADR 0024).
 * Só repassa a configuração da Área coberta; a chance vem do Panorama da noite.
 */
export default defineEventHandler((): RespostaDosTrechos =>
  areaCoberta.ruasCobertas().map(rua => ({ id: rua.id, linha: rua.trecho.linha })),
)
