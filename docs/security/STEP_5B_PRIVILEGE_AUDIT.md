# Step 5B privilege audit

## Disposable identities tested

The migrations created role definitions without accounts or credentials. The
integration test created temporary random-password users on `127.0.0.1`, set
one default role per user, exercised allowed and denied statements, then
dropped the users.

| Identity           | Allowed evidence                                                         | Denied evidence                                           |
| ------------------ | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| ingestion          | read collection approval; write intake tables through granted columns    | read civic/political payloads; create collection approval |
| civic reviewer     | read civic payload                                                       | read political payload                                    |
| political reviewer | read political payload                                                   | read civic payload                                        |
| privacy officer    | read response ID/withdrawal state; update/delete withdrawal-related rows | read segment metadata; read civic payload                 |
| security auditor   | read access audit                                                        | insert/tamper with audit rows                             |
| public/no role     | none                                                                     | read response or export-approval tables                   |

Step 5B narrows ingestion updates on screening claims and privacy reads/updates
to named columns. It does not grant any database permission to the static
Cloudflare Pages site.

## Separation-of-duties limits

The database grants reduce ordinary application access; they cannot stop a
MySQL administrator from bypassing controls. Production still needs approved
human identities, MFA, just-in-time role activation, credential rotation,
private networking, TLS, monitored break-glass access and independent review of
all grants. The synthetic approval record is not a production authorization
workflow or identity-provider integration.
