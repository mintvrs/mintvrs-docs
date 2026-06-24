---
id: multi-tenancy
title: Multi-Tenancy & Roles
sidebar_position: 3
---

# Multi-Tenancy & Roles

O admin-backend é **totalmente multi-tenant**: uma única instância do serviço atende múltiplos clientes (tenants) de forma completamente isolada.

## Como o tenant é resolvido

Todo request passa pelo `TenantContextMiddleware` que resolve o tenant de duas formas:

```mermaid
flowchart TD
    REQ["HTTP Request"] --> MW["TenantContextMiddleware"]
    MW --> CHECK{{"Como autenticar?"}}
    CHECK -->|"Authorization: Bearer JWT"| JWT["Extrai userId do JWT\n→ consulta /auth/profile\n→ usa tenant_id do perfil"]
    CHECK -->|"X-API-Key + X-API-Secret"| APIKEY["TenantApiKeyGuard\n→ busca tenant pelo apiKey\n→ valida secretKey (bcrypt)\n→ usa tenant_id do tenant"]
    JWT --> CTX["req.tenantId / req.tenantIds"]
    APIKEY --> CTX
    CTX --> CTRL["Controller"]
```

## Hierarquia de roles

```mermaid
graph TD
    SA["SuperAdmin\nAcesso total — todos os tenants"]
    A["Admin\nGerencia seus próprios tenants"]
    TA["TenantAdmin\nEscopado a um tenant"]
    U["User\nUsuário final — escopado a tenant"]
    S["Star\nArtista — acesso a splits"]

    SA --> A
    A --> TA
    TA --> U
    TA --> S
```

## Matriz de permissões por endpoint

| Recurso | SuperAdmin | Admin | TenantAdmin | User | Star |
|---------|:---:|:---:|:---:|:---:|:---:|
| Criar/listar tenants | ✅ | ✅ (próprios) | ❌ | ❌ | ❌ |
| Dashboard global | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dashboard do tenant | ✅ | ✅ | ✅ | ❌ | ❌ |
| Criar campanha | ✅ | ✅ | ✅ | ✅ | ❌ |
| Listar campanhas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gerenciar usuários | ✅ | ✅ | ✅ | ❌ | ❌ |
| Conceder créditos | ✅ | ❌ | ✅ | ❌ | ❌ |
| Configurar gateway | ✅ | ❌ | ✅ | ❌ | ❌ |
| Ver splits | ✅ | ❌ | ✅ | ❌ | ✅ |
| Marketplace | ✅ | ✅ | ✅ | ✅ | ❌ |
| Deploy blockchain | ✅ | ❌ | ✅ | ❌ | ❌ |

## Isolamento de dados

O middleware injeta `tenantId` no `request`. Cada controller/service usa esse ID para filtrar dados:

```typescript
// Exemplo no CampaignsService
async findAll(tenantId: string): Promise<Campaign[]> {
  return this.campaignRepo.find({ where: { tenantId } });
}
```

Usuários **SuperAdmin** e **Admin** podem receber `tenantIds` (plural) — um array com todos os tenants que gerenciam.

## Autenticação via API Key (integrações)

Para sistemas externos que não usam JWT, o tenant pode usar suas chaves:

```http
GET /campaigns HTTP/1.1
Host: admin-api.homolog.mintvrs.com
X-API-Key: mk_live_xxxxxxxxxxxx
X-API-Secret: sk_live_yyyyyyyyyyyy
```

As chaves são geradas no momento da criação do tenant e podem ser regeneradas com `POST /tenants/:id/regenerate-keys`.

:::warning Segurança
O `secretKey` é armazenado como hash bcrypt. Nunca é retornado após a criação inicial. Se perdido, deve ser regenerado.
:::
