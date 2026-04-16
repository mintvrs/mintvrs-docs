---
id: criar-tenant
title: Criar e Configurar um Tenant
sidebar_position: 2
---

# Criar e Configurar um Tenant

Apenas **SuperAdmin** e **Admin** podem criar tenants.

## 1. Criar o tenant

```bash
curl -X POST https://api.mk.nearx.com.br/tenants \
  -H "Authorization: Bearer <token_superadmin>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minha Empresa",
    "slug": "minha-empresa"
  }'
```

**Resposta:**
```json
{
  "id": "tenant-uuid",
  "name": "Minha Empresa",
  "slug": "minha-empresa",
  "apiKey": "mk_live_xxxx",
  "apiSecret": "sk_live_yyyy",
  "active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

:::danger Guarde o apiSecret!
O `apiSecret` é mostrado apenas uma vez. Guarde-o imediatamente.
:::

## 2. Criar o TenantAdmin

```bash
curl -X POST https://auth.mk.nearx.com.br/auth/users/tenant-admin \
  -H "Authorization: Bearer <token_superadmin>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@minha-empresa.com",
    "name": "Admin da Empresa",
    "tenant_id": "tenant-uuid"
  }'
```

## 3. Configurar gateway de pagamento

```bash
curl -X POST https://api.mk.nearx.com.br/gateways \
  -H "Authorization: Bearer <token_tenantadmin>" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "stripe",
    "apiKey": "sk_live_...",
    "publishableKey": "pk_live_...",
    "webhookSecret": "whsec_..."
  }'
```

## 4. Testar a conexão do gateway

```bash
curl -X POST https://api.mk.nearx.com.br/gateways/test-connection \
  -H "Authorization: Bearer <token_tenantadmin>" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "stripe",
    "apiKey": "sk_live_..."
  }'
```

## 5. Ativar o gateway

```bash
curl -X PATCH https://api.mk.nearx.com.br/gateways/{gatewayId}/toggle \
  -H "Authorization: Bearer <token_tenantadmin>" \
  -H "Content-Type: application/json" \
  -d '{ "active": true }'
```

## 6. Configurar contrato blockchain (opcional)

Se o tenant vai usar NFTs na blockchain Xion:

```bash
# SuperAdmin cria o token CW20 para o tenant via Factory
curl -X POST https://api.mk.nearx.com.br/xion/factory/create-token \
  -H "Authorization: Bearer <token_superadmin>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant-uuid",
    "name": "MKToken Empresa",
    "symbol": "MKE"
  }'
```

## Dashboard do tenant

```bash
curl https://api.mk.nearx.com.br/tenants/{tenantId}/dashboard \
  -H "Authorization: Bearer <token>"
```

```json
{
  "totalCampaigns": 5,
  "activeCampaigns": 3,
  "totalRevenue": 15000.00,
  "totalTransactions": 342,
  "totalUsers": 89
}
```
