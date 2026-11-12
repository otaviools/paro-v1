# Mapa de ruas real com MapLibre GL

O protótipo tem uma tela de mapa, mas o `Arquitetura.md` (fora deste repositório) deixava a biblioteca de mapa de fora e propunha só uma lista de ruas. Decidimos usar um mapa de ruas real, com zoom e arrasto, desenhado com MapLibre GL (WebGL). As ruas cobertas aparecem por cima do mapa com o padrão da sua faixa de chance. O mapa é mais bonito, mostra onde cada rua fica em relação à ESAMC e deixa espaço para a área coberta crescer.

## Considered Options

- **Mapa esquemático em SVG:** é mais leve e os padrões são nativos, mas não cresce junto com a área coberta.
- **Só lista de ruas:** é o mais simples, mas perde a noção de localização.

## Consequences

- Os padrões (sólido, hachura, pontilhado, tracejado) precisam ser desenhados como imagens de padrão de linha do MapLibre e conferidos no celular, sob luz noturna e no tema escuro.
- O app passa a depender de um provedor de tiles. Cada pedido de tile mostra ao provedor o IP de quem vê e a área que está sendo vista.
- WebGL pesa mais em celulares de entrada. A lista de ruas ordenada por chance continua como alternativa acessível.
- O MapLibre GL não depende de framework. A escolha entre Vue e React não depende do mapa.
