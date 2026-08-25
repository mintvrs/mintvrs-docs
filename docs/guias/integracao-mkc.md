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
- 🎟️ **Esgotado é `saleStatus`, não `status`.** `status` é o estado editorial, gravado pelo admin.
  Quando as chaves acabam com o **prazo ainda correndo**, a campanha continua `Active` e passa a vir
  com **`saleStatus: "sold_out"`** (e `isSoldOut: true`). Os dois são **computados na leitura** a partir
  do estoque das tiers, então mudam no instante em que a última chave vende — nenhuma rota filtra por
  eles: **campanha esgotada continua saindo** em `/campaigns/active`, `/campaigns/landing` e
  `/campaigns/featured`, e é o front que decide se esconde, esmaece ou desabilita o botão.
  Campanha de estoque **ilimitado** (tier sem `quantity`) **nunca** fica esgotada.
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
| modelProfession | `main_star.custom_fields.modelProfession` |
| modelProfilePictureUrl | `main_star.profile_photo` |
| modelPhotoAriaLabel | `main_star.custom_fields.ariaLabel` *(fallback: `main_star.name`)* |
| currentKeys | `currentKeys` *(computado)* |
| totalKeys | `totalKeys` *(computado)* |
| status | `status` *(enum interno)* |
| esgotado | `saleStatus === "sold_out"` (ou `isSoldOut`) *(computado)* |
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
| modelPhotoAriaLabel | `campaign.main_star.custom_fields.ariaLabel` *(fallback: `main_star.name`)* |
| photographerName | `campaign.custom_fields.photographerName` |
| style | `campaign.custom_fields.style` |
| studioName | `campaign.custom_fields.studioName` |
| collectorsCount | `campaign.backers` |
| endDate | `campaign.end_date` |
| currentKeys / totalKeys | `currentKeys` / `totalKeys` *(computados)* |
| esgotado | `saleStatus` / `isSoldOut` *(computados; vêm na RAIZ, não dentro de `campaign`)* |
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

## Ensaios Apoiados (SUPPORTED_ESSAYS) e Minhas Chaves
**`GET /transactions/me/summary`** (Bearer) → `{ totalKeys, totalEssaysSupported, byCampaign[] }`.

**Não existe endpoint separado de "Ensaios Apoiados"** — é este. Cada item de `byCampaign` é um
ensaio apoiado, com os dados da campanha já embutidos (dispensa o fan-out `GET /campaigns/:id`).

| Card do PDF | Ler de |
|---|---|
| nº de ensaios apoiados | `totalEssaysSupported` (raiz) |
| total de chaves do usuário | `totalKeys` (raiz) |
| nome do ensaio | `byCampaign[].campaign.essayTitle` *(fallback: `campaign.name`)* |
| modelo | `byCampaign[].campaign.modelName` |
| capa / arte da chave | `campaign.coverImage` / `campaign.keyImage` |
| **chaves vendidas** | `byCampaign[].campaign.currentKeys` |
| **chaves restantes** | `byCampaign[].campaign.keysRemaining` |
| total de chaves do ensaio | `byCampaign[].campaign.totalKeys` |
| % financiado | `byCampaign[].campaign.fundingPercentage` |
| **tipo de chave comprada** | `byCampaign[].tiers[]` |
| minhas chaves nesse ensaio | `byCampaign[].count` |

:::warning `totalKeys` aparece duas vezes
Na **raiz** é o total de chaves **do usuário**. Dentro de `campaign` é o total de chaves **do ensaio**.
:::

O tipo de chave é uma **lista**, porque o usuário pode ter chaves de tiers diferentes no mesmo ensaio:

```json
{
  "campaignId": "uuid",
  "count": 3,
  "campaign": { "essayTitle": "A Intimidade como Arte", "currentKeys": 630, "totalKeys": 900, "keysRemaining": 270, "fundingPercentage": 70 },
  "tiers": [
    { "accessId": "uuid-vip", "level": "VIP", "typeTitle": "Acesso total", "count": 2 },
    { "accessId": "uuid-ouro", "level": "Ouro", "typeTitle": null, "count": 1 }
  ],
  "keys": [
    { "transactionId": "uuid", "accessId": "uuid-vip", "tierLevel": "VIP", "tierTypeTitle": "Acesso total", "purchasedAt": "2026-08-01T12:00:00.000Z" }
  ]
}
```

A soma dos `tiers[].count` é sempre igual a `count`. Chaves antigas sem tier resolvido caem num grupo
com `accessId: null` — não somem da conta.

> `keysRemaining` é `totalKeys − currentKeys` e **não desconta** chaves seguradas por checkouts em
> aberto. É o número de vitrine: o checkout pode recusar uma compra que o card ainda mostrava.

