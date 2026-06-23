import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type * as OpenApiPlugin from 'docusaurus-plugin-openapi-docs';

const config: Config = {
  title: 'MKClub Docs',
  tagline: 'Documentação da Plataforma de Crowdfunding com NFTs',

  url: 'https://docs.mintvrs.com',
  baseUrl: '/',

  // Serve os specs OpenAPI crus na raiz do site (além do diretório `static` padrão):
  //   /admin-backend.json  e  /auth-service.json
  // Permite baixar o contrato inteiro da API em 1 request (mais barato em tokens
  // que crawlear as páginas geradas endpoint por endpoint).
  staticDirectories: ['static', 'specs'],

  onBrokenLinks: 'warn',
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt'],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: [
    'docusaurus-theme-openapi-docs',
    '@docusaurus/theme-mermaid',
  ],

  plugins: [
    // Webpack fallbacks for Node.js built-ins used by postman-code-generators
    function webpackNodeFallbacks() {
      return {
        name: 'webpack-node-fallbacks',
        configureWebpack() {
          return {
            resolve: {
              fallback: {
                path: false,
                fs: false,
                stream: false,
                os: false,
                util: false,
                zlib: false,
                http: false,
                https: false,
                url: false,
                assert: false,
                crypto: false,
                buffer: false,
                'process/browser': false,
              },
            },
          };
        },
      };
    },
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'openapi',
        docsPluginId: 'classic',
        config: {
          adminBackend: {
            specPath: 'specs/admin-backend.json',
            outputDir: 'docs/api/admin-backend',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          } satisfies OpenApiPlugin.Options,
          authService: {
            specPath: 'specs/auth-service.json',
            outputDir: 'docs/api/auth-service',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          } satisfies OpenApiPlugin.Options,
        },
      } satisfies OpenApiPlugin.PluginOptions,
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          docItemComponent: '@theme/ApiItem',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'MKClub',
      logo: {
        alt: 'MKClub Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentação',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiAdminSidebar',
          position: 'left',
          label: 'API Admin',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiAuthSidebar',
          position: 'left',
          label: 'API Auth',
        },
        {
          href: 'https://admin-api.homolog.mintvrs.com/api-docs',
          label: 'Swagger Admin (Homolog)',
          position: 'right',
        },
        {
          href: 'https://auth.homolog.mintvrs.com/docs-auth-service',
          label: 'Swagger Auth (Homolog)',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentação',
          items: [
            { label: 'Visão Geral', to: '/' },
            { label: 'Arquitetura', to: '/arquitetura/visao-geral' },
            { label: 'Autenticação', to: '/autenticacao/overview' },
            { label: 'Primeiros Passos', to: '/guias/primeiros-passos' },
          ],
        },
        {
          title: 'API Reference',
          items: [
            { label: 'Admin Backend API', to: '/api/admin-backend' },
            { label: 'Auth Service API', to: '/api/auth-service' },
          ],
        },
        {
          title: 'Swagger UIs',
          items: [
            { label: 'Admin Backend (Homolog)', href: 'https://admin-api.homolog.mintvrs.com/api-docs' },
            { label: 'Auth Service (Homolog)', href: 'https://auth.homolog.mintvrs.com/docs-auth-service' },
            { label: 'Admin Backend (OpenAPI JSON)', href: 'pathname:///admin-backend.json' },
            { label: 'Auth Service (OpenAPI JSON)', href: 'pathname:///auth-service.json' },
          ],
        },
        {
          title: 'Ambiente',
          items: [
            { label: 'Setup Local', to: '/ambiente/setup-local' },
            { label: 'Variáveis de Ambiente', to: '/ambiente/variaveis' },
            { label: 'Deploy em Produção', to: '/ambiente/deploy' },
          ],
        },
        {
          title: 'Infra',
          items: [
            { label: 'Visão Geral (Infra)', to: '/infra/overview' },
            { label: 'Migrations', to: '/infra/migrations' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} MKClub · My Keys Club. Documentação gerada com Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'javascript'],
    },
    languageTabs: [
      {
        highlight: 'bash',
        language: 'curl',
        logoClass: 'bash',
      },
      {
        highlight: 'javascript',
        language: 'nodejs',
        logoClass: 'nodejs',
        variant: 'axios',
      },
      {
        highlight: 'python',
        language: 'python',
        logoClass: 'python',
        variant: 'requests',
      },
    ],
  } satisfies Preset.ThemeConfig,
};

export default config;
