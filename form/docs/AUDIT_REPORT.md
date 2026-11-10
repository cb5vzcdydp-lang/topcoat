# Form code and release audit — 16 October 2026

## Result

The current app was compared with the older source archive retained in this workspace and the saved source package (version 32). All 62 earlier files in app, lib, mobile, migrations, public, tests and docs remain present. This comparison establishes file retention; it does not prove that every previous UI behaviour was correct. Functional review found and corrected the issues below.

The web app builds and passes local regression checks. The complete app is not yet certified on a real domain. The demo is an interactive sample; the backend needs deployment services and credentials. See DOMAIN_DEPLOYMENT.md for the setup and live acceptance checks.

## Corrections

| Area | Defect and correction |
| --- | --- |
| Custom-domain sign-in | Added Supabase-backed server verification, email/password account screens, confirmation handling, protected cookies, refresh and sign-out. Public deployments ignore forged Sites identity headers. Sites mode now requires an explicit trusted-host setting. |
| First account | A user with no profiles could reach code that dereferenced an undefined client. Added personal-profile/client setup and invitation acceptance for that state. |
| Food diary | The API stripped meal categories; meals could disappear from named sections. Categories are persisted. Imported non-standard categories are visible under Uncategorized. Removed duplicate Saved meals UI. |
| Settings | Removed duplicate experience-mode controls. |
| Private cache | The old service worker cached API responses and media despite no-store headers. APIs, authenticated media, documents and session requests are now excluded. The old cache is deleted when the replacement worker activates; sign-out clears Form browser data. Cold offline launch is not implemented. |
| Workout starts | Fixed the selected-day callback using stale React state. Today's day follows the profile timezone. Prefill now uses the matching set from the previous session rather than repeating its first set for every set. |
| Personal profiles | Coaches using their own profile can edit their own plan while using the client-style workspace. |
| Multiple clients | Prevented older profile-load responses from overwriting a newer selection. Client-scoped feature components remount on profile changes. Cleared stale draft/body-plan state. |
| Coach approval | Progression approvals are now stored in D1 and returned to the client account, instead of only one browser's local storage. Clients cannot approve coach-controlled targets. |
| Coach notes | Notes are now stored in D1, visible only to the owning coach, with writes protected by coach access. |
| Guided programs | Setup previously renamed days while ignoring equipment and failing to supply the requested number of training days. It now generates actual exercise programs for 2–6 days with full-gym, dumbbell, bodyweight or band equipment. Ready-made splits use their own appropriate movements. Replacing a plan asks for confirmation. |
| Custom exercises | The custom builder now exposes muscle, equipment, sets, rep range and gym-pin setup. Band names/colours can be added and combined. |
| Progression consistency | Changing gym-pin load or band combinations no longer incorrectly qualifies as three top-rep sessions at the same load. |
| History imports | Corrected pounds-column conversion and classification of lateral raises, reverse curls and shoulder presses. |
| Health sync | Protected health-record upserts against another client's reused record ID; corrected the paired-device platform selection so iOS readings retain Apple Health attribution. Android foreground sync recalculates the date range each time. |
| Wearable dashboard | Steps and sleep can display synced readings with manual values as fallback. |
| Cardio | Fixed pace rounding that could show :60, distinguished unchanged time from slower time, and validated duration fields. Profile deletion now removes cardio records. |
| Lift norms | Reference matching excludes variations such as goblet/split squats and Romanian deadlifts. Competition percentiles are not extrapolated to invented exact values outside the published range. |
| Video drafting | Added bounded video decode/seek waits, resource cleanup and provider timeouts. A draft is cleared only after its plan save succeeds. |
| Recipes | Failed saves keep the form and do not claim success. Invalid serving amounts are blocked. |
| Exports | Profile JSON export includes cardio, recipes, meal plans and groceries as well as the existing data; private media are metadata with a clear note, not missing binary files disguised as a complete media backup. |
| Printable sharing | Escaped user-entered names/goals before inserting them into the printable HTML. |
| Deployment | Added a domain-specific Worker configuration helper, service-readiness route, domain check script and current migration instructions. Added missing schema declarations and query indexes. |
| Performance | Reused memoized profile workout/log collections, volume and maintenance calculations; reused sorted workout history; removed the duplicate initial profile read. No large-history browser benchmark was performed. |

## Local evidence

