# Design system do Parô

Regras de interface para o app Parô: cores, raios, componentes base e padrões de navegação. Paleta **Papel**: base quase monocromática em tons quentes, com cor pastel só em pontos pequenos.

## Fontes de verdade

| Assunto | Fonte |
|---|---|
| Regras de produto (faixas de chance, base, Sem dado, privacidade) | `docs/adr/` e `CONTEXT.md` |
| Padrões de layout e componente | `docs/design/referencias.md` (Waymo, Pangea e Lime em destaque) |
| Cores, raios e componentes | Este documento |
| Estilo no código | ADR 0027 (Tailwind, variáveis do Nuxt UI e três raios próprios) |
| Logotipo e símbolo | Os arquivos atuais do logotipo do Parô, sem alteração |

As referências do Mobbin entram só como padrão de layout, navegação e comportamento de componente. Nada de marca, logotipo, ilustração, cor ou texto dos apps de referência entra no Parô.

O design system define só **cores e raios** (ADR 0027). As cores ficam nas variáveis do Nuxt UI (`--ui-*`), declaradas em `app/assets/css/main.css`. Os componentes usam as classes semânticas do Tailwind e do Nuxt UI (`bg-default`, `bg-elevated`, `text-muted`, `border-default`, `text-primary`, `bg-inverted`...), nunca o valor hexadecimal direto. Os tokens próprios são os três raios e as variáveis do vidro (`--vidro-*`, `--vidro-escolhido-*` e `--vidro-ativo-*`, seção Vidro). Tamanhos de texto, espaçamentos, alturas e larguras vêm da escala do Tailwind, escritos como classes nos componentes.

