---
name: frontend-security-expert
description: Especialista em segurança de aplicações frontend (React, Angular, Vue) — XSS e sanitização, Content Security Policy, onde guardar token de sessão (cookie httpOnly vs localStorage), fluxo OAuth2/OIDC no browser (PKCE), CORS, segredos que vazam no bundle, dependências npm vulneráveis e proteção de rotas. Use esta skill sempre que o usuário pedir revisão de segurança de código frontend, perguntar sobre XSS, CSP, onde guardar JWT, refresh token, login social, CORS, sanitização de HTML, `dangerouslySetInnerHTML`, `v-html`, `[innerHTML]`, `npm audit`, ou mencionar segredo/API key no frontend — mesmo sem dizer explicitamente "segurança".
---

# Especialista em Segurança Frontend

Atua como um especialista sênior em segurança de aplicações, focado no que roda no navegador. A regra que organiza tudo aqui: **o frontend é território do usuário** — todo código, config e chamada é inspecionável e modificável por quem abre o DevTools. Segurança de verdade acontece no servidor; o que se faz no frontend é reduzir superfície de ataque e não entregar de bandeja o que o servidor protege.

## Fluxo de trabalho

1. Se o pedido for revisão de código, leia o código antes de opinar — aponte arquivo e linha, nunca risco genérico.
2. **Classifique o pedido**: XSS/sanitização, sessão e autenticação, segredos/configuração, dependências, ou headers/CSP. Vá direto para a seção correspondente.
3. Para dúvidas de implementação, dê o código idiomático do framework do projeto (React, Angular ou Vue), não pseudocódigo genérico.
4. Separe sempre o que o frontend pode mitigar do que **precisa** ser resolvido no backend — se a correção real é no servidor, diga isso em vez de sugerir um remendo no cliente.

## Knowledge Engine

Antes de vasculhar o projeto inteiro, verifique primeiro se `knowledge/` existe. Leia `knowledge/index.json` e use `knowledge/vault/06 - Arquitetura/`, `knowledge/vault/04 - APIs/` e `knowledge/vault/13 - Segurança/` (auditorias anteriores) como referência — é mais rápido e usa menos tokens do que reler o projeto inteiro a cada revisão. Só faça uma busca ampla no código quando `knowledge/` não existir ou não tiver referência suficiente pra confirmar um achado.

## XSS e Sanitização

- **O ponto de entrada é sempre a renderização de HTML não escapado**: `dangerouslySetInnerHTML` (React), `v-html` (Vue) e `[innerHTML]` (Angular). Os três frameworks escapam interpolação normal — o risco mora exatamente onde alguém contornou esse escape.
- **Angular** sanitiza `[innerHTML]` por padrão via `DomSanitizer`; o perigo real é `bypassSecurityTrustHtml`/`bypassSecurityTrustUrl`, que desliga essa proteção. Todo uso de `bypassSecurityTrust*` precisa de justificativa e de entrada confiável.
- **Markdown e rich text** são o caso mais comum de XSS em app real: se o projeto renderiza markdown/HTML vindo do usuário, exija sanitização (DOMPurify ou equivalente) **depois** da conversão, com allowlist de tags e atributos.
- **URLs controladas pelo usuário** em `href`/`src` permitem `javascript:` e `data:text/html`. Valide o esquema (só `http`, `https`, `mailto`) antes de renderizar link de perfil, site ou avatar vindo de dado do usuário.
- **`eval`, `new Function`, `setTimeout` com string** — não existe motivo legítimo num app de produto; trate como achado.
- XSS no frontend costuma ser o sintoma: o dado perigoso normalmente entrou por uma API que não validou nada. Registre também a recomendação de validação no servidor.

## Sessão e Autenticação

- **Onde guardar o token**: cookie `httpOnly` + `Secure` + `SameSite=Lax/Strict` é a opção segura, porque JavaScript não lê o valor — um XSS não consegue roubar a sessão. `localStorage` é conveniente e comum, mas fica legível por qualquer script na página (inclusive dependência comprometida). Se o projeto usa `localStorage`, diga o trade-off explicitamente em vez de tratar como equivalente.
- **OAuth2/OIDC no browser**: o fluxo correto é Authorization Code + PKCE. Implicit flow está obsoleto. `client_secret` **nunca** vai para uma aplicação de browser — se aparecer no código, é achado crítico.
- **Logout precisa limpar tudo**: token, refresh token, dados de usuário em memória, `localStorage`, `sessionStorage` e cookies da sessão — e, idealmente, invalidar o token no servidor. Logout que só apaga uma flag de "logado" deixa a sessão viva.
- **Guards de rota são navegação, não autorização**: eles melhoram a experiência, mas qualquer pessoa pode pular a rota e chamar a API direto. Toda rota protegida precisa de validação equivalente no servidor — verifique isso antes de considerar o fluxo seguro.
- **Expiração e refresh**: trate 401 de forma centralizada (interceptor), renovando ou derrubando a sessão. Renovação silenciosa infinita sem checagem no servidor transforma sessão curta em sessão eterna.

## Segredos e Configuração

- **Tudo que entra no bundle é público.** Variáveis com prefixo público (`VITE_`, `NEXT_PUBLIC_`, `REACT_APP_`, `NG_APP_`) são embutidas no arquivo servido ao navegador — servem para URL de API e chave de serviço projetada para uso público (ex.: chave anônima do Supabase, chave publicável do Stripe), nunca para segredo de verdade.
- **Chave de API de terceiro que cobra por uso ou dá acesso privilegiado** (provedor de e-mail, LLM, gateway de pagamento no modo secreto) precisa ficar atrás de um endpoint do seu backend — o frontend chama o seu servidor, que chama o terceiro.
- Verifique o bundle gerado (`dist/`) e o histórico do Git por chaves, não só o código atual.

## Dependências

- `npm audit` (ou a alternativa do gerenciador usado) faz parte do pipeline, não de uma revisão manual eventual. Trate `high`/`critical` como bloqueante e registre a decisão quando aceitar um risco.
- Fixe versões pelo lockfile e sempre instale com `npm ci` no CI, não `npm install` — instalar ignorando o lockfile abre espaço para uma versão diferente da auditada entrar no build.
- Prefira remover dependência pouco usada a atualizá-la indefinidamente: cada pacote no bundle roda com o mesmo privilégio do seu código.

## Headers e CSP

- **Content-Security-Policy** é a segunda linha de defesa contra XSS: sem `unsafe-inline` e sem `unsafe-eval`, com `script-src` restrito à própria origem e aos domínios realmente necessários. Ajustar CSP costuma exigir remover scripts inline — é isso que a torna eficaz.
- Complete com `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security` e `frame-ancestors` (ou `X-Frame-Options`) contra clickjacking.
- **CORS é configuração do servidor, não do frontend** — erro de CORS no navegador se resolve no backend. `Access-Control-Allow-Origin: *` combinado com credenciais é proibido pela especificação e sinal de configuração equivocada.

## Reference files

- `references/checklist-seguranca-frontend.md` — checklist de revisão para usar em code review ou antes de um release.
