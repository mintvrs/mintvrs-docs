#!/usr/bin/env bash
# publish-to-readme.sh
# Publica a documentacao MKClub no ReadMe.com via API.
#
# USO:
#   export README_API_KEY=rdme_xxxx...
#   bash docs/publish-to-readme.sh
#
# PREREQUISITOS: curl, jq, python3

set -euo pipefail

# ─── Configuração ─────────────────────────────────────────────────────────────

API_KEY="${README_API_KEY:?'Variavel README_API_KEY nao definida. Execute: export README_API_KEY=sua_chave'}"
BASE_URL="https://dash.readme.com/api/v1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CREATED=0
UPDATED=0
FAILED=0

# ─── Cores ────────────────────────────────────────────────────────────────────

if [[ -t 2 ]]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'
  YELLOW='\033[1;33m'; BLUE='\033[0;34m'; RESET='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; RESET=''
fi

log_info()  { printf "${BLUE}[INFO]${RESET}  %s\n" "$*" >&2; }
log_ok()    { printf "${GREEN}[OK]${RESET}    %s\n" "$*" >&2; }
log_warn()  { printf "${YELLOW}[WARN]${RESET}  %s\n" "$*" >&2; }
log_error() { printf "${RED}[ERR]${RESET}   %s\n" "$*" >&2; }

# ─── Pré-requisitos ───────────────────────────────────────────────────────────

for cmd in curl jq python3; do
  if ! command -v "$cmd" &>/dev/null; then
    log_error "Comando necessario nao encontrado: $cmd"
    exit 1
  fi
done

# ─── Processamento de Markdown ────────────────────────────────────────────────

# Remove frontmatter Docusaurus (--- ... ---) e converte admonitions para
# blockquotes ReadMe. Funciona igualmente em READMEs sem frontmatter.
process_md() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    log_error "Arquivo nao encontrado: $file"
    return 1
  fi

  python3 - "$file" <<'PYEOF'
import sys, re

content = open(sys.argv[1], encoding='utf-8').read()

# Remove frontmatter Docusaurus (--- ... ---)
if content.startswith('---\n'):
    try:
        end = content.index('\n---', 3)
        content = content[end + 4:].lstrip('\n')
    except ValueError:
        pass

# Converte admonitions Docusaurus para blockquotes ReadMe
# :::warning Titulo\nConteudo\n::: -> > **Aviso**: Titulo\n>\n> Conteudo
labels = {
    'warning': 'Aviso',
    'danger':  'Perigo',
    'info':    'Info',
    'note':    'Nota',
    'tip':     'Dica',
    'caution': 'Atencao',
}

def replace_admonition(m):
    kind  = m.group(1)
    title = (m.group(2) or '').strip()
    body  = m.group(3).strip()
    label = labels.get(kind, kind.capitalize())
    header = '> **' + label + '**'
    if title:
        header += ': ' + title
    lines = ['>' + (' ' + ln if ln.strip() else '') for ln in body.split('\n')]
    return header + '\n>\n' + '\n'.join(lines)

content = re.sub(
    r':::(\w+)(?:\s+([^\n]*))?\n(.*?):::',
    replace_admonition,
    content,
    flags=re.DOTALL,
)

sys.stdout.write(content)
PYEOF
}

# ─── Helpers de API ───────────────────────────────────────────────────────────

