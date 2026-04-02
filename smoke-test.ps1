Set-Location "C:\Users\Animesh Tripathi\Desktop\zorvyn\Backend"

$base = 'http://localhost:3000'
$email = "viewer$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())@test.com"
$password = 'StrongPass123!'
$ws = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$results = New-Object System.Collections.Generic.List[object]

function Add-Result {
  param([string]$Name, [bool]$Ok, [string]$Detail)
  $results.Add([PSCustomObject]@{ Test = $Name; Status = $(if ($Ok) { 'PASS' } else { 'FAIL' }); Detail = $Detail })
}

try {
  $r = Invoke-WebRequest -Uri "$base/" -Method Get -UseBasicParsing -WebSession $ws
  Add-Result 'Health GET /' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
} catch {
  Add-Result 'Health GET /' $false $_.Exception.Message
}

try {
  $body = @{ name = 'Viewer User'; email = $email; password = $password } | ConvertTo-Json
  $r = Invoke-WebRequest -Uri "$base/api/auth/register" -Method Post -ContentType 'application/json' -Body $body -UseBasicParsing -WebSession $ws
  $obj = $r.Content | ConvertFrom-Json
  Add-Result 'Register Viewer' (($r.StatusCode -eq 201) -and ($obj.user.role -eq 'Viewer')) "status=$($r.StatusCode),role=$($obj.user.role)"
} catch {
  Add-Result 'Register Viewer' $false $_.Exception.Message
}

try {
  $body = @{ email = $email; password = $password } | ConvertTo-Json
  $r = Invoke-WebRequest -Uri "$base/api/auth/login" -Method Post -ContentType 'application/json' -Body $body -UseBasicParsing -WebSession $ws
  Add-Result 'Login Viewer' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
} catch {
  Add-Result 'Login Viewer' $false $_.Exception.Message
}

try {
  $r = Invoke-WebRequest -Uri "$base/api/auth/me" -Method Get -UseBasicParsing -WebSession $ws
  $obj = $r.Content | ConvertFrom-Json
  Add-Result 'GET /api/auth/me' (($r.StatusCode -eq 200) -and ($obj.user.email -eq $email)) "status=$($r.StatusCode),email=$($obj.user.email)"
} catch {
  Add-Result 'GET /api/auth/me' $false $_.Exception.Message
}

try {
  $r = Invoke-WebRequest -Uri "$base/api/dashboard/summary" -Method Get -UseBasicParsing -WebSession $ws
  Add-Result 'Viewer can access dashboard summary' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
} catch {
  Add-Result 'Viewer can access dashboard summary' $false $_.Exception.Message
}

try {
  $r = Invoke-WebRequest -Uri "$base/api/records/getRecord" -Method Get -UseBasicParsing -WebSession $ws
  Add-Result 'Viewer blocked from records read' $false "unexpected status=$($r.StatusCode)"
} catch {
  $resp = $_.Exception.Response
  if ($resp) {
    Add-Result 'Viewer blocked from records read' ($resp.StatusCode.value__ -eq 403) "status=$($resp.StatusCode.value__)"
  } else {
    Add-Result 'Viewer blocked from records read' $false $_.Exception.Message
  }
}

try {
  $r = Invoke-WebRequest -Uri "$base/api/auth/users" -Method Get -UseBasicParsing -WebSession $ws
  Add-Result 'Viewer blocked from admin users API' $false "unexpected status=$($r.StatusCode)"
} catch {
  $resp = $_.Exception.Response
  if ($resp) {
    Add-Result 'Viewer blocked from admin users API' ($resp.StatusCode.value__ -eq 403) "status=$($resp.StatusCode.value__)"
  } else {
    Add-Result 'Viewer blocked from admin users API' $false $_.Exception.Message
  }
}

try {
  $r = Invoke-WebRequest -Uri "$base/api/auth/logout" -Method Post -UseBasicParsing -WebSession $ws
  Add-Result 'Logout' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
} catch {
  Add-Result 'Logout' $false $_.Exception.Message
}

try {
  $r = Invoke-WebRequest -Uri "$base/api/auth/me" -Method Get -UseBasicParsing -WebSession $ws
  Add-Result 'GET /api/auth/me after logout' $false "unexpected status=$($r.StatusCode)"
} catch {
  $resp = $_.Exception.Response
  if ($resp) {
    Add-Result 'GET /api/auth/me after logout' ($resp.StatusCode.value__ -eq 401) "status=$($resp.StatusCode.value__)"
  } else {
    Add-Result 'GET /api/auth/me after logout' $false $_.Exception.Message
  }
}

$results | Format-Table -AutoSize | Out-String -Width 240
