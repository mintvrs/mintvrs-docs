---
id: overview
title: Visão Geral da Autenticação
sidebar_position: 1
---

# Autenticação — Visão Geral

O MKClub usa dois mecanismos de autenticação no admin-backend:

| Mecanismo | Header | Quando usar |
|-----------|--------|-------------|
| **JWT Bearer** | `Authorization: Bearer <token>` | Usuários do painel admin e usuários finais |
| **Tenant API Key** | `X-API-Key` + `X-API-Secret` | Integrações externas (sistemas B2B) |

## Fluxo geral

```mermaid
flowchart TD
    A["Usuário / Sistema"] --> B{{"Tipo de autenticação"}}
    B -->|"Login humano"| C["POST /auth/login\n→ auth-service"]
    B -->|"API Key"| E["X-API-Key + X-API-Secret\n→ admin-backend"]

    C --> F["{ accessToken, refreshToken }"]
    F --> G["Authorization: Bearer accessToken\n→ admin-backend"]
    E --> H["Tenant resolvido\n→ admin-backend"]

    G --> I["GET /auth/profile (auth-service)\n→ valida token + retorna perfil"]
    I --> J["{ userId, role, tenant_id }\n→ contexto do request"]
```

## Tokens JWT

| Token | Duração | Uso |
|-------|---------|-----|
| `accessToken` | 1 hora | Enviado no header `Authorization: Bearer` |
| `refreshToken` | 7 dias | Usado em `POST /auth/refresh` para renovar |

## Endpoints de autenticação (auth-service)

| Método | Path | Descrição |
|--------|------|-----------|
| `POST` | `/auth/login` | Login email/senha |
| `POST` | `/auth/refresh` | Renovar tokens |
| `GET` | `/auth/profile` | Perfil do usuário autenticado |
| `POST` | `/auth/register` | Registrar novo usuário |
| `POST` | `/auth/password/request-reset` | Solicitar reset de senha |
| `POST` | `/auth/password/reset` | Confirmar reset com token |

Veja a [referência completa da API Auth](/api/auth-service) para todos os detalhes e o playground interativo.
