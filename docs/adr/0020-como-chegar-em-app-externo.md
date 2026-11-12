# "Como chegar" abre o app de navegação; "Voltar até o carro" fica no Parô

Montar uma rota de carro dentro do Parô exigiria um serviço de rotas de terceiro ou um motor de rotas próprio, o que é demais para cinco ruas. Decidimos que "Como chegar" abre o app de navegação padrão do celular (Google Maps, Waze ou Apple Maps) com o ponto da rua coberta como destino. Isso acontece só quando a pessoa toca no botão, e o app avisa que vai abrir em outro app. "Voltar até o carro" fica dentro do Parô e mostra no mapa o ponto do carro guardado no celular (ADR 0003) e a posição atual, com a distância, sem calcular rota.

## Consequences

- Ao tocar em "Como chegar", o app de navegação de terceiro recebe a rua de destino e a posição da pessoa. Isso é aceito porque a ação é explícita e acontece fora do Parô.
