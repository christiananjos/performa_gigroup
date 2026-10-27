# Checklist de Revisão de Segurança — Frontend

Use em code review ou antes de um release. Para cada item: OK, N/A ou achado com severidade.

## 1. XSS e renderização
- [ ] Nenhum `dangerouslySetInnerHTML` / `v-html` / `[innerHTML]` com conteúdo vindo do usuário sem sanitização.
- [ ] Markdown/rich text sanitizado depois da conversão para HTML, com allowlist de tags e atributos.
- [ ] URLs de usuário em `href`/`src` validadas por esquema (bloqueia `javascript:` e `data:text/html`).
- [ ] Sem `eval`, `new Function` ou `setTimeout`/`setInterval` recebendo string.
- [ ] Nenhum `bypassSecurityTrust*` (Angular) sem justificativa e entrada confiável.

## 2. Sessão e autenticação
- [ ] Token de sessão em cookie `httpOnly` + `Secure` + `SameSite` — ou, se em `localStorage`, o trade-off está documentado e aceito.
- [ ] Fluxo OAuth2/OIDC usa Authorization Code + PKCE; nenhum `client_secret` no código do browser.
- [ ] Logout limpa token, refresh token, `localStorage`, `sessionStorage`, cookies e estado em memória.
- [ ] Toda rota protegida tem verificação equivalente no servidor (o guard é só navegação).
- [ ] 401/expiração tratados de forma centralizada, sem renovação silenciosa infinita.

## 3. Segredos e configuração
- [ ] Nenhuma chave privada, senha ou token de serviço no código, nas variáveis públicas de build ou no bundle gerado.
- [ ] Chaves de terceiros que cobram por uso ou dão acesso privilegiado ficam atrás de endpoint do backend.
- [ ] Histórico do Git verificado por segredo commitado (inclusive arquivos `.env` removidos depois).

## 4. Dependências
- [ ] `npm audit` (ou equivalente) sem achado `high`/`critical` não tratado.
- [ ] CI instala com `npm ci` (lockfile respeitado), não `npm install`.
- [ ] Dependências sem uso removidas.

## 5. Headers e transporte
- [ ] CSP configurada, sem `unsafe-inline` e sem `unsafe-eval`.
- [ ] `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security` e proteção contra clickjacking presentes.
- [ ] HTTPS obrigatório, sem conteúdo misto (recurso `http://` em página `https://`).
- [ ] CORS do backend não combina origem `*` com credenciais.

## 6. Exposição de dados
- [ ] Respostas de API não trazem para o browser campos que a tela não usa (senha, hash, dado de outro usuário).
- [ ] Sem dado sensível em log do console ou em mensagem de erro exibida ao usuário.
- [ ] Source maps de produção não publicados, ou publicados conscientemente.
