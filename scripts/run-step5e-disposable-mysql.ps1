param(
  [Parameter(Mandatory = $true)]
  [string]$ArchivePath,

  [int]$Port = 51913
)

$ErrorActionPreference = "Stop"
$expectedMd5 = "7b94489d5524dea9b27097068bea25a8"
$repoRoot = [System.IO.Path]::GetFullPath((Get-Location).Path)
$workRoot = [System.IO.Path]::GetFullPath((Join-Path $repoRoot "work"))
$runtimeRoot = [System.IO.Path]::GetFullPath(
  (Join-Path $workRoot "step5e-mysql-runtime")
)
$resolvedArchive = [System.IO.Path]::GetFullPath($ArchivePath)

if (
  -not $runtimeRoot.StartsWith($workRoot, [StringComparison]::OrdinalIgnoreCase) -or
  -not $resolvedArchive.StartsWith($workRoot, [StringComparison]::OrdinalIgnoreCase)
) {
  throw "Disposable MySQL paths must stay under the ignored work directory."
}
if ($Port -lt 49152 -or $Port -gt 65535) {
  throw "Use an unprivileged dynamic port."
}
if ((Get-FileHash -LiteralPath $resolvedArchive -Algorithm MD5).Hash.ToLowerInvariant() -ne $expectedMd5) {
  throw "Official MySQL archive checksum mismatch."
}
if (Test-Path -LiteralPath $runtimeRoot) {
  throw "Disposable runtime path already exists; inspect it before retrying."
}
$existingListeners = @(
  Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
)
if ($existingListeners.Count -gt 0) {
  throw "Requested disposable MySQL port is already in use."
}

$serverProcess = $null
$testExit = 1
$oldMysqlPwd = $env:MYSQL_PWD
$oldPanjabPassword = $env:PANJAB_MYSQL_PASSWORD
$oldPanjabPort = $env:PANJAB_MYSQL_PORT
$oldPanjabBin = $env:PANJAB_MYSQL_BIN

