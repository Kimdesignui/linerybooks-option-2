param(
  [string]$ProjectRef = ''
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $ProjectRef) {
  $envPath = Join-Path $projectRoot '.env.enhanced'
  if (Test-Path -LiteralPath $envPath) {
    $supabaseUrl = ((Get-Content -LiteralPath $envPath) | Where-Object { $_ -match '^VITE_SUPABASE_URL=' }) -replace '^VITE_SUPABASE_URL=', ''
    if ($supabaseUrl -match '^https?://([^.]+)\.supabase\.co') { $ProjectRef = $Matches[1] }
  }
}
if (-not $ProjectRef) { throw 'Cannot determine the Supabase project ref. Pass -ProjectRef or configure VITE_SUPABASE_URL in .env.enhanced.' }
if (-not $env:SUPABASE_ACCESS_TOKEN) { throw 'SUPABASE_ACCESS_TOKEN is missing. Run npx supabase login before deploying.' }

Push-Location $projectRoot
try {
  npx supabase functions deploy admin-create-user --project-ref $ProjectRef
  if ($LASTEXITCODE -ne 0) { throw "Edge Function deployment failed with exit code $LASTEXITCODE." }
} finally {
  Pop-Location
}
