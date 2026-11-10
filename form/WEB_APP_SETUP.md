# Form — web-first update

This is the real application source, not the read-only HTML demo. It runs on Cloudflare Workers with D1, private R2 storage and configured authentication. It is not a static/PHP app for uploading unchanged to Cloudways. Keep the deployed app's existing hosting configuration, resource IDs and secrets.

## Updating the existing app

1. Back up the current source and database. Do not replace the live database or bucket with empty resources.
2. Copy these source changes into the deployment checkout; retain the existing Worker name, database ID, bucket and authentication settings.
3. Install with the pinned package manager, then run `pnpm check`, `pnpm test` and `pnpm build`.
4. Using the existing deployment configuration, apply all outstanding D1 migrations, including **0014_flexible_workout_templates.sql**. This is additive; it does not delete or rename existing plans, logs or media. If using the domain configuration helper, regenerate its config after the build as described in `docs/DOMAIN_DEPLOYMENT.md`.
5. Deploy the rebuilt Worker using that configuration. Verify `/api/health` reports ready. Test using a disposable profile before updating real client plans.

For example, with the generated custom-domain config:

```sh
pnpm exec wrangler d1 migrations apply form-coaching --remote --config dist/server/wrangler.domain.json
pnpm exec wrangler deploy --config dist/server/wrangler.domain.json
```

If the existing app uses a different config or D1 name, use those existing values instead. This archive does not contain your dad's hosting credentials or live settings and has not updated the live website.

## Everyday use

- Sign in and create/open **your personal profile**. Jamie remains an optional example; his records are not converted into yours.
- Open **Create workout**, name it, search for exercises and tap **Add**. Adjust sets/reps in the selected list; advanced muscle/equipment options are collapsible.
- **Save template** creates a standalone workout, independent of weekdays. There is no seven-template limit.
- **Home → Start workout → select saved workout**. Last session's working sets prefill; coach-approved targets override them. Existing weekly-plan workouts are also available without deleting them.
- During a session use **Add Exercise**, warm-ups, working sets, multiple bands/custom band names, separate gym-pin weight, RIR/failure, notes, records, rest timer, plate calculator and form-video history.
- Minimise to keep a local draft and resume from Home. Finish to save to your account. Template edits/deletion do not change completed sessions. Sign-out clears local drafts for privacy.
- In flexible Training, expand progression suggestions/form videos and completed sessions. Optional fixed-weekday scheduling is still available in settings.

## Integrations retained

| Feature | What works in this web app | Extra setup |
| --- | --- | --- |
| Oura | OAuth connection, manual Sync latest, sleep stages, HRV/RHR/respiratory rate when provided, activity/steps, readiness and expenditure | Site owner registers an Oura app and configures the four Oura secrets. Then each profile owner authorises their account. |
| Apple Watch / Apple Health | Browser-side import of `export.xml`, including supported sleep/energy/health readings for the last 90 days | Health → profile picture → Export All Health Data → Files → extract ZIP → choose `export.xml` in Form Metrics. No Form phone app needed for imports. Not automatic sync. |
| Other wearables | Daily readings in the documented health CSV format | Convert the provider's export to `date,metric,value,unit,source`; use `/examples/health-metrics.csv`. This is not direct Samsung/Fitbit/Xiaomi OAuth support. |
| AI chat, avatars, food-label photos, meal suggestions, video drafts | Server-side provider-backed features | `OPENAI_API_KEY` with access/billing; optional model settings. A ChatGPT subscription does not configure the app's API. Existing provider limits apply. |
| Food barcode lookup | Public lookup plus saved foods and manual entry; camera scanning where supported | HTTPS and camera permission; manual entry remains the fallback. |
| Set videos, progress photos, social media | Authenticated private uploads and access checks | Existing R2 bucket binding; device/browser must support the selected media format. |
| Reminders | Calendar export and foreground browser reminders | User permission; automatic closed-app push additionally requires a scheduled sender. Push controls are advanced, not advertised as ready by default. |

Oura owner configuration: `OURA_CLIENT_ID`, `OURA_CLIENT_SECRET`, `OURA_REDIRECT_URI=https://YOUR_HOST/api/oura/callback`, `OURA_TOKEN_ENCRYPTION_KEY` (base64 for 32 cryptographically random bytes). Store secrets in the hosting secret manager, never in source/chat.

The optional `mobile/` companion and its backend endpoints remain for future developers. Native-only pairing has been removed from the normal web Connections page. It must be separately built, signed, installed and tested; a web app cannot directly request HealthKit/Health Connect permissions.

Provider references: [Oura OAuth documentation](https://cloud.ouraring.com/docs/authentication), [Apple Health sharing/export](https://support.apple.com/guide/iphone/share-your-health-data-iph5ede58c3d/ios), [HealthKit](https://developer.apple.com/documentation/healthkit), and [Health Connect setup](https://developer.android.com/health-and-fitness/health-connect/get-started). Provider data availability and access requirements can change.

## Limits and acceptance checks

This release has automated schema, API, access-isolation, import, component-callback and production-build checks. It is not certified bug-free or visually/device tested. Live provider credentials and iPhone/Android permissions were not available in this workspace.

After deployment, test on iPhone Safari and Android Chrome: create/save/start a template, complete band and gym-pin sets, reload/resume, finish, verify persisted history and another account's isolation, test camera/media, then try an authorised Oura connection or health-file import. Cold offline app launch is not supported; an already-loaded workout can retain a draft and queue a save during connection loss. Keep sensitive data on trusted devices and export backups periodically.