try {
  New-Item -ItemType Directory -Force -Path $runtimeRoot | Out-Null
  Expand-Archive -LiteralPath $resolvedArchive -DestinationPath $runtimeRoot
  $mysqlRoot = Join-Path $runtimeRoot "mysql-8.4.13-winx64"
  $binDirectory = Join-Path $mysqlRoot "bin"
  $dataDirectory = Join-Path $runtimeRoot "data"
  $errorLog = Join-Path $runtimeRoot "mysql-error.log"
  $pidFile = Join-Path $runtimeRoot "mysql.pid"
  $binaryLog = Join-Path $runtimeRoot "mysql-bin"
  $mysqld = Join-Path $binDirectory "mysqld.exe"
  $mysql = Join-Path $binDirectory "mysql.exe"
  $mysqladmin = Join-Path $binDirectory "mysqladmin.exe"

  & $mysqld `
    --no-defaults `
    --initialize-insecure `
    "--basedir=$mysqlRoot" `
    "--datadir=$dataDirectory"
  if ($LASTEXITCODE -ne 0) { throw "MySQL initialization failed." }

  $serverArguments = @(
    "--no-defaults",
    "--basedir=$mysqlRoot",
    "--datadir=$dataDirectory",
    "--port=$Port",
    "--bind-address=127.0.0.1",
    "--mysqlx=OFF",
    "--general-log=OFF",
    "--slow-query-log=OFF",
    "--log-output=FILE",
    "--log-bin=$binaryLog",
    "--server-id=11705",
    "--local-infile=OFF",
    "--secure-file-priv=NULL",
    "--pid-file=$pidFile",
    "--log-error=$errorLog"
  )
  $serverProcess = Start-Process `
    -FilePath $mysqld `
    -ArgumentList $serverArguments `
    -WindowStyle Hidden `
    -PassThru

  $ready = $false
  for ($attempt = 0; $attempt -lt 120; $attempt += 1) {
    Start-Sleep -Milliseconds 250
    & $mysqladmin `
      --protocol=tcp `
      --host=127.0.0.1 `
      "--port=$Port" `
      --user=root `
      --silent `
      ping *> $null
    if ($LASTEXITCODE -eq 0) {
      $ready = $true
      break
    }
    if ($serverProcess.HasExited) { break }
  }
  if (-not $ready) { throw "Disposable MySQL did not become ready." }

  $passwordBytes = New-Object byte[] 32
  $random = [Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $random.GetBytes($passwordBytes)
  }
  finally {
    $random.Dispose()
  }
  $password = [Convert]::ToBase64String($passwordBytes).TrimEnd("=").Replace("+", "-").Replace("/", "_")
  "ALTER USER 'root'@'localhost' IDENTIFIED BY '$password';" | & $mysql `
    --protocol=tcp `
    --host=127.0.0.1 `
    "--port=$Port" `
    --user=root
  if ($LASTEXITCODE -ne 0) { throw "Disposable MySQL password rotation failed." }

  $env:MYSQL_PWD = $password
  $env:PANJAB_MYSQL_PASSWORD = $password
  $env:PANJAB_MYSQL_PORT = [string]$Port
  $env:PANJAB_MYSQL_BIN = $binDirectory

  & npm.cmd run test:security:mysql
  $testExit = $LASTEXITCODE
}
finally {
  $mysqladminPath = Join-Path $runtimeRoot "mysql-8.4.13-winx64\bin\mysqladmin.exe"
  $activeListeners = @(
    Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
  )
  if ($activeListeners.Count -gt 0 -and (Test-Path -LiteralPath $mysqladminPath)) {
    try {
      & $mysqladminPath `
        --protocol=tcp `
        --host=127.0.0.1 `
        "--port=$Port" `
        --user=root `
        --silent `
        shutdown *> $null
    }
    catch {
      # The exact disposable listener process is verified and stopped below.
    }
  }

  for ($attempt = 0; $attempt -lt 120; $attempt += 1) {
    $shutdownListeners = @(
      Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
    )
    if ($shutdownListeners.Count -eq 0) {
      break
    }
    Start-Sleep -Milliseconds 250
  }
  $remainingListeners = @(
    Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
  )
  foreach ($listener in $remainingListeners) {
    $listenerProcess = Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue
    if ($null -eq $listenerProcess) {
      continue
    }
    if (
      [string]::IsNullOrWhiteSpace($listenerProcess.Path) -or
      -not $listenerProcess.Path.StartsWith($runtimeRoot, [StringComparison]::OrdinalIgnoreCase)
    ) {
      throw "Refusing to stop an unverified process on the disposable port."
    }
    Stop-Process -Id $listenerProcess.Id -Force
    $listenerProcess.WaitForExit(15000) | Out-Null
  }
  for ($attempt = 0; $attempt -lt 60; $attempt += 1) {
    $forcedShutdownListeners = @(
      Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
    )
    if ($forcedShutdownListeners.Count -eq 0) { break }
    Start-Sleep -Milliseconds 250
  }
  $finalListeners = @(
    Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
  )
  $liveListenerProcesses = @(
    foreach ($listener in $finalListeners) {
      Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue
    }
  )
  $listenerRemains = $liveListenerProcesses.Count -gt 0

  $env:MYSQL_PWD = $oldMysqlPwd
  $env:PANJAB_MYSQL_PASSWORD = $oldPanjabPassword
  $env:PANJAB_MYSQL_PORT = $oldPanjabPort
  $env:PANJAB_MYSQL_BIN = $oldPanjabBin

  if (Test-Path -LiteralPath $runtimeRoot) {
    $resolvedRuntime = (Get-Item -LiteralPath $runtimeRoot).FullName
    if (
      $resolvedRuntime -ne $runtimeRoot -or
      -not $resolvedRuntime.StartsWith($workRoot, [StringComparison]::OrdinalIgnoreCase)
    ) {
      throw "Refusing unsafe disposable runtime cleanup."
    }
    Remove-Item -LiteralPath $resolvedRuntime -Recurse -Force
  }
  if ($listenerRemains) {
    throw "Disposable MySQL listener remained after shutdown."
  }
}

Write-Output "MYSQL_TEST_EXIT=$testExit"
exit $testExit
