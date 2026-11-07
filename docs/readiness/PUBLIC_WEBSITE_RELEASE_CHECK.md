# Public website release check

Release A is distinct from genuine survey collection.

## Engineering gate

- [x] English is the only generated public locale.
- [x] Root redirects to English.
- [x] Legacy Punjabi/Hindi paths preserve the remaining path when redirecting.
- [x] Language selector and obsolete alternate metadata are absent.
- [x] Nine-seat parliamentary scope is distinct from the three-seat district.
- [x] Survey preview contains no form action, API or persistent response store.
- [x] Search indexing remains disabled.
- [x] Final command results recorded.
- [x] Desktop/mobile/keyboard engineering review recorded.
- [x] Corrected static artifact identified and extraction-rehashed.
- [ ] Independent English wording review approved.
- [ ] Human assistive-technology accessibility review approved.
- [ ] Current Cloudflare production and a verified rollback deployment
      identified.
- [ ] Separate deployment authorization received.

Cloudflare's GitHub App identifies production deployment
`100d72ea-b09d-4ac6-a24f-e51fdf5a7b78`, and the public hostname matches its
immutable content across all seven existing production routes. This deployment
is the proposed last-known-good rollback baseline for a future release. Direct
dashboard confirmation that it remains selectable for rollback is still
pending, so the combined Cloudflare gate remains unchecked.

An owner English-content approval from Harkirat, Panjab 117 Project Lead and
Research Head, is recorded for commit
`e2847f61e6f3672a9b39cb13447b2c1fd7815423`. It is explicitly not an
independent review and does not close the independent English wording and
accessibility gate above.

Until all unchecked items pass, deployment of the changed static artifact is
NO-GO. This does not affect the already deployed public preview.

The current candidate is commit
`58ad5d33251990904de875fb4b02a0c430e1c5fb`. Its 667-file static artifact
contains 125 public routes and 117 constituency profiles. The canonical
artifact-tree SHA-256 is
`02fabbca564b873726a2cdf3c50feeb322fe6f8784a31f76f62015a2729c3605`.
The distribution ZIP SHA-256 is
`47d3b8cfc4c118ca28f6b4b33f8922ad49900bcf980a77905ce191c6a6fd4a4a`.

The earlier 60-file artifact remains preserved as superseded historical
evidence; it is not the artifact proposed for this release.

No Cloudflare configuration or production deployment was changed during this
evidence stage. The current candidate has an automatic branch preview from the
existing Git integration; it is not a production release authorization.

Release A must never say the survey is open, display synthetic counts as real
or include intake code. Release A approval cannot authorize Release B.
