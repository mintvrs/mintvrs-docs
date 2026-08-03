---
id: galeria-campanha
title: Imagens da Campanha
sidebar_position: 6
---

# Imagens da Campanha

Toda a mídia pública de uma campanha sobe **pela própria API**, em `multipart/form-data`. O cliente
manda o arquivo; o backend valida, envia para o bucket público e grava a URL. Não é preciso ter
credencial AWS no front.

:::info Não existe trava por status
Trocar imagem funciona em **qualquer status** da campanha — rascunho, ativa ou encerrada. A única
exigência é ser o **dono da campanha** (ou Admin/TenantAdmin/SuperAdmin).
:::

## As imagens de uma campanha

| Imagem | Onde aparece | Campo |
|---|---|---|
| **Hero** | Arte widescreen do carrossel do topo da landing | `hero_image` (+ `hero_image_alt`) |
| **Capa do card** | Capa isolada, estilo capa de revista, nos cards | `cover_image` |
| **Imagem da chave** | Arte da chave nos cards do marketplace de revenda | `key_image` |
| **Galeria (até 6 fotos)** | Página pública da campanha (`gallery[]`) | `Content` com `is_preview: true` |
| **Fundo dos botões** | Editor de botões interativos | `button_layout_image` — ver [Botões Interativos](./botoes-interativos.md) |

## 1. Hero, capa do card e imagem da chave

Uma rota só, com o slot em `kind`:

```bash
curl -X POST https://admin-api.homolog.mintvrs.com/campaigns/<campaignId>/image \
  -H "Authorization: Bearer <token>" \
  -F "file=@capa.webp" \
  -F "kind=cover"
```

- `kind`: `hero`, `cover` ou `key`.
- `alt` (opcional, só com `kind=hero`): grava `hero_image_alt`, que vira o `ariaLabel` das respostas.
- Formatos: jpg, jpeg, png, gif, webp, avif, svg, bmp, heic, heif. Máx **15MB**.
- A imagem anterior daquele slot é **apagada do bucket**.
- Resposta: a campanha atualizada, com as URLs já servíveis.

:::note Caminho alternativo
Continua sendo possível subir a imagem por conta própria e mandar só a URL em
`hero_image`/`cover_image`/`key_image` no `POST`/`PATCH /campaigns`. Útil para mídia hospedada fora.
Se você mandar de volta a URL **servível** que leu num GET, o backend a normaliza sozinho antes de
gravar — não é preciso desfazer nada no cliente.
:::

## 2. Galeria pública (até 6 fotos)

### Ler

```bash
# público, sem token
curl https://admin-api.homolog.mintvrs.com/campaigns/<campaignId>/preview-gallery

# autenticado, para a tela de gestão (mesma lista)
curl https://admin-api.homolog.mintvrs.com/campaigns/<campaignId>/gallery \
  -H "Authorization: Bearer <token>"
```

Os itens vêm ordenados por `position` (o slot, começando em 0), com `url` servível e `aria_label`.
Os mesmos itens aparecem em `gallery[]` e `previews[]` no `GET /campaigns/:campaignId/public`.

### Adicionar

```bash
curl -X POST https://admin-api.homolog.mintvrs.com/campaigns/<campaignId>/gallery \
  -H "Authorization: Bearer <token>" \
  -F "file=@foto-1.jpg" \
  -F "aria_label=Modelo na beira da piscina ao pôr do sol"
```

- A foto entra no **primeiro slot livre**.
- Máximo de **6** itens: o sétimo recebe `400`.
- Aceita imagem (máx 15MB) ou vídeo curto — mp4, mov, webm, m4v (máx 100MB).

### Trocar uma foto (sem perder o slot)

```bash
curl -X PATCH https://admin-api.homolog.mintvrs.com/campaigns/<campaignId>/gallery/<contentId> \
  -H "Authorization: Bearer <token>" \
  -F "file=@foto-1-nova.jpg"
```

:::tip Use PATCH em vez de remover e subir de novo
O `PATCH` substitui a mídia **preservando a posição** e apaga a antiga do bucket. Remover e subir de
novo colocaria a foto no fim da galeria e reembaralharia a página pública.
:::

Omitindo `file`, o `PATCH` edita só os metadados:

```bash
curl -X PATCH https://admin-api.homolog.mintvrs.com/campaigns/<campaignId>/gallery/<contentId> \
  -H "Authorization: Bearer <token>" \
  -F "aria_label=Nova descrição para leitores de tela"
```

### Reordenar

```bash
curl -X PUT https://admin-api.homolog.mintvrs.com/campaigns/<campaignId>/gallery/order \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "contentIds": ["<id-slot-0>", "<id-slot-1>", "<id-slot-2>"] }'
```

A lista precisa conter **exatamente** os ids da galeria daquela campanha, sem repetição — as
posições viram `0..n-1` na ordem enviada. Meia reordenação deixaria slots ambíguos, então é
rejeitada com `400`.

### Remover

```bash
curl -X DELETE https://admin-api.homolog.mintvrs.com/campaigns/<campaignId>/gallery/<contentId> \
  -H "Authorization: Bearer <token>"
```

Apaga o registro e o objeto no S3, e compacta as posições restantes.

## Acessibilidade

Cada item da galeria tem `aria_label` — o texto que leitores de tela anunciam. Na resposta pública
ele sai como `ariaLabel` (com fallback para `title`) e deve ir para o atributo `aria-label`/`alt` da
imagem. O `hero_image_alt` cumpre o mesmo papel para a arte hero.

## Erros comuns

| Situação | Resposta |
|---|---|
| Extensão ou mimetype fora da lista | `400` com a lista de formatos aceitos |
| Arquivo acima do limite | `400` com o limite em MB |
| Sétima foto na galeria | `400` "A galeria já tem 6 itens…" |
| Não é dono nem admin da campanha | `403` |
| `campaignId`/`contentId` que não é UUID | `400` "Identificador inválido (UUID esperado)." |
| Campo desconhecido no corpo de um PATCH JSON | `400` `property X should not exist` — a API roda com `forbidNonWhitelisted` |
