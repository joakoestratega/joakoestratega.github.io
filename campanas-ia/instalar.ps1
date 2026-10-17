# Campanas con IA - Joako Estratega
# Instala Claude Code (si falta), los skills de campanas y la conexion oficial de Meta.
$ErrorActionPreference = 'Stop'
$base = 'https://joakoestratega.com/campanas-ia'

Write-Host ''
Write-Host '== Campanas con IA - Joako Estratega ==' -ForegroundColor Yellow

# 1. Claude Code
$claude = Get-Command claude -ErrorAction SilentlyContinue
if (-not $claude) {
    Write-Host '1/3 Instalando Claude Code...'
    Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression
    $env:Path = "$HOME\.local\bin;$env:Path"
} else {
    Write-Host '1/3 Claude Code ya estaba instalado.'
}
$claudeExe = (Get-Command claude -ErrorAction SilentlyContinue).Source
if (-not $claudeExe) { $claudeExe = "$HOME\.local\bin\claude.exe" }

# 2. Skills
Write-Host '2/3 Instalando los skills de campanas...'
$tmp = Join-Path $env:TEMP 'campanas-ia.zip'
Invoke-WebRequest "$base/skills.zip" -OutFile $tmp -UseBasicParsing
$destino = Join-Path $HOME '.claude\skills'
New-Item -ItemType Directory -Force -Path $destino | Out-Null
Expand-Archive -Path $tmp -DestinationPath $destino -Force
Remove-Item $tmp

# 3. Conexion oficial de Meta
Write-Host '3/3 Conectando Meta...'
# Si ya estaba agregado, Claude avisa y no pasa nada.
$ErrorActionPreference = 'Continue'
try { & $claudeExe mcp add --scope user --transport http meta-ads https://mcp.facebook.com/ads 2>&1 | Out-Null } catch {}

Write-Host ''
Write-Host 'LISTO. Ahora:' -ForegroundColor Green
Write-Host '  1. Cierra esta ventana y abre una nueva.'
Write-Host '  2. Escribe: claude'
Write-Host '  3. Dentro de Claude escribe: /mcp  y entra con tu Facebook en meta-ads.'
Write-Host ''
