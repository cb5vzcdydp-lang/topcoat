# Form — first build status

This is the first web application build, not a completed Tracked clone or an App Store release.

## Implemented

- Coach-owned client workspaces with server-enforced per-client access.
- Client invitations, optional email binding, consent and revocation.
- Fully independent client targets and seven-day programs.
- Exercise editing, optional exercises, sets, rep ranges and notes.
- Independent reusable program templates.
- Daily body, nutrition, movement and recovery logs.
- Manual meal entry, editing, duplication and deletion; explicitly apply totals to daily nutrition without double counting.
- Collapsible workspace sidebar folders for Home, Training & nutrition, Progress & health, Coaching & learn, and Connections.
- Two persisted experience modes: Casual Lifter Mode surfaces only Today, Workout, Log and Progress; Science-Based Lifter Mode retains the full coaching workspace and its advanced pages.
- QR/product-code camera scanning where the browser supports BarcodeDetector, with manual barcode entry fallback and Open Food Facts product lookup.
- Private owner food library: save product barcode, name, serving size and per-serving macros, then reload the saved nutrition by scanning again.
- Optional package-front and nutrition-label photos, with explicit consent, AI label transcription, editable nutrition values, servings-to-calories calculation, and no retained photos.
- Editable weight/body-fat scenario calculator with disclosed assumptions.
- Exercise reordering and a deep navy/turquoise dark theme.
- Client workout entry, per-set load/reps, completion and failure markers, rest timer.
- Workout snapshots and idempotent retries for offline workout uploads.
- Device-local active workout drafts and pending-workout queue (not a full offline app shell).
- Three-successive-session progression checks plus recent-session rep/load suggestions. Coaches can approve a target, which prefills the next workout for that client.
- Weekly average weight, daily weight chart, direct-set muscle diagrams.
- Dashboard maintenance-calorie estimate from recent calorie logs and multiweek weigh-ins. It requires at least 21 days of trend, three weigh-ins, and 14 logged-calorie days; it shows the observed intake and weight-loss/gain rate, adds a confidence label, and uses a rounded energy-balance estimate that updates as entries arrive.
- Weekly check-ins, review status and coaching messages. Coach dashboard flags overdue check-ins, missing recent logs, missed planned sessions and flat recent weight trends.
- Private progress-photo upload/read/delete code backed by R2.
- Private exercise set videos, grouped by exercise and session date, with authorized upload, playback and deletion. R2 upload cap is 25 MB; MP4, MOV and WebM are supported.
- Profile-aware AI coach chat. Messages persist per client profile, and the server sends the current plan plus recent check-ins and workouts as context. Requires a private `OPENAI_API_KEY` deployment secret; provider requests can incur charges.
- Body-composition history with FFMI calculation, manual entries, and a user-consented image estimate that returns a range and does not save the image. AI estimates are not measurements.
- Editable weekly weight/body-fat projection, daily-deficit assumptions and dated milestones, using a disclosed 7,700 kcal/kg and 90%-fat-loss scenario.
- JSON export, daily-log CSV, and calendar reminder downloads. Dashboard weekly recap summarizes workouts, nutrition logging and weight change. Web Push subscriptions can be registered and the service worker handles incoming pushes; a VAPID key and scheduled push sender are still required for automatic reminders.
- Searchable health-metrics page with Apple Health `export.xml` import parsed locally in the browser. Supported readings: VO₂ max, HRV (SDNN), resting heart rate, steps and body weight; imported values are client-isolated and retain their source label.
- Native Expo companion source under `mobile/`: manual one-time pairing; encrypted device token storage; opt-in HealthKit and Health Connect reads for steps, sleep duration, weight, VO₂ max, resting heart rate and HRV; manual foreground sync; phone disconnect. Backend pairing codes expire after ten minutes, are one-use, bind the device token to one client profile, and can be revoked. Platform sources only return readings available to and approved by that user's health source. Native source still needs dependency installation, device build/smoke testing, signing and store compliance before release.
- Client-authorized Oura OAuth connection with PKCE, encrypted token storage, a 30-day manual sync for sleep duration/sleep score/readiness/activity, token refresh and disconnect/revocation. A registered Oura developer app and site secrets are still required before the Connect flow can run. Connection guidance now lists Apple Health/Watch, Samsung Health, Fitbit/Google Health, and Xiaomi/Mi Fitness with their phone-bridge requirements.
- Optional lift-context panel compares bench, squat and deadlift estimates with clearly labeled raw competition-entry percentiles; it is opt-in, not a global-population percentile, and does not support pull-up population claims.
- Separate casual/benchmark cardio log tracks distance, duration and pace, with same-distance PB trends and percentage change.
- Calories diary includes AI meal ideas sized against remaining calorie/macro targets with ingredient and approximate micronutrient details; requires `OPENAI_API_KEY`.
- Recipe builder calculates per-serving macros from ingredient amounts and label values; dated meal planning can generate a grocery list. TikTok links can be embedded as a reference, and uploaded clips are sampled locally into frames for AI workout drafting. Coach review is required before adding the generated draft to a plan.
- A redesigned Calories diary inspired by the supplied screenshot: date navigation, energy summary rings, pastel macro target/remaining bars, water progress, expandable meal categories, and recent nutrition history. Sample meals make the read-only demo useful immediately.
- VO₂ max age/sex percentile context using FRIEND registry values for ages 20–79, with general improvement guidance, caveats and a study link.
- Program/target audit history and stale-write checks.
- Labelled Jamie example and responsive coach/client preview.

