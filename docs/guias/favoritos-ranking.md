---
id: favoritos-ranking
title: Favoritos & Ranking
sidebar_position: 8
---

# Favoritos & Ranking de Campanhas

Usuários podem **favoritar/curtir** campanhas (um "joinha"). Cada curtida conta para o **ranking** da campanha, exposto como `rankingPosition` no endpoint público de campanhas ativas.

## Modelo

- 1 curtida por usuário por campanha (toggle): curtir novamente **remove** a curtida.
- O ranking é **global** entre campanhas ativas, ordenado por número de curtidas (1 = mais curtida).

## Favoritar / desfavoritar (toggle)

```bash
# :campaignId = ID da campanha
curl -X POST https://admin-api.homolog.mintvrs.com/votes/{campaignId} \
  -H "Authorization: Bearer <token>"
```

```json
{ "campaignId": "campaign-uuid", "hasVoted": true, "votesCount": 43 }
```

Chamar novamente desfaz a curtida (`hasVoted: false`).

## Contagem e estado da minha curtida

```bash
curl https://admin-api.homolog.mintvrs.com/votes/{campaignId} \
  -H "Authorization: Bearer <token>"
```

```json
{ "campaignId": "campaign-uuid", "votesCount": 43, "hasVoted": true }
```

## Minhas campanhas favoritadas

```bash
curl https://admin-api.homolog.mintvrs.com/votes/me \
  -H "Authorization: Bearer <token>"
```

```json
[ { "campaignId": "campaign-uuid", "createdAt": "2026-06-24T12:00:00.000Z" } ]
```

## Ranking nas campanhas ativas

`GET /campaigns/active` (público) já traz `votesCount` e `rankingPosition` por campanha:

```json
{ "id": "campaign-uuid", "name": "Ensaio X", "votesCount": 43, "rankingPosition": 1 }
```

:::note
`hasVoted` depende do usuário logado e **não** vem no endpoint público `/campaigns/active`. Para saber o que o usuário curtiu, use `GET /votes/me` (ou `GET /votes/:campaignId`) e cruze no front.
:::

# Documentos legais

Termos de uso e política de privacidade são públicos (sem autenticação):

```bash
curl https://admin-api.homolog.mintvrs.com/legal/terms-of-use
curl https://admin-api.homolog.mintvrs.com/legal/privacy-policy
```

```json
{ "slug": "terms-of-use", "title": "Termos de Uso", "version": "1.0.0", "updatedAt": "2026-06-24T00:00:00.000Z", "content": "..." }
```

# Histórico de créditos com filtros

`GET /credits/transactions/me` aceita filtros e ordenação:

| Parâmetro | Valores |
|-----------|---------|
| `type` | `add`, `subtract`, `refund`, `lock`, `unlock`, `consume`, `compensation` |
| `status` | `pending`, `approved`, `failed`, `refunded` |
| `sortBy` | `date_desc` (default), `date_asc`, `amount_desc`, `amount_asc` |

```bash
curl "https://admin-api.homolog.mintvrs.com/credits/transactions/me?type=lock&sortBy=amount_desc" \
  -H "Authorization: Bearer <token>"
```

# Minhas chaves (resumo)

`GET /transactions/me/summary` retorna o total de chaves que o usuário possui e a quebra por campanha:

```json
{ "totalKeys": 5, "byCampaign": [ { "campaignId": "uuid", "campaignName": "Ensaio X", "count": 3 } ] }
```
