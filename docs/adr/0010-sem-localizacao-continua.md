# Sem localização contínua; duas formas de colaborar

O plano oferecia três formas de colaborar, vindas da P12: localização sob demanda, localização anônima e contínua, e registro manual. Depois das ADRs 0003, 0004 e 0009, a localização contínua não tem o que alimentar. Ela também criaria um rastro de posições que identifica pessoas, e um app web (PWA) não consegue ler a localização com o app fechado. Decidimos tirar a localização contínua. Ficam duas formas de colaborar, as duas desligadas por padrão: o **registro com localização ligada**, em que o celular propõe a rua coberta e guarda o ponto do carro só no aparelho, e o **registro manual**, em que a pessoa escolhe a rua numa lista.

## Consequences

- As telas "Primeira visita" e Ajustes, o item 8 da Tabela 9 e a Tabela 5 deixam de falar em "três formas".
- Os 42% que aceitaram a localização contínua na P12 não viram uma funcionalidade. A decisão pode ser revista se surgir um app nativo com um uso claro para ela.
