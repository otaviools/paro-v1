/**
 * Link de "Como chegar" (ADR 0020): abre o app de navegação do celular com
 * o ponto da rua coberta (o meio do trecho, ADR 0024) como destino.
 *
 * - iPhone e iPad: Apple Maps, o app de navegação padrão do iOS.
 * - Android: URI `geo:`, que abre o app de navegação padrão (Google Maps,
 *   Waze...) ou a escolha entre eles.
 * - Outros (computador): Google Maps no navegador.
 */
export function linkDoComoChegar(ponto: { lat: number, lon: number }, userAgent: string) {
  const destino = `${ponto.lat},${ponto.lon}`
  if (/iPhone|iPad|iPod/.test(userAgent)) return `https://maps.apple.com/?daddr=${destino}`
  if (/Android/.test(userAgent)) return `geo:${destino}?q=${destino}`
  return `https://www.google.com/maps/dir/?api=1&destination=${destino}`
}
