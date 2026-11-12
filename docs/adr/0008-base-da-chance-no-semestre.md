# A chance usa só o semestre atual e mostra sua base

O plano promete mostrar "sempre o horário da medição", mas pela ADR 0005 a chance resume várias noites, e não existe um único horário. Decidimos que só contam as observações do semestre letivo atual. No começo de cada semestre, tudo volta para "Sem dado" até juntar 4 observações novas (ADR 0007). No lugar do "horário da medição", cada chance mostra a sua **base**: o número de noites e a data da última observação, como "Base: 6 noites · última em 04/11".

## Considered Options

- **Janela móvel (ex.: últimas 8 semanas):** acompanha mudanças no meio do semestre, mas é mais difícil de explicar e faz o rótulo mudar sem motivo aparente para o usuário.

## Consequences

- Todo semestre começa com o mapa em "Sem dado". As observações precisam ser refeitas nas primeiras semanas de aula.
- Os textos do plano que dizem "horário da medição" passam a dizer "base".
