# Step 5E zero-budget cost comparison

Date checked: 5 November 2026

Authorized infrastructure spend: **₹0 maximum**

Decision: retain the existing free static site and local synthetic engineering. Do not launch confidential collection at ₹0.

## Available at ₹0

| Option                                                       | Payment/term                                                                                                                                                                | Location and recovery                                                                                                                                                                                                | Safe use now                                                                                                |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Existing Cloudflare Pages project                            | Existing Free project; official Free limits include 500 builds/month, 20,000 files and 25 MiB per asset. No new billing action is needed for the current project.           | Static assets are delivered through Cloudflare’s global network; there is no survey database or participant backup.                                                                                                  | **Public read-only site only.** Keep indexing off and do not add intake.                                    |
| Local Node.js, MySQL Community 8.4.13, Vitest and PowerShell | Free/open development tooling; no cloud account.                                                                                                                            | Developer machine only; disposable database, encrypted synthetic backup and no production recovery claim.                                                                                                            | **Preferred Step 5E staging.** Synthetic data only.                                                         |
| OCI Always Free compute/storage/vault allowances             | Oracle says Always Free does not expire, but sign-up normally requires a credit/debit card; idle accounts can be suspended and capacity can be unavailable.                 | Home-region only; up to 200 GB combined block volume, five volume backups, 20 GB object storage, free Vault allowances. Self-managed MySQL is not managed MySQL HA/PITR.                                             | Synthetic proof of concept only, and only after separate account/provisioning approval. Not a current plan. |
| Cloudflare Workers Free plus D1                              | Ongoing free prototype allowance: 100,000 Worker requests/day; D1 free limits include 5 million rows read/day, 100,000 written/day, 5 GB/account and seven-day Time Travel. | D1 supports US/EU/FedRAMP jurisdictions; `apac` is only a non-guaranteed hint, not India residency. D1 is SQLite-compatible, not MySQL 8.4, and does not supply the required KMS separation/private intake topology. | Not suitable for this confidential intake.                                                                  |
| Aiven free MySQL                                             | No credit card, no stated time limit; inactive services may be powered off and provider/region/configuration may change.                                                    | 1 CPU, 1 GB RAM/disk, one node and backups, but no VPC, no static IP, no region choice, no integrations and no 99.99% SLA.                                                                                           | Synthetic interoperability testing only. Not suitable for confidential collection.                          |

Official sources: [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/), [OCI Free Tier FAQ](https://www.oracle.com/cloud/free/faq/), [OCI Always Free resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [D1 location](https://developers.cloudflare.com/d1/configuration/data-location/), [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/), and [Aiven free MySQL](https://aiven.io/docs/products/mysql/concepts/mysql-free-tier).

## Temporary free credits — not a sustainable ₹0 service

| Provider          | Current official offer                                                                                           | Payment method/renewal                                                                                                                                                                                  | Production decision                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| AWS               | New-customer Free plan offers credits and selected RDS MySQL access for at most six months or until credits end. | AWS says most new customers do not need a payment method, but may request one for identity verification. The Free plan cannot be extended; the account closes and resource access ends when it expires. | Useful only for time-bounded synthetic evaluation. It cannot provide durable zero-cost operations. |
| Google Cloud      | $300 trial for 90 days; Cloud SQL has a separate 30-day trial.                                                   | A valid payment method is required. If not upgraded, resources stop and are later deleted. Mumbai and Delhi are offered regions, but Cloud SQL is paid after trial.                                     | Synthetic evaluation only. Do not place participant data in a trial lifecycle.                     |
| OCI trial credits | $300 for 30 days in addition to Always Free.                                                                     | Card verification and possible temporary authorization hold. Paid trial resources are reclaimed unless upgraded.                                                                                        | Do not build required controls on expiring credits.                                                |

Official sources: [AWS plan rules](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html), [AWS Free Tier FAQ](https://aws.amazon.com/free/free-tier-faqs/), [RDS Free Tier](https://aws.amazon.com/rds/free/), [Google Free Program](https://docs.cloud.google.com/free/docs/free-cloud-features), [Cloud SQL pricing and trial](https://cloud.google.com/sql/pricing), and [OCI Free Tier documentation](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm).

## Requires external funding

The following remain funding-dependent regardless of provider:

- managed/private MySQL 8.4 with sustained availability, patching, TLS verification and tested PITR;
- private application runtime, WAF/rate controls and controlled ingress/egress;
- separated managed KMS and secret management with identity-based access;
- independent encrypted backups, immutable deletion evidence and restore capacity;
- monitored audit delivery, incident communication/on-call, security review and support;
- legal/privacy, Punjabi/Hindi, methodology, accessibility and penetration review.

AWS RDS documents PITR and free automated backup storage up to provisioned database storage, but the lasting service is paid. Google Cloud SQL offers Mumbai/Delhi and paid managed capabilities after its trial. OCI’s prior paid HA estimate is **superseded as the current implementation plan** by the ₹0 ceiling; it may only be revisited after funding and a new dated quote. No paid architecture is authorized.

## Not suitable for confidential survey collection

- Cloudflare Pages: static/public distribution, no private intake or database.
- Cloudflare D1 Free: wrong database engine, no India jurisdiction guarantee, short recovery window and no required KMS/network separation.
- Aiven Free MySQL: public connectivity constraints, no fixed region, single node, inactivity shutdown and no SLA.
- Supabase Free: PostgreSQL rather than MySQL, inactive-project pausing, no managed daily backups for Free projects and paid PITR; [official backup guidance](https://supabase.com/docs/guides/platform/backups) tells Free projects to export their own backups.
- Self-managed MySQL on a free VM: operator-dependent patching, failover, recovery, monitoring and incident coverage; free capacity or account continuity is not a production guarantee.
- Any expiring credit/trial: withdrawal and recovery duties can outlive the trial.

## Zero-budget conclusion

The best technically feasible ₹0 architecture is the existing static Cloudflare site plus isolated local synthetic staging and disposable MySQL verification. It maximizes engineering progress but cannot responsibly accept confidential responses. Production remains a funding and approval blocker.
