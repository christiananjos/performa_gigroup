---
tags: [frontend]
---

# Portal do Worker — Frontend: o que está planejado

> Fonte: `docs/frontend/SPEC.md` (escrita em 2026-10-27 a partir do "Roadmap Portal do Worker — revisado", slides 1/3 a 3/3).

## Estado em 2026-10-27

- Spec de frontend escrita para a fase **Básico (Q4/2026 – Q1/2027)**, REQ-001 a REQ-022. Ainda **não implementada** em `frontend/`.
- Existe um POC descartável em `poc/portal-worker/` só para visualizar a arquitetura (registro de módulos por trilha, feature flags por contrato, portões sessão → LGPD). Não é base de código de produção.
- Fases Desempenho, Encantamento e Otimização estão na seção "Roadmap" da spec, fora do escopo da primeira rodada.

## Questões em aberto (aguardando a Gi Group)

1. Canal: web/PWA é o canal único ou haverá app nativo?
2. Manual de marca Gi Group para os tokens de design.
3. Status da admissão: Básico ou Desempenho (os materiais divergem; a spec considerou Básico).
4. Sistemas de origem de folha, admissão, ponto e BOT.
5. Primeiro acesso: código por SMS, e-mail ou ambos.
6. Retenção de holerites e informes (premissa: 24 meses).
7. Alteração de dados cadastrais passa por aprovação do RH?
8. Programa Acolhendo e BOT são produtos existentes com URL/widget?
9. Escopo só Brasil?

## Dependências do backend

- BFF .NET com sessão em cookie `HttpOnly` e `GET /api/me/features?contratoId={id}` decidindo a visibilidade (BR-004).
- Rate limiting em login, primeiro acesso, verificação de código e esqueci-senha.
