---
id: variaveis
title: Variáveis de Ambiente
sidebar_position: 2
---

# Variáveis de Ambiente

Referência completa de todas as variáveis de ambiente dos serviços.

## auth-service

| Variável | Obrigatória | Padrão | Descrição |
|----------|:-----------:|--------|-----------|
| `PORT` | ❌ | `3001` | Porta do serviço |
| `NODE_ENV` | ❌ | `development` | Ambiente |
| `DATABASE_URL` | ✅ | — | URL de conexão PostgreSQL (`authdb`) |
| `JWT_SECRET` | ✅ | — | Chave secreta para assinar JWTs |
| `JWT_EXPIRES_IN` | ❌ | `1h` | Duração do access token |
| `REFRESH_TOKEN_EXPIRES_IN` | ❌ | `7d` | Duração do refresh token |
| `SMTP_HOST` | ❌ | — | Host do servidor SMTP (reset de senha) |
| `SMTP_PORT` | ❌ | `587` | Porta SMTP |
| `SMTP_USER` | ❌ | — | Usuário SMTP |
| `SMTP_PASS` | ❌ | — | Senha SMTP |
| `SMTP_FROM` | ❌ | — | Email remetente |
| `CORS_ORIGINS` | ✅ | — | Origins permitidos (comma-separated). Deve incluir `https://docs.mintvrs.com` em produção |
| `API_BASE_URL` | ❌ | `http://localhost:3001` | URL base para Swagger server |
| `LOG_LEVEL` | ❌ | `log` | Nível de log (verbose/debug/log/warn/error) |

## admin-backend

### .env

| Variável | Obrigatória | Padrão | Descrição |
|----------|:-----------:|--------|-----------|
| `PORT` | ❌ | `3006` | Porta do serviço |
| `NODE_ENV` | ❌ | `development` | Ambiente |
| `DATABASE_URL_ADMIN` | ✅ | — | URL de conexão PostgreSQL (`mkclub_backend`) |
| `AUTH_SERVICE_URL` | ✅ | — | URL do auth-service para validar JWTs |
| `CORS_ORIGINS` | ✅ | — | Origins permitidos (comma-separated) |
| `API_BASE_URL` | ❌ | `http://localhost:3006` | URL base para Swagger server |
| `BCRYPT_SALT_ROUNDS` | ❌ | `10` | Rounds para hash de senhas/secrets |
| `LOG_LEVEL` | ❌ | `log` | Nível de log |

### .env.blockchain

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `XION_MNEMONIC` | ✅ (blockchain) | Frase mnemônica BIP39 da wallet admin |
| `XION_RPC_URL` | ✅ (blockchain) | URL do RPC Xion |
| `XION_CHAIN_ID` | ✅ (blockchain) | Chain ID (ex: `xion-testnet-2`) |
| `XION_NFT_CONTRACT` | ❌ | Endereço do contrato CW721 padrão |
| `XION_CW20_CONTRACT` | ❌ | Endereço do contrato CW20 padrão |
| `XION_FACTORY_CONTRACT` | ❌ | Endereço do contrato Factory |
| `XION_EXPLORER_BASE_URL` | ❌ | URL base do explorer para links |
| `XION_NFT_WASM_PATH` | ❌ | Caminho do arquivo WASM CW721 |
| `XION_CW20_WASM_PATH` | ❌ | Caminho do arquivo WASM CW20 |
| `XION_FACTORY_WASM_PATH` | ❌ | Caminho do arquivo WASM Factory |

:::info
As variáveis de blockchain são carregadas primeiro de `.env.blockchain`, depois de `.env`. As variáveis de blockchain são opcionais para o início do serviço — se ausentes ou inválidas, o `XionService` loga um warning e continua (endpoints de blockchain retornarão erro).
:::

## admin-frontend

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `NEXT_PUBLIC_ADMIN_BACKEND_URL` | ✅ | URL do admin-backend (usada no browser) |
| `NEXT_PUBLIC_AUTH_SERVICE_URL` | ✅ | URL do auth-service (usada no browser) |
| `AUTH_SERVICE_BASE_URL` | ✅ | URL do auth-service (usada no servidor Next.js) |
| `NEXT_PUBLIC_XION_EXPLORER_BASE_URL` | ❌ | URL base do explorer Xion |
| `AWS_ACCESS_KEY_ID` | ❌ | Access key AWS para S3 |
| `AWS_SECRET_ACCESS_KEY` | ❌ | Secret key AWS para S3 |
| `AWS_REGION` | ❌ | Região AWS S3 |
| `AWS_S3_BUCKET` | ❌ | Nome do bucket S3 para conteúdo |

## Produção (docker-compose)

No ambiente de produção, as variáveis são injetadas via `docker-compose.yml` ou secrets do sistema de orquestração. Consulte `acesso-db-mkclub/SERVER-CHECKLIST.md` para o checklist completo.

:::warning Secrets em produção
Nunca commite valores reais de `JWT_SECRET`, `XION_MNEMONIC`, chaves AWS, ou secrets de gateway no repositório. Use variáveis de ambiente do sistema de CI/CD ou um gerenciador de secrets.
:::
