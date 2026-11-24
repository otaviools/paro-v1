# Site de documentação do Parô: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site de documentação em `docs-site/`, a partir do Nuxt Docs Template, com a identidade do Parô, 10 páginas, busca, tema e página de entrada.

**Architecture:** Cópia enxuta do template oficial `nuxt-ui-templates/docs`. Uma coleção `docs` do Nuxt Content com duas fontes: `docs-site/content/` (páginas escritas) e `../docs` (só `modulos.md` e `design/design-system.md`). As imagens são servidas de `../docs/imagens` e `../public/logo` pelo Nitro, sem cópia. Um hook de parse transforma "ADR NNNN" em link do GitHub, só nos arquivos vindos de `../docs`.

**Tech Stack:** Nuxt 4, Nuxt UI 4, Nuxt Content 3, Tailwind 4, Vitest, npm (Node 24).

**Spec:** `docs/superpowers/specs/2026-11-23-site-de-documentacao-design.md`

## Global Constraints

- Todo texto do site e da interface em pt-BR; `<html lang="pt-BR">`; locale `pt_br` do Nuxt UI.
- Servidor de desenvolvimento na porta 3100, nunca na 3000. Não usar `.data/pglite`.
- Não ler nem citar o `.env`. Variáveis de ambiente documentadas pelo README e pelo `.env.example`, sem valores.
- Não mexer em `docs/apresentacao/`, nos arquivos de `docs/`, no app nem no `package.json` da raiz.
- Sem commit nem push até o usuário pedir. Branch: `docs/site-de-documentacao`.
- Termos do glossário (`CONTEXT.md`): rua coberta, faixa horária, chance, faixa de chance, observação, registro de vaga, saída prevista, motorista, colaborador. Evitar os termos marcados _Avoid_.
- Paleta Papel: fundo `#F7F6F3`/`#191919`, primary `#1F6C9F`/`#A9D3F2`; raios `--radius-paro-sm` 12 px, `--radius-paro-md` 16 px, `--radius-paro-lg` 16 px.

## Review Focus

1. Menções a ADR em lista ("ADRs 0003, 0004 e 0015", "ADRs 0001 a 0024"): cada número vira link próprio. Teste na Tarefa 3.
2. Menção a ADR dentro de código (`` `docs/adr/` ``) ou já dentro de um link: fica intacta. Teste na Tarefa 3.
3. Número de ADR que não existe em `docs/adr/`: fica como texto, sem link quebrado. Teste na Tarefa 3.
4. Print escura e clara: a troca de tema troca a imagem, sem mostrar as duas. Conferido por print na Tarefa 6.
5. Celular (375 px): barra lateral vira menu, janelas do macOS não estouram a largura. Conferido por print na Tarefa 6.

---

### Tarefa 1: Base do template em `docs-site/`

**Files:**
- Create: `docs-site/` a partir do template (sem `.git`, `.github`, `pnpm-*`, `renovate.json`, `LICENSE`, `server/mcp/`, `app/components/OgImage/`, `app/components/TemplateMenu.vue`, `content/2.essentials`, `content/3.ai`)
- Modify: `docs-site/package.json`, `docs-site/nuxt.config.ts`, `docs-site/app/app.vue`, `docs-site/app/pages/[...slug].vue`, `docs-site/app/components/AppHeader.vue`

**Interfaces:**
- Produces: `npm run dev` em `docs-site/` na porta 3100; coleção `docs`; layout `docs`.

- [ ] **Passo 1:** Copiar o template e remover os arquivos listados.
- [ ] **Passo 2:** Em `package.json`: nome `paro-docs`; tirar `nuxt-og-image`, `@takumi-rs/core`, `nuxt-llms`, `nuxt-agent-discovery`, `@nuxtjs/mcp-toolkit`, `zod` se não for usado, `packageManager`; script `dev`: `nuxt dev --port 3100`; acrescentar `test: vitest run` e `vitest` nas devDependencies.
- [ ] **Passo 3:** Em `nuxt.config.ts`: tirar os módulos removidos e as chaves `llms`, `mcp`, `ogImage`; `devServer.port: 3100`. Em `[...slug].vue`, tirar `defineOgImage`; em `AppHeader.vue`, tirar `TemplateMenu`.
- [ ] **Passo 4:** `npm install` em `docs-site/` (gera `package-lock.json`).
- [ ] **Passo 5:** `npm run dev` em segundo plano; abrir `http://localhost:3100/getting-started`. Esperado: página do template carregando, sem erro no console nem no log.

### Tarefa 2: Identidade do Parô

**Files:**
- Create: `docs-site/app/assets/css/paro.css`
- Modify: `docs-site/app/assets/css/main.css`, `docs-site/app/app.config.ts`, `docs-site/app/app.vue`, `docs-site/nuxt.config.ts`, `docs-site/app/components/AppFooter.vue`

**Interfaces:**
- Produces: classes `vidro`, `vidro-ativo`, `rounded-paro-sm|md|lg`; imagens em `/imagens/<arquivo>` e `/logo/<arquivo>`; favicon em `/favicon.svg`.

