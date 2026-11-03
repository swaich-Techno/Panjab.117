# Oracle MySQL HeatWave Always Free constraints

Status: architecture baseline, not a provisioned or tested environment

Verified: 2026-11-03

## Verified service envelope

| Capability         | Current documented constraint                                                                                                     | Architecture consequence                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Availability       | One Always Free DB system per Commercial-realm tenancy, in the tenancy home region                                                | Region choice is effectively irreversible for this design and must precede data residency review.                                          |
| Database shape     | `MySQL.Free`: 1 ECPU, 8 GiB RAM, 1 Gbps maximum network bandwidth                                                                 | Treat as a pilot-scale database; load-test with representative encrypted rows before accepting survey traffic.                             |
| Storage            | Fixed 50 GiB for data and logs                                                                                                    | Enforce quotas, archive published material separately, and alert well before exhaustion.                                                   |
| HeatWave           | Optional one-node `HeatWave.Free` cluster with 16 GiB RAM                                                                         | Not required for the transactional baseline; enabling it increases operational surface.                                                    |
| Database version   | Created and maintained on the latest service version                                                                              | Test service maintenance behavior and keep schema compatible with the managed version.                                                     |
| Availability       | High availability and read replicas are unsupported                                                                               | A single DB system is a single point of failure. No production availability commitment is possible on free tier.                           |
| Native recovery    | Automatic backup is enabled by default with one-day retention. Manual backup and point-in-time recovery are unavailable.          | Independent encrypted logical backups and restore drills are mandatory. Native backup alone is insufficient.                               |
| Support            | No SLA and no Oracle Support for Always Free                                                                                      | Incident recovery time cannot be guaranteed. Escalation requires a paid support path.                                                      |
| Network            | DB endpoints are not public and require a VCN. Oracle documents access through private compute, Bastion, or private connectivity. | Application data services must run in, or securely connect to, the OCI VCN. Never publish port 3306.                                       |
| Transport security | TLS is supported; MySQL accounts can be created with `REQUIRE SSL`                                                                | Every application account must require TLS and clients must verify the CA and server identity.                                             |
| At-rest encryption | Block volumes and backups are encrypted by default with Oracle-managed keys; customer-managed Vault keys are supported            | Default encryption is necessary but not sufficient for political opinions or identifiers; selected fields also use application encryption. |
| IAM                | OCI IAM policies, compartments, groups, dynamic groups, and resource principals are available                                     | Use workload identity for Vault/Object Storage; avoid long-lived OCI user API keys in the app.                                             |
| Audit              | MySQL Enterprise Audit is supported but disabled by default on eligible service versions                                          | Enable and route a redacted audit policy in a later provisioned phase; application audit remains independently required.                   |

## Free supporting resources relevant to this design

Oracle documents 20 GB total Always Free Object Storage for an Always Free-only account and 50,000 Object Storage API requests per month. This is useful for a small independent backup set, but it may be inadequate once encrypted backups and multiple restore points grow. Oracle also documents free software-protected master-key versions, 20 total HSM-protected master-key versions, and 150 Vault secrets; virtual private vaults are excluded.

Oracle's current public price list also lists software-protected keys and secrets as free; private vaults and usage beyond included HSM allowances can be billable. Pricing is account/region-sensitive and must be confirmed in the OCI cost estimator with hard quotas before provisioning.

Always Free Compute is capacity-dependent. Oracle explicitly notes that an `out of host capacity` error can occur. The proposed OCI-hosted application tier therefore remains contingent on capacity and a successful proof of concept.

## Commercial-use and hosting assessment

Oracle's Free Tier FAQ describes the service for developers, startups, enterprises, students, and production progression, but warns that production scenarios may need resources beyond Always Free. It does not provide an availability or fitness guarantee. Before launch, the account owner must accept the current Oracle Cloud Services Agreement and confirm that the intended civic-research use, data location, and traffic pattern comply with it. This document is not legal advice.

Cloudflare's Free plan is not an origin-hosting service and does not make OCI MySQL public or privately reachable. Its current service terms and plan limits must also be reviewed before launch; see [CLOUDFLARE_CDN.md](./CLOUDFLARE_CDN.md).

## Suitability verdict

Always Free is suitable for schema development, security prototyping, synthetic-data tests, and a low-volume public-content pilot. It is **not by itself suitable for highly confidential production surveys** because it lacks HA, PITR, long native backup retention, SLA, and support. Collection of confidential data must remain disabled until independent restoration has passed, monitoring is operational, legal/privacy review is complete, and an incident-funded upgrade path exists.

## Official sources

- [Oracle: Features of MySQL HeatWave Service](https://docs.oracle.com/en-us/iaas/mysql-database/doc/features-mysql-heatwave-service.html) — availability, 50 GiB storage, backups, HA/read-replica/PITR exclusions, TLS, encryption, IAM, audit, support.
- [Oracle: Supported shapes](https://docs.oracle.com/en-us/iaas/mysql-database/doc/supported-shapes.html) — `MySQL.Free` and `HeatWave.Free` compute and memory.
- [Oracle: Overview of networking](https://docs.oracle.com/en-us/iaas/mysql-database/doc/overview-networking.html) — private endpoints and VCN access.
- [Oracle: Point-in-time recovery](https://docs.oracle.com/en-us/iaas/mysql-database/doc/point-time-recovery.html) — Always Free exclusion.
- [Oracle: Advanced options](https://docs.oracle.com/en-us/iaas/mysql-database/doc/advanced-options.html) — Oracle-managed and customer-managed encryption keys.
- [Oracle: IAM policies](https://docs.oracle.com/en-us/iaas/mysql-database/doc/iam-policies.html) and [resource principals](https://docs.oracle.com/en-us/iaas/mysql-database/doc/resource-principals.html) — authorization and workload identity.
- [Oracle: Always Free resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm) — Compute capacity warning, Object Storage, and Vault allowances.
- [Oracle: Cloud price list](https://www.oracle.com/cloud/price-list/) — current public Vault/key pricing categories.
- [Oracle: Cloud Free Tier FAQ](https://www.oracle.com/cloud/free/faq/) — intended audiences, continuing free resources, and production caveat.
