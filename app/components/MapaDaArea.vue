<!--
  Mapa da área (docs/modulos.md, módulo 8): desenha as ruas cobertas sobre o
  mapa de ruas real, cada trecho com o padrão e o rótulo da sua faixa de
  chance (ADR 0006), e avisa quando o motorista toca num trecho. Para Voltar
  até o carro, mostra o ponto do carro, a posição atual e uma etiqueta sobre
  o mapa, sem rota (ADR 0020).

  Esconde o MapLibre GL (ADR 0017), os tiles próprios em PMTiles (ADR 0019),
  as imagens dos padrões e o tema escuro. Nenhuma outra parte do app importa
  o MapLibre. Os tiles, as fontes dos rótulos e o estilo são todos locais:
  nenhum pedido sai para um provedor de tiles.
-->
<script lang="ts">
import type {
  ExpressionSpecification,
  FilterSpecification,
  GeoJSONSource,
  Map as MapaMapLibre,
  Marker,
  StyleSpecification,
} from 'maplibre-gl'
import type { Feature, FeatureCollection } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'
import urlDoWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { FileSource, PMTiles, Protocol } from 'pmtiles'
import type { EstadoDaChance } from '~/components/AmostraDeFaixaDeChance.vue'

export interface Ponto {
  lat: number
  lon: number
}

/** Rua coberta no mapa: a linha do trecho e o estado na faixa horária mostrada. */
export interface RuaNoMapa {
  id: string
  nome: string
  estado: EstadoDaChance
  linha: Ponto[]
}

/**
 * Recorte do OpenStreetMap publicado com o app (ADR 0019), regerado a cada
 * semestre com a CLI oficial do Protomaps (github.com/protomaps/go-pmtiles),
 * a partir do build diário do Protomaps (AAAAMMDD é a data do build):
 *
 *   pmtiles extract https://build.protomaps.com/AAAAMMDD.pmtiles
 *     public/mapa/uberlandia-centro.pmtiles
 *     --bbox=-48.292,-18.930,-48.258,-18.898 --maxzoom=15
 *
 * O bbox é o de LIMITES_DOS_TILES. Confira o tamanho antes com --dry-run.
 */
const ARQUIVO_DE_TILES = '/mapa/uberlandia-centro.pmtiles'
/** Limites do arquivo de tiles (oeste, sul, leste, norte): o mapa não sai deles. */
const LIMITES_DOS_TILES: [number, number, number, number] = [-48.292, -18.930, -48.258, -18.898]

/** Largura do trecho no mapa, em px: as imagens dos padrões têm esta altura. */
const LARGURA_DO_TRECHO = 12

/** Nome da imagem do padrão de cada faixa de chance no MapLibre. */
const IMAGEM_DO_PADRAO: Record<EstadoDaChance, string> = {
  'Tranquilo': 'padrao-solido',
  'Apertado': 'padrao-hachura',
  'Difícil': 'padrao-pontilhado',
  'Sem dado': 'padrao-tracejado',
}
const ESTADOS = Object.keys(IMAGEM_DO_PADRAO) as EstadoDaChance[]

// --- Tiles em PMTiles ---------------------------------------------------

// O arquivo inteiro (cerca de 1 MB) é lido uma vez por sessão com um GET
// simples e servido da memória: o PWA o guarda no precache e o mapa abre
// offline, sem depender de Range requests no service worker. O protocolo
// e o arquivo valem para todas as montagens do componente.
let tiles: Promise<PMTiles> | null = null

function carregarTiles(maplibre: typeof import('maplibre-gl')): Promise<PMTiles> {
  tiles ??= fetch(ARQUIVO_DE_TILES)
    .then((resposta) => {
      if (!resposta.ok) throw new Error(`Não foi possível ler ${ARQUIVO_DE_TILES}`)
      return resposta.blob()
    })
    .then((blob) => {
      const arquivo = new PMTiles(new FileSource(new File([blob], 'uberlandia-centro.pmtiles')))
      const protocolo = new Protocol()
      protocolo.add(arquivo)
      maplibre.setWorkerUrl(urlDoWorker)
      maplibre.addProtocol('pmtiles', protocolo.tile)
      return arquivo
    })
  tiles.catch(() => {
    tiles = null
  })
  return tiles
}
</script>

