import { areaCoberta } from '../area-coberta'

/** Ruas cobertas, da mais perto à mais longe do destino (escolha da rua no registro manual). */
export default defineEventHandler(() =>
  areaCoberta.ruasCobertas()
    .map(rua => ({ id: rua.id, nome: rua.nome, distanciaAoDestino: areaCoberta.distanciaAoDestino(rua.id) }))
    .sort((a, b) => a.distanciaAoDestino - b.distanciaAoDestino),
)
