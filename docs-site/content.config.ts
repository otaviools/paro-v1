import { fileURLToPath } from 'node:url'
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

// docs/ na raiz do repositório: as páginas técnicas leem os arquivos de lá, sem cópia.
const docsDoRepositorio = fileURLToPath(new URL('../docs', import.meta.url))

export default defineContentConfig({
  collections: {
    landing: defineCollection({
      type: 'page',
      source: 'index.md'
    }),
    docs: defineCollection({
      type: 'page',
      source: [
        {
          include: '**',
          exclude: ['index.md']
        },
        {
          // O caminho e o título na barra lateral de cada arquivo ficam em
          // PAGINAS_TECNICAS (nuxt.config.ts), aplicados antes do parse.
          cwd: docsDoRepositorio,
          include: '{modulos.md,design/design-system.md}',
          prefix: '/tecnico'
        }
      ],
      schema: z.object({
        // Arquivo de origem no repositório, para o link "Editar esta página"
        // das páginas lidas de docs/.
        origem: z.string().optional(),
        links: z.array(z.object({
          label: z.string(),
          icon: z.string(),
          to: z.string(),
          target: z.string().optional()
        })).optional()
      })
    })
  }
})
