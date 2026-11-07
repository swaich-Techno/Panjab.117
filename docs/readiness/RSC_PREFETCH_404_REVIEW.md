# Release A RSC segment-prefetch 404 review

Revalidated on 6 November 2026 against the remediation working tree based on
commit `a1161628b72e73c8c21e5ab72ed3e46a490534c8` and final artifact-tree
SHA-256 `14bacd6e2cef0bc8b83659e50ce8bd6052824bfaa3f2b8b94cf315a2288ba0df`.

## Observation

Next.js 16.4.4 issued same-origin segment-prefetch requests such as:

```text
GET /en/__next.$d$locale.__PAGE__.txt?_rsc=... 404
```

The broader `__next._tree.txt` payload returned 200. Captured requests were
same-origin GET or HEAD requests; there was no survey, participant-storage,
external AI or third-party tracking request.

## Reproduction evidence

- All seven direct document routes returned 200 with the expected title, H1,
  English language and main landmark.
- Activating the visible Doaba link reached `/en/regions/doaba/` with title
  `Doaba | Panjab 117`, H1 `Doaba constituencies`, `lang="en"` and one main
  landmark despite the background probe response.
- The skip link had a visible outline and moved sequential keyboard navigation
  into main content.
- No visible 404 document replaced the destination.

## Assessment

The response remains a non-user-visible same-origin prefetch inefficiency in
this static-export combination. It did not break navigation, content,
accessibility semantics or the read-only boundary in the reproduced tests. It
is a release warning, not a confirmed blocker.

`/favicon.ico` also returned 404. That separate cosmetic warning remains open
until an owner-approved icon exists; no brand artwork was invented for this
remediation.

After deployment, repeat the network and keyboard checks against the immutable
deployment URL. A visible 404, failed route, missing focus indicator or absent
title/H1 changes this assessment to a release blocker.
