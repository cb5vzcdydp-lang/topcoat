# Henry assistant

Henry has its own seventh mobile hotbar destination and a Home entry. The existing `AI coach` page identifier remains compatible with navigation preferences; visible navigation calls it Henry. Existing food, training, social, outdoor tasks and recovery destinations remain available.

The supplied reference guides the personalised chat surface, user-supplied Henry portrait, green outline action chips, suggestion cards, fixed composer and right-side Conversations drawer. No device status bar is rendered. Suggestions fill the composer for review; sending is explicit. Replies are advice and do not silently edit workout or nutrition records.

## Persistence and privacy

`/api/henry` uses the existing authenticated account, client authorization and D1 `workspace_records` table. Conversations and remembered preferences are scoped to both the signed-in user and selected profile. An authorized profile member cannot read the owner's conversations. Legacy owner history is imported once and retained in the original table; deleting the imported conversation does not recreate it.

New chats, lists, reopening, deletion and memory edits do not generate AI requests. A send uses the existing server-side provider configuration and includes the selected profile's recent check-ins, workouts, templates, health records and manually saved preferences. Keys never enter browser code. The privacy disclosure explains this context. Provider usage limits still apply; no automatic fallback or new subscription is added.

Each request has a stable ID, an in-flight lock and optimistic conversation version check. Completed retries return the saved reply. Failed generation leaves messages unchanged. Deletion during generation prevents a chat from returning. Conversations are limited to 100 per profile/account, with 80 messages per conversation; requests use at most the latest 30 messages as context. Memory is limited to 3,000 characters and concurrent changes return a conflict rather than overwrite.

Demo conversations use session storage, are explicitly labelled Demo, and never call the model. Signed-in conversations use D1 and survive refresh/sign-in. Offline sends are disabled; typed messages are retained after a failed send. No automatic retries spend model requests.

## Validation

- `node tests/henry.mjs`: real local D1 migrations, account/member separation, one-time migration, persistence, memory changes/forgetting/conflicts, idempotent create/send, provider error, simultaneous send rejection, delete during generation, missing provider and origin protection.
- Full `pnpm test` regression suite and `pnpm run check`.
- Chromium browser: Home/hotbar navigation, suggestions, send, new/reopen/delete conversations, memory edit/save, Escape dismissal, 320/390/768/1280px layouts and no horizontal overflow. Every hotbar hit area is at least 44px at narrow phone widths.
- Production build. Device Safari and physical keyboard/camera behavior are not claimed by these browser checks.

Henry’s header and welcome portrait use the user-provided photograph (`public/henry-photo-v2.webp`), resized for delivery. A versioned asset URL avoids showing the previous avatar from browser caches.

Henry inherits the existing account appearance tokens, including background, cards, borders, text, accent and contrast-safe button text. Changes to presets, custom colours, light/dark/system appearance and high contrast apply to the chat, composer, suggestions, portrait rings, conversations and memory editor immediately.
