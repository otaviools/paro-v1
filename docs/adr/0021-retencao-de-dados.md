# Retenção: registros de vaga apagados ao fim da noite

O plano não definia por quanto tempo os dados ficam no servidor, e o `Arquitetura.md` falava em "~30 dias" para eventos crus. Seguindo os princípios de finalidade e minimização da LGPD, decidimos:

- **Registros de vaga:** apagados ao fim de cada noite. Antes disso, o servidor guarda só o total de registros por rua coberta e faixa horária, sem identificador nem código, para acompanhar a meta de 20 registros por noite.
- **Sessões com identificador mensal (ADR 0004):** guardadas por 60 dias. Depois viram totais e são apagadas.
- **Observações:** guardadas sem prazo, porque não contêm dado de ninguém.
- **Sugestões de rua (ADR 0013):** apagadas depois que a equipe lê. Como são texto livre, alguém pode digitar um dado pessoal sem querer.

## Consequences

- Precisa existir uma rotina diária no servidor que agrega e apaga os registros da noite anterior.
- Não dá para analisar depois registros de vaga individuais, só os totais.
