# =============================================================================
# CRM Architecte - Windows deploy helper
# Builds the frontend locally, packages the backend + built frontend, uploads
# them to the VPS and runs the server-side install/update routine.
#
#   .\deploy.ps1 -Server root@yourdomain.com -AppDir /var/www/crm
#
# Requires the Windows OpenSSH client (scp + ssh built into Win10/11).
# =============================================================================
param(
    [Parameter(Mandatory = $true)]
    [string]$Server,          # e.g. root@yourdomain.com
    [Parameter(Mandatory = $false)]
    [string]$AppDir = "/var/www/crm",
    [switch]$SkipBuild
)

$root  = Split-Path -Parent $PSScriptRoot
$front = Join-Path $root "Frontend"
$back  = Join-Path $root "Backend"

if (-not $SkipBuild) {
    Write-Host ">> Building frontend..." -ForegroundColor Cyan
    Push-Location $front
    npm install
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
    Pop-Location
}

# --- Package code into a tarball -------------------------------------------
$stage = Join-Path $env:TEMP "crm-deploy-stage"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path (Join-Path $stage "backend") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stage "frontend") -Force | Out-Null

robocopy $back (Join-Path $stage "backend") /E `
    /XD vendor node_modules .git storage/logs storage/framework/cache/data /XF .env .env.example `
    /NFL /NDL /NJH /NJS /NP | Out-Null

robocopy (Join-Path $front "build") (Join-Path $stage "frontend") /E `
    /NFL /NDL /NJH /NJS /NP | Out-Null

$tar = Join-Path $env:TEMP "crm-deploy.tar.gz"
if (Test-Path $tar) { Remove-Item $tar -Force }
Push-Location $stage
tar -czf $tar backend frontend
Pop-Location
if ($LASTEXITCODE -ne 0) { throw "Packaging failed" }

# --- Write the remote update script as a file -------------------------------
$remoteScriptPath = Join-Path $env:TEMP "crm-update.sh"
@'
#!/usr/bin/env bash
set -eu
APP_DIR="$1"
cd /tmp
rm -rf /tmp/crm-deploy
tar -xzf crm-deploy.tar.gz -C /tmp
mkdir -p /tmp/crm-deploy
mv /tmp/backend /tmp/frontend /tmp/crm-deploy/

rsync -a --delete /tmp/crm-deploy/backend/ "$APP_DIR/"
mkdir -p "$APP_DIR/html"
rsync -a --delete /tmp/crm-deploy/frontend/ "$APP_DIR/html/"

cd "$APP_DIR"
composer install --no-dev --optimize-autoloader --no-interaction
chown -R www-data:www-data storage bootstrap/cache html
php artisan migrate --force --no-interaction || true
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link || true
nginx -t && systemctl reload nginx
echo "DEPLOY OK"
'@ | Set-Content -Path $remoteScriptPath -Encoding UTF8

# --- Upload bundle + script -------------------------------------------------
Write-Host ">> Uploading to $Server ..." -ForegroundColor Cyan
scp $tar "${Server}:/tmp/crm-deploy.tar.gz"
if ($LASTEXITCODE -ne 0) { throw "Upload failed" }
scp $remoteScriptPath "${Server}:/tmp/crm-update.sh"
if ($LASTEXITCODE -ne 0) { throw "Upload failed" }

# --- Run remote update ------------------------------------------------------
Write-Host ">> Installing on the server..." -ForegroundColor Cyan
ssh $Server "bash /tmp/crm-update.sh $AppDir"
if ($LASTEXITCODE -ne 0) { throw "Server-side install failed" }

Write-Host ">> Done. Test your site." -ForegroundColor Green