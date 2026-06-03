---
id: homolog
title: Ambiente de Homologação
---

# Ambiente de Homologação

Ambiente de **homologação (homolog)** — use estes domínios para testes e integração do front. **Não use os domínios de produção** para validar a integração.

## Domínios

| Domínio | Serviço | Repositório |
|---|---|---|
| `https://admin.homolog.mintvrs.com` | Admin Web (frontend) | `mintvrs-admin-web-homolog` |
| `https://admin-api.homolog.mintvrs.com` | Admin Backend (API) | `mintvrs-admin-backend-homolog` |
| `https://auth.homolog.mintvrs.com` | Auth Service | `mintvrs-auth-homolog` |

## Swagger / OpenAPI

| Serviço | Swagger UI |
|---|---|
| Admin Backend | [`https://admin-api.homolog.mintvrs.com/api-docs`](https://admin-api.homolog.mintvrs.com/api-docs) |
| Auth Service | [`https://auth.homolog.mintvrs.com/docs-auth-service`](https://auth.homolog.mintvrs.com/docs-auth-service) |

## Fluxo de autenticação

1. **Login** no Auth Service: `POST https://auth.homolog.mintvrs.com/auth/login` → retorna `accessToken` e `refreshToken`.
2. Enviar `Authorization: Bearer <accessToken>` nas chamadas ao **Admin Backend** (`https://admin-api.homolog.mintvrs.com`).
3. Renovar com `POST https://auth.homolog.mintvrs.com/auth/refresh` quando o `accessToken` expirar.

:::warning Configuração do Postman / cliente HTTP
Aponte as base URLs para **homolog** (e não para produção):

- `AUTH_BASE_URL = https://auth.homolog.mintvrs.com`
- `baseUrl = https://admin-api.homolog.mintvrs.com`

Garanta também que o header `Authorization` use a variável que o login **de fato popula** (`accessToken`) — não um placeholder fixo. Após o `POST /auth/login`, o token é salvo em `accessToken`; todas as requisições autenticadas devem enviar `Authorization: Bearer {{accessToken}}`.
:::
