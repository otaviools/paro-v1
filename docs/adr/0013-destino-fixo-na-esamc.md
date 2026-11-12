# Destino fixo na ESAMC; "Sugerir rua" só como pista para a equipe

O protótipo tinha a tela "Busca por destino", mas a área coberta é fixa (ADR 0001) e toda distância é calculada até a ESAMC. Decidimos tirar "Busca por destino": o destino é sempre a entrada da ESAMC. "Sugerir rua para medição" continua como um formulário simples, sem dados pessoais, em que a pessoa indica uma rua fora da área coberta. A sugestão não muda o mapa e só serve de pista para a equipe quando a área coberta crescer.

## Consequences

- A tela 3 da Figura 1 sai do fluxo. A decisão pode ser revista quando a área coberta crescer.
- O item 10 da Tabela 9 deixa de depender de "0 ruas medidas" e passa a valer para ruas fora da área coberta.
