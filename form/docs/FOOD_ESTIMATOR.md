# Written food estimates

Food → Describe food · AI opens the estimator. It uses the existing server-side AI provider through `/api/food-estimate`; no new provider, client key or paid dependency is added. Descriptions are sent only when Estimate is pressed. Preview accounts cannot call the estimator or save.

The API authenticates the account and checks access to the selected client before invoking AI. It bounds the request body and validates structured output. The model estimates the entire described meal, lists portion assumptions, and returns only calories/protein/carbohydrate/fat. Missing micronutrients remain unknown.

Users review/edit nutrition, choose a meal/date/optional time, and scale the described portion before saving through the existing diary endpoint. The nutrition reference records the AI estimate source and the original whole-meal portion so subsequent serving edits scale correctly. Failures keep the reviewed draft; saves use a stable entry ID and an immediate lock to prevent repeated presses from creating duplicates. Changing the description invalidates its previous estimate.

Validation: `tests/food-estimate.mjs` covers authentication, origin, cross-account access, body/input bounds, malformed/out-of-range model output, unavailable providers, no implicit logging, fractional portion calculations, D1 persistence and retry idempotency. Browser checks cover review/edit/save, failed save retry, repeated presses, AI errors/retry, stale-result invalidation, refresh and 320/390/430/1280px layouts. Browser/model-output fixtures do not validate real-world estimation accuracy or provider availability; actual results depend on the configured provider and its quota.
