Set-Location "C:\Users\Animesh Tripathi\Desktop\zorvyn\Backend"

$base = 'http://localhost:3000'
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$adminEmail = "admin$ts@test.com"
$analystEmail = "analyst$ts@test.com"
$password = 'StrongPass123!'
$adminWs = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$analystWs = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$results = New-Object System.Collections.Generic.List[object]
$recordId = $null
$analystId = $null

function Add-Result {
  param([string]$Name, [bool]$Ok, [string]$Detail)
  $results.Add([PSCustomObject]@{ Test = $Name; Status = $(if ($Ok) { 'PASS' } else { 'FAIL' }); Detail = $Detail })
}

function Get-StatusCodeFromError {
  param($ErrorRecord)
  $resp = $ErrorRecord.Exception.Response
  if ($resp) { return $resp.StatusCode.value__ }
  return $null
}

try {
  $r = Invoke-WebRequest -Uri "$base/" -Method Get -UseBasicParsing
  Add-Result 'Health GET /' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
} catch {
  Add-Result 'Health GET /' $false $_.Exception.Message
}

try {
  $body = @{ name = 'Admin Candidate'; email = $adminEmail; password = $password } | ConvertTo-Json
  $r = Invoke-WebRequest -Uri "$base/api/auth/register" -Method Post -ContentType 'application/json' -Body $body -UseBasicParsing
  Add-Result 'Register admin candidate' ($r.StatusCode -eq 201) "status=$($r.StatusCode)"
} catch {
  Add-Result 'Register admin candidate' $false $_.Exception.Message
}

try {
  $body = @{ name = 'Analyst Candidate'; email = $analystEmail; password = $password } | ConvertTo-Json
  $r = Invoke-WebRequest -Uri "$base/api/auth/register" -Method Post -ContentType 'application/json' -Body $body -UseBasicParsing
  Add-Result 'Register analyst candidate' ($r.StatusCode -eq 201) "status=$($r.StatusCode)"
} catch {
  Add-Result 'Register analyst candidate' $false $_.Exception.Message
}

try {
  node -e "require('dotenv').config(); const mongoose=require('mongoose'); const User=require('./src/models/User.model'); (async()=>{ await mongoose.connect(process.env.MONGO_URI); const out=await User.updateOne({email: process.argv[1]}, {`$set:{role:'Admin',isActive:true}}); console.log('UPDATED:'+out.modifiedCount); await mongoose.disconnect(); })().catch(async (e)=>{ console.error(e); try{await mongoose.disconnect();}catch(_){} process.exit(1);});" $adminEmail | Out-Null
  Add-Result 'Promote admin candidate via DB setup' $true "email=$adminEmail"
} catch {
  Add-Result 'Promote admin candidate via DB setup' $false $_.Exception.Message
}

try {
  $body = @{ email = $adminEmail; password = $password } | ConvertTo-Json
  $r = Invoke-WebRequest -Uri "$base/api/auth/login" -Method Post -ContentType 'application/json' -Body $body -UseBasicParsing -WebSession $adminWs
  Add-Result 'Admin login' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
} catch {
  Add-Result 'Admin login' $false $_.Exception.Message
}

try {
  $r = Invoke-WebRequest -Uri "$base/api/auth/users" -Method Get -UseBasicParsing -WebSession $adminWs
  $obj = $r.Content | ConvertFrom-Json
  $analystUser = $obj.data | Where-Object { $_.email -eq $analystEmail } | Select-Object -First 1
  if ($analystUser) {
    $analystId = $analystUser._id
    Add-Result 'Admin can list users' ($r.StatusCode -eq 200) "status=$($r.StatusCode),analystId=$analystId"
  } else {
    Add-Result 'Admin can list users' $false 'Analyst user not found in list'
  }
} catch {
  Add-Result 'Admin can list users' $false $_.Exception.Message
}