<script setup lang="ts">
const props = defineProps<{
  ruas: RuaNoMapa[]
  /** Ponto do carro, guardado só no celular no registro com localização ligada. */
  pontoDoCarro?: Ponto | null
  /** Posição atual, lida uma vez em Voltar até o carro (ADR 0010). */
  posicaoAtual?: Ponto | null
  /** Texto da etiqueta sobre o mapa, acima do ponto do carro (a distância). */
  etiquetaDoCarro?: string | null
}>()

const emit = defineEmits<{ 'selecionar-rua': [id: string] }>()

const recipiente = ref<HTMLDivElement>()
const sonda = ref<HTMLDivElement>()
let mapa: MapaMapLibre | null = null
let maplibreGl: typeof import('maplibre-gl') | null = null

// --- Cores do tema -------------------------------------------------------

/**
 * Cores lidas do CSS; mudam com o tema claro ou escuro. As do mapa ficam em
 * --paro-mapa-* (o Nuxt UI não tem variável de mapa); o texto, a superfície e
 * a borda vêm das variáveis do Nuxt UI (ADR 0027).
 */
function coresDoTema() {
  const estilo = getComputedStyle(recipiente.value ?? document.documentElement)
  const variavel = (nome: string) => estilo.getPropertyValue(`--${nome}`).trim()
  return {
    fundo: variavel('paro-mapa-fundo'),
    quadra: variavel('paro-mapa-quadra'),
    parque: variavel('paro-mapa-parque'),
    via: variavel('paro-mapa-via'),
    meioFio: variavel('paro-mapa-meio-fio'),
    rotulo: variavel('ui-text-muted'),
    texto: variavel('ui-text'),
    superficie: variavel('ui-bg-elevated'),
    borda: variavel('ui-border'),
  }
}

type Cores = ReturnType<typeof coresDoTema>

// --- Imagens dos padrões (design system, "Faixas de chance") -------------

/** Desenha num canvas, na densidade da tela, e devolve a imagem para o MapLibre. */
function desenhar(largura: number, altura: number, pintar: (ctx: CanvasRenderingContext2D) => void) {
  const densidade = Math.max(1, Math.round(window.devicePixelRatio || 1))
  const canvas = document.createElement('canvas')
  canvas.width = largura * densidade
  canvas.height = altura * densidade
  const ctx = canvas.getContext('2d')!
  ctx.scale(densidade, densidade)
  pintar(ctx)
  return { imagem: ctx.getImageData(0, 0, canvas.width, canvas.height), densidade }
}

/**
 * Padrão de linha de cada faixa de chance, na cor do texto. O MapLibre repete
 * a imagem ao longo do trecho; a altura dela é a largura do trecho.
 */
function padrao(estado: EstadoDaChance, cor: string) {
  const altura = LARGURA_DO_TRECHO
  switch (estado) {
    // Sólido. A imagem tem 8 px de comprimento: com 1 px, o MapLibre mistura
    // a borda do atlas e o trecho fica listrado.
    case 'Tranquilo':
      return desenhar(8, altura, (ctx) => {
        ctx.fillStyle = cor
        ctx.fillRect(0, 0, 8, altura)
      })
    // Hachura diagonal: traço de 1,2 px a 45°, a cada 3,5 px. Na horizontal,
    // o período é 3,5 × √2 ≈ 5 px, o que deixa a imagem sem emenda.
    case 'Apertado':
      return desenhar(5, altura, (ctx) => {
        ctx.strokeStyle = cor
        ctx.lineWidth = 1.2
        for (let x = -altura; x <= 5 + altura; x += 5) {
          ctx.beginPath()
          ctx.moveTo(x, altura)
          ctx.lineTo(x + altura, 0)
          ctx.stroke()
        }
      })
    // Pontilhado: pontos de 1,6 px a cada 4 px.
    case 'Difícil':
      return desenhar(4, altura, (ctx) => {
        ctx.fillStyle = cor
        for (let y = 2; y < altura; y += 4) {
          ctx.beginPath()
          ctx.arc(2, y, 0.8, 0, Math.PI * 2)
          ctx.fill()
        }
      })
    // Contorno tracejado de 1,5 px: 4 px de traço e 3 px de intervalo nas duas bordas.
    case 'Sem dado':
      return desenhar(7, altura, (ctx) => {
        ctx.fillStyle = cor
        ctx.fillRect(0, 0, 4, 1.5)
        ctx.fillRect(0, altura - 1.5, 4, 1.5)
      })
  }
}

