# Step 4C independent browser, mobile and accessibility checks

Status: **prepared, not completed**.

BrowserAct and its required `uv` installer were not available in the local
workspace. No tooling was installed without approval. These checks require an
independent reviewer and must not be marked complete from source inspection.

## Test artifact

- exact commit SHA: _not set_
- static artifact hash: _not set_
- deployed or local origin: _not set_
- reviewer and date: _not provided_

## Browser and viewport matrix

Test current stable Chrome/Edge, Firefox and Safari where available at:

- 320 by 568 and 390 by 844 mobile viewports;
- 768 by 1024 tablet portrait;
- 1280 by 720 small desktop; and
- 1440 by 900 desktop.

For every locale, inspect homepage, all four region templates, Fatehgarh Sahib,
survey preview, root redirect and 404.

## Keyboard and focus

- traverse every control using Tab and Shift+Tab only;
- verify skip link, visible focus, logical order and no keyboard trap;
- operate language selection, client directory search, clear action, details,
  checkboxes, radios, Back, Next, Skip and Restart;
- confirm validation errors are announced and focus context stays clear; and
- repeat with reduced motion enabled.

## Screen reader

Use at least NVDA with Firefox/Chrome on Windows and VoiceOver with Safari on
an available Apple device. Verify document language, headings, landmarks,
lists, form labels, fieldsets/legends, required/optional state, progress,
errors and dynamic result counts in English, Punjabi and Hindi.

## Zoom, reflow and contrast

- test browser zoom at 200% and 400%;
- confirm no two-dimensional scrolling at a 320 CSS-pixel viewport except
  intentionally scrollable navigation;
- confirm text is not clipped and controls remain reachable;
- measure text, control, focus and status contrast against the accepted WCAG
  target; and
- confirm Gurmukhi and Devanagari glyphs render without replacement boxes.

## Privacy and network inspection

- clear browser storage and open DevTools Network and Application panels;
- complete, backtrack and restart the survey preview;
- verify no request carries selections or consent state;
- verify no cookie, local/session storage, IndexedDB, cache entry or service
  worker stores response state;
- verify reload clears all preview choices; and
- verify no analytics, AI, API or third-party script request appears.

## Evidence required

Retain screenshots at each viewport, accessibility-tree or screen-reader notes,
keyboard results, contrast measurements, network HAR with sensitive values
absent, storage screenshots, defects and remediation retest. Reviewer sign-off
must name the exact commit or deployment.
