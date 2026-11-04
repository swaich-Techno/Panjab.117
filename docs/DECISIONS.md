# Engineering decisions

## 001 — Server-first App Router

**Status:** Accepted

The project uses the Next.js App Router and server components by default. Client JavaScript is limited to the language selector. This reduces shipped JavaScript and establishes a clean boundary for future interactive features.

## 002 — Locale prefixes for every language

**Status:** Accepted

English, Punjabi and Hindi use `/en`, `/pa` and `/hi`. Explicit locale URLs are shareable, cacheable and allow each document to carry the correct language metadata. English is the default redirect, not an unprefixed duplicate.

## 003 — Typed in-repository dictionaries for the foundation

**Status:** Accepted

The initial amount of copy is small, so typed TypeScript dictionaries avoid an internationalization dependency. This can be revisited when pluralization, content workflows or many routes make a dedicated library valuable. Punjabi and Hindi copy has been reviewed for plainness and internal consistency, but is not represented as professionally verified translation.

## 004 — No data collection in phase one

**Status:** Accepted

Survey, sponsor and contact areas communicate status only. There are no forms, mutation endpoints or analytics in the foundation. This prevents accidental collection of personal or political data before consent, retention and governance policies exist.

## 005 — System font stacks

**Status:** Accepted

Unicode-capable Gurmukhi and Devanagari system font fallbacks are used to avoid external requests and build-time font downloads. Self-hosting reviewed font files is the preferred future enhancement when visual identity work begins.

## 006 — No constituency dataset yet

**Status:** Accepted

The homepage introduces the future directory but contains no constituency names or records. Data will be added only with a documented source, review date and verification workflow.

## 007 — Static export for the read-only Cloudflare Pages preview

**Status:** Accepted for local preparation; deployment not approved

The public website is exported as static HTML, CSS and JavaScript. Request-time
locale redirection is represented by Cloudflare's `_redirects` file, security
headers by `_headers`, and constituency filtering by an in-browser component.
This preserves the multilingual public experience without a server, API,
database, Pages Function or Worker. A runtime deployment must be reconsidered
only if a later approved feature genuinely requires server execution.

## 008 — Separate confidential intake from the static public site

**Status:** Proposed production target; Step 5A local design accepted

The public Pages project stays static and receives no database identity. Step
5A uses an in-memory synthetic adapter and draft MySQL migrations to define the
future contract without creating an endpoint. Any production intake must be a
separately reviewed private service with application-level civic/political
encryption, database role separation, MFA-protected raw access and tested
backup/deletion controls. Free tiers are not assumed to satisfy confidential
production requirements.
