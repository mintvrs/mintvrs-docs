---
id: criar-campanha
title: Criar uma Campanha
sidebar_position: 4
---

# Criar uma Campanha

Campanhas são o coração do MKClub. Cada campanha representa um projeto de crowdfunding com tiers de acesso (chaves/keys) que os apoiadores podem adquirir.

## 1. Criar a campanha

```bash
curl -X POST https://api.mk.nearx.com.br/campaigns \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Álbum Independente 2025",
    "description": "Apoie meu novo álbum e tenha acesso exclusivo a bastidores e experiências únicas.",
    "cover_image": "https://s3.amazonaws.com/bucket/campanha-capa.jpg",
    "start_date": "2025-02-01T00:00:00Z",
    "end_date": "2025-06-30T23:59:59Z",
    "goal_value": 50000,
    "status": "Active",
    "platform_fee": 10,
    "tenantId": "tenant-uuid",
    "main_star_id": "star-uuid",
    "stars": [
      {
        "star_name": "Nome do Artista",
        "percentage": 80,
        "pix_key": "artista@email.com"
      }
    ]
  }'
```

**Resposta:**
```json
{
  "id": "campaign-uuid",
  "name": "Álbum Independente 2025",
  "status": "Active",
  "goal_value": 50000,
  "raised": 0,
  "backers": 0,
  "platform_fee": 10,
  "created_at": "2025-01-15T10:00:00Z"
}
```

## 2. Adicionar tiers de acesso (Accesses)

```bash
# Tier Bronze — mais acessível
curl -X POST https://api.mk.nearx.com.br/accesses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "campaign-uuid",
    "level": "Bronze",
    "price": 5000,
    "quantity": 500
  }'

# Tier Ouro — premium
curl -X POST https://api.mk.nearx.com.br/accesses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "campaign-uuid",
    "level": "Ouro",
    "price": 30000,
    "quantity": 50
  }'
```

:::note
`price` é em centavos. R$ 50,00 = `5000`.
:::

## 3. Adicionar conteúdo exclusivo

```bash
# Conteúdo de prévia (visível para todos)
curl -X POST https://api.mk.nearx.com.br/contents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "campaign-uuid",
    "title": "Prévia do Álbum",
    "type": "Video",
    "url": "https://youtube.com/watch?v=xxxx",
    "is_preview": true
  }'

# Conteúdo exclusivo (visível apenas para apoiadores)
curl -X POST https://api.mk.nearx.com.br/contents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "campaign-uuid",
    "title": "Bastidores da Gravação",
    "type": "Video",
    "url": "https://s3.amazonaws.com/bucket/backstage.mp4",
    "is_preview": false
  }'
```

## 4. Ver campanha pública

```bash
# Endpoint público — retorna campanha com accesses e prévia de conteúdo
curl https://api.mk.nearx.com.br/campaigns/{campaignId}/public
```

## 5. Status de campanha

| Status | Descrição |
|--------|-----------|
| `Active` | Visível no marketplace, aceitando compras |
| `Inactive` | Não aparece no marketplace |
| `Scheduled` | Agendada para futura ativação |
| `Ended` | Encerrada |

## Botões interativos (opcional)

A campanha pode ter **botões clicáveis posicionados sobre uma imagem de fundo**, com coordenadas em
percentual (responsivo). É opcional: ative com `interactive_buttons_enabled: true` (no `POST`/`PATCH`),
envie a imagem de fundo (`POST /campaigns/:id/button-layout-image`) e salve o layout
(`PUT /campaigns/:id/buttons`). Veja o guia dedicado: [Botões Interativos](./botoes-interativos.md).

## Splits de receita

Quando há `stars` na campanha, a receita é distribuída automaticamente:

```
Receita bruta: R$ 100,00
- Platform fee (10%): R$ 10,00
= Receita líquida: R$ 90,00

Artista Principal (80%): R$ 72,00
Plataforma (20%): R$ 18,00
```

Ver relatório de splits:

```bash
curl https://api.mk.nearx.com.br/splits/{campaignId} \
  -H "Authorization: Bearer <token>"
```
