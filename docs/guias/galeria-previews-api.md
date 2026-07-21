---
id: galeria-previews-api
title: Galeria de Previews (somente via API)
sidebar_position: 6
---

# Galeria de Previews (somente via API)

Uma coleção de mídias de **preview** por campanha (imagens/vídeos) que **não é definida na criação da
campanha** e **não aparece** na página pública `GET /campaigns/:campaignId/public`. Ela fica disponível
**apenas via API**, numa rota dedicada — o frontend busca à parte e decide como usar (ex.: uma página
ou carrossel próprio).

:::note Diferença para os previews da página pública
Os previews que aparecem em `GET /campaigns/:campaignId/public` (campo `previews`/`gallery`) são
conteúdos com `is_preview: true`. A galeria desta página é um conjunto **separado**, marcado
`is_api_gallery: true`, que **nunca** entra no `/public`.
:::

:::info Fluxo de imagem
O upload é feito pelo **backend** para o **bucket S3 público**; a URL retornada é servível
(`https://s3.<region>.amazonaws.com/<bucket>/<key>`). Não suba direto do browser para o S3.
:::

## 1. Listar a galeria (público)

```bash
curl https://admin-api.homolog.mintvrs.com/campaigns/<campaignId>/preview-gallery
```

Retorna um array de conteúdos (`Content`) com `url` já servível, `type` (`Image`/`Video`),
`aria_label`, `title`, `created_at`. Somente itens `active: true`.

## 2. Adicionar uma mídia (multipart, dono/admin)

```bash
curl -X POST https://admin-api.homolog.mintvrs.com/campaigns/<campaignId>/preview-gallery \
  -H "Authorization: Bearer <token>" \
  -F "file=@/caminho/local/preview.jpg" \
  -F "title=Bastidores" \
  -F "ariaLabel=Foto dos bastidores do ensaio"
```

- Formatos aceitos — **imagem**: jpg, jpeg, png, gif, webp, avif, svg; **vídeo**: mp4, mov, webm, m4v,
  avi, mkv. Formato fora da lista retorna **400**.
- `title` e `ariaLabel` são opcionais.
- Requer ser **dono** da campanha (ou Admin/TenantAdmin/SuperAdmin).

**Resposta:** o `Content` criado, com `url` servível e `is_api_gallery: true`.

## 3. Remover um item (dono/admin)

```bash
curl -X DELETE https://admin-api.homolog.mintvrs.com/campaigns/<campaignId>/preview-gallery/<contentId> \
  -H "Authorization: Bearer <token>"
```

Remoção é **soft delete** (`active: false`) — o item deixa de aparecer na listagem. Retorna
`{ "success": true }`.
