---
id: primeiros-passos
title: Primeiros Passos
sidebar_position: 1
---

# Primeiros Passos

Guia rápido para integrar com a API do MKClub.

## 1. Obter credenciais

### Login e obter JWT

```bash
curl -X POST https://auth.homolog.mintvrs.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "suasenha"
  }'
```

**Resposta:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

Salve o `accessToken` — você vai usá-lo em todas as próximas chamadas.

## 2. Verificar sua identidade

```bash
curl https://auth.homolog.mintvrs.com/auth/profile \
  -H "Authorization: Bearer eyJhbGc..."
```

```json
{
  "userId": "550e8400...",
  "email": "seu@email.com",
  "name": "Seu Nome",
  "role": "TenantAdmin",
  "tenant_id": "660e8400..."
}
```

## 3. Explorar campanhas

```bash
# Listar campanhas do seu tenant
curl https://admin-api.homolog.mintvrs.com/campaigns \
  -H "Authorization: Bearer eyJhbGc..."
```

## 4. Ver campanhas ativas (público)

```bash
# Este endpoint não requer autenticação
curl https://admin-api.homolog.mintvrs.com/campaigns/active
```

## 5. Ver saldo de créditos

```bash
curl https://admin-api.homolog.mintvrs.com/credits/balance \
  -H "Authorization: Bearer eyJhbGc..."
```

```json
{
  "balance": 150.00,
  "lockedBalance": 0.00,
  "currency": "BRL"
}
```

## URLs de produção

| Serviço | URL |
|---------|-----|
| Auth Service | `https://auth.homolog.mintvrs.com` |
| Admin Backend | `https://admin-api.homolog.mintvrs.com` |
| Admin Panel | `https://admin.mintvrs.com` |

## URLs locais (desenvolvimento)

| Serviço | URL |
|---------|-----|
| Auth Service | `http://localhost:3001` |
| Admin Backend | `http://localhost:3006` |
| Admin Panel | `http://localhost:3000` |
| Swagger Admin | `http://localhost:3006/api-docs` |
| Swagger Auth | `http://localhost:3001/docs-auth-service` |

## Headers obrigatórios

| Header | Valor | Quando |
|--------|-------|--------|
| `Content-Type` | `application/json` | Requests com body (POST/PUT/PATCH) |
| `Authorization` | `Bearer <accessToken>` | Endpoints protegidos |
| `X-API-Key` | `mk_live_...` | Integração via API Key |
| `X-API-Secret` | `sk_live_...` | Integração via API Key (junto com X-API-Key) |
