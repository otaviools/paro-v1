# Design system do Parô

Regras de interface para o app Parô: cores, tipografia, espaçamentos, componentes base e padrões de navegação. Paleta **Papel**: base quase monocromática em tons quentes, com cor pastel só em pontos pequenos.

## Fontes de verdade

| Assunto | Fonte |
|---|---|
| Regras de produto (faixas de chance, base, Sem dado, privacidade) | `docs/adr/` e `CONTEXT.md` |
| Padrões de layout e componente | `docs/design/referencias.md` (Waymo, Pangea e Lime em destaque) |
| Cores, tipografia, espaçamentos e componentes | Este documento |
| Logotipo e símbolo | Os arquivos atuais do logotipo do Parô, sem alteração |

As referências do Mobbin entram só como padrão de layout, navegação e comportamento de componente. Nada de marca, logotipo, ilustração, cor ou texto dos apps de referência entra no Parô.

Os componentes usam sempre os tokens deste documento (variáveis CSS `--paro-*`), nunca o valor hexadecimal direto.

## Princípios

1. **Chance, não garantia.** Toda tela com chance mostra a faixa de chance com rótulo e a base. Nenhum texto promete vaga.
2. **Rótulo e padrão, nunca só cor.** A faixa de chance é comunicada por rótulo textual mais padrão de preenchimento, na cor do texto.
3. **Cor é escassa.** A interface é quase monocromática. Tons pastel aparecem só em chips ativos, etiquetas, links e avisos. Nenhuma área grande é colorida.
4. **Noite primeiro.** O uso principal é à noite. O tema escuro é tão completo quanto o claro.
5. **Plano e silencioso.** Borda de 1 px, sem sombra, sem degradê, sem efeito de vidro.
6. **Uma ação principal por tela**, fixa no rodapé no mobile.

## Cores

### Tokens

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--paro-fundo` | `#F7F6F3` | `#191919` | Fundo da página |
| `--paro-superficie` | `#FFFFFF` | `#202020` | Cards, gavetas, campos, barra de abas |
| `--paro-superficie-suave` | `#F3F2EE` | `#262626` | Botão secundário, chips inativos, esqueleto |
| `--paro-borda` | `#EAEAEA` | `#2C2C2C` | Contorno de cards, campos e separadores |
| `--paro-texto` | `#2F3437` | `#E8E7E4` | Texto principal; traço dos padrões de faixa de chance |
| `--paro-texto-fraco` | `#6F6E6A` | `#9B9A97` | Texto secundário, base, distância |
| `--paro-acao` | `#111111` | `#E8E7E4` | Fundo do botão principal |
| `--paro-acao-texto` | `#FFFFFF` | `#191919` | Texto do botão principal |
| `--paro-acao-hover` | `#333333` | `#D6D5D1` | Botão principal pressionado ou com cursor |
| `--paro-destaque` | `#E1F3FE` | `#1C3446` | Chip ativo, item selecionado, fundo de aviso |
| `--paro-destaque-texto` | `#1F6C9F` | `#A9D3F2` | Texto sobre o destaque; links |
| `--paro-foco` | `#1F6C9F` | `#A9D3F2` | Anel de foco |

### Sinais

Usados só em mensagens, ícones e etiquetas. Nunca nas faixas de chance.

| Token | Fundo claro | Texto claro | Fundo escuro | Texto escuro | Uso |
|---|---|---|---|---|---|
| `--paro-perigo` | `#FDEBEC` | `#9F2F2D` | `#3B1E1D` | `#F2B8B5` | Apagar histórico, erros |
| `--paro-sucesso` | `#EDF3EC` | `#346538` | `#1F3321` | `#B6D7B3` | Confirmação de registro e de "Saí" |
| `--paro-alerta` | `#FBF3DB` | `#8A5A00` | `#3A2F14` | `#EBCB82` | Aviso "Dados de demonstração" |

### Mapa

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--paro-mapa-fundo` | `#F3F2EE` | `#1E1E1E` | Fundo do mapa |
| `--paro-mapa-quadra` | `#EBEAE5` | `#252525` | Quadras |
| `--paro-mapa-parque` | `#E8EEE6` | `#1F2620` | Praças e parques |
| `--paro-mapa-via` | `#FFFFFF` | `#2E2E2E` | Vias |
| `--paro-mapa-meio-fio` | `#E0DED8` | `#363636` | Contorno das vias |
| `--paro-mapa-rotulo` | `#6F6E6A` | `#9B9A97` | Nome de rua, com halo na cor da via |

