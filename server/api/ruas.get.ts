import { areaCoberta } from '../area-coberta'

/** Ruas cobertas com a distância a pé até o destino. Só repassa para a Área coberta. */
export default defineEventHandler(() =>
  areaCoberta.ruasCobertas().map((rua) => ({
    id: rua.id,
    nome: rua.nome,
    distanciaAoDestinoMetros: areaCoberta.distânciaAoDestino(rua.id),
  })),
)
