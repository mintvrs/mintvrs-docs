---
id: roles
title: Roles e Permissões
sidebar_position: 5
---

# Roles e Permissões

## Roles disponíveis

| Role | Descrição | tenant_id |
|------|-----------|-----------|
| **SuperAdmin** | Acesso total à plataforma. Gerencia todos os tenants. | `null` |
| **Admin** | Cliente B2B. Cria e gerencia seus próprios tenants. | `null` |
| **TenantAdmin** | Administrador de um tenant específico. Gerencia campanhas, usuários e configurações do tenant. | UUID |
| **User** | Usuário final (apoiador). Pode comprar chaves, ver conteúdo e usar o marketplace. | UUID |
| **Star** | Artista/estrela. Acesso a campanhas onde está cadastrado e seus splits de receita. | UUID |

## Permissões detalhadas

### Tenants

| Operação | SuperAdmin | Admin | TenantAdmin | User | Star |
|----------|:---:|:---:|:---:|:---:|:---:|
| Criar tenant | ✅ | ✅ | ❌ | ❌ | ❌ |
| Listar tenants | ✅ | ✅ (próprios) | ❌ | ❌ | ❌ |
| Ver detalhes do tenant | ✅ | ✅ | ✅ (próprio) | ❌ | ❌ |
| Atualizar tenant | ✅ | ✅ | ✅ (próprio) | ❌ | ❌ |
| Regenerar API keys | ✅ | ✅ | ❌ | ❌ | ❌ |
| Dashboard global | ✅ | ❌ | ❌ | ❌ | ❌ |

### Campanhas

| Operação | SuperAdmin | Admin | TenantAdmin | User | Star |
|----------|:---:|:---:|:---:|:---:|:---:|
| Criar campanha | ✅ | ✅ | ✅ | ✅ | ❌ |
| Listar campanhas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editar campanha | ✅ | ✅ | ✅ | ✅ (própria) | ❌ |
| Deletar campanha | ✅ | ✅ | ✅ | ✅ (própria) | ❌ |
| Ver campanha pública | ✅ | ✅ | ✅ | ✅ | ✅ |

### Créditos e Pagamentos

| Operação | SuperAdmin | Admin | TenantAdmin | User | Star |
|----------|:---:|:---:|:---:|:---:|:---:|
| Ver saldo | ✅ | ❌ | ✅ | ✅ | ❌ |
| Conceder créditos | ✅ | ❌ | ✅ | ❌ | ❌ |
| Ver histórico próprio | ✅ | ❌ | ✅ | ✅ | ❌ |
| Ver histórico do tenant | ✅ | ❌ | ✅ | ❌ | ❌ |
| Ver todos os históricos | ✅ | ❌ | ❌ | ❌ | ❌ |
| Configurar gateway | ✅ | ❌ | ✅ | ❌ | ❌ |
| Criar checkout | ✅ | ❌ | ✅ | ✅ | ❌ |

### Blockchain (Xion)

| Operação | SuperAdmin | Admin | TenantAdmin | User | Star |
|----------|:---:|:---:|:---:|:---:|:---:|
| Deploy Factory | ✅ | ❌ | ❌ | ❌ | ❌ |
| Criar token de tenant | ✅ | ❌ | ❌ | ❌ | ❌ |
| Mint NFT (tenant) | ✅ | ❌ | ✅ | ❌ | ❌ |
| Registrar compra | ✅ | ❌ | ✅ | ❌ | ❌ |
| Ver health/address | ✅ | ✅ | ✅ | ✅ | ✅ |

### Splits

| Operação | SuperAdmin | Admin | TenantAdmin | User | Star |
|----------|:---:|:---:|:---:|:---:|:---:|
| Ver splits pessoais | ✅ | ❌ | ✅ | ✅ | ✅ |
| Ver splits do tenant | ✅ | ❌ | ✅ | ❌ | ❌ |
| Platform summary | ✅ | ❌ | ✅ | ❌ | ❌ |
| Exportar XLSX | ✅ | ❌ | ✅ | ❌ | ❌ |

## Vinculação de usuário a tenant

Usuários são vinculados a tenants via:

```bash
# SuperAdmin ou Admin vinculam um usuário a um tenant
PATCH /auth/users/{userId}/tenant
Authorization: Bearer <token_superadmin>
Content-Type: application/json

{ "tenant_id": "uuid-do-tenant" }
```

Ou durante a criação de TenantAdmin:

```bash
POST /auth/users/tenant-admin
Authorization: Bearer <token_superadmin>
Content-Type: application/json

{
  "email": "admin@empresa.com",
  "name": "Admin do Tenant",
  "tenant_id": "uuid-do-tenant"
}
```
