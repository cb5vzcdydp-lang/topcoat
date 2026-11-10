# Remaining features and interface consolidation

Requested 29 October 2026. This tracker distinguishes implementation from platform/device verification; no status advances without checks. Existing account data, user colour preferences and AI are preserved.

## Working sequence

1. Capture baseline screens and consolidate navigation: configurable five-slot hotbar including More; grouped sidebar; dedicated advanced tools; lightweight daily screens.
2. Complete feasible exercise, recipe, health-import, measurement, planning and recovery gaps with account-scoped storage and tested calculations.
3. Complete account/privacy, upload, media and quota controls using existing infrastructure.
4. Centralize text/date/unit conventions; verify keyboard, large text, responsive layouts and performance.
5. Run a release checklist, publish tested code and clearly identify any genuine external verification limits.

## Inventory at start

- [x] 025 **Equipment and muscle filters** (partial): Combine equipment, movement, muscle and difficulty filters instead of searching only by name.
- [x] 028 **Custom exercise images** (pending): Attach a small self-made image to a custom exercise, respecting the shared media cap.
- [ ] 036 **Library corrections workflow** (partial): Let users propose a duplicate, wrong muscle tag or inaccurate cue; let the owner review changes before publication.
- [x] 043 **Progression rule editor** (partial): Let users define rep ceilings, load jumps and repeat-session rules; coaches approve changes where relevant.
- [x] 045 **Technique-change annotations** (partial): Mark a new range, machine or execution style so graphs do not silently compare incompatible performances.
- [x] 057 **Walk-run progression plans** (partial): Provide editable interval templates and completion tracking without dynamically prescribing intensity.
- [x] 069 **Recipe nutrition versioning** (partial): Keep logged servings tied to the recipe version used on that date when ingredients later change.
- [ ] 072 **Diary validation and undo** (partial): Flag implausible portions, distinguish missing from zero and offer undo after food deletion.
- [x] 091 **Body-fat uncertainty range** (partial): Accept a manually entered range and show how that changes checkpoint weights and FFMI.
- [ ] 119 **Closed-app web push** (verification): Add only after confirming Sites can run a sender, with opt-in permission, quiet hours and delivery testing.
- [ ] 122 **Unified selected date** (partial): Keep one clearly visible selected date across Home, food and progress screens, with a return-to-today action.
- [ ] 123 **Continue-last-task card** (partial): Resume the unfinished workout, incomplete food entry or selected planning task from Home.
- [x] 128 **Consistent back navigation** (pending): Preserve search, scroll and selected date when returning from a detail page.
- [ ] 130 **Phone layout test matrix** (verification): Verify narrow screens, large text, landscape mode and keyboard-open forms before each release.
- [ ] 132 **Home performance budget** (verification): Set limits for initial scripts, image sizes and unnecessary requests, then measure on a slower phone.
- [ ] 157 **Attention queue filters** (partial): Separate missed logs, overdue check-ins and stalled trends, with configurable thresholds.
- [ ] 185 **Idempotent saves everywhere** (partial): Extend duplicate-safe retries beyond workouts to meals, measurements, comments and imports.
- [ ] 188 **Interrupted-upload handling** (partial): Avoid orphaned media and make a failed upload clearly recoverable or removable.
- [ ] 191 **Time-zone consistency tests** (verification): Keep session dates, sleep dates, reminders and streak boundaries correct when travelling or crossing midnight.
- [ ] 193 **Large-text layout** (partial): Support system text scaling and a larger in-app reading size without clipping forms or tables.
- [ ] 194 **Screen-reader workflow** (partial): Label live-set inputs, announce save/error states and keep a sensible reading order.
- [ ] 195 **Keyboard-only operation** (partial): Make exercise search, logging, menus and dialogs fully usable without touch or a mouse.
- [ ] 199 **Custom display units** (partial): Set kg/lb, distance, pace, water and date conventions consistently across pages and exports.
- [ ] 204 **Translation-ready text** (pending): Centralise labels, dates and units so additional languages can be added without rewriting every screen.
- [ ] 206 **Granular sharing consent** (partial): Separate workout, nutrition, measurement and photo sharing instead of one unclear all-data toggle.
- [ ] 207 **Delete-my-data workflow** (partial): Explain scope, require confirmation and delete the user's records and media without affecting other accounts.
- [ ] 208 **Session/device controls** (verification): Show available sign-in/device status and link to the platform controls for revocation where supported.
- [x] 210 **Media retention choices** (partial): Offer expiry dates or cleanup suggestions for old clips/photos while excluding records the user wants to keep.
- [ ] 213 **Input and upload hardening** (partial): Keep size/signature validation, schema checks and safe rendering consistent across every endpoint.
- [ ] 216 **Data-use explanation** (partial): Provide a concise policy stating what is stored, who can see it and that this edition does not send data to AI.
- [ ] 218 **Source-priority rules** (partial): Let users choose which source wins for steps, sleep or weight when several devices overlap.
- [x] 225 **Correct and undo health imports** (partial): Review an imported batch, fix its source/date mapping or remove it safely.
- [ ] 226 **Metric reference sources** (partial): Attach source/version/cohort information to any published reference bands and distinguish wearable estimates from tests.
- [x] 229 **Usage and quota dashboard** (partial): Show app-controlled media usage and available platform limits without claiming visibility into billing the app cannot read.
- [ ] 231 **Release checklist** (verification): Require checks for sign-in, logging, imports, isolation and mobile layout before publishing an update.
- [ ] 232 **Restore rehearsal** (verification): Validate backup integrity and practise recovery in a separate test environment before an incident.
- [ ] 235 **Small-group access manager** (partial): Show the difference between Sites viewer access, Form friendship and coaching consent.
- [ ] 237 **Performance regression checks** (verification): Measure heavy diary/history pages with larger test datasets and avoid unnecessary repeated requests.
- [ ] 238 **Storage and query budgets** (partial): Bound expensive lists/import batches and monitor indexed queries so small-group use stays efficient.
- [ ] 239 **No-paid-service guard** (partial): Check code/configuration for reintroduced AI calls, R2 bindings or billable optional services before publishing.

