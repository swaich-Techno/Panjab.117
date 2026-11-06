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
- [ ] Independent English wording and accessibility review approved.
- [ ] Exact release artifact and rollback deployment identified.
- [ ] Separate deployment authorization received.

Until all unchecked items pass, deployment of the changed static artifact is
NO-GO. This does not affect the already deployed public preview.

The live site was checked read-only on 6 November 2026. It remained the older
multilingual, read-only deployment and still contained obsolete proposed
participation dates. No deployment or Cloudflare configuration was changed by
this work.

Release A must never say the survey is open, display synthetic counts as real
or include intake code. Release A approval cannot authorize Release B.
