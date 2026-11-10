# Screenshot logging repair — 21 October 2026

## Implemented

- Sleep + cardio starts with a redesigned capture card and an explicit Upload → Review → Save flow. Selecting an image begins recognition automatically. Completion brings the editable readings into view; the save action stays distinct from recognition.
- The browser loads the worker, four compatible WebAssembly variants and English model from Form's own origin. Dark screenshots are converted to light grayscale for recognition and oversized images are bounded. The image is never uploaded to an AI endpoint. English-model and runtime licensing/source details are in `public/ocr/README.md`.
- Parsing handles labels and values on separate lines, ring amounts such as `612/500 CAL`, kJ conversion and sleep durations in hours/minutes. Missing data stays empty and sleep stages do not replace the total time asleep. Users must confirm recognised values.
- A new screenshot starts with empty metric fields, preserving the selected date rather than accidentally carrying readings from the previous image. Bad dates/values are rejected before sending. Stable per-account/day/metric IDs and a synchronous save lock prevent duplicate submissions. Failed saves retain the editable values for retry.
- Successful saves immediately update health readings and the selected day. Sleep + cardio's capture, sleep display and energy model share that day. The saved total-burn value feeds the existing energy calculation. Food consumed is never inferred from activity-ring calories.
- Updated health rows refresh their modification timestamp, so a corrected screenshot reading takes precedence over an older reading from the same day unless the user explicitly configured another source priority.

## Verification

- Expanded parser/row tests cover split lines, numerator versus goal, kJ, stage exclusions, zero readings, dates, bounds and stable IDs.
- Real Chromium image recognition used a generated dark screenshot with six labelled values. OCR produced 7.6 sleep hours, 12,438 steps, 612 active kcal, 2,487 total kcal, 47 exercise minutes and 11 stand hours. No recognition request reached an external CDN or API.
- Browser tests verified a failed save followed by retry, six saved rows, a disabled duplicate-save action, updated selected sleep day and visible 7h36m sleep, updated 2,487-kcal expenditure, refresh, manual-step updates preserving sleep readings, and no horizontal overflow at 320/390/1280 px. API responses in that browser test were controlled fixtures. Separate D1 integration tests verify persistence and account separation.
- Actual phone hardware and the user's original failing screenshot were unavailable. OCR accuracy depends on the screenshot; manual editing remains available.

## Free API research

Official Google documentation confirms Gemini keys are associated with a Google project and created through authenticated Google AI Studio: https://ai.google.dev/gemini-api/docs/api-key . This session has no configured Google identity or API credential, so no new Gemini key was provisioned. No shared third-party key was acquired or installed. The shipped on-device reader needs neither an API key nor a paid recognition service.
