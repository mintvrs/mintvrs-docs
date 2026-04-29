---
id: overview
title: Visão Geral (Infra)
sidebar_position: 1
---

# Visão Geral — Time de Infra

Esta seção é destinada ao time de infraestrutura e DevOps. Aqui você encontra tudo que precisa para operar o ambiente de produção: subir os serviços, rodar migrations e diagnosticar problemas.

## Serviços

| Serviço | Imagem | Banco de dados |
|---|---|---|
| `admin-backend` | `ghcr.io/mkclub69/mintvrs-admin-backend` | `mkclub_backend` (Postgres) |
| `auth-service` | `ghcr.io/mkclub69/mintvrs-auth` | `authdb` (Postgres) |
| `admin-frontend` | `ghcr.io/mkclub69/mintvrs-admin-web` | — (sem banco próprio) |

## Variáveis de ambiente por serviço

Cada serviço usa um **nome de env var diferente** para a connection string do banco. Não são intercambiáveis.

| Serviço | Variável | Banco esperado |
|---|---|---|
| `admin-backend` | `DATABASE_URL_ADMIN` | `mkclub_backend` |
| `auth-service` | `DATABASE_URL` | `authdb` |

Formato da connection string:

```
postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO
```

Para uma lista completa de variáveis de ambiente de cada serviço, veja [Variáveis de Ambiente](/ambiente/variaveis).

## Próximos passos

- [Migrations](/infra/migrations) — como as migrations são aplicadas e como verificar/forçar manualmente.
- [Deploy em Produção](/ambiente/deploy) — passo a passo para subir a stack.

## Quando algo trava

Se travar no meio da operação, entre em contato com o time de desenvolvimento. O processo de migrations, em especial, tem pontos de atenção documentados na página de [Migrations](/infra/migrations).
