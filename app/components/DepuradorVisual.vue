<!--
  Painel de ajustes visuais (só em desenvolvimento): F4 abre e fecha; Esc
  fecha. Mexe ao vivo nas variáveis do vidro Solid Glass (--vidro-*,
  --vidro-escolhido-* e --vidro-ativo-* do main.css) e no raio
  (--radius-paro-md e -lg), nos temas claro e escuro, para o vidro normal
  (cards, abas, botões de ícone e secundários), o escolhido (aba, chip e item
  de menu escolhidos) e o ativo (botão principal).

  Como funciona: os valores vivem aqui, por tema, e viram um <style> no
  <head> com o mesmo formato do main.css (:root e .dark), que vence o
  original por vir depois. Ficam guardados neste navegador (localStorage),
  para sobreviver a recargas. "Copiar" põe esse bloco na área de
  transferência, pronto para colar no main.css (ou no chat, para aplicar);
  "Restaurar" volta aos valores do main.css.

  Os VALORES_PADRAO abaixo precisam ser iguais aos do main.css.
-->
<script setup lang="ts">
type Tema = 'claro' | 'escuro'
type Variante = 'normal' | 'escolhido' | 'ativo'

/**
 * Camadas de uma variante. `sombraAlfa` é a sombra por baixo (o escolhido não
 * tem); no ativo, `contorno` é a linha de sombra da base.
 */
interface Camadas {
  fundo: string
  fundoAlfa: number
  luz: string
  luzAlfa: number
  contorno: string
  contornoAlfa: number
  sombraAlfa?: number
}

interface Ajustes {
  raio: number
  desfoque: number
  temas: Record<Tema, Record<Variante, Camadas>>
}

const VALORES_PADRAO: Ajustes = {
  raio: 16,
  desfoque: 26,
  temas: {
    claro: {
      normal: { fundo: '#F8F9FB', fundoAlfa: 0.6, luz: '#FFFFFF', luzAlfa: 0.9, contorno: '#3E4452', contornoAlfa: 0.1, sombraAlfa: 0.28 },
      escolhido: { fundo: '#1F6C9F', fundoAlfa: 0.1, luz: '#FFFFFF', luzAlfa: 0.85, contorno: '#1F6C9F', contornoAlfa: 0.18 },
      ativo: { fundo: '#1F6C9F', fundoAlfa: 0.9, luz: '#FFFFFF', luzAlfa: 0.3, contorno: '#000000', contornoAlfa: 0.4, sombraAlfa: 0.28 },
    },
    escuro: {
      normal: { fundo: '#303030', fundoAlfa: 0.46, luz: '#FFFFFF', luzAlfa: 0.16, contorno: '#FFFFFF', contornoAlfa: 0.06, sombraAlfa: 0.6 },
      escolhido: { fundo: '#A9D3F2', fundoAlfa: 0.12, luz: '#FFFFFF', luzAlfa: 0.22, contorno: '#A9D3F2', contornoAlfa: 0.14 },
      ativo: { fundo: '#A9D3F2', fundoAlfa: 0.9, luz: '#FFFFFF', luzAlfa: 1, contorno: '#000000', contornoAlfa: 0.22, sombraAlfa: 0.6 },
    },
  },
}

// Chave nova: os ajustes guardados do vidro em três camadas não servem mais.
const GUARDADO = 'paro:depurador-visual-solid-glass'

const copiaDe = (a: Ajustes): Ajustes => JSON.parse(JSON.stringify(a))

const ajustes = ref<Ajustes>(copiaDe(VALORES_PADRAO))
const aberto = ref(false)
const variante = ref<Variante>('normal')

const colorMode = useColorMode()
const tema = computed<Tema>(() => (colorMode.value === 'dark' ? 'escuro' : 'claro'))
const camadas = computed(() => ajustes.value.temas[tema.value][variante.value])