As ruas cobertas são desenhadas por cima com o padrão da sua faixa de chance, em `--paro-texto`.

### Contraste (WCAG 2.1, nível AA)

AA exige 4,5:1 para texto normal. Todas as combinações de texto da paleta passam.

| Texto sobre fundo | Claro | Escuro |
|---|---|---|
| texto sobre fundo | 11,65 | 14,22 |
| texto sobre superfície | 12,60 | 13,18 |
| texto fraco sobre fundo | 4,72 | 6,25 |
| texto fraco sobre superfície | 5,10 | 5,79 |
| texto fraco sobre superfície suave | 4,56 | 5,38 |
| texto do botão sobre ação | 18,88 | 14,22 |
| link sobre superfície | 5,67 | 10,31 |
| link sobre fundo | 5,25 | — |
| texto de destaque sobre destaque | 4,98 | 8,16 |
| perigo | 6,26 | 8,85 |
| sucesso | 6,08 | 8,60 |
| alerta | 5,35 | 8,39 |
| rótulo do mapa sobre fundo do mapa | 4,56 | 5,92 |

Regra: texto fraco nunca sobre `--paro-destaque` nem sobre os fundos de sinal. Nesses fundos, só o texto do próprio par.

## Tipografia

| Papel | Família | Observação |
|---|---|---|
| Interface e texto | **Figtree** | Amigável, aberta, legível em tamanhos pequenos. Servida localmente pelo app, para funcionar offline no PWA |
| Dados monoespaçados | **JetBrains Mono** | Só nas telas da equipe (observações, totais) |

As duas são fontes livres (SIL Open Font License).

| Token | Tamanho | Peso | Uso no app |
|---|---|---|---|
| `--paro-texto-titulo` | 26 px | 700 | Título de tela |
| `--paro-texto-stat` | 22 px | 700 | Nome da rua no detalhe; saída prevista na vaga ativa |
| `--paro-texto-botao` | 17 px | 600 | Botão principal |
| `--paro-texto-card` | 16 px | 600 | Nome da rua no card de melhor chance; título de card |
| `--paro-texto-corpo` | 15 px | 500 | Linha da lista de ruas, corpo |
| `--paro-texto-interface` | 14 px | 500 | Abas, campos, botão secundário |
| `--paro-texto-legenda` | 13 px | 500 | Base, distância, legenda |
| `--paro-texto-nota` | 12 px | 400 | Eixo do gráfico, notas |
| `--paro-texto-etiqueta` | 11 px | 600, caixa alta, tracking 0,08em | Títulos de seção, chips de horário, etiquetas |

- Altura de linha de 1,5 no corpo e 1,2 em títulos.
- Texto principal nunca em preto puro: sempre `--paro-texto`.
- Sem texto corrido centralizado; no máximo 70 caracteres por linha.
- Algarismos tabulares (`font-variant-numeric: tabular-nums`) em horários, distâncias e na base.
- O número da chance só aparece no detalhe da rua, junto com a base (ADR 0006).

## Espaçamento, raios e alturas

Escala de 4 px: 4, 8, 12, 16, 20, 24, 32, 48, 64 (`--paro-esp-1` a `--paro-esp-16`). Nenhum valor fora dela.

| Medida | Mobile | Desktop |
|---|---|---|
| Margem lateral | 20 px | 32 px |
| Padding interno de card | 16 px | 24 px |
| Espaço entre cards | 12 px | 16 px |
| Espaço entre seções | 32 px | 48 px |
| Botão principal | 52 px | 44 px |
| Botão de ícone | 40 px | 36 px |
| Campo | 48 px | 40 px |
| Chip de horário | 32 px | 32 px |
| Barra de abas | 64 px + área segura | — |
| Barra lateral | — | 280 px |

| Raio | Onde |
|---|---|
| 3 px | Amostra de padrão de faixa de chance |
| 10 px | Botões, campos |
| 12 px | Linha da lista de ruas, avisos |
| 16 px | Cards, gavetas, container do mapa |
| 20 px | Barra de abas |
| pílula | Só chips de horário e etiquetas pequenas |

Botões e cards nunca são pílula.

## Faixas de chance

