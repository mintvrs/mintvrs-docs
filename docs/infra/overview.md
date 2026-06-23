---
id: overview
title: Visão Geral (Infra)
sidebar_position: 1
---

# Visão Geral — Time de Infra

Esta seção é destinada ao time de infraestrutura e DevOps. Aqui você encontra tudo que precisa para operar o ambiente de produção: entender os serviços, as imagens, os segredos e o fluxo de deploy.

## Cluster

| Item | Valor |
|---|---|
| Provedor | EKS (Amazon Elastic Kubernetes Service) |
| Cluster | `mk` |
| Versão Kubernetes | 1.35 |
| CNI | Cilium |
| Região AWS | `us-east-1` |
| Conta AWS | `245111010865` |
| Sincronização | ArgoCD via GitOps — repo `mkclub69/mk-microservice-ops` |

:::danger Nunca rodar `kubectl apply` diretamente
O ArgoCD é a única fonte de verdade para o estado do cluster. Aplicar manifests manualmente cria drift e pode ser sobrescrito na próxima sync. Para alterar qualquer recurso, modifique o manifest no repo de ops e faça push.
:::

## Serviços em produção

| Serviço | Namespace / Deployment | Porta | Banco |
|---|---|---|---|
| `admin-backend` | `mintvrs-admin-backend` | 3006 | `mkclub_backend` (Aurora Serverless v2 — PostgreSQL) |
| `auth-service` | `mintvrs-auth` | 3001 | `authdb` (Aurora Serverless v2 — PostgreSQL) |
| `admin-frontend` | `mintvrs-admin-web` | 3000 | — |
| `docs` | `mintvrs-docs` | — | — |

## Imagens Docker

As imagens são publicadas no **Amazon ECR** pelo workflow `on_release.yml` de cada repositório, acionado ao criar uma tag `v*`.

| Serviço | Imagem (ECR) |
|---|---|
| `admin-backend` | `245111010865.dkr.ecr.us-east-1.amazonaws.com/mintvrs-admin-backend` |
| `auth-service` | `245111010865.dkr.ecr.us-east-1.amazonaws.com/mintvrs-auth` |
| `admin-frontend` | `245111010865.dkr.ecr.us-east-1.amazonaws.com/mintvrs-admin-web` |

## Segredos e variáveis de ambiente

Os segredos são gerenciados no **AWS Secrets Manager** e injetados nos pods pelo **External Secrets Operator** (ESO), via `ClusterSecretStore: aws-secrets-manager`. A autenticação do ESO ao Secrets Manager é feita por **IRSA** (IAM Roles for Service Accounts).

Variáveis de banco de dados por serviço:

| Serviço | Env var no pod | Chave no Secrets Manager |
|---|---|---|
| `admin-backend` | `DATABASE_URL_ADMIN` | `mintvrs-admin-backend-database-url-admin` |
| `auth-service` | `DATABASE_URL` | `mintvrs-auth-db-url` |

:::danger Env vars diferentes por serviço
`admin-backend` usa `DATABASE_URL_ADMIN`; `auth-service` usa `DATABASE_URL`. Não são intercambiáveis.
:::

## Como o deploy funciona

1. O desenvolvedor cria uma tag `v*` no repositório do serviço.
2. O workflow `on_release.yml` faz build da imagem, publica no ECR com a tag da release e atualiza `images[].newTag` no `kustomization.yaml` do serviço dentro do repo `mkclub69/mk-microservice-ops`.
3. O ArgoCD detecta a mudança no repo de ops e faz rolling update do Deployment correspondente no cluster.

## Próximos passos

- [Migrations](/infra/migrations) — como as migrations de banco são aplicadas, como verificar e como agir em emergências.
- [Variáveis de Ambiente](/ambiente/variaveis) — lista completa de env vars de cada serviço.
- [Deploy em Produção](/ambiente/deploy) — contexto adicional sobre a infraestrutura.
