# Site de documentação do Parô

## Intenção

Um site de documentação para o Parô no estilo do [Nuxt Docs Template](https://docs-template.nuxt.dev/), com Nuxt Content e Nuxt UI. O site junta, em páginas navegáveis com busca, o que hoje está no README, no `CONTEXT.md`, em `docs/modulos.md` e em `docs/design/design-system.md`. Deve parecer parte do Parô, e não um template genérico.

## Objetivos

- Site em `docs-site/`, no repositório `otaviools/paro-v1`, rodando localmente com `npm run dev` dentro da pasta.
- Pronto para publicar na Vercel como segundo projeto (Root Directory = `docs-site`), em `paro-docs.vercel.app`. O projeto na Vercel é criado pelo usuário.
- Navegação lateral, busca com Ctrl+K, seletor de tema claro/escuro e página de entrada funcionando.

## Fora do escopo

- Os ADRs (`docs/adr/`) não entram no site.
- Inglês ou qualquer outro idioma.
- Mudar o app, o README ou os arquivos de `docs/`. A troca do link do selo "Documentação" do README para o site fica para depois.
- Criar o projeto na Vercel, fazer commit ou push sem pedido do usuário.

## O que tornaria isso um fracasso

- Site com a cara do template (verde do Nuxt, sem a identidade do Parô).
- Páginas de Arquitetura e Design system desatualizadas em relação a `docs/`.
- Texto que contradiga o README ou o `CONTEXT.md`, ou que use termos que o glossário manda evitar.

## Restrições

- Português (pt-BR) em todo o conteúdo e nos textos da interface (Buscar, Nesta página, Copiar, Editar esta página e outros).
- Servidor de desenvolvimento nunca na porta 3000 (usar 3100). Não usar `.data/pglite`.
- Não ler nem citar o `.env`. Variáveis de ambiente documentadas a partir do README e do `.env.example`, sem valores.
- Não mexer em `docs/apresentacao/`.
- Dependências próprias em `docs-site/package.json`, sem alterar o `package.json` do app.

## Caminhos considerados

1. **Template oficial; páginas novas, com Arquitetura e Design system lidos direto de `docs/`.** Escolhido. As páginas curtas são escritas a partir do README e do `CONTEXT.md`; as duas técnicas ficam com uma fonte só e não desatualizam.
2. **Template oficial, tudo copiado para `docs-site/content/`.** Liberdade para reorganizar, mas duas cópias de `modulos.md` e do design system para manter iguais.
3. **Docus (camada pronta).** Menos código no começo, mas vidro, janelas do macOS e página de entrada teriam de ser enxertados sobre componentes que a camada controla.

## Decisões do usuário

### Local e publicação
- Pasta `docs-site/` no mesmo repositório.
- Vercel, `paro-docs.vercel.app`.

### Seções e barra lateral

```text
Começando
  O que é o Parô
  Rodar localmente
  Variáveis de ambiente
Produto
  Telas
  Como a chance é calculada
  Dados e privacidade
  Área da equipe
Técnico
  Arquitetura e módulos     ← lido de docs/modulos.md
  Design system             ← lido de docs/design/design-system.md
```

### Identidade (completa)
- Logotipo de `public/logo/` (versão de fundo claro e de fundo escuro) no cabeçalho; favicon do app.
- Paleta Papel: as variáveis `--ui-*` do `app/assets/css/main.css` do app no lugar das cores do template (fundo `#F7F6F3`/`#191919`, primary `#1F6C9F`/`#A9D3F2`).
- Vidro (`vidro`, `vidro-ativo`) e raios do app (`rounded-paro-sm/md/lg`) nos cards e botões do site.

### Prints e blocos de código (referências do Mobbin: Framer e ToDesktop)
- **Prints do desktop:** dentro de uma janela do macOS (barra com os três botões vermelho/amarelo/verde), com sombra, sobre um fundo azul-papel suave do Parô.
- **Prints do celular:** sem janela, só sobre o mesmo fundo.
- **Blocos de código:** barra com os três botões, nome do arquivo (ou linguagem) no título e botão de copiar.
- As prints trocam entre a versão clara e a escura conforme o tema do site.

### Tokens de cor, vidro e raio
- Copiados do `app/assets/css/main.css` do app só os tokens: variáveis `--ui-*` (claro e escuro), variáveis do vidro (`--vidro-*`, `--vidro-escolhido-*`, `--vidro-ativo-*`), classes `vidro`/`vidro-ativo` e os três raios (`--radius-paro-sm` 12 px, `--radius-paro-md` 16 px, `--radius-paro-lg` 16 px), em `docs-site/app/assets/css/paro.css`. Um comentário no topo indica a origem.
- Ficam de fora: tokens `--paro-*` temporários, cores do mapa, cursor, regras dos campos e o que for só do app.

### Menções a ADRs
- Nas páginas lidas de `docs/`, cada "ADR NNNN" vira, na hora de montar a página, um link para `https://github.com/otaviools/paro-v1/blob/main/docs/adr/NNNN-<nome>.md`, aberto em outra aba. O nome do arquivo sai da lista de `docs/adr/` no build. Os arquivos de `docs/` não são alterados.

### Busca e tema
- Busca com Ctrl+K no cabeçalho, como no template.
- Botão de tema no cabeçalho; o tema começa seguindo o sistema.

### Página de entrada (`/`)
- Como a do template: título e frase do Parô, botões "Começar" e "Abrir o app" (paro-v1.vercel.app), a print do desktop na janela do macOS sobre o fundo azul-papel e uma grade de cartões levando às seções.

## Como montar (decidido pelo construtor, conferível pelo usuário)

- Base: cópia do template oficial `nuxt-ui-templates/docs` (Nuxt UI 4 + Nuxt Content 3) em `docs-site/`, sem os extras que não servem (por exemplo, imagem OG gerada, LLMs, MCP), a menos que sejam necessários para o template funcionar.
- `content.config.ts`: coleção `landing` (página de entrada), coleção `docs` (páginas escritas em `docs-site/content/`) e coleção com `source.cwd` apontando para `../docs`, incluindo só `modulos.md` e `design/design-system.md`, montadas em `/tecnico/arquitetura-e-modulos` e `/tecnico/design-system`. O nome na barra lateral vem de `.navigation.yml` ou da configuração da coleção; o título da página continua o `#` do arquivo original.
- Imagens: `docs/imagens/` e `public/logo/` servidas pelo site sem duplicar arquivos, se der (por exemplo, `nitro.publicAssets` ou `dir.public` apontando para as pastas); se não der, cópia em `docs-site/public/` registrada como dívida.
- Componentes próprios: `JanelaMac` (moldura do macOS com fundo), `PrintDoCelular` (fundo sem janela), troca claro/escuro das prints, e o `ProsePre` sobrescrito para os blocos de código com os três botões.
- Textos da interface do Nuxt UI em português pelo `locale` pt-BR do Nuxt UI.

- Pré-requisito na Vercel (decisão do construtor, conferir ao criar o projeto): manter ligada a opção "Include files outside the Root Directory in the Build Step", que vem ligada por padrão. Sem ela, o build não acha `../docs`.

## O que fica para o construtor

- Texto exato de cada página, seguindo o README e o `CONTEXT.md`, em prosa plana.
- Ícones de cada página na barra lateral (Lucide).
- Detalhes do fundo azul-papel (cor lisa ou com o grafismo de `public/grafismos/`), dentro da paleta Papel.

## Pronto quando

- `npm run dev` em `docs-site/` sobe na porta 3100 com as 10 páginas e a página de entrada.
- Barra lateral, busca, tema claro/escuro, janelas do macOS e blocos de código conferidos com prints nos dois temas.
- Tudo na branch `docs/site-de-documentacao`, sem commit até o usuário pedir.
