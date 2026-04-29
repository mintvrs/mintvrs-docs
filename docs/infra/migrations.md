---
id: migrations
title: Migrations
sidebar_position: 2
---

# Migrations

## 1. Visão geral

As migrations são gerenciadas via **TypeORM** nos dois backends. Cada serviço tem seu próprio banco e seu próprio conjunto de migrations — eles são completamente independentes.

| Serviço | Arquivos de migration | DataSource |
|---|---|---|
| `admin-backend` | `admin-backend/migrations/` (19 arquivos) | `admin-backend/src/data-source.ts` |
| `auth-service` | `auth-service/migrations/` (4 arquivos) | `auth-service/src/data-source.ts` |

O TypeORM registra quais migrations já foram aplicadas na tabela `typeorm_migrations` de cada banco. Você pode consultá-la diretamente:

```sql
SELECT * FROM typeorm_migrations ORDER BY timestamp;
```

## 2. Pré-requisitos

Antes de rodar as migrations, garanta que:

1. O Postgres está **acessível e disponível**.
2. Os **bancos de dados já existem** (`mkclub_backend` para o admin, `authdb` para o auth). As migrations não criam o banco — elas criam tabelas dentro de um banco já existente.
3. As **variáveis de ambiente corretas** estão configuradas.

:::danger Env vars diferentes por serviço
`admin-backend` usa `DATABASE_URL_ADMIN`. `auth-service` usa `DATABASE_URL`. Não são intercambiáveis — usar a errada fará o serviço conectar ao banco errado ou falhar.
:::

```bash
# admin-backend
DATABASE_URL_ADMIN=postgresql://usuario:senha@host:5432/mkclub_backend

# auth-service
DATABASE_URL=postgresql://usuario:senha@host:5432/authdb
```

## 3. Em produção — comportamento padrão

As migrations são **aplicadas automaticamente quando o container do backend sobe**. Isso é configurado via `migrationsRun: true` no TypeORM (`app.module.ts` de cada serviço). Não é necessária nenhuma etapa manual separada no deploy normal.

```bash
# Subir a stack — as migrations rodam automaticamente no boot
cd acesso-db-mkclub
docker compose up -d
```

**Pré-condição:** o Postgres deve estar pronto antes dos containers do backend subirem. Se o banco ainda não estiver disponível quando o app iniciar, o `migrationsRun` falha nos logs e o container pode continuar de pé sem ter aplicado as migrations.

### Verificar o que foi aplicado

```bash
docker exec backend node ./node_modules/typeorm/cli.js migration:show -d dist/data-source.js
docker exec auth    node ./node_modules/typeorm/cli.js migration:show -d dist/data-source.js
```

### Forçar a execução manualmente (fallback)

Se precisar re-aplicar ou forçar após confirmar que o Postgres está up:

```bash
# admin-backend
docker exec backend node ./node_modules/typeorm/cli.js migration:run -d dist/data-source.js

# auth-service
docker exec auth node ./node_modules/typeorm/cli.js migration:run -d dist/data-source.js
```

Para desfazer a última migration:

```bash
docker exec backend node ./node_modules/typeorm/cli.js migration:revert -d dist/data-source.js
docker exec auth    node ./node_modules/typeorm/cli.js migration:revert -d dist/data-source.js
```

## 4. Em desenvolvimento local

Os scripts npm estão disponíveis em cada diretório de serviço.

```bash
# auth-service
cd auth-service
npm run migration:run      # aplica migrations pendentes
npm run migration:show     # lista o estado de cada migration
npm run migration:revert   # desfaz a última migration aplicada

# admin-backend
cd admin-backend
npm run migration:run
npm run migration:show
npm run migration:revert
```

O banco local é provisionado via `docker-compose.local.yml` na raiz do projeto. Os bancos `mkclub_backend` e `authdb` são criados automaticamente pelo script `init-local-dbs.sql` ao subir o Postgres local.

```bash
# Na raiz do projeto, subir o Postgres local (porta 5433)
docker compose -f docker-compose.local.yml up -d
```

## 5. Problemas comuns

### `database "X" does not exist`

O banco precisa existir antes de rodar as migrations. O nome do banco na connection string deve bater exatamente com o que foi criado no Postgres.

| Serviço | Nome correto do banco |
|---|---|
| `admin-backend` | `mkclub_backend` |
| `auth-service` | `authdb` |

Nomes errados comuns que causam esse erro: `mkclub`, `auth_db`, `auth-service`.

**Solução:** ajustar a variável de ambiente com o nome correto do banco.

### Env vars trocadas entre os serviços

O `admin-backend` usa `DATABASE_URL_ADMIN`; o `auth-service` usa `DATABASE_URL`. Se você inverter, o serviço conectará no banco errado ou não encontrará a variável.

**Solução:** conferir que cada serviço está recebendo a variável certa.

### Container subiu antes do Postgres estar pronto

Se o backend iniciar antes do Postgres aceitar conexões, o `migrationsRun` falha silenciosamente e o app continua rodando sem as migrations aplicadas. Isso costuma aparecer nos logs como erro de conexão na inicialização.

**Solução imediata:** rodar a migration manualmente (seção 3 acima) após confirmar que o Postgres está up.

**Solução definitiva:** configurar `depends_on` com healthcheck no `docker-compose.yml` da stack para garantir que o Postgres esteja pronto antes dos backends subirem. Exemplo:

```yaml
services:
  backend:
    depends_on:
      db:
        condition: service_healthy
  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 10
```

### Nenhuma variável de ambiente configurada (sem `.env.example`)

O projeto não possui `.env.example`. As variáveis mínimas necessárias para cada serviço funcionar são:

**`admin-backend/.env`:**
```
DATABASE_URL_ADMIN=postgresql://postgres:SENHA@localhost:5432/mkclub_backend
```

**`auth-service/.env`:**
```
DATABASE_URL=postgresql://postgres:SENHA@localhost:5432/authdb
```

Consulte também [Variáveis de Ambiente](/ambiente/variaveis) para a lista completa.
