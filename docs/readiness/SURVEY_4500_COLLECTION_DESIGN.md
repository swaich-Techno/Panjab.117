# Survey 4,500 collection design

Status: synthetic design only; collection disabled.

## Intake model

Each response selects exactly one of the nine eligible Assembly segments.
Eligibility is 18 or older, current residence in that segment, self-submission,
current civic consent and supported questionnaire/notice versions. Civic
questions are neutral and structured. Political-opinion questions are optional,
more sensitive, separately consented and skippable.

The system continues accepting eligible submissions after a segment reaches 500. The target is evaluated only in the monitoring projection. Validation,
authorization, emergency stop, rate limiting and duplicate screening remain
independent controls.

## Administrator monitoring projection

The development model exposes no route. It requires an authenticated principal
with `survey:progress:read` and refuses non-synthetic data. For each segment it
calculates target, raw receipts, accepted, valid retained eligible, pending,
duplicate, invalid, withdrawn, excluded, remaining, percentage, latest
successful processing time and intake health.

A production dashboard additionally requires MFA, server-side authorization,
audit logging, session controls and disclosure review. No public counter may
show identity, political preference, village-level pattern, small group or
synthetic data represented as genuine.

## Reporting

Results may describe only voluntary responses received under the documented
method. Reports must provide denominators, missingness, exclusions,
withdrawals, time window and recruitment channel; distinguish raw from valid;
avoid small cells; and state that the data are not a random sample,
representative poll or election prediction.
