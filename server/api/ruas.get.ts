import { areaCoberta } from '../area-coberta'

/** Ruas cobertas, da mais perto à mais longe do destino (escolha da rua no registro manual). */
export default defineEventHandler(() =>
  areaCoberta.ruasCobertas()
    .map((rua) => ({ id: rua.id, nome: rua.nome, distânciaAoDestino: rua.distanciaAoDestinoMetros }))
    .sort((a, b) => a.distânciaAoDestino - b.distânciaAoDestino),
)
