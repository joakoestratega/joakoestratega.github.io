# Campanas con IA - Joako Estratega
# Instala Git, Claude Code, VS Code con la extension de Claude, los skills de campanas
# y la conexion oficial de Meta. Al final abre VS Code en la carpeta mis-anuncios.
$ErrorActionPreference = 'Continue'
$base = 'https://joakoestratega.com/campanas-ia'

function Paso($texto) { Write-Host $texto -ForegroundColor Yellow }
function Refrescar {
    $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
                [Environment]::GetEnvironmentVariable('Path', 'User') + ";$HOME\.local\bin"
}
function TieneWinget { [bool](Get-Command winget -ErrorAction SilentlyContinue) }
function Instalar($id, $nombre) {
    if (TieneWinget) {
        winget install -e --id $id --silent --accept-package-agreements --accept-source-agreements | Out-Null
        Refrescar
    } else {
        Write-Host "   No pude instalar $nombre solo. Descargalo e instalalo, y vuelve a pegar esta orden." -ForegroundColor Red
    }
}

Write-Host ''
Write-Host '== Campanas con IA - Joako Estratega ==' -ForegroundColor Yellow
Write-Host 'Esto tarda unos minutos. No cierres esta ventana.'
Write-Host ''

# 1. Git (Claude Code lo necesita en Windows)
Paso '1/6 Git...'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Instalar 'Git.Git' 'Git (git-scm.com)' } else { Write-Host '   ya estaba' }

# 2. Claude Code
Paso '2/6 Claude Code...'
if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    try { Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression } catch {}
    Refrescar
} else { Write-Host '   ya estaba' }
$claudeExe = (Get-Command claude -ErrorAction SilentlyContinue).Source
if (-not $claudeExe) { $claudeExe = "$HOME\.local\bin\claude.exe" }

# 3. VS Code
Paso '3/6 VS Code...'
$code = (Get-Command code -ErrorAction SilentlyContinue).Source
if (-not $code) {
    $rutas = @("$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd", "$env:ProgramFiles\Microsoft VS Code\bin\code.cmd")
    $code = $rutas | Where-Object { Test-Path $_ } | Select-Object -First 1
}
if (-not $code) {
    Instalar 'Microsoft.VisualStudioCode' 'VS Code (code.visualstudio.com)'
    $code = @("$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd", "$env:ProgramFiles\Microsoft VS Code\bin\code.cmd") |
            Where-Object { Test-Path $_ } | Select-Object -First 1
} else { Write-Host '   ya estaba' }

# 4. Extension de Claude para VS Code
Paso '4/6 Claude dentro de VS Code...'
if ($code) { & $code --install-extension anthropic.claude-code --force 2>&1 | Out-Null }

# 5. Skills de campanas
Paso '5/6 Herramientas de campanas...'
$tmp = Join-Path $env:TEMP 'campanas-ia.zip'
Invoke-WebRequest "$base/skills.zip" -OutFile $tmp -UseBasicParsing
$destino = Join-Path $HOME '.claude\skills'
New-Item -ItemType Directory -Force -Path $destino | Out-Null
Expand-Archive -Path $tmp -DestinationPath $destino -Force
Remove-Item $tmp

# 6. Conexion oficial de Meta (si ya estaba, Claude avisa y no pasa nada)
Paso '6/6 Conexion con Meta...'
try { & $claudeExe mcp add --scope user --transport http meta-ads https://mcp.facebook.com/ads 2>&1 | Out-Null } catch {}

# Carpeta de trabajo y VS Code abierto en ella
$escritorio = [Environment]::GetFolderPath('Desktop')
$carpeta = Join-Path $escritorio 'mis-anuncios'
New-Item -ItemType Directory -Force -Path $carpeta | Out-Null

Write-Host ''
Write-Host 'LISTO.' -ForegroundColor Green
Write-Host "Se creo la carpeta mis-anuncios en tu escritorio y se va a abrir VS Code en ella."
Write-Host 'Sigue la guia en joakoestratega.com/campanas-ia'
Write-Host ''
if ($code) { & $code $carpeta }
