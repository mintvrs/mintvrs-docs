---
id: galeria-previews-api
title: Imagem de Preview (somente via API)
sidebar_position: 6
---

# Imagem de Preview (somente via API)

Uma imagem de **preview** por campanha, **separada do `cover_image`** (que é o hero/capa). Ela é
**inputada na criação/edição da campanha** — como o `cover_image`, o front sobe pro S3 e manda a **URL**
no corpo — mas fica disponível **apenas via API**, numa rota dedicada. **Não** aparece na página pública
`GET /campaigns/:campaignId/public`.

:::note Por que separada do cover
Hoje o "hero/preview" exibido é o próprio `cover_image`. Esta imagem de preview é um **campo à parte**
(`preview_image`), pra o front usar em outra página/contexto sem reaproveitar a capa.
:::

:::info Fluxo de imagem (igual ao cover)
O front sobe a imagem pro **S3** (rota própria do admin-web) e manda a **URL** em `preview_image` no
`POST`/`PATCH /campaigns`. O backend persiste como conteúdo `is_api_gallery` e devolve a URL servível
(`https://s3.<region>.amazonaws.com/<bucket>/<key>`) na leitura.
:::

## 1. Definir na criação da campanha

```bash
curl -X POST https://admin-api.homolog.mintvrs.com/campaigns \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Album 1",
    "cover_image": "https://s3.<region>.amazonaws.com/<bucket>/campaigns/.../cover-1.webp",
    "preview_image": "https://s3.<region>.amazonaws.com/<bucket>/campaigns/.../preview-1.webp"
  }'
```

`cover_image` e `preview_image` são **campos distintos**. Ambos são URLs que o front sobe pro S3 antes.

## 2. Alterar / remover na edição

```bash
# trocar a imagem de preview
curl -X PATCH https://admin-api.homolog.mintvrs.com/campaigns/<campaignId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "preview_image": "https://s3.<region>.amazonaws.com/<bucket>/campaigns/.../preview-2.webp" }'

# remover a imagem de preview (string vazia)
curl -X PATCH https://admin-api.homolog.mintvrs.com/campaigns/<campaignId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "preview_image": "" }'
```

- `preview_image` **omitido** no PATCH → não mexe na preview atual.
- `preview_image: ""` → **remove** a preview.
- Requer ser **dono** da campanha (ou Admin/TenantAdmin/SuperAdmin).

## 3. Ler (público, somente via esta rota)

```bash
curl https://admin-api.homolog.mintvrs.com/campaigns/<campaignId>/preview-gallery
```

Retorna a imagem de preview da campanha (conteúdo com `is_api_gallery: true`, `active: true`), com `url`
já servível, `type` (`Image`/`Video`), `title`, `created_at`. **Não** vem no `GET /campaigns/:id/public`.
