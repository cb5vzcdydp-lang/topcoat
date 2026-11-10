# Deploy Form to a custom domain

The source targets Cloudflare Workers, D1 and R2. Uploading the demo HTML or copying the source onto static hosting will not run the backend.

## 1. Create the services

- Add the domain to the intended Cloudflare account and enable HTTPS.
- Create a D1 database and an R2 bucket. Keep the bucket private.
- Create a Supabase project for email/password authentication. Enable email confirmation. Set its Site URL and allowed confirmation redirect to `https://YOUR_DOMAIN/signin`. Configure the provider's email delivery settings and limits before inviting real users.
- Keep the deployment private during setup, for example behind Cloudflare Access. Do not set `AUTH_MODE=sites` on an ordinary public Worker. That mode is exclusively for a trusted Sites proxy that strips and supplies its identity headers.

## 2. Install, check and build

Use Node 22.13 or later and the package manager version in `package.json`.

```sh
corepack pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
node scripts/configure-domain.mjs --domain YOUR_DOMAIN --database-id YOUR_D1_UUID --bucket YOUR_PRIVATE_BUCKET
```

The last command creates `dist/server/wrangler.domain.json`, using the compiled Worker, client assets, domain and real binding IDs. Re-run it after every build. Its example IDs must be replaced with the actual account resources. It does not publish anything.

## 3. Configure secrets

Use the platform's secret manager; do not put credentials in the source or a message. `AUTH_MODE=supabase` is already set by the domain helper. Required secrets:

- `SUPABASE_URL`: the project's HTTPS URL.
- `SUPABASE_ANON_KEY`: its public/publishable API key; never use a service-role key for this feature.

For each secret use `pnpm exec wrangler secret put NAME --config dist/server/wrangler.domain.json` and enter its value at the secure prompt.

Optional features:

| Feature | Additional setup |
| --- | --- |
| AI chat, character avatars, label photos, body-fat image estimates, meal ideas and video drafts | `OPENAI_API_KEY`; optional `OPENAI_MODEL`. Provider access and usage limits apply. |
| Oura | Registered developer application; `OURA_CLIENT_ID`, `OURA_CLIENT_SECRET`, `OURA_REDIRECT_URI=https://YOUR_DOMAIN/api/oura/callback`, `OURA_TOKEN_ENCRYPTION_KEY` (base64 for 32 random bytes). |
| Web Push | `PUSH_PUBLIC_KEY` and a trusted scheduled delivery service. This source registers subscriptions and displays received pushes; automatic delivery is not implemented. A private key alone does not add a sender. |
| Apple Health / Health Connect | Separately build, sign and install `mobile/`; set `EXPO_PUBLIC_API_URL=https://YOUR_DOMAIN`. Complete device permission and sync testing. |

## 4. Apply migrations and deploy

Back up an existing database first. Apply every numbered migration through `0013_social_avatars.sql` with Wrangler, not by generating a replacement schema. The database_name used below is `form-coaching`; when the existing resource has another name, use that name or its binding `DB`.

```sh
pnpm exec wrangler d1 migrations apply DB --remote --config dist/server/wrangler.domain.json
pnpm exec wrangler deploy --config dist/server/wrangler.domain.json
node scripts/check-domain.mjs https://YOUR_DOMAIN
```

`GET /api/health` reports authentication configuration, the required database tables and the R2 binding without revealing keys. AI/Oura/push flags mean configured, not verified live. The domain checker also verifies that anonymous access to `/api/data` is rejected and that sign-in, the manifest and static assets respond. It must run from a machine that can access a private deployment.

## 5. Live acceptance test

1. Sign up, confirm email, sign in, and create a personal profile. Reload and confirm it persists.
2. Create a separate test coach and client account. Accept a client invitation with explicit consent. Confirm each account can see only its intended profiles.
3. Save a workout, a coloured-band set, gym-pin load, meal in a named category, weight check-in and cardio benchmark. Reload and inspect them from the intended coach/client account.
4. Confirm a coach-approved progression appears for the client. Confirm private coach notes are absent from the client's response.
5. Upload, play/read and delete test media. Verify another account cannot retrieve its private URLs. Sign out and verify the record URLs stop working.
6. Test export, then use disposable test records to verify deletion. Check that logs, media and cardio rows are removed only for that profile.
7. Verify an AI request with the actual model credentials and check its failure message when quota is unavailable. Complete a real Oura flow and a paired-phone sync only when configured.
8. Test camera permissions, video decoding, touch navigation, light/dark themes, sign-out and session refresh in iPhone Safari and Android Chrome. Test an offline workout while the loaded app remains open and confirm it syncs once.

The local audit did not have the real domain, service credentials or phone builds. No live-domain, browser-interaction or device acceptance test has been claimed. If moving existing accounts from another authentication provider, map their verified account IDs before migration; matching an unverified email must never grant record access.
