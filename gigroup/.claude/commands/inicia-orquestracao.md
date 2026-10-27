# /inicia-orquestracao - Executar Pipeline SDD

> Execute os agentes automaticamente para gerar código baseado em sua especificação. Este projeto é um **monorepo** (backend + frontend): cada rodada trabalha **uma frente**, passada como argumento — `/inicia-orquestracao backend` ou `/inicia-orquestracao frontend`.

## 🧭 Frente da rodada (monorepo)

Argumento recebido: `$ARGUMENTS`

- A rodada trabalha **uma frente**: `backend` ou `frontend`. Se o argumento estiver vazio ou for outra coisa,
  **pergunte ao usuário qual frente** antes de qualquer outra ação — não escolha sozinho.
- Chame de `<frente>` o valor escolhido. A spec da rodada é `docs/<frente>/SPEC.md`, o código vive em
  `<frente>/`, e o specialist é o `03-*` da stack dessa frente. Diga a frente no prompt de invocação de **todo**
  agente.
- Os relatórios de `output/` mantêm os mesmos nomes (não duplique por frente), e o vault é um só:
  `knowledge/` na raiz, para as duas frentes.
- Build e testes rodam **dentro da pasta da frente** (`cd backend && ...`, `cd frontend && ...`), nunca na raiz.
- Mudança que cruza as duas frentes = **duas rodadas**, backend primeiro. Para rodar as duas ao mesmo tempo,
  use uma worktree por frente (`claude --worktree nome-da-frente`).


## 📋 Como Usar

1. **(Opcional) Documentação bruta** — se você tiver Word, PDF, planilhas, prints de wireframe, atas de
   reunião etc., coloque tudo em `docs/raw/` (veja `docs/raw/README.md`). Se essa pasta tiver arquivos, o
   `01-analyst-sdd` transforma tudo numa Base de Conhecimento em `knowledge/` antes de validar a spec.

2. **Prepare sua especificação**
   - Edite `docs/<frente>/SPEC.md` com seus requisitos (se usou `docs/raw/`, o Analyst pode preencher um rascunho aqui
     pra você revisar). A spec de cada rodada é `docs/backend/SPEC.md` ou `docs/frontend/SPEC.md`, conforme a frente.

3. **Chame o orchestrador**
   ```
   /inicia-orquestracao <backend|frontend>
   ```

4. **Aprove a validação da especificação**
   - O pipeline roda o `Analyst` e **pausa** — mostra o relatório completo e pergunta se você aprova seguir
     (veja "Pausa de Aprovação" abaixo)

5. **Aguarde ~12-25 minutos (varia com a frente)**
   - Depois da sua aprovação, o resto executa em cascata, sem novas pausas
   - Resultados salvos em `output/`

## 🎯 O que Acontece

São **6 subagentes**. Depois de cada um, o trabalho da etapa é commitado aqui mesmo, na conversa principal
(commit local); o push acontece uma vez só, no fim:

```
docs/raw/ (opcional) + docs/<frente>/SPEC.md
    ↓
🎯 01 Analyst          → Consolida docs/raw/ em knowledge/ (se houver arquivos) e valida a spec
    ↓
⏸️ Pausa — você aprova seguir? (única pausa do pipeline)
    ↓ (só continua se você aprovar)
🏛️ 02 Architect        → Gera arquitetura + matriz de rastreabilidade + plano de execução em ondas
    ↓
🧩 03 Specialist da frente → 03-dotnet-specialist (backend) ou 03-react-specialist (frontend): implementa o código em <frente>/src/ (só termina com o build passando, rodado dentro da pasta da frente)
    ↳ com plano PARALELO: fundação → ondas de unidades ao mesmo tempo (até 4 por vez) → costura (build único)
    ↓
🔍 04 Reviewer         → Conformidade com a spec + qualidade do código, numa leitura só
    ⇅ roda ao mesmo tempo que o 05 (o Reviewer só lê o código)
🧪 05 Test Engineer   → Escreve e RODA os testes da frente (backend: unit + integração + docs/api/testes-api.md; frontend: unit + E2E com invalidação de sessão) e mede cobertura
    ↓
🛡️ 06 Security Scan    → Auditoria de segurança (5 categorias) + relatório HTML
    ↓
🚀 Push               → Sobe os commits de todas as etapas (só se todos os gates passaram)
    ↓
✅ Pronto!
```

