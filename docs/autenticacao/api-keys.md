---
id: api-keys
title: API Key + Secret (Integrações)
sidebar_position: 3
---

# API Key + Secret (Integrações)

Para sistemas externos que precisam integrar com o MKClub sem sessão de usuário, use o par **API Key + Secret** do tenant.

## Como usar

```bash
curl -X GET https://admin-api.homolog.mintvrs.com/campaigns \
  -H "X-API-Key: mk_live_xxxxxxxxxxxx" \
  -H "X-API-Secret: sk_live_yyyyyyyyyyyy"
```

Ambos os headers são **obrigatórios**. O request é escopado automaticamente ao tenant das chaves.

## Obtendo as chaves

As chaves são geradas automaticamente quando um tenant é criado. Para regenerá-las:

```bash
curl -X POST https://admin-api.homolog.mintvrs.com/tenants/{tenantId}/regenerate-keys \
  -H "Authorization: Bearer <token_superadmin>"
```

**Resposta (única vez que o secret é exibido em texto claro):**

```json
{
  "apiKey": "mk_live_a1b2c3d4e5f6...",
  "apiSecret": "sk_live_z9y8x7w6v5u4..."
}
```

:::danger Secret irrecuperável
O `apiSecret` é armazenado como hash bcrypt. Após essa resposta, ele nunca mais será exibido. Se perdido, regenere as chaves.
:::

## Validação

O `TenantApiKeyGuard` no admin-backend:

1. Lê `X-API-Key` e `X-API-Secret` do request
2. Busca o tenant pelo `apiKey`
3. Valida o `apiSecret` contra o hash bcrypt armazenado
4. Injeta o `tenantId` no contexto do request

## Endpoints compatíveis

Nem todos os endpoints aceitam API Key. Os que aceitam têm o decorator `@UseGuards(TenantApiKeyGuard)` ou similar. Na referência da API, procure endpoints que listam `X-API-Key` e `X-API-Secret` como esquemas de segurança.

## Casos de uso comuns

- **Webhooks recebidos**: seu sistema registra transações no MKClub via `POST /transactions/register`
- **Integração de CRM**: busca campanhas e transações periodicamente
- **Dashboard externo**: lê dados do tenant para exibição customizada
