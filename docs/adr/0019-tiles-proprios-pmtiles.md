# Tiles próprios em PMTiles, publicados com o app

O mapa MapLibre (ADR 0017) precisa de tiles. Decidimos gerar, a partir do OpenStreetMap, um arquivo PMTiles (Protomaps) com o recorte do centro de Uberlândia e publicá-lo junto com o app na Vercel. Nenhum provedor de tiles recebe o IP de quem vê o mapa, o que mantém o espírito do "sem cadastro" (ADR 0004). Também não há chave de API nem limite de uso, e o PWA pode guardar o arquivo para funcionar offline.

## Considered Options

- **OpenFreeMap:** é gratuito e sem chave, mas o serviço é mantido por voluntários e recebe o IP de quem vê.
- **MapTiler ou similar:** é confiável e tem estilos prontos, mas tem limite de uso, recebe o IP de quem vê e exige proteger a chave.

## Consequences

- O estilo do mapa (cores, tema escuro) é feito pela equipe em cima dos estilos abertos do Protomaps.
- Para aumentar a área coberta, é preciso gerar o arquivo PMTiles de novo e republicar o app.
- O mapa de fundo envelhece com o tempo. O arquivo deve ser regerado a cada semestre.
