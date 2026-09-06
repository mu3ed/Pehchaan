# Awareness, Localization, and Severity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Urdu-first app localization, a session-scoped language toggle, an awareness dashboard, and explainable red/yellow/blue/context severity indicators across the existing Pehchaan app.

**Architecture:** Keep scoring and severity decisions in pure modules. Mount a client `LanguageProvider` and shared `AppShell` from the root layout; pages consume the provider through `useLanguage()`. Store all display copy in typed bilingual data, while assessment responses remain language-independent. Derive history/class indicators from persisted barrier and gate fields without changing the SQLite schema.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Prisma 5 + SQLite, existing Noto Nastaliq Urdu font and UI primitives.

---

## File map

- Create `src/lib/i18n/strings.ts`: typed bilingual catalog for shared UI, awareness copy, severity copy, and page labels.
- Create `src/lib/i18n/context.tsx`: Urdu-default React provider, translator, interpolation, and session-scoped first-launch state.
- Create `src/components/layout/AppHeader.tsx`: persistent accessible identity, About link, and Urdu/English toggle.
- Create `src/components/layout/AppShell.tsx`: provider consumer, header, and first-launch redirect guard.
- Create `src/app/about/page.tsx`: calm teacher-facing awareness dashboard.
- Create `src/lib/severity.ts`: pure tier mapping and sort metadata.
- Create `src/lib/severity.test.ts`: red/yellow/blue/context unit coverage.
- Create `src/lib/i18n/strings.test.ts`: default language, toggle, interpolation, and fallback coverage.
- Modify `src/app/layout.tsx`: mount `AppShell` around route content.
- Modify `src/types/index.ts`: localized text types, bilingual content fields, severity types, and gate concern result fields.
- Modify `src/content/gate-questions.ts`, `src/content/teach-cards.ts`, and `src/content/action-library.ts`: ensure all displayed content has Urdu and English values.
- Modify `src/lib/scoring.ts`: return bilingual summaries and explicit gate concerns.
- Modify `src/app/session/[id]/page.tsx`: consume shared language, localize every step, and render the tier banner first on results.
- Modify `src/app/dashboard/page.tsx`, `src/app/child/[id]/page.tsx`, and `src/app/class/page.tsx`: consume localized strings and tier indicators.
- Modify `src/app/api/children/route.ts`, `src/app/api/class/route.ts`, and `src/app/api/sessions/[id]/score/route.ts`: expose the persisted flags needed for tier rendering without language-specific labels.
- Modify `src/types/index.ts` and class API response shape: make category the stable identifier; derive labels/hints in the client catalog.
- Modify `package.json`: add a test command and the selected lightweight TypeScript test runner if one is not already available.

## Task 1: Establish bilingual domain types and translation infrastructure

**Files:**
- Create: `src/lib/i18n/strings.ts`
- Create: `src/lib/i18n/context.tsx`
- Create: `src/lib/i18n/strings.test.ts`
- Modify: `src/types/index.ts`
- Modify: `package.json`

- [ ] **Step 1: Define the localization types and failing tests**

Add these public types to `src/types/index.ts`:

```ts
export type Language = "ur" | "en";
export interface LocalizedText { ur: string; en: string; }
```

Add tests that assert the default language is Urdu, `t("nav.about")` returns the Urdu entry by default, `setLanguage("en")` returns English, interpolation replaces `{name}`, and an unknown key falls back to its key-safe English text rather than `undefined`.

- [ ] **Step 2: Run the focused tests and confirm they fail**

Run `npm test -- --run src/lib/i18n/strings.test.ts` after adding the script/runner. Expected result: failure because the provider/catalog exports do not exist yet.

- [ ] **Step 3: Implement the catalog and provider**

Use a typed catalog shape:

```ts
export const STRINGS: Record<string, LocalizedText> = {
  "nav.about": { ur: "پیچان کے بارے میں", en: "About Pehchaan" },
  "nav.dashboard": { ur: "کلاس", en: "Class" },
  "nav.urdu": { ur: "اردو", en: "Urdu" },
  "nav.english": { ur: "English", en: "English" },
  "common.start": { ur: "شروع کریں", en: "Start" },
  "common.loading": { ur: "لوڈ ہو رہا ہے…", en: "Loading…" },
  "common.notDiagnosis": { ur: "یہ تشخیص نہیں ہے۔", en: "This is not a diagnosis." },
  // Include every shared label used by the pages and assessment.
};
```

Implement `translate(key, language, variables)` with English fallback and `{variable}` interpolation. Implement `LanguageProvider` with Urdu initial state, `useLanguage()`, `firstLaunch`, `completeFirstLaunch()`, and a stable `t` callback.

- [ ] **Step 4: Add the test command and run the focused tests**

Add `"test": "vitest"` and the minimal test dependency/configuration needed by the repository. Run the focused test file and expect all localization tests to pass.

## Task 2: Mount the shared shell and awareness dashboard

