param(
  [string]$Server = "root@213.165.93.254",
  [string]$Key = "$HOME\.ssh\id_ed25519",
  [switch]$ScaleDownOld
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "== build =="
npm run build
if ($LASTEXITCODE -ne 0) { throw "build failed" }

$tag = Get-Date -Format "yyyyMMdd-HHmmss"
$archive = Join-Path $env:TEMP "paperatlas-net.tgz"
if (Test-Path $archive) { Remove-Item $archive -Force }
tar -czf $archive out deploy
if ($LASTEXITCODE -ne 0) { throw "archive failed" }

$ssh = @("-i", $Key, "-o", "BatchMode=yes")
scp @ssh $archive "${Server}:/tmp/paperatlas-net.tgz"
if ($LASTEXITCODE -ne 0) { throw "upload failed" }

$flag = if ($ScaleDownOld) { "--scale-down-old" } else { "" }
$remote = "mkdir -p /tmp/pa && tar -xzf /tmp/paperatlas-net.tgz -C /tmp/pa deploy/remote.sh && sed -i 's/\r$//' /tmp/pa/deploy/remote.sh && bash /tmp/pa/deploy/remote.sh $tag $flag"
ssh @ssh $Server $remote
if ($LASTEXITCODE -ne 0) { throw "remote deploy failed" }

Write-Host "Deployed image tag: $tag"
