# Step 4B public-preview launch gate

This gate authorizes only a read-only public website and interactive in-memory
survey preview. It cannot authorize response collection.

Status values: `verified`, `blocked`, or `not reviewed`. Evidence must identify
an immutable commit/deployment and reviewer. No unchecked item may be inferred
from a proposed date.

| Gate                                                    | Current status   | Required evidence                   |
| ------------------------------------------------------- | ---------------- | ----------------------------------- |
| exact build, format, lint, type and unit checks pass    | verified locally | Step 4B verification report         |
| 117 unique Assembly records and four directories        | verified locally | deterministic tests                 |
| Fatehgarh Sahib contains exact nine segments            | verified locally | deterministic tests/source citation |
| English, Punjabi and Hindi routes render                | verified locally | HTTP audit of 21 localized routes   |
| public assets/metadata contain no sensitive data        | verified locally | static secret/PII scan              |
| preview has no submission or persistence capability     | verified locally | route/storage/network scan          |
| draft translations and consent are labelled unapproved  | verified locally | page/source inspection              |
| keyboard, screen-reader, zoom and mobile audit          | blocked          | independent accessibility evidence  |
| canonical domain and DNS ownership verified             | blocked          | owner and DNS evidence              |
| TLS certificate and redirect verified                   | blocked          | deployed-host observations          |
| security headers and cache behavior verified externally | blocked          | deployed response captures          |
| rollback tested against exact deployment                | blocked          | deployment/rollback evidence        |
| deployment explicitly approved                          | blocked          | dated owner authorization           |

## Approval record

- Approved commit: _not set_
- Approved deployment target: _not set_
- Canonical origin: _not set_
- Release owner: _not set_
- Rollback operator: _not set_
- Authorization evidence: _not provided_

Until all blocked rows are resolved and explicit authorization is recorded, do
not deploy or enable search indexing.
