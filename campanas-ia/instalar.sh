#!/bin/bash
# Campañas con IA · Joako Estratega
# Instala Claude Code (si falta), los skills de campañas y la conexión oficial de Meta.
set -e
BASE="https://joakoestratega.com/campanas-ia"

echo ""
echo "== Campañas con IA · Joako Estratega =="

# 1. Claude Code
if ! command -v claude >/dev/null 2>&1; then
  echo "1/3 Instalando Claude Code..."
  curl -fsSL https://claude.ai/install.sh | bash
  export PATH="$HOME/.local/bin:$PATH"
else
  echo "1/3 Claude Code ya estaba instalado."
fi
CLAUDE="$(command -v claude || echo "$HOME/.local/bin/claude")"

# 2. Skills
echo "2/3 Instalando los skills de campañas..."
TMP="$(mktemp -d)"
curl -fsSL "$BASE/skills.zip" -o "$TMP/skills.zip"
mkdir -p "$HOME/.claude/skills"
unzip -oq "$TMP/skills.zip" -d "$HOME/.claude/skills"
rm -rf "$TMP"

# 3. Conexión oficial de Meta
echo "3/3 Conectando Meta..."
# Si ya estaba agregado, Claude avisa y no pasa nada.
"$CLAUDE" mcp add --scope user --transport http meta-ads https://mcp.facebook.com/ads >/dev/null 2>&1 || true

echo ""
echo "LISTO. Ahora:"
echo "  1. Cierra esta ventana y abre una nueva."
echo "  2. Escribe: claude"
echo "  3. Dentro de Claude escribe: /mcp  y entra con tu Facebook en meta-ads."
echo ""