**Files:**
- Create: `src/components/layout/AppHeader.tsx`
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/app/about/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css` only if the shell needs a shared focus/RTL utility.

- [ ] **Step 1: Add the provider/header shell wiring**

Wrap `{children}` in `layout.tsx` with `<AppShell>{children}</AppShell>`. `AppShell` must mount `LanguageProvider`, render `AppHeader`, and use `usePathname()` plus `useRouter()` to redirect only when `firstLaunch` is true and the pathname is not `/about`. The About route must be exempt. The Start button calls `completeFirstLaunch()` before routing to `/dashboard`.

- [ ] **Step 2: Implement the accessible header**

Render a calm compact header on every route with:

- Pehchaan identity linking to `/dashboard`.
- About link using `t("nav.about")`.
- Two buttons labeled `اردو` and `English`, with `aria-pressed`, visible focus rings, and the active language visually distinct.
- `dir="rtl"` only on localized Urdu text spans; do not reverse the whole application layout.

Use the existing green teacher palette and keep the header height small enough for the child task viewport.

- [ ] **Step 3: Build `/about` with bilingual sections**

Create short sections in the specified order: why this exists; what the app does/does not do; three awareness cards; five or six numbered assessment steps. The cards explicitly name ADHD and autism as conditions that may relate to some observed differences but state that Pehchaan does not assess or diagnose them. Each card must contain two or three everyday signs and one “mention this to the school or a specialist” line.

Every paragraph, heading, card label, button, and disclaimer must come from `STRINGS` or a typed bilingual awareness data array. Use `ur` classes for Urdu output and the existing calm `Card`, `Button`, and `Chip` primitives. The Start action must be prominent and localized.

- [ ] **Step 4: Verify first launch and shell behavior**

Run the dev server, open `/`, and confirm the first route is `/about`. Click Start and confirm `/dashboard`; navigate to a child/session route and confirm the header and language toggle remain visible. Refreshing may show About again because the state is intentionally session-scoped.

## Task 3: Localize static assessment content and scoring output

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/content/gate-questions.ts`
- Modify: `src/content/teach-cards.ts`
- Modify: `src/content/action-library.ts`
- Modify: `src/lib/scoring.ts`

- [ ] **Step 1: Expand content interfaces to bilingual fields**

Change gate questions/options to use `LocalizedText` for question, note, and label. Change teach-card explanation and dot descriptions to `LocalizedText`. Extend `ActionEntry` with `descriptionUrdu` and `whenUrdu` while retaining English fields for compatibility. Change `ScoringResult.summary` values to `LocalizedText` and add:

```ts
gateConcerns: { vision: boolean; hearing: boolean };
```

- [ ] **Step 2: Add Urdu and English values to all content records**

Keep the stored channel/category identifiers unchanged. Add explicit Urdu and English text for all gate prompts/options, teach explanations, retry hints, action descriptions, action timing, barrier labels, and barrier hints. Do not infer Urdu at render time from English or use a missing-value fallback for content that is shown to teachers or children.

- [ ] **Step 3: Make scoring results bilingual without changing classification**

Keep `scoreSession()` classification and thresholds unchanged. Include `checkGateReferral()` output in the returned `gateConcerns`. Update `generateSummary()` and referral summaries to return `{ ur, en }` values. Build the same messages in both languages from the same measured values, including RAN time, retry counts, language, and dominant channel. Return bilingual action entries from the existing action library.

- [ ] **Step 4: Run type checking**

Run `npx tsc --noEmit`. Fix every consumer that still assumes a plain string before continuing.

## Task 4: Localize the complete assessment and teacher pages

**Files:**
- Modify: `src/app/session/[id]/page.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/child/[id]/page.tsx`
- Modify: `src/app/class/page.tsx`
- Modify: `src/components/ui/UrduText.tsx` only if it needs a localized-text helper.

- [ ] **Step 1: Add `useLanguage()` to every client page**

Use `const { language, t } = useLanguage()` and replace all inline English UI strings with catalog keys. Use a small `localized(text: LocalizedText)` helper for content objects. Keep names, category identifiers, home-language values, and response data unchanged.

- [ ] **Step 2: Localize the assessment step by step**

Update gate question rendering to use the selected language for question, note, and option labels. Update RAN instructions, timer/count labels, cheer copy, match instructions/buttons, teach/retry instructions, processing checklist, and result labels/buttons. Preserve all Urdu glyph classes and large tap targets. Render bilingual scoring summaries/actions by selecting `summary.wentWell[language]`, `action.descriptionUrdu` when Urdu, and the corresponding English field otherwise.

- [ ] **Step 3: Localize dashboard, child history, and class view**

Replace page headings, add-child form labels, empty/loading/error states, date/status labels, disclaimers, navigation labels, and class overview copy with catalog entries. Keep barrier/category labels and hints language-independent in API responses; select their localized versions on the client.

- [ ] **Step 4: Verify language switching across routes**

