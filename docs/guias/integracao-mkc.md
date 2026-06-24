---
id: integracao-mkc
title: Integração do App Consumidor (de-para PDF → API)
sidebar_position: 7
---

# Integração do App Consumidor — de-para PDF → API

A API é **genérica e multi-tenant**: ela devolve as **entidades como são** + alguns **agregados computados**. Cabe ao **front mapear** os nomes do PDF (MKC) para os campos reais da resposta. Esta página é o de-para por tela.

## Convenções gerais

- 💰 **Valores monetários vêm em centavos (int)** → divida por 100 para obter reais.
- 🏷️ **`status`** vem no enum interno (`Active | Inactive | Ended | Scheduled`) — o front decide os rótulos.
- 🧩 **Campos flexíveis** (fotógrafo, estilo, estúdio, profissão…) vêm em **`custom_fields`** (JSON), tanto na campanha quanto na modelo. Cada tenant define as chaves.
- 🔐 Endpoints autenticados usam `Authorization: Bearer <accessToken>` (token do Auth Service).
- ⚠️ Os endpoints **públicos** (`/campaigns/active`, `/campaigns/:campaignId/public`) passarão a **exigir** o header `X-Tenant-Slug: <slug-do-tenant>` e filtrar por tenant. Hoje ainda são globais — **já envie o header** para se preparar (ver **Roadmap** no fim da página).

---

## Sessão / Header
Nome e avatar do usuário → **`GET /auth/profile`** (Auth Service, Bearer): campos `name`, `email`, `access_role`, `tenant_id`.

## Campanhas ativas (carrossel / cards)
**`GET /campaigns/active`** → array de Campaign + agregados.

| PDF (MKC) | Ler de |
|---|---|
| campaignId | `id` |
| coverImageUrl | `cover_image` |
| essayTitle | `name` |
| modelName | `main_star.name` |
| modelProfession | `main_star.custom_fields.profession` |
| modelProfilePictureUrl | `main_star.profile_photo` |
| currentKeys | `currentKeys` *(computado)* |
| totalKeys | `totalKeys` *(computado)* |
| status | `status` *(enum interno)* |
| endDate | `end_date` |
| ariaLabel | usar `name` como fallback |

## Detalhe da campanha (perfil)
**`GET /campaigns/:campaignId/public`** → `{ campaign, previews, currentKeys, totalKeys, totalMediaCount, gallery }`.

| PDF (MKC) | Ler de |
|---|---|
| coverImageUrl | `campaign.cover_image` |
| modelName | `campaign.main_star.name` |
| essayTitle | `campaign.name` |
| modelProfilePictureUrl | `campaign.main_star.profile_photo` |
| photographerName | `campaign.custom_fields.photographerName` |
| style | `campaign.custom_fields.style` |
| studioName | `campaign.custom_fields.studioName` |
| collectorsCount | `campaign.backers` |
| endDate | `campaign.end_date` |
| currentKeys / totalKeys | `currentKeys` / `totalKeys` *(computados)* |
| totalMediaCount | `totalMediaCount` *(computado)* |
| gallery | `gallery` → `[{ mediaType, mediaUrl }]` |

## Minhas chaves (myKeys)
**`GET /tokens/mine`** (Bearer) → array de Token com `campaign` e `campaign.main_star`.

| PDF (MKC) | Ler de |
|---|---|
| campaignId | `campaign.id` |
| status | `campaign.status` |
| coverImageUrl | `campaign.cover_image` |
| essayTitle | `campaign.name` |
| modelName | `campaign.main_star.name` |

## Carteira — saldo
**`GET /credits/balance`** (Bearer; usuário precisa de tenant vinculado).

| PDF (MKC) | Ler de |
|---|---|
| availableBalance | `balance` ÷ 100 |
| lastUpdatedTimestamp | `updatedAt` |

## Carteira — extrato
**`GET /credits/transactions/me`** (Bearer) → array de CreditTransaction (`type`, `amount` em centavos, `status`, `createdAt`, `campaignId`).
> Filtro por período/tipo e paginação são **client-side** por enquanto (o endpoint devolve tudo).

## Marketplace
**`GET /marketplace/listings`** → anúncios ativos (`price` em centavos, `campaignId`, `sellerId`, `status`). Para comprar: **`POST /marketplace/buy/:id`**.
> Modelo simples (postou venda → outro compra), **sem leilão/propostas**. A listing traz `campaignId`; para capa/modelo, cruze com `GET /campaigns/:campaignId/public`.

## Checkout (compra de chave)
**`POST /gateways/checkout/key-purchase`** → gera a URL do **Stripe Checkout**; o front **redireciona** o usuário. Confirmação é assíncrona (webhook). Não há charge direto com `cardToken`/`installments`.

---

## Não disponíveis nesta fase

| Tela / endpoint do PDF | Situação |
|---|---|
| `/votes` (ranking de sugestão) | adiado |
| `/notifications` | desabilitado (até configurar Twilio) |
| `/legal/terms-of-use`, `/legal/privacy-policy` | não nesta fase |
| `/wallet/withdrawal`, `/wallet/deposit` (saque/depósito) | não definido |
| `/checkout/pix` | em standby |
| `/campaign/:id/essay` (interactiveTags) | não priorizado |
| `/dashboard` do usuário | em definição (depende da regra de ranking) |
| `/articles`, `/article/:id` (blog) | fora do escopo (não é nossa API) |
| `/heroCarousel`, `/finishedEssays`, `/campaigns` (público filtrado) | derivar de `/campaigns/active` por enquanto |

---

## Roadmap (mudanças previstas — prepare-se)

Itens **definidos** mas ainda não no ar. Documentados aqui para o front já se ajustar.

### 1. Tenant-scoping dos endpoints públicos
Os endpoints públicos passarão a **exigir** o header **`X-Tenant-Slug: <slug-do-tenant>`** e a **filtrar os dados pelo tenant** correspondente. Hoje retornam dados de **todos** os tenants (global).

**Ação do front:** já enviar `X-Tenant-Slug` com o slug do tenant nas chamadas públicas (`/campaigns/active`, `/campaigns/:campaignId/public`). Enquanto o backend não escopa, o header é **ignorado** (sem quebra); quando passar a escopar, **nada muda** no código do front.

### 2. Dashboard do usuário
Agregador pessoal do usuário logado (cards de resumo + abas `MY_KEYS`, `SUPPORTED_ESSAYS`, `USER_RANKING`, `MY_LISTINGS`). A maior parte dos dados o front **já consegue compor** dos endpoints atuais:
- MY_KEYS → `GET /tokens/mine`
- saldo (userCredit) → `GET /credits/balance`
- MY_LISTINGS → `GET /marketplace/my-listings`

O pedaço que **falta no backend** é o **ranking global de usuários** (`USER_RANKING` / `rankingPosition`) — critério e escopo ainda em definição.