# Cria categoria se nao existir. Retorna o slug via stdout.
get_or_create_category() {
  local title="$1"

  # Lista categorias existentes
  local existing
  existing=$(curl -s \
    -u "${API_KEY}:" \
    -H "Accept: application/json" \
    "${BASE_URL}/categories?perPage=100")

  # Busca por titulo (case-insensitive)
  local found_slug
  found_slug=$(echo "$existing" | jq -r \
    --arg t "$title" \
    '.[] | select(.title | ascii_downcase == ($t | ascii_downcase)) | .slug' \
    2>/dev/null | head -1)

  if [[ -n "$found_slug" && "$found_slug" != "null" ]]; then
    log_info "  Categoria ja existe: $title  (slug: $found_slug)"
    echo "$found_slug"
    return 0
  fi

  # Cria categoria nova
  local payload response slug
  payload=$(jq -n --arg title "$title" '{title: $title, type: "guide"}')
  response=$(curl -s \
    -X POST \
    -u "${API_KEY}:" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    "${BASE_URL}/categories" \
    -d "$payload")

  slug=$(echo "$response" | jq -r '.slug // empty')

  if [[ -z "$slug" ]]; then
    log_error "  Falha ao criar categoria '$title': $response"
    return 1
  fi

  log_ok "  Categoria criada: $title  (slug: $slug)"
  echo "$slug"
}

# Cria ou atualiza um doc (upsert idempotente).
# Args: slug title file cat_slug order [parent_doc_slug]
upsert_doc() {
  local slug="$1"
  local title="$2"
  local file="$3"
  local cat_slug="$4"
  local order="$5"
  local parent_slug="${6:-}"

  # Processa conteudo markdown
  local body_content
  if ! body_content=$(process_md "$file"); then
    log_error "  Erro ao processar: $file"
    (( FAILED++ )) || true
    return
  fi

  if [[ -z "${body_content// /}" ]]; then
    log_warn "  Conteudo vazio: $slug — ignorando"
    (( FAILED++ )) || true
    return
  fi

  # Monta payload JSON (jq cuida do encoding de backticks, aspas, newlines)
  local payload
  if [[ -n "$parent_slug" ]]; then
    payload=$(jq -n \
      --arg   title         "$title" \
      --arg   body          "$body_content" \
      --arg   categorySlug  "$cat_slug" \
      --argjson order       "$order" \
      --arg   parentDocSlug "$parent_slug" \
      '{
        title:         $title,
        body:          $body,
        categorySlug:  $categorySlug,
        order:         $order,
        parentDocSlug: $parentDocSlug,
        type:          "basic",
        hidden:        false
      }')
  else
    payload=$(jq -n \
      --arg   title        "$title" \
      --arg   body         "$body_content" \
      --arg   categorySlug "$cat_slug" \
      --argjson order      "$order" \
      '{
        title:        $title,
        body:         $body,
        categorySlug: $categorySlug,
        order:        $order,
        type:         "basic",
        hidden:       false
      }')
  fi

  # Verifica se o doc existe
  local check_code
  check_code=$(curl -s -o /dev/null -w "%{http_code}" \
    -u "${API_KEY}:" \
    "${BASE_URL}/docs/${slug}")

  if [[ "$check_code" == "200" ]]; then
    # Atualiza doc existente
    local update_code
    update_code=$(curl -s -o /dev/null -w "%{http_code}" \
      -X PUT \
      -u "${API_KEY}:" \
      -H "Content-Type: application/json" \
      "${BASE_URL}/docs/${slug}" \
      -d "$payload")

    if [[ "$update_code" == "200" ]]; then
      log_ok "  ATUALIZADO: $slug"
      (( UPDATED++ )) || true
    else
      log_error "  Falha ao atualizar $slug  (HTTP $update_code)"
      (( FAILED++ )) || true
    fi

  elif [[ "$check_code" == "404" ]]; then
    # Cria doc novo
    local create_resp create_code
    create_resp=$(curl -s -w "\n%{http_code}" \
      -X POST \
      -u "${API_KEY}:" \
      -H "Content-Type: application/json" \
      "${BASE_URL}/docs" \
      -d "$payload")
    create_code=$(echo "$create_resp" | tail -n1)

    if [[ "$create_code" == "201" ]]; then
      log_ok "  CRIADO: $slug"
      (( CREATED++ )) || true
    else
      local create_body
      create_body=$(echo "$create_resp" | sed '$d')
      log_error "  Falha ao criar $slug  (HTTP $create_code): $create_body"
      (( FAILED++ )) || true
    fi

  else
    log_error "  Resposta inesperada para $slug  (HTTP $check_code)"
    (( FAILED++ )) || true
  fi
}

