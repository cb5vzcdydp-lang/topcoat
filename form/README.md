# Form — Training & Nutrition

A responsive personal fitness tracker with optional coaching, independent client plans, daily logs and workout tracking.

## Current Sites release — 19 October 2026

The current Site is public at https://form-coaching-training.sunsetmesa16.chatgpt.site. Personal records still require verified sign-in and profile authorization. Sites provisions the declared D1/R2 resources; `AUTH_MODE=sites` is configured only behind its trusted proxy.

Colour and accessibility settings are available through the sliders control / Your account. Advanced tools sit within their relevant pages. Connections contains privacy/media tools and an in-app release centre with the full 240-item roadmap status. **The complete PDF is not finished.** See [docs/ROADMAP_STATUS.md](docs/ROADMAP_STATUS.md) for implemented, partial, pending and verification-only items.

No new paid provider was introduced. Existing optional AI/Oura and private media storage remain; a strict no-AI/no-paid-service edition has not been substituted silently. Browser/device support and hosting quotas still apply.

## Personal use first

Sign in and choose **Create my training profile** with your name. Your profile starts with an empty workout plan and no sample history. Configure your own targets, create a workout, and log meals and weigh-ins. A coach is not required. If you already have a Jamie example or clients, use **Set up my profile**; future visits open your personal profile by default. Explicit profile switching remains available, and existing client records are preserved.

Jamie is only sample content in the separately labelled read-only demo or an explicitly chosen example. The hosted app uses authenticated database records; opening the HTML preview is not a substitute for deploying the app. See `docs/DOMAIN_DEPLOYMENT.md` for hosting requirements. Base44 must adapt the supplied source to its own backend before it can run there.

Users can switch between **Casual Lifter Mode** (Today, Workout, Log and Progress) and **Science-Based Lifter Mode** (the complete workspace). The preference is saved on the device.

## Web-first release

Read **WEB_APP_SETUP.md** before deploying this update. It adds migration `0014_flexible_workout_templates.sql`, searchable exercise selection, independent any-day workout templates, a repaired live logger, and browser-compatible health imports. Existing plans, completed history and private media are preserved. This ZIP updates source only, not the live website.

## Try the design

Open `Form-demo.html` in a browser. It is a self-contained, read-only interactive example, not a cloud service. The sidebar groups related pages into collapsible folders. The food scanner can load a sample product in demo mode; camera access, live database lookup, saved foods, sign-in and photo processing need the hosted backend.

## Application source

- `app/page.tsx` — responsive coach/client interface.
- `app/api/data/route.ts` — authenticated client data and mutations.
- `app/api/photo/route.ts` / `app/api/exercise-video/route.ts` — protected R2 photo and dated exercise-video access.
- `app/api/ai/route.ts` / `app/api/body-estimate/route.ts` / `app/api/food-label/route.ts` — profile-aware AI coach and consent-gated image workflows.
- `app/api/food-lookup/route.ts` — barcode lookup using the Open Food Facts API.
- `lib/domain.ts` — validation, program defaults, volume and progression logic.
- The Overview dashboard learns an estimated maintenance-calorie level from calorie logs and the multiweek weight trend, with a warm-up period and data-coverage label.
- `lib/server.ts` — identity, authorization and request protection.
- `db/schema.ts` / `drizzle/` — versioned D1 database schema.
- `tests/` — integration and calculation tests.
- `docs/FEATURE_STATUS.md` — exact delivery scope and limitations.
- Workout schedules default to flexible selection: users keep saved program workouts and choose one when they start, with an optional fixed weekday routine. Social profiles include an owner-consented AI avatar studio with outfit variants; generated avatars are stored privately and served only to the owner and accepted friends. Avatar generation uses the configured `OPENAI_API_KEY` and optional `OPENAI_IMAGE_MODEL` (defaults to `gpt-image-1`); image requests may incur provider charges, and generated likeness is an artistic approximation. The Training page keeps private, date-stamped set videos under each exercise for form comparisons across sessions. The Body comp page logs weight, height and body-fat entries, calculates FFMI, estimates visual body-fat ranges with explicit photo consent, and builds an editable weekly scenario with milestones. The AI coach keeps a profile-scoped conversation and uses its plan and recent check-ins. Apply D1 migrations through `0013_social_avatars.sql`; configure `OPENAI_API_KEY` (optional `OPENAI_MODEL`, defaults to `gpt-4.1-mini`) in deployment secrets to enable AI features, including food-label reading. Chosen nutrition-label and optional package-front photos are sent to the configured AI provider for transcription and are not saved. Confirm the returned serving and macro values against the package. AI requests may incur provider charges.
- Metrics include an Oura OAuth connection for daily sleep, readiness and activity summaries, plus browser-side Apple Health XML import for VO₂ max, HRV, resting heart rate, steps and weight. Oura needs developer credentials in host secrets before clients can connect. VO₂ max context is informational, not a diagnosis.

