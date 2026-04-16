---
id: visao-geral
title: Visão Geral do Sistema
sidebar_position: 1
---

# Visão Geral do Sistema

O MKClub é composto por três serviços independentes que se comunicam via HTTP e compartilham um banco de dados PostgreSQL.

## Diagrama de arquitetura

```mermaid
graph TB
    subgraph "Clientes"
        BROWSER["Browser"]
        EXTAPI["Sistema Externo\n(API Key)"]
    end

    subgraph "Frontend — :3000"
        FE["Next.js 16\nadmin-frontend"]
        PROXY["/api/* proxy routes"]
    end

    subgraph "Auth Service — :3001"
        AUTH["NestJS v10\nauth-service"]
        AUTHDB[("authdb\nPostgreSQL")]
    end

    subgraph "Admin Backend — :3006"
        BACK["NestJS v11\nadmin-backend"]
        BACKDB[("mkclub_backend\nPostgreSQL")]
    end

    subgraph "Externos"
        XION["Xion Blockchain\n(Cosmos/CosmWasm)"]
        STRIPE["Stripe"]
        MP["Mercado Pago"]
        S3["AWS S3"]
    end

    BROWSER --> FE
    EXTAPI -->|"X-API-Key + X-API-Secret"| BACK
    FE --> PROXY
    PROXY -->|"JWT"| AUTH
    PROXY -->|"Bearer JWT ou API Key"| BACK
    AUTH --> AUTHDB
    BACK --> BACKDB
    BACK --> XION
    BACK --> STRIPE
    BACK --> MP
    FE --> S3
```

## Responsabilidades de cada serviço

### auth-service (porta 3001)

Serviço dedicado à **autenticação e identidade**:
- Login com email/senha (Passport Local)
- Emissão e validação de JWT (access token + refresh token)
- Registro de usuários
- Reset de senha por email (Nodemailer)
- Gestão de usuários no banco `authdb`

O admin-backend **não valida JWTs diretamente** — delega para o auth-service via `GET /auth/profile`.

### admin-backend (porta 3006)

Serviço principal com **toda a lógica de negócio**:
- Multi-tenancy (cada request é escopado a um tenant)
- CRUD de campanhas, conteúdos, tokens, acessos
- Sistema de créditos e pagamentos (Stripe, Mercado Pago)
- Marketplace P2P entre usuários
- Integração com blockchain Xion (mint de NFTs, CW20)
- Splits de receita para artistas

### admin-frontend (porta 3000)

**Painel administrativo e marketplace** para clientes:
- Rota `GET /api/backend/[...path]` faz proxy para o admin-backend
- Rota `GET /api/auth/*` faz proxy para o auth-service
- Elimina problemas de CORS no browser
- Upload de conteúdo via S3 presigned URLs

## Fluxo de uma requisição autenticada

```mermaid
sequenceDiagram
    participant Browser
    participant Frontend as Next.js (:3000)
    participant Auth as auth-service (:3001)
    participant Backend as admin-backend (:3006)
    participant DB as PostgreSQL

    Browser->>Frontend: GET /campaigns
    Frontend->>Backend: GET /campaigns (Authorization: Bearer <token>)
    Backend->>Auth: GET /auth/profile (token)
    Auth->>DB: SELECT user WHERE token valid
    DB-->>Auth: User { id, role, tenant_id }
    Auth-->>Backend: { userId, role, tenant_id }
    Backend->>DB: SELECT campaigns WHERE tenant_id = ?
    DB-->>Backend: [campaigns]
    Backend-->>Frontend: 200 OK [campaigns]
    Frontend-->>Browser: Render campaigns
```

## Banco de dados

| Banco | Serviço | Tabelas principais |
|-------|---------|-------------------|
| `authdb` | auth-service | `users` |
| `mkclub_backend` | admin-backend | `tenants`, `campaigns`, `tokens`, `transactions`, `credit_balances`, `credit_transactions`, `marketplace_listings`, `accesses`, `access_types`, `main_stars`, `contents`, `campaign_stars`, `tenant_gateways`, `configs` |

Ambos os bancos rodam na mesma instância PostgreSQL (porta 5433 em dev).
