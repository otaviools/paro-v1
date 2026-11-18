<!--
  Painel de ajustes visuais (só em desenvolvimento): F4 abre e fecha; Esc
  fecha. Mexe ao vivo nas variáveis do vidro em três camadas (--vidro-* e
  --vidro-ativo-* do main.css) e no raio (--radius-paro-md e -lg), nos temas
  claro e escuro, para o vidro normal (cards, abas, botões de ícone e
  secundários) e o ativo (item escolhido e botão principal).

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
type Variante = 'normal' | 'ativo'

interface Camadas {
  brilho: number
  brilhoX: number
  brilhoY: number
  fundo: string
  fundoAlfa: number
  borda: string
  bordaAlfa: number
  sombraAltura: number
  sombraAlfa: number
}

interface Ajustes {
  raio: number
  desfoque: number
  temas: Record<Tema, Record<Variante, Camadas>>
}

const VALORES_PADRAO: Ajustes = {
  raio: 16,
  desfoque: 20,
  temas: {
    claro: {
      normal: { brilho: 0, brilhoX: 24, brilhoY: 10, fundo: '#E6E6E6', fundoAlfa: 0.19, borda: '#00AAFF', bordaAlfa: 0, sombraAltura: 3, sombraAlfa: 0.03 },
      ativo: { brilho: 0.44, brilhoX: 80, brilhoY: 10, fundo: '#1380CD', fundoAlfa: 0.24, borda: '#66C2FF', bordaAlfa: 0, sombraAltura: 0, sombraAlfa: 0.3 },
    },
    escuro: {
      normal: { brilho: 0.15, brilhoX: 13.75, brilhoY: 10, fundo: '#1C3446', fundoAlfa: 0.18, borda: '#A9D3F2', bordaAlfa: 0, sombraAltura: 3, sombraAlfa: 0.6 },
      ativo: { brilho: 0.43, brilhoX: 80, brilhoY: 10, fundo: '#85CCFF', fundoAlfa: 0.24, borda: '#ADDDFF', bordaAlfa: 0, sombraAltura: 0, sombraAlfa: 0.3 },
    },
  },
}

const GUARDADO = 'paro:depurador-visual'

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
    `  ${prefixo}-brilho: ${arredondar(c.brilho)};`,
    `  ${prefixo}-brilho-x: ${arredondar(c.brilhoX)}%;`,
    `  ${prefixo}-brilho-y: ${arredondar(c.brilhoY)}%;`,
    `  ${prefixo}-fundo: ${canais(c.fundo)};`,
    `  ${prefixo}-fundo-alfa: ${arredondar(c.fundoAlfa)};`,
    `  ${prefixo}-borda: ${canais(c.borda)};`,
    `  ${prefixo}-borda-alfa: ${arredondar(c.bordaAlfa)};`,
    `  ${prefixo}-sombra-altura: ${c.sombraAltura}px;`,
    `  ${prefixo}-sombra-alfa: ${arredondar(c.sombraAlfa)};`,
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
    ...variaveisDe(a.temas.claro.ativo, '--vidro-ativo'),
    '}',
    '',
    '.dark {',
    ...variaveisDe(a.temas.escuro.normal, '--vidro'),
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

onMounted(() => {
  try {
    const guardado = localStorage.getItem(GUARDADO)
    if (guardado) ajustes.value = { ...copiaDe(VALORES_PADRAO), ...JSON.parse(guardado) }
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
const CONTROLES: { rotulo: string, chave: keyof Camadas, min: number, max: number, passo: number, unidade: '%' | 'px' | 'alfa' }[] = [
  { rotulo: 'Brilho do canto', chave: 'brilho', min: 0, max: 1, passo: 0.01, unidade: 'alfa' },
  { rotulo: 'Brilho: posição X', chave: 'brilhoX', min: 0, max: 100, passo: 1, unidade: '%' },
  { rotulo: 'Brilho: posição Y', chave: 'brilhoY', min: 0, max: 100, passo: 1, unidade: '%' },
  { rotulo: 'Fundo: opacidade', chave: 'fundoAlfa', min: 0, max: 1, passo: 0.01, unidade: 'alfa' },
  { rotulo: 'Borda: opacidade', chave: 'bordaAlfa', min: 0, max: 1, passo: 0.01, unidade: 'alfa' },
  { rotulo: 'Sombra de baixo: altura', chave: 'sombraAltura', min: 0, max: 8, passo: 1, unidade: 'px' },
  { rotulo: 'Sombra de baixo: opacidade', chave: 'sombraAlfa', min: 0, max: 1, passo: 0.01, unidade: 'alfa' },
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
        class="grid grid-cols-2 gap-1 rounded-md bg-elevated p-1"
        role="tablist"
        aria-label="Variante do vidro"
      >
        <button
          v-for="v in (['normal', 'ativo'] as const)"
          :key="v"
          type="button"
          role="tab"
          :aria-selected="variante === v"
          class="rounded px-2 py-1.5 font-medium"
          :class="variante === v ? 'bg-default shadow-sm' : 'text-muted'"
          @click="variante = v"
        >
          {{ v === 'normal' ? 'Normal' : 'Ativo / principal' }}
        </button>
      </div>

      <section class="grid gap-3">
        <div class="grid grid-cols-2 gap-3">
          <label class="grid gap-1">
            <span>Cor do fundo</span>
            <input
              v-model="camadas.fundo"
              type="color"
              class="h-8 w-full cursor-pointer rounded border border-default bg-transparent"
            >
          </label>
          <label class="grid gap-1">
            <span>Cor da borda</span>
            <input
              v-model="camadas.borda"
              type="color"
              class="h-8 w-full cursor-pointer rounded border border-default bg-transparent"
            >
          </label>
        </div>

        <label
          v-for="controle in CONTROLES"
          :key="controle.chave"
          class="grid gap-1"
        >
          <span class="flex justify-between">
            <span>{{ controle.rotulo }}</span>
            <span class="tabular-nums text-muted">{{ mostrar(camadas[controle.chave] as number, controle.unidade) }}</span>
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
        class="grid grid-cols-2 gap-2"
        aria-label="Amostras"
      >
        <div class="vidro rounded-paro-md p-3 text-center font-medium">
          Normal
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
