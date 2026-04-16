import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api/admin-backend/mkclub-admin-backend-api",
    },
    {
      type: "category",
      label: "tenants",
      link: {
        type: "doc",
        id: "api/admin-backend/tenants",
      },
      items: [
        {
          type: "doc",
          id: "api/admin-backend/create",
          label: "Criar novo tenant (SuperAdmin ou Admin)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-all",
          label: "Listar tenants (SuperAdmin: todos ou filtro ownerId; Admin: só seus)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/global-dashboard",
          label: "Super Admin: stats global (por Admin). Admin: stats dos seus tenants (por tenant).",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-by-slug",
          label: "Buscar tenant por slug (SuperAdmin only)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-one",
          label: "Detalhes de um tenant",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/update",
          label: "Atualizar tenant (SuperAdmin, dono Admin, ou TenantAdmin do proprio tenant — apenas campaignConfig)",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/admin-backend/remove",
          label: "Apagar tenant (SuperAdmin ou dono Admin)",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/admin-backend/get-campaign-config",
          label: "Retorna configuração de campanha do tenant",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/tenant-dashboard",
          label: "Dashboard de um tenant especifico",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/regenerate-keys",
          label: "Regenerar API Key + Secret (SuperAdmin ou dono Admin)",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "payment-gateways",
      link: {
        type: "doc",
        id: "api/admin-backend/payment-gateways",
      },
      items: [
        {
          type: "doc",
          id: "api/admin-backend/create-gateway",
          label: "Configurar gateway de pagamento para o tenant",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-by-tenant",
          label: "Listar gateways configurados do tenant",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/remove-gateway",
          label: "Remover gateway",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/admin-backend/toggle-gateway",
          label: "Ativar/desativar gateway",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/admin-backend/test-connection",
          label: "Testar conexao com o provider",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/list-providers",
          label: "Listar providers de pagamento suportados",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/create-checkout",
          label: "Gerar link de checkout para compra de créditos",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/confirm-checkout",
          label: "Confirmar checkout e creditar saldo (polling após retorno do Stripe)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/create-key-purchase-checkout",
          label: "Gerar link de checkout Stripe para compra direta de chave",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/confirm-key-purchase",
          label: "Confirmar compra de chave via Stripe e registrar on-chain",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/handle-stripe-webhook",
          label: "Stripe webhook receiver (público, sem autenticação)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/charge",
          label: "Processar pagamento via gateway do tenant",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/refund",
          label: "Processar estorno via gateway do tenant",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "campaigns",
      link: {
        type: "doc",
        id: "api/admin-backend/campaigns",
      },
      items: [
        {
          type: "doc",
          id: "api/admin-backend/create",
          label: "Criar uma nova campanha (dono = usuário autenticado)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-all",
          label: "Listar campanhas (filtrado por role: SA=todas, Admin=tenants dele, TA=tenant)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-active",
          label: "Listar campanhas ativas (público, para marketplace)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-mine",
          label: "Listar minhas campanhas (dono autenticado)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-one-public",
          label: "Obter campanha pública com accesses e previews",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-one",
          label: "Obter campanha por ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/update",
          label: "Atualizar campanha (apenas dono)",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/admin-backend/remove",
          label: "Remover campanha (SuperAdmin sempre; Admin se for do tenant dele; dono da campanha)",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "contents",
      link: {
        type: "doc",
        id: "api/admin-backend/contents",
      },
      items: [
        {
          type: "doc",
          id: "api/admin-backend/find-all",
          label: "Listar conteúdos (filtrado por tenant do caller)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/create",
          label: "Criar conteúdo",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-by-campaign",
          label: "Listar conteúdos por campanha",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-preview-by-campaign",
          label: "Listar conteúdos de preview por campanha",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-one",
          label: "Obter conteúdo por ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/update",
          label: "Atualizar conteúdo",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/admin-backend/remove",
          label: "Remover conteúdo",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "tokens",
      link: {
        type: "doc",
        id: "api/admin-backend/tokens",
      },
      items: [
        {
          type: "doc",
          id: "api/admin-backend/find-mine",
          label: "Listar tokens do usuário autenticado",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-all",
          label: "Listar tokens (filtrado por tenant do caller)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-one",
          label: "Obter token por ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/acquire",
          label: "Adquirir um token disponível da campanha (usuário autenticado)",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "xion",
      link: {
        type: "doc",
        id: "api/admin-backend/xion",
      },
      items: [
        {
          type: "doc",
          id: "api/admin-backend/get-health",
          label: "Check blockchain connection status",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/get-address",
          label: "Get the Admin Wallet Address",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/mint-nft",
          label: "Mint an NFT (legacy single-tenant)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/deploy-contract",
          label: "Deploy a new NFT contract on XION (legacy single-tenant)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/register-web-2-purchase",
          label: "Registrar compra Web2 on-chain via CW20 (legacy single-tenant)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/deploy-cw-20-utility",
          label: "Deploy do CW20 utilitário (legacy single-tenant)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/deploy-factory",
          label: "Deploy the CW20 Factory contract (one-time setup, SuperAdmin only)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/deploy-tenant-cw-20",
          label: "Deploy isolated CW20 for a tenant via Factory (SuperAdmin only)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/get-tenant-cw-20-address",
          label: "Query the CW20 contract address for a specific tenant",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/get-factory-tenants",
          label: "List all tenants registered in the factory (SuperAdmin only)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/get-factory-token-count",
          label: "Get total number of deployed tenant tokens",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/mint-tenant-nft",
          label: "Mint NFT for a tenant using their NFT contract",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/register-tenant-purchase",
          label: "Register Web2 purchase on tenant-specific CW20 ledger",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "transactions",
      link: {
        type: "doc",
        id: "api/admin-backend/transactions",
      },
      items: [
        {
          type: "doc",
          id: "api/admin-backend/list",
          label: "Listar transações (filtrado por tenant do caller)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/list-by-buyer",
          label: "Listar transações por email do comprador",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/register",
          label: "Registrar compra Web2 on-chain",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/register-mock",
          label: "Registrar transação mock (apenas SuperAdmin)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/purchase",
          label: "Compra real pelo usuário final (debita créditos)",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "credits",
      link: {
        type: "doc",
        id: "api/admin-backend/credits",
      },
      items: [
        {
          type: "doc",
          id: "api/admin-backend/get-balance",
          label: "Obter saldo de créditos do usuário para o tenant",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/get-my-transactions",
          label: "Obter histórico de transações de créditos do usuário",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/get-tenant-transactions",
          label: "Obter todas as transações de créditos do tenant",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/get-all-transactions",
          label: "Obter todas as transações de créditos de todos os tenants",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/grant-credits",
          label: "Conceder créditos manualmente a um usuário",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/refund-my-credits",
          label: "Usuário solicita reembolso próprio (prazo de 7 dias)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/refund-credits",
          label: "Reembolsar créditos (interno ou Stripe)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/refund-key-purchase",
          label: "Reembolsar compra de chave",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "marketplace",
      link: {
        type: "doc",
        id: "api/admin-backend/marketplace",
      },
      items: [
        {
          type: "doc",
          id: "api/admin-backend/list-active",
          label: "Listar anúncios ativos no marketplace P2P",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/my-listings",
          label: "Listar meus anúncios",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/create-listing",
          label: "Criar anúncio de venda de chave",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/buy-listing",
          label: "Comprar chave de outro usuário",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/cancel-listing",
          label: "Cancelar anúncio de venda",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "splits",
      link: {
        type: "doc",
        id: "api/admin-backend/splits",
      },
      items: [
        {
          type: "doc",
          id: "api/admin-backend/get-my-splits",
          label: "Get splits for the current star user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/list-for-tenant",
          label: "List campaigns with splits for the tenant",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/platform-summary",
          label: "Get platform revenue summary (markup + royalties)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/get-by-id",
          label: "Get split details for a campaign",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/export-xlsx",
          label: "Export splits as XLSX",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "users",
      link: {
        type: "doc",
        id: "api/admin-backend/users",
      },
      items: [
        {
          type: "doc",
          id: "api/admin-backend/create",
          label: "Criar um novo usuário",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-all",
          label: "Listar usuários (filtrado por role do caller)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-one",
          label: "Obter usuário por ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/update",
          label: "Atualizar usuário por ID",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "accesses",
      link: {
        type: "doc",
        id: "api/admin-backend/accesses",
      },
      items: [
        {
          type: "doc",
          id: "api/admin-backend/create",
          label: "Criar forma de acesso para uma campanha",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-by-campaign",
          label: "Listar formas de acesso de uma campanha",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-mine",
          label: "Listar meus acessos (por campanhas que sou dono)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/update",
          label: "Atualizar forma de acesso (apenas dono da campanha)",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/admin-backend/remove",
          label: "Remover forma de acesso (apenas dono da campanha)",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "access-types",
      link: {
        type: "doc",
        id: "api/admin-backend/access-types",
      },
      items: [
        {
          type: "doc",
          id: "api/admin-backend/create",
          label: "Criar tipo de acesso",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-all",
          label: "Listar tipos de acesso",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-one",
          label: "Obter tipo de acesso por ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/update",
          label: "Atualizar tipo de acesso",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/admin-backend/remove",
          label: "Remover tipo de acesso",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "main-stars",
      link: {
        type: "doc",
        id: "api/admin-backend/main-stars",
      },
      items: [
        {
          type: "doc",
          id: "api/admin-backend/create",
          label: "Criar main star",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-all",
          label: "Listar main stars",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/find-one",
          label: "Obter main star por ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/update",
          label: "Atualizar main star",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/admin-backend/remove",
          label: "Remover main star",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "App",
      items: [
        {
          type: "doc",
          id: "api/admin-backend/get-hello",
          label: "getHello",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "health",
      items: [
        {
          type: "doc",
          id: "api/admin-backend/startup",
          label: "Startup probe - verifica se a aplicação iniciou",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/liveness",
          label: "Liveness probe - verifica se a aplicação está viva",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-backend/readiness",
          label: "Readiness probe - verifica se a aplicação está pronta para receber tráfego",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