# ─── Passo 1: Verificar Conexao ───────────────────────────────────────────────

log_info "Verificando conexao com ReadMe API..."

project_info=$(curl -s \
  -u "${API_KEY}:" \
  -H "Accept: application/json" \
  "${BASE_URL}/")

project_name=$(echo "$project_info" | jq -r '.name // empty' 2>/dev/null)

if [[ -z "$project_name" ]]; then
  log_error "Nao foi possivel conectar. Verifique a README_API_KEY."
  log_error "Resposta: $project_info"
  exit 1
fi

log_ok "Conectado ao projeto: $project_name"

# ─── Passo 2: Categorias ──────────────────────────────────────────────────────

log_info ""
log_info "Criando/verificando categorias..."

cat_introducao=$(get_or_create_category "Introdução")
cat_arquitetura=$(get_or_create_category "Arquitetura")
cat_autenticacao=$(get_or_create_category "Autenticação")
cat_backend=$(get_or_create_category "Admin Backend")
cat_frontend=$(get_or_create_category "Admin Frontend")
cat_blockchain=$(get_or_create_category "Blockchain")
cat_guias=$(get_or_create_category "Guias")

# Valida que todas as categorias foram criadas
for var in cat_introducao cat_arquitetura cat_autenticacao \
           cat_backend cat_frontend cat_blockchain cat_guias; do
  if [[ -z "${!var}" ]]; then
    log_error "Falha ao obter slug para: $var"
    exit 1
  fi
done

log_info ""
log_info "Slugs:"
log_info "  Introducao    -> $cat_introducao"
log_info "  Arquitetura   -> $cat_arquitetura"
log_info "  Autenticacao  -> $cat_autenticacao"
log_info "  Admin Backend -> $cat_backend"
log_info "  Admin Frontend-> $cat_frontend"
log_info "  Blockchain    -> $cat_blockchain"
log_info "  Guias         -> $cat_guias"

# ─── Passo 3: Documentos ──────────────────────────────────────────────────────

log_info ""
log_info "Publicando documentos..."

# ── Introdução ──────────────────────────────────────────────────────────────
log_info ""
log_info "[ Introducao ]"

upsert_doc \
  "visao-geral-mkclub" \
  "Visão Geral" \
  "$PROJECT_ROOT/docs/docs/intro.md" \
  "$cat_introducao" 0

upsert_doc \
  "primeiros-passos" \
  "Primeiros Passos" \
  "$PROJECT_ROOT/docs/docs/guias/primeiros-passos.md" \
  "$cat_introducao" 1

# ── Arquitetura ─────────────────────────────────────────────────────────────
log_info ""
log_info "[ Arquitetura ]"

upsert_doc \
  "arquitetura-visao-geral" \
  "Visão Geral do Sistema" \
  "$PROJECT_ROOT/docs/docs/arquitetura/visao-geral.md" \
  "$cat_arquitetura" 0

upsert_doc \
  "arquitetura-entidades" \
  "Entidades e Relacionamentos" \
  "$PROJECT_ROOT/docs/docs/arquitetura/entidades.md" \
  "$cat_arquitetura" 1

upsert_doc \
  "arquitetura-multi-tenancy" \
  "Multi-Tenancy & Roles" \
  "$PROJECT_ROOT/docs/docs/arquitetura/multi-tenancy.md" \
  "$cat_arquitetura" 2

upsert_doc \
  "arquitetura-blockchain" \
  "Blockchain — Xion" \
  "$PROJECT_ROOT/docs/docs/arquitetura/blockchain.md" \
  "$cat_arquitetura" 3

