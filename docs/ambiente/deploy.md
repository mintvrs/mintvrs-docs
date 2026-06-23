---
id: deploy
title: Deploy em Produção
sidebar_position: 3
---

# Deploy em Produção

O MKClub usa **EKS** + **ArgoCD** para deploy em produção via GitOps.

:::warning Página em revisão
Esta página está sendo atualizada para refletir a infraestrutura atual (EKS/ArgoCD). Para operações de infra — serviços, imagens, secrets e migrations — consulte a seção [Infra](/infra/overview).
:::

## Infraestrutura

- **Cluster:** EKS `mk` em `us-east-1` (conta AWS `245111010865`), Kubernetes 1.35, CNI Cilium
- **Sincronização:** ArgoCD via `mkclub69/mk-microservice-ops`
- **Secrets:** AWS Secrets Manager + External Secrets Operator (autenticação via IRSA)
- **Borda / Ingress:** ALB + WAF + ACM (TLS) para tráfego externo; ingress-nginx para roteamento interno

## Imagens Docker

As imagens são publicadas no **Amazon ECR**, acionado ao criar uma tag `v*`:

| Serviço | Imagem (ECR) |
|---------|---|
| `admin-backend` | `245111010865.dkr.ecr.us-east-1.amazonaws.com/mintvrs-admin-backend` |
| `auth-service` | `245111010865.dkr.ecr.us-east-1.amazonaws.com/mintvrs-auth` |
| `admin-frontend` | `245111010865.dkr.ecr.us-east-1.amazonaws.com/mintvrs-admin-web` |

## Checklist de deploy

### 1. Servidor

- [ ] Docker e Docker Compose instalados
- [ ] Portas 80 e 443 abertas no firewall
- [ ] DNS configurado (registros A para todos os subdomínios)

### 2. Variáveis de ambiente

Configure no servidor (exemplo via arquivo `.env` ou variáveis do sistema):

```bash
# auth-service
DATABASE_URL=postgresql://user:pass@localhost:5432/authdb
JWT_SECRET=chave-super-secreta-producao
API_BASE_URL=https://auth.mintvrs.com

# admin-backend
DATABASE_URL_ADMIN=postgresql://user:pass@localhost:5432/mkclub_backend
AUTH_SERVICE_URL=http://mkauth:3001  # Comunicação interna Docker
CORS_ORIGINS=https://admin.mintvrs.com,https://docs.mintvrs.com
API_BASE_URL=https://admin-api.mintvrs.com
XION_MNEMONIC=...

# admin-frontend (build-time)
NEXT_PUBLIC_ADMIN_BACKEND_URL=https://admin-api.mintvrs.com
NEXT_PUBLIC_AUTH_SERVICE_URL=https://auth.mintvrs.com
AUTH_SERVICE_BASE_URL=http://mkauth:3001  # Comunicação interna Docker
```

:::warning Build-time vs Runtime
O `NEXT_PUBLIC_*` do Next.js é **baked no build**. A imagem Docker do admin-frontend precisa ser construída com as URLs corretas de produção. Variáveis sem `NEXT_PUBLIC_` são runtime e podem ser injetadas no container.
:::

### 3. Migrations

O `auth-service` aplica migrations automaticamente no boot. O `admin-backend` requer um passo via CLI após o deploy — o procedimento completo está em [Migrations (Infra)](/infra/migrations).

### 4. Deploy

O deploy é feito via GitOps: o workflow `on_release.yml` atualiza a tag da imagem no `kustomization.yaml` do repo de ops (`mkclub69/mk-microservice-ops`) e o ArgoCD aplica o rolling update no cluster.

### 5. Verificar saúde

```bash
curl https://auth.mintvrs.com/health/ready
curl https://admin-api.mintvrs.com/health/ready
curl https://admin.mintvrs.com/api/health
```

## Atualizar para nova versão

Crie uma tag `v*` no repositório do serviço. O workflow `on_release.yml` faz build, publica a imagem no ECR e atualiza o `kustomization.yaml` no repo de ops. O ArgoCD aplica o rolling update automaticamente.

## Monitoramento

Endpoints de health para monitoramento externo:

| Endpoint | Tipo | Descrição |
|----------|------|-----------|
| `/health` | Startup | Serviço iniciou |
| `/health/live` | Liveness | Serviço está vivo (processo OK) |
| `/health/ready` | Readiness | Serviço está pronto (DB conectado) |

## Logs

```bash
# Ver logs em tempo real
kubectl -n mintvrs-admin-backend logs -f deploy/mintvrs-admin-backend
kubectl -n mintvrs-auth logs -f deploy/mintvrs-auth
kubectl -n mintvrs-admin-web logs -f deploy/mintvrs-admin-web

# Filtrar por nível
kubectl -n mintvrs-admin-backend logs deploy/mintvrs-admin-backend | grep ERROR
```

## Backup do banco de dados

**Produção** usa **Aurora Serverless v2 (PostgreSQL)**: backups automáticos são configurados no console RDS/Aurora (snapshots automáticos e point-in-time recovery). Para exports manuais, use ferramentas padrão PostgreSQL (ex.: `pg_dump`) a partir de um pod com acesso ao banco, ou gere um snapshot manual via console AWS / AWS CLI.

**Homolog** usa **PostgreSQL in-cluster** (chart `postgres-homolog` no repo `mk-mono-ops`): para backup, use `pg_dump` diretamente a partir do pod ou de qualquer pod com acesso ao serviço interno.