Regra de produto da ADR 0006. Sempre rótulo **e** padrão, desenhados em `--paro-texto`. A cor não muda entre faixas.

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
| Principal | Fundo `--paro-acao`, texto `--paro-acao-texto`, raio 10 px, 52 px, largura total, fixo no rodapé | Uma por tela: "Registrar vaga", "Saí", "Continuar" | Lime: botão grande fixo no rodapé |
| Secundário | Fundo `--paro-superficie`, borda `--paro-borda`, texto `--paro-texto`, raio 10 px | Ao lado da principal: "Mudar saída" | Lime: dois botões lado a lado |
| De ícone | Quadrado de 40 px com raio 10 px, fundo `--paro-superficie`, borda `--paro-borda` | Controles do mapa, fechar gaveta, compartilhar | Lime e Pangea: botões flutuantes |
| Link | Texto `--paro-destaque-texto`, sem fundo | "Como a chance é calculada", "Cancelar" | Lime: link de cancelar |
| Destrutivo | Texto `--paro-perigo` (texto), sem fundo, sempre com confirmação | "Apagar histórico" | Grok: ação de apagar no fim da lista |

Estados:

- **Pressionado:** fundo `--paro-acao-hover` e `transform: scale(0.98)`.
- **Foco:** anel de 2 px em `--paro-foco`, afastado 2 px.
- **Desativado:** evitar. Quando inevitável, opacidade 0,4 e o motivo escrito ao lado.
- **Carregando:** indicador no lugar do texto, mesma largura.

Alvo de toque mínimo de 44 × 44 px.

### Formulários

| Componente | Visual | Onde |
|---|---|---|
| Chips de faixa horária | Pílula de 32 px, texto em etiqueta (11 px, caixa alta); inativo com fundo `--paro-superficie` e borda; ativo com fundo `--paro-destaque` e texto `--paro-destaque-texto` | Abas Agora, 19h, 21h e 22h; saída prevista no registro (referência Waymo) |
| Seletor de opção com ícone | Botões lado a lado, raio 10 px; o selecionado com fundo `--paro-destaque` e borda de 1,5 px em `--paro-destaque-texto` | Escolha da rua coberta no registro manual (referência Pangea) |
| Linha com seletor liga/desliga | Título, parágrafo explicativo em `--paro-texto-fraco` e seletor à direita; ligado em `--paro-acao` | Ajustes: usar localização, forma de colaborar (referência Grok) |
| Card de escolha única | Card com título e descrição; o escolhido com borda de 1,5 px em `--paro-texto` | Primeira visita: forma de colaborar |
| Campo de texto | 48 px, fundo `--paro-superficie`, borda `--paro-borda`, raio 10 px, rótulo sempre visível acima | Sugestão de rua; telas da equipe |

Regras:

- Nenhum campo de nome, CPF, telefone, e-mail ou placa (ADR 0004).
- Rótulo sempre visível; o placeholder nunca substitui o rótulo.
- Erro em texto `--paro-perigo` abaixo do campo, com ícone. Nunca só cor.
- A forma de colaborar começa desligada (ADR 0010).

### Cards

Todos com fundo `--paro-superficie`, borda de 1 px em `--paro-borda`, raio de 16 px e sem sombra.

| Card | Conteúdo | Referência de layout |
|---|---|---|
| Melhor chance | Etiqueta "MELHOR CHANCE · 19H" em `--paro-texto-fraco`, nome da rua, amostra do padrão com rótulo, base, distância a pé e "Previsão, não garantia." | Pangea: card de destaque no topo |
| Linha de rua coberta | Amostra do padrão, nome da rua, rótulo e base no subtítulo, distância numa etiqueta à direita; raio 12 px | Pangea: linha com distância; Waymo: valor à direita |
| Vaga ativa | Saída prevista em 22 px como título, rua coberta abaixo, linha de ações com ícone e rótulo (Mudar saída, Voltar até o carro) | Waymo: viagem em andamento |
| Bloco de dado | Título com ícone e linhas de dado separadas por `--paro-borda` | Pangea: blocos agrupados no detalhe |
| Aviso | Fundo do sinal correspondente, texto do mesmo par, ícone, link opcional; raio 12 px | Lime: faixa informativa |

### Tabelas

Só no painel desktop e nas telas da equipe. No mobile, toda tabela vira lista de linhas.

- Sem caixa em volta: linhas separadas por 1 px em `--paro-borda`.
- Cabeçalho em etiqueta (11 px, caixa alta) em `--paro-texto-fraco`; linhas de 48 px.
- Números alinhados à direita, com algarismos tabulares.
- Coluna de faixa de chance sempre com amostra de padrão e rótulo.
- Sem listras alternadas e sem bordas verticais.