/**
 * Fundo esticável da etiqueta com o rótulo: pílula em bg-elevated com
 * borda. O MapLibre estica só o miolo (stretchX e stretchY), sem deformar as pontas.
 */
function etiqueta(cores: Cores) {
  const raio = 10
  const desenho = desenhar(raio * 2 + 2, raio * 2, (ctx) => {
    ctx.fillStyle = cores.superficie
    ctx.strokeStyle = cores.borda
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(0.5, 0.5, raio * 2 + 1, raio * 2 - 1, raio - 0.5)
    ctx.fill()
    ctx.stroke()
  })
  const px = (valor: number) => valor * desenho.densidade
  const esticar: { stretchX: [number, number][], stretchY: [number, number][] } = {
    stretchX: [[px(raio), px(raio + 2)]],
    stretchY: [[px(raio - 1), px(raio + 1)]],
  }
  return { ...desenho, esticar }
}

/** Cria ou troca as imagens dos padrões e da etiqueta com as cores do tema. */
function aplicarImagens(m: MapaMapLibre, cores: Cores) {
  const colocar = (nome: string, { imagem, densidade }: ReturnType<typeof desenhar>, extra = {}) => {
    if (m.hasImage(nome)) m.updateImage(nome, imagem)
    else m.addImage(nome, imagem, { pixelRatio: densidade, ...extra })
  }
  for (const estado of ESTADOS) colocar(IMAGEM_DO_PADRAO[estado], padrao(estado, cores.texto))
  const fundoDaEtiqueta = etiqueta(cores)
  colocar('etiqueta', fundoDaEtiqueta, fundoDaEtiqueta.esticar)
}

// --- Estilo --------------------------------------------------------------

/** Linhas dos trechos e pontos das etiquetas, no meio de cada trecho. */
function dadosDosTrechos(ruas: RuaNoMapa[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: ruas.flatMap((rua) => {
      const coordenadas = rua.linha.map(p => [p.lon, p.lat])
      const propriedades = { id: rua.id, nome: rua.nome, estado: rua.estado, padrao: IMAGEM_DO_PADRAO[rua.estado] }
      return [
        { type: 'Feature', properties: propriedades, geometry: { type: 'LineString', coordinates: coordenadas } },
        { type: 'Feature', properties: propriedades, geometry: { type: 'Point', coordinates: meioDaLinha(coordenadas) } },
      ] satisfies Feature[]
    }),
  }
}

/** Ponto a meio caminho ao longo da linha. */
function meioDaLinha(coordenadas: number[][]): number[] {
  const trechos = coordenadas.slice(1).map((b, i) => {
    const a = coordenadas[i]!
    return { a, b, comprimento: Math.hypot(b[0]! - a[0]!, b[1]! - a[1]!) }
  })
  let restante = trechos.reduce((soma, t) => soma + t.comprimento, 0) / 2
  for (const { a, b, comprimento } of trechos) {
    if (restante <= comprimento) {
      const t = comprimento === 0 ? 0 : restante / comprimento
      return [a[0]! + (b[0]! - a[0]!) * t, a[1]! + (b[1]! - a[1]!) * t]
    }
    restante -= comprimento
  }
  return coordenadas[0] ?? [0, 0]
}

/** Largura das vias por zoom (pares zoom, px); o meio-fio soma 2 px. */
function largura(paradas: number[], meioFio = 0): ExpressionSpecification {
  const comMeioFio = paradas.map((v, i) => (i % 2 ? v + meioFio : v))
  return ['interpolate', ['exponential', 1.6], ['zoom'], ...comMeioFio] as ExpressionSpecification
}
/** Avenidas e vias principais. */
const LARGURA_PRINCIPAL = [12, 1, 15, 7, 18, 28]
/** Ruas locais. */
const LARGURA_LOCAL = [13, 0.5, 15, 4, 18, 18]
const larguraPrincipal = largura(LARGURA_PRINCIPAL)
const larguraLocal = largura(LARGURA_LOCAL)
const comMeioFio = (paradas: number[]) => largura(paradas, 2)
const daGeometria = (tipo: 'LineString' | 'Point'): FilterSpecification => ['==', ['geometry-type'], tipo]
const viasPrincipais: FilterSpecification = ['in', ['get', 'kind'], ['literal', ['highway', 'major_road']]]
const viasLocais: FilterSpecification = ['in', ['get', 'kind'], ['literal', ['minor_road', 'other']]]
const parques: FilterSpecification = ['in', ['get', 'kind'], ['literal', [
  'park', 'garden', 'grass', 'playground', 'recreation_ground', 'pitch', 'wood', 'forest', 'cemetery',
]]]

