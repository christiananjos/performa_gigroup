---
name: react-expert
description: Especialista em React moderno — composição de componentes, hooks e suas armadilhas, estado de servidor vs estado de interface, efeitos e quando NÃO usar useEffect, listas e keys, formulários, performance de renderização (memo, useMemo, useCallback, re-render em cascata) e organização de projeto. Use esta skill sempre que o usuário pedir para escrever, revisar ou refatorar componente React, perguntar sobre useState, useEffect, useMemo, useCallback, useRef, context, prop drilling, estado global, Zustand, Redux, React Query, loop infinito de render, "por que renderiza duas vezes", "isso deveria ser um efeito?" ou "onde esse estado deveria morar" — mesmo sem nomear React explicitamente.
---

# Especialista em React

Atua como um engenheiro frontend sênior de React. A régua não é "funciona na tela", é **estado no lugar certo, render previsível e componente que continua legível daqui a seis meses**. A maior parte do problema de React em projeto real não é performance — é estado espalhado e efeito fazendo o que não devia.

## Fluxo de trabalho

1. Se for revisão, leia o componente antes de opinar — aponte arquivo e linha.
2. **Pergunte-se primeiro de onde vem o dado**: servidor, URL, ou interação local. A resposta decide quase tudo o mais e é o erro de arquitetura mais caro de corrigir depois.
3. Dê código real, no estilo do projeto (function component, hooks, TypeScript se o projeto usa).
4. Quando houver mais de um caminho, recomende um e diga o custo do outro.

## Knowledge Engine

Antes de vasculhar o projeto inteiro, verifique primeiro se `knowledge/` existe. Leia `knowledge/index.json` e use `knowledge/vault/02 - Funcionalidades/`, `knowledge/vault/08 - UX/` e `knowledge/vault/04 - APIs/` como referência — fluxo de tela e contrato de API já mapeados evitam redescobrir tudo. Só faça busca ampla no código quando o vault não cobrir.

## De onde vem o estado

Classifique antes de escolher ferramenta — é isso que evita Redux para guardar se um modal está aberto:

- **Estado de servidor** (dado que vive no backend: lista, detalhe, resultado de busca). Não é "estado" de verdade, é **cache**. Precisa de loading, erro, revalidação, invalidação — por isso pede biblioteca própria (TanStack Query, SWR). Guardar resposta de API em `useState` + `useEffect` é reimplementar cache ruim à mão: sem dedupe, sem retry, sem invalidação, com race condition entre requisições.
- **Estado de URL** (filtro, aba ativa, página, termo de busca). Mora na query string. Se estiver em `useState`, o usuário não consegue compartilhar o link nem usar o botão voltar.
- **Estado de interface local** (input não enviado, hover, acordeão aberto). `useState` no componente mais próximo de quem usa. Só suba quando dois irmãos precisarem do mesmo dado.
- **Estado global de verdade** (usuário logado, tema, carrinho): aí sim Context ou store (Zustand, Redux). É a menor categoria das quatro — na dúvida, não é global.

## Efeitos: o hook mais mal usado

`useEffect` existe para **sincronizar com sistema externo** (assinatura, timer, evento do browser, integração não-React). Quase todo `useEffect` de app real é um destes erros:

- **Derivar estado de prop/estado**: calcule no corpo do render (`const total = itens.reduce(...)`). Guardar em estado e sincronizar por efeito cria um render extra e uma fonte de verdade duplicada que sai de sincronia.
- **Reagir a evento do usuário**: a lógica vai no handler do evento, não num efeito que observa a mudança. "Quando o usuário salva, mostre o toast" é código no `onSubmit`.
- **Buscar dado**: é trabalho da biblioteca de estado de servidor, ou do roteador/framework. `useEffect` + `fetch` sem `AbortController` gera race condition: a resposta lenta da busca anterior sobrescreve a atual.
- **Resetar estado quando a prop muda**: use `key` no componente para forçar remontagem — mais simples e sem render intermediário com dado errado.

Quando o efeito é legítimo: **sempre retorne a limpeza** (`removeEventListener`, `clearInterval`, `abort`). Sem isso, em modo estrito o efeito roda duas vezes e o vazamento aparece; em produção, vaza silenciosamente.

Array de dependências não é sugestão: omitir dependência para "não rodar de novo" troca um bug visível por um stale closure invisível. Se o efeito roda demais, a dependência errada é a instável (objeto/função recriada a cada render) — estabilize a dependência, não minta na lista.

## Render e performance

- **Meça antes de otimizar.** `memo`, `useMemo` e `useCallback` custam comparação e memória; aplicados em tudo, deixam o código pior sem ganho. O Profiler do React DevTools mostra o que realmente está caro.
- **Re-render não é bug** — React re-renderizar é normal e barato. O problema é re-render de subárvore cara, ou trabalho pesado no corpo do componente.
- **A causa nº 1 de re-render em cascata é objeto/array/função recriado a cada render** sendo passado como prop ou como `value` de Context. `value={{ user, setUser }}` refaz o objeto toda vez e invalida todo consumidor do Context.
- **`memo` só funciona se as props forem estáveis** — envolver em `memo` e continuar passando callback inline não muda nada.
- **Context não é store**: qualquer mudança no valor re-renderiza todos os consumidores. Separe contexto que muda muito de contexto que quase não muda, ou use uma store com seletor.
- **Lista grande**: virtualização em vez de renderizar 10.000 linhas.

## Keys, listas e formulários

- **`key` é identidade, não posição.** `key={index}` em lista que pode reordenar, filtrar ou receber item no meio faz o React reaproveitar o componente errado — o sintoma clássico é input mantendo o valor da linha anterior. Use id estável do dado.
- Nunca mute estado: `setItens([...itens, novo])`, não `itens.push(novo)`. Mutação não dispara render e gera bug que "só acontece às vezes".
- Atualização baseada no valor anterior usa a forma de função (`setCount(c => c + 1)`) — o valor capturado no closure pode estar velho.
- **Formulário**: campo controlado é o padrão e dá validação imediata; em formulário grande, cada tecla re-renderiza tudo — aí biblioteca de formulário (React Hook Form) com campo não controlado resolve. Escolha pelo tamanho do formulário, não por gosto.

## Componentes

- Componente faz uma coisa. Quando o nome precisa de "E" (`UserProfileAndSettings`), são dois.
- **Extraia hook customizado quando a lógica é reutilizada ou quando o componente virou 70% lógica e 30% JSX** — é a forma idiomática de separar comportamento de apresentação.
- Prop booleana demais (`isCompact`, `isInline`, `hasBorder`, `variantSmall`) é sinal de componente tentando ser três; considere composição via `children` ou componentes separados.
- Derive o que der do que já existe em vez de guardar cópia em estado: menos coisa para sair de sincronia.

## Reference files

- `references/checklist-revisao-react.md` — checklist de revisão de componente para code review ou antes de abrir PR.
