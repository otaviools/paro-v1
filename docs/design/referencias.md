# Referências de UI por tela

Referências do Mobbin escolhidas pela equipe, uma por tela do Parô, com os componentes complementares da Waymo, da Pangea e da Lime. Todas estão na coleção privada "[paro]" do Mobbin, junto com as alternativas que não foram escolhidas.

Das referências se aproveita só o padrão de layout, navegação e componente. Cores, logotipos, ilustrações, textos e marcas dos apps de referência não entram no Parô; as cores, a tipografia e os componentes do Parô estão em `docs/design/design-system.md` (paleta Papel).

A Waymo, a Pangea e a Lime são o destaque de UI e componentes.

## 1. Início

**Escolhida:** [Pangea, tela inicial](https://mobbin.com/screens/76b15bc8-7039-4bf3-95b4-8991645d6912)

- Card de destaque no topo como modelo do card de melhor chance.
- Lista "Nearby" como modelo da linha de rua coberta: amostra do padrão, nome da rua, rótulo e base no subtítulo, distância a pé numa pílula à direita.

**Complementos:**

- [Waymo, início](https://mobbin.com/screens/95ada053-c4b3-48ed-b65c-b54fc6594dc2): chips de atalho em pílula, modelo das abas Agora, 19h, 21h e 22h.
- [Waymo, favoritos](https://mobbin.com/screens/db94bab7-775a-45ce-8c79-55eab2ef8e7d): linha com valor alinhado à direita.
- [Pangea, início com abas](https://mobbin.com/screens/cad79276-1b5d-46f7-a2f4-e69e1989e206): abas de texto acima da lista.
- [Lime, aviso](https://mobbin.com/screens/d2298871-52c4-432d-a471-f72596e6d1cd): faixa informativa com link, modelo do aviso "Dados de demonstração".

## 2. Mapa

**Escolhida:** [Lime, zonas e estacionamento](https://mobbin.com/screens/54c0c3e3-be56-4c51-97e2-851be5e0c304)

- Legenda em que cada faixa de chance tem desenho e explicação próprios, sem depender de cor.
- Botão grande no rodapé para fechar a legenda.

**Complementos:**

- [Lime, mapa com veículo](https://mobbin.com/screens/1a44d14b-8560-4e19-b000-68bc0c97be97): mapa escuro, botões circulares flutuantes, etiqueta de tempo a pé e gaveta com o resumo do item tocado. É a única referência de tema escuro.
- [Lime, corrida](https://mobbin.com/screens/8123c465-c2d7-4730-bfe3-c98536e037aa): gaveta compacta sobre o mapa com linha de métricas.

**Alternativas na coleção:** Forest (legenda em lista), Lyft (camada de estacionamento), TikTok (mapa com gaveta de lista), Neo Financial (alternância lista e mapa).

## 3. Detalhe da rua

**Escolhida:** [Swarm, movimento por horário](https://mobbin.com/screens/561ae44e-0786-46cb-b569-f365a59478c2)

- Gráfico da noite inteira, adaptado para uma barra por faixa horária das 17h às 23h, cada uma com o padrão da sua faixa de chance.
- Melhor horário resumido no canto superior ("Melhor faixa: 18h–18h30").

**Complementos:**

- [Pangea, local](https://mobbin.com/screens/c3ac4a5a-1ab3-42db-8cf7-00f55536c270): botão principal em pílula com botões circulares de ícone ao lado, modelo de "Como chegar".
- [Pangea, detalhe do local](https://mobbin.com/screens/e054c83a-99ae-4eb8-88c3-c0bb300865e5): blocos agrupados com cabeçalho de ícone, modelo dos blocos de base e saídas previstas.

**Alternativas na coleção:** Google Maps (barras com balão), IKEA (nota sobre a origem da previsão), Snapchat (ações abaixo do gráfico), Fly Delta (indicador com rótulo).

## 4. Registrar vaga

**Escolhida:** [Pangea, tipo de local](https://mobbin.com/screens/c9f98b6f-3f22-4203-9e58-9475e93284cf)

- Seleção por botões com ícone, lado a lado, modelo da escolha da rua coberta no registro manual.
- Cards agrupados por assunto, com o botão de salvar no topo.

**Complementos:**

- [Pangea, ajustes do mapa](https://mobbin.com/screens/a05e7c41-8bac-4095-9320-f47228385c11): gaveta com grupos de pílulas de escolha, modelo da saída prevista.
- [Lime, mapa com veículo](https://mobbin.com/screens/1a44d14b-8560-4e19-b000-68bc0c97be97): botão principal grande fixo no rodapé, modelo de "Registrar vaga".

**Alternativas na coleção:** Setel (duração em botões e "Trocar" local), Fly Delta (salvar localização como opção).

## 5. Seu registro de vaga

**Escolhida:** [Waymo, viagem em andamento](https://mobbin.com/screens/0bbf4773-7af0-447a-978a-2b2f8879a40b)

- Título grande com a informação principal da sessão, modelo de "Saída prevista: 21h30".
- Card branco com linha de ações (ícone e rótulo) embaixo, modelo de Mudar saída e Voltar até o carro.
- Barra de abas flutuante em pílula.

**Complementos:**

- [Lime, corrida](https://mobbin.com/screens/8123c465-c2d7-4730-bfe3-c98536e037aa): botão de encerrar grande fixo no rodapé, modelo de "Saí".
- [Lime, reservado](https://mobbin.com/screens/2d617cef-5079-4f60-9635-d8d9a4b1ea90): dois botões lado a lado com link de cancelar abaixo.
- [Waymo, ajuda](https://mobbin.com/screens/176183d5-08a7-481f-87f7-2fa6d6beeccd): aviso flutuante de confirmação, para depois do "Saí".

**Alternativas na coleção:** Lime (corrida em andamento com botão fixo), Bird (gaveta compacta).

## 6. Voltar até o carro

**Escolhida:** [Rivian, fluxo de localização](https://mobbin.com/flows/9f0e10a5-ae6b-4268-837f-ce7fe2bbea2e)

- Entrada por um bloco na tela inicial, modelo do bloco do registro de vaga no Início.
- Tela com o mapa do ponto do carro e a ação principal embaixo.

**Complementos:**

- [Lime, mapa com veículo](https://mobbin.com/screens/1a44d14b-8560-4e19-b000-68bc0c97be97): etiqueta com minutos a pé sobre o mapa.

**Alternativas na coleção:** Polestar (mapa escuro com "Estacionado desde"), Mercedes-Benz (estado sem localização).

## 7. Primeira visita

**Escolhida:** [Tinder, como a localização é usada](https://mobbin.com/flows/efc405e6-4272-4147-9382-46903f3836d9)

- Explicação de privacidade aberta por um link ao lado do pedido de localização ("a localização exata nunca é compartilhada", ADR 0003).

**Complementos:**

- [Waymo, cards](https://mobbin.com/screens/64b9ab71-9bc0-4829-a073-1e6b5d062338): cards com ilustração, título e texto, modelo das telas de explicação (sem as ilustrações da Waymo).

**Alternativas na coleção:** Polarsteps (caminho para reativar a permissão), Substack e Fabric (cards de escolha única).

## 8. Ajustes

**Escolhida:** [Grok, controles de dados](https://mobbin.com/screens/43441e3d-302d-4d51-b7a7-f5f3cd739085)

- Cada opção com ícone, seletor e parágrafo explicativo.
- Ação de apagar no fim da lista.

**Complementos:**

- [Waymo, conta](https://mobbin.com/screens/dee7077a-b0d0-491f-99c8-a335f7aea2d8): lista agrupada em cards com ícone, rótulo e seta.
- [Pangea, ajustes](https://mobbin.com/screens/082c8159-c5cc-4cdd-8b4c-b6508a78cb6d): linha de configuração com subtítulo e seletor.

**Alternativas na coleção:** Starbucks (bloco com explicação), Tesla Robotaxi (seções com título), DeepSeek (confirmação depois de apagar), Yubo (versão mínima).

## 9. Painel desktop

**Escolhida:** [Turo, local de entrega](https://mobbin.com/screens/44231fd5-06a4-4709-8d92-23baf38a390f)

- Três colunas: lista de ruas e melhor chance à esquerda, mapa no centro, detalhe da rua à direita.
- Legenda no canto do mapa.

**Alternativas na coleção:** Deputy (duas colunas), PamPam (painel flutuante sobre o mapa).

## Estados gerais

- [Waymo, carregando](https://mobbin.com/screens/209d586d-c74b-476b-883f-50b5d26c6a78) e [Lime, carregando](https://mobbin.com/screens/5338b283-d534-44da-a62d-d4e2f79b23d3): tela em esqueleto no formato do conteúdo final.
- [Lime, corrida em andamento](https://mobbin.com/screens/e1abbdbb-4ed7-48a6-b650-d5ffbc1b4192): linha de métricas com ícone, modelo de base e saída prevista lado a lado.
