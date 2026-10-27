# Projeto SDD — .NET 10 (backend/) + React 18 + TypeScript (frontend/) — monorepo

Este projeto usa o **Pipeline SDD** (Spec-Driven Development): agentes especializados em
`.claude/agents/` implementam, testam e revisam código a partir da spec de cada frente (`docs/<frente>/SPEC.md`), disparados pelo
comando `/inicia-orquestracao` (`.claude/commands/inicia-orquestracao.md`).

## Monorepo: backend + frontend

Este projeto é um **monorepo** com duas frentes — `backend/` (.NET 10) e `frontend/` (React 18 + TypeScript). O
`.claude/`, o `knowledge/`, o `docs/` e o `output/` são **únicos e ficam na raiz**, compartilhados pelas duas.

1. **Há um único `knowledge/`, na raiz, para as duas frentes.** Mesmo trabalhando só em `frontend/` ou
   `backend/`, toda leitura e gravação de memória (vault, ADR, `14 - Planejamento/`) vai para
   `<raiz>/knowledge/`. O mesmo vale para `docs/`, `output/` e `.claude/`. Nota do vault de uma frente só leva a
   tag `backend` ou `frontend`; o `Index.md` lista as notas das duas.
2. **Numeração de ADR:** como o vault é compartilhado, os ADRs do backend seguem `ADR-NNN` e os do frontend usam
   `ADR-FE-NNN`, desde o primeiro, para não haver numeração repetida.
3. **Comandos de build rodam dentro da pasta da frente:** `cd backend && ...` e `cd frontend && ...`, nunca na raiz.
4. **Workflows de deploy** (`.github/workflows/`) têm `paths:` por pasta (`backend/**`, `frontend/**`) e
   `working-directory`/`context` apontando para a subpasta.
5. **`.gitignore` único**, com as regras das duas stacks; `knowledge/` e `.claude/` nunca são ignorados (só os chunks
   derivados).
6. **Agentes usam apelidos de modelo** (`opus`, `sonnet`, `haiku`), nunca um ID com versão. Quando um ID exato for
   inevitável (código que chama a API da Anthropic), consulte a documentação atual — skill `claude-api` — em vez de
   escrever de memória.

**Abra o projeto pela raiz.** Abrindo só `backend/` ou `frontend/`, os agentes, comandos e skills do pipeline podem
não carregar; o `CLAUDE.md` dessas pastas existe só como aviso. Cada frente tem sua spec em
`docs/<frente>/SPEC.md`. Mudança que cruza as duas frentes são duas rodadas (backend primeiro).

## Comandos de build/teste

```bash
# Backend (rode sempre de dentro de backend/)
cd backend && dotnet build
cd backend && dotnet test

# Frontend (rode sempre de dentro de frontend/)
cd frontend && npm install
cd frontend && npm run dev
cd frontend && npm test
```

## Onde as coisas vivem

- `docs/backend/SPEC.md` e `docs/frontend/SPEC.md` — uma especificação por frente, que você escreve/edita
- `docs/raw/` — documentação bruta opcional (Word, PDF, planilhas...); o `01-analyst-sdd` consolida em `knowledge/`
- `knowledge/` — Base de Conhecimento (Obsidian-compatível). **Versionada no Git** — é a memória do projeto
- `knowledge/vault/14 - Planejamento/` — o que está planejado e ainda NÃO foi implementado
- `output/` — canal de passagem entre os agentes de cada rodada do `/inicia-orquestracao`. Só o
  `token-report.md` vai para o Git; os relatórios intermediários ficam fora dele e são apagados no fim da
  rodada — por isso nada que precise sobreviver à sessão pode ficar só aqui
- `backend/` e `frontend/` — o código de cada frente (cada uma com `README.md` e um `CLAUDE.md` curto)
- `.claude/agents/` — subagentes do pipeline (não chame manualmente; o `/inicia-orquestracao` cuida disso)
- `.claude/rules/` — convenções por caminho de arquivo (carregam só quando relevante — veja lá antes de
  duplicar uma convenção aqui)

## Knowledge Engine como fonte de verdade

Depois que o `01-analyst-sdd` já consolidou `docs/raw/` pelo menos uma vez e `knowledge/` existe: para
qualquer consulta a regra de negócio, funcionalidade, API, teste ou decisão de arquitetura — dentro ou fora do
`/inicia-orquestracao` — busque nesta ordem e pare no primeiro nível que responder:

1. `knowledge/cache/<agente>.json` — resumo já filtrado por área.
2. `knowledge/vault/` (comece por `Index.md`) — o resumo consolidado. `knowledge/graph/` serve para achar
   as notas ligadas a uma que você já abriu.
3. Chunks: `grep -ril "<termo>" knowledge/embeddings/chunks/ knowledge/embeddings/fontes/` e leia **só os
   chunks que casaram** — a primeira linha de cada um diz de qual arquivo ele veio. É o jeito mais barato de
   achar um detalhe sem ler documentos inteiros.
