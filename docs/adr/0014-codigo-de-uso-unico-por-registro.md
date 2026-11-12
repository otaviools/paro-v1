# Código de uso único para alterar ou encerrar um registro de vaga

O protótipo permite mudar a saída prevista e "Avisar quando eu sair", mas pela ADR 0004 os registros de vaga não têm identificador, e o servidor não saberia qual registro alterar. Decidimos que cada registro de vaga recebe, ao ser enviado, um código aleatório de uso único que fica só no celular. Com esse código, a pessoa pode mudar a saída prevista ou avisar "saí". O "saí" encerra o registro e tira a saída da contagem de saídas previstas. O código expira no fim da noite e não liga registros entre noites.

## Considered Options

- **Enviar um registro novo para corrigir:** sem como apagar o antigo, a contagem de saídas previstas duplicaria.
- **Registro imutável:** é mais simples, mas elimina o "Avisar quando eu sair" e a tarefa 3 do teste de usabilidade.

## Consequences

- Se a pessoa limpar os dados do celular, perde o código e não consegue mais alterar o registro daquela noite. Ele expira sozinho.
