import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { linkarAdrs } from './utils/linkar-adrs'

// Caminho a partir da raiz do repositório (a pasta acima de docs-site/).
const raiz = (caminho: string) => fileURLToPath(new URL(`../${caminho}`, import.meta.url))

// Páginas técnicas lidas de docs/ (content.config.ts). O arquivo fica como está;
// antes do parse, ganha caminho, ordem e título na barra lateral, e as menções a
// ADR viram links para o GitHub. O título da página continua o # do arquivo.
const PAGINAS_TECNICAS: Record<string, { path: string, stem: string, navegacao: string, icone: string }> = {
  'modulos.md': { path: '/tecnico/arquitetura-e-modulos', stem: '3.tecnico/1.arquitetura-e-modulos', navegacao: 'Arquitetura e módulos', icone: 'i-lucide-boxes' },
  'design/design-system.md': { path: '/tecnico/design-system', stem: '3.tecnico/2.design-system', navegacao: 'Design system', icone: 'i-lucide-palette' }
}
const ARQUIVOS_DE_ADR = readdirSync(raiz('docs/adr')).filter(arquivo => /^\d{4}-.*\.md$/.test(arquivo))

function paginaTecnica(caminhoDoArquivo: string) {
  const relativo = caminhoDoArquivo.replaceAll('\\', '/').split('/docs/').pop() ?? ''
  const pagina = PAGINAS_TECNICAS[relativo]
  return pagina ? { ...pagina, origem: `docs/${relativo}` } : undefined
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/content'
  ],

  devtools: {
    enabled: false
  },

  // Troca de página como no app: a antiga sai na hora e a nova esmaece em 200 ms (movimento.css).
  app: {
    pageTransition: { name: 'pagina', duration: { enter: 200, leave: 0 } }
  },

  css: ['~/assets/css/main.css'],

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1
        }
      }
    },
    experimental: {
      sqliteConnector: 'native'
    }
  },

  // Porta 3200: a 3000 é do app e a 3100 do paro-preview-3100.
  devServer: {
    port: 3200
  },

  experimental: {
    asyncContext: true
  },

  compatibilityDate: '2026-06-30',

  // Prints, logotipo, grafismos e favicon vêm das pastas do app, sem cópia.
  // Na Vercel, o build precisa ler fora de docs-site/ (opção "Include files
  // outside the Root Directory", ligada por padrão).
  nitro: {
    publicAssets: [
      { dir: raiz('docs/imagens'), baseURL: '/imagens', maxAge: 60 * 60 * 24 },
      { dir: raiz('public/logo'), baseURL: '/logo', maxAge: 60 * 60 * 24 },
      { dir: raiz('public/grafismos'), baseURL: '/grafismos', maxAge: 60 * 60 * 24 }
    ],
    prerender: {
      routes: ['/'],
      crawlLinks: true
    }
  },

  hooks: {
    'content:file:beforeParse'({ file }) {
      if (!file.path.endsWith('.md')) return
      const pagina = paginaTecnica(file.path)
      if (!pagina) return
      // O # do arquivo vira o título da página; o resto do texto segue igual.
      const [primeira, ...resto] = file.body.split('\n')
      const titulo = primeira?.startsWith('# ') ? primeira.slice(2).trim() : pagina.navegacao
      const corpo = primeira?.startsWith('# ') ? resto.join('\n') : file.body
      file.body = [
        '---',
        `title: ${JSON.stringify(titulo)}`,
        `path: ${pagina.path}`,
        `stem: ${pagina.stem}`,
        `origem: ${JSON.stringify(pagina.origem)}`,
        'navigation:',
        `  title: ${JSON.stringify(pagina.navegacao)}`,
        `  icon: ${pagina.icone}`,
        '---',
        linkarAdrs(corpo, ARQUIVOS_DE_ADR)
      ].join('\n')
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  // A mesma fonte do app.
  fonts: {
    families: [{ name: 'Figtree', provider: 'google', weights: [400, 500, 600, 700] }]
  }
})