if ($analystId) {
  try {
    $body = @{ role = 'Analyst' } | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$base/api/auth/users/$analystId/role" -Method Patch -ContentType 'application/json' -Body $body -UseBasicParsing -WebSession $adminWs
    Add-Result 'Admin updates analyst role' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
  } catch {
    Add-Result 'Admin updates analyst role' $false $_.Exception.Message
  }

  try {
    $body = @{ isActive = $false } | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$base/api/auth/users/$analystId/status" -Method Patch -ContentType 'application/json' -Body $body -UseBasicParsing -WebSession $adminWs
    Add-Result 'Admin deactivates analyst' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
  } catch {
    Add-Result 'Admin deactivates analyst' $false $_.Exception.Message
  }

  try {
    $body = @{ email = $analystEmail; password = $password } | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$base/api/auth/login" -Method Post -ContentType 'application/json' -Body $body -UseBasicParsing -WebSession $analystWs
    Add-Result 'Inactive analyst blocked from login' $false "unexpected status=$($r.StatusCode)"
  } catch {
    $code = Get-StatusCodeFromError $_
    Add-Result 'Inactive analyst blocked from login' ($code -eq 403) "status=$code"
  }

  try {
    $body = @{ isActive = $true } | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$base/api/auth/users/$analystId/status" -Method Patch -ContentType 'application/json' -Body $body -UseBasicParsing -WebSession $adminWs
    Add-Result 'Admin reactivates analyst' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
  } catch {
    Add-Result 'Admin reactivates analyst' $false $_.Exception.Message
  }

  try {
    $body = @{ email = $analystEmail; password = $password } | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$base/api/auth/login" -Method Post -ContentType 'application/json' -Body $body -UseBasicParsing -WebSession $analystWs
    Add-Result 'Analyst login after reactivation' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
  } catch {
    Add-Result 'Analyst login after reactivation' $false $_.Exception.Message
  }
}

try {
  $body = @{ amount = 1500; type = 'Income'; category = 'Salary'; date = '2026-04-02T00:00:00.000Z'; notes = 'admin-created' } | ConvertTo-Json
  $r = Invoke-WebRequest -Uri "$base/api/records/addRecord" -Method Post -ContentType 'application/json' -Body $body -UseBasicParsing -WebSession $adminWs
  $obj = $r.Content | ConvertFrom-Json
  $recordId = $obj.data._id
  Add-Result 'Admin can create record' (($r.StatusCode -eq 201) -and ($null -ne $recordId)) "status=$($r.StatusCode),recordId=$recordId"
} catch {
  Add-Result 'Admin can create record' $false $_.Exception.Message
}

try {
  $r = Invoke-WebRequest -Uri "$base/api/records/getRecord?page=1&limit=5&type=Income" -Method Get -UseBasicParsing -WebSession $analystWs
  Add-Result 'Analyst can read records' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
} catch {
  Add-Result 'Analyst can read records' $false $_.Exception.Message
}

try {
  $body = @{ amount = 50; type = 'Expense'; category = 'Food'; date = '2026-04-02T00:00:00.000Z'; notes = 'analyst-should-fail' } | ConvertTo-Json
  $r = Invoke-WebRequest -Uri "$base/api/records/addRecord" -Method Post -ContentType 'application/json' -Body $body -UseBasicParsing -WebSession $analystWs
  Add-Result 'Analyst blocked from record create' $false "unexpected status=$($r.StatusCode)"
} catch {
  $code = Get-StatusCodeFromError $_
  Add-Result 'Analyst blocked from record create' ($code -eq 403) "status=$code"
}

try {
  $r = Invoke-WebRequest -Uri "$base/api/dashboard/summary" -Method Get -UseBasicParsing -WebSession $analystWs
  Add-Result 'Analyst dashboard summary' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
} catch {
  Add-Result 'Analyst dashboard summary' $false $_.Exception.Message
}

try {
  $r = Invoke-WebRequest -Uri "$base/api/dashboard/recent-activity?limit=5" -Method Get -UseBasicParsing -WebSession $analystWs
  Add-Result 'Analyst recent activity' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
} catch {
  Add-Result 'Analyst recent activity' $false $_.Exception.Message
}

try {
  $r = Invoke-WebRequest -Uri "$base/api/dashboard/monthly-trends?year=2026" -Method Get -UseBasicParsing -WebSession $analystWs
  Add-Result 'Analyst monthly trends' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
} catch {
  Add-Result 'Analyst monthly trends' $false $_.Exception.Message
}

if ($recordId) {
  try {
    $body = @{ amount = 1800; notes = 'admin-updated' } | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$base/api/records/updateRecord/$recordId" -Method Put -ContentType 'application/json' -Body $body -UseBasicParsing -WebSession $adminWs
    Add-Result 'Admin can update record' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
  } catch {
    Add-Result 'Admin can update record' $false $_.Exception.Message
  }

  try {
    $r = Invoke-WebRequest -Uri "$base/api/records/deleteRecord/$recordId" -Method Delete -UseBasicParsing -WebSession $adminWs
    Add-Result 'Admin can soft-delete record' ($r.StatusCode -eq 200) "status=$($r.StatusCode)"
  } catch {
    Add-Result 'Admin can soft-delete record' $false $_.Exception.Message
  }
}

$results | Format-Table -AutoSize | Out-String -Width 260
