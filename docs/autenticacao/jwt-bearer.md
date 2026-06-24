---
id: jwt-bearer
title: JWT Bearer
sidebar_position: 2
---

# Autenticação JWT Bearer

## Login

```bash
curl -X POST https://auth.homolog.mintvrs.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "usuario@email.com", "password": "SuaSenha123" }'
```

**Resposta:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Usando o token

Envie o `accessToken` no header `Authorization` de todas as requisições ao admin-backend:

```bash
curl -X GET https://admin-api.homolog.mintvrs.com/campaigns \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Renovando o token (refresh)

Quando o `accessToken` expirar (1 hora), use o `refreshToken` para obter novos tokens:

```bash
curl -X POST https://auth.homolog.mintvrs.com/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }'
```

**Resposta:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Diagrama de sequência completo

```mermaid
sequenceDiagram
    participant Client
    participant Auth as auth-service (:3001)
    participant Backend as admin-backend (:3006)

    Client->>Auth: POST /auth/login { email, password }
    Auth-->>Client: { accessToken (1h), refreshToken (7d) }

    Note over Client: Armazena tokens

    Client->>Backend: GET /campaigns (Bearer accessToken)
    Backend->>Auth: GET /auth/profile (Bearer accessToken)
    Auth-->>Backend: { userId, email, role, tenant_id }
    Backend-->>Client: [campaigns]

    Note over Client: access token expira após 1h

    Client->>Auth: POST /auth/refresh { refreshToken }
    Auth-->>Client: { novo accessToken, novo refreshToken }

    Client->>Backend: GET /transactions (Bearer novo accessToken)
    Backend-->>Client: [transactions]
```

## Obtendo o perfil do usuário

```bash
curl -X GET https://auth.homolog.mintvrs.com/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta:**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@email.com",
  "name": "Nome do Usuário",
  "role": "TenantAdmin",
  "tenant_id": "660e8400-e29b-41d4-a716-446655441111"
}
```

## Payload do JWT

O JWT contém as seguintes claims:

| Campo | Descrição |
|-------|-----------|
| `sub` | ID do usuário (UUID) |
| `email` | Email do usuário |
| `role` | Role: SuperAdmin, Admin, TenantAdmin, User, Star |
| `tenant_id` | ID do tenant (null para SuperAdmin/Admin) |
| `iat` | Timestamp de emissão |
| `exp` | Timestamp de expiração |
