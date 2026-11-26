$ErrorActionPreference = 'Stop'
$key = Read-Host 'Collez la cle API Brevo (saisie masquee)' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($key)
try {
  $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  if ([string]::IsNullOrWhiteSpace($apiKey)) { throw 'Cle API vide.' }
  $bytes = New-Object byte[] 32
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
  $password = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
  $manifest = @{
    apiVersion = 'v1'
    kind = 'Secret'
    metadata = @{ name = 'auth-mail-relay'; namespace = 'paperatlas-dz' }
    type = 'Opaque'
    data = @{
      'brevo-api-key' = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($apiKey))
      'smtp-password' = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($password))
    }
  } | ConvertTo-Json -Depth 5 -Compress
  $manifest | ssh -i "$HOME\.ssh\id_ed25519" -o BatchMode=yes root@213.165.93.254 'k3s kubectl create -f -'
  if ($LASTEXITCODE -ne 0) { throw 'Creation du secret impossible ; aucun mot de passe affiche.' }
  Write-Host "`nMot de passe SMTP du relais (copiez-le maintenant, ne le mettez pas dans le chat) :"
  Write-Host $password
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  $key.Dispose()
  $apiKey = $null
  $manifest = $null
  $password = $null
}
