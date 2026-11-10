# Form — current feature status

Updated 23 October 2026. Public app: https://form-coaching-training.sunsetmesa16.chatgpt.site

The app is published. The complete 240-item PDF is still in progress; see [the detailed roadmap](ROADMAP_STATUS.md). The earlier initial-build status is preserved in [the archive](archive/INITIAL_FEATURE_STATUS.md).

## This update

- Henry now has a dedicated mobile hotbar tab, a reference-style dark chat page, saved conversations with new/open/delete actions, suggested questions and editable account/profile memory. Existing AI history is preserved and imported once. D1 privacy/concurrency tests and browser checks at 320/390/768/1280px passed. See [Henry](../HENRY.md).

- Restored AI coaching, meal ideas, label transcription, video-workout drafts and photo estimates through the installed Gemini credential. Updated the unavailable model and added a shared text/vision adapter with explicit quota/truncation errors. Real text generation and test-label image transcription succeeded. AI image-avatar generation still needs its separate image provider. See [AI and interface release](AI_AND_INTERFACE_RELEASE.md).
- Applied a more restrained shared interface: consistent typography, cards and controls, a flat mobile tab bar, compact Home navigation, visible coach access and an uncluttered AI composer. The restored AI pages are available in Casual mode too.

- Screenshot logging now starts recognition when a file is selected, handles split-line sleep/ring values, and saves reviewed readings with clear retry/success states. Sleep, energy and capture use the same selected day. Recognition assets are hosted with Form; no key or paid service is required. See [screenshot logging verification](HEALTH_SCREENSHOT_LOGGING.md).

- Applied the agreed shared design across navigation, diary, active workouts, Social, Touch grass and Sleep + cardio. The interface retains account colour preferences, readable touch controls, keyboard focus and reduced-motion support. See [interface decisions](DESIGN_SYSTEM.md).
- The food diary now has one native swipeable dashboard for daily targets, source-labelled energy balance and known nutrient coverage. Duplicate summaries are removed; diary entries appear before saved meals and secondary tools. Meal collapse transitions and direct food editing remain available.
- Active workouts show compact full-name exercise tabs and nearby add/delete set controls. The balance illustration uses the supplied people with fixed alignment and a feathered blend. Social has a working filtered-empty state, and task/screenshot forms reveal secondary controls as needed.
- Food search has one search field, functioning category filters, real recently/frequently logged sorting, barcode search and a selection basket that survives query changes. Review quantities, units and meal assignments before saving multiple foods. A failed partial save keeps only the unsaved items for a duplicate-safe retry.
- Saved homemade meals now appear under Custom. Stored and community search results are both retained, permitted results are cached, and remote requests are throttled. Source labels remain visible; this is not the complete Coles/Woolworths catalogue.
- Water has instant glass logging, custom millilitres, adjustable glass size, editable history, delete and Undo. The entry ledger and daily check-in litres remain synchronized, including previous totals. The glass preference is device-local; water history is account-backed.
- Hevy CSV/JSON and advanced mapped imports create reusable templates using matched exercise names. Decimal-comma files, nested JSON, bodyweight loads, invalid dates and stale mapping previews are handled. Import rollback includes generated templates and preserves later manual edits.
- Active workouts display each set's prescribed rep range and retain that target in the saved snapshot. Historical/approved prefills respect current targets. Warm-up ramps keep the exercise order. Visible add/delete set controls and completed-set confirmation/Undo remain available.
- Social profiles allow name/handle edits. Challenges can be declined or left; upcoming and left states are visible. Inactivity indicators use shared workout history beyond the current feed page. The challenge-exit database migration preserves existing participants.
- Diary notes now open a real dated note editor and appear alongside food entries; the photo shortcut correctly identifies its progress-photo destination.
- The food search/review sheet fits the phone viewport with a fixed action area; long result names wrap. Hydration and review fields use readable mobile input sizes and safe-area spacing.

## Verification scope

- TypeScript checks, all repository test files and production build.
- D1 tests cover persistence, account isolation, import rollback, challenge exit and hydration reconciliation.
- Browser interaction tests cover food selection across searches, 50-g/30-g portions, separate meal groups, partial-save retry, water add/edit/delete/Undo, refresh and horizontal overflow in both experience modes.
- Browser viewport sizes for this design update: 320 px, 390 px and 1280 px, including dark/light appearance, larger text and reduced motion. Browser logging responses were controlled fixtures; persistence/security endpoints were tested separately against local D1. Exercise tabs, adding/deleting sets and recap navigation were also exercised in the browser.
- Actual iPhone Safari/Android hardware, live friend accounts and real camera permissions were not tested in this update.

## Remaining work