/** Cor de cada camada (camada, propriedade, token), no estilo e na troca de tema. */
const CORES_DAS_CAMADAS: [string, Parameters<MapaMapLibre['setPaintProperty']>[1], keyof Cores][] = [
  ['fundo', 'background-color', 'fundo'],
  ['parques', 'fill-color', 'parque'],
  ['agua', 'fill-color', 'parque'],
  ['quadras', 'fill-color', 'quadra'],
  ['meio-fio-locais', 'line-color', 'meioFio'],
  ['meio-fio-principais', 'line-color', 'meioFio'],
  ['vias-locais', 'line-color', 'via'],
  ['vias-principais', 'line-color', 'via'],
  ['nomes-de-rua', 'text-color', 'rotulo'],
  ['nomes-de-rua', 'text-halo-color', 'via'],
  ['trechos-fundo', 'line-color', 'via'],
  ['trechos-etiqueta', 'text-color', 'texto'],
]

/**
 * Tamanho dos textos do mapa, em px: o text-xs do Tailwind (12 px), para os
 * nomes de rua e para as etiquetas dos trechos (ADR 0027).
 */
const TAMANHO_DO_TEXTO = 12

/**
 * Estilo próprio sobre o esquema de camadas do Protomaps (ADR 0019), com os
 * cores --paro-mapa-*: fundo, quadras (edificações), parques, vias com meio-fio
 * e nomes de rua com halo na cor da via. Sem ícones de pontos de interesse.
 */
