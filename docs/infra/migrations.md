---
id: migrations
title: Migrations
sidebar_position: 2
---

# Migrations

## 1. Visão geral

As migrations são gerenciadas via **TypeORM** nos dois backends. Cada serviço tem seu próprio banco e seu próprio conjunto de migrations — completamente independentes.

| Serviço | Arquivos | DataSource | Banco (produção) |
|---|---|---|---|
| `admin-backend` | `admin-backend/migrations/` (19 arquivos) | `admin-backend/src/data-source.ts` | Aurora Serverless v2 (PostgreSQL) |
| `auth-service` | `auth-service/migrations/` (4 arquivos) | `auth-service/src/data-source.ts` | Aurora Serverless v2 (PostgreSQL) |

O TypeORM registra quais migrations foram aplicadas na tabela `typeorm_migrations` de cada banco:

```sql
SELECT * FROM typeorm_migrations ORDER BY timestamp;
```

## 2. Como as migrations são aplicadas em produção

Os dois serviços utilizam TypeORM, mas com fluxos ligeiramente diferentes:

**`auth-service`** — as migrations rodam **automaticamente no boot do pod**, via `migrationsRun: true` configurado no `app.module.ts`. A cada deploy (rolling update), o TypeORM aplica as migrations pendentes antes do HTTP listener ficar pronto.

**`admin-backend`** — as migrations são aplicadas **via CLI após o deploy**, usando `ts-node` dentro do pod. O procedimento está na [seção 4](#4-rodar-migrations-manualmente).

A **StartupProbe** de cada serviço segura o pod por tempo suficiente para o boot:

| Serviço | Tempo máximo (StartupProbe) |
|---|---|
| `admin-backend` | ~150s (30s inicial + 12 tentativas × 10s) |
| `auth-service` | ~130s (10s inicial + 12 tentativas × 10s) |

Passado esse tempo sem o pod responder como saudável, o Kubernetes mata e reinicia o pod.

**Pré-condição crítica:** o banco Aurora deve estar acessível quando o pod iniciar. Se não estiver, o TypeORM falha no boot, o pod entra em `CrashLoopBackOff` e as migrations não são aplicadas.

## 3. Verificar o estado das migrations

Após um deploy, para confirmar que as migrations foram aplicadas:

```bash
# admin-backend (usa ts-node — migrations em TypeScript)
kubectl -n mintvrs-admin-backend exec -it deploy/mintvrs-admin-backend -- \
  ts-node ./node_modules/typeorm/cli.js migration:show -d src/data-source.ts

# auth-service
kubectl -n mintvrs-auth exec -it deploy/mintvrs-auth -- \
  node ./node_modules/typeorm/cli.js migration:show -d dist/data-source.js
```

Migrations aplicadas aparecem marcadas com `[X]`; pendentes aparecem com `[ ]`.

## 4. Rodar migrations manualmente

Para o `admin-backend`, esse é o procedimento padrão após cada deploy. Para o `auth-service`, use apenas em caso de emergência (ex: banco inacessível durante o boot).

```bash
# admin-backend (usa ts-node — migrations em TypeScript)
kubectl -n mintvrs-admin-backend exec -it deploy/mintvrs-admin-backend -- \
  ts-node ./node_modules/typeorm/cli.js migration:run -d src/data-source.ts

# auth-service
kubectl -n mintvrs-auth exec -it deploy/mintvrs-auth -- \
  node ./node_modules/typeorm/cli.js migration:run -d dist/data-source.js
```

Para desfazer a última migration aplicada:

```bash
# admin-backend
kubectl -n mintvrs-admin-backend exec -it deploy/mintvrs-admin-backend -- \
  ts-node ./node_modules/typeorm/cli.js migration:revert -d src/data-source.ts

# auth-service
kubectl -n mintvrs-auth exec -it deploy/mintvrs-auth -- \
  node ./node_modules/typeorm/cli.js migration:revert -d dist/data-source.js
```

## 5. Em desenvolvimento local

Os scripts npm estão disponíveis em cada diretório de serviço:

```bash
# admin-backend
cd admin-backend
npm run migration:run      # aplica migrations pendentes
npm run migration:show     # lista o estado de cada migration
npm run migration:revert   # desfaz a última migration aplicada

# auth-service
cd auth-service
npm run migration:run
npm run migration:show
npm run migration:revert
```

O Postgres local sobe via `docker-compose.local.yml` na raiz do projeto. Os bancos `mkclub_backend` e `authdb` são criados pelo script `init-local-dbs.sql` na inicialização:

```bash
# Na raiz do projeto
docker compose -f docker-compose.local.yml up -d
```

## 6. Pontos de atenção do modelo atual

O modelo atual funciona bem no dia a dia, mas tem aspectos que valem monitorar:

- **Rolling update com `maxSurge: 2`** — dois pods novos podem subir em paralelo e tentar rodar migrations simultaneamente. O TypeORM usa a tabela `typeorm_migrations` como lock implícito; em teoria é seguro, mas se surgirem erros de concorrência nos logs, é sinal de atenção.
- **`progressDeadlineSeconds: 10` é apertado** — se uma migration específica demorar mais do que o esperado, o Kubernetes pode marcar o rollout como falho mesmo que a migration tenha sido aplicada com sucesso. Verificar com `migration:show` antes de assumir que falhou.
- **Falha de banco no boot** — se o Aurora não estiver acessível no boot, o pod entra em `CrashLoopBackOff`. O pod continua sem as migrations aplicadas até que seja reiniciado com o banco disponível. Sempre verificar com `migration:show` após qualquer incidente de banco.

## 7. Sugestão de melhoria (para discussão com dev)

O modelo atual mistura responsabilidade de infra (deploy) com lógica de aplicação (migration no boot). Uma alternativa mais robusta é separar isso em um **Kubernetes `Job`** por serviço, executado via **ArgoCD PreSync hook**:

- A migration roda como etapa explícita antes do rolling update.
- Falha de migration bloqueia o deploy — o Deployment antigo continua servindo.
- Elimina a corrida de múltiplos pods tentando migrar simultaneamente.

Essa mudança requer desativar `migrationsRun: true` no `app.module.ts` (decisão do time de dev) e adicionar manifestos `Job` no repo `mkclub69/mk-microservice-ops`. Pode ser discutido com o time antes de implementar.

## 8. Problemas comuns

### Pod em `CrashLoopBackOff` após deploy

```bash
kubectl -n mintvrs-admin-backend get pods
kubectl -n mintvrs-admin-backend logs <pod-name>
```

Causas mais prováveis: banco Aurora inacessível, secret incorreto no AWS Secrets Manager, ou erro numa migration específica. Verificar os logs do pod para identificar.

### `database "X" does not exist`

O banco precisa existir no Aurora antes das migrations rodarem. Os nomes corretos são:

| Serviço | Nome do banco |
|---|---|
| `admin-backend` | `mkclub_backend` |
| `auth-service` | `authdb` |

### Env vars trocadas entre serviços

`admin-backend` usa `DATABASE_URL_ADMIN`; `auth-service` usa `DATABASE_URL`. Conferir os `ExternalSecret` no repo de ops:
- `mk-microservice-ops/mintvrs-admin-backend/external-secret.yml`
- `mk-microservice-ops/mintvrs-auth/external-secret.yml`

### Tag nova não aplicada no cluster

Verificar se o ArgoCD está em sync. A causa mais comum é o workflow ter atualizado o `kustomization.yaml` no repo de ops mas o ArgoCD não ter sincronizado ainda. Verificar no painel do ArgoCD o status do app.
