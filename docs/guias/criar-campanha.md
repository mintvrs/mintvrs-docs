---
id: criar-campanha
title: Criar uma Campanha
sidebar_position: 4
---

# Criar uma Campanha

Campanhas são o coração do MKClub. Cada campanha representa um projeto de crowdfunding com tiers de acesso (chaves/keys) que os apoiadores podem adquirir.

## 1. Criar a campanha

```bash
curl -X POST https://admin-api.homolog.mintvrs.com/campaigns \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Álbum Independente 2025",
    "description": "Apoie meu novo álbum e tenha acesso exclusivo a bastidores e experiências únicas.",
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

:::note Imagens não vão neste corpo
As imagens da campanha (hero, capa do card, imagem da chave e as até 6 fotos da galeria) sobem por
rotas `multipart` próprias, depois de a campanha existir. Veja
**[Imagens da Campanha](./galeria-campanha.md)**.
:::

## 2. Adicionar tiers de acesso (Accesses)

```bash
# Tier Bronze — mais acessível
curl -X POST https://admin-api.homolog.mintvrs.com/accesses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "campaign-uuid",
    "level": "Bronze",
    "price": 5000,
    "quantity": 500
  }'

# Tier Ouro — premium
curl -X POST https://admin-api.homolog.mintvrs.com/accesses \
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

Conteúdo exclusivo é o que fica **atrás da chave** (`is_preview: false`), servido por link assinado.

```bash
curl -X POST https://admin-api.homolog.mintvrs.com/contents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "campaign-uuid",
    "title": "Bastidores da Gravação",
    "type": "Video",
    "url": "https://s3.amazonaws.com/bucket/backstage.mp4",
    "is_preview": false
  }'
```

:::warning O campo é `campaign_id`, com underline
A API roda com `forbidNonWhitelisted`, então mandar `campaignId` (camelCase) derruba a request
inteira com `400 property campaignId should not exist`. Vale para todos os corpos JSON.
:::

:::tip Mídia pública (`is_preview: true`) vai pela rota de galeria
Fotos públicas do ensaio não devem ser criadas por aqui — use
`POST /campaigns/:campaignId/gallery`, que sobe o arquivo, escolhe o bucket certo e controla os 6
slots. Veja **[Imagens da Campanha](./galeria-campanha.md)**.
:::

## 4. Ver campanha pública

```bash
# Endpoint público — retorna campanha com accesses e prévia de conteúdo
curl https://admin-api.homolog.mintvrs.com/campaigns/{campaignId}/public
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
envie a imagem de fundo (`POST /campaigns/:campaignId/button-layout-image`) e salve o layout
(`PUT /campaigns/:campaignId/buttons`). Veja o guia dedicado: [Botões Interativos](./botoes-interativos.md).

## Campos customizados (custom fields)

Campos extras por tenant (ex.: "Estilo de Ensaio", "Fotógrafo") são definidos no config do tenant e preenchidos por campanha. No banco, os valores ficam **keyados pelo `id` da definição** (não pelo label), então **todos os GETs de campanha** retornam também `custom_fields_resolved` (lista já com o label pronto pra exibir).

👉 Guia completo (como o front lê, passo a passo): **[Custom Fields](./custom-fields.md)**.

## Galeria de preview (fotos públicas)

Habilite a galeria no **wizard de configuração do tenant** (`/campaign-config` → "Galeria de Preview" → Habilitado). Com ela ligada, o formulário de **criar campanha** mostra uma seção com **6 slots** de foto, e a campanha ganha uma tela de galeria onde as fotos podem ser trocadas, reordenadas e removidas **a qualquer momento**, inclusive depois de publicada.

- Gerenciar: `POST`/`PATCH`/`DELETE /campaigns/:campaignId/gallery` e `PUT .../gallery/order`.
- Leitura pública: `GET /campaigns/:campaignId/public` → `gallery: [{ mediaType, mediaUrl, ariaLabel }]` (o `ariaLabel` cai no atributo `aria-label`/`alt` da imagem; fallback = `title`). Os mesmos itens vêm em `previews[]` com o campo `aria_label`, e numa rota dedicada sem token: `GET /campaigns/:campaignId/preview-gallery`.

👉 Guia completo: **[Imagens da Campanha](./galeria-campanha.md)**.

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
curl https://admin-api.homolog.mintvrs.com/splits/{campaignId} \
  -H "Authorization: Bearer <token>"
```
