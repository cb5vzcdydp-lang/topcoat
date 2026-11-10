# Home and phone layout QA

- Source visual truth: user-supplied IMG_8336.png (Home cards and date strip) and IMG_8337.png (customization). The images were visible inline in the conversation; attachment filesystem copies were unavailable.
- Implementation: app/home-dashboard.tsx, components/responsive-table.tsx, app/page.tsx and app/globals.css.
- Intended viewport: phone widths 320–430 CSS px, default dark theme; desktop layout retained.
- Implementation screenshot path: unavailable.
- Source density: phone screenshots supplied inline; precise source CSS density was not verified.
- Full-view/focused comparison: blocked; no browser-rendered capture is available for a valid comparison.

## Findings

- Browser control required by the Sites managed preview workflow is unavailable. No alternate browser or server was launched. Visual fidelity, zero-horizontal-overflow, touch drag, keyboard visibility and browser console checks cannot be marked passed.
- Code and SSR checks cover the implemented structure and state logic only. They do not replace visual comparisons.

## Required fidelity surfaces

- Typography: Form's existing Manrope/DM Sans stack retained with larger card numbers and phone inputs; rendered wrapping unverified.
- Layout rhythm: fixed seven-slot calendar, configurable card spans, stacked phone records and safe-area padding implemented; rendered measurements unverified.
- Colors: Form navy/turquoise tokens retained as requested in prior messages, intentionally different from green reference.
- Assets: existing icon library retained; graphs use data-driven UI elements. No photo/raster assets are required by the requested interface.
- Copy: Overview changed to Home, customization controls name actual cards. Example measurements remain profile data rather than copied reference values.

## Primary interactions

Code paths added for card order, visibility, size, display variant, persistence, reset, date selection and navigation. Twenty-one automated configuration/calendar/SSR assertions pass. No browser interaction or console test was performed.

## Implementation checklist before visual sign-off

1. Capture Home and Customize Home at matching phone viewport/state.
2. Compare captures alongside the reference images, then review focused calendar/card/settings regions.
3. Check every page for horizontal overflow and every interactive control with touch and keyboard.
4. Record and fix any P0/P1/P2 findings, recapture and repeat.

final result: blocked

---

# Workout reference design QA

## Source and capture

- Source: `/tmp/codex-remote-attachments/01a1539a-77f1-7701-ae32-518ab83390bb/CA6BE741-651F-4A36-AB80-8246B7F3A9F7/1-Photo-1.jpg`
- Source dimensions: 590 × 1280 px.
- Implementation capture: `artifacts/workout-library-viewport-final.png`.
- Capture viewport: 390 × 844 CSS px at device scale factor 1.
- Side-by-side comparison: `artifacts/workout-design-comparison-final.png`.

## Comparison

- PASS — hierarchy: the page presents a large Workouts title, a My workouts row, and stacked saved-workout cards.
- PASS — cards: dark elevated surfaces, rounded corners, compact exercise/set chips, focus label, overflow control, and a full-width high-contrast Start workout action match the supplied reference structure.
- PASS — spacing and density: mobile gutters, card gaps, title scale, controls, and bottom navigation fit a 390 px viewport without horizontal clipping.
- PASS — interactions: the create and search controls are accessible, Start workout remains the primary action, and edit, duplicate, export, history, deload, and delete actions remain available in the overflow menu.
- PASS — responsive behavior: the card list is one column on mobile and two columns on wider screens.
- PASS — deliberate product differences: Form keeps its user-selected accent colour, existing navigation, and branding. The source app logo and fake device status bar were not copied.

## Final result

No P1 or P2 visual issues remain in the final mobile comparison.\n\n---\n\n# Design QA — compact meal diary

## Reference

- User-supplied mobile diary screenshot: compact dark meal cards, coloured meal labels, one-line meal macro totals, right-aligned food calories, and a meal-level nutrition action.
- Existing Form palette and navigation were retained so the update fits the rest of the product.

## Visual comparison

- Tested at a 390 × 844 mobile viewport in Chromium.
- Meal groups use compact 58 px headers, small coloured category pills, condensed macro totals, and a single nutrition icon.
- Logged foods use one compact row with the food name, portion metadata, and calories aligned on the right.
- The meal nutrition sheet fits the viewport, keeps readable spacing, and exposes grouped micronutrients without horizontal overflow.
- Empty meals remain compact and clearly say that no food is logged.

## Functional checks