## ⏸️ Pausa de Aprovação (única do pipeline)

Assim que o `Analyst` gerar `output/1-analyst.md`, o pipeline **para** e mostra o relatório completo
formatado (status da spec, base de conhecimento, requisitos, regras de negócio, lacunas e recomendação) —
**mesmo que o status seja ✅ APROVADO**. Em seguida pergunta objetivamente:

> "A validação da especificação ficou assim [relatório]. Aprova seguir para a arquitetura e o resto do
> pipeline?"

- Se você **aprovar**, o restante do pipeline roda **automaticamente até o fim**, sem pedir mais nenhuma
  confirmação (só interrompe de novo se um gate técnico reprovar — ver regra abaixo).
- Se você **não aprovar**, o pipeline **para ali**, sem rodar `Architect` nem nenhum agente seguinte, até
  você ajustar `docs/<frente>/SPEC.md` (ou o que for apontado no relatório) e chamar `/inicia-orquestracao` de novo.

## ⚠️ Regras de Execução

- **Antes do Analyst, limpe a rodada anterior**: rode `node .claude/scripts/limpar-output.cjs`. Ele apaga os
  relatórios que sobraram em `output/` (inclusive de versões antigas do pipeline) e mantém o
  `token-report.md` — assim nenhum agente lê por engano um relatório velho.
