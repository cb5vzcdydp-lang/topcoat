# AI restoration and professional interface — 22 October 2026

## AI connection

The installed Google credential passed a real generation test. The previous `gemini-2.5-flash` generateContent call returned 404 for this key and recommended `gemini-3.8-flash`. The shared server adapter now defaults to `gemini-3.8-flash`, uses Google's documented OpenAI-compatible endpoint, low reasoning effort and bounded output tokens. `GEMINI_MODEL` can select another compatible model explicitly.

Restored through the existing private/account-scoped routes:

- Contextual AI coach, with saved conversations.
- Meal suggestions using remaining targets and user preferences/allergies.
- Consented nutrition-label transcription; unreadable macros fail validation rather than becoming invented zero values.
- Editable workout drafts from sampled video frames or captions.
- Consented, uncertain photo body-composition estimates.

The Google key stays in deployment secrets. Gemini is preferred when configured. An upstream quota/error does not silently switch providers, retry or enable billing. A pre-existing OpenAI configuration remains supported only when there is no Google key. Request limits, missing configuration, empty replies and truncated responses have explicit errors; failed requests do not write partial user records. Account access checks and photo consent remain in their existing routes.

Gemini Flash produces text and accepts images; it does not generate avatar images. The social avatar image service still requires its separate image-generation configuration. Profile-photo uploads continue to work. The free on-device health screenshot reader remains available and does not send health screenshots to Gemini.

Official source: https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash and https://ai.google.dev/gemini-api/docs/openai . Google project billing/free-tier status was not accessible or changed. A successful generation confirms usable access, not unlimited or guaranteed free usage.

## Interface

- Shared 14 px card/10 px control radii, consistent title and body hierarchy, aligned spacing and restrained surfaces. Account colours, light/dark appearance, focus rings and reduced motion remain supported.
- Edge-to-edge mobile tab bar with six destinations, consistent line icons and an active indicator.
- More compact Home profile/calendar; targets moved from an always-visible setup card to a working Daily targets link. Visible entry to the Form coach.
- Coaching has useful prompt buttons that populate the editable question, a clear composer, no empty transcript gap, and a disclosure of the profile context sent with a question.
- Casual mode includes AI coach, video-workout drafts and body composition. Deep science tools remain accessible in Science mode.
- Food/workout headings and secondary actions use the same product language. Meal AI buttons follow the shared design and prevent repeated logging while saving.

## Verification

- Real Google text request returned `OK` using the current model and compatibility endpoint.
- Real Google vision/JSON request read a generated test label as 150 kcal, 6 g protein, 20 g carbs and 5 g fat, matching the printed text. No private user image was used for this test.
- Provider tests cover Gemini-only text/image payloads, JSON output, provider preference, 429 handling without retries/fallback, truncation, and missing configuration.
- Integration tests exercise all five restored routes with only a Gemini test key, including account isolation and persisted coach messages. Provider outputs in integration tests are controlled fixtures, separate from the two real requests above.
- All 29 test files, TypeScript checks and production build passed. Browser tests at 320/390/1280 px cover both experience modes, dark/light themes, Home-to-coach navigation, prompt population, explicit submission, reply refresh, six mobile destinations and overflow. No AI request is sent just by opening Home or choosing a prompt.
- Physical iPhone Safari/Android devices and the owner's production signed-in session were not available. Screenshots/results are retained locally under `artifacts/professional-52/`.

Reference repositories were consulted and remain separate from the application. No additional paid service, infrastructure or subscription was installed.
