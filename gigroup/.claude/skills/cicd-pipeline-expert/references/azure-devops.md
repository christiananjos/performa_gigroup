# Referência Azure DevOps

## Pipeline .NET básico (azure-pipelines.yml)

```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  buildConfiguration: 'Release'

stages:
  - stage: Build
    jobs:
      - job: BuildAndTest
        steps:
          - task: UseDotNet@2
            inputs:
              packageType: 'sdk'
              version: '8.x'
          - task: DotNetCoreCLI@2
            displayName: 'Restore'
            inputs:
              command: 'restore'
          - task: DotNetCoreCLI@2
            displayName: 'Build'
            inputs:
              command: 'build'
              arguments: '--configuration $(buildConfiguration) --no-restore'
          - task: DotNetCoreCLI@2
            displayName: 'Test'
            inputs:
              command: 'test'
              arguments: '--configuration $(buildConfiguration) --no-build --collect:"XPlat Code Coverage"'
          - task: DotNetCoreCLI@2
            displayName: 'Publish'
            inputs:
              command: 'publish'
              publishWebProjects: true
              arguments: '--configuration $(buildConfiguration) --output $(Build.ArtifactStagingDirectory)'
          - task: PublishBuildArtifacts@1
            inputs:
              PathtoPublish: '$(Build.ArtifactStagingDirectory)'
              ArtifactName: 'drop'

  - stage: DeployStaging
    dependsOn: Build
    jobs:
      - deployment: DeployStaging
        environment: 'staging'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureWebApp@1
                  inputs:
                    azureSubscription: '<nome-da-service-connection>'
                    appType: 'webApp'
                    appName: '<nome-do-app>-staging'
                    package: '$(Pipeline.Workspace)/drop/**/*.zip'
```

## Pipeline de frontend básico (azure-pipelines.yml)

```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: Build
    jobs:
      - job: BuildAndTest
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'
          - task: Cache@2
            inputs:
              key: 'npm | "$(Agent.OS)" | package-lock.json'
              path: '$(System.DefaultWorkingDirectory)/node_modules'
          - script: npm ci
            displayName: 'Install (lockfile)'
          - script: npm run lint
            displayName: 'Lint'
          - script: npm test -- --run
            displayName: 'Testes unitários'
          - script: npm run build
            displayName: 'Build de produção'
          - task: PublishBuildArtifacts@1
            inputs:
              PathtoPublish: 'dist'
              ArtifactName: 'site'

  - stage: DeployStaging
    dependsOn: Build
    jobs:
      - deployment: DeployStaging
        environment: 'staging'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureStaticWebApp@0
                  inputs:
                    app_location: '$(Pipeline.Workspace)/site'
                    skip_app_build: true
                    azure_static_web_apps_api_token: $(STATIC_WEB_APPS_TOKEN)
```

## Environments e gates

- Environments (`Pipelines > Environments`) permitem anexar aprovações/checks por ambiente — ambientes de produção devem ter um check de aprovador obrigatório.
- Deployment slots (App Service) habilitam blue-green: faça deploy pra um slot de staging, rode smoke tests, depois use a task `AzureAppServiceManage@0` pra trocar (swap) os slots.

## Referência das principais tasks
- `UseDotNet@2` — instala uma versão específica do SDK
- `DotNetCoreCLI@2` — restore/build/test/publish/pack/push (cobre a maioria dos steps .NET)
- `PublishBuildArtifacts@1` / `PublishPipelineArtifact@1` — persiste o output do build entre stages
- `AzureWebApp@1` — deploy pro Azure App Service
- `AzureRmWebAppDeployment@4` — deploy mais avançado pro App Service (slots, método de deploy)
- `Cache@2` — cacheia pacotes NuGet entre execuções

## Referência das principais tasks
- `NodeTool@0` — instala uma versão específica do Node
- `Cache@2` — cacheia `node_modules`/cache do npm com chave baseada no `package-lock.json`
- `script:` — roda os scripts do `package.json` (`npm ci`, `npm run lint`, `npm test`, `npm run build`)
- `PublishBuildArtifacts@1` / `PublishPipelineArtifact@1` — persiste a pasta de build entre stages
- `AzureStaticWebApp@0` — deploy pro Azure Static Web Apps
- `AzureWebApp@1` — deploy pro App Service, quando o front é servido por lá em vez de CDN

## Políticas de branch (Repos)
Configure em `Project Settings > Repositories > Branch Policies` pra `main`:
- Exigir um número mínimo de reviewers
- Checar work items vinculados (opcional, útil pra rastreabilidade)
- Build validation: vincule o pipeline de CI pra que PRs não possam dar merge com build vermelho
- Exigir resolução de comentários antes do merge

## Integração com Boards
- Vincule commits/PRs a work items com `AB#<id>` nas mensagens de commit pra vinculação automática.
- Use area paths + iteration paths pra escopar um board Kanban por time/sprint.
