#!/bin/bash
# Campañas con IA · Joako Estratega
# Instala Claude Code, VS Code con la extensión de Claude, los skills de campañas
# y la conexión oficial de Meta. Al final abre VS Code en la carpeta mis-anuncios.
BASE="https://joakoestratega.com/campanas-ia"
APP="/Applications/Visual Studio Code.app"
CODE="$APP/Contents/Resources/app/bin/code"

echo ""
echo "== Campañas con IA · Joako Estratega =="
echo "Esto tarda unos minutos. No cierres esta ventana."
echo ""

# 1. Claude Code
echo "1/5 Claude Code..."
if ! command -v claude >/dev/null 2>&1; then
  curl -fsSL https://claude.ai/install.sh | bash
  export PATH="$HOME/.local/bin:$PATH"
else
  echo "   ya estaba"
fi
CLAUDE="$(command -v claude || echo "$HOME/.local/bin/claude")"

# 2. VS Code
echo "2/5 VS Code..."
if [ ! -d "$APP" ]; then
  TMP="$(mktemp -d)"
  curl -fsSL "https://code.visualstudio.com/sha/download?build=stable&os=darwin-universal" -o "$TMP/vscode.zip"
  unzip -q "$TMP/vscode.zip" -d "$TMP"
  mv "$TMP/Visual Studio Code.app" /Applications/ 2>/dev/null || mv "$TMP/Visual Studio Code.app" "$HOME/Applications/"
  [ -d "$APP" ] || { APP="$HOME/Applications/Visual Studio Code.app"; CODE="$APP/Contents/Resources/app/bin/code"; }
  rm -rf "$TMP"
else
  echo "   ya estaba"
fi

# 3. Extensión de Claude para VS Code
echo "3/5 Claude dentro de VS Code..."
"$CODE" --install-extension anthropic.claude-code --force >/dev/null 2>&1 || true

# 4. Skills de campañas
echo "4/5 Herramientas de campañas..."
TMP="$(mktemp -d)"
curl -fsSL "$BASE/skills.zip" -o "$TMP/skills.zip"
mkdir -p "$HOME/.claude/skills"
unzip -oq "$TMP/skills.zip" -d "$HOME/.claude/skills"
rm -rf "$TMP"

# 5. Conexión oficial de Meta (si ya estaba, Claude avisa y no pasa nada)
echo "5/5 Conexión con Meta..."
"$CLAUDE" mcp add --scope user --transport http meta-ads https://mcp.facebook.com/ads >/dev/null 2>&1 || true

# Carpeta de trabajo y VS Code abierto en ella
mkdir -p "$HOME/Desktop/mis-anuncios"

echo ""
echo "LISTO."
echo "Se creó la carpeta mis-anuncios en tu escritorio y se va a abrir VS Code en ella."
echo "Sigue la guía en joakoestratega.com/campanas-ia"
echo ""
open -a "$APP" "$HOME/Desktop/mis-anuncios" 2>/dev/null || "$CODE" "$HOME/Desktop/mis-anuncios"