# ── Autenticação ─────────────────────────────────────────────────────────────
log_info ""
log_info "[ Autenticacao ]"

upsert_doc \
  "auth-visao-geral" \
  "Visão Geral da Autenticação" \
  "$PROJECT_ROOT/docs/docs/autenticacao/overview.md" \
  "$cat_autenticacao" 0

upsert_doc \
  "auth-jwt-bearer" \
  "JWT Bearer" \
  "$PROJECT_ROOT/docs/docs/autenticacao/jwt-bearer.md" \
  "$cat_autenticacao" 1

upsert_doc \
  "auth-api-keys" \
  "API Key + Secret (Integrações)" \
  "$PROJECT_ROOT/docs/docs/autenticacao/api-keys.md" \
  "$cat_autenticacao" 2

upsert_doc \
  "auth-oauth-google" \
  "Google OAuth" \
  "$PROJECT_ROOT/docs/docs/autenticacao/oauth-google.md" \
  "$cat_autenticacao" 3

upsert_doc \
  "auth-roles" \
  "Roles e Permissões" \
  "$PROJECT_ROOT/docs/docs/autenticacao/roles.md" \
  "$cat_autenticacao" 4

# ── Admin Backend ────────────────────────────────────────────────────────────
log_info ""
log_info "[ Admin Backend ]"

upsert_doc \
  "backend-visao-geral" \
  "Admin Backend — API" \
  "$PROJECT_ROOT/admin-backend/README.md" \
  "$cat_backend" 0

# ── Admin Frontend ───────────────────────────────────────────────────────────
log_info ""
log_info "[ Admin Frontend ]"

upsert_doc \
  "frontend-visao-geral" \
  "Admin Frontend — Visão Geral" \
  "$PROJECT_ROOT/admin-frontend/README.md" \
  "$cat_frontend" 0

upsert_doc \
  "frontend-autenticacao" \
  "Sistema de Autenticação" \
  "$PROJECT_ROOT/admin-frontend/AUTHENTICATION.md" \
  "$cat_frontend" 1

upsert_doc \
  "frontend-marketplace" \
  "Marketplace de NFTs" \
  "$PROJECT_ROOT/admin-frontend/MARKETPLACE.md" \
  "$cat_frontend" 2

# ── Blockchain ───────────────────────────────────────────────────────────────
log_info ""
log_info "[ Blockchain ]"

upsert_doc \
  "blockchain-smart-contracts" \
  "Smart Contracts — Xion" \
  "$PROJECT_ROOT/admin-backend/blockchain/README.md" \
  "$cat_blockchain" 0

# ── Guias ────────────────────────────────────────────────────────────────────
log_info ""
log_info "[ Guias ]"

upsert_doc \
  "guias-criar-tenant" \
  "Criar e Configurar um Tenant" \
  "$PROJECT_ROOT/docs/docs/guias/criar-tenant.md" \
  "$cat_guias" 0

upsert_doc \
  "guias-configurar-pagamento" \
  "Configurar Gateway de Pagamento" \
  "$PROJECT_ROOT/docs/docs/guias/configurar-pagamento.md" \
  "$cat_guias" 1

upsert_doc \
  "guias-deploy" \
  "Checklist de Deploy em Produção" \
  "$PROJECT_ROOT/acesso-db-mkclub/SERVER-CHECKLIST.md" \
  "$cat_guias" 2

# ─── Resumo ───────────────────────────────────────────────────────────────────

log_info ""
log_info "════════════════════════════════════════"
log_ok  "Publicacao concluida!"
log_info "  Documentos criados:     $CREATED"
log_info "  Documentos atualizados: $UPDATED"
if [[ $FAILED -gt 0 ]]; then
  log_warn "  Falhas:                 $FAILED"
else
  log_info "  Falhas:                 $FAILED"
fi
log_info "════════════════════════════════════════"

if [[ $FAILED -gt 0 ]]; then
  exit 1
fi
