# 📌 Comandos do Pipeline SDD

Projeto: **.NET 10 (backend/) + React 18 + TypeScript (frontend/) — monorepo**

## 🎯 Fluxo Recomendado

1. **(Opcional) Jogue sua documentação bruta em `docs/raw/`** — compartilhada pelas duas frentes.
   Word, PDF, planilhas, imagens — o que tiver. Veja `docs/raw/README.md`.

2. **Edite a especificação da frente** que vai trabalhar
   ```
   nano docs/backend/SPEC.md      # ou docs/frontend/SPEC.md
   ```

3. **Execute o orchestrador, dizendo a frente**
   ```
   /inicia-orquestracao backend
   /inicia-orquestracao frontend
   ```
   Sem argumento, o orquestrador pergunta qual frente. Mudança que cruza as duas = duas rodadas (backend
   primeiro). Para rodar as duas ao mesmo tempo, uma worktree por frente: `claude --worktree nome-da-frente`.

4. **Pronto!** Os subagentes (pasta `.claude/agents/`) rodam automaticamente em cascata — começando pelo
   `01-analyst-sdd`, que consolida `docs/raw/` (se tiver arquivos) e valida a spec da frente

## 📚 Estrutura

- **`.claude/`** — um só, na raiz, compartilhado pelas duas frentes
- **`knowledge/`** — um só vault para as duas frentes (notas de uma frente só levam a tag `backend` ou `frontend`)
- **`docs/backend/`, `docs/frontend/`** — uma `SPEC.md` por frente; **`docs/raw/`** é compartilhada
- **`backend/`, `frontend/`** — só o código de cada frente (e um README/CLAUDE.md curto)

## 🤖 Os Agentes (em `.claude/agents/`)

| Agente | Responsabilidade |
|--------|-------------------|
| `01-analyst-sdd` | Consolida `docs/raw/` numa Base de Conhecimento em `knowledge/` (se tiver arquivos) e valida a especificação da frente |
| `02-architect-sdd` | Gera a arquitetura técnica (seção própria para backend e para frontend) |
| `03-dotnet-specialist` | Implementa o backend (frente `backend`) |
| `03-react-specialist` | Implementa o frontend (frente `frontend`) |
| `04-reviewer-sdd` | Revisa conformidade com a spec e qualidade do código; o checklist de frontend só entra na frente `frontend` |
| `05-test-engineer` | Escreve e roda os testes da frente (seções "Frente backend" e "Frente frontend") e mede cobertura |
| `06-security-scan-sdd` | Audita 5 falhas de segurança e gera relatório HTML; o checklist de frontend só entra na frente `frontend` |

O commit não é um subagente: depois de cada etapa aprovada, o `/inicia-orquestracao` commita localmente na conversa principal (fluxo do `/commit`, com gate de segredos) e só dá push no fim, depois do `06-security-scan-sdd`.

## 🧩 Comandos avulsos

- `/commit` — a qualquer momento, fora do pipeline: gera a mensagem de commit a partir do diff atual e faz push na branch atual (nunca cita Claude, Anthropic ou qualquer outra IA na mensagem).
- `/raio-x-backend` e `/raio-x-frontend` — em projeto legado sem documentação: varredura técnica completa da frente e documentação gravada em `docs/raw/`, separada por tema.
- `/video-lancamento` — opcional, com o frontend já entregue: gera um vídeo curto de lançamento com o plugin `brag` (não faz parte do pipeline).

## ⏱️ Tempo

- Pipeline completo de uma frente (`/inicia-orquestracao <frente>`): 12-25 minutos

---

**Comece aqui:** `/inicia-orquestracao backend` ou `/inicia-orquestracao frontend`