- [ ] **Passo 1:** `paro.css`: comentário de origem (`app/assets/css/main.css` do app); copiar `@theme` dos três raios, variáveis `--ui-*` de `:root` e `.dark`, variáveis e classes do vidro. Nada de `--paro-*`, mapa, cursor ou regra de campo. `main.css` importa `paro.css` depois de `@nuxt/ui` e tira o verde e a fonte Public Sans (usar a mesma fonte do app).
- [ ] **Passo 2:** `nuxt.config.ts`: `nitro.publicAssets` com `{ dir: '../../docs/imagens', baseURL: '/imagens' }` e `{ dir: '../../public/logo', baseURL: '/logo' }` (caminhos relativos ao `srcDir`, conferir); favicon servido de `../public/favicon-producao.svg` como `/favicon.svg`.
- [ ] **Passo 3:** `app.config.ts`: `seo.siteName: 'Parô'`; header com logo `/logo/logo-paro-fundo-claro.svg` e `/logo/logo-paro-fundo-escuro.svg`; link do GitHub `https://github.com/otaviools/paro-v1`; `toc.title: 'Nesta página'`; `toc.bottom` com título `Links`, `edit: 'https://github.com/otaviools/paro-v1/edit/main/docs-site/content'` e links "Abrir o app" e "Repositório"; rodapé "Parô • ESAMC Uberlândia • © ano". Cards e botões com `rounded-paro-*` e `vidro`, como no `app.config.ts` do app.
- [ ] **Passo 4:** `app.vue`: `lang: 'pt-BR'`, ícone `/favicon.svg`, `<UApp :locale="pt_br">` (import de `@nuxt/ui/locale`). Textos fixos em inglês nos componentes ("Edit this page", "Page not found") passam para português.
- [ ] **Passo 5:** Recarregar `http://localhost:3100/getting-started` nos dois temas. Esperado: logo do Parô, fundo `#F7F6F3`/`#191919`, links em `#1F6C9F`/`#A9D3F2`, `/imagens/desktop-inicio.png` respondendo 200.

### Tarefa 3: Páginas técnicas lidas de `docs/` e links dos ADRs

**Files:**
- Create: `docs-site/utils/linkar-adrs.ts`, `docs-site/test/linkar-adrs.test.ts`, `docs-site/vitest.config.ts`
- Modify: `docs-site/content.config.ts`, `docs-site/nuxt.config.ts`

**Interfaces:**
- Produces: `linkarAdrs(markdown: string, arquivos: string[]): string`, em que `arquivos` são os nomes de `docs/adr/` (ex.: `0029-modulos-do-servidor-em-server-utils.md`); rotas `/tecnico/arquitetura-e-modulos` e `/tecnico/design-system`.

- [ ] **Passo 1: Testes que falham** (`linkar-adrs.test.ts`), com `arquivos = ['0003-a.md', '0004-b.md', '0015-c.md', '0027-d.md', '0001-e.md', '0024-f.md']` e `base = 'https://github.com/otaviools/paro-v1/blob/main/docs/adr/'`:
  - `'(ADR 0027)'` → `'(ADR [0027](' + base + '0027-d.md))'`
  - `'ADRs 0003, 0004 e 0015'` → os três números viram links, o resto do texto igual.
  - `'ADRs 0001 a 0024'` → `0001` e `0024` viram links.
  - `` 'em `ADR 0027` e `docs/adr/`' `` → sem mudança.
  - `'[ADR 0027](x)'` → sem mudança.
  - `'ADR 0099'` → sem mudança (não existe).
  - Os links levam `{target="_blank"}`.
- [ ] **Passo 2:** `npm test` em `docs-site/`. Esperado: FAIL, `linkarAdrs` não existe.
- [ ] **Passo 3:** Implementar `linkarAdrs`: ignora trechos entre crases e links Markdown existentes; acha `ADRs?` seguido de números de quatro dígitos separados por `, `, ` e ` ou ` a `; troca cada número que tem arquivo em `arquivos`.
- [ ] **Passo 4:** `npm test`. Esperado: PASS.
- [ ] **Passo 5:** `content.config.ts`: coleção `docs` com `source` em lista: `{ include: '**', exclude: ['index.md'] }` e `{ cwd: resolve(__dirname, '../docs'), include: '{modulos.md,design/design-system.md}', prefix: '/tecnico' }`, ajustando para que os caminhos fiquem `/tecnico/arquitetura-e-modulos` e `/tecnico/design-system` e a ordem na barra lateral siga o design (se o `prefix` não bastar, usar uma coleção `tecnico` e juntar a navegação e a busca no `app.vue`). Nome do grupo e das páginas na barra lateral: "Técnico", "Arquitetura e módulos", "Design system".
- [ ] **Passo 6:** `nuxt.config.ts`: hook `content:file:beforeParse` que aplica `linkarAdrs` só quando o arquivo vem de `../docs`, com a lista lida de `../docs/adr` no início do build.
- [ ] **Passo 7:** Abrir as duas rotas. Esperado: conteúdo dos arquivos de `docs/`, "ADR 0029" com link para o GitHub em outra aba, item "Técnico" na barra lateral.

