---
id: kyc-aarin
title: KYC via Aarin BaaS
sidebar_position: 7
---

# KYC via Aarin BaaS

O MKClub utiliza a **Aarin BaaS** para verificação de identidade (Know Your Customer). O frontend chama um único endpoint no admin-backend, que orquestra internamente a criação e envio de dados ao processo de KYC da Aarin.

## Fluxo

```
Front-end
    │
    │  POST /kyc/start
    │  Authorization: Bearer <jwt>
    │  { cpf, fullName, birthDate, phone, motherName? }
    ▼
Admin Backend
    ├─ Se usuário não tem aarin_kyc_process_id:
    │       POST https://api.aarin.com.br/baas/kyc/processes
    │       ← { id: "process-uuid" }
    │
    ├─ PUT https://api.aarin.com.br/baas/kyc/processes/{id}
    │       body: { type: "PF", personal_data, contacts }
    │       ← { id, status, ... }
    │
    └─ Persiste aarin_kyc_process_id + kyc_status no User
    ▼
Front-end recebe: { processId, status, raw }
```

## Endpoint

```
POST /kyc/start
Authorization: Bearer <token JWT>
Content-Type: application/json
```

### Body

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `cpf` | string | sim | CPF sem pontuação, exatamente 11 dígitos |
| `fullName` | string | sim | Nome completo, máx. 120 caracteres |
| `birthDate` | string | sim | Data no formato ISO 8601 (`YYYY-MM-DD`) |
| `phone` | string | sim | Telefone com DDI+DDD, 10–15 dígitos (ex.: `+5511999999999`) |
| `motherName` | string | não | Nome completo da mãe |

### Exemplo de request

```bash
curl -X POST https://api.mk.nearx.com.br/kyc/start \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678901",
    "fullName": "João da Silva",
    "birthDate": "1990-06-15",
    "phone": "+5511999999999",
    "motherName": "Maria da Silva"
  }'
```

### Exemplo de resposta (201)

```json
{
  "processId": "kyc-proc-uuid-da-aarin",
  "status": "pending",
  "raw": {
    "id": "kyc-proc-uuid-da-aarin",
    "status": "pending",
    "type": "PF"
  }
}
```

## Status possíveis (`kyc_status`)

| Valor | Descrição |
|-------|-----------|
| `pending` | Processo criado, aguardando análise |
| `in_review` | Em revisão manual pela Aarin |
| `approved` | KYC aprovado |
| `rejected` | KYC reprovado |

O campo `kyc_status` é salvo na tabela `users` e pode ser consultado pelo admin no endpoint `GET /users/:id`.

## Idempotência

Se o usuário já iniciou um processo anteriormente (campo `aarin_kyc_process_id` preenchido no banco), o backend **reutiliza o mesmo `id`** e faz apenas o `PUT` com os dados atualizados. Isso evita criar processos duplicados na Aarin.

## Configuração de ambiente

Para habilitar o KYC, adicione ao `.env` do admin-backend:

```env
AARIN_BASE_URL=https://api.aarin.com.br
AARIN_API_KEY=<token fornecido pela Aarin>
```

> Obtenha o `AARIN_API_KEY` no painel da Aarin BaaS em **Configurações → API Keys**.

## Migration necessária

Após o deploy, rodar manualmente (veja nota no README sobre o bug do migrationsRun):

```bash
pnpm migration:run
```

Isso adiciona as colunas `aarin_kyc_process_id`, `kyc_status` e `kyc_updated_at` na tabela `users`.