### Gráfico de chance por faixa horária

No detalhe da rua (referência Swarm):

- Uma barra por faixa horária, das 17h às 23h, preenchida com o padrão da sua faixa de chance em `--paro-texto`. A altura é a chance; Sem dado aparece como barra baixa com contorno tracejado.
- A faixa horária selecionada ganha fundo `--paro-destaque` atrás da barra.
- Resumo no canto: "Melhor faixa: 18h–18h30".
- Eixo X em `--paro-texto-nota`, `--paro-texto-fraco`.

### Gavetas, avisos flutuantes e carregamento

| Componente | Regra | Referência |
|---|---|---|
| Gaveta sobre o mapa | Raio de 16 px no topo, alça de 32 × 4 px, botão de fechar; dois pontos de parada (resumo e expandida) | Lime: gaveta da rua |
| Gaveta de escolha | Título à esquerda, "Salvar" como link à direita, grupos de chips | Pangea: ajustes do mapa |
| Aviso flutuante | Fundo `--paro-texto`, texto `--paro-fundo`, raio 12 px, some em 3 s | Waymo: confirmação |
| Esqueleto | Blocos em `--paro-superficie-suave` no formato do conteúdo, sem brilho animado | Waymo e Lime: carregamento |
| Etiqueta sobre o mapa | Fundo `--paro-superficie`, borda, ícone de pessoa a pé e minutos | Lime: tempo a pé |

O aviso "Dados de demonstração" (ADR 0012) usa o card Aviso com o sinal `--paro-alerta`, fixo no topo do Início, do Mapa e do Detalhe da rua, sem botão de fechar.

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

- **Barra de abas flutuante** (referência Waymo), com raio de 20 px, fundo `--paro-superficie` e borda. Quatro abas com ícone e rótulo: Início, Mapa, Minha vaga e Ajustes. A aba ativa ganha fundo `--paro-destaque` e texto `--paro-destaque-texto`. A barra some em Registrar vaga e na Primeira visita.
- **Mapa em tela cheia com gaveta** (referência Lime): botões de ícone flutuam no canto direito; tocar num trecho abre a gaveta de resumo; expandir abre o Detalhe da rua.
- **Detalhe da rua** abre por cima, com botão de voltar no topo esquerdo.
- **Ação principal fixa no rodapé** em toda tela que tem uma.
- **Primeira visita** em telas cheias sem barra de abas; a explicação de privacidade abre como gaveta a partir de um link (referência Tinder).

### Desktop

Três colunas (referência Turo): barra lateral de 280 px com a navegação, o card de melhor chance e a lista de ruas cobertas; o mapa no centro, com a legenda no canto inferior; o painel de Detalhe da rua à direita, que abre ao selecionar uma rua.

### Fluxos

| Fluxo | Caminho |
|---|---|
| Consultar | Início → linha da rua → Detalhe da rua → Como chegar |
| Pelo mapa | Mapa → toque no trecho → gaveta → Detalhe da rua |
| Registrar | Minha vaga → Registrar vaga → escolher rua e saída prevista → Vaga ativa |
| Encerrar | Vaga ativa → Saí → aviso flutuante → Início |
| Voltar ao carro | Bloco da vaga ativa no Início (referência Rivian) → mapa com ponto do carro e posição atual |

## Tema escuro

O tema segue o sistema por padrão e pode ser forçado nos Ajustes. Todos os tokens têm valor escuro nas tabelas acima. O fundo é um carvão quente (`#191919`), nunca preto puro; o botão principal inverte para claro com texto escuro; os pastéis viram tons profundos com texto claro.

## Logotipo

O logotipo e o símbolo continuam os mesmos, usados a partir dos arquivos originais, sem recriar em código e sem recolorir. Sobre `--paro-fundo` claro usa a versão para fundo claro; no tema escuro, a versão para fundo escuro.

## Pendências

| # | Assunto | Situação |
|---|---|---|
| 1 | Arquivos do logotipo e do ícone do app | Precisam ser copiados para este repositório, porque o repositório de marca deixou de ser referência. Até lá, o PWA usa um ícone provisório (`public/icone.svg`) |
| 2 | Protótipo no Figma | Precisa ser atualizado para a paleta Papel e a fonte Figtree |