Node 22.13+ is required. Use the included package manager lockfile. Install with `corepack pnpm install --frozen-lockfile` (or the Sites dependency helper in the managed environment). Run TypeScript with `pnpm exec tsc --noEmit` and build with `pnpm run build`.

## Identity and deployment

Custom-domain deployments use verified Supabase email/password sessions by default. `/signin` creates/signs in accounts; the backend verifies access with the provider, stores session cookies with HttpOnly/Secure/SameSite protections and refreshes them through the same origin. Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` through deployment secrets. Sites identity headers are accepted only with explicit `AUTH_MODE=sites` behind a trusted Sites proxy. Never enable that mode on an ordinary public Worker.

Follow [docs/DOMAIN_DEPLOYMENT.md](docs/DOMAIN_DEPLOYMENT.md) for the exact domain, resource, secret, migration and live-check commands. [docs/AUDIT_REPORT.md](docs/AUDIT_REPORT.md) records fixes, verification and remaining feature gaps.

The hosting manifest requests D1 `DB` and R2 `BUCKET`. The registered project ID is retained in `.openai/hosting.json`. Preserve it when publishing updates to the existing Site. This Site’s owner explicitly selected public access; do not reset its audience on deployment. App invitations do not override platform access rules.

Do not expose health data publicly. Each user owns their own coach workspace; linked clients receive only their assigned data. Invitations expire in seven days. Disconnecting removes client access but retains previously shared records. Coaches can export and delete profiles. Photos are stored privately and retrieved only through an authorized route.

## Tests

`pnpm check`

`pnpm test`

`pnpm build`

The scripts bundle test entries using Wrangler's installed esbuild dependency. Integration tests use disposable local Miniflare storage; they do not access production data.

## Native phone companion

The `mobile/` directory contains an Expo iPhone/Android companion. It pairs using a one-use client-generated code, stores its bearer token in SecureStore, and can read approved HealthKit or Health Connect measurements after the client grants system permission. Supported readings include steps, sleep duration, body weight, VO₂ max, resting heart rate and HRV, depending on source availability. Sync runs in the foreground when the client taps the button. Follow `mobile/README.md` to configure and build it. The D1 migration `drizzle/0004_mobile_health_pairing.sql` must be deployed first.

This repository does not contain signed binaries, store listings or device QA. iOS needs Xcode signing and the HealthKit capability. Android public release needs the Play Console Health Connect data declaration. Galaxy Watch, Fitbit, Oura, Xiaomi and other device data only appears when their app writes compatible records into Apple Health or Health Connect; these are not direct vendor integrations. Oura also retains its separate OAuth connection after its developer credentials are configured.

## Hosting with Claude

If another developer is deploying this project to a custom domain, give them the complete source archive and `CLAUDE_HANDOFF.md`. The project already targets Cloudflare Workers, D1 and R2, with a verified authentication adapter and domain configuration helper included. Configure its real resources and credentials, apply migrations, and complete the live acceptance test before use.

## Offline behavior

An in-progress workout is cached on the device, scoped to the user and client. Offline completed workouts queue and sync on reconnect without duplicate session creation. Keep the page open while reconnecting. The entire app is not yet cached for a cold offline launch. Treat local browser data as sensitive and use a trusted device.

## Design

The muscle diagram uses original vector paths created for this project. Colors represent direct sets only, not measured physiological activation. Jamie's program is a labelled example; copies assigned to other clients are independent.
