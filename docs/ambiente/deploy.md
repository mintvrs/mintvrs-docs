---
id: deploy
title: Deploy em Produção
sidebar_position: 3
---

# Deploy em Produção

O MKClub usa **Docker** + **Traefik** para deploy em produção.

## Infraestrutura

```
Traefik (reverse proxy + TLS)
├── api.mk.nearx.com.br → admin-backend (:3006)
├── auth.mk.nearx.com.br → auth-service (:3001)
├── admin.mk.nearx.com.br → admin-frontend (:3000)
└── traefik.mk.nearx.com.br → Traefik Dashboard
```

## Imagens Docker

As imagens são publicadas no GitHub Container Registry:

| Imagem | Serviço |
|--------|---------|
| `ghcr.io/nearxdev/mkbackend` | admin-backend |
| `ghcr.io/nearxdev/mkauth` | auth-service |
| `ghcr.io/nearxdev/mkadminweb` | admin-frontend |

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

Antes de subir os containers:

```bash
# Rodar migrations do auth-service
docker run --rm --network host \
  -e DATABASE_URL=postgresql://... \
  ghcr.io/nearxdev/mkauth \
  node ./node_modules/typeorm/cli.js migration:run -d dist/data-source.js

# Rodar migrations do admin-backend
docker run --rm --network host \
  -e DATABASE_URL_ADMIN=postgresql://... \
  ghcr.io/nearxdev/mkbackend \
  node ./node_modules/typeorm/cli.js migration:run -d dist/data-source.js
```

:::tip Infra
Para referência completa (verificação, fallback, troubleshooting), veja [Migrations (Infra)](/infra/migrations).
:::

### 4. Subir a stack

```bash
cd acesso-db-mkclub
docker compose up -d
```

### 5. Verificar saúde

```bash
curl https://auth.mk.nearx.com.br/health/ready
curl https://api.mk.nearx.com.br/health/ready
curl https://admin.mk.nearx.com.br/api/health
```

## Atualizar para nova versão

```bash
# Puxar novas imagens
docker compose pull

# Restart com zero downtime (Traefik mantém as rotas)
docker compose up -d --remove-orphans
```

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
docker compose logs -f mkbackend
docker compose logs -f mkauth
docker compose logs -f mkadminweb

# Filtrar por nível
docker compose logs mkbackend | grep ERROR
```

## Backup do banco de dados

```bash
# Backup
docker exec mkclub-postgres pg_dump -U postgres mkclub_backend > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i mkclub-postgres psql -U postgres mkclub_backend < backup.sql
```
