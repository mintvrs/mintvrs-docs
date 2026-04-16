---
id: blockchain
title: Deploy e Uso da Blockchain
sidebar_position: 6
---

# Deploy e Uso da Blockchain Xion

Guia para configurar os contratos inteligentes na blockchain Xion para seu tenant.

## Pré-requisitos

1. Wallet Xion com saldo suficiente para pagar gas
2. Variáveis de ambiente configuradas em `.env.blockchain`
3. Arquivos WASM dos contratos em `blockchain/wasm/`

## Setup inicial da plataforma (SuperAdmin — uma vez só)

### 1. Deploy do Factory Contract

```bash
curl -X POST https://api.mk.nearx.com.br/xion/factory/deploy \
  -H "Authorization: Bearer <token_superadmin>" \
  -H "Content-Type: application/json" \
  -d '{
    "cw20CodeId": 12345
  }'
```

```json
{
  "factoryAddress": "xion1factory...",
  "transactionHash": "ABCDEF..."
}
```

### 2. Verificar saúde da conexão

```bash
curl https://api.mk.nearx.com.br/xion/health
```

```json
{
  "connected": true,
  "address": "xion1adminwallet...",
  "chain": "xion-testnet-2",
  "blockHeight": 1234567
}
```

## Por tenant — Criar token CW20

```bash
curl -X POST https://api.mk.nearx.com.br/xion/factory/create-token \
  -H "Authorization: Bearer <token_superadmin>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant-uuid",
    "name": "MKToken Empresa ABC",
    "symbol": "MKABC"
  }'
```

```json
{
  "cw20Address": "xion1token...",
  "transactionHash": "FEDCBA..."
}
```

## Registrar compra on-chain

Após uma compra Web2 (fora do Stripe), registre-a na blockchain:

```bash
curl -X POST https://api.mk.nearx.com.br/xion/tenant/purchases/register \
  -H "Authorization: Bearer <token_tenantadmin>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant-uuid",
    "cw20ContractAddress": "xion1token...",
    "campaignId": "campaign-uuid",
    "orderId": "ORDER-12345",
    "buyerName": "João Silva",
    "buyerEmail": "joao@email.com",
    "provider": "pix",
    "fiatCurrency": "BRL",
    "fiatAmount": 9900,
    "tokens": 1,
    "purchasedAt": "2025-01-15T10:00:00Z"
  }'
```

## Mint de NFT

```bash
curl -X POST https://api.mk.nearx.com.br/xion/tenant/mint \
  -H "Authorization: Bearer <token_tenantadmin>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant-uuid",
    "nftContractAddress": "xion1nft...",
    "tokenId": "TOKEN-001",
    "tokenUri": "ipfs://QmXxx.../metadata.json",
    "recipient": "xion1recipient..."
  }'
```

## Consultar endereço CW20 do tenant

```bash
curl "https://api.mk.nearx.com.br/xion/factory/tenant-token?tenantId=tenant-uuid" \
  -H "Authorization: Bearer <token>"
```

```json
{
  "tenantId": "tenant-uuid",
  "cw20Address": "xion1token..."
}
```

## Listar tenants na Factory

```bash
curl https://api.mk.nearx.com.br/xion/factory/tenants \
  -H "Authorization: Bearer <token_superadmin>"
```

## Explorer

Verifique transações no explorador Xion:
- Testnet: `https://explorer.burnt.com/xion-testnet-2`
- Mainnet: (consultar documentação Xion)
