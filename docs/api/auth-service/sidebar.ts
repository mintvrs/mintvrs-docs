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
          label: "Listar usuários por role ou por tenant",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/auth-service/update-user-tenant",
          label: "Vincular tenant a um usuário (SuperAdmin ou Admin)",
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
    {
      type: "category",
      label: "onboarding",
      items: [
        {
          type: "doc",
          id: "api/auth-service/verify-identity",
          label: "Cadastro passo 1: verifica a identidade (nome + CPF + data de nascimento)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-service/register-passwordless",
          label: "Cadastro passo 2: cria a conta (e-mail + apelido) e envia o e-mail de confirmação",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-service/otp-request",
          label: "Envia e-mail com link mágico + código de 6 dígitos (login passo 1 e 'reenviar' do cadastro)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-service/otp-confirm",
          label: "Confirma o código de 6 dígitos e retorna os tokens (login passo 2 e 'verifique seu e-mail')",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-service/otp-confirm-link",
          label: "Confirma pelo link mágico do e-mail e retorna os tokens",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-service/recover-email",
          label: "Recuperar meu e-mail: localiza a conta por nome + CPF + data de nascimento",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
