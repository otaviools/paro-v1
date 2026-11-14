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

O design system define só **cores e raios** (ADR 0027). As cores ficam nas variáveis do Nuxt UI (`--ui-*`), declaradas em `app/assets/css/main.css`. Os componentes usam as classes semânticas do Tailwind e do Nuxt UI (`bg-default`, `bg-elevated`, `text-muted`, `border-default`, `text-primary`, `bg-inverted`...), nunca o valor hexadecimal direto. Os únicos tokens próprios são os três raios. Tamanhos de texto, espaçamentos, alturas e larguras vêm da escala do Tailwind, escritos como classes nos componentes.

Os tokens `--paro-*` que ainda aparecem no `main.css` são apelidos temporários. Saem nos tickets de cada tela (#36 a #39).

## Princípios

1. **Chance, não garantia.** Toda tela com chance mostra a faixa de chance com rótulo e a base. Nenhum texto promete vaga.
2. **Rótulo e padrão, nunca só cor.** A faixa de chance é comunicada por rótulo textual mais padrão de preenchimento, na cor do texto.
3. **Cor é escassa.** A interface é quase monocromática. Tons pastel aparecem só em chips ativos, etiquetas, links e avisos. Nenhuma área grande é colorida.
4. **Noite primeiro.** O uso principal é à noite. O tema escuro é tão completo quanto o claro.
5. **Plano e silencioso.** Borda de 1 px, sem sombra, sem degradê, sem efeito de vidro.
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
| `--ui-bg-inverted`, `--ui-border-inverted` | `bg-inverted`, `border-inverted` | `#111111` | `#E8E7E4` | Fundo do botão principal |
| `--ui-text-inverted` | `text-inverted` | `#FFFFFF` | `#191919` | Texto do botão principal |
| `--ui-color-neutral-800` | `bg-neutral-800` | `#333333` | `#D6D5D1` | Botão principal pressionado ou com cursor |
| `--ui-primary` | `text-primary`, `ring-primary` | `#1F6C9F` | `#A9D3F2` | Texto sobre o destaque, links, anel de foco |
| `--ui-color-primary-100` | `bg-primary-100` | `#E1F3FE` | `#1C3446` | Chip ativo, item selecionado, fundo de aviso |

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

O Nuxt UI não tem variável para o mapa. As cores do mapa continuam em `--paro-mapa-*` (temporário), lidas pelo Mapa da área para o estilo do MapLibre, até o ticket do mapa.

| Cor | Claro | Escuro | Uso |
|---|---|---|---|
| Fundo do mapa | `#F3F2EE` | `#1E1E1E` | Fundo do mapa |
| Quadra | `#EBEAE5` | `#252525` | Quadras |
| Parque | `#E8EEE6` | `#1F2620` | Praças e parques |
| Via | `#FFFFFF` | `#2E2E2E` | Vias |
| Meio-fio | `#E0DED8` | `#363636` | Contorno das vias |
| Rótulo (`--ui-text-muted`) | `#6F6E6A` | `#9B9A97` | Nome de rua, com halo na cor da via |

As ruas cobertas são desenhadas por cima com o padrão da sua faixa de chance, na cor `--ui-text`.

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

Três raios próprios, no `@theme` do `main.css` (ADR 0027). As classes são `rounded-paro-sm`, `rounded-paro-md` e `rounded-paro-lg`.

| Token | Valor | Onde |
|---|---|---|
| `--radius-paro-sm` | 6 px | Amostras de padrão de faixa de chance |
| `--radius-paro-md` | 12 px | Botões, campos, linhas da lista de ruas, avisos, itens de menu |
| `--radius-paro-lg` | 24 px | Cards, gavetas, barra de abas, painéis |
| pílula (`rounded-full`) | — | Só chips de horário e etiquetas |

Botões e cards nunca são pílula.

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

Regra de produto da ADR 0006. Sempre rótulo **e** padrão, desenhados em `text-default`. A cor não muda entre faixas.

| Faixa de chance | Chance | Padrão |
|---|---|---|
| Tranquilo | 70% ou mais | sólido |
| Apertado | 40% a 69% | hachura diagonal: traço de 1,2 px a 45°, a cada 3,5 px |
| Difícil | menos de 40% | pontilhado: pontos de 1,6 px a cada 4 px |
| Sem dado | — | contorno tracejado de 1,5 px (4 px de traço, 3 px de intervalo) |

- Amostra de 12 px nas listas e no card; 32 px na legenda do mapa.
- No mapa, o trecho da rua coberta recebe o padrão e uma etiqueta com o rótulo.
- "Sem dado" sempre com o texto "Ainda não temos observações suficientes nesta faixa horária". Nunca em branco, nunca como livre.

## Componentes base

### Botões

| Variante | Visual | Uso | Referência de layout |
|---|---|---|---|
| Principal | Fundo `bg-inverted`, texto `text-inverted`, raio `rounded-paro-md`, 52 px, largura total, fixo no rodapé | Uma por tela: "Registrar vaga", "Saí", "Continuar" | Lime: botão grande fixo no rodapé |
| Secundário | Fundo `bg-elevated`, borda `border-default`, texto `text-default`, raio `rounded-paro-md` | Ao lado da principal: "Mudar saída" | Lime: dois botões lado a lado |
| De ícone | Quadrado de 40 px com raio `rounded-paro-md`, fundo `bg-elevated`, borda `border-default` | Controles do mapa, fechar gaveta, compartilhar | Lime e Pangea: botões flutuantes |
| Link | Texto `text-primary`, sem fundo | "Como a chance é calculada", "Cancelar" | Lime: link de cancelar |
| Destrutivo | Texto `text-error`, sem fundo, sempre com confirmação | "Apagar histórico" | Grok: ação de apagar no fim da lista |

Estados:

- **Pressionado:** fundo `bg-neutral-800` e `transform: scale(0.98)`.
- **Foco:** anel de 2 px em `--ui-primary`, afastado 2 px.
- **Desativado:** evitar. Quando inevitável, opacidade 0,4 e o motivo escrito ao lado.
- **Carregando:** indicador no lugar do texto, mesma largura.

Alvo de toque mínimo de 44 × 44 px.

### Formulários

| Componente | Visual | Onde |
|---|---|---|
| Chips de faixa horária | Pílula de 44 px (alvo de toque mínimo), texto em etiqueta (`text-xs`, caixa alta); inativo com fundo `bg-elevated` e borda; ativo com fundo `bg-primary-100` e texto `text-primary` | Abas Agora, 19h, 21h e 22h; saída prevista no registro (referência Waymo) |
| Seletor de opção com ícone | Botões lado a lado, raio `rounded-paro-md`; o selecionado com fundo `bg-primary-100` e borda de 1,5 px na cor `--ui-primary` | Escolha da rua coberta no registro manual (referência Pangea) |
| Linha com seletor liga/desliga | Título, parágrafo explicativo em `text-muted` e seletor à direita; ligado em `bg-inverted` | Ajustes: usar localização, forma de colaborar (referência Grok) |
| Card de escolha única | Card com título e descrição; o escolhido com borda de 1,5 px na cor `--ui-text` | Primeira visita: forma de colaborar |
| Campo de texto | 48 px, fundo `bg-elevated`, borda `border-default`, raio `rounded-paro-md`, rótulo sempre visível acima | Sugestão de rua; telas da equipe |

Regras:

- Nenhum campo de nome, CPF, telefone, e-mail ou placa (ADR 0004).
- Rótulo sempre visível; o placeholder nunca substitui o rótulo.
- Erro em `text-error` abaixo do campo, com ícone. Nunca só cor.
- A forma de colaborar começa desligada (ADR 0010).

### Cards

Todos com fundo `bg-elevated`, borda de 1 px em `border-default`, raio `rounded-paro-lg` e sem sombra.

| Card | Conteúdo | Referência de layout |
|---|---|---|
| Melhor chance | Etiqueta "MELHOR CHANCE · 19H" em `text-muted`, nome da rua, amostra do padrão com rótulo, base, distância a pé e "Previsão, não garantia." | Pangea: card de destaque no topo |
| Linha de rua coberta | Amostra do padrão, nome da rua, rótulo e base no subtítulo, distância numa etiqueta à direita; raio `rounded-paro-md` | Pangea: linha com distância; Waymo: valor à direita |
| Seu registro de vaga | Saída prevista em `text-xl` como título, rua coberta abaixo, linha de ações com ícone e rótulo (Mudar saída, Voltar até o carro) | Waymo: viagem em andamento |
| Bloco de dado | Título com ícone e linhas de dado separadas por `border-default` | Pangea: blocos agrupados no detalhe |
| Aviso | Fundo do sinal correspondente, texto do mesmo par, ícone, link opcional; raio `rounded-paro-md` | Lime: faixa informativa |

### Tabelas

Só no painel desktop e nas telas da equipe. No mobile, toda tabela vira lista de linhas.

- Sem caixa em volta: linhas separadas por 1 px em `border-default`.
- Cabeçalho em etiqueta (`text-xs`, caixa alta) em `text-muted`; linhas de 48 px.
- Números alinhados à direita, com algarismos tabulares.
- Coluna de faixa de chance sempre com amostra de padrão e rótulo.
- Sem listras alternadas e sem bordas verticais.

### Gráfico de chance por faixa horária

No detalhe da rua (referência Swarm):

- Uma barra por faixa horária, das 17h às 23h, preenchida com o padrão da sua faixa de chance na cor `--ui-text`. A altura é a chance; Sem dado aparece como barra baixa com contorno tracejado.
- A faixa horária selecionada ganha fundo `bg-primary-100` atrás da barra.
- Exceção ao alvo de toque de 44 px: as 12 barras têm cerca de 25 px de largura no celular, porque não cabem com 44 px em 375 px. O Bloco de dado abaixo do gráfico mostra a faixa horária selecionada por texto.
- Resumo no canto: "Melhor faixa: 18h–18h30".
- Eixo X em `text-xs`, `text-muted`.

### Gavetas, avisos flutuantes e carregamento

| Componente | Regra | Referência |
|---|---|---|
| Gaveta sobre o mapa | Raio `rounded-paro-lg` no topo, alça de 32 × 4 px, botão de fechar; dois pontos de parada (resumo e expandida) | Lime: gaveta da rua |
| Gaveta de escolha | Título à esquerda, "Salvar" como link à direita, grupos de chips | Pangea: ajustes do mapa |
| Aviso flutuante | Fundo na cor `--ui-text`, texto na cor `--ui-bg`, raio `rounded-paro-md`, some em 3 s | Waymo: confirmação |
| Esqueleto | Blocos em `bg-muted` no formato do conteúdo, sem brilho animado | Waymo e Lime: carregamento |
| Etiqueta sobre o mapa | Fundo `bg-elevated`, borda, ícone de pegadas e a distância em metros em linha reta ("140 m em linha reta"). Sem minutos, porque o Parô não calcula rota (ADR 0020) | Lime: tempo a pé |

O aviso "Dados de demonstração" (ADR 0012) usa o card Aviso com o sinal `warning`, fixo no topo do Início, do Mapa e do Detalhe da rua, sem botão de fechar.

### Movimento

- Entrada de conteúdo: opacidade de 0 a 1 com deslocamento de 8 px, 300 ms, `cubic-bezier(0.16, 1, 0.3, 1)`.
- Gavetas: 250 ms com a mesma curva.
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

- **Barra de abas flutuante** (referência Waymo), com raio `rounded-paro-lg`, fundo `bg-elevated` e borda. Quatro abas com ícone e rótulo: Início, Mapa, Minha vaga e Ajustes. A aba ativa ganha fundo `bg-primary-100` e texto `text-primary`. A barra some em Registrar vaga e na Primeira visita.
- **Mapa em tela cheia com gaveta** (referência Lime): botões de ícone flutuam no canto direito; tocar num trecho abre a gaveta de resumo; expandir abre o Detalhe da rua.
- **Detalhe da rua** abre por cima, com botão de voltar no topo esquerdo.
- **Ação principal fixa no rodapé** em toda tela que tem uma.
- **Primeira visita** em telas cheias sem barra de abas; a explicação de privacidade abre como gaveta a partir de um link (referência Tinder).

### Desktop

A partir de 1024 px, o Parô é um painel único de três colunas (referência Turo). Início e Mapa viram uma tela só: a aba Mapa não aparece e não há barra de abas flutuante.

- **Barra lateral de 280 px**, fundo `bg-default` e borda à direita, com rolagem própria e margem lateral de 24 px. No topo, o nome "Parô" em texto, Figtree `text-xl`, negrito, provisório até os arquivos do logotipo entrarem no repositório. Depois, a navegação (Início, Minha vaga e Ajustes, com ícone e rótulo; o item ativo segue a aba ativa da barra de abas), o aviso "Dados de demonstração", as abas de faixa horária, o card de melhor chance, a lista de ruas cobertas e a pergunta "A previsão ajudou hoje?".
- **Centro:** o mapa da área, com o botão de centralizar no canto superior direito e a legenda no canto inferior direito.
- **Painel à direita de 360 px**, fundo `bg-default`, borda à esquerda e margem lateral de 24 px. Começa fechado e tem botão de fechar (botão de ícone, no topo direito); Esc também fecha. Abre com o Detalhe da rua completo (ao escolher uma rua no mapa ou na lista), com Minha vaga (incluindo Registrar vaga e Seu registro de vaga) ou com Ajustes. O mapa continua visível, entre a barra lateral e o painel. A ação principal fica fixa no rodapé do painel.
- **Voltar até o carro** abre no centro, no lugar do mapa da área, com a barra lateral ao lado.
- Os endereços continuam os mesmos do celular (`/ruas/[id]`, `/minha-vaga`, `/ajustes`): no desktop, cada um abre o painel com o conteúdo certo.
- A Primeira visita e as telas da equipe ficam fora do painel e continuam como no celular.

### Fluxos

| Fluxo | Caminho |
|---|---|
| Consultar | Início → linha da rua → Detalhe da rua → Como chegar |
| Pelo mapa | Mapa → toque no trecho → gaveta → Detalhe da rua |
| Registrar | Minha vaga → Registrar vaga → escolher rua e saída prevista → Seu registro de vaga |
| Encerrar | Seu registro de vaga → Saí → aviso flutuante → Início |
| Voltar ao carro | Bloco do registro de vaga no Início (referência Rivian) → mapa com ponto do carro e posição atual |

## Tema escuro

O tema segue o sistema por padrão e pode ser forçado nos Ajustes. Todas as cores têm valor escuro nas tabelas acima. O fundo é um carvão quente (`#191919`), nunca preto puro; o botão principal inverte para claro com texto escuro; os pastéis viram tons profundos com texto claro.

## Logotipo

O logotipo e o símbolo continuam os mesmos, usados a partir dos arquivos originais, sem recriar em código e sem recolorir. Sobre `bg-default` claro usa a versão para fundo claro; no tema escuro, a versão para fundo escuro.

## Pendências

| # | Assunto | Situação |
|---|---|---|
| 1 | Arquivos do logotipo e do ícone do app | Precisam ser copiados para este repositório, porque o repositório de marca deixou de ser referência. Até lá, o PWA usa um ícone provisório (`public/icone.svg`) |
| 2 | Protótipo no Figma | Precisa ser atualizado para a paleta Papel e a fonte Figtree |