## Dashboard do usuário — os 4 cards de topo

| Card do print | Ler de |
|---|---|
| **Chaves Adquiridas** | `GET /transactions/me/summary` → `totalKeys` |
| **Ensaios Apoiados** | `GET /transactions/me/summary` → `totalEssaysSupported` |
| **Posição no Ranking** | `GET /ranking/users` → `me.position` |
| **Crédito** | `GET /credits/balance` → `balance` ÷ 100 |

## Ranking dos Usuários (USER_RANKING)
**`GET /ranking/users?page=&limit=`** (Bearer) — **uma chamada alimenta a aba inteira e o card**.

`limit` é **opcional**: omitido, a lista vem com **5 itens**. Para listar mais, mande o valor que a
tela quiser — `?limit=10` (aceita de 1 a 100) — sem precisar de mudança no backend.

```json
{
  "me":     { "position": 160, "keysCount": 72, "page": 32, "totalParticipants": 412 },
  "podium": [
    { "position": 1, "displayName": "M****", "keysCount": 238, "isMe": false },
    { "position": 2, "displayName": "B****", "keysCount": 238, "isMe": false },
    { "position": 3, "displayName": "C****", "keysCount": 201, "isMe": false }
  ],
  "items":  [
    { "position": 158, "displayName": "J****", "keysCount": 75, "isMe": false },
    { "position": 160, "displayName": "P****", "keysCount": 72, "isMe": true  }
  ],
  "page": 32, "limit": 5, "totalItems": 412, "totalPages": 83
}
```

| Elemento da tela | Ler de |
|---|---|
| card "Posição no Ranking" | `me.position` |
| cards 1ª/2ª/3ª posição (pódio) | `podium[]` — vem em **todas** as páginas, não só na primeira |
| linhas `#158 · Nome · 75 Chaves` | `items[]` → `position`, `displayName`, `keysCount` |
| destaque da linha do próprio usuário | `items[].isMe` |
| paginação (01, 02, 03…) | `page`, `totalPages` |
| abrir a lista já na posição do usuário | `me.page` |

**`me.position` é exata e não depende da paginação.** Se o usuário é o 160º e você pedir `page=1`,
`me.position` continua 160 — é por isso que o card funciona sem carregar a lista toda. Para abrir a
aba já na altura dele, chame com o `limit` que você vai usar e navegue para `me.page`.

### Nomes são mascarados
`displayName` traz **só o primeiro nome, com a primeira letra visível e o resto em asterisco**
(`Pedro Pelicioni` → `P****`). Sobrenome, e-mail e id de terceiros nunca saem da API. Sem nome
utilizável, vem `***` — o campo **nunca é nulo**, não precisa de tratamento de ausência.

### Regras do ranking

- **Critério: chaves possuídas.** É o mesmo número de `totalKeys` em `/transactions/me/summary` — se
  divergir, é bug.
- **Escopado ao tenant** do usuário logado, sem parâmetro.
- **Empate não compartilha posição**: dois usuários com 238 chaves ficam em 1º e 2º. O desempate é
  quem comprou primeiro, e é estável entre chamadas.
- **Estorno sai da conta**; **revenda P2P transfere a posição** para o novo dono (o ranking mede posse
  atual, coerente com o rótulo "Chaves Adquiridas").
- Quem ainda **não tem chave** não participa: `me.position` e `me.page` vêm `null` — mostre `—`.

| Parâmetro | Valores |
|---|---|
| `page` | ≥ 1 (default **1**) |
| `limit` | 1–100 (default **10**) |

**Omita** os parâmetros para usar o default — mandar `?page=` vazio vira NaN e resulta em 400. Só os
parâmetros da tabela são aceitos; qualquer outro responde 400.

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
| `/notifications` | desabilitado (até configurar Twilio) |
| `/legal/terms-of-use`, `/legal/privacy-policy` | não nesta fase |
| `/wallet/withdrawal`, `/wallet/deposit` (saque/depósito) | não definido |
| `/checkout/pix` | em standby |
| `/campaign/:id/essay` (interactiveTags) | não priorizado |
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

- **SUPPORTED_ESSAYS** → `GET /transactions/me/summary` (ver abaixo)

- **USER_RANKING** → `GET /ranking/users` (ver abaixo)

**Todos os pedaços do dashboard já têm endpoint.** Não sobrou nada em definição.

Cuidado para não confundir dois rankings diferentes: o `USER_RANKING` abaixo posiciona **usuários**;
o [ranking de sugestão de modelos](./ranking-sugestao-modelos.md) posiciona **perfis do Instagram**.

