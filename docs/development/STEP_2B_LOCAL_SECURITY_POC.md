# Running the Step 2B local security proof

These instructions create disposable local MySQL state and use synthetic values only. They do not configure Windows services, cloud resources, DNS, production credentials, or public listeners.

## Prerequisites

- Node.js matching `package.json` (`>=20.9.0`; tested with 22.15.0).
- npm (`npm ci`).
- Official MySQL Community Server 8.4.13 LTS Windows ZIP from Oracle.
- Verify the archive against the checksum on the official download page before extraction. The checksum published for `mysql-8.4.13-winx64.zip` on 2026-11-03 was `7b94489d5524dea9b27097068bea25a8` (MD5); also verify Oracle's signature where GPG tooling is available.

Do not reuse an existing MySQL data directory. Choose a new directory under the OS temporary directory and confirm it does not exist before initialization.

## Initialize and start on loopback

Example PowerShell variables—adjust only the temporary paths:

```powershell
$mysqlRoot = "$env:TEMP\panjab117-mysql-8.4.13\mysql-8.4.13-winx64"
$dataDir = "$env:TEMP\panjab117-mysql-8.4.13\data-step2b-new"
$logFile = "$env:TEMP\panjab117-mysql-8.4.13\mysql-step2b-new.log"
$pidFile = "$env:TEMP\panjab117-mysql-8.4.13\mysql-step2b-new.pid"

& "$mysqlRoot\bin\mysqld.exe" --no-defaults --initialize-insecure `
  "--basedir=$mysqlRoot" "--datadir=$dataDir" "--log-error=$logFile"

Start-Process -FilePath "$mysqlRoot\bin\mysqld.exe" -WindowStyle Hidden -ArgumentList @(
  '--no-defaults', "--basedir=$mysqlRoot", "--datadir=$dataDir",
  '--bind-address=127.0.0.1', '--port=3307', '--mysqlx=OFF',
  '--skip-log-bin', "--pid-file=$pidFile", "--log-error=$logFile"
)
```

`--initialize-insecure` is permitted only for this loopback disposable instance. Never use it for a shared or production system.

## Apply and test

```powershell
$mysqlBin = "$mysqlRoot\bin"
$schema = (Resolve-Path 'docs\design\mysql-schema-draft.sql').Path.Replace('\', '/')
$grants = (Resolve-Path 'docs\design\mysql-grants.sql').Path.Replace('\', '/')

& "$mysqlBin\mysql.exe" --protocol=tcp --host=127.0.0.1 --port=3307 `
  --user=root --show-warnings --execute="SOURCE $schema"
& "$mysqlBin\mysql.exe" --protocol=tcp --host=127.0.0.1 --port=3307 `
  --user=root --show-warnings --execute="SOURCE $grants"

$env:PANJAB_MYSQL_PORT = '3307'
$env:PANJAB_MYSQL_BIN = $mysqlBin
npm.cmd run test:security:mysql
```

The integration test resets only the three disposable `panjab_*` schemas on the configured loopback instance. Do not point these variables at any existing or non-disposable server.

The ordinary `npm run test` intentionally skips the three MySQL integration cases when these environment variables are absent. The explicit security command must report three passing integration tests.

## Stop safely

```powershell
& "$mysqlRoot\bin\mysqladmin.exe" --protocol=tcp --host=127.0.0.1 `
  --port=3307 --user=root shutdown
```

Confirm the PID from the dedicated PID file has stopped. The disposable directory may be removed later only after resolving its absolute path and confirming it is the intended temporary `panjab117-mysql-8.4.13` directory. No cleanup command is automated by this repository.

## What the integration test proves

- Schema and grants parse on MySQL 8.4.13.
- Cross-survey answers and duplicate answers fail.
- Response/DEK ownership FKs, indexes, version-sealing triggers and transaction rollback work.
- Public, ingestion and backup role denials are enforced by MySQL.
- `mysqldump --single-transaction` output can be independently authenticated/encrypted and restored.
- A post-backup synthetic identity deletion is replayed before restored data is accepted.
- Corrupted backup artifacts and altered deletion-ledger bindings fail in unit tests.

It does not prove production TLS, OCI/Cloudflare/Vault behavior, production RPO/RTO, large backup streaming, or real-data safety.

## Official references

- [MySQL Community Server 8.4 download](https://dev.mysql.com/downloads/mysql/8.4.html?os=3)
- [MySQL Windows ZIP installation](https://dev.mysql.com/doc/refman/8.4/en/windows-installation.html)
- [MySQL 8.4 GRANT](https://dev.mysql.com/doc/refman/8.4/en/grant.html)
- [MySQL 8.4 CREATE TRIGGER](https://dev.mysql.com/doc/refman/8.4/en/create-trigger.html)
