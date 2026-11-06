param(
  [string]$Password = $env:STEP5E_TLS_PFX_PASSWORD,

  [string]$OutputPath = "work/step5e-local-staging.pfx",

  [string]$PublicCertificatePath = "work/step5e-local-staging.cer"
)

$ErrorActionPreference = "Stop"

if ($Password.Length -lt 24) {
  throw "Use a random synthetic PFX password of at least 24 characters."
}

$resolvedOutput = [System.IO.Path]::GetFullPath(
  (Join-Path (Get-Location) $OutputPath)
)
$resolvedPublicCertificate = [System.IO.Path]::GetFullPath(
  (Join-Path (Get-Location) $PublicCertificatePath)
)
$workRoot = [System.IO.Path]::GetFullPath(
  (Join-Path (Get-Location) "work")
)

if (
  -not $resolvedOutput.StartsWith($workRoot, [StringComparison]::OrdinalIgnoreCase) -or
  -not $resolvedPublicCertificate.StartsWith($workRoot, [StringComparison]::OrdinalIgnoreCase)
) {
  throw "The synthetic certificate must remain under the ignored work directory."
}

New-Item -ItemType Directory -Force -Path ([System.IO.Path]::GetDirectoryName($resolvedOutput)) | Out-Null
$certificate = $null

try {
  $certificate = New-SelfSignedCertificate `
    -Subject "CN=127.0.0.1" `
    -DnsName "127.0.0.1", "localhost" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -KeyAlgorithm RSA `
    -KeyLength 3072 `
    -HashAlgorithm SHA256 `
    -NotAfter (Get-Date).AddDays(7) `
    -KeyExportPolicy Exportable

  $securePassword = ConvertTo-SecureString -String $Password -AsPlainText -Force
  Export-PfxCertificate `
    -Cert $certificate `
    -FilePath $resolvedOutput `
    -Password $securePassword `
    -NoProperties | Out-Null

  Export-Certificate `
    -Cert $certificate `
    -FilePath $resolvedPublicCertificate `
    -Type CERT | Out-Null

  Write-Output $resolvedOutput
}
finally {
  if ($null -ne $certificate) {
    Remove-Item -LiteralPath "Cert:\CurrentUser\My\$($certificate.Thumbprint)"
  }
}
