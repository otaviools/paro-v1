# Animações do site: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** As cinco animações do design, em CSS mais `useIntersectionObserver`.

**Spec:** `docs/superpowers/specs/2026-11-23-animacoes-do-site-design.md`

## Global Constraints

- Com `prefers-reduced-motion: reduce`, nada se move.
- Só `opacity`, `translate` e `scale`; sem rolagem lateral a 375 px.
- Sem JavaScript, o conteúdo continua visível.
- Curva `cubic-bezier(0.16, 1, 0.3, 1)` em todas as entradas.

## Review Focus

1. Movimento reduzido: nada se move, nada some. Conferido emulando a preferência na Tarefa 3.
2. Pré-renderização/SSR: o conteúdo que espera a rolagem não fica invisível no HTML. Conferido com `curl` na Tarefa 3.
3. Troca de tema durante o hover do cartão: o brilho usa variáveis do tema. Conferido na Tarefa 3.

---

### Tarefa 1: CSS e troca de página

**Files:** Create `docs-site/app/assets/css/movimento.css`; Modify `docs-site/app/assets/css/main.css`, `docs-site/nuxt.config.ts`

- [ ] `movimento.css`: keyframes `surgir-bloco` (de opacity 0 e translate 0 12px), `pulsar-o` (como no app), utilitários `cascata` (filhos diretos com atraso de 40 ms até o 8º), `.pagina-enter-active/.pagina-enter-from/.pagina-leave-active` como no app, `.surgir-ao-rolar` (estado inicial só quando `html.js-movimento` existe) e `.surgiu`; tudo desligado em `prefers-reduced-motion: reduce`.
- [ ] `nuxt.config.ts`: `app.pageTransition: { name: 'pagina', mode: 'out-in' }` ou o equivalente do app (entrada 200 ms, saída imediata).
- [ ] Conferir: trocar de página na barra lateral esmaece em 200 ms.

### Tarefa 2: Componentes

**Files:** Create `docs-site/app/components/LogoParo.vue`, `docs-site/app/composables/useSurgirAoRolar.ts`, `docs-site/app/plugins/movimento.client.ts`; Modify `AppHeader.vue`, `PrintDoDesktop.vue`, `PrintDoCelular.vue`, `content/index.md`, `app/app.config.ts`

- [ ] `LogoParo.vue`: SVG embutido do `logo-paro-fundo-claro.svg`/`-escuro.svg`, com o grupo do "ô" na classe `o-do-logo`; anima `pulsar-o` uma vez ao montar e de novo no hover do link.
- [ ] `movimento.client.ts`: põe a classe `js-movimento` no `<html>` no cliente.
- [ ] `useSurgirAoRolar(alvo: Ref<HTMLElement | null>)`: com `useIntersectionObserver`, põe `surgiu` no alvo na primeira interseção e para de observar.
- [ ] Prints: a `figure` usa `surgir-ao-rolar`; no celular, cada imagem recebe `--atraso: <índice * 80ms>`.
- [ ] Capa: o hero recebe a classe `cascata` nos blocos de título, texto, botões e janela.
- [ ] Cartões: `pageCard` com brilho radial em `--x/--y` atualizados por `pointermove` (diretiva ou componente), contorno mais claro e `translate: 0 -2px` no hover, só com `@media (hover: hover)`.

### Tarefa 3: Conferência

- [ ] Navegador: as cinco animações nos dois temas; com movimento reduzido emulado, nada se move.
- [ ] `curl` da página pré-renderizada: prints sem `opacity: 0` inline.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` em `docs-site/`.