Os tokens `--paro-*` marcados TEMPORÁRIO no `main.css` são apelidos que as telas ainda não migradas usam. Saem nos tickets de cada tela (#37 a #39). As cores do mapa (`--paro-mapa-*`) ficam, porque o Nuxt UI não tem variável de mapa.

Os ajustes que valem para todo componente do Nuxt UI (raio e vidro dos botões, cards, avisos e gavetas; cores do aviso suave; seletor sem sombra) ficam em `app/app.config.ts`, com a lista de qual componente do Nuxt UI faz cada peça do design system.

## Princípios

1. **Chance, não garantia.** Toda tela com chance mostra a faixa de chance com rótulo e a base. Nenhum texto promete vaga.
2. **Rótulo e cor.** A faixa de chance é comunicada por rótulo textual mais cor: verde, amarelo ou vermelho (ADR 0033). O rótulo aparece sempre junto da cor.
3. **Cor é escassa.** A interface é quase monocromática. Tons pastel aparecem só em chips ativos, etiquetas, links e avisos. Nenhuma área grande é colorida.
4. **Noite primeiro.** O uso principal é à noite. O tema escuro é tão completo quanto o claro.
5. **Vidro nas superfícies.** Cards, linhas de rua coberta, barra de abas, abas de faixa horária e botões são vidro Solid Glass (classes `vidro`, `vidro-escolhido` e `vidro-ativo`, seção Vidro). Avisos e gavetas continuam com fundo sólido. O único degradê é o fundo tingido do Detalhe da rua.
6. **Uma ação principal por tela**, fixa no rodapé no mobile.

## Cores

### Base

| Variável do Nuxt UI | Classe | Claro | Escuro | Uso |
|---|---|---|---|---|
| `--ui-bg` | `bg-default` | `#F7F6F3` | `#191919` | Fundo da página |
| `--ui-bg-elevated` | `bg-elevated` | `#FFFFFF` | `#202020` | Cards, gavetas, campos, barra de abas |
| `--ui-bg-muted` | `bg-muted` | `#F3F2EE` | `#262626` | Botão secundário, chips inativos, esqueleto |
| `--ui-bg-accented` | `bg-accented` | `#EAEAEA` | `#2C2C2C` | Fundo mais forte; mesmo valor da borda |
| `--ui-border`, `--ui-border-muted`, `--ui-border-accented` | `border-default`, `border-muted`, `border-accented` | `#EAEAEA` | `#2C2C2C` | Contorno de cards, campos e separadores |
| `--ui-text`, `--ui-text-highlighted`, `--ui-text-toned` | `text-default`, `text-highlighted`, `text-toned` | `#2F3437` | `#E8E7E4` | Texto principal; traço dos padrões de faixa de chance |
| `--ui-text-muted`, `--ui-text-dimmed` | `text-muted`, `text-dimmed` | `#6F6E6A` | `#9B9A97` | Texto secundário, base, distância |
| `--ui-bg-inverted`, `--ui-border-inverted` | `bg-inverted`, `border-inverted` | `#111111` | `#E8E7E4` | Seletor liga/desliga ligado, ponto do carro no mapa |
| `--ui-text-inverted` | `text-inverted` | `#FFFFFF` | `#191919` | Texto sobre `bg-inverted` |
| `--ui-color-neutral-800` | `bg-neutral-800` | `#333333` | `#D6D5D1` | Sem uso nos componentes desde o vidro |
| `--ui-primary` | `text-primary`, `ring-primary` | `#1F6C9F` | `#A9D3F2` | Texto sobre o destaque, links, anel de foco |
| `--ui-color-primary-100` | `bg-primary-100` | `#E1F3FE` | `#1C3446` | Opção escolhida no seletor de opção com ícone, fundo de aviso |

`--ui-text-dimmed` recebe o mesmo valor de `--ui-text-muted`: a paleta tem um só tom de texto secundário, e o cinza mais claro do Nuxt UI não passa no AA.

Os tons `--ui-color-*-100` e `--ui-color-neutral-800` são redefinidos no tema escuro. Por isso `bg-primary-100` já troca de valor com o tema, sem `dark:`.

### Sinais

Usados só em mensagens, ícones e etiquetas. Nunca nas faixas de chance. A cor do sinal (`--ui-success`, `--ui-warning`, `--ui-error`) é o texto do par; o fundo pastel é o tom 100 da mesma cor.

| Variáveis do Nuxt UI | Fundo claro | Texto claro | Fundo escuro | Texto escuro | Uso |
|---|---|---|---|---|---|
| `--ui-color-error-100` e `--ui-error` | `#FDEBEC` | `#9F2F2D` | `#3B1E1D` | `#F2B8B5` | Apagar histórico, erros |
| `--ui-color-success-100` e `--ui-success` | `#EDF3EC` | `#346538` | `#1F3321` | `#B6D7B3` | Confirmação de registro e de "Saí" |
| `--ui-color-warning-100` e `--ui-warning` | `#FBF3DB` | `#8A5A00` | `#3A2F14` | `#EBCB82` | Aviso "Dados de demonstração" |

### Mapa

O Nuxt UI não tem variável para o mapa. As cores do mapa ficam em `--paro-mapa-*` no `main.css`, lidas pelo Mapa da área para o estilo do MapLibre. O rótulo usa `--ui-text-muted`.

| Cor | Claro | Escuro | Uso |
|---|---|---|---|
| Fundo do mapa | `#F3F2EE` | `#1E1E1E` | Fundo do mapa |
| Quadra | `#EBEAE5` | `#252525` | Quadras |
| Parque | `#E8EEE6` | `#1F2620` | Praças e parques |
| Via | `#FFFFFF` | `#2E2E2E` | Vias |
| Meio-fio | `#E0DED8` | `#363636` | Contorno das vias |
| Rótulo (`--ui-text-muted`) | `#6F6E6A` | `#9B9A97` | Nome de rua, com halo na cor da via |

As ruas cobertas são desenhadas por cima na cor da sua faixa de chance, em linha cheia com pontas e junções redondas e um contorno na cor da via; a largura acompanha o zoom (4 px no zoom 14, 10 px no 18). Sem dado é um tracejado fino na cor `--ui-text`. A cor vai direto na linha, sem imagem repetida, para não aparecerem emendas ao aproximar e afastar.

### Contraste (WCAG 2.1, nível AA)

AA exige 4,5:1 para texto normal. Todas as combinações de texto da paleta passam.

| Texto sobre fundo | Claro | Escuro |
|---|---|---|
| `text-default` sobre `bg-default` | 11,65 | 14,22 |
| `text-default` sobre `bg-elevated` | 12,60 | 13,18 |
| `text-muted` sobre `bg-default` | 4,72 | 6,25 |
| `text-muted` sobre `bg-elevated` | 5,10 | 5,79 |
| `text-muted` sobre `bg-muted` | 4,56 | 5,38 |
| `text-inverted` sobre `bg-inverted` | 18,88 | 14,22 |
| `text-inverted` sobre `bg-primary` | 5,67 | 11,12 |
| `text-primary` sobre `bg-elevated` | 5,67 | 10,31 |
| `text-primary` sobre `bg-default` | 5,25 | 11,12 |
| `text-primary` sobre `bg-primary-100` | 4,98 | 8,16 |
| `text-error` sobre `bg-error-100` | 6,26 | 8,85 |
| `text-success` sobre `bg-success-100` | 6,08 | 8,60 |
| `text-warning` sobre `bg-warning-100` | 5,35 | 8,39 |
| rótulo do mapa sobre fundo do mapa | 4,56 | 5,92 |

Regras:

- `text-muted` nunca sobre `bg-primary-100`, sobre os fundos de sinal nem sobre `bg-accented` (4,24 no claro). Nesses fundos, só o texto do próprio par ou `text-default`.
- Texto principal nunca em preto puro: sempre `text-default`.

## Raios

Três raios próprios, no `@theme` do `main.css` (ADR 0027). As classes são `rounded-paro-sm`, `rounded-paro-md` e `rounded-paro-lg`. O painel de ajustes visuais (F4) muda `--radius-paro-md` e `--radius-paro-lg` juntos.

| Token | Valor | Onde |
|---|---|---|
| `--radius-paro-sm` | 12 px | Raio pequeno |
| `--radius-paro-md` | 16 px | Botões, abas de faixa horária, barra de abas, chips de horário, campos, linhas da lista de ruas, avisos, itens de menu |
| `--radius-paro-lg` | 16 px | Cards, gavetas, painéis |
| md menos 4 px | 12 px | Item escolhido dentro das abas de faixa horária e da barra de abas, que têm 4 px de folga interna |

Botões, abas e chips não são pílula, e botões de ícone não são círculo: todos usam `rounded-paro-md`. Ficam em pílula só as etiquetas, como o selo da faixa de chance e a distância a pé. As amostras de faixa de chance têm raio fixo de 3 px (amostra de 12 px) e 6 px (amostra de 32 px). Os quadrados do mapa de calor da chance têm raio de 6 px.

O raio base do Nuxt UI (`--ui-radius`, 8 px) não mudou e não é controlado pelo F4. Componentes do Nuxt UI sem ajuste no `app.config.ts` usam 12 px (`rounded-md`).

## Vidro

Referência: [Solid Glass](https://github.com/deeplethe/solid-glass) (opção C: o acabamento dele com o azul do Parô). O acabamento fica na borda do vidro e o rosto é uma cor lisa, sem degradê. As classes `vidro`, `vidro-escolhido` e `vidro-ativo` leem variáveis CSS declaradas no `main.css`: `:root` para o tema claro e `.dark` para o escuro. As cores ficam em canais (`R G B`) e alfas separados.

1. **Fundo:** cor translúcida (`*-fundo`, `*-fundo-alfa`) com desfoque de 26 px (`--vidro-desfoque`). A saturação é de 180% no claro e de 100% no escuro (`--vidro-saturacao`), para o vidro escuro ficar cinza neutro.
2. **Luz:** linha branca de 1 px no topo (`*-luz-alfa`). No `vidro`, mais um fio branco por dentro (`--vidro-dentro-alfa`).
3. **Contorno:** 1 px na cor `*-contorno` com opacidade `*-contorno-alfa`. No `vidro` fica por fora; no `vidro-escolhido`, por dentro; no `vidro-ativo`, é só a linha de sombra da base.
4. **Sombra por baixo:** macia e puxada para baixo, na cor `--vidro-sombra` com opacidade `*-sombra-alfa`. O `vidro-escolhido` não tem.

| Variável | `vidro` claro | `vidro` escuro | `vidro-escolhido` claro | `vidro-escolhido` escuro | `vidro-ativo` claro | `vidro-ativo` escuro |
|---|---|---|---|---|---|---|
| Fundo | `248 249 251` a 60% | `48 48 48` a 46% | `31 108 159` a 10% | `169 211 242` a 12% | `31 108 159` a 90% | `169 211 242` a 90% |
| Luz no topo | 90% | 16% | 85% | 22% | 30% | 100% |
| Fio por dentro | 35% | 4% | não se aplica | não se aplica | não se aplica | não se aplica |
| Contorno | `62 68 82` a 10% | `255 255 255` a 6% | `31 108 159` a 18% | `169 211 242` a 14% | base `0 0 0` a 40% | base `0 0 0` a 22% |
| Sombra por baixo | `33 44 74` a 28% | `0 0 0` a 60% | sem sombra | sem sombra | 28% | 60% |
| Texto | não se aplica | não se aplica | `#1F6C9F` | `#A9D3F2` | `#FFFFFF` | `#10283A` |

| Classe | Onde |
|---|---|
| `vidro` | Cards, linhas de rua coberta, controle das abas de faixa horária, barra de abas, botões de ícone e secundários, chips de horário inativos, carregamento da Área da equipe |
| `vidro-escolhido` | Item escolhido: aba de faixa horária, aba da barra de abas, item do menu lateral do desktop, chip de horário |
| `vidro-ativo` | Botão principal |

### Painel de ajustes visuais (F4)

Em desenvolvimento, a tecla F4 abre o componente `DepuradorVisual`, e Esc fecha. Ele muda ao vivo o raio, o desfoque e as camadas de `vidro`, `vidro-escolhido` e `vidro-ativo`, nos dois temas, e guarda os ajustes no navegador. "Copiar ajustes" gera o bloco de variáveis para colar no `main.css`, e "Restaurar" volta aos valores do `main.css`. O painel não entra no build de produção. Os valores padrão do painel repetem os do `main.css`. Se um mudar, mude o outro.

## Texto e medidas

Tamanhos de texto, espaçamentos, alturas e larguras usam a escala padrão do Tailwind, sem tokens próprios. Cada medida é uma classe no componente, como a largura da barra lateral do desktop.

Conversão dos tamanhos de texto antigos para a escala do Tailwind (ADR 0027):

| Antes | Classe | Tamanho |
|---|---|---|
| 26 px | `text-2xl` | 24 px |
| 22 px | `text-xl` | 20 px |
| 17 px | `text-lg` | 18 px |
| 16 px | `text-base` | 16 px |
| 15 px | `text-sm` | 14 px |
| 13 px e 11 px | `text-xs` | 12 px |

Fontes: **Figtree** na interface e no texto, servida pelo próprio app para funcionar offline no PWA; **JetBrains Mono** só nos dados das telas da equipe. As duas são livres (SIL Open Font License).

- Sem texto corrido centralizado; no máximo 70 caracteres por linha.
- Algarismos tabulares (`tabular-nums`) em horários, distâncias e na base.
- O número da chance só aparece no detalhe da rua, junto com a base (ADR 0006).
- Alvo de toque mínimo de 44 × 44 px.

## Faixas de chance

Regra de produto das ADRs 0006 e 0033. Sempre rótulo **e** cor. As cores são as da paleta padrão do Tailwind e não mudam com o tema.

| Faixa de chance | Chance | Cor |
|---|---|---|
| Tranquilo | 70% ou mais | verde `#22C55E` (green-500) |
| Apertado | 40% a 69% | amarelo `#FACC15` (yellow-400) |
| Difícil | menos de 40% | vermelho `#EF4444` (red-500) |
| Sem dado | — | contorno tracejado de 1,5 px (4 px de traço, 3 px de intervalo) em `text-default` |

- Amostra de 12 px nas listas e no card; 32 px na legenda do mapa.
- No mapa, o trecho da rua coberta recebe a cor e uma etiqueta com o rótulo; Sem dado, um tracejado fino na cor do texto.
- "Sem dado" sempre com o texto "Ainda não temos observações suficientes nesta faixa horária". Nunca em branco, nunca como livre.

## Componentes base

### Botões

| Variante | Visual | Uso | Referência de layout |
|---|---|---|---|
| Principal | Classe `vidro-ativo`, texto `--vidro-ativo-texto`, raio `rounded-paro-md`, 52 px, largura total, fixo no rodapé | Uma por tela: "Registrar vaga", "Saí", "Continuar", "Como chegar" | Lime: botão grande fixo no rodapé |
| Secundário | Classe `vidro`, texto `text-default`, raio `rounded-paro-md` | Ao lado da principal: "Mudar saída" | Lime: dois botões lado a lado |
| De ícone | Quadrado de vidro de 40 px (classe `vidro`), raio `rounded-paro-md`, ícone em `text-primary` | Controles do mapa, voltar, fechar gaveta, compartilhar | Lime e Pangea: botões flutuantes; Figma do Parô: botão de vidro |
| Link | Texto `text-primary`, sem fundo | "Como a chance é calculada", "Cancelar" | Lime: link de cancelar |
| Destrutivo | Texto `text-error`, sem fundo, sempre com confirmação | "Apagar histórico" | Grok: ação de apagar no fim da lista |

Estados:

- **Com cursor:** brilho de 105%.
- **Pressionado:** `transform: scale(0.98)`.
- **Foco:** anel de 2 px em `--ui-primary`, afastado 2 px. Nas abas de faixa horária e na barra de abas, o anel fica colado ao item, com o mesmo raio dele.
- **Desativado:** evitar. Quando inevitável, opacidade 0,4 e o motivo escrito ao lado.
- **Carregando:** indicador no lugar do texto, mesma largura.

Alvo de toque mínimo de 44 × 44 px.

### Formulários

| Componente | Visual | Onde |
|---|---|---|
| Chips de faixa horária | Botão de 56 px de altura, raio `rounded-paro-md`, numa grade de 4 colunas (todas do mesmo tamanho), só com o início da faixa ("21h"); o fim ("até 21h30") fica só para leitores de tela; inativo em `vidro`; ativo em `vidro-escolhido` | Saída prevista no registro e rotina de Ajustes (referência Waymo) |
| Abas de faixa horária | `UButton` fantasmas num controle segmentado de `vidro`, raio `rounded-paro-md`, largura total, 48 px de altura; a ativa ganha um item `vidro-escolhido` que desliza até ela em 200 ms | Abas Agora, 18h, 19h e 20h no Início, na barra lateral e no Mapa; período das Métricas da equipe |
| Seletor de opção com ícone | Botões lado a lado, raio `rounded-paro-md`; o selecionado com fundo `bg-primary-100` e borda de 1,5 px na cor `--ui-primary` | Escolha da rua coberta no registro manual (referência Pangea) |
| Linha com seletor liga/desliga | Título, parágrafo explicativo em `text-muted` e seletor à direita; ligado em `bg-inverted` | Ajustes: usar localização, forma de colaborar (referência Grok) |
| Card de escolha única | Card com título e descrição; o escolhido com borda de 1,5 px na cor `--ui-text` | Primeira visita: forma de colaborar |
| Campo de texto | 48 px, fundo `bg-elevated`, borda `border-default`, raio `rounded-paro-md`, rótulo sempre visível acima; no celular, texto de 16 px em todo campo, para o iPhone não ampliar a tela ao tocar | Sugestão de rua; telas da equipe |

Regras:

- Nenhum campo de nome, CPF, telefone, e-mail ou placa (ADR 0004).
- Rótulo sempre visível; o placeholder nunca substitui o rótulo.
- Erro em `text-error` abaixo do campo, com ícone. Nunca só cor.
- A forma de colaborar começa desligada (ADR 0010).

### Cards

Todos em vidro (classe `vidro`, seção Vidro), com raio `rounded-paro-lg`; as linhas de rua coberta com `rounded-paro-md`.

| Card | Conteúdo | Referência de layout |
|---|---|---|
| Melhor chance | Etiqueta "MELHOR CHANCE · 19H" em `text-muted`, nome da rua, amostra de cor com rótulo, base, distância a pé e "Previsão, não garantia."; o card inteiro abre o Detalhe da rua na mesma faixa horária, com seta à direita do nome | Pangea: card de destaque no topo |
| Linha de rua coberta | Amostra de cor, nome da rua, rótulo e base no subtítulo, distância numa etiqueta à direita; raio `rounded-paro-md` | Pangea: linha com distância; Waymo: valor à direita |
| Seu registro de vaga | Saída prevista em `text-xl` como título, rua coberta abaixo, linha de ações com ícone e rótulo (Mudar saída, Voltar até o carro) | Waymo: viagem em andamento |
| Faixa escolhida | No Detalhe da rua: o intervalo da faixa horária em `text-muted` com relógio; a chance em número grande (`text-4xl`) com o selo da faixa de chance ao lado (amostra e rótulo numa pílula tingida com 18% da cor da faixa); "Chance de achar vaga"; uma barra de 8 px preenchida até a chance na cor da faixa; a base embaixo em `text-xs` ("7 de 7 noites · última em 06/11"). Sem dado: selo tracejado "Sem dado" e "Não temos observações suficientes nesta faixa horária" | Redfin e AllTrails: número grande com selo |
| Bloco de dado | Título com ícone e linhas de dado separadas por `border-default` | Pangea: blocos agrupados no detalhe |
| Aviso | Fundo do sinal correspondente, texto do mesmo par, ícone, link opcional; raio `rounded-paro-md` | Lime: faixa informativa |

### Tabelas

Só no painel desktop e nas telas da equipe. No mobile, toda tabela vira lista de linhas.

- Sem caixa em volta: linhas separadas por 1 px em `border-default`.
- Cabeçalho em etiqueta (`text-xs`, caixa alta) em `text-muted`; linhas de 48 px.
- Números alinhados à direita, com algarismos tabulares.
- Coluna de faixa de chance sempre com amostra de cor e rótulo.
- Sem listras alternadas e sem bordas verticais.

### Mapa de calor da chance

No Detalhe da rua, "Chance ao longo da noite" é um mapa de calor desenhado com ECharts:

- As colunas são as horas, de 17h a 22h. As duas linhas são a primeira e a segunda meia hora (":00" e ":30"). Cada quadrado é uma faixa horária.
- Cada quadrado tem a cor da sua faixa de chance, com raio de 6 px e 4 px de folga. Sem dado é um quadrado vazio com contorno tracejado de 1,5 px em `text-default`.
- Por cima de cada quadrado fica um botão transparente do mesmo tamanho. Tocar ou usar o teclado escolhe a faixa horária. O botão tem o nome acessível e o balão nativo com a faixa, a faixa de chance e a chance ("21h30–22h: Apertado, 57%").
- A faixa horária escolhida ganha um contorno de 2 px na cor do texto.
- Os rótulos ":00" e ":30" e os das horas ficam em HTML, em `text-xs` e `text-muted`, alinhados à grade.
- Embaixo fica a legenda das faixas de chance.
- A melhor faixa fica num card próprio logo abaixo ("Melhor faixa", com estrela, a amostra da faixa de chance e o intervalo, como "18h–18h30"; sem nenhuma, "Sem dado a noite toda").

### Gráficos da equipe

As Métricas da equipe usam ECharts, uma exceção à ADR 0028:

- As barras verticais usam o dataset do ECharts. "Motoristas por semana" agrupa "Na semana" e "Voltaram" lado a lado, com a legenda do ECharts no topo. "Registros por noite" tem uma barra por noite.
- Os gráficos verticais têm o controle deslizante de zoom embaixo. Arrastar o gráfico move o trecho, e Ctrl mais a roda do mouse (ou pinça) dá zoom. A roda sozinha rola a página.
- "Ruas com mais registros" usa barras horizontais com o valor no fim.
- "Registros por dia e horário" é um mapa de calor no estilo do GitHub: dias da semana nas linhas, faixas horárias nas colunas e 5 tons (vazio e quatro de `--ui-primary`, pelos quartis), com a escala "Menos … Mais".
- As cores vêm das variáveis do tema, convertidas para rgba pelo `useCoresDoTema`, e mudam com o tema.
- Os leitores de tela recebem o mesmo conteúdo numa lista ou tabela escondida.

### Gavetas, avisos flutuantes e carregamento

| Componente | Regra | Referência |
|---|---|---|
| Gaveta sobre o mapa | Raio `rounded-paro-lg` no topo, alça de 32 × 4 px, botão de fechar; dois pontos de parada (resumo e expandida) | Lime: gaveta da rua |
| Gaveta de escolha | Título à esquerda e botão de fechar à direita, grupos de chips em grade e "Salvar" como ação principal cheia no rodapé, com o horário marcado ("Salvar saída às 21h30"); no desktop, abre embaixo do painel da direita, com a largura dele; pode ter uma escolha vazia em largura total acima dos grupos ("Sem rotina"). Usada na saída prevista e, no celular, na rotina de Ajustes (no desktop, a rotina continua na lista suspensa) | Careem e Airbnb: escolha de horário |
| Registro sobre o mapa (desktop) | Com um registro de vaga aberto e fora da aba Vaga, card de vidro à esquerda da legenda, com a largura e a altura dela: ponto verde piscando com "Seu registro de vaga", saída prevista, rua, chegada, "Saí" (botão cheio: avisa a saída e encerra o registro, como na aba Vaga) e "Mudar saída" (abre a aba Vaga). Com o painel da direita aberto, fica em cima da legenda. Entra subindo 12 px e aparecendo; sai descendo | Turo: card sobre o mapa |
| Aviso flutuante | `UToast` num card de vidro escuro nos dois temas (classes `dark`, `aviso-flutuante` e `vidro`; fundo a 94%), raio `rounded-paro-md`, texto `text-highlighted` com uma bolinha de 8 px ao lado: verde (o verde de Tranquilo) para sucesso, vermelha (o vermelho de Difícil) para erro, com halo de 4 px da mesma cor. No celular, 8 px acima da barra de abas, com a largura dela; no desktop, no canto superior direito, a 24 px das bordas, com 352 px de largura. Some em 3 s | Waymo: confirmação |
| Esqueleto | `USkeleton` em `bg-muted` no formato do conteúdo, com brilho que passa a cada 1,4 s (classe `brilho`) | Google e Finimize: carregamento |
| Carregamento da Área da equipe | Pílula de `vidro` com o ícone girando e "Carregando…". Aparece enquanto a tela confere a chave guardada na aba e, nas Métricas, por cima dos resultados esmaecidos a cada requisição | Sem referência |
| Etiqueta sobre o mapa | Fundo `bg-elevated`, borda, ícone de pegadas e a distância em metros em linha reta ("140 m em linha reta"). Sem minutos, porque o Parô não calcula rota (ADR 0020) | Lime: tempo a pé |

O aviso "Dados de demonstração" (ADR 0012) é um botão de 36 px, raio `rounded-paro-md`, com o ícone de laboratório no sinal `warning` (fundo pastel e ícone na cor do sinal). Fica ao lado do logotipo no Início (barra lateral do desktop e topo do celular) e no topo do Detalhe da rua: no celular, à direita do voltar; no desktop, à esquerda do fechar do painel da direita. O nome acessível diz "Dados de demonstração", e tocar abre um balão com o título e a explicação. No Mapa do celular continua o card Aviso no topo.

### Fundo tingido

O Detalhe da rua tem um fundo tingido pela cor da faixa de chance da faixa horária selecionada: a cor com 25% de opacidade no topo, sumindo até o meio da tela, parada enquanto o conteúdo rola. Troca de cor em 500 ms. Sem dado, sem tinta (ADR 0034; referência Luma, que tinge pelo cartaz do evento).

### Movimento

- Entrada de conteúdo: opacidade de 0 a 1 com deslocamento de 8 px, 300 ms, `cubic-bezier(0.16, 1, 0.3, 1)`.
- Gavetas: 250 ms com a mesma curva.
- Troca de tela: a tela antiga sai na hora e a nova aparece com esmaecer de 200 ms. No celular, os blocos da tela nova (título, cards, seções) entram em cascata (referências Luma e Airbnb): cada um sobe 12 px e aparece em 360 ms, 40 ms depois do anterior, até o oitavo. O que é fixo (barra de abas, ação principal no rodapé, fundo tingido, mapa) fica parado. A classe `cascata` aplica a mesma entrada a um bloco que chega depois da tela, como o conteúdo da Área da equipe depois de conferir a chave. A tela nova abre no topo; voltar devolve a rolagem de antes.
- Só `transform` e `opacity`. Com `prefers-reduced-motion`, sem animação.

## Ícones

Um único conjunto, em traço uniforme, sempre acompanhado de rótulo na barra de abas e nas linhas de ação. Sem emoji.

O conjunto é o **Lucide**, usado pelo Nuxt UI com o prefixo `i-lucide-` e servido pelo próprio app (pacote `@iconify-json/lucide`), para funcionar offline no PWA.

| Uso | Ícone (nome genérico) | Lucide |
|---|---|---|
| Início | casa | `house` |
| Mapa | mapa dobrado | `map` |
| Minha vaga | carro | `car` |
| Ajustes | engrenagem | `settings` |
| Distância a pé | pessoa andando | `footprints` |
| Como chegar | seta de direção | `navigation` |
| Apagar histórico | lixeira | `trash-2` |
| Aviso | círculo com "i" | `info` |

O Lucide não tem uma pessoa andando; `footprints` (pegadas) é o ícone mais próximo.

## Padrões de navegação

### Mobile

- **Barra de abas flutuante** (referências Waymo e Luma), de vidro (classe `vidro`) com raio `rounded-paro-md`. Quatro abas com ícone e rótulo: Início, Mapa, Minha vaga e Ajustes. A aba ativa ganha um item `vidro-escolhido`, que desliza até ela em 250 ms, e texto `text-primary`. A barra some em Registrar vaga e na Primeira visita.
- **Mapa em tela cheia com gaveta** (referência Lime): botões de ícone flutuam no canto direito; tocar num trecho abre a gaveta de resumo; expandir abre o Detalhe da rua.
- **Detalhe da rua** abre por cima, com botão de voltar no topo esquerdo.
- **Ação principal fixa no rodapé** em toda tela que tem uma.
- **Primeira visita** em telas cheias sem barra de abas; a explicação de privacidade abre como gaveta a partir de um link (referência Tinder).

### Desktop

A partir de 1024 px, o Parô é um painel único de três colunas (referência Turo). Início e Mapa viram uma tela só: a aba Mapa não aparece e não há barra de abas flutuante.

- **Barra lateral de 340 px** (`w-85`), fundo `fundo-azul` e borda à direita, com rolagem própria e margem lateral de 24 px. No topo, o logotipo do Parô com 36 px de altura e o aviso de demonstração ao lado. Depois, a navegação (Início, Minha vaga e Ajustes, com ícone e rótulo; o item ativo segue a aba ativa da barra de abas), as abas de faixa horária, o card de melhor chance, a lista de ruas cobertas e a pergunta "A previsão ajudou hoje?".
- **Centro:** o mapa da área, com o botão de centralizar no canto superior direito e a legenda no canto inferior direito.
- **Painel à direita de 432 px** (`w-108`; cabe a legenda do gráfico numa linha), fundo `bg-default`, borda à esquerda e margem lateral de 24 px. Começa fechado e tem botão de fechar (botão de ícone, no topo direito); Esc também fecha. Abre com o Detalhe da rua completo (ao escolher uma rua no mapa ou na lista), com Minha vaga (incluindo Registrar vaga e Seu registro de vaga) ou com Ajustes. O painel abre por cima do mapa, sem mudar a largura dele, e entra e sai deslizando pela direita em 300 ms; os controles do canto direito do mapa (centralizar e legenda) se afastam do painel no mesmo ritmo. A troca de tela dentro do painel (e no celular) faz a tela nova aparecer em 200 ms, só com opacidade: um deslocamento faria os elementos fixos da página (ação principal no rodapé, fundo tingido) pularem de lugar. A ação principal fica fixa no rodapé do painel.
- **Voltar até o carro** abre no centro, no lugar do mapa da área, com a barra lateral ao lado.
- Os endereços continuam os mesmos do celular (`/ruas/[id]`, `/minha-vaga`, `/ajustes`): no desktop, cada um abre o painel com o conteúdo certo.
- A Primeira visita e as telas da equipe ficam fora do painel e continuam como no celular.

### Fluxos

| Fluxo | Caminho |
|---|---|
| Consultar | Início → linha da rua → Detalhe da rua → Como chegar |
| Pelo mapa | Mapa → toque no trecho → gaveta → Detalhe da rua |
| Registrar | Minha vaga → Registrar vaga → escolher rua e saída prevista → Seu registro de vaga |
| Encerrar | Seu registro de vaga → Saí → aviso flutuante → Início. Também pelo "Saí" do bloco do registro de vaga no Início (celular) e do card sobre o mapa (desktop) → aviso flutuante, sem sair da tela |
| Voltar ao carro | Bloco do registro de vaga no Início (referência Rivian) → mapa com ponto do carro e posição atual |

## Tema escuro

O tema segue o sistema por padrão e pode ser forçado nos Ajustes. Todas as cores têm valor escuro nas tabelas acima. O fundo é um carvão quente (`#191919`), nunca preto puro. Os três vidros têm valores próprios para o escuro (seção Vidro): o vidro fica cinza neutro, e o botão principal fica azul claro com texto azul-escuro. Os pastéis viram tons profundos com texto claro.

## Logotipo

O logotipo, o símbolo e o favicon continuam os mesmos, usados a partir dos arquivos originais, sem recriar em código e sem recolorir. A tela de abertura cobre o app na primeira carga (vem no HTML do servidor e some com esmaecer de 300 ms quando a primeira tela e os dados dela ficam prontos) com só o símbolo do Parô (`public/simbolo.svg`, 96 px) no centro, sobre o `fundo-azul`, pulsando: cresce 12% e volta a cada 1,4 s, com folga em volta para não ser cortado. Com movimento reduzido, o ô fica parado. Sobre `bg-default` claro usa a versão para fundo claro; no tema escuro, a versão para fundo escuro. Os arquivos ficam em `public/logo/` (`logo-paro-fundo-claro.svg` e `logo-paro-fundo-escuro.svg`). O componente `LogoDoParo` troca as duas versões pelo tema. Tem 36 px de altura na barra lateral do desktop e no topo do Início do celular, com o aviso de demonstração ao lado e o botão de tema à direita. Também abre a primeira tela da Primeira visita, acima do título, com o botão de tema à direita. No desktop, a Primeira visita tem duas colunas na altura exata da tela, sem rolagem (referência Cosmos, cadastro na web): à esquerda, um painel recortado (16 px de margem, raio `rounded-paro-lg`, `bg-muted`; referências Lindy, Base44 e Buffer) com uma grade de pontos de fundo (1 px a cada 20 px, sumindo nas bordas) e um brilho difuso no azul do logotipo saindo de baixo, o logotipo, a frase "Chance, não garantia" e as isolinhas da marca (`public/grafismos/`, versão de cada tema) grandes, com o centro na borda de baixo, surgindo e sumindo em direção ao topo; o espaço entre o painel e o conteúdo divide as colunas; à direita, uma coluna de 448 px centralizada, com título e texto centralizados, cards compactos (ícone ao lado do texto), a ação principal e o link do aviso de privacidade logo abaixo. O botão de tema e o de voltar ficam nos cantos de cima. Em telas baixas, só a coluna da direita rola.

## Pendências

| # | Assunto | Situação |
|---|---|---|
| 1 | Arquivos do logotipo e do ícone do app | Resolvido: logotipo em `public/logo/`, favicon e ícone do PWA em `public/favicon-producao.svg`, símbolo em `public/simbolo.svg` |
| 2 | Protótipo no Figma | Precisa ser atualizado para a paleta Papel e a fonte Figtree |
