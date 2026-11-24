// Ajustes do Nuxt UI e do site. Os raios e o vidro seguem o app.config.ts do app:
// botões e avisos em rounded-paro-md, cards em rounded-paro-lg com vidro.
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'sky',
      neutral: 'stone'
    },
    tv: {
      twMergeConfig: {
        extend: {
          theme: {
            radius: ['paro-sm', 'paro-md', 'paro-lg']
          }
        }
      }
    },
    button: {
      slots: {
        base: 'rounded-paro-md font-semibold'
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'vidro-ativo text-(--vidro-ativo-texto)! hover:brightness-105 active:scale-[0.98]'
        },
        {
          color: 'neutral',
          variant: 'outline',
          class: 'vidro hover:brightness-105 active:scale-[0.98]'
        }
      ]
    },
    card: {
      slots: {
        root: 'rounded-paro-lg'
      },
      variants: {
        variant: {
          outline: {
            root: 'vidro'
          }
        }
      }
    },
    // Cartões: com spotlight (index.md), um brilho fraco no primary segue o cursor
    // por dentro do vidro e acende o contorno; no hover o cartão sobe 2 px. O hover:
    // do Tailwind 4 só vale onde há cursor. A camada bg-default/90 do spotlight sai,
    // porque taparia o vidro.
    pageCard: {
      slots: {
        root: 'rounded-paro-lg transition-[translate] duration-300 ease-out motion-safe:hover:-translate-y-0.5',
        spotlight: 'hidden'
      },
      compoundVariants: [{
        spotlight: true,
        class: {
          root: '[--spotlight-size:320px] [--spotlight-color:color-mix(in_oklab,var(--ui-primary)_22%,transparent)] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100'
        }
      }],
      variants: {
        variant: {
          outline: {
            root: 'vidro'
          }
        }
      }
    },
    alert: {
      slots: {
        root: 'rounded-paro-md'
      }
    },
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted'
      }
    }
  },
  seo: {
    siteName: 'Parô'
  },
  header: {
    title: '',
    to: '/',
    search: true,
    colorMode: true,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/otaviools/paro-v1',
      'target': '_blank',
      'aria-label': 'Repositório no GitHub'
    }]
  },
  footer: {
    credits: `Parô • ESAMC Uberlândia • © ${new Date().getFullYear()}`,
    colorMode: false,
    links: [{
      'icon': 'i-lucide-external-link',
      'to': 'https://paro-v1.vercel.app',
      'target': '_blank',
      'aria-label': 'Abrir o app'
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/otaviools/paro-v1',
      'target': '_blank',
      'aria-label': 'Repositório no GitHub'
    }]
  },
  toc: {
    title: 'Nesta página',
    bottom: {
      title: 'Links',
      edit: 'https://github.com/otaviools/paro-v1/edit/main/docs-site/content',
      links: [{
        icon: 'i-lucide-smartphone',
        label: 'Abrir o app',
        to: 'https://paro-v1.vercel.app',
        target: '_blank'
      }, {
        icon: 'i-simple-icons-github',
        label: 'Repositório',
        to: 'https://github.com/otaviools/paro-v1',
        target: '_blank'
      }]
    }
  }
})
