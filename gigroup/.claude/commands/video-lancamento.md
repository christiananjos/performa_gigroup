---
description: Opcional — gera um vídeo curto de lançamento do sistema entregue com o plugin brag (latent-spaces/brag, usa HyperFrames). Fora do pipeline; só roda quando você chamar.
allowed-tools: Bash(node --version), Bash(ffmpeg -version), Skill
---

# Vídeo de lançamento (opcional)

Comando avulso: nenhum agente do pipeline chama isto, e o `/inicia-orquestracao` não depende dele. Use só se
quiser um vídeo de divulgação do sistema entregue.

## O que fazer

1. Confira os requisitos rodando `node --version` (precisa ser 22 ou superior) e `ffmpeg -version`. Se algum
   faltar ou estiver abaixo do necessário, diga exatamente o que instalar e pare — não tente instalar sozinho.

2. Confira se a skill `brag` está disponível. Se não estiver, o plugin ainda não foi instalado: peça ao usuário
   para rodar, uma vez, os dois comandos abaixo (são comandos do Claude Code, o usuário digita) e depois chamar
   `/video-lancamento` de novo. É um plugin de terceiros — avise isso ao pedir a instalação.

   ```
   /plugin marketplace add latent-spaces/brag
   /plugin install brag@brag
   ```

3. Com tudo pronto, invoque a skill `brag` (via Skill) sobre este projeto. Use `docs/SPEC.md` e o frontend (em
   `src/`, ou `frontend/` no monorepo) como fonte do que o sistema faz; não invente funcionalidades que não existem no código.

4. Reporte onde o vídeo foi gerado e como abri-lo. Se o render falhar, mostre o erro exato.
