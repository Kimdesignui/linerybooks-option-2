param()

$ErrorActionPreference = 'Stop'
$envPath = Join-Path $PSScriptRoot '..\.env.enhanced'
$envLines = Get-Content $envPath
$supabaseUrl = ($envLines | Where-Object { $_ -match '^VITE_SUPABASE_URL=' }) -replace '^VITE_SUPABASE_URL=', ''
$anonKey = ($envLines | Where-Object { $_ -match '^VITE_SUPABASE_ANON_KEY=' }) -replace '^VITE_SUPABASE_ANON_KEY=', ''
$headers = @{ apikey = $anonKey; Authorization = "Bearer $anonKey" }

function Get-Rows([string]$resource, [string]$select) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "$supabaseUrl/rest/v1/${resource}?select=${select}&limit=1000" -Headers $headers
    return @(ConvertFrom-Json -InputObject $response.Content)
  } catch {
    Write-Warning "Không đọc được ${resource}: $($_.Exception.Message)"
    return @()
  }
}

function Test-HostedPath([object]$value) {
  $path = [string]$value
  if ([string]::IsNullOrWhiteSpace($path) -or $path -eq 'N/A') { return $true }
  return -not ($path -match '^https?://' -and $path -notmatch '\.supabase\.co/')
}

$sources = @(
  @{ Name = 'books.cover_storage_path'; Rows = Get-Rows 'books' 'cover_storage_path'; Field = 'cover_storage_path' },
  @{ Name = 'book_images.storage_path'; Rows = Get-Rows 'book_images' 'storage_path'; Field = 'storage_path' },
  @{ Name = 'creator_images.storage_path'; Rows = Get-Rows 'creator_images' 'storage_path'; Field = 'storage_path' },
  @{ Name = 'news_posts.image_storage_path'; Rows = Get-Rows 'news_posts' 'image_storage_path'; Field = 'image_storage_path' },
  @{ Name = 'news_post_blocks.image_storage_path'; Rows = Get-Rows 'news_post_blocks' 'image_storage_path'; Field = 'image_storage_path' },
  @{ Name = 'site_media_assets.public_url'; Rows = Get-Rows 'site_media_assets' 'public_url'; Field = 'public_url' }
)

$results = foreach ($source in $sources) {
  $values = @($source.Rows | ForEach-Object { $_ | Select-Object -ExpandProperty $source.Field } | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) })
  $external = @($values | Where-Object { -not (Test-HostedPath $_) })
  [pscustomobject]@{ Source = $source.Name; Rows = $values.Count; External = $external.Count; Status = if ($external.Count -eq 0) { 'PASS' } else { 'FAIL' } }
}
$results | Format-Table -AutoSize
if (@($results | Where-Object Status -eq 'FAIL').Count -gt 0) { exit 1 }