### Tarefa 4: Janelas do macOS, prints e blocos de código

**Files:**
- Create: `docs-site/app/components/content/JanelaMac.vue`, `docs-site/app/components/content/PrintDoCelular.vue`, `docs-site/app/components/content/PrintDoDesktop.vue`, `docs-site/app/components/content/ProsePre.vue`, `docs-site/app/components/FundoPapel.vue`

**Interfaces:**
- Produces (usáveis no Markdown via MDC):
  - `::print-do-desktop{nome="desktop-inicio" alt="..."}`: `FundoPapel` > `JanelaMac` > `<img>` de `/imagens/<nome>-claro.png` ou `/imagens/<nome>.png`, conforme o tema.
  - `::print-do-celular{nomes="celular-inicio,celular-mapa" alts="...|..."}`: as prints lado a lado sobre `FundoPapel`, sem janela.
  - `JanelaMac` com props `titulo?: string` e slot padrão; barra com os três círculos `#FF5F57`, `#FEBC2E`, `#28C840`, título central, raio `rounded-paro-lg`, sombra.
  - `ProsePre` sobrescreve o do Nuxt UI: barra com os três círculos, `filename` (ou a linguagem) no título e botão de copiar à direita.

- [ ] **Passo 1:** Implementar `FundoPapel` (azul-papel suave a partir de `--ui-color-primary-100`, com o grafismo `public/grafismos/detalhe-2-isolinhas-fundo-*.svg` servido como `/grafismos/...`, se ficar bom; senão, cor lisa) e `JanelaMac`.
- [ ] **Passo 2:** Implementar as duas prints. A troca claro/escuro usa `UColorModeImage` para não mostrar as duas.
- [ ] **Passo 3:** Implementar `ProsePre` mantendo o realce de sintaxe e o copiar do original.
- [ ] **Passo 4:** Página de teste temporária com as três peças; conferir nos dois temas e a 375 px. Apagar a página depois.

### Tarefa 5: Conteúdo e página de entrada

**Files:**
- Create: `docs-site/content/index.md`, `docs-site/content/1.comecando/{.navigation.yml,1.o-que-e-o-paro.md,2.rodar-localmente.md,3.variaveis-de-ambiente.md}`, `docs-site/content/2.produto/{.navigation.yml,1.telas.md,2.como-a-chance-e-calculada.md,3.dados-e-privacidade.md,4.area-da-equipe.md}`
- Delete: `docs-site/content/1.getting-started/`, `docs-site/app/components/content/StarsBg.vue` e `HeroBackground.vue` se não forem usados

**Interfaces:**
- Consumes: `print-do-desktop`, `print-do-celular` (Tarefa 4).

- [ ] **Passo 1:** `index.md`: `u-page-hero` com título "Parô", frase do README ("chance de encontrar vaga... ESAMC Uberlândia"), botões "Começar" (`/comecando/o-que-e-o-paro`) e "Abrir o app" (`https://paro-v1.vercel.app`, outra aba), `print-do-desktop` com `desktop-inicio`; `u-page-section` com `u-page-grid` de cartões para Como a chance é calculada, Telas, Dados e privacidade, Rodar localmente, Arquitetura e módulos, Design system.
- [ ] **Passo 2:** Começando: O que é o Parô (README, primeiros parágrafos e Tecnologias; glossário curto do `CONTEXT.md`); Rodar localmente (README: pré-requisitos, passos, relógio falso, scripts, Ajustes visuais F4); Variáveis de ambiente (tabela do README e fechamento diário das noites).
- [ ] **Passo 3:** Produto: Telas (tabela de telas e prints do celular e do desktop); Como a chance é calculada; Dados e privacidade; Área da equipe (com `print-do-desktop` de `desktop-metricas`). Texto em prosa plana, fiel ao README e ao `CONTEXT.md`.
- [ ] **Passo 4:** Cada `.navigation.yml` com o título do grupo ("Começando", "Produto") e ícone Lucide; cada página com `title`, `description` e `navigation.icon`.
- [ ] **Passo 5:** Abrir `/`. Esperado: entrada com hero, print na janela e cartões; "Começar" leva à primeira página.

### Tarefa 6: Conferência final

- [ ] **Passo 1:** `npm run lint`, `npm run typecheck` e `npm test` em `docs-site/`. Esperado: sem erros.
- [ ] **Passo 2:** `npm run build` em `docs-site/`. Esperado: build termina, com as páginas técnicas e as imagens.
- [ ] **Passo 3:** No navegador, a 1280 px e a 375 px, nos dois temas: entrada, uma página de Produto, uma técnica. Ctrl+K busca "faixa de chance" e acha resultados. Prints das telas para o usuário.
- [ ] **Passo 4:** Parar o servidor e conferir que a porta 3100 ficou livre. Sem commit.
