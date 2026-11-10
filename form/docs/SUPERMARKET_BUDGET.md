# Supermarket budget meals and roadmap follow-through

Food → Supermarket budget meals accepts an AUD budget and calorie/protein/carbohydrate/fat targets. It starts with the selected diary day's remaining targets; users can replace them. The lowest checked normalised macro gap appears first. Energy is weighted 2 and other macros 1; denominators have floors of 100 kcal and 10 g. A bounded beam search considers up to four different foods, so it does not claim an exhaustive optimum.

## Money and quantities

Prices are integer cents. Each match uses one supermarket and stays within the full-pack checkout budget. Portions scale from a labelled reference quantity, including drained edible weights. Unused pack contents are shown as leftovers, not silently discounted. Calories use the published value rather than recalculated 4/4/9 values. Missing macros or prices exclude a label.

There are 70 complete dated source snapshots: 5 Woolworths, 51 Coles, 5 ALDI and 9 Spudshed. The 50 newly verified additions and 29 excluded incomplete products are documented in `SUPERMARKET_SOURCE_AUDIT.json`. These are not full catalogues or live price quotes. Spudshed snapshots identify Waterford; other prices may depend on store/location. Every entry retains price/nutrition URLs, label basis and check date. The reproducible importer is `scripts/import-supermarket-products.py`; it reads the research JSON supplied to it, never guesses missing labels.

Users can enter complete labels and current local prices for these stores, IGA or Other. These records are owner- and profile-scoped using the existing private records API. Price overrides do not alter the shared source catalogue. Existing version checks reject conflicting updates, and stable IDs prevent duplicate retries. No new paid or external runtime API is introduced.

Review explicitly shows quantities, packs, leftovers, price dates, food preparation and sources. Saving writes one reviewed meal snapshot to the chosen diary category. Duplicate clicks cannot create a second entry. Missing micronutrients remain missing. A local shopping-list download includes the full cost and source information.

## Roadmap additions in this release

- Name-based movement-family browsing and exact-tag gym equipment filtering in the catalogue and workout picker. Unclassified entries remain explicit; this is not a claim of reviewed difficulty/technique data.
- Work/rest phase timers with automatic rounds, pause/resume/reset, no final rest, optional browser-supported sound/vibration and visual cues. They require the page to remain open. Old incomplete plans must be edited before starting.
- Source-selected sleep-duration charts with gaps preserved, circular bedtime/wake goal offsets, energy/stress/soreness trends alongside recorded working sets, and an optional disclosed-weight readiness checklist. Readiness thresholds currently apply to the open review; they are not a clinical score.
- Recovery/training comparisons reuse the existing per-side training pipeline: matching exercise/equipment/rep range, explicit side selection, recorded gym-pin load, and exclusion of warm-ups/assistance/unfinished or inherited shared-side values. Pearson correlation needs at least three varying paired readings and does not imply causation.
- Circumference charts separate measurement names and sides, convert cm/in using 2.54 exactly, retain original values/source, and use the chosen range. Checkpoint FFMI bands use only each checkpoint's own provided body-fat bounds. Weight-scenario uncertainty remains partial.
- Local printable progress summaries require explicit field choices for dated weights, trend, circumference, goals/notes and dated milestones. Photos are excluded.
- A saved first-week checklist derives real template/workout/check-in progress. Hide/show and backup-check acknowledgement persist per account/profile.
- Connections → Check a backup validates a Form version-2 JSON file locally, with ID, profile-reference and core schema checks. It does not restore data or certify recovery. Original media files are not included in JSON exports. Calendar reminders now support daily/weekly/monthly recurrence; import the generated ICS into a calendar for delivery.

## Verification and remaining scope

`tests/supermarket-review.mjs` covers sources, money, drained weights, full-pack pricing, match ranking, missing data, recovery rules, source isolation, conversions, uncertainty, timers and gym filters. `tests/roadmap-api.mjs` checks private label/onboarding storage, version conflicts, retries, account isolation and validation of a real API export. Browser journeys check exact diary saving, price editing, refresh, source controls, intervals, charts, backup validation and narrow layouts. Browser tests use controlled fixtures; they do not certify physical iPhone Safari, camera or wearable-provider behaviour.

The 240-item PDF remains incomplete. The in-app release centre and `lib/roadmap-delivery.ts` retain remaining social/challenge/coaching workflows, privacy/platform work and operational verification as partial, pending or verification. Existing AI tools, workout features, source foods and account colour preferences are preserved.

The browser journeys are checked in as `tests/supermarket-browser.mjs` and `tests/roadmap-controls-browser.mjs`. With the local app running on port 5173 and Playwright available, run them individually with Node. `PLAYWRIGHT_MODULE` can point at an installed Playwright module; no browser dependency or browser binary was added to the shipped application. Screenshots go to the ignored `artifacts/roadmap-budget/` directory.

## Follow-through and calorie logging repair

Price books now accept reviewed CSV/JSON imports with partial retry and export, plus nutrition-reference lookup that never fills an unknown price. Added shared coaching forms, acknowledged programme changes, timestamped video feedback, bulk programme preview/apply, date-filtered printable briefs, private friend groups/reactions/mentions/check-ins, synced Home layouts, photo alignment, linked milestone reminders, grace/rest-day habit rules, achievements, workout cards, import match memory, cardio split/equipment comparison and explicit cross-device workout takeover. New migrations are additive. Theme preferences and existing AI configuration are preserved.

Calorie logging accepted food provenance of only 120 characters, rejecting 183 real menu entries. Nutrition source storage now supports 500 characters without discarding source attribution. Food names/serving descriptions are normalised to diary field limits before saving. All 2,119 menu entries are regression checked against exact source calories. Accepted saves update the diary before reload; a failed read-back is never treated as a failed write or requeued. Single-food retries retain the entry ID. Manual label inputs appear before the long micronutrient lists.

`tests/calorie-logging-browser.mjs` covers a real long-source food, 50-g scaling, manual calories/macros, failed read-back, queue safety, refresh and mobile widths using controlled API fixtures. The full Node suite passes, including genuine D1/R2 API tests. Physical-device Safari and live AI-provider behaviour are not certified by these tests. The PDF and full supermarket coverage remain incomplete.