The detailed roadmap has 152 implemented, 55 partial, 25 pending and 8 items needing platform/operational verification. Native Apple Health access from a pure web app, signed mobile builds, full vendor catalogue coverage, closed-app notification operations and the remaining partial roadmap items are not marked complete. No new paid provider was added.

## Exercise ordering — 23 October 2026

- Workout templates: open **Reorder exercises** above the exercise cards; move up/down or choose a numbered position. Save the template to keep the order. Unsaved builder drafts retain their order after refresh.
- Active workouts: tap **Reorder exercises** above the exercise tabs. Whole exercise blocks move together, retaining warm-ups, completed sets, loads, reps, targets, groups and settings. The selected exercise stays selected. Changes use the existing session draft/history save flow; the saved template remains unchanged. **Undo** restores the previous order.
- Verified callback tests for set preservation, missing/duplicate order IDs, bounds, template save, active selection and Undo; 36 page render checks; TypeScript and production build; Chromium phone/direct-position/Undo controls, builder refresh persistence, 320px and desktop layouts. Physical device testing is not claimed.

## Remove exercises and unilateral logging — 23 October 2026

- **Remove exercise** is available below the active exercise's notes button and through **Exercise options → Remove this exercise**. A confirmation names the exercise and shows its total/completed sets. Removal selects the next available exercise and stops the current rest timer. **Undo** restores all set values, exercise notes, rest presets and the selected exercise. Saved templates and past workouts are unchanged. Removing the final exercise leaves an Add Exercise action and disables finishing an empty workout. Templates retain their existing per-exercise remove button.
- **Unilateral · one set covers both sides** can be toggled on an exercise in the builder or active logger. Weight and reps are per side; mark the row complete after performing both sides. One row counts as one set, with no automatic doubling of sets/reps/load-volume. Added working sets and warm-ups inherit the setting. Templates, saved workouts, draft records and source tables preserve the flag.
- Existing separate left/right records are retained rather than automatically merged or deleted. The screen explicitly identifies that case. The paired-row mode assumes the same recorded reps/load for both sides; existing Side logging can record individual sides when needed.
- Mode-aware prefill, current-exercise records, recap PR checks and progression signatures keep unilateral and bilateral loads separate. Explicit template modes constrain progression history; templates with no saved mode can inherit the latest completed session's mode.
- Verified: all 30 regression test files (including 158 D1 integration assertions), additional final progression/component checks, TypeScript, production build and responsive Chromium flows for toggle, completion, unchanged row count, removal/cancel, neighbour selection and exact Undo. Device Safari was not tested.

## 23 October 2026 — paired unilateral rows and weighted muscle map

Implemented independent R/L rows, non-destructive legacy upgrade, paired completion/add/delete, side-aware records and progression. Replaced primary-only map scoring with 1 direct / 0.5 indirect working-set points; active sessions update immediately. Audited all 1,389 catalogue rows, retained one ambiguous alias under Other, added visible provenance and editable assignments. Detailed sources and limitations: [MUSCLE_HEATMAP.md](MUSCLE_HEATMAP.md).

Validation: all 32 test programs passed; the expanded D1 integration run passed 167 assertions including independent R/L values, non-destructive legacy reads, muscle overrides and account isolation. Browser checks at 320/390/590/1280 widths verified paired row interactions; phone/desktop heat-map checks verified weighted arithmetic and live completed-set updates. No hardware Safari/Android test is claimed.

## Training analytics continuation — 23 October 2026

- Corrected R/L trend filters for the paired unilateral format and added a simultaneous right/left chart with source sets. Side-specific completion, reps and gym-pin load are preserved. Copied legacy shared values are excluded by default and explicitly labelled when included.
- Added configurable rep-range records, account-backed through the existing preference endpoint. Existing exact-rep records remain.
- Muscle map now supports weighted (1 / 0.5), direct-only and raw indirect counts, with 7/14/28/56/90-day windows ending on the selected date. Drill-down shows the matching exercise contributions and provenance without conflating changed direct/indirect assignments under the same name.
- Roadmap items 038, 041, 042 and 046 are implemented. The full 240-item backlog is still not complete; the remaining work stays visible in the release centre.

Validation: all 34 test programs passed. New tests cover asymmetric/partial/missing-side records, shared-copy exclusions, assisted sets, gym-pin loads, comparison gaps, date boundaries, record-range validation and all map models. D1 preference tests cover save/reload, account separation, invalid ranges and stale versions. Controlled browser fixtures verify these controls and persistence at phone/desktop viewports. Real iPhone/Android hardware and live model calls were not part of this verification.

## 7 November 2026: iPhone project

The native iPhone shell now lives in `mobile/`, with account pairing, Keychain storage, native sharing and optional read-only HealthKit. It reuses the existing Form web interface and backend. [Build guide and test limits](IOS_APP.md). An Apple-signed device build and App Store release have not been performed.
