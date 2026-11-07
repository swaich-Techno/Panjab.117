# Zero-budget hosting decision

Evidence reviewed: 7 November 2026. Authorized spend: **₹0**.

Decision: the read-only static site can remain on the existing Cloudflare
Pages Free project. Confidential survey collection remains **NO-GO** because
no evaluated ₹0 option provides the required combination of availability,
recovery, key custody, support and operational assurance.

## Available at ₹0

### Existing Cloudflare Pages static site

Suitable for public, non-confidential, read-only files only. Cloudflare's
current Free limits allow 500 builds per month, 20,000 files, 25 MiB per file,
100 header rules and 2,100 combined redirects. The current 667-file export is
well inside those limits. Pages must remain independent of the future intake
service and must contain no response endpoint or participant storage.

Official source:
https://developers.cloudflare.com/pages/platform/limits/

### Local synthetic development

Node.js, the checked-in test harness, local Chrome/Playwright, Git, open-source
MySQL tooling and an owner-authorized disposable MySQL server can be used at
₹0. This is suitable for development evidence, not genuine participant data.

### Oracle MySQL HeatWave Always Free

Published price: ₹0 while the service remains eligible for Always Free. The
offer has one fixed 50 GiB MySQL system and one day of automatic backup
retention. Oracle requires a valid credit/debit card for identity verification
and may suspend accounts that remain idle for 30 days.

It is **not suitable for confidential production collection**. Oracle states
that Always Free has no high availability, read replica, manual backup,
point-in-time recovery, Database Management/Ops Insights integration, SLA or
Oracle Support. Those gaps violate this project's recovery and operations
requirements.

Official sources:

- https://docs.oracle.com/en-us/iaas/mysql-database/doc/features-mysql-heatwave-service.html
- https://docs.oracle.com/en-us/iaas/mysql-database/doc/overview-backups.html
- https://www.oracle.com/cloud/free/faq/

### Google Cloud SQL free trial

Published price: ₹0 for the fixed 30-day trial instance, but billing must be
enabled and a new user must supply a payment method. The trial is explicitly
not recommended for production, has no SLA and does not support ordinary
backups or restoration. It can also incur network or final-backup charges.

It is **not a continuing free tier** and is not suitable for confidential
production collection.

Official source:
https://docs.cloud.google.com/sql/docs/mysql/free-trial-instance

### AWS RDS free tier

The offer for eligible new customers includes 750 Single-AZ instance hours,
20 GB storage and 20 GB automated-backup storage per month for one year. It is
time-limited, Single-AZ and becomes billable outside the allowance. It is not
a sustainable ₹0 production design for this project.

Official source: https://aws.amazon.com/rds/mysql/pricing/

## Funded baseline, not an authorized implementation plan

Oracle's published global list prices MySQL compute at USD 0.0366 per ECPU-hour
and storage at USD 0.04 per GB-month, with a 50 GB storage minimum. Oracle
documents a high-availability system as three MySQL instances. A deliberately
small one-ECPU-per-instance, 50 GB HA database therefore has a published-unit
lower bound of:

`3 × 1 ECPU × 730 hours × USD 0.0366 + 50 GB × USD 0.04 = USD 82.154/month`

At the RBI-published 6 November 2026 rate of ₹94.1402 per USD, that is about
**₹7,734/month for database compute and primary storage alone**. It excludes
the private intake service, independent backup copy, KMS/key administration,
monitoring, egress, support, taxes and people. It is not a final quote and does
not authorize spending.

Official sources:

- https://www.oracle.com/in/a/ocom/docs/corporate/pricing/oracle-paas-and-iaas-global-price-list.pdf
- https://docs.oracle.com/en-us/iaas/mysql-database/doc/high-availability.html
- https://www.rbi.org.in/

AWS RDS and Google Cloud SQL also support paid HA, private networking,
encryption and recovery features, but their exact total depends on the chosen
region, instance shape, storage, backup retention and network path. A provider
calculator quote, contract review and owner funding approval are required
before selecting either. A temporary credit or introductory allowance is not
a recurring production budget.

## Privacy and jurisdiction conditions

The proposed production region must not be selected until a qualified legal
and privacy reviewer has recorded the controller/data-fiduciary roles,
processor terms, exact data location and subprocessor transfers, retention,
breach handling, participant rights and deletion obligations. The Digital
Personal Data Protection Act, 2023 and the phased commencement notification
and Rules published on 13 November 2025 are the primary legal texts; this
engineering document is not legal advice.

Official sources:

- https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf
- https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf
- https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf

## Production blockers at ₹0

- supported private intake compute with no public database path;
- managed MySQL HA and point-in-time recovery;
- independently retained encrypted backup and a witnessed restore;
- separate civic/political production keys with named custodians and rotation;
- administrator MFA, secrets management and monitored audit delivery;
- incident/on-call ownership and a durable withdrawal channel;
- provider, privacy, legal, methodology and security approval; and
- recurring funding or a donated arrangement with enforceable terms, duration,
  region, support and an exit plan.

Static Pages, browser storage, spreadsheets, public forms, personal computers
and unreviewed free survey services must never hold political-opinion answers.
