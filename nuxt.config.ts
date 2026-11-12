export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  modules: ['@nuxt/ui', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
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

  // O tema segue o sistema por padrão (design system, "Tema escuro").
  colorMode: { preference: 'system', fallback: 'light' },

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
      globPatterns: ['**/*.{js,css,html,svg,woff2}'],
    },
    devOptions: { enabled: false },
  },
})