- Opening a meal nutrition sheet shows the sum of calories, protein, carbohydrates, fat, and every available micronutrient from all foods in that meal.
- Missing nutrient values display “No data” and are never treated as zero.
- A real MyFitnessPal-style CSV was uploaded, automatically mapped, previewed, and imported into the active account.
- The same import completed when browser device storage was deliberately blocked, confirming recovery storage is optional.

## Result

Passed.

---

# Import and social mobile QA

- Reference: the user-supplied Import screen at an iPhone-sized viewport.
- Tested the Import and Social screens at 390 × 844 CSS pixels.
- A selected nutrition export now reveals a full-width **Import food history** action inside the same card, with the parsed record count and an in-card loading state.
- The import action was used with a MyFitnessPal-style CSV; one parsed record was saved with its calories and macros, and the success count appeared without reloading.
- Social uses a compact profile header, four-tab navigation, friend discovery search, mutual-friend context, request inbox, sent requests, and a responsive friends grid.
- The Social page has no horizontal overflow at 390 pixels.
- Friend discovery, mutual counts, request cancellation, request decline, and post deletion passed focused API tests.

Final result: passed.

---

# Social friends leaderboard QA

- Recreated the compact mobile friend-card layout at 390 × 844 CSS pixels with search, profile avatars, shared-activity state, average rank badges, and a high-contrast warning strip.
- A friend with one mutual challenge and a 20% average improvement rendered as Diamond on the right-hand badge.
- “Slacking” is based only on the last workout the friend chose to share; private workout history is never queried or exposed.
- Pressing **Press to warn** created a friends-only training nudge and displayed a success message. A second nudge to the same friend within 24 hours was rejected.
- Friend discovery, mutual friends, requests, removal, workout-sharing preferences, challenge scoring, and existing social sharing remain available.

Final result: passed.

---

# Mobile Train navigation and Touch Grass photo QA

- Tested at 390 × 844 CSS pixels with the six-action mobile hotbar.
- Opening the quick-add menu and then pressing **Train** closes the transient menu, selects Training, scrolls to the top, and renders the saved workout list.
- Mobile navigation buttons are explicitly non-submit buttons and clear stale modal state without deleting an unfinished workout draft.
- The supplied 399 × 501 photo loads at full natural dimensions in the Touch Grass hero, remains legible beside the checklist copy, and introduces no horizontal overflow.

Final result: passed.

---

# Manual health capture and Touch Grass QA

- Tested at 390 × 844 CSS pixels in Chromium with the real mobile bottom navigation.
- The six navigation actions fit without horizontal overflow, and **Touch grass** opens its checklist directly.
- Daily tasks reset by date; one-off tasks remain completed until changed. Creating a daily task persisted it through the private records endpoint.
- Manual step entry saved 8,450 steps to the active account and cleared the input after success.
- Browser-side OCR read a test image containing 7 h 30 min sleep, 8,450 steps, 520 active kcal, 45 exercise minutes, and 12 stand hours; every value appeared correctly in the editable review fields before saving.
- The paid screenshot-analysis endpoint was removed. If browser OCR cannot run, the selected image remains visible and every value can be entered manually.
- Type checking, health text extraction, health-unit normalization, private-record persistence, web-readiness checks, and the production build passed.

Final result: passed.

---

# Workout builder and challenge league QA

- References: the user-supplied mobile workout builder, leaderboard, profile rank, gallery, and head-to-head comparison screenshots.
- Tested the workout builder and challenge hub in Chromium at 390 × 844 CSS pixels.
- The workout builder has a compact summary, editable exercise cards, a searchable exercise library, and fixed Start and Schedule actions that stay above the safe-area navigation.
- The challenge hub has a level progress card, active/invite/completed filters, private friend invitations, nine challenge types, relative scoring, rank tiers, participant leaderboards, and progress updates.
- A Hevy-format workout CSV was selected through the real browser file-input event; the filename, one-session preview, and enabled Import action appeared without a refresh.
- Focused database tests created and joined a push-up challenge, saved a progress update, and returned a 50% relative score. All challenge calculations and workout-builder interaction tests passed.
- No horizontal overflow or clipped primary actions were observed in either mobile screen.

Final result: passed.

---

# Imported workout template QA

