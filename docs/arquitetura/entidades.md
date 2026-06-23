---
id: entidades
title: Entidades e Relacionamentos
sidebar_position: 2
---

# Entidades e Relacionamentos

## Modelo de dados simplificado

```mermaid
erDiagram
    TENANT {
        uuid id
        string name
        string slug
        string apiKey
        string secretKey
        string cw20ContractAddress
        string nftContractAddress
        bool active
        uuid ownerId
        json campaignConfig
    }

    USER {
        uuid id
        string name
        string email
        string access_role
        uuid tenant_id
    }

    CAMPAIGN {
        uuid id
        string name
        string status
        decimal goal_value
        decimal raised
        int backers
        decimal platform_fee
        uuid tenantId
        uuid main_star_id
    }

    CAMPAIGN_STAR {
        uuid id
        uuid campaignId
        string star_name
        decimal percentage
        string pix_key
        string user_email
    }

    ACCESS {
        uuid id
        string level
        decimal price
        int quantity
        uuid campaign_id
        uuid type_id
    }

    TOKEN {
        uuid id
        string code
        string type
        bool active
        uuid campaign_id
        uuid user_id
        uuid tenantId
    }

    TRANSACTION {
        uuid id
        string orderId
        string status
        decimal fiatAmount
        int tokens
        string transactionHash
        uuid campaignId
        uuid tenantId
        uuid userId
    }

    CREDIT_BALANCE {
        uuid id
        uuid tenantId
        uuid userId
        decimal balance
        decimal lockedBalance
        string currency
    }

    CREDIT_TRANSACTION {
        uuid id
        string type
        decimal amount
        string status
        uuid tenantId
        uuid userId
    }

    MARKETPLACE_LISTING {
        uuid id
        decimal price
        string status
        uuid transactionId
        uuid sellerId
        uuid buyerId
        uuid campaignId
        uuid tenantId
    }

    TENANT_GATEWAY {
        uuid id
        string provider
        string publishableKey
        string apiKeyEncrypted
        bool active
        uuid tenantId
    }

    CONTENT {
        uuid id
        string title
        string type
        string url
        bool is_preview
        uuid campaign_id
    }

    MAIN_STAR {
        uuid id
        string name
        string profile_photo
    }

    TENANT ||--o{ CAMPAIGN : "possui"
    TENANT ||--o{ TOKEN : "escopado"
    TENANT ||--o{ TRANSACTION : "escopado"
    TENANT ||--o{ CREDIT_BALANCE : "escopado"
    TENANT ||--o{ MARKETPLACE_LISTING : "escopado"
    TENANT ||--o{ TENANT_GATEWAY : "configura"
    CAMPAIGN ||--o{ ACCESS : "tem"
    CAMPAIGN ||--o{ TOKEN : "distribui"
    CAMPAIGN ||--o{ CONTENT : "tem"
    CAMPAIGN ||--o{ CAMPAIGN_STAR : "tem"
    CAMPAIGN }o--|| MAIN_STAR : "referencia"
    TOKEN ||--o| TRANSACTION : "origina"
    TOKEN ||--o| MARKETPLACE_LISTING : "listado em"
    USER ||--o{ TOKEN : "possui"
    USER ||--o{ CREDIT_BALANCE : "tem"
    USER ||--o{ CREDIT_TRANSACTION : "gera"
```

## Descrição das entidades

### Tenant

Representa um cliente B2B da plataforma. Cada tenant tem:
- Chaves de API (`apiKey` + `secretKey`) para integrações externas
- Contratos CW20 e NFT na blockchain Xion (opcionais)
- Configuração de campanhas (`campaignConfig` JSON)
- Um `ownerId` (usuário Admin ou SuperAdmin responsável)

### User

Usuário autenticado. O mesmo usuário pode ter diferentes `access_role`s e `tenant_id`s dependendo do contexto.

| Role | tenant_id | Acesso |
|------|-----------|--------|
| SuperAdmin | null | Total — todos os tenants |
| Admin | null | Todos os tenants que ele criou |
| TenantAdmin | uuid | Apenas o próprio tenant |
| User | uuid | Apenas endpoints de usuário final |
| Star | uuid | Acesso a splits e campanhas associadas |

### Campaign

Campanha de crowdfunding criativa. Cada campanha:
- Pertence a um **Tenant**
- Tem um **MainStar** (artista principal)
- Pode ter múltiplas **CampaignStars** (artistas colaboradores com percentual de split)
- Define **Accesses** (tiers de acesso com preço e quantidade)
- Associa **Contents** (conteúdo exclusivo para apoiadores)

### Token

Representa uma "chave" (key) adquirida por um usuário. Após a compra:
- Fica vinculado ao `userId`
- Pode ser listado no **Marketplace** para venda
- Registrado on-chain na blockchain Xion

### Transaction

Registro de uma compra. Criada quando:
- Usuário compra via Stripe (checkout de créditos ou compra direta)
- Admin registra compra Web2 manualmente
- Compra P2P no marketplace é concluída

### Credit Balance / Credit Transaction

Sistema de créditos interno:
- `CreditBalance`: saldo atual por tenant+usuario
- `CreditTransaction`: histórico de movimentações (add, subtract, refund, lock, unlock)

### Marketplace Listing

Quando um usuário lista uma chave para venda P2P:
- Cria um `MarketplaceListing` vinculado à `Transaction` original
- Status: `active` → `sold` ou `cancelled`

### TenantGateway

Configuração do gateway de pagamento por tenant:
- Provider: `stripe`
- API key criptografada
- Cada tenant pode ter múltiplos gateways (mas apenas um ativo por provider)
