# Nomes em português, sem acento em nada do código

O código usa os termos do `CONTEXT.md`, mas misturava identificadores com acento (`distânciaAoDestino`, `faixaHorária`, `éDiaLetivoNormal`, `saídaPrevista`) e sem acento (`criarAreaCoberta`, `ruasCobertas`), inclusive em chaves do JSON da API. Decidimos que todo nome no código fica em português e sem acento: funções, variáveis, tipos, chaves de JSON, rotas, colunas do banco, classes CSS, arquivos e pastas. O termo do glossário é escrito sem acento e sem cedilha (`distanciaAoDestino`, `faixaHoraria`, `eDiaLetivoNormal`, `saidaPrevista`, `demonstracao`, `observacoes`). Textos que aparecem na tela e comentários continuam em português com acento.

## Considered Options

- **Acento nos identificadores e sem acento em arquivos:** mantém a grafia exata do glossário no código, mas exige digitar acento em nomes de função, gera chaves de JSON com acento e deixa a regra diferente para cada tipo de nome.
- **Código em inglês:** separa código e domínio e exigiria traduzir cada termo do glossário, perdendo a ligação direta com o `CONTEXT.md`.

## Consequences

- Os identificadores com acento que já existem precisam ser renomeados, inclusive as chaves do JSON das rotas da API e os campos lidos pelas telas. Isso muda o contrato entre servidor e celular de uma vez só.
- A regra é conferida pelo lint quando possível (ADR 0025).
