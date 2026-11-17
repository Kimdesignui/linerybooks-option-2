param()

$ErrorActionPreference = 'Stop'
$envPath = Join-Path $PSScriptRoot '..\.env.enhanced'
$envLines = Get-Content $envPath
$supabaseUrl = ($envLines | Where-Object { $_ -match '^VITE_SUPABASE_URL=' }) -replace '^VITE_SUPABASE_URL=', ''
$anonKey = ($envLines | Where-Object { $_ -match '^VITE_SUPABASE_ANON_KEY=' }) -replace '^VITE_SUPABASE_ANON_KEY=', ''
$headers = @{ apikey = $anonKey; Authorization = "Bearer $anonKey"; 'Content-Type' = 'application/json' }
$body = '{"prefix":"","limit":1,"offset":0,"sortBy":{"column":"name","order":"asc"}}'

try {
  $response = Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$supabaseUrl/storage/v1/object/list/site-media" -Headers $headers -Body $body
  if ([string]::IsNullOrWhiteSpace($response.Content) -or $response.Content.Trim() -eq '[]') {
    Write-Output "PASS: site-media van tai duoc bang URL cong khai nhung API liet ke tra ve danh sach rong."
    exit 0
  }
  $objects = @(ConvertFrom-Json -InputObject $response.Content)
  if ($objects.Count -eq 0) {
    Write-Output "PASS: site-media van tai duoc bang URL cong khai nhung API liet ke tra ve danh sach rong."
    exit 0
  }
  Write-Output "FAIL: trinh duyet cong khai van liet ke duoc $($objects.Count) tep trong site-media (HTTP $($response.StatusCode)). Hay chay migration 20261117_restrict_public_storage_listing.sql."
  exit 1
} catch {
  $statusCode = 0
  if ($_.Exception.Response) { $statusCode = [int]$_.Exception.Response.StatusCode }
  if ($statusCode -in @(400, 401, 403)) {
    Write-Output "PASS: site-media van tai duoc bang URL cong khai nhung khong cho phep liet ke (HTTP $statusCode)."
    exit 0
  }
  Write-Error "Khong xac minh duoc chinh sach site-media: $($_.Exception.Message)"
  exit 1
}
