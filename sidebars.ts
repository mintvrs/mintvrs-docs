import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

import path from 'path';

// Load plugin-generated sidebars.
// The generated sidebar.ts does `export default sidebar.apisidebar` — an array.
function loadApiSidebar(relPath: string): unknown[] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const m = require(path.resolve(__dirname, relPath));
  const data = m.default ?? m;
  // data may already be the array, or an object with .apisidebar
  return Array.isArray(data) ? data : (data.apisidebar ?? []);
}

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Visão Geral',
    },
    {
      type: 'category',
      label: 'Arquitetura',
      collapsed: false,
      items: [
        'arquitetura/visao-geral',
        'arquitetura/entidades',
        'arquitetura/multi-tenancy',
        'arquitetura/blockchain',
      ],
    },
    {
      type: 'category',
      label: 'Autenticação',
      collapsed: false,
      items: [
        'autenticacao/overview',
        'autenticacao/jwt-bearer',
        'autenticacao/api-keys',
        'autenticacao/roles',
      ],
    },
    {
      type: 'category',
      label: 'Guias',
      collapsed: false,
      items: [
        'guias/primeiros-passos',
        'guias/criar-tenant',
        'guias/configurar-pagamento',
        'guias/criar-campanha',
        'guias/marketplace-p2p',
        'guias/blockchain',
      ],
    },
    {
      type: 'category',
      label: 'Ambiente & Deploy',
      collapsed: true,
      items: [
        'ambiente/setup-local',
        'ambiente/variaveis',
        'ambiente/deploy',
      ],
    },
  ],

  // Use plugin-generated sidebars so tag pages are properly linked as category indices
  apiAdminSidebar: loadApiSidebar('./docs/api/admin-backend/sidebar'),
  apiAuthSidebar: loadApiSidebar('./docs/api/auth-service/sidebar'),
};

export default sidebars;
