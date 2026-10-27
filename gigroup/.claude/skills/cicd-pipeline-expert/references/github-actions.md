# Referência GitHub Actions

## Workflow .NET básico (.github/workflows/build.yml)

```yaml
name: build-and-test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.x'

      - name: Cache NuGet packages
        uses: actions/cache@v4
        with:
          path: ~/.nuget/packages
          key: ${{ runner.os }}-nuget-${{ hashFiles('**/packages.lock.json') }}
          restore-keys: |
            ${{ runner.os }}-nuget-

      - name: Restore
        run: dotnet restore

      - name: Build
        run: dotnet build --configuration Release --no-restore

      - name: Test
        run: dotnet test --configuration Release --no-build --collect:"XPlat Code Coverage"

      - name: Publish
        run: dotnet publish --configuration Release --output ./publish

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: drop
          path: ./publish
```

## Workflow de frontend básico (.github/workflows/build.yml)

```yaml
name: build-and-test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install (lockfile)
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Testes unitários
        run: npm test -- --run

      - name: Build de produção
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: site
          path: ./dist
```

## Job de deploy com proteção de environment

```yaml
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: drop
          path: ./publish

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: '<nome-do-app>-staging'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE_STAGING }}
          package: ./publish
```

## Job de deploy com proteção de environment

```yaml
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: site
          path: ./site

      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.STATIC_WEB_APPS_TOKEN_STAGING }}
          action: upload
          app_location: ./site
          skip_app_build: true
```

Publicando em S3 + CloudFront no lugar do Static Web Apps, os dois últimos steps viram um `aws s3 sync`
para o bucket mais um `aws cloudfront create-invalidation` no `/index.html` — sem a invalidação, o usuário
continua recebendo o HTML antigo do cache de borda.

## Environments
- `Settings > Environments` permite exigir revisores antes de um job daquele ambiente rodar — mesmo conceito dos checks de environment do Azure DevOps.
- Guarde secrets escopados por ambiente em cada environment, não no nível do repo inteiro, pra manter credenciais de staging/prod separadas.

## Workflows reutilizáveis vs composite actions
- **Workflow reutilizável** (trigger `workflow_call`): melhor quando você quer compartilhar um grafo de jobs inteiro (ex: a mesma sequência de build+test+deploy) entre vários repos.
- **Composite action**: melhor pra compartilhar um punhado de steps (ex: "configurar o runtime + restore + cache") pra inserir em jobs/workflows diferentes.

## Actions comuns pra .NET
- `actions/setup-dotnet@v4` — instala o SDK
- `actions/cache@v4` — cacheia pacotes NuGet
- `actions/upload-artifact@v4` / `actions/download-artifact@v4` — passa output de build entre jobs
- `azure/webapps-deploy@v3` — deploy pro Azure App Service
- `azure/login@v2` — login OIDC no Azure (preferível a publish profiles/secrets de longa duração pra produção)

## Actions comuns pra frontend
- `actions/setup-node@v4` — instala o Node e já cacheia o npm com `cache: 'npm'`
- `actions/upload-artifact@v4` / `actions/download-artifact@v4` — passa a pasta de build entre jobs
- `Azure/static-web-apps-deploy@v1` — deploy pro Azure Static Web Apps
- `aws-actions/configure-aws-credentials@v4` — credenciais via OIDC pra publicar num bucket S3/CloudFront
- `azure/login@v2` — login OIDC no Azure (preferível a publish profiles/secrets de longa duração pra produção)

## Proteção de branch
`Settings > Branches > Branch protection rules` pra `main`:
- Exigir pull request antes do merge, exigir aprovações
- Exigir que os status checks passem (selecione o workflow de build) antes do merge
- Exigir que branches estejam atualizadas antes do merge
- Opcionalmente exigir histórico linear pra um log mais limpo
