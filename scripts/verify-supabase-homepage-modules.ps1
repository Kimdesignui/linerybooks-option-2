param(
  [int]$MinimumBooks = 24
)

$ErrorActionPreference = 'Stop'
$envFile = Join-Path $PSScriptRoot '..\.env.enhanced'
if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Không tìm thấy .env.enhanced để kiểm tra Supabase."
}

$envValues = @{}
foreach ($line in Get-Content -LiteralPath $envFile) {
  if ($line -match '^([^#=]+)=(.*)$') { $envValues[$Matches[1].Trim()] = $Matches[2].Trim() }
}
$url = $envValues['VITE_SUPABASE_URL']
$key = $envValues['VITE_SUPABASE_ANON_KEY']
if (-not $url -or -not $key) { throw 'Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY.' }

$headers = @{ apikey = $key; Authorization = "Bearer $key" }
$modules = Invoke-RestMethod -Uri "$url/rest/v1/homepage_modules?select=id,slug,name,is_active&is_active=eq.true&order=sort_order" -Headers $headers
$links = Invoke-RestMethod -Uri "$url/rest/v1/book_homepage_modules?select=module_id,book_id,sort_order,books(status,is_visible_website)&order=module_id,sort_order,book_id" -Headers $headers

$failed = $false
$report = foreach ($module in @($modules)) {
  $moduleLinks = @($links | Where-Object { $_.module_id -eq $module.id })
  $uniqueBooks = @($moduleLinks.book_id | Sort-Object -Unique)
  $duplicateCount = $moduleLinks.Count - $uniqueBooks.Count
  $duplicateSortCount = @($moduleLinks | Group-Object sort_order | Where-Object { $_.Count -gt 1 }).Count
  $invalidSortCount = @($moduleLinks | Where-Object { [int]$_.sort_order -lt 1 }).Count
  $invalidBookCount = @($moduleLinks | Where-Object { $_.books.status -ne 'active' -or $_.books.is_visible_website -ne $true }).Count
  $isPass = $uniqueBooks.Count -eq $MinimumBooks -and $duplicateCount -eq 0 -and $duplicateSortCount -eq 0 -and $invalidSortCount -eq 0 -and $invalidBookCount -eq 0
  if (-not $isPass) { $failed = $true }
  [pscustomobject]@{
    Module = $module.slug
    Books = $uniqueBooks.Count
    Duplicates = $duplicateCount
    'Duplicate sort orders' = $duplicateSortCount
    'Invalid sort orders' = $invalidSortCount
    'Hidden/inactive books' = $invalidBookCount
    Status = if ($isPass) { 'PASS' } else { 'FAIL' }
  }
}

$report | Format-Table -AutoSize
if ($failed) { throw "Homepage module verification failed: each active module must have exactly $MinimumBooks visible books with positive, unique sort_order values." }
