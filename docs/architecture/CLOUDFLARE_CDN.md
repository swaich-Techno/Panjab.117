# Cloudflare CDN and edge-security plan

Status: configuration plan only. DNS and Cloudflare settings are unchanged.

## Security objective

Cache only public, non-user-specific resources. Cloudflare is an untrusted delivery intermediary for confidential flows: it may terminate browser TLS, but it must neither cache confidential responses nor become a database network path.

## Cache-rule order

Rules are evaluated with Cloudflare's documented ordering semantics; final order must be verified with Cloudflare Trace before launch. Keep the small Free-plan allowance—currently 10 Cache Rules—simple.

1. **Bypass all sensitive paths:** `/api/auth*`, `/api/admin*`, `/api/surveys*`, `/api/private*`, `/admin*`, `/private*`, `/reports/confidential*`.
2. **Bypass personalized requests:** bypass when `Authorization` is present, an application session cookie is present, or the method is not `GET`/`HEAD`.
3. **Cache immutable build assets:** `/_next/static/*` only, honoring versioned filenames; long edge/browser TTL is acceptable.
4. **Cache reviewed public assets:** public fonts, icons, and approved public report downloads with explicit `public, max-age=..., s-maxage=...`.
5. **Public HTML:** initially honor origin headers with short TTL or no edge cache. Add page caching only after a response-variance review.

Never create an Edge TTL override that causes `private` or `no-store` content to be cached. Never use “cache everything” globally.

## Required origin headers

Sensitive and user-specific responses:

```http
Cache-Control: private, no-store, max-age=0
Cloudflare-CDN-Cache-Control: no-store
Pragma: no-cache
Vary: Cookie, Authorization
```

Public immutable assets:

```http
Cache-Control: public, max-age=31536000, immutable
```

Public HTML should start conservatively:

```http
Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=60
```

Only use the public HTML policy when the response contains no session, preview, role, geography-derived, draft, or user-specific content. Responses that set cookies are not cache candidates.

## Edge security controls

- Enable the Free Cloudflare Managed Ruleset and review false positives. Free-plan request-body inspection is currently limited to 1 MB; enforce a much smaller survey payload limit in the application.
- Apply a basic rate-limiting rule to survey/auth endpoints if plan capacity permits, but enforce per-route token buckets, submission idempotency, request size limits, and abuse detection in the application too.
- Allow only required HTTP methods. Reject TRACE and unexpected content types.
- Use TLS Full (strict), current minimum TLS policy, automatic certificate renewal, and HSTS only after the complete hostname inventory is correct.
- Add a tested Content Security Policy at the application. Cloudflare is compatible with CSP but does not design it for the application.
- Strip diagnostic headers and ensure edge logs do not contain request bodies, answers, consent text, tokens, or full IP addresses beyond a documented short security-retention need.
- Lock down the OCI origin; CDN/WAF controls can be bypassed if attackers can reach the origin directly.

## Verification tests

For each sensitive URL, perform two authenticated and two unauthenticated requests with distinct test users and synthetic payloads:

```powershell
curl.exe -I https://example.invalid/api/surveys/example
curl.exe -I https://example.invalid/api/surveys/example
```

Acceptance criteria:

- `CF-Cache-Status` is `DYNAMIC` or `BYPASS`, never `HIT`.
- `Age` is absent for sensitive responses.
- `Cache-Control` and `Cloudflare-CDN-Cache-Control` include `no-store`.
- User A can never receive User B's body, headers, status, or redirect.
- POST bodies are never cached; retries require an idempotency key.
- Immutable static assets become `HIT` on a repeated request and preserve correct content type and integrity.
- Cloudflare Trace shows the intended bypass rule winning.

Automate these tests against a synthetic-data staging zone before enabling survey collection.

## Free-plan limitations and terms

The Free plan currently provides 10 Cache Rules, limited managed-WAF capabilities, and a 1 MB WAF body-inspection limit. Cloudflare markets Free for personal/hobby use and provides no contractual availability commitment suitable for this project's confidential production path. Service-specific terms govern CDN content and prohibit treating CDN features as general-purpose large-file/video hosting on non-Enterprise plans. The account owner must review current terms before public launch.

## Sources verified 2026-11-03

- [Cloudflare default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)
- [Cloudflare Cache Rules and plan availability](https://developers.cloudflare.com/cache/how-to/cache-rules/)
- [Cloudflare Cache Rule settings](https://developers.cloudflare.com/cache/how-to/cache-rules/settings/)
- [Cloudflare Origin Cache Control](https://developers.cloudflare.com/cache/concepts/cache-control/)
- [Cloudflare managed WAF rules](https://developers.cloudflare.com/waf/managed-rules/)
- [Cloudflare plans](https://www.cloudflare.com/plans/)
- [Cloudflare application-services terms](https://www.cloudflare.com/service-specific-terms-application-services/)
- [Cloudflare CSP reference](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/content-security-policies/)