- Hevy workout imports now save completed history and create reusable templates under Training.
- Repeated workout titles share one stable template, and a newer imported session refreshes an untouched imported template without creating duplicates.
- Imported sessions link to their generated template.
- Every imported movement is matched against the 1,215-exercise catalogue using aliases, token similarity, spelling similarity, and the imported muscle group.
- Approximate matches retain the original imported exercise name in the template note so the substitution is reviewable.
- Database integration verified a two-set Hevy bench press becomes a two-set template and that history points to the template ID.
- Type checking, twelve importer assertions, the focused database API suite, workout builder/logger tests, and the production build passed.

Final result: passed.

---

# Simple import and calorie diary QA

- Replaced the two competing import paths with one primary flow: choose history type, choose source app, choose file, then press one full-width Import button.
- File name, parse progress, records found, errors, and success now stay inside the same card so the user does not need to scroll to discover what happened.
- Added direct support for Hevy CSV exports using `start_time`, `exercise_title`, `set_index`, and `weight_kg` columns.
- Added a horizontally scrollable mobile shortcut row to the calorie diary for food search, camera barcode scanning, repeating the most recent food, copying a prior day, and editing calorie or macro targets.
- Type checking, production build, page-render smoke tests, and ten importer assertions passed.

Final result: passed.


# Henry design QA

Result: passed.

Reference: the two screenshots supplied with the Henry hotbar request (chat welcome and Conversations drawer). Compared with rendered `/tmp/henry-390.png` and `/tmp/henry-drawer.png`; additional viewport renders at 320, 768 and 1280 pixels. The source's fake device chrome is intentionally omitted, Roscoe is renamed Henry, and an original retriever portrait is used. The existing app hotbar stays present with all six previous destinations plus Henry.

The black canvas, compact portrait header, green status, centered portrait/name, muted description, outline pills, stacked dark suggestion cards, fixed composer, muted disclaimer, rounded right drawer, green New Chat button, truncated dated chat rows, trash actions, memory footer and count follow the reference hierarchy. The drawer's blank space reflects the actual conversation count rather than fabricated history.

Interaction checks passed: actual chat controls, draft population, sending, new/open/delete conversation, memory saving, keyboard Escape, focus containment and Home navigation. Narrow-screen overflow and minimum hotbar target sizes passed. Removed inherited stable scrollbar gutter and hidden the redundant preview banner on this screen to avoid a compressed layout and covered composer. The demo status remains visible in Henry's header. Reduced-motion handling is included. The page intentionally keeps the supplied dark visual treatment while surrounding navigation retains account color preferences.

All 30 regression test files passed, TypeScript passed, and production build was verified before publication. Browser checks use Chromium responsive viewports, not physical iPhone/Android certification.

## Henry personalised colours — 23 October 2026

Henry now inherits the existing appearance tokens instead of a fixed black/green palette. Browser checks passed for dark Violet, light Rose and high-contrast system appearance, including changing the system scheme while Henry remains open. Checked chat/card backgrounds, portrait borders, accent buttons and their contrasting text, conversation drawer, memory input and mobile overflow. Fixed older light-theme input styles overriding Henry's selected surface. The user's portrait is retained. Production build passed.

## Exercise reordering — 23 October 2026

Added a compact reorder section to templates and a dedicated reorder sheet to active workouts. Numbered positions, arrow buttons, disabled boundary actions and live announcements support touch and keyboard controls. Uses existing account colours and 44px controls. Browser checks passed for arrow/direct-position moves, selected-exercise retention, Undo, template draft refresh persistence and narrow-phone/desktop layouts. Set and template preservation are covered by the expanded workout component tests. Production build and 36 page rendering checks passed.

## Remove exercises and unilateral logging — 23 October 2026

Verified the existing-themed logger at 390px, 320px and desktop widths. Remove Exercise opens an in-app confirmation with the exercise name and completed-set count, a Keep action and an explicit removal action. Unilateral is an inline exercise toggle with per-side column labels and concise paired-set instructions. Browser checks confirmed toggling does not duplicate rows or clear completed progress, removal selects a neighbour, cancellation changes nothing, and Undo restores the original selection, completed flag, unilateral setting and load. Source and saved-template behavior also pass component/D1 tests. Existing explicit side entries are preserved and explained instead of silently consolidated.

## 23 October 2026 — paired unilateral logger

Final result: passed for implemented responsive layout and tested interactions. Visual source: `/tmp/codex-remote-attachments/01a1539a-77f1-7701-ae32-518ab83390bb/77E0A461-A736-4BBC-8BC9-E5BC7F163820/1-Photo-1.jpg`, 590 × 1280 px. Final rendered comparison: `/workspace/paired-reference-size.png`, 590 × 1280 CSS px, displayed beside the source in the same review call. Additional captures: `/workspace/paired-phone.png` (390 × 844), `/workspace/paired-small.png` (320 × 740), `/workspace/paired-desktop.png` (1280 × 900).