## Verified locally

- TypeScript check.
- Production build.
- 113 backend assertions against local D1/R2 runtime: identity, authorization, invitation lifecycle, isolation, logging, idempotency, health-metric validation, Oura OAuth state/PKCE/token storage/sync/revocation, snapshot preservation and deletion. Oura uses a mocked API in tests; live Oura account credentials are not configured.
- 27 domain assertions for weight averages, maintenance-calorie estimation, calendar boundaries, volume and progression.
- 12 custom-domain authentication assertions and 24 server-render smoke checks passed. See AUDIT_REPORT.md for the complete verification scope.
- No browser automation was available under the supported managed preview workflow. Visual browser QA and real hosted sign-in remain unverified.

## Hosting blocked

Sites creation returned an internal service error. Follow-up listings returned no project. No hosting identity or production URL exists. No credentials are included. The website is not publicly live. Apply D1 migrations through `0013_social_avatars.sql` before enabling the latest features. Preserve this source and retry project creation only after checking for an existing project and evidence that provisioning is healthy.

## Not implemented / separate release work

- Native companion installable builds, signing, App Store/Play release and on-device HealthKit/Health Connect verification. The native source and secure pairing/sync API are implemented, but no signed or installed phone build has been produced here. Samsung Health, Fitbit/Google Health, and Xiaomi/Mi Fitness data flow depends on the device/app publishing supported records into Apple Health or Health Connect; direct vendor OAuth integrations are not included.
- Oura connection setup still needs an Oura developer application, exact callback URL registration, and the production secrets documented in `CLAUDE_HANDOFF.md`.
- App Store project/signing/submission and external mobile authentication for public hosting.
- Broader food database coverage beyond the Open Food Facts lookup and nutrition-label photo extraction.
- Automatic push delivery is not scheduled yet. Subscription storage and service-worker push display are implemented; add a VAPID key pair and a trusted scheduled sender before relying on background reminders. Email notifications are not implemented.
- TikTok link-only video analysis (uploaded video is frame-sampled instead), voice transcription, specialized AI connectors and automatic recalibration. Live AI chat, video drafting and the consented body-fat visual estimate require `OPENAI_API_KEY`.
- Full offline app shell, robust conflict-resolution UI for all record types.
- Cycle tracking and automatic substitutions. Friends, feed posts and relative challenges are implemented with opt-in sharing.
- Full Tracked feature parity, formal privacy/legal review and production security audit.

Never show unimplemented integrations as connected. The Connections screen accurately labels their state.

## Audit update

See `AUDIT_REPORT.md` for corrected defects and the complete feature coverage matrix. Custom-domain session verification, account screens, first-use profile setup, persistent coach notes/approval targets, equipment-specific starter programs, expanded exports, safe cache behavior and deployment helpers are now included. Live service credentials, native device builds and the domain acceptance sequence remain required.

## Home and phone layout update — 16 October 2026

- Overview is now Home, including the initial demo page and navigation labels.
- Home has a seven-day date strip, thirteen configurable cards, S/M/L sizes, visibility toggles, display variants, pointer-handle reordering and accessible up/down controls. Layouts save locally per account and lifter mode on that device.
- Existing maintenance calculations, muscle map, daily checklist, weekly recap and selected-date food/training history are retained as cards.
- Mobile bottom navigation and dismissible sidebar, stacked tables with column labels, wrapping controls, larger input text and safe-area padding.
- Added 21 Home configuration, date and server-render checks; existing 24 page-render smoke checks still pass.
- Browser-based appearance, overflow and touch testing remain unverified because the supported browser workflow is unavailable. See design-qa.md and docs/HOME_AND_MOBILE.md.
