---
id: reembolso-campanha-cancelada
title: Reembolso de campanha cancelada
sidebar_position: 10
---

# Reembolso de campanha cancelada

Quando uma campanha é cancelada, cada comprador de chave ganha um **caso de reembolso** e escolhe como quer receber de volta. Este guia é o contrato completo para quem for construir a tela do comprador.

:::info Cancelar não é apagar
`DELETE /campaigns/:campaignId` recusa com **400 `CAMPAIGN_HAS_SOLD_KEYS`** assim que existe uma chave paga. Apagar destruiria o `payment_intent` do Stripe, que só existe dentro do JSON de `transactions.memo` — sem ele nenhum estorno é possível. O cancelamento preserva tudo: a campanha vai para o status **`Cancelled`** (terminal) e as chaves ficam na base como prova do direito ao reembolso.
:::

## Fluxo completo

```mermaid
flowchart TD
    A["Admin\nPOST /campaigns/:id/cancel\n(dryRun: true)"] -->|"confere o impacto"| B["POST /campaigns/:id/cancel"]
    B --> C["Campanha vira Cancelled\n+ 1 refund_case por comprador"]
    C -->|"e-mail com link\n?case=&token="| D["GET /refunds/:caseId?token=\n(sem login)"]
    D --> E{"Comprador escolhe"}
    E -->|"credits"| F["Saldo na plataforma"]
    E -->|"card_refund"| G["Estorno no cartão"]
    E -->|"reallocate"| H["Chaves de outra campanha"]
    H -->|"custou mais"| I["POST /reallocation-checkout\n→ Stripe"]
    I --> J["POST /confirm-reallocation"]
    E -->|"prazo vence sem escolha"| F
```

## Autenticação: a tela do comprador não tem login

Quem chega vem do link do e-mail e **não está logado**. A autorização é o `token` da querystring, que vale só para aquele caso.

- `GET /refunds/:caseId` aceita `?token=`
- `POST /refunds/:caseId/choose` aceita o `token` no corpo **ou** na query
- O mesmo vale para `reallocation-checkout` e `confirm-reallocation`

O token é credencial: não logue, não coloque em analytics, não exiba na tela.

## Valores estão em CENTAVOS

Todo campo monetário deste domínio é inteiro em centavos — `50000` é R$ 500,00. Converta só na renderização.

```ts
const formatCents = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(cents / 100);
```

Invariante garantida pelo servidor: **`cardAmount + creditAmount === totalAmount`**, sempre.

## As três opções

`POST /refunds/:caseId/choose` com `{ choice, token }`. **A escolha é definitiva** — diga isso na tela antes, não depois.

| `choice` | Exige | O que acontece |
|---|---|---|
| `credits` | — | O valor inteiro vira saldo na plataforma, sem validade |
| `card_refund` | `method: "card"` | Estorna a parcela elegível; o resto vira crédito no mesmo ato |
| `reallocate` | `items[]` | Troca por chaves de outra campanha; sobra vira crédito, falta é cobrada |

### Métodos indisponíveis aparecem — não somem

`options.immediateRefund[]` lista cada método com `enabled` e `unavailableReason`. Renderize o botão **visível e desabilitado**, com o motivo. Esconder faz o usuário procurar uma opção que o produto decidiu não oferecer agora.

Hoje, em todos os ambientes:

- **`card`** — desligado. O reembolso sai em crédito na plataforma. Tentar mesmo assim devolve **422 `CARD_REFUND_UNAVAILABLE`**.
- **`pix`** — desligado, integração com a Asaas não concluída. Devolve **422 `PIX_UNAVAILABLE`**.

Consulte sempre `enabled` antes de habilitar o botão; não hardcode a regra.

## Prazo

`expiresAt` é o limite para escolher — 30 dias a partir da abertura. Vencido, o valor vira crédito automaticamente. `defaultOnExpiry` diz o que acontecerá (hoje sempre `credits`) para a tela avisar sem hardcodar.

## Estados do caso

Só **`pending`** aceita escolha. Os demais (`processing`, `awaiting_payment`, `resolved`, `partially_failed`) devolvem **409** em `choose` — a tela deve mostrar o estado em vez de oferecer as opções de novo.

## Códigos de erro estáveis

Trate pelo campo `error`, nunca pelo texto da mensagem:

| Código | HTTP | Significado |
|---|---|---|
| `CARD_REFUND_UNAVAILABLE` | 422 | Devolução no cartão desligada |
| `PIX_UNAVAILABLE` | 422 | PIX não integrado |
| `NOT_CARD_REFUNDABLE` | 422 | Nada deste valor foi pago no cartão |
| `CASE_PROCESSING` | 409 | Outra requisição está resolvendo o caso |
| `CASE_RESOLVED` | 409 | Já resolvido; a escolha é definitiva |
| `CASE_EXPIRED` | 409 | Prazo vencido |
| `TOPUP_REQUIRED` | 409 | O cesto custa mais e a diferença não foi paga |

## Troca por chaves (`reallocate`)

Mande `items: [{ campaignId, accessId, quantity }]`. **O preço é derivado do tier no servidor** — não existe campo de preço no corpo, de propósito.

- Custou menos: a sobra vira crédito, resolvido na hora.
- Custou mais: a resposta vem com `checkoutRequired: true` e `shortfallAmount`. Chame `POST /refunds/:caseId/reallocation-checkout` com `successUrl`/`cancelUrl`, redirecione para o `checkoutUrl` do Stripe e confirme depois com `POST /refunds/:caseId/confirm-reallocation` mandando o `sessionId`. Nada é emitido antes da confirmação.

## Configuração necessária no backend

O link do e-mail é montado a partir de `REFUND_PAGE_URL_BASE`. Sem ela o servidor cai num default `http://localhost:3000/reembolso` e o link sai apontando para a máquina de quem gerou — o e-mail parece correto e não leva a lugar nenhum.

```env
REFUND_PAGE_URL_BASE=https://app.homolog.mykeys.club/reembolso
RESEND_API_KEY=
MAIL_FROM_EMAIL=
MAIL_FROM_NAME=MintVRS
```

Sem `RESEND_API_KEY` nenhum e-mail sai. Nesse caso a resposta do cancelamento traz `mailConfigured: false` e um `debugLink` por caso, para envio manual — o campo some sozinho quando a chave existir.

## Referência das rotas

| Método | Rota | Quem usa |
|---|---|---|
| `POST` | `/campaigns/{campaignId}/cancel` | Admin (aceita `dryRun`) |
| `GET` | `/refunds/{caseId}` | Comprador, via link do e-mail |
| `POST` | `/refunds/{caseId}/choose` | Comprador |
| `POST` | `/refunds/{caseId}/reallocation-checkout` | Comprador |
| `POST` | `/refunds/{caseId}/confirm-reallocation` | Comprador |
| `GET` | `/refunds/me` | Comprador logado |
| `GET` | `/refunds` | Admin |
| `POST` | `/refunds/{caseId}/retry` | Admin (caso `partially_failed`) |
| `POST` | `/refunds/sweep-expired` | Ops |

O contrato completo de cada uma, com schemas e exemplos, está em **API Reference → Admin Backend → refunds**.
