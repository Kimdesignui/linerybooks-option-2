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
  'site_banners', 'site_settings', 'payment_methods', 'carts', 'cart_items', 'orders', 'order_items',
  'order_payments', 'order_status_history', 'inventory_transactions', 'promotions',
  'store_locations', 'delivery_zones', 'chatbot_quick_prompts', 'book_import_batches',
  'site_banner_positions',
  'admin_users', 'admin_roles', 'admin_permissions', 'admin_role_permissions', 'admin_notifications'
)

$results = foreach ($table in $tableNames) {
  $status = 0
  $detail = ''
  try {
    $response = Invoke-WebRequest -UseBasicParsing -TimeoutSec 10 -Uri "$url/rest/v1/${table}?select=*&limit=1" -Headers $headers
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
  [pscustomobject]@{ Resource = "table:$table"; Http = $status; Status = if ($status -eq 200) { 'AVAILABLE' } elseif ($status -eq 404) { 'MISSING' } else { 'EXISTS_OR_AUTH_REQUIRED' }; Detail = $detail }
}

$columnChecks = @(
  @{ Table = 'books'; Columns = 'sample_pdf_storage_path,sample_pdf_page_count,sample_pdf_enabled,sample_file_type' },
  @{ Table = 'creators'; Columns = 'academic_title' }
)
$columnResults = foreach ($check in $columnChecks) {
  $status = 0
  $detail = ''
  try {
    $response = Invoke-WebRequest -UseBasicParsing -TimeoutSec 10 -Uri "$url/rest/v1/$($check.Table)?select=$($check.Columns)&limit=1" -Headers $headers
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
  [pscustomobject]@{
    Resource = "columns:$($check.Table)[$($check.Columns)]"
    Http = $status
    Status = if ($status -eq 200) { 'AVAILABLE' } elseif ($status -eq 400 -or $status -eq 404) { 'MISSING' } else { 'EXISTS_OR_AUTH_REQUIRED' }
    Detail = if ($status -eq 200) { $check.Columns } else { $detail }
  }
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
  admin_list_admin_users = @{}
  admin_get_my_access = @{}
  admin_list_admin_roles = @{}
  admin_list_role_permissions = @{}
  admin_grant_admin = @{ p_email = 'verification-only@example.invalid'; p_role = 'editor' }
  admin_set_admin_role = @{ p_user_id = '00000000-0000-0000-0000-000000000000'; p_role = 'editor' }
  admin_revoke_admin = @{ p_user_id = '00000000-0000-0000-0000-000000000000' }
}
$rpcNames = @($rpcBodies.Keys)
$rpcResults = foreach ($rpc in $rpcNames) {
  $status = 0
  $detail = ''
  try {
    $body = $rpcBodies[$rpc] | ConvertTo-Json -Depth 10 -Compress
    $response = Invoke-WebRequest -UseBasicParsing -TimeoutSec 10 -Method Post -Uri "$url/rest/v1/rpc/$rpc" -Headers $headers -ContentType 'application/json' -Body $body
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

($results + $columnResults + $rpcResults) | Format-Table -AutoSize
$missingTables = @($results | Where-Object { $_.Http -eq 404 })
$missingColumns = @($columnResults | Where-Object { $_.Http -eq 400 -or $_.Http -eq 404 })
$missingRpcs = @($rpcResults | Where-Object { $_.Http -eq 404 })
if ($missingTables.Count -gt 0 -or $missingColumns.Count -gt 0 -or $missingRpcs.Count -gt 0) {
  Write-Error ("Backend chưa đủ trên Supabase. Thiếu bảng: {0}; thiếu cột: {1}; thiếu RPC: {2}." -f (($missingTables.Resource -join ', ') -replace 'table:', ''), (($missingColumns.Resource -join ', ') -replace 'columns:', ''), (($missingRpcs.Resource -join ', ') -replace 'rpc:', ''))
  exit 1
}

$creatorImageResponse = Invoke-WebRequest -UseBasicParsing -TimeoutSec 10 -Uri "$url/rest/v1/creator_images?select=storage_path&limit=1000" -Headers $headers
$creatorImageRows = ConvertFrom-Json -InputObject $creatorImageResponse.Content
$creatorImageRows = @($creatorImageRows)
$externalCreatorImages = @($creatorImageRows | Where-Object { $_.storage_path -match '^https?://' })
$localAssetCreatorImages = @($creatorImageRows | Where-Object { $_.storage_path -match '^/assets/' -or $_.storage_path -match '^/media/assets/' })
[pscustomobject]@{
  Resource = 'image-path-audit:creator_images'
  Http = 200
  Status = if ($externalCreatorImages.Count -gt 0) { 'EXTERNAL_URLS_FOUND' } elseif ($localAssetCreatorImages.Count -gt 0) { 'LOCAL_ASSET_PATHS_FOUND' } else { 'SUPABASE_OR_RELATIVE_PATHS_ONLY' }
  Detail = "rows=$($creatorImageRows.Count); local_assets=$($localAssetCreatorImages.Count); external=$($externalCreatorImages.Count)"
} | Format-Table -AutoSize
if ($externalCreatorImages.Count -gt 0) {
  Write-Error "creator_images vẫn còn URL ảnh bên ngoài; ảnh phải được host nội bộ trước khi deploy."
  exit 1
}

$configurationChecks = @(
  @{ Resource = 'site_media_assets'; Filter = 'asset_type=in.(banner,logo,favicon)' },
  @{ Resource = 'site_banners'; Filter = 'position_code=eq.HOME_HERO&status=eq.published' },
  @{ Resource = 'site_settings'; Filter = 'setting_key=in.(site_name,site_logo,site_favicon)&is_public=eq.true' }
)
$configurationResults = foreach ($check in $configurationChecks) {
  $response = Invoke-WebRequest -UseBasicParsing -TimeoutSec 10 -Uri "$url/rest/v1/$($check.Resource)?select=id&$($check.Filter)" -Headers $headers
  $json = $response.Content.Trim()
  $rowCount = if ($json -eq '[]' -or [string]::IsNullOrWhiteSpace($json)) { 0 } else { @((ConvertFrom-Json -InputObject $json)).Count }
  [pscustomobject]@{
    Resource = "content:$($check.Resource)"
    Http = [int]$response.StatusCode
    Status = if ($rowCount -gt 0) { 'SEEDED' } else { 'EMPTY' }
    Detail = "rows=$rowCount"
  }
}
$configurationResults | Format-Table -AutoSize
if (@($configurationResults | Where-Object { $_.Status -eq 'EMPTY' }).Count -gt 0) {
  Write-Error -Message 'Backend schema exists but public site configuration is empty; apply the site configuration seed migration before deployment.'
  exit 1
}
