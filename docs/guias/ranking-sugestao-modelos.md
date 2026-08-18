---
id: ranking-sugestao-modelos
title: Sugestão de Modelos & Ranking
sidebar_position: 8
---

# Sugestão de Modelos & Ranking

Os usuários **sugerem perfis de modelo** (Instagram) e **votam** nos perfis sugeridos. Os mais
votados formam o **ranking** exibido no app.

:::info Substitui o ranking de campanhas
As curtidas de campanha (`POST/GET /votes/:campaignId`) e os campos `votesCount`/`rankingPosition`
de `GET /campaigns/active` **foram removidos** — não era o ranking que o produto pedia.
:::

## O fluxo

```
usuário sugere  →  fila de moderação  →  admin aprova  →  entra no ranking  →  usuários votam
   (logado)          (pending)          (backoffice)        (logado)            (logado)
```

- **Tudo exige Bearer** — inclusive ler o ranking. Nada aqui é visível para quem não está logado.
- Sugestão nasce `pending` e **só aparece no ranking depois de aprovada**.
- **Um voto por usuário por perfil**, sem desfazer. O usuário pode votar em quantos perfis quiser.
- **Sugerir já conta como apoio**: quem sugere entra automaticamente como votante daquele perfil.

## Ranking

```bash
curl "https://admin-api.homolog.mintvrs.com/model-suggestions/ranking?limit=5" \
  -H "Authorization: Bearer <token>"
```

```json
[
  {
    "id": "dddd0000-0000-0000-0000-000000000001",
    "platform": "instagram",
    "username": "gabriela_guimaraes",
    "profileUrl": "https://instagram.com/gabriela_guimaraes",
    "votesCount": 127,
    "rankingPosition": 1
  }
]
```

| Parâmetro | Valores |
|---|---|
| `limit` | 1–50 (default **5**). **Omita o parâmetro** para usar o default — mandar `?limit=` vazio dá 400. |
| `platform` | `instagram` |

O ranking é **escopado ao tenant do token** — não há parâmetro de tenant. Numa rota autenticada,
deixar o cliente escolher o escopo seria um caminho de leitura cruzada entre tenants.

Só os parâmetros da tabela são aceitos — qualquer outro responde 400.

`rankingPosition` é calculado **dentro do escopo retornado** (plataforma + limit). Empates
em número de votos são desempatados pela sugestão mais antiga.

## Sugerir um perfil

```bash
curl -X POST https://admin-api.homolog.mintvrs.com/model-suggestions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"platform":"instagram","username":"@gabriela_guimaraes"}'
```

```json
{
  "id": "dddd0000-0000-0000-0000-000000000001",
  "platform": "instagram",
  "username": "gabriela_guimaraes",
  "status": "pending",
  "alreadyExisted": false,
  "verificationStatus": "verified"
}
```

O `username` é normalizado (minúsculo, sem `@`) antes de validar — pode mandar como o usuário digitou.

### É idempotente por perfil

Uma linha representa **um perfil**, não um ato de sugerir. Se alguém já sugeriu o mesmo handle, a
resposta é **200** com `alreadyExisted: true` e o **`id` existente** — não é erro. Use o `status`
para decidir a mensagem:

| Situação | HTTP | O que o front faz |
|---|---|---|
| Perfil novo | 201 | "Sugestão enviada para análise" |
| Já sugerido, `status: "pending"` | 200 | "Esse perfil já está em análise" |
| Já sugerido, `status: "approved"` | 200 | "Esse perfil já está no ranking" + leva a votar no `id` retornado |
| Já analisado e recusado | 409 `SUGGESTION_REJECTED` | "Esse perfil não foi aprovado" |

Limite: **5 sugestões por minuto por usuário**.

### `verificationStatus`

A existência do perfil é checada no Instagram no momento da sugestão.

| Valor | Significado |
|---|---|
| `verified` | O perfil existe. |
| `not_found` | A API respondeu que o perfil **não existe**. A sugestão ainda é criada — contas privadas ou renomeadas também caem aqui — e a moderação decide. |
| `unverified` | **Não deu para checar** (serviço indisponível). Não quer dizer que o perfil seja inválido. |

## Votar ("+1")

```bash
curl -X POST https://admin-api.homolog.mintvrs.com/model-suggestions/{suggestionId}/vote \
  -H "Authorization: Bearer <token>"
```

```json
{ "suggestionId": "dddd0000-...-0001", "hasVoted": true, "votesCount": 128 }
```

| Erro | HTTP | `code` |
|---|---|---|
| Já votou nesse perfil | 409 | `ALREADY_VOTED` |
| Sugestão ainda não aprovada | 409 | `NOT_APPROVED` |
| Sugestão inexistente | 404 | — |

Não existe desfazer voto. Cada voto passa por uma validação no serviço de autenticação, então
**dispare o "+1" de forma otimista** no front em vez de esperar a resposta.

## O que eu sugeri / em que eu votei

```bash
curl https://admin-api.homolog.mintvrs.com/model-suggestions/me \
  -H "Authorization: Bearer <token>"
```

```json
{
  "items": [
    {
      "id": "dddd0000-...-0001",
      "platform": "instagram",
      "username": "gabriela_guimaraes",
      "profileUrl": "https://instagram.com/gabriela_guimaraes",
      "status": "pending",
      "rejectionReason": null,
      "votesCount": 12,
      "createdAt": "2026-08-18T12:00:00.000Z"
    }
  ]
}
```

```bash
curl https://admin-api.homolog.mintvrs.com/model-suggestions/me/votes \
  -H "Authorization: Bearer <token>"
```

```json
{ "suggestionIds": ["dddd0000-...-0001", "dddd0000-...-0002"] }
```

Use `/me/votes` para **desabilitar o botão "+1"** dos perfis já votados.

## Moderação (backoffice)

Feita pela tela **Admin → Sugestões de Modelos** do painel. Endpoints (TenantAdmin ou SuperAdmin):

| Endpoint | O que faz |
|---|---|
| `GET /model-suggestions/admin?status=pending` | Fila de moderação, escopada ao tenant de quem chama |
| `PATCH /model-suggestions/{id}/approve` | Aprova — entra no ranking. Também **reverte** uma recusa. |
| `PATCH /model-suggestions/{id}/reject` | Recusa (body opcional `{ "reason": "..." }`) |
| `DELETE /model-suggestions/{id}` | Exclui de vez |

Diferença entre **recusar** e **excluir**:

- **Recusar** tira do ranking mas **preserva os votos** e bloqueia novas sugestões do mesmo handle.
  É reversível pelo botão de aprovar.
- **Excluir** apaga a sugestão e os votos dela, e **libera o handle** para ser sugerido de novo.

Em sugestões `pending` os votos não aparecem publicamente, mas **contam no `votesCount` da fila de
moderação** — é o sinal de quanta gente quer aquele perfil, útil para priorizar.
