# Step 5D browser and accessibility evidence

Target: local production-equivalent static export only. The live Cloudflare Pages project is not modified.

## BrowserAct results

- English, Punjabi and Hindi survey-preview routes rendered with `lang=en`, `lang=pa` and `lang=hi`; Gurmukhi and Devanagari content was present.
- The exported preview had zero forms, zero POST requests, zero cookies and empty local/session storage.
- The first keyboard Tab reached a disclosure summary with a visible native focus outline.
- DevTools emulation measured a 320 × 800 CSS-pixel viewport, 200% page scale and `prefers-reduced-motion: reduce`; document client and scroll widths both remained 320 pixels and 11 visible controls remained available.
- No horizontal overflow was detected at desktop or the emulated mobile/zoom condition.

The public static route intentionally does not instantiate the collection form. Therefore staged-form error focus, status announcements and successful receipt focus are covered by code/unit review but were not exercised in the rendered static export. A separately authorized test harness, qualified screen-reader review and native-speaker review remain required before live collection.
