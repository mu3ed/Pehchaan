# Pehchaan Awareness, Localization, and Severity Design

## Summary

Extend the existing Pehchaan assessment app with Urdu-first localization, a session-scoped language toggle, an awareness dashboard, and explainable severity tiers. The existing student management, assessment flow, scoring engine, persistence, and visual modes remain intact.

## Goals

- Make Urdu the default language on every screen, including child-facing assessment steps.
- Provide an English opt-in toggle in a persistent application header.
- Move user-facing UI copy into a typed bilingual string catalog.
- Give teachers a first-launch orientation page that explains scope and non-diagnostic boundaries.
- Classify outcomes into red, yellow, blue, or neutral language-context treatment.
- Surface tier indicators consistently in results, dashboard, class overview, and child history.
- Keep scoring and tier logic pure and independently testable.

## Non-goals

- No authentication or multi-tenant support.
- No server-side language persistence.
- No ADHD, autism, attention, math, or social screening inside assessment tasks.
- No diagnostic labels or clinical scoring.
- No video implementation unless all required work and verification are complete.

## Architecture

### Language state

Add a client-side `LanguageProvider` mounted by the root layout. It owns `language: "ur" | "en"`, defaults to Urdu, and exposes `setLanguage` plus a typed translation helper. State lasts for the current app session and does not require localStorage.

Add a shared `AppHeader` rendered on every route. It contains the Pehchaan identity, an About link, and an accessible Urdu/English toggle. The header remains calm and teacher-oriented on teacher pages and compact enough not to disrupt child-mode task screens.

The translation catalog lives outside components and uses a simple shape:

```ts
export type Language = "ur" | "en";
export type LocalizedString = { ur: string; en: string };
export const STRINGS: Record<string, LocalizedString> = ...;
```

Existing static assessment content that already has Urdu and English variants remains data-driven. UI labels, instructions, status text, summaries, action descriptions, severity copy, and awareness content are moved into the same lookup system or into typed bilingual domain data where interpolation is required.

### Awareness page

Add `/about` as a teacher-mode route. It contains short sections in this order:

1. Why Pehchaan exists.
2. What it does and does not do, including the explicit non-diagnostic boundary.
3. Awareness cards for attention/focus, math-specific difficulty, and social/communication differences. The cards name ADHD and autism as possible conditions only in explanatory copy, never as conclusions, and tell teachers to notice and refer rather than assess or label.
4. Five or six numbered steps for running an assessment.
5. No video unless the core feature set is already verified.

The page uses the existing calm palette, generous spacing, high-contrast text, and Urdu Nastaliq styling. It has a clear localized Start action that routes to `/dashboard`.

The app shell performs a session-only first-launch redirect to `/about` when the user first enters the app. `/about` itself is never redirected away. After Start, the page remains reachable through the header About link.

### Severity logic

Add a pure module, `src/lib/severity.ts`, with a function similar to:

```ts
getSeverityTier(input: SeverityInput): SeverityResult
```

The input includes the barrier category and gate concerns. The result includes:

- `tier`: `red | yellow | blue | context`.
- `priority`: numeric ordering so red sorts first.
- localized label and message keys.
- action treatment metadata.

Rules:

- Vision or hearing referral produces one red result even if both concerns are present. The message can name both concerns without producing two banners.
- Dot identity, letter position, diacritic, and memorization reliance produce yellow.
- No concerns and a positive teach response produce blue.
- Language mismatch produces context and is excluded from the red/yellow/blue scale.
- Red has the highest sort priority in class and history displays.

The existing `vision_hearing_referral` category remains the persisted barrier category. Gate details are preserved in the session input/result path so the red message can distinguish vision, hearing, or both without changing the database schema.

### Result and history integration

The result screen renders the severity banner before the barrier summary. Red uses a high-contrast urgent banner and imperative action treatment. Yellow uses an amber structured-support treatment. Blue uses a calm positive treatment. Context uses a neutral gray/teal label and explicitly says it is contextual, not a concern about the child.

The dashboard, class overview, and child history use compact tier indicators. Class groups sort red before yellow, context, and blue. Incomplete sessions remain neutral/incomplete rather than receiving a severity tier.

## Data flow

1. Root layout mounts `LanguageProvider` and `AppHeader`.
2. First app entry routes to `/about` during the current session.
3. The toggle updates shared language state; all mounted pages re-render immediately.
4. Assessment components obtain strings through the provider and preserve task data independently of display language.
5. Scoring continues to return the same barrier and action semantics, with generated summaries/actions represented bilingually for display.
6. Result, class, dashboard, and child-history screens call the pure severity helper and render the shared tier metadata.

## Error handling

- A failed API request keeps the existing loading/error fallback pattern and uses localized fallback messages.
- Missing translation keys fall back to English during development and never render `undefined`.
- Unknown barrier categories render a neutral context treatment rather than crashing.
- The first-launch redirect is guarded against redirecting `/about` and does not block direct navigation to other routes after dismissal.

## Accessibility and visual requirements

- All language controls have visible labels and `aria-pressed` state.
- Severity never relies on color alone; every badge includes text and, where appropriate, an icon.
- Red, yellow, blue, and context foreground/background pairs meet readable contrast requirements.
- Focus-visible styles remain present for links, buttons, and the language toggle.
- Urdu content uses the existing Noto Nastaliq font, RTL direction, and measured line-height/glyph treatment.
- Child task buttons retain large tap targets in both languages.

## Testing and verification

- Unit-test `getSeverityTier` for vision-only red, hearing-only red, combined red, each yellow pattern, blue no-concern outcomes, and language context.
- Test the translation helper's Urdu default, English toggle, interpolation, and missing-key fallback.
- Run the production build and lint/type checks.
- Verify first-launch navigation, About link, toggle persistence across client-side route changes, and result/class/history tier ordering in a browser.
- Manually inspect Urdu rendering on the awareness page, dashboard, gate, RAN, match, teach, processing, result, class, and child-history screens.