function estilo(urlDosTiles: string, cores: Cores): StyleSpecification {
  const especificacao: StyleSpecification = {
    version: 8,
    glyphs: `${window.location.origin}/mapa/fontes/{fontstack}/{range}.pbf`,
    sources: {
      base: {
        type: 'vector',
        url: urlDosTiles,
        attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
      trechos: { type: 'geojson', data: dadosDosTrechos(props.ruas) },
    },
    layers: [
      { id: 'fundo', type: 'background', paint: {} },
      { 'id': 'parques', 'type': 'fill', 'source': 'base', 'source-layer': 'landuse', 'filter': parques, 'paint': {} },
      { 'id': 'agua', 'type': 'fill', 'source': 'base', 'source-layer': 'water', 'paint': {} },
      { 'id': 'quadras', 'type': 'fill', 'source': 'base', 'source-layer': 'buildings', 'minzoom': 14, 'paint': {} },
      {
        'id': 'meio-fio-locais', 'type': 'line', 'source': 'base', 'source-layer': 'roads', 'filter': viasLocais,
        'layout': { 'line-join': 'round', 'line-cap': 'round' },
        'paint': { 'line-width': comMeioFio(LARGURA_LOCAL) },
      },
      {
        'id': 'meio-fio-principais', 'type': 'line', 'source': 'base', 'source-layer': 'roads', 'filter': viasPrincipais,
        'layout': { 'line-join': 'round', 'line-cap': 'round' },
        'paint': { 'line-width': comMeioFio(LARGURA_PRINCIPAL) },
      },
      {
        'id': 'vias-locais', 'type': 'line', 'source': 'base', 'source-layer': 'roads', 'filter': viasLocais,
        'layout': { 'line-join': 'round', 'line-cap': 'round' },
        'paint': { 'line-width': larguraLocal },
      },
      {
        'id': 'vias-principais', 'type': 'line', 'source': 'base', 'source-layer': 'roads', 'filter': viasPrincipais,
        'layout': { 'line-join': 'round', 'line-cap': 'round' },
        'paint': { 'line-width': larguraPrincipal },
      },
      {
        'id': 'nomes-de-rua', 'type': 'symbol', 'source': 'base', 'source-layer': 'roads', 'minzoom': 14,
        'filter': ['all', ['has', 'name'], ['!=', ['get', 'kind'], 'path']],
        'layout': {
          'symbol-placement': 'line',
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': TAMANHO_DO_TEXTO,
          'text-max-angle': 30,
        },
        'paint': { 'text-halo-width': 1.5 },
      },
      // Ruas cobertas por cima, com o padrão da faixa de chance na cor do texto.
      {
        id: 'trechos-fundo', type: 'line', source: 'trechos', filter: daGeometria('LineString'),
        layout: { 'line-cap': 'butt', 'line-join': 'round' },
        paint: { 'line-width': LARGURA_DO_TRECHO + 4 },
      },
      {
        id: 'trechos', type: 'line', source: 'trechos', filter: daGeometria('LineString'),
        layout: { 'line-cap': 'butt', 'line-join': 'round' },
        paint: { 'line-pattern': ['get', 'padrao'], 'line-width': LARGURA_DO_TRECHO },
      },
      // Área de toque mais larga que o desenho (alvo de 44 px), invisível.
      {
        id: 'trechos-toque', type: 'line', source: 'trechos', filter: daGeometria('LineString'),
        paint: { 'line-color': cores.texto, 'line-opacity': 0, 'line-width': 44 },
      },
      // Etiqueta com o rótulo da faixa de chance, ao lado do meio do trecho.
      {
        id: 'trechos-etiqueta', type: 'symbol', source: 'trechos', filter: daGeometria('Point'),
        layout: {
          'text-field': ['get', 'estado'],
          'text-font': ['Noto Sans Medium'],
          'text-size': TAMANHO_DO_TEXTO,
          'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          'text-radial-offset': 1.4,
          'icon-image': 'etiqueta',
          'icon-text-fit': 'both',
          'icon-text-fit-padding': [3, 8, 3, 8],
          'text-padding': 4,
        },
        paint: {},
      },
    ],
  }
  // As cores entram pela tabela, a mesma da troca de tema.
  for (const [id, propriedade, token] of CORES_DAS_CAMADAS) {
    const camada = especificacao.layers.find(c => c.id === id)
    if (camada && 'paint' in camada) (camada.paint as Record<string, string>)[propriedade] = cores[token]
  }
  return especificacao
}

/** Repinta o mapa com as cores do tema atual. */
function aplicarTema(m: MapaMapLibre) {
  const cores = coresDoTema()
  aplicarImagens(m, cores)
  for (const [camada, propriedade, token] of CORES_DAS_CAMADAS) {
    m.setPaintProperty(camada, propriedade, cores[token])
  }
}

// --- Enquadramento -------------------------------------------------------

/**
 * Caixa do enquadramento: com o ponto do carro, ele e a posição atual; sem
 * ele, todos os trechos; sem nada, a área inteira dos tiles.
 */
function caixaDoEnquadramento(): [number, number, number, number] {
  const pontos = props.pontoDoCarro
    ? [props.pontoDoCarro, ...(props.posicaoAtual ? [props.posicaoAtual] : [])]
    : props.ruas.flatMap(r => r.linha)
  if (pontos.length === 0) return LIMITES_DOS_TILES
  const lons = pontos.map(p => p.lon)
  const lats = pontos.map(p => p.lat)
  return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)]
}

/** Folga em volta das ruas ao enquadrar, em px. */
const FOLGA = 48

/**
 * Margens do enquadramento: a folga mais o que a tela põe por cima do mapa
 * (abas, barra de abas, legenda), que ela informa em --mapa-margem-superior,
 * --mapa-margem-inferior e --mapa-margem-esquerda. A sonda tem essas
 * variáveis como padding, que o navegador já devolve em px.
 */
function margens() {
  const estilo = sonda.value ? getComputedStyle(sonda.value) : null
  const px = (lado: 'Top' | 'Bottom' | 'Left') => FOLGA + (estilo ? Number.parseFloat(estilo[`padding${lado}`]) || 0 : 0)
  return { top: px('Top'), bottom: px('Bottom'), left: px('Left'), right: FOLGA }
}

/** Enquadra as ruas cobertas, ou o ponto do carro e a posição atual. */
function centralizar() {
  mapa?.fitBounds(caixaDoEnquadramento(), { padding: margens(), maxZoom: 17, duration: mapa.loaded() ? 300 : 0 })
}

defineExpose({ centralizar })

/** Verdadeiro depois de enquadrar as ruas cobertas pela primeira vez. */
let enquadrado = false

