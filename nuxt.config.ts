export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@vite-pwa/nuxt', '@pinia/nuxt'],
  devtools: { enabled: false },

  app: {
    // Troca de tela: a antiga fica até a nova estar pronta; a nova aparece em
    // 200 ms, só com opacidade (classes .pagina-* no main.css). Sem fase de
    // saída, não sobra tela vazia enquanto a nova carrega. Com movimento
    // reduzido, troca na hora.
    // A entrada dura 700 ms: no celular, a cascata dos blocos (main.css) vai
    // até 640 ms e precisa das classes de entrada até o fim.
    pageTransition: { name: 'pagina', duration: { enter: 700, leave: 0 } },
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      // viewport-fit=cover: a página desenha também atrás das barras do Safari
      // no iPhone; o fundo azul (body::before no main.css) preenche essa área.
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      title: 'Parô',
      meta: [
        { name: 'description', content: 'Chance de encontrar vaga nas ruas cobertas do entorno da ESAMC Uberlândia.' },
        // theme-color: no app.vue, seguindo o tema escolhido no app.
        // Adicionado à tela de início, abre como app (sem a interface do Safari),
        // mesmo sem o manifesto do PWA, que fica desligado no servidor de
        // desenvolvimento. A barra de status fica transparente, com a página
        // por baixo (o app.vue reserva a área segura em cima).
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'Parô' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon-producao.svg' },
        // Ícone da tela de início do iPhone: o iOS não usa SVG. PNG de 180 px,
        // feito do favicon-producao.svg com o quadrado cheio (o iOS arredonda).
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
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
      // Ícone do app: o mesmo do favicon (símbolo ô sobre quadrado escuro arredondado).
      icons: [
        { src: '/favicon-producao.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
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
