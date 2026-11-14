# Chamadas à API só dentro de composables, um por recurso

As telas chamavam `useFetch` e `$fetch` diretamente, cada uma com sua própria chave, tratamento de erro e intervalo de atualização, e só parte da lógica ficava em composables (`usePanoramaDaNoite`). A mesma busca aparecia em mais de uma tela com chaves diferentes. Decidimos que toda chamada à API do Parô fica num composable em `app/composables/`, um por recurso (`usePanoramaDaNoite`, `useRuaCoberta`, `useRegistroDeVaga`, `useMetricasDeUso`, `useSugestoesDeRua`...). As leituras usam `useFetch` ou `useAsyncData` com chave fixa, e as ações (POST, PATCH, DELETE) usam `$fetch` dentro do mesmo composable, que devolve funções com nome do domínio (`registrar`, `alterarSaida`, `encerrar`). Páginas e componentes não chamam `useFetch` nem `$fetch` diretamente.

## Considered Options

- **`useFetch` direto nas páginas, composable só quando a busca se repete:** menos arquivos, mas a regra de quando extrair fica subjetiva e as chaves de cache se espalham.

## Consequences

- As chamadas que hoje estão nas páginas e componentes passam para composables.
- O intervalo de atualização das saídas previstas (ADR 0018) e o tratamento de erro ficam num lugar só por recurso.
- Os Dados do celular continuam fora dessa regra: não são API, são o armazenamento do aparelho (ADRs 0003, 0004 e 0015).
