import type { Ponto } from '~/dados-do-celular'

export type LeituraDaLocalizacao
  = | { tipo: 'lida', ponto: Ponto }
  /** A pessoa não liberou a localização, ou o navegador não oferece. */
    | { tipo: 'negada' }
  /** A localização foi liberada, mas não deu para ler (sem sinal, tempo esgotado). */
    | { tipo: 'falhou' }

/**
 * Lê a posição do celular uma única vez, com o app aberto e só quando a
 * pessoa pede (ADR 0010). Nunca acompanha a posição: sem watchPosition.
 * O navegador pede a permissão na primeira leitura.
 */
export function lerLocalizacao(): Promise<LeituraDaLocalizacao> {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return Promise.resolve({ tipo: 'negada' })
  }
  return new Promise((resolver) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolver({ tipo: 'lida', ponto: { lat: coords.latitude, lon: coords.longitude } }),
      erro => resolver({ tipo: erro.code === erro.PERMISSION_DENIED ? 'negada' : 'falhou' }),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    )
  })
}

const RAIO_DA_TERRA_EM_METROS = 6_371_000

/** Distância em linha reta entre dois pontos, em metros (sem rota, ADR 0020). */
export function distanciaEmLinhaReta(a: Ponto, b: Ponto): number {
  const radianos = (graus: number) => (graus * Math.PI) / 180
  const dLat = radianos(b.lat - a.lat)
  const dLon = radianos(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radianos(a.lat)) * Math.cos(radianos(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * RAIO_DA_TERRA_EM_METROS * Math.asin(Math.min(1, Math.sqrt(h)))
}
