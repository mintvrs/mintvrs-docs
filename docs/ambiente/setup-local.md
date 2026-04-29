---
id: setup-local
title: Setup Local (Dev)
sidebar_position: 1
---

# Setup Local (Desenvolvimento)

## Pré-requisitos

- **Node.js** >= 18.0
- **Docker** e **Docker Compose**
- **npm** ou **pnpm**

## 1. Subir o banco de dados

```bash
# Na raiz do projeto
docker compose -f docker-compose.local.yml up -d
```

Isso inicia o **PostgreSQL 16** na porta **5433** e cria os bancos `authdb` e `mkclub_backend`.

## 2. Configurar variáveis de ambiente

### auth-service

```bash
cp auth-service/.env.example auth-service/.env  # ou criar manualmente
```

Edite `auth-service/.env`:
```bash
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres!@localhost:5433/authdb
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
# SMTP (opcional para dev)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

### admin-backend

```bash
# Copiar e configurar
```

Edite `admin-backend/.env`:
```bash
PORT=3006
NODE_ENV=development
DATABASE_URL_ADMIN=postgresql://postgres:postgres!@localhost:5433/mkclub_backend
AUTH_SERVICE_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3010
BCRYPT_SALT_ROUNDS=10
LOG_LEVEL=log
API_BASE_URL=http://localhost:3006
```

Edite `admin-backend/.env.blockchain`:
```bash
XION_MNEMONIC=sua frase mnemonica aqui
XION_RPC_URL=https://rpc.xion-testnet-2.burnt.com:443
XION_CHAIN_ID=xion-testnet-2
XION_NFT_CONTRACT=xion1...
XION_CW20_CONTRACT=xion1...
XION_FACTORY_CONTRACT=xion1...
```

### admin-frontend

```bash
cp admin-frontend/.env.example admin-frontend/.env  # ou criar manualmente
```

Edite `admin-frontend/.env`:
```bash
NEXT_PUBLIC_ADMIN_BACKEND_URL=http://localhost:3006
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
AUTH_SERVICE_BASE_URL=http://localhost:3001
# AWS S3 para upload de conteúdo
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=
```

## 3. Instalar dependências

```bash
# auth-service
cd auth-service && npm install

# admin-backend
cd admin-backend && npm install

# admin-frontend
cd admin-frontend && npm install  # ou pnpm install
```

## 4. Rodar as migrations

```bash
# auth-service
cd auth-service && npm run migration:run

# admin-backend
cd admin-backend && npm run migration:run
```

:::tip Infra
Para detalhes operacionais completos, troubleshooting e o comando de produção via Docker, veja [Migrations (Infra)](/infra/migrations).
:::

## 5. Popular com dados de seed (opcional)

```bash
# Na raiz do projeto
psql -h localhost -p 5433 -U postgres -f seed.sql
```

Isso cria:
- Usuário SuperAdmin: `superadmin@mkclub.com` / senha: `123456`
- Usuário Admin: `admin@mkclub.com`
- Usuário TenantAdmin: `tenantadmin@empresa.com`
- Usuário User: `user@empresa.com`
- 1 Tenant de exemplo com API keys

## 6. Iniciar os serviços

```bash
# Terminal 1 — auth-service
cd auth-service && npm run start:dev

# Terminal 2 — admin-backend
cd admin-backend && npm run start:dev

# Terminal 3 — admin-frontend
cd admin-frontend && npm run dev
```

## 7. Verificar que tudo funciona

| URL | Status esperado |
|-----|----------------|
| `http://localhost:3001/health` | `{ "status": "ok", "service": "auth-service" }` |
| `http://localhost:3006/health` | `{ "status": "ok", "service": "admin-backend" }` |
| `http://localhost:3000` | Painel admin (login) |
| `http://localhost:3006/api-docs` | Swagger UI admin-backend |
| `http://localhost:3001/docs-auth-service` | Swagger UI auth-service |

## 8. Gerar documentação (esta docs)

```bash
# Gerar specs OpenAPI dos backends
cd docs && npm run gen-specs

# Gerar páginas de API do Docusaurus
npm run gen-api-docs

# Iniciar servidor de docs
npm run start
# Acesse: http://localhost:3003
```