/**
 * Leva as ruas para o mapa. Antes de o estilo carregar não há fonte; o
 * 'load' chama de novo. Enquadra as ruas na primeira vez que elas chegam.
 */
function atualizarTrechos() {
  const fonte = mapa?.getSource<GeoJSONSource>('trechos')
  if (!fonte) return
  fonte.setData(dadosDosTrechos(props.ruas))
  if (!enquadrado && props.ruas.length > 0) {
    enquadrado = true
    centralizar()
  }
}

// --- Ponto do carro e posição atual --------------------------------------

/** Elementos dos marcadores; o MapLibre os posiciona sobre o mapa. */
const elementoDoCarro = ref<HTMLDivElement>()
const elementoDaPosicao = ref<HTMLDivElement>()
const elementoDaEtiqueta = ref<HTMLDivElement>()
let marcadorDoCarro: Marker | null = null
let marcadorDaPosicao: Marker | null = null
let marcadorDaEtiqueta: Marker | null = null

/** Põe, move ou tira um marcador conforme o ponto. */
function posicionar(
  marcador: Marker | null,
  ponto: Ponto | null | undefined,
  elemento: HTMLElement | undefined,
  ancora: 'center' | 'bottom',
): Marker | null {
  if (!mapa || !maplibreGl || !elemento || !ponto) {
    marcador?.remove()
    return null
  }
  marcador ??= new maplibreGl.Marker({ element: elemento, anchor: ancora })
  return marcador.setLngLat([ponto.lon, ponto.lat]).addTo(mapa)
}

function atualizarMarcadores() {
  marcadorDaPosicao = posicionar(marcadorDaPosicao, props.posicaoAtual, elementoDaPosicao.value, 'center')
  marcadorDoCarro = posicionar(marcadorDoCarro, props.pontoDoCarro, elementoDoCarro.value, 'center')
  const pontoDaEtiqueta = props.etiquetaDoCarro ? props.pontoDoCarro : null
  marcadorDaEtiqueta = posicionar(marcadorDaEtiqueta, pontoDaEtiqueta, elementoDaEtiqueta.value, 'bottom')
}

// --- Ciclo de vida -------------------------------------------------------

const falhou = ref(false)
const colorMode = useColorMode()

onMounted(async () => {
  try {
    const maplibre = await import('maplibre-gl')
    const arquivo = await carregarTiles(maplibre)
    if (!recipiente.value) return
    maplibreGl = maplibre

    const m = new maplibre.Map({
      container: recipiente.value,
      style: estilo(`pmtiles://${arquivo.source.getKey()}`, coresDoTema()),
      bounds: caixaDoEnquadramento(),
      fitBoundsOptions: { padding: margens(), maxZoom: 17 },
      maxBounds: LIMITES_DOS_TILES,
      minZoom: 13,
      maxZoom: 19,
      pitchWithRotate: false,
      dragRotate: false,
      // Créditos no canto esquerdo: o direito fica para os botões do mapa.
      attributionControl: false,
    })
    m.addControl(new maplibre.AttributionControl({ compact: true }), 'bottom-left')
    m.touchZoomRotate.disableRotation()
    mapa = m
    enquadrado = props.ruas.length > 0

    // As imagens dos padrões e da etiqueta entram antes de o estilo pedi-las.
    aplicarImagens(m, coresDoTema())
    m.on('styleimagemissing', (evento) => {
      if (!m.hasImage(evento.id)) aplicarImagens(m, coresDoTema())
    })
    m.once('load', () => {
      aplicarTema(m)
      atualizarTrechos()
    })
    atualizarMarcadores()

    // Tocar num trecho (ou na etiqueta dele) seleciona a rua coberta.
    m.on('click', (evento) => {
      const { x, y } = evento.point
      const [rua] = m.queryRenderedFeatures([[x - 8, y - 8], [x + 8, y + 8]], {
        layers: ['trechos-toque', 'trechos-etiqueta'],
      })
      const id = rua?.properties?.id
      if (typeof id === 'string') emit('selecionar-rua', id)
    })
    for (const camada of ['trechos-toque', 'trechos-etiqueta']) {
      m.on('mouseenter', camada, () => {
        m.getCanvas().style.cursor = 'pointer'
      })
      m.on('mouseleave', camada, () => {
        m.getCanvas().style.cursor = ''
      })
    }
  }
  catch (erro) {
    console.error(erro)
    falhou.value = true
  }
})