With the app open, toggle English on About, Dashboard, Gate, RAN, Match, Teach, Result, Class, and Child History. Navigate client-side between each route and confirm the selection remains English; toggle back and confirm Urdu Nastaliq renders correctly.

## Task 5: Implement and test severity tiers

**Files:**
- Create: `src/lib/severity.ts`
- Create: `src/lib/severity.test.ts`
- Modify: `src/types/index.ts`
- Modify: `src/lib/i18n/strings.ts`

- [ ] **Step 1: Write the failing severity tests**

Cover these exact cases:

```ts
expect(getSeverityTier({ barrierCategory: "vision_hearing_referral", gateConcerns: { vision: true, hearing: false } }).tier).toBe("red");
expect(getSeverityTier({ barrierCategory: "vision_hearing_referral", gateConcerns: { vision: true, hearing: true } }).messageKey).toBe("severity.red.both");
expect(getSeverityTier({ barrierCategory: "dot_identity_pattern", gateConcerns: { vision: false, hearing: false } }).tier).toBe("yellow");
expect(getSeverityTier({ barrierCategory: "no_concerns", gateConcerns: { vision: false, hearing: false } }).tier).toBe("blue");
expect(getSeverityTier({ barrierCategory: "language_mismatch", gateConcerns: { vision: false, hearing: false } }).tier).toBe("context");
```

Also assert priority ordering `red < yellow < context < blue`, and that unknown categories safely return context.

- [ ] **Step 2: Implement the pure severity mapping**

Export `SeverityTier`, `SeverityInput`, `SeverityResult`, and `getSeverityTier()`. Map red to one combined urgent state, yellow to the four structured teaching categories, blue to `no_concerns` and positive teach outcomes, and context to language mismatch/unknown categories. Return localized string keys rather than hardcoded display copy.

- [ ] **Step 3: Add localized severity copy and run tests**

Add red single-concern and combined-concern labels/messages, yellow structured-support copy, blue calm copy, and neutral language-context copy to the catalog in both languages. Run `npm test -- --run src/lib/severity.test.ts src/lib/i18n/strings.test.ts` and expect all tests to pass.

## Task 6: Wire severity into result, class, dashboard, and history

**Files:**
- Create: `src/components/teacher/SeverityBanner.tsx` if shared result/class presentation is large enough to warrant it.
- Modify: `src/app/session/[id]/page.tsx`
- Modify: `src/app/api/children/route.ts`
- Modify: `src/app/api/class/route.ts`
- Modify: `src/app/child/[id]/page.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/class/page.tsx`
- Modify: `src/types/index.ts`

- [ ] **Step 1: Expose only stable persisted flags from APIs**

Include `referralFlag` in latest-session dashboard/history selects. In the class API, parse the latest session gate answers when available, compute `gateConcerns`, and include `tier` plus the stable `barrierCategory`; stop returning English-only labels/hints as the source of truth. Keep red group sorting first, then yellow, context, and blue.

- [ ] **Step 2: Render the result tier first**

At the top of `ResultStep`, call `getSeverityTier()` with `result.barrierCategory` and `result.gateConcerns`. Render a text-and-icon banner before the barrier summary. Red must state the urgent referral action and combine both concerns into one message. Yellow must frame actions as sustained structured teaching. Blue must remain calm and non-alarming. Context must explicitly state that home-language context is not a deficit signal.

- [ ] **Step 3: Add compact indicators to list/history views**

Use the same tier function and localized labels in dashboard rows, child session history, and class children/groups. Indicators must include text or an accessible label, not color alone. Incomplete sessions show the existing neutral incomplete state and never receive a tier.

- [ ] **Step 4: Verify tier ordering and visual contrast**

Seed or use existing records for red, yellow, context, and blue outcomes. Confirm class view places red first and that the red banner is the first result content. Inspect foreground/background contrast and focus-visible behavior for all tier indicators.

## Task 7: Full verification and cleanup

**Files:**
- Modify: any implementation files needed to resolve test/build/lint findings.
- Do not modify: the attached plan file.

- [ ] **Step 1: Run focused tests**

Run `npm test -- --run` and confirm localization and severity tests pass.

- [ ] **Step 2: Run static checks**

Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`. Expected result: no TypeScript, ESLint, or Next.js build errors.

- [ ] **Step 3: Verify API behavior**

Use the existing SQLite-backed API flow to create or reuse a child/session, score a red case and a non-red case, and confirm the score response contains bilingual summary values and `gateConcerns` while persisted barrier/referral fields remain compatible.

- [ ] **Step 4: Verify the browser flow**

Open the app and verify first launch → About → Dashboard → child → assessment. Exercise the full gate → RAN → match → teach/retry → processing → result flow in Urdu, switch to English during navigation, and inspect class/history tier indicators. Confirm no Urdu text is invisible and no child-mode control becomes too small.

- [ ] **Step 5: Final scope audit**

Confirm the About page contains Sections 1–4, explicitly names ADHD/autism only as awareness context, contains no diagnostic scoring, and that no video work was added ahead of the required functionality.
