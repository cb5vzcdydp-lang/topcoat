# Free on-device screenshot recognition

Form uses Tesseract.js 6.0.1 (Apache-2.0) and its pinned Tesseract.js core dependency. `scripts/prepare-health-ocr.mjs` copies the worker, WebAssembly bundles and licenses from installed dependencies before dev/build. Images stay in the browser; no API key or paid recognition endpoint is required.

English model: https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz (Tesseract English LSTM, Apache-2.0). Source: https://github.com/naptha/tessdata . The compressed model is retained in v6/ for reproducible builds. Recognition can be imperfect; users review and correct readings before saving.