watch(() => props.ruas, atualizarTrechos, { deep: true })

// O carro ou a posição mudaram: move os marcadores e enquadra de novo.
watch(() => [props.pontoDoCarro, props.posicaoAtual], () => {
  atualizarMarcadores()
  centralizar()
}, { deep: true })
watch(() => props.etiquetaDoCarro, atualizarMarcadores)

// O tema troca a classe .dark no <html>; as cores são lidas depois da troca.
watch(() => colorMode.value, () => {
  requestAnimationFrame(() => {
    if (mapa?.isStyleLoaded()) aplicarTema(mapa)
  })
}, { flush: 'post' })

onBeforeUnmount(() => {
  for (const marcador of [marcadorDoCarro, marcadorDaPosicao, marcadorDaEtiqueta]) marcador?.remove()
  mapa?.remove()
  mapa = null
})
</script>

<template>
  <!--
    Feito à mão (ADR 0028): o MapLibre desenha o mapa no recipiente. As
    classes com [&_.maplibregl-...] ajustam os créditos do MapLibre: acima do
    que flutua no rodapé (--mapa-margem-inferior), em text-xs e bg-elevated.
    Levam ! porque o CSS do MapLibre fica fora das camadas do Tailwind.
    Quem usa posiciona a raiz (por exemplo, absolute inset-0) e informa o
    que fica por cima do mapa em --mapa-margem-superior,
    --mapa-margem-inferior e --mapa-margem-esquerda.
  -->
  <div
    class="overflow-hidden bg-muted [&_.maplibregl-ctrl-attrib]:bg-elevated! [&_.maplibregl-ctrl-attrib]:font-sans! [&_.maplibregl-ctrl-attrib]:text-xs! [&_.maplibregl-ctrl-attrib]:text-muted! [&_.maplibregl-ctrl-attrib_a]:text-primary! [&_.maplibregl-ctrl-bottom-left]:bottom-(--mapa-margem-inferior,0)! [&_.maplibregl-ctrl-bottom-right]:bottom-(--mapa-margem-inferior,0)!"
  >
    <div
      ref="recipiente"
      class="size-full"
      role="region"
      aria-label="Mapa das ruas cobertas"
    />
    <!-- A sonda tem as margens como padding, que o navegador já devolve em px. -->
    <div
      ref="sonda"
      class="invisible absolute pt-(--mapa-margem-superior,0) pb-(--mapa-margem-inferior,0) pl-(--mapa-margem-esquerda,0)"
      aria-hidden="true"
    />
    <!-- Marcadores: ficam aqui, escondidos, até o MapLibre levá-los para o mapa. -->
    <div class="hidden">
      <!-- Ponto do carro: ícone do carro em bg-inverted, com contorno bg-default. -->
      <div
        ref="elementoDoCarro"
        class="grid size-8 place-items-center rounded-paro-md border-2 border-bg bg-inverted text-inverted"
        role="img"
        aria-label="Ponto do carro"
      >
        <UIcon
          name="i-lucide-car"
          class="size-4"
          aria-hidden="true"
        />
      </div>
      <!-- Posição atual: ponto em text-primary, com contorno bg-default. -->
      <div
        ref="elementoDaPosicao"
        class="size-5 rounded-full border-4 border-bg bg-primary"
        role="img"
        aria-label="Sua posição atual"
      />
      <!--
        Etiqueta sobre o mapa (design system, "Gavetas, avisos flutuantes e
        carregamento"), acima do ponto do carro, com folga para o ícone dele.
      -->
      <div
        ref="elementoDaEtiqueta"
        class="pointer-events-none pb-6"
      >
        <span class="flex items-center gap-1 whitespace-nowrap rounded-full border border-default bg-elevated px-2 py-1 font-sans text-xs font-semibold tabular-nums text-default">
          <UIcon
            name="i-lucide-footprints"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          {{ etiquetaDoCarro }}
        </span>
      </div>
    </div>
    <p
      v-if="falhou"
      class="absolute inset-x-5 top-1/2 -translate-y-1/2 rounded-paro-md border border-default bg-elevated p-4 text-sm lg:inset-x-8"
    >
      Não foi possível abrir o mapa. A lista das ruas cobertas continua disponível.
    </p>
  </div>
</template>