- **Etapas em ordem, paralelismo só onde não há dependência.** Cada agente lê o relatório do anterior em
  `output/` — não repasse o conteúdo dos relatórios no prompt de invocação, só aponte o arquivo. As etapas
  01 → 02 → 03 → (04 ‖ 05) → 06 seguem em ordem; o paralelismo acontece **dentro** do 03 (ver "Execução
  paralela" abaixo) e entre o 04 e o 05. Nunca paralelize duas coisas em que uma depende do resultado da outra.
- **Modelo por tarefa (economia sem perder qualidade)**: cada agente tem seu modelo padrão no frontmatter,
  sempre por apelido de família (`opus` ou `sonnet`), que resolve sozinho para a versão mais recente — nunca
  escreva um ID com versão. Antes de chamar o `03-*` e o `05-test-engineer`, avalie a spec da rodada: se for
  **trivial** (ajuste de texto ou cor, campo novo num CRUD já existente, mudança confinada a poucos arquivos,
  sem regra de negócio nova, integração, autenticação/autorização nem migração de dados), invoque-os com
  `model: "sonnet"`. Qualquer sinal de complexidade mantém `opus`. Na dúvida, `opus`. Nunca rebaixe o `02`,
  o `04` nem o `06`. Diga no relatório final qual modelo usou em cada etapa e por quê.
- **Pare em qualquer gate técnico reprovado (depois da aprovação inicial)**: se `04-reviewer-sdd`
  (❌ REPROVADO), `05-test-engineer` (❌ FAILED) ou `06-security-scan-sdd` (❌ REPROVADO) reportar falha,
  interrompa o pipeline e reporte ao usuário o que precisa ser corrigido. Não gaste as etapas seguintes nem
  commite o trabalho da etapa reprovada — ele fica no working tree pra ser corrigido.
- **Commit a cada etapa (sem subagente, sem push)**: assim que um agente terminar **e** o gate dele passar,
  commite aqui mesmo, na conversa principal, o que aquela etapa produziu — código, testes e as notas de
  `knowledge/` que ela provocou, juntos. Siga os passos 3, 4, 5, 7, 9, 10 e 11 de `.claude/commands/commit.md`
  (checagem do `.gitignore`, diff, estilo do histórico, mensagem sem citar IA, stage, **gate de segredos** e
  commit), sem pedir confirmação, com uma diferença: **não faça push** — o `git push` fica só para o fim. O
  vault já foi sincronizado pelo próprio agente, então os passos 1 e 2 não precisam rodar de novo.

  | Etapa | O que vai no commit | Tipo típico |
  |---|---|---|
  | 01 Analyst (depois da sua aprovação) | `docs/<frente>/SPEC.md`, `knowledge/` e o `output/token-report.md` da rodada anterior | `docs(spec):` |
  | 02 Architect | `knowledge/` (arquitetura, ADRs, planejamento) | `docs(arquitetura):` |
  | 03 Specialist | código em `<frente>/src/` + notas do vault — **um commit por unidade lógica** (com plano paralelo: um por unidade do plano, mais a fundação e a costura, só depois que a costura passar o build) | `feat(...)` |
  | 04 Reviewer | correções que ele aplicou, se houver | `fix:` / `refactor:` |
  | 05 Test Engineer | testes (e `docs/api/`, se gerou) | `test(...)` |
  | 06 Security Scan | correções de segurança + relatório HTML em `docs/security-audit/` | `fix(security):` / `docs(security):` |

  Exemplo de mensagens para a etapa do specialist:

```
feat(domain): adicionar entidade Tarefa e regras de validação
feat(application): implementar casos de uso de criação e listagem de tarefas
feat(infrastructure): configurar EF Core e repositório de tarefas
feat(api): adicionar controllers REST para tarefas
test(application): adicionar testes unitários dos casos de uso de tarefas
docs(spec): adicionar especificação técnica gerada pelo pipeline SDD
```

```
feat(components): adicionar componente de lista de tarefas
feat(pages): implementar tela de criação de tarefa com validação de formulário
feat(hooks): adicionar useTarefas com cache e invalidação
feat(api): adicionar cliente HTTP e tipos do endpoint de tarefas
feat(routes): adicionar rota protegida de tarefas com guard de sessão
test(components): adicionar testes da lista de tarefas com Testing Library
docs(spec): adicionar especificação técnica gerada pelo pipeline SDD
```

  Se uma etapa não mudou nada versionável, pule o commit dela — nunca crie commit vazio. Se o gate de
  segredos travar, não commite aquela etapa, pare o pipeline e reporte.

  Por que commitar por etapa e só dar push no fim: cada etapa vira um ponto de restauração no histórico
  (dá pra ver e reverter o que cada agente fez), mas nada sobe para o remoto antes de passar pela revisão,
  pelos testes e pela auditoria de segurança. Se um gate reprovar, os commits das etapas anteriores ficam
  **locais** — avise o usuário disso no relatório.
- **Push no fim**: depois do commit da etapa do `06-security-scan-sdd`, rode `git branch --show-current` e
  `git push` nessa mesma branch (`git push -u origin <branch>` se não houver upstream). Não crie nem troque
  de branch por conta própria. Se o push falhar, reporte o erro — não force.
- **Marque a rodada como concluída**: só depois do push, crie o arquivo vazio
  `output/.rodada-concluida`. Ao encerrar a resposta, o hook de tokens atualiza o `token-report.md` e, vendo o
  marcador, apaga os relatórios intermediários. Rodada interrompida por gate reprovado **não** ganha marcador:
  os relatórios ficam em `output/` pra explicar o que precisa ser corrigido.

## ⚡ Execução paralela (etapas 03, 04 e 05)

Tempo é o recurso mais caro de uma rodada: o custo em tokens é praticamente o mesmo em série ou em paralelo,
então tudo o que não depende de outra coisa roda **ao mesmo tempo**. Quem decide é o `output/EXECUTION_PLAN.md`
que o `02-architect-sdd` gera (ondas, dependências e dono de cada arquivo).

**Etapa 03 — specialists em ondas**

1. Leia `output/EXECUTION_PLAN.md`. Se o modo for **SERIAL** (ou se o arquivo não existir), invoque o
   specialist uma vez só, como sempre, e pule o resto desta seção.
2. **Fundação (Onda 0)**: invoque o specialist uma vez, com `Fundação` no prompt. Espere terminar e passar o
   build antes de seguir — tudo depende dela.
3. **Cada onda seguinte**: invoque **um specialist por unidade da onda, todos na MESMA mensagem** (várias
   chamadas do `Agent` de uma vez, é isso que as faz rodar simultaneamente), cada um com `Unidade <id>` no
   prompt e o arquivo do plano apontado. No máximo **4 ao mesmo tempo**: se a onda tiver mais, divida em
   lotes de 4. Só inicie a onda seguinte quando todas as unidades da atual terminarem.
4. **Antes de seguir de uma onda para a outra**, rode `git status --porcelain` e confira que cada arquivo
   alterado pertence a alguma unidade (ou aos compartilhados). Arquivo fora do dono vai para a costura revisar.
   Se uma unidade ficou incompleta ou deu erro (inclusive limite de requisições), reinvoque **só ela**, depois
   das outras — não refaça a onda.
5. **Costura**: depois da última onda, invoque o specialist uma vez, com `Costura` no prompt. Ele aplica os
   registros em arquivos compartilhados, resolve inconsistências, gera a migration única, roda o build
   e só termina com ele passando, e consolida o relatório que o Reviewer lê. Esse é o gate da etapa 03.
6. Cada unidade usa o modelo pela mesma regra de "Modelo por tarefa" (avalie a complexidade **da unidade**).
   A fundação e a costura usam `opus`.

**Etapas 04 e 05 — ao mesmo tempo**

Depois da costura, invoque o `04-reviewer-sdd` e o `05-test-engineer` **na mesma mensagem**: o Reviewer só lê o
código; o Test Engineer escreve e roda os testes. Se qualquer um reprovar, o pipeline para (o trabalho do outro
fica no working tree, sem commit). O `06-security-scan-sdd` continua depois, pois revalida os testes do 05.

**Quando NÃO paralelizar**: plano em modo SERIAL, onda com uma unidade só (invoque normal), ou qualquer sinal de
que duas unidades precisam editar o mesmo arquivo — nesse caso reagrupe numa unidade só e siga em série.

## 📁 Resultados

Durante a rodada, `output/` é o canal de passagem entre os agentes:

```
1-analyst.md                 (Base de Conhecimento + validação da spec)
TECHNICAL_SPECIFICATION.md   (Arquitetura)
TRACEABILITY_MATRIX.md       (Rastreabilidade)
TECHNICAL_DECISIONS.md       (Decisões)
EXECUTION_PLAN.md            (Plano de execução: ondas, unidades e dono de cada arquivo)
costura-<id>.md              (Só no modo paralelo: o que cada unidade pede para registrar nos arquivos compartilhados)
3-<specialist>.md        (Relatório da implementação da frente)
4-review.md                  (Conformidade + qualidade)
5-tests.md                   (Build, testes e cobertura — executados de verdade)
6-security-scan.md           (Auditoria de Segurança — 5 categorias)
```

Ao fim de uma rodada concluída, sobra só `token-report.md` (uso de tokens do pipeline): tudo o que vale
guardar desses relatórios já foi para `knowledge/`, que persiste entre execuções como base de conhecimento
viva do projeto. O relatório HTML da auditoria fica em `docs/security-audit/`.

## ✅ Pré-requisitos

- ✅ `docs/<frente>/SPEC.md` preenchida **ou** `docs/raw/` com documentação bruta
- ✅ SDK da stack instalado (para build e testes rodarem de verdade — sem ele, o Test Engineer cai para revisão
  estática e avisa no relatório)

## 🚀 Comece Agora

```
/inicia-orquestracao <backend|frontend>
```