4. `knowledge/source/texto/` — o texto integral de cada documento original (PDF, DOCX, e-mail, procedure),
   já extraído e pesquisável.

Não abra os binários de `knowledge/source/` nem de `docs/raw/`, e não converta documento para pasta
temporária: `docs/raw/` é só a caixa de entrada do Analyst, e o texto de tudo que entrou já está em
`knowledge/source/texto/`. Se os chunks não existirem (clone novo — são derivados e ficam fora do Git), rode
`node .claude/scripts/knowledge-engine-build.cjs`. Se faltar o texto de um documento, extraia uma única vez,
grave em `knowledge/source/texto/<mesmo caminho>.md` e rode o script.

**Antes de afirmar que algo está pendente, em aberto ou sem decisão, confira os níveis 3 e 4.** O vault é
resumo e pode ter deixado de fora a resposta que a fonte já dá; se a fonte responder, corrija o vault (e
`14 - Planejamento/`) na hora. Só pergunte ao usuário se nenhum nível cobrir o assunto, e registre a lacuna
no vault.

**Toda alteração atualiza o vault na hora, sem esperar o usuário pedir.** Mudou código, regra, endpoint,
tela, fluxo ou decisão? No mesmo turno, atualize a nota correspondente em `knowledge/vault/` (ou crie uma).
O grafo e os embeddings se reconstroem sozinhos: o hook `.claude/hooks/knowledge-sync.cjs` roda
`knowledge-engine-build.cjs` a cada escrita em `knowledge/vault/` — não precisa rodar na mão. Assim o
contexto acumulado não se perde entre sessões e entre agentes.

E o que **não** foi implementado importa tanto quanto o que foi: escopo adiado, próximo passo, pendência e
decisão em aberto vão para `knowledge/vault/14 - Planejamento/`, uma nota por assunto. Os
relatórios de `output/` são descartáveis e ficam fora do Git, então plano que more só lá morre com a sessão.

## Design de interface

Sempre que o pedido envolver tela, componente ou visual, use (e sugira ao usuário usar) a skill
`frontend-design` do plugin oficial da Anthropic `frontend-design@claude-plugins-official`, já habilitado em
`.claude/settings.json`. Não instalado? Sugira `claude plugin install frontend-design@claude-plugins-official`.

Toda tela também segue as 7 leis de UX (`.claude/rules/frontend-ux-laws.md`): tela boa faz o cliente pensar
menos — ação principal em destaque, poucas opções por tela, progresso visível em fluxos de várias etapas.


## O commit leva a memória junto

`knowledge/` é versionada — **nunca a acrescente ao `.gitignore`**; só `knowledge/embeddings/chunks/` e
`knowledge/embeddings/fontes/` ficam de fora, por serem derivados. Use `/commit`: ele sincroniza o vault com o diff, roda o rebuild do grafo, confere
que nada está ignorando `knowledge/` e commita memória e código no mesmo commit. Mudança em `knowledge/` não
vira commit separado — vai junto com o código que a provocou. O mesmo vale para `.claude/` e `CLAUDE.md`:
toda alteração neles (inclusive `.claude/settings.local.json` e `.mcp.json`) sobe sempre, nunca vão para o `.gitignore`.

## Fluxo

Rode `/inicia-orquestracao` dentro do projeto. Ele tem uma única pausa manual, logo após a validação da spec — o
resto roda automático até o fim, só parando de novo se um gate de qualidade (reviewer, testes, security scan)
reportar falha. São 6 subagentes; cada etapa aprovada vira um commit local na conversa principal (fluxo do
`/commit`) e o push acontece uma vez só, no fim. No monorepo cada rodada trabalha **uma frente**: `/inicia-orquestracao backend` ou `/inicia-orquestracao frontend` (sem argumento, ele pergunta).

## Trabalhando em paralelo

Dentro de uma rodada, o `/inicia-orquestracao` já paraleliza sozinho: o `02-architect-sdd` gera `output/EXECUTION_PLAN.md`
(unidades, ondas e dono de cada arquivo), os specialists de cada onda rodam ao mesmo tempo (até 4), uma costura
final faz o build único, e o Reviewer e o Test Engineer rodam juntos. Unidades que dependem uma da outra ficam em
ondas diferentes; projeto pequeno (menos de 3 unidades independentes) segue em série.

Para tocar duas frentes ao mesmo tempo (ex: duas specs diferentes) sem os agentes esbarrarem nos mesmos
arquivos, rode cada uma em uma worktree: `claude --worktree nome-da-frente`.

## Convenções deste projeto

<!-- Adicione aqui o que o Claude deveria saber sempre e que não está em .claude/rules/ nem nos agentes:
comandos que você roda com frequência, decisões de arquitetura, coisas que o Claude já errou uma vez. -->