## Evidence and decisions

- Baseline mobile screenshots: `artifacts/completion-before/`. Home: 2,866 px main height / 10 panels; Food: 2,690 px / 10 panels; Train: 2,372 px / 8 panels on the controlled 390 px fixture. Counts include collapsed modules.
- No physical device, platform billing dashboard or platform session-revocation capability is implied by an automated browser test.

## Current implementation and visual evidence — 31 October

- Consulted the five isolated reference repositories; no provider routes, external agent runtimes or paid model services were installed or invoked. Agency frontend guidance was used as a responsive/accessibility checklist.
- Added configurable Home/Food/Train/Henry hotbar destinations with More, grouped sidebar, global search, a contextual Tools page, remembered workout filters/food queries, and browser Back/date/scroll continuity. A legacy Henry stylesheet forced seven hotbar columns globally; removed that override so configured destinations fill the dock evenly.
- Moved repeated advanced panels off Home, Food and Train; kept Add food, Scan barcode, meal groups and Save actions visible. The controlled 390 px fixture fell from 10/10/8 panels on Home/Food/Train to 5/3/5. Native disclosures reveal occasional actions. Saved colours remain unchanged.
- Added image uploads/removal for custom exercises, editable multiweek walk-run schedules and saved completions, effective progression rules, dated technique comparison segments, legacy recipe-version snapshots and checkpoint weight scenarios.
- Main nutrition editing distinguishes missing macros from known zero, gives portion warnings and preserves deletion Undo. Source priorities feed daily/sleep/recovery summaries without rewriting imported or manual source data.
- Reviewed health imports preview source/date corrections before save, persist resumable batch jobs and undo only unchanged readings. Later edits survive rollback.
- Private media tools show real shared R2 usage against an app-controlled 1 GiB upload budget, private keep-forever/expiry-review settings and unattached upload cleanup. Provider billing/quota remains explicitly unavailable. Expiry is a review reminder, not automatic deletion.
- All JSON endpoints now use bounded request readers; existing AI functions and private secrets remain.

### Release checks

- TypeScript and all 49 programs in the automated test command passed. Home and Henry checks were repeated after the final presentation refinement; a successful production build is also required before publication. New D1/R2 tests cover image validation/isolation, plan persistence, health rollback/later-edit preservation, quota enforcement and protected/orphan media.
- Browser tests cover 320/390/430/844/1280 px layouts, custom violet colours, large text, reduced motion, the hotbar/sidebar, health preview, walk-run editing, remembered food search, shared dates, browser Back and modal keyboard focus/restoration. Screenshots: ignored `artifacts/completion-after/`.
- Food logging tests confirm real reference scaling, immediate local totals even when readback fails, duplicate-safe saves and refresh persistence. Recipe/meal browser tests also passed after navigation changes, including save/edit/version retention and four viewport widths.
- A 4× CPU-throttled Chromium fixture with 1,095 history meals kept search rows bounded to 40 and no runtime errors; dev-server cold loading remains slow (about 5 s), so this is not a claim of slow-phone performance certification.

### Explicit remaining work

The complete PDF is **not** finished. The unchecked inventory above remains open, especially granular coaching consent, account-wide erasure, full unit/i18n coverage, library correction publication and configurable coaching attention queues. Physical iPhone/Android hardware, closed-app push delivery, provider session administration and restore rehearsal are not certified. The user’s latest steering prioritises interface quality; the completed feature batch is retained and tested without claiming those remaining tasks are done.

### Final browser refinement

The completed browser pass also checks five actual hotbar columns, not only five buttons, and verifies that Henry’s composer clears the floating dock. It found and fixed a new context-date bar appearing above the full-height chat. Henry’s existing avatar, conversations, memory, provider and AI behaviour are preserved. Main-screen screenshots use the real derived violet theme tokens.

The R2 budget test also covers a concurrent reservation changing during inventory measurement: the save must discard its stale inventory, remeasure and reject a full bucket. This does not change any account’s configured theme or AI provider.
