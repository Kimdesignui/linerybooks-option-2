$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$envFile = Join-Path $PSScriptRoot '..\.env.enhanced'
if (-not (Test-Path -LiteralPath $envFile)) { throw "Không tìm thấy .env.enhanced để kiểm tra Supabase." }

$envValues = @{}
foreach ($line in Get-Content -LiteralPath $envFile) {
  if ($line -match '^([^#=]+)=(.*)$') { $envValues[$Matches[1].Trim()] = $Matches[2].Trim() }
}
$url = $envValues['VITE_SUPABASE_URL']
$key = $envValues['VITE_SUPABASE_ANON_KEY']
if (-not $url -or -not $key) { throw 'Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY.' }

$headers = @{ apikey = $key; Authorization = "Bearer $key" }
$tableNames = @(
  'books', 'book_images', 'creators', 'creator_images', 'creator_roles', 'book_creators',
  'taxonomy_terms', 'book_taxonomy_terms', 'homepage_modules', 'book_homepage_modules',
  'news_posts', 'news_post_blocks', 'site_menus', 'site_menu_items', 'site_media_assets',
  'site_banners', 'payment_methods', 'carts', 'cart_items', 'orders', 'order_items',
  'order_payments', 'order_status_history', 'inventory_transactions', 'promotions',
  'store_locations', 'delivery_zones', 'chatbot_quick_prompts', 'book_import_batches'
)

$results = foreach ($table in $tableNames) {
  $status = 0
  $detail = ''
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "$url/rest/v1/${table}?select=*&limit=1" -Headers $headers
    $status = [int]$response.StatusCode
  } catch {
    $caught = $_
    $status = [int]$caught.Exception.Response.StatusCode.value__
    $rawDetail = $caught.ErrorDetails.Message
    if ($rawDetail) {
      try { $detail = ($rawDetail | ConvertFrom-Json).message } catch { $detail = $rawDetail }
    }
    if (-not $detail) { $detail = $caught.Exception.Message }
  }
  [pscustomobject]@{ Resource = "table:$table"; Http = $status; Status = if ($status -eq 200) { 'AVAILABLE' } else { 'MISSING_OR_BLOCKED' }; Detail = $detail }
}

$rpcBodies = [ordered]@{
  is_admin = @{}
  admin_assign_homepage_module_books = @{ p_limit = 24 }
  create_order_from_cart = @{
    p_fulfillment_method = 'pickup'
    p_payment_method = 'verification'
    p_shipping_address = @{}
    p_delivery_notes = ''
    p_guest_email = $null
    p_promotion_code = $null
  }
  admin_set_order_status = @{
    p_order_id = '00000000-0000-0000-0000-000000000000'
    p_status = 'pending'
    p_payment_status = $null
    p_note = 'verification-only'
  }
  admin_list_customers = @{}
}
$rpcNames = @($rpcBodies.Keys)
$rpcResults = foreach ($rpc in $rpcNames) {
  $status = 0
  $detail = ''
  try {
    $body = $rpcBodies[$rpc] | ConvertTo-Json -Depth 10 -Compress
    $response = Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$url/rest/v1/rpc/$rpc" -Headers $headers -ContentType 'application/json' -Body $body
    $status = [int]$response.StatusCode
  } catch {
    $caught = $_
    $status = [int]$caught.Exception.Response.StatusCode.value__
    $rawDetail = $caught.ErrorDetails.Message
    if ($rawDetail) {
      try { $detail = ($rawDetail | ConvertFrom-Json).message } catch { $detail = $rawDetail }
    }
    if (-not $detail) { $detail = $caught.Exception.Message }
  }
  [pscustomobject]@{ Resource = "rpc:$rpc"; Http = $status; Status = if ($status -eq 404) { 'MISSING' } else { 'EXISTS_OR_AUTH_REQUIRED' }; Detail = $detail }
}

($results + $rpcResults) | Format-Table -AutoSize
$missingTables = @($results | Where-Object { $_.Http -eq 404 })
$missingRpcs = @($rpcResults | Where-Object { $_.Http -eq 404 })
if ($missingTables.Count -gt 0 -or $missingRpcs.Count -gt 0) {
  Write-Error ("Backend chưa đủ trên Supabase. Thiếu bảng: {0}; thiếu RPC: {1}." -f (($missingTables.Resource -join ', ') -replace 'table:', ''), (($missingRpcs.Resource -join ', ') -replace 'rpc:', ''))
  exit 1
}

$creatorImageResponse = Invoke-WebRequest -UseBasicParsing -Uri "$url/rest/v1/creator_images?select=storage_path&limit=1000" -Headers $headers
$creatorImageRows = ConvertFrom-Json -InputObject $creatorImageResponse.Content
$creatorImageRows = @($creatorImageRows)
$externalCreatorImages = @($creatorImageRows | Where-Object { $_.storage_path -match '^https?://' })
[pscustomobject]@{
  Resource = 'image-path-audit:creator_images'
  Http = 200
  Status = if ($externalCreatorImages.Count -eq 0) { 'HOSTED_PATHS_ONLY' } else { 'EXTERNAL_URLS_FOUND' }
  Detail = "rows=$($creatorImageRows.Count); external=$($externalCreatorImages.Count)"
} | Format-Table -AutoSize
if ($externalCreatorImages.Count -gt 0) {
  Write-Error "creator_images vẫn còn URL ảnh bên ngoài; ảnh phải được host nội bộ trước khi deploy."
  exit 1
}