/** "#1C3446" → "28 52 70", o formato de cor das variáveis do vidro. */
function canais(hex: string) {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

const arredondar = (n: number) => Number(n.toFixed(2))

function variaveisDe(c: Camadas, prefixo: string) {
  return [
    `  ${prefixo}-fundo: ${canais(c.fundo)};`,
    `  ${prefixo}-fundo-alfa: ${arredondar(c.fundoAlfa)};`,
    `  ${prefixo}-luz: ${canais(c.luz)};`,
    `  ${prefixo}-luz-alfa: ${arredondar(c.luzAlfa)};`,
    `  ${prefixo}-contorno: ${canais(c.contorno)};`,
    `  ${prefixo}-contorno-alfa: ${arredondar(c.contornoAlfa)};`,
    ...(c.sombraAlfa === undefined ? [] : [`  ${prefixo}-sombra-alfa: ${arredondar(c.sombraAlfa)};`]),
  ]
}

/** O bloco de variáveis no formato do main.css: o que vale na tela e o que "Copiar" leva. */
const css = computed(() => {
  const a = ajustes.value
  return [
    '/* Ajustes visuais (F4): colar no main.css, no lugar das variáveis do vidro. */',
    ':root {',
    `  --radius-paro-md: ${a.raio}px;`,
    `  --radius-paro-lg: ${a.raio}px;`,
    `  --vidro-desfoque: ${a.desfoque}px;`,
    ...variaveisDe(a.temas.claro.normal, '--vidro'),
    ...variaveisDe(a.temas.claro.escolhido, '--vidro-escolhido'),
    ...variaveisDe(a.temas.claro.ativo, '--vidro-ativo'),
    '}',
    '',
    '.dark {',
    ...variaveisDe(a.temas.escuro.normal, '--vidro'),
    ...variaveisDe(a.temas.escuro.escolhido, '--vidro-escolhido'),
    ...variaveisDe(a.temas.escuro.ativo, '--vidro-ativo'),
    '}',
  ].join('\n')
})

let estilo: HTMLStyleElement | null = null

watch([css, ajustes], () => {
  if (!estilo) return
  estilo.textContent = css.value
  try {
    // Só guarda o que difere do main.css: sem ajuste, nada fica por cima de mudanças futuras nele.
    const valor = JSON.stringify(ajustes.value)
    if (valor === JSON.stringify(VALORES_PADRAO)) localStorage.removeItem(GUARDADO)
    else localStorage.setItem(GUARDADO, valor)
  }
  catch {
    // Sem localStorage: os ajustes valem só até recarregar.
  }
}, { deep: true })

function aoTeclar(evento: KeyboardEvent) {
  if (evento.key === 'F4') {
    evento.preventDefault()
    aberto.value = !aberto.value
  }
  else if (evento.key === 'Escape' && aberto.value) aberto.value = false
}

/**
 * Ajustes guardados por cima dos padrões, camada por camada: um valor que não
 * existia quando os ajustes foram guardados (ex.: a cor da luz) vem do padrão.
 */
function juntarComPadrao(guardado: Partial<Ajustes>): Ajustes {
  const padrao = copiaDe(VALORES_PADRAO)
  const temas = Object.fromEntries((['claro', 'escuro'] as const).map(t => [t, Object.fromEntries(
    (['normal', 'escolhido', 'ativo'] as const).map(v => [v, { ...padrao.temas[t][v], ...guardado.temas?.[t]?.[v] }]),
  )])) as Ajustes['temas']
  return { ...padrao, ...guardado, temas }
}

onMounted(() => {
  try {
    const guardado = localStorage.getItem(GUARDADO)
    if (guardado) ajustes.value = juntarComPadrao(JSON.parse(guardado))
  }
  catch {
    // Guardado inválido: fica com os valores do main.css.
  }
  estilo = document.createElement('style')
  estilo.id = 'depurador-visual'
  estilo.textContent = css.value
  document.head.append(estilo)
  window.addEventListener('keydown', aoTeclar)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', aoTeclar)
  estilo?.remove()
})

const { avisar } = useAvisoFlutuanteStore()

const codigoAberto = ref(false)

/** Plano B, para quando o navegador recusa a API de área de transferência. */
function copiarPelaSelecao(texto: string) {
  const campo = document.createElement('textarea')
  campo.value = texto
  campo.style.position = 'fixed'
  campo.style.opacity = '0'
  document.body.append(campo)
  campo.select()
  const copiou = document.execCommand('copy')
  campo.remove()
  return copiou
}

async function copiar() {
  try {
    await navigator.clipboard.writeText(css.value)
    avisar('Ajustes copiados. Cole no main.css ou no chat.')
    return
  }
  catch {
    // Sem permissão para a API: tenta pela seleção.
  }
  if (copiarPelaSelecao(css.value)) {
    avisar('Ajustes copiados. Cole no main.css ou no chat.')
    return
  }
  codigoAberto.value = true
  avisar('Não foi possível copiar sozinho. O código está em "Ver CSS": selecione e copie.')
}

function restaurar() {
  ajustes.value = copiaDe(VALORES_PADRAO)
  try {
    localStorage.removeItem(GUARDADO)
  }
  catch {
    // Nada guardado.
  }
}

function trocarTema() {
  colorMode.preference = tema.value === 'escuro' ? 'light' : 'dark'
}

/** Controles deslizantes das camadas: rótulo, chave, mínimo, máximo, passo e unidade. */
const CONTROLES: { rotulo: string, chave: 'fundoAlfa' | 'luzAlfa' | 'contornoAlfa' | 'sombraAlfa', min: number, max: number, passo: number, unidade: '%' | 'px' | 'alfa' }[] = [
  { rotulo: 'Fundo: opacidade', chave: 'fundoAlfa', min: 0, max: 1, passo: 0.01, unidade: 'alfa' },
  { rotulo: 'Linha de luz no topo', chave: 'luzAlfa', min: 0, max: 1, passo: 0.01, unidade: 'alfa' },
  { rotulo: 'Contorno: opacidade', chave: 'contornoAlfa', min: 0, max: 1, passo: 0.01, unidade: 'alfa' },
  { rotulo: 'Sombra por baixo', chave: 'sombraAlfa', min: 0, max: 1, passo: 0.01, unidade: 'alfa' },
]

function mostrar(valor: number, unidade: '%' | 'px' | 'alfa') {
  if (unidade === 'alfa') return `${Math.round(valor * 100)}%`
  return `${arredondar(valor)}${unidade}`
}
</script>

<template>
  <aside
    v-if="aberto"
    class="fixed top-4 right-4 z-[100] flex max-h-[calc(100dvh-2rem)] w-80 flex-col overflow-hidden rounded-xl bg-default text-default shadow-2xl ring-1 ring-default"
    aria-label="Ajustes visuais"
  >
    <header class="flex items-center justify-between gap-2 border-b border-default px-4 py-3">
      <h2 class="text-sm font-semibold">
        Ajustes visuais <span class="font-normal text-muted">(F4)</span>
      </h2>
      <div class="flex gap-1">
        <button
          type="button"
          class="grid size-8 place-items-center rounded-md hover:bg-elevated"
          :aria-label="tema === 'escuro' ? 'Editar o tema claro' : 'Editar o tema escuro'"
          @click="trocarTema"
        >
          <UIcon
            :name="tema === 'escuro' ? 'i-lucide-moon' : 'i-lucide-sun'"
            class="size-4"
          />
        </button>
        <button
          type="button"
          class="grid size-8 place-items-center rounded-md hover:bg-elevated"
          aria-label="Fechar"
          @click="aberto = false"
        >
          <UIcon
            name="i-lucide-x"
            class="size-4"
          />
        </button>
      </div>
    </header>

    <div class="grid gap-4 overflow-y-auto px-4 py-4 text-xs">
      <p class="text-muted">
        Editando o tema {{ tema }}. Os dois temas entram no "Copiar".
      </p>

      <!-- Valem para tudo, nos dois temas. -->
      <section class="grid gap-3">
        <label class="grid gap-1">
          <span class="flex justify-between"><span>Raio</span><span class="tabular-nums text-muted">{{ ajustes.raio }}px</span></span>
          <input
            v-model.number="ajustes.raio"
            type="range"
            min="0"
            max="32"
            step="1"
            class="accent-[var(--ui-primary)]"
          >
        </label>
        <label class="grid gap-1">
          <span class="flex justify-between"><span>Desfoque do fundo</span><span class="tabular-nums text-muted">{{ ajustes.desfoque }}px</span></span>
          <input
            v-model.number="ajustes.desfoque"
            type="range"
            min="0"
            max="40"
            step="1"
            class="accent-[var(--ui-primary)]"
          >
        </label>
      </section>

      <div
        class="grid grid-cols-3 gap-1 rounded-md bg-elevated p-1"
        role="tablist"
        aria-label="Variante do vidro"
      >
        <button
          v-for="v in (['normal', 'escolhido', 'ativo'] as const)"
          :key="v"
          type="button"
          role="tab"
          :aria-selected="variante === v"
          class="rounded px-2 py-1.5 font-medium"
          :class="variante === v ? 'bg-default shadow-sm' : 'text-muted'"
          @click="variante = v"
        >
          {{ v === 'normal' ? 'Normal' : v === 'escolhido' ? 'Escolhido' : 'Principal' }}
        </button>
      </div>

      <section class="grid gap-3">
        <div class="grid grid-cols-3 gap-3">
          <label class="grid gap-1">
            <span>Cor do fundo</span>
            <input
              v-model="camadas.fundo"
              type="color"
              class="h-8 w-full cursor-pointer rounded border border-default bg-transparent"
            >
          </label>
          <label class="grid gap-1">
            <span>Cor da luz</span>
            <input
              v-model="camadas.luz"
              type="color"
              class="h-8 w-full cursor-pointer rounded border border-default bg-transparent"
            >
          </label>
          <label class="grid gap-1">
            <span>{{ variante === 'ativo' ? 'Cor da base' : 'Contorno' }}</span>
            <input
              v-model="camadas.contorno"
              type="color"
              class="h-8 w-full cursor-pointer rounded border border-default bg-transparent"
            >
          </label>
        </div>

        <label
          v-for="controle in CONTROLES.filter(c => camadas[c.chave] !== undefined)"
          :key="controle.chave"
          class="grid gap-1"
        >
          <span class="flex justify-between">
            <span>{{ controle.rotulo }}</span>
            <span class="tabular-nums text-muted">{{ mostrar(camadas[controle.chave] ?? 0, controle.unidade) }}</span>
          </span>
          <input
            v-model.number="camadas[controle.chave]"
            type="range"
            :min="controle.min"
            :max="controle.max"
            :step="controle.passo"
            class="accent-[var(--ui-primary)]"
          >
        </label>
      </section>

      <!-- O mesmo bloco do "Copiar", para ver ou copiar à mão. -->
      <details
        :open="codigoAberto"
        @toggle="codigoAberto = ($event.target as HTMLDetailsElement).open"
      >
        <summary class="cursor-pointer font-medium text-muted">
          Ver CSS
        </summary>
        <textarea
          :value="css"
          readonly
          rows="10"
          class="mt-2 w-full resize-y rounded border border-default bg-elevated p-2 font-mono text-[11px] leading-snug"
          @focus="($event.target as HTMLTextAreaElement).select()"
        />
      </details>

      <!-- Amostras para comparar sem sair do lugar. -->
      <section
        class="grid grid-cols-3 gap-2"
        aria-label="Amostras"
      >
        <div class="vidro rounded-paro-md p-3 text-center font-medium">
          Normal
        </div>
        <div class="vidro-escolhido rounded-paro-md p-3 text-center font-medium">
          Escolhido
        </div>
        <div class="vidro-ativo rounded-paro-md p-3 text-center font-medium">
          Ativo
        </div>
      </section>
    </div>

    <footer class="grid grid-cols-2 gap-2 border-t border-default px-4 py-3">
      <button
        type="button"
        class="rounded-md px-3 py-2 text-xs font-semibold text-muted hover:bg-elevated hover:text-default"
        @click="restaurar"
      >
        Restaurar
      </button>
      <button
        type="button"
        class="rounded-md bg-inverted px-3 py-2 text-xs font-semibold text-inverted hover:opacity-90"
        @click="copiar"
      >
        Copiar ajustes
      </button>
    </footer>
  </aside>
</template>
