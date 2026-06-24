---
id: custom-fields
title: Custom Fields (Campos Customizados)
sidebar_position: 6
---

# Custom Fields (Campos Customizados)

Guia para quem vai **ler** os campos customizados de uma campanha no front (ex.: "Estilo de Ensaio", "Fotógrafo"). Escrito do zero — não precisa conhecer o modelo do MintVRS.

## 1. Como o MintVRS é organizado

Pensa em 3 camadas, de cima pra baixo:

1. **Tenant** — o cliente/organização dono da plataforma (ex.: um estúdio de fotografia). Tudo no MintVRS pertence a um tenant.
2. **Configuração de campanha** (`campaignConfig`) — um **molde/template** que o tenant configura uma vez, decidindo como as campanhas dele serão. Dentro desse molde existe uma lista chamada **`customFields`**.
3. **Campanha** — uma campanha de verdade (ex.: "Ensaio Boudoir da Marina"), criada seguindo aquele molde.

## 2. O que são custom fields

O MintVRS já tem os campos padrão de campanha (nome, descrição, capa, meta…). Mas cada tenant pode querer campos **extras, inventados por ele** — ex.: "Estilo de Ensaio" e "Fotógrafo".

Esses campos extras são os **custom fields**. O tenant os **cria** na configuração de campanha dele. Cada custom field tem:

| Propriedade | O que é | Exemplo |
|---|---|---|
| `id` | um **código interno**, gerado pelo sistema | `cf_a1b2` |
| `label` | o **nome legível** que humano vê | `Estilo de Ensaio` |
| `fieldType` | o tipo do campo | `short_text` |

:::warning O label NÃO fica salvo na campanha
O `label` ("Estilo de Ensaio") fica só na **configuração do tenant**. A **campanha** guarda apenas o `id` + o valor preenchido. São dois lugares diferentes.
:::

## 3. Por que você pegava `null`

Ao criar a campanha e preencher os custom fields, os valores são salvos **keyados pelo `id`, não pelo nome**:

```json
"custom_fields": {
  "cf_a1b2": "Boudoir",
  "cf_c3d4": "Marina Silva"
}
```

Então `campanha.custom_fields["fotografo"]` (ou `["Fotógrafo"]`) retorna `undefined`/`null` — essa chave não existe. A chave real é `cf_c3d4`, e o nome "Fotógrafo" mora na config do tenant, não na campanha.

## 4. A solução: `custom_fields_resolved`

Pra você não precisar conhecer a config do tenant nem adivinhar id, **toda resposta de campanha vem com um campo extra já montado**, o **`custom_fields_resolved`**:

```json
"custom_fields_resolved": [
  { "id": "cf_a1b2", "label": "Estilo de Ensaio", "fieldType": "short_text", "value": "Boudoir" },
  { "id": "cf_c3d4", "label": "Fotógrafo",        "fieldType": "short_text", "value": "Marina Silva" }
]
```

É uma **lista pronta**: cada item já tem o `label` (pra mostrar) e o `value` (o que foi preenchido). É só percorrer e renderizar.

:::note
Campo definido mas não preenchido vem com `"value": null` — é normal.
:::

## 5. Como fazer o GET (passo a passo)

**Base URL (homolog):** `https://admin-api.homolog.mintvrs.com`

Esses GETs de campanha são **públicos** — não precisa de token pra ler.

### Opção A — você já tem o `campaignId`

```bash
curl https://admin-api.homolog.mintvrs.com/campaigns/SEU_CAMPAIGN_ID
```

```js
const res = await fetch(`https://admin-api.homolog.mintvrs.com/campaigns/${campaignId}`)
const campanha = await res.json()

campanha.custom_fields_resolved.forEach((campo) => {
  console.log(campo.label, "=", campo.value)
  // "Estilo de Ensaio = Boudoir"
  // "Fotógrafo = Marina Silva"
})
```

Renderizando (React):

```jsx
{campanha.custom_fields_resolved.map((campo) => (
  <div key={campo.id}>
    <strong>{campo.label}:</strong> {campo.value ?? "—"}
  </div>
))}
```

### Opção B — listar campanhas e pegar de lá

```js
const res = await fetch("https://admin-api.homolog.mintvrs.com/campaigns/active")
const campanhas = await res.json() // é uma LISTA

campanhas.forEach((c) => console.log(c.name, c.custom_fields_resolved))
```

Cada item de `/campaigns/active` também já traz `custom_fields_resolved`.

### Opção C — endpoint público com prévias (`/public`)

```js
const res = await fetch(`https://admin-api.homolog.mintvrs.com/campaigns/${campaignId}/public`)
const data = await res.json()

data.campaign.name            // a campanha vem aninhada em "campaign"
data.custom_fields_resolved   // mas o resolved vem na RAIZ (não em data.campaign)
```

:::caution
No `/public`, a campanha está aninhada em `data.campaign`, **porém** o `custom_fields_resolved` vem na **raiz** (`data.custom_fields_resolved`).
:::

## 6. Erros comuns (não faça)

- ❌ `campanha.custom_fields["fotografo"]` → vem `null`. A chave é um id (`cf_...`), não o nome.
- ❌ Procurar o nome do campo dentro da campanha → o nome está na config do tenant. Use o `label` do `custom_fields_resolved`.
- ❌ No `/public`, procurar `data.campaign.custom_fields_resolved` → ele está na **raiz** (`data.custom_fields_resolved`).

## 7. Regra de ouro

:::tip
**Sempre use `custom_fields_resolved`** — uma lista de `{ id, label, fieldType, value }` pronta pra tela. Esqueça o `custom_fields` cru (chaves `cf_...`); ele só existe por compatibilidade.
:::

Onde aparece o `custom_fields_resolved`:

| Endpoint | Onde está |
|---|---|
| `GET /campaigns/active` | raiz de cada item da lista |
| `GET /campaigns/:campaignId` | raiz |
| `GET /campaigns/:campaignId/public` | raiz da resposta (ao lado de `campaign`) |
