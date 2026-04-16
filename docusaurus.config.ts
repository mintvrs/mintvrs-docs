import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type * as OpenApiPlugin from 'docusaurus-plugin-openapi-docs';

const config: Config = {
  title: 'MKClub Docs',
  tagline: 'Documentação da Plataforma de Crowdfunding com NFTs',
  favicon: 'img/favicon.ico',

  url: 'https://docs.mintvrs.com',
  baseUrl: '/',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'pt',
    locales: ['pt'],
  },

  markdown: {
    mermaid: true,
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
    image: 'img/mkclub-social.png',
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
          href: 'https://api.mintvrs.com/api-docs',
          label: 'Swagger Admin',
          position: 'right',
        },
        {
          href: 'https://auth.mintvrs.com/docs-auth-service',
          label: 'Swagger Auth',
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
            { label: 'Admin Backend', href: 'https://api.mintvrs.com/api-docs' },
            { label: 'Auth Service', href: 'https://auth.mintvrs.com/docs-auth-service' },
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
