import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api/auth-service/mkclub-auth-service",
    },
    {
      type: "category",
      label: "auth",
      link: {
        type: "doc",
        id: "api/auth-service/auth",
      },
      items: [
        {
          type: "doc",
          id: "api/auth-service/login",
          label: "Login com email e senha",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-service/google-auth",
          label: "Iniciar login com Google",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/auth-service/google-callback",
          label: "Callback OAuth Google",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/auth-service/refresh",
          label: "Renovar tokens",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-service/profile",
          label: "Perfil do usuário autenticado",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/auth-service/list-users-by-role",
          label: "Listar usuários por role (apenas Super Admin)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/auth-service/update-user-tenant",
          label: "Vincular tenant a um usuário (apenas Super Admin)",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/auth-service/register",
          label: "Registrar novo usuário",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-service/request-password-reset",
          label: "Solicitar reset de senha",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-service/reset-password",
          label: "Redefinir senha com token",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-service/create-or-update-tenant-admin",
          label: "Criar ou atualizar usuário para TenantAdmin (apenas SuperAdmin)",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "health",
      link: {
        type: "doc",
        id: "api/auth-service/health",
      },
      items: [
        {
          type: "doc",
          id: "api/auth-service/startup",
          label: "Startup probe - verifica se a aplicação iniciou",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/auth-service/liveness",
          label: "Liveness probe - verifica se a aplicação está viva",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/auth-service/readiness",
          label: "Readiness probe - verifica se a aplicação está pronta para receber tráfego",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