- TypeScript check and production build.
- 27 domain assertions; 23 starter/progression scenarios; 6 importer cases; 5 relative-challenge checks.
- 12 external-authentication checks, including spoofed headers, invalid sessions, confirmed email, cookie attributes, refresh, sign-out and origin protection.
- 113 D1/R2 integration checks, including fresh migration application, profile isolation, coach notes, approvals, food categories, media, exports, cardio deletion, invitations, Oura and mobile pairing/sync.
- 24 server-render smoke checks: every main page, a first-time account and casual mode. These simulate initial state, not clicks, camera access or layout in a browser.
- Cloudflare deployment dry-run succeeded with example resource identifiers. This validates packaging; it does not provision resources or verify DNS.
- AI, Oura and auth-provider responses are mocked in regression tests. Real credentials were not supplied.
- Supported browser automation was unavailable, so interactive browser and device checks remain pending.

## Feature coverage and remaining gaps

| Feature family | Current scope | Remaining work/setup |
| --- | --- | --- |
| Personal training and coaching | Independent profiles, plans, templates, dashboard, logs, check-ins, messages, coach notes and approvals | Real account/live-domain acceptance test; bulk assignment is sequential and stops on an error. |
| Workout logging | Prefill, per-set load/reps, failure/RIR, bands, gym pin, records, form clips, progression, muscle maps | Clips need R2. Deload messaging is a general review prompt, not a trained fatigue model. |
| Programs and learning | Guided starter programs, custom exercises, ready-made splits, written exercise cues, beginner muscle guide | Comprehensive how-to image/video library and exercise-specific equipment swaps are not implemented. |
| Calories | Named meal diary, saved foods/meals, dates, totals, water, barcode lookup, label photos | Live barcode database access; camera support varies. AI label/meal features require a model key. |
| Recipes | Ingredient macros, serving calculations, dated plan, grocery list | No automatic full-database food coverage or dietitian-grade micronutrient completeness. |
| AI food ideas | Uses remaining calorie and macro targets; returns food-table-style micronutrient estimates | It does not calculate a complete remaining-micronutrient budget: the app lacks complete micronutrient entries/targets. |
| Progress | Weigh-ins, trend/maintenance estimate, body-fat history, FFMI, projection and milestones, photo estimate | Measurements and AI estimates remain estimates; real provider test needed. |
| Cardio and strain | Separate casual/benchmark sessions, pace/change history; app activity-load index | Index is Form's heuristic, not WHOOP's proprietary strain calculation. Manual cardio logs do not fabricate energy readings. |
| Sleep/recovery | Imported/connected duration, available Oura scores, HRV/RHR trends and guidance | Sleep-stage charts, debt calculation, SpO2/temperature signals and a validated proprietary-style recovery model are not implemented. |
| Apple/Samsung/Fitbit/Xiaomi | Phone pairing API, native companion source, health-file import; platform sharing where supported | Native dependency/device build, signing, HealthKit/Health Connect checks and actual device data availability. No direct Samsung/Fitbit/Xiaomi OAuth connectors. |
| Oura | OAuth, encrypted tokens, refresh, manual daily-summary sync and disconnect | Registered Oura app, live credentials, approved user and live sync test. |
| Social | Friends, consent-based feed, media, likes, comments and relative challenges | Real multi-account/browser testing; not a public global social network. |
| Lift rarity | Opt-in raw-competition reference for suitable bench/squat/deadlift entries | No justified percentage of all humans, and no general-population pull-up percentile reference. |
| Video-to-workout | Uploaded clip frames and caption create a reviewable draft; TikTok reference embed | TikTok-link-only analysis and automatic speech transcription are not implemented. |
| Reminders | Calendar download, foreground notification support, push subscription storage and incoming-push display; dashboard recap | Background scheduled delivery and automatic recap push are not implemented. |
| Offline | Active workout draft and idempotent queued workout upload while the app is loaded | Complete offline cold start and conflict handling for every record type are not implemented. |
| Sharing/export | Profile JSON, daily-log CSV, printable summary, separately protected private media | Full one-click backup restore and bundled media export are not implemented. |
| Distribution | Web app source, demo, native companion source | No signed App Store/Play binary or store submission. |

## Required before real clients use the domain

Configure verified authentication, D1 and private R2; apply migrations through 0013; run the domain checker and the acceptance sequence in DOMAIN_DEPLOYMENT.md; configure desired integrations; test in iPhone Safari and Android Chrome. Keep account IDs stable if migrating existing records from another identity provider.
