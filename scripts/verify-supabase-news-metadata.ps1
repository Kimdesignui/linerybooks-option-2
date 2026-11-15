param()

$ErrorActionPreference = 'Stop'
$envPath = Join-Path $PSScriptRoot '..\.env.enhanced'
$envLines = Get-Content $envPath
$supabaseUrl = ($envLines | Where-Object { $_ -match '^VITE_SUPABASE_URL=' }) -replace '^VITE_SUPABASE_URL=', ''
$anonKey = ($envLines | Where-Object { $_ -match '^VITE_SUPABASE_ANON_KEY=' }) -replace '^VITE_SUPABASE_ANON_KEY=', ''
$headers = @{ apikey = $anonKey; Authorization = "Bearer $anonKey" }

function Test-RestResource([string]$label, [string]$path) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "$supabaseUrl/rest/v1/$path" -Headers $headers
    [pscustomobject]@{ Resource = $label; Status = $response.StatusCode; Detail = 'AVAILABLE' }
  } catch {
    $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
    [pscustomobject]@{ Resource = $label; Status = $status; Detail = 'PENDING_MIGRATION' }
  }
}

$checks = @(
  (Test-RestResource 'news_posts metadata columns' 'news_posts?select=id,seo_title_en,seo_title_vi,seo_description_en,seo_description_vi,seo_keywords,category_slugs,is_featured,show_on_homepage,display_format&limit=1'),
  (Test-RestResource 'news_post_history' 'news_post_history?select=id,news_post_id,action,performed_by,snapshot,created_at&limit=1')
)
$checks | Format-Table -AutoSize
if ($checks.Detail -contains 'PENDING_MIGRATION') { exit 1 }
