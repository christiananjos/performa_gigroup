---
paths:
  - "frontend/src/**/*.ts"
  - "frontend/src/**/*.tsx"
---

# Segurança de Frontend — React 18 + TypeScript

Baseado nos 3 pontos de checagem manual (DevTools) que todo app publicado deveria passar antes de ir pra
produção. O objetivo aqui é a IA já implementar certo, em vez do usuário ter que descobrir isso depois
inspecionando o site no ar.

## 1. Variáveis de ambiente / segredos nunca vão pro bundle do cliente
- Tudo que é empacotado pro frontend (variáveis com o prefixo público da stack — `VITE_*`, `NEXT_PUBLIC_*`,
  `NG_APP_*`, `VUE_APP_*` etc.) é **público**, visível em DevTools → Sources → Search in all files, mesmo
  minificado. Nunca coloque API key privada, secret de terceiro, connection string ou token de serviço numa
  variável dessas.
- Segredo de verdade (chave de API paga, secret de integração) só existe no backend/BFF que a spec descrever —
  o frontend consome um endpoint que já esconde o segredo, nunca chama o serviço terceiro diretamente com a
  chave embutida.
- Se não houver como evitar (ex.: chave pública de um SDK de terceiro, tipo Google Maps), documente no
  relatório que aquela exposição é esperada e por quê — não deixe implícito.

## 2. Logout precisa realmente encerrar a sessão
- Logout limpa **todo** o estado de sessão do lado do cliente: cookies de auth, `localStorage` e
  `sessionStorage` — não só uma flag isolada tipo `isLoggedIn`.
- Toda rota/página privada valida um token real (existência **e** validade/expiração), nunca só a presença de
  uma variável local em memória ou um guard puramente client-side que pode ser burlado limpando um único item.
- Token expirado ou ausente deve redirecionar para login antes de renderizar qualquer dado privado — não
  renderize a página e só depois checar.

## 3. Rate limiting em autenticação não é opcional
- Toda rota de login, cadastro e reset de senha precisa prever proteção contra tentativas repetidas
  (rate limiting/throttling, bloqueio progressivo, ou equivalente).
- Se a API consumida é externa (projeto/time de backend diferente), o frontend não implementa isso sozinho —
  mas o specialist **sinaliza explicitamente no relatório** que o backend precisa garantir rate limiting nesses
  endpoints. Nunca omita esse ponto silenciosamente só porque não é código deste repositório.
- Se o app tiver algum backend próprio no mesmo pipeline (ex.: BFF), implemente rate limiting real ali, não só
  um debounce cosmético no botão de submit do formulário.
