# Public website release check

Release A is the English-only static site. It is distinct from genuine survey
collection.

## Engineering gate

- [x] Exact source commit and new immutable artifact recorded.
- [x] PANJAB 117 brand and PUNJAB state spelling verified in rendered content.
- [x] Root redirects to English; Punjabi/Hindi legacy paths preserve suffixes.
- [x] All 125 public routes and 117 constituency profiles verified.
- [x] Nine-seat parliamentary scope remains distinct from the three-seat
      district.
- [x] Survey preview has no form action, API or persistent response store.
- [x] No runtime Functions, production database, external AI or participant
      storage exists in the static output.
- [x] Noindex, CSP, HSTS, frame denial and restrictive permissions pass.
- [x] Browser navigation, keyboard controls, mobile reflow, reduced motion and
      all eight preview stages pass automated engineering checks.
- [x] ZIP extraction reproduced the artifact count, bytes and tree hash.
- [ ] Genuine independent English branding-delta review approved.
- [ ] Genuine human assistive-technology/accessibility review approved.
- [ ] Dashboard confirms a selectable last-known-good rollback deployment.
- [ ] Separate production deployment authorization received.

## Candidate

- Source: `9319c1dcee615fd387e0a5333c366aefb5cd3cda`
- Files: 667
- Bytes: 12,640,183
- Tree SHA-256:
  `ac32265832d95a71a4de916b165896a6dd337278abfd98ceb45ff34b84671b61`
- ZIP SHA-256:
  `0e5655a81d56ecb231af5ee7e59d959b5ba6a8ea1ed3c6e826b121f8322944c3`

Harkirat's earlier owner English-content decision is preserved and remains
explicitly non-independent. It does not certify the new branding delta. No
complete independent English or human assistive-technology record was found in
the available project materials.

Read-only checks show that current production still matches historical
deployment `100d72ea-b09d-4ac6-a24f-e51fdf5a7b78` on the homepage and does not
contain the new headline. Reachability is not dashboard rollback proof; an
authorized operator must confirm that this exact deployment remains selectable
without initiating rollback.

Until every unchecked item passes, Release A is **NO-GO**. Releases B1 and B2
remain **NO-GO** regardless of the Release A decision. No push, deployment,
Cloudflare mutation, collection, AI activation or spending is authorized.
