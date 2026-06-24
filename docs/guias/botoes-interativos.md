---
id: botoes-interativos
title: Botões Interativos (sobre imagem)
sidebar_position: 6
---

# Botões Interativos

Permite que o dono da campanha posicione **botões clicáveis sobre uma imagem de fundo**. As coordenadas
são salvas em **percentual (0–100)**, não em pixels — assim o layout permanece correto em qualquer
resolução/tamanho de tela (responsivo).

A feature é **opcional por campanha**: o dono ativa a flag `interactive_buttons_enabled` e, no painel
admin, usa um editor de **arrastar e soltar** para posicionar os botões. Quem só consome a campanha lê
o layout pronto via `GET /campaigns/:campaignId/buttons` (ou no `GET /campaigns/:campaignId/public`).

:::note Habilitação por tenant
No painel admin, a seção de botões só aparece na campanha se o **TenantAdmin** tiver habilitado
"Botões Interativos" na **Configuração de Campanha** do tenant (`campaignConfig.interactiveButtons.enabled`).
A API em si não impõe esse gate — é uma decisão de UI do painel.
:::

:::info Fluxo de imagem
A imagem de fundo é enviada pelo **backend** (`POST /campaigns/:campaignId/button-layout-image`) para um
**bucket S3 público**. A URL retornada é **permanente e pública** (sem assinatura/expiração) — o
frontend só guarda essa URL. O upload é multipart; **não** suba direto do browser para o S3.
:::

## Modelo do botão (`ButtonDto`)

```jsonc
{
  "id": "mic",   // string OBRIGATÓRIA (≤ 60) — nome do ícone (o front mapeia para um SVG)
  "x": 42.5,     // number 0–100 (% horizontal)
  "y": 73.1,     // number 0–100 (% vertical)
  "enabled": true, // opcional, default true
  "width": 12,   // opcional, % (0–100)
  "height": 8,   // opcional, % (0–100)
  "order": 0     // opcional
}
```

- O botão é renderizado como um **círculo**; não há rótulo de texto.
- `id` é o **nome do ícone**, digitado livremente pelo dono da campanha (ex.: `mic`, `star`, `heart`). É o identificador do botão; o **frontend consumidor escolhe o SVG** correspondente a esse nome.
- `x`/`y` representam o **centro** do botão em percentual relativo à imagem renderizada.

:::warning Validação estrita
O backend usa `forbidNonWhitelisted`: enviar **qualquer campo fora** deste contrato faz a requisição
inteira falhar com **400**. `x`, `y`, `width`, `height` precisam estar entre **0 e 100**.
:::

## 1. Ativar a feature na campanha

A flag liga/desliga via `PATCH /campaigns/:campaignId` (ou já no `POST /campaigns`):

```bash
curl -X PATCH https://admin-api.homolog.mintvrs.com/campaigns/<campaignId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "interactive_buttons_enabled": true }'
```

## 2. Enviar a imagem de fundo (multipart)

```bash
curl -X POST https://admin-api.homolog.mintvrs.com/campaigns/<campaignId>/button-layout-image \
  -H "Authorization: Bearer <token>" \
  -F "file=@/caminho/local/fundo.png"
```

**Resposta:**
```json
{ "button_layout_image": "https://<bucket>.s3.<region>.amazonaws.com/campaigns/<campaignId>/button-layout-1718600000000.png" }
```

- Extensões aceitas: `jpg, jpeg, png, gif, webp`. Tamanho máximo: **5MB**.
- Requer ser **dono** da campanha (ou Admin/TenantAdmin/SuperAdmin) — caso contrário **403**.

## 3. Salvar o layout de botões (substitui tudo)

`PUT` **substitui o array inteiro** (semântica "salvar tudo de uma vez", ideal para o editor visual):

```bash
curl -X PUT https://admin-api.homolog.mintvrs.com/campaigns/<campaignId>/buttons \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "buttons": [
      { "id": "video", "x": 42.5, "y": 73.1, "enabled": true, "order": 0 }
    ]
  }'
```

**Resposta** (mesmo shape do GET):
```json
{
  "interactive_buttons_enabled": true,
  "button_layout_image": "https://…/button-layout-…png",
  "buttons": [
    { "id": "video", "x": 42.5, "y": 73.1, "enabled": true, "order": 0 }
  ]
}
```

## 4. Ler o layout (público)

```bash
curl https://admin-api.homolog.mintvrs.com/campaigns/<campaignId>/buttons
```

Retorna `{ interactive_buttons_enabled, button_layout_image, buttons[] }`. Os mesmos campos também
vêm dentro de `campaign` no `GET /campaigns/:campaignId/public`.

## Implementando o editor (frontend)

```mermaid
sequenceDiagram
    participant Editor as Admin (Editor)
    participant Backend
    participant S3

    Editor->>Backend: PATCH /campaigns/:campaignId { interactive_buttons_enabled: true }
    Editor->>Backend: POST /campaigns/:campaignId/button-layout-image (multipart)
    Backend->>S3: upload (bucket público)
    S3-->>Backend: ok
    Backend-->>Editor: { button_layout_image }
    Note over Editor: renderiza a imagem; usuário arrasta os botões
    Editor->>Backend: PUT /campaigns/:campaignId/buttons { buttons: [...] }
    Backend-->>Editor: { enabled, image, buttons: [...] }

    Note over Editor: App consumidor
    Editor->>Backend: GET /campaigns/:campaignId/buttons
    Backend-->>Editor: { enabled, image, buttons }
```

**Posicionamento e captura do percentual** (responsivo):

- Renderize cada botão com posição relativa à imagem:
  `style = { left: x% , top: y% , transform: translate(-50%, -50%) }` — o `translate` centraliza o
  botão no ponto, tornando o `%` independente do tamanho do próprio botão.
- No drag, converta a posição do ponteiro para `%` usando o **bounding box da imagem renderizada**:
  `x = (pointerX - rect.left) / rect.width * 100` (idem para `y`), com **clamp 0–100**.
- Como tudo é guardado em `%`, ao redimensionar a janela os botões reposicionam sozinhos — **não**
  salve pixels.
- Use **Pointer Events** (`pointerdown/move/up` + `setPointerCapture`) para cobrir mouse e toque com
  um único caminho de código.

:::tip
No editor, salve o layout completo de uma vez via `PUT` (substituição total). Não há endpoint de
CRUD por botão — o array enviado passa a ser o estado vigente.
:::
