---
id: deploy
title: Deploy em Produção
sidebar_position: 3
---

# Deploy em Produção

O MKClub usa **GKE** + **ArgoCD** para deploy em produção via GitOps.

:::warning Página em revisão
Esta página está sendo atualizada para refletir a infraestrutura atual (GKE/ArgoCD). Para operações de infra — serviços, imagens, secrets e migrations — consulte a seção [Infra](/infra/overview).
:::

## Infraestrutura

- **Cluster:** GKE `mk` em `southamerica-east1` (projeto GCP `vaulted-program-487919-g2`)
- **Sincronização:** ArgoCD via `mkclub69/mk-microservice-ops`
- **Secrets:** GCP Secret Manager + External Secrets Operator

## Imagens Docker

As imagens são publicadas no **Google Artifact Registry**, acionado ao criar uma tag `v*`:

| Serviço | Imagem (GAR) |
|---------|---|
| `admin-backend` | `southamerica-east1-docker.pkg.dev/vaulted-program-487919-g2/mintvrs-admin-backend/mintvrs-admin-backend` |
| `auth-service` | `southamerica-east1-docker.pkg.dev/vaulted-program-487919-g2/mintvrs-auth/mintvrs-auth` |
| `admin-frontend` | `southamerica-east1-docker.pkg.dev/vaulted-program-487919-g2/mintvrs-admin-web/mintvrs-admin-web` |

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
API_BASE_URL=https://auth.mk.nearx.com.br

# admin-backend
DATABASE_URL_ADMIN=postgresql://user:pass@localhost:5432/mkclub_backend
AUTH_SERVICE_URL=http://mkauth:3001  # Comunicação interna Docker
CORS_ORIGINS=https://admin.mk.nearx.com.br,https://admin.mintvrs.com,https://docs.mintvrs.com
API_BASE_URL=https://api.mk.nearx.com.br
XION_MNEMONIC=...

# admin-frontend (build-time)
NEXT_PUBLIC_ADMIN_BACKEND_URL=https://api.mk.nearx.com.br
NEXT_PUBLIC_AUTH_SERVICE_URL=https://auth.mk.nearx.com.br
AUTH_SERVICE_BASE_URL=http://mkauth:3001  # Comunicação interna Docker
```

:::warning Build-time vs Runtime
O `NEXT_PUBLIC_*` do Next.js é **baked no build**. A imagem Docker do admin-frontend precisa ser construída com as URLs corretas de produção. Variáveis sem `NEXT_PUBLIC_` são runtime e podem ser injetadas no container.
:::

### 3. Migrations

As migrations rodam automaticamente no boot de cada pod (TypeORM `migrationsRun: true`). Não é necessária nenhuma etapa manual no deploy normal.

:::tip Infra
Para referência completa — verificação, comando manual de emergência e troubleshooting — veja [Migrations (Infra)](/infra/migrations).
:::

### 4. Deploy

O deploy é feito via GitOps: o workflow `on_release.yml` atualiza a tag da imagem no `kustomization.yaml` do repo de ops (`mkclub69/mk-microservice-ops`) e o ArgoCD aplica o rolling update no cluster.

### 5. Verificar saúde

```bash
curl https://auth.mk.nearx.com.br/health/ready
curl https://api.mk.nearx.com.br/health/ready
curl https://admin.mk.nearx.com.br/api/health
```

## Atualizar para nova versão

Crie uma tag `v*` no repositório do serviço. O workflow `on_release.yml` faz build, publica a imagem no GAR e atualiza o `kustomization.yaml` no repo de ops. O ArgoCD aplica o rolling update automaticamente.

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

O banco de dados fica no **Cloud SQL** (gerenciado pelo GCP). Backups automáticos são configurados diretamente no console do Cloud SQL. Para exports manuais, usar `gcloud sql export` ou o console GCP.
