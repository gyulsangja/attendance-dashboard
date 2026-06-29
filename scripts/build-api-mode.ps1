param(
  [string]$BackendOrigin = "http://192.168.0.191:8080",
  [string]$Port = "3000",
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

$envContent = @"
BACKEND_API_ORIGIN=$BackendOrigin
NEXT_PUBLIC_API_BASE_URL=/backend-api
NEXT_PUBLIC_DATA_SOURCE=api
NEXT_PUBLIC_API_DEBUG=false
"@

Set-Content -Path ".env.production" -Value $envContent -Encoding UTF8
Set-Content -Path ".env.local" -Value $envContent -Encoding UTF8

Write-Host "[api-mode] env written"
Write-Host "[api-mode] backend: $BackendOrigin"
Write-Host "[api-mode] frontend port: $Port"

if (Test-Path ".next") {
  Remove-Item -Recurse -Force ".next"
  Write-Host "[api-mode] removed previous .next build"
}

if (-not $SkipInstall) {
  npm install
}

npm run build

Write-Host "[api-mode] build complete. Start with:"
Write-Host "npx next start -p $Port"