The primary reference surfaces are retained: horizontal exercise tabs, header and timer, full-width records/warm-up buttons, shared Weight/Reps/RIR headings, independent R1/L1 rows with pale input cells, side options, and full-width Add Set/Notes. Deliberate deviations: Form's current theme and existing font hierarchy, readable full exercise names in the tabs, Pause/Undo/completion progress and Finish controls, no fake iOS status bar, and preserved Remove Exercise action. Actual exercise text comes from the user's workout, rather than the reference exercise. The reference photograph is not an app asset.

Compared the whole screen and focused paired input region. Corrected global-style overrides on full-width buttons, a four-pixel overflow at 320 px, excess body padding and wrapping status controls. The final browser run verified independent R/L edits and completion, one logical pair count, adding/deleting pairs, all four viewport sizes and no page errors. Hardware iPhone Safari/Android camera testing was not performed; this change uses standard web form controls, and the existing camera implementation was untouched.

## 23 October 2026 — weighted muscle map

Final result: passed. The existing Form anatomy screen is the visual baseline; no new screenshot replica was requested for this map. Reviewed full rendered phone and desktop states at 390 × 844 and 1280 × 900 (`/workspace/muscle-phone.png`, `/workspace/muscle-desktop.png`). Brighter graduated fills distinguish higher scores; selected muscles, the legend, ranked totals and source details remain consistent with the existing theme. Corrected desktop diagram alignment so expanding the contribution list does not vertically centre the body map in an unnecessarily tall row. The phone view has no horizontal overflow. SVG muscle regions support keyboard selection and the existing dropdown remains available.

Browser tests verified planned-week muscle selection, `0 direct × 1 + 18 indirect × 0.5 = 9 points`, the contributing exercise list and immediate updates after completing a set in the active workout. The browser used the read-only demo; durable/account-isolated storage was verified through D1 API integration tests, not falsely claimed as a demo browser save. All 32 test programs passed, with 167 assertions in the expanded API integration run. Type-checking and production build passed; importer/catalogue checks were repeated after consolidating the remaining old importer classifier. No actual iPhone Safari or Android hardware session was available.

## 23 October 2026 — theme-preserving interface polish

Final result: passed for the implemented scope. Reviewed rendered baseline screenshots before editing: `artifacts/polish-59/before-{Home,Food,Train,Social,Henry,Sleepcardio}.png`, 390 × 844 CSS px. Reviewed updated Home, Henry and Train full views, then light Home/Henry/Social and custom/high-contrast larger-text states. Updated captures use the `after-`, preset name, and `Home-{320,768,1280}` prefixes in the same ignored directory. No external visual replica was requested for this update; existing Form layouts and saved theme settings are the baseline.

Retained fonts, all existing screens/actions, account colours, Home customisation, supplied photographs, AI tools and nutrition semantics. Changed spacing, borders, text contrast, active states, shared form/control styling and purposeful motion. Corrected larger-text bottom-navigation overlap observed in screenshots and an old theme toggle which bypassed the preference provider. Phone settings navigation and focus restoration were verified after correction. No page errors in the multi-palette journey. Actual phones were not available; browser checks do not establish hardware Safari/Android coverage.

Evidence and test scope: `docs/UI_POLISH.md`. No new paid service or AI request was used for visual QA.

## 23 October 2026 — training continuation

Final result: passed. Local controlled-API browser fixtures rendered a workout with independently recorded 25 kg × 8 right and 20 kg × 10 left values, then verified comparison, source rows, saving an 8–10 rep range, reload, and weighted/direct/indirect muscle views. Changed end dates exclude records and 28-day windows include only matching records. Captures: `artifacts/training-60/side-chart.png`, `records-phone.png`, `map-phone.png` at 390 × 844 and `map-desktop.png` at 1280 × 900. Existing theme tokens and reduced-motion handling remain active. Fixed editor remounting on save (which had hidden success feedback), tightened the range fields for phones, and gave new selectors explicit accessible names. No real account/model requests were sent by the browser fixture. Independent D1 tests verify preference persistence, validation, stale-version conflicts and account isolation. All 34 test programs passed, followed by targeted preference/calculation/render checks, TypeScript and production build. Physical device testing remains unavailable.
