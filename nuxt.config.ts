export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@vite-pwa/nuxt', '@pinia/nuxt'],
  devtools: { enabled: false },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Parô',
      meta: [
        { name: 'description', content: 'Chance de encontrar vaga nas ruas cobertas do entorno da ESAMC Uberlândia.' },
        { name: 'theme-color', content: '#F7F6F3', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#191919', media: '(prefers-color-scheme: dark)' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/icone.svg' }],
    },
  },
  css: ['~/assets/css/main.css'],

  // O tema segue o sistema por padrão (design system, "Tema escuro").
  colorMode: { preference: 'system', fallback: 'light' },
  compatibilityDate: '2026-11-01',

  nitro: {
    vercel: {
      config: {
        // Fechamento diário das noites anteriores (ADR 0021). O cron da
        // Vercel usa UTC: 3h30 UTC é 0h30 em Uberlândia (UTC-3), depois do fim
        // da área coberta às 23h. A rota exige o segredo CRON_SECRET.
        crons: [{ path: '/api/cron/fechar-noites', schedule: '30 3 * * *' }],
      },
    },
  },

  // Formatação pelo ESLint Stylistic, sem Prettier (ADR 0025).
  eslint: {
    config: {
      stylistic: { quotes: 'single', semi: false },
    },
  },

  // Fonte servida pelo próprio app, para funcionar offline no PWA.
  fonts: {
    families: [{ name: 'Figtree', provider: 'google', weights: [400, 500, 600, 700] }],
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Parô',
      short_name: 'Parô',
      description: 'Chance de encontrar vaga nas ruas cobertas do entorno da ESAMC Uberlândia.',
      lang: 'pt-BR',
      display: 'standalone',
      start_url: '/',
      background_color: '#F7F6F3',
      theme_color: '#F7F6F3',
      // PROVISÓRIO: ícone temporário até os arquivos do logotipo entrarem no repositório.
      icons: [
        { src: '/icone.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      // mjs é o worker do MapLibre; pmtiles e pbf são os tiles e as fontes dos
      // rótulos do Mapa da área. Ficam no precache para o mapa abrir offline
      // (ADR 0019). O Mapa da área lê o .pmtiles inteiro com um GET simples,
      // então o precache basta, sem Range requests.
      globPatterns: ['**/*.{js,mjs,css,html,svg,woff2,pmtiles,pbf}'],
    },
    devOptions: { enabled: false },
  },
})
