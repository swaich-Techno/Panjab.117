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
- [ ] Independent English wording and accessibility review approved.
- [ ] Current Cloudflare production and a verified rollback deployment
      identified.
- [ ] Separate deployment authorization received.

An owner English-content approval from Harkirat, Panjab 117 Project Lead and
Research Head, is recorded for commit
`e2847f61e6f3672a9b39cb13447b2c1fd7815423`. It is explicitly not an
independent review and does not close the independent English wording and
accessibility gate above.

Until all unchecked items pass, deployment of the changed static artifact is
NO-GO. This does not affect the already deployed public preview.

The corrected candidate is based on commit
`a1161628b72e73c8c21e5ab72ed3e46a490534c8`, with public-source diff SHA-256
`90beb48cc020c871eb4ed1d24079b124c78742d8e89ae9edaea31314ca437a24`.
Its 60-file artifact-tree SHA-256 is
`14bacd6e2cef0bc8b83659e50ce8bd6052824bfaa3f2b8b94cf315a2288ba0df`.

The Cloudflare dashboard presented its normal human-verification challenge.
No production or rollback deployment ID was inferred, and no Cloudflare
configuration or deployment was changed.

Release A must never say the survey is open, display synthetic counts as real
or include intake code. Release A approval cannot authorize Release B.
