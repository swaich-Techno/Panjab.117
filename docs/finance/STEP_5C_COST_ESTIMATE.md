# Step 5C cost estimate

**Status:** planning estimate; no spending approved

**Source date:** Oracle India public rate card reviewed 4 November 2026

The ₹0 budget cannot meet private managed MySQL HA, PITR, separate KMS,
restorable backups and operational monitoring. Free services remain suitable
for synthetic development only.

## Proposed minimum baseline

| Item                                | Assumption                        |            INR/month |
| ----------------------------------- | --------------------------------- | -------------------: |
| MySQL 8.4 HA compute                | 3 × 2 ECPU × 730 h × ₹3.496947    |           ₹15,316.63 |
| HA database storage                 | 3 × 100 GB × ₹3.8218              |            ₹1,146.54 |
| Backup storage                      | 200 GB × ₹3.8218                  |              ₹764.36 |
| Inter-region backup transfer        | 50 GB × ₹3.8218                   |              ₹191.09 |
| Two private intake containers       | 2 × 1 Ampere OCPU + 4 GB RAM      |            ₹2,231.93 |
| Load balancer and 10 Mbps floor     | 730 hours                         |              ₹857.90 |
| Immutable evidence/object storage   | 20 GB plus requests               |               ₹50.35 |
| Container artifacts and excess logs | 5 GB artifacts + 15 GB logs       |               ₹83.84 |
| KMS/WAF/monitoring/network          | within published entry allowances |                ₹0.00 |
| **Direct subtotal**                 |                                   |       **₹20,642.64** |
| 25% contingency                     |                                   |        **₹5,160.66** |
| **Pre-tax envelope**                |                                   |       **₹25,803.30** |
| Provisional 18% GST                 | finance must verify               |        **₹4,644.59** |
| **Planning cash budget**            |                                   | **₹30,447.89/month** |

Recommended hard ceiling: **₹35,000/month**. Estimated calculated annual cash
envelope: **₹365,374.67**.

Rates come from the [Oracle India cloud price list](https://www.oracle.com/in/cloud/price-list/).
Oracle documents that an HA system has three equally sized MySQL instances:
[OCI HA overview](https://docs.oracle.com/en-us/iaas/mysql-database/doc/overview-high-availability.html).

## Provider and region proposal

- Hosting/database: OCI Container Instances and MySQL HeatWave 8.4 HA.
- Primary: Mumbai `ap-mumbai-1`; cold recovery copy: Hyderabad
  `ap-hyderabad-1`.
- Keys: separate HSM-backed civic, political and backup KEKs; versioned
  withdrawal and screening secrets; workload identity.
- Free eligibility: some individual services have allowances, but Always Free
  MySQL lacks HA, manual backups and PITR. Capacity and service availability are
  not production guarantees.

AWS RDS and Google Cloud SQL remain viable paid alternatives but need a dated
Mumbai configuration quote. Region selection requires legal/privacy review of
control-plane, support and subprocessor processing.

## Exclusions and limits

External legal, linguistic, methodology, accessibility and penetration review;
staff/on-call; paid support; incident retainer; outreach; custom domain; and a
warm Hyderabad stack are excluded. Warm regional recovery or higher load will
raise the estimate. No cost is permission to provision or collect data.
