# Food search and diary performance repair

## Findings and changes

- Initial food search mounted 2,139 results at once. It now mounts 40 and loads 40 more on request. Filtering still searches the whole available catalogue; selected foods survive paging and query changes. Text filtering is deferred so the input update takes priority. Pending rows cannot be selected until the new query is ready.
- The same relevance score was recomputed repeatedly during sorting, and food history/group arrays were rebuilt on unrelated parent updates. Scores are computed once per candidate; account/profile arrays and groups are memoised. Recent-food selection uses one scan instead of sorting the entire history on each input update.
- Stored/MFP catalogue results previously waited for the external community request (up to six seconds). The search UI now requests stored and community sources separately and publishes each as it arrives. Stale requests are aborted/ignored, cache entries stay bounded, debounce remains 350 ms and the existing remote request cap remains in place. The default combined API remains compatible with existing callers. A complete, labelled zero remains zero; remote products missing calories or any macro are excluded instead of inventing zero values.
- Food search, meal/recipe builder, fast-food picker, supermarket finder and food-estimator code now load when opened. The modal has a loading state while a module arrives. AI provider behaviour and server-side credentials are unchanged.
- Every add/edit previously waited for a full account GET after the acknowledged POST, including one reload for every item in a batch. Meals now merge the server-returned values, revision and original creation timestamp directly into the existing client-scoped list. Older responses cannot replace newer revisions. Delete and undo update locally after server acknowledgement. Failed writes and conflict responses still keep their existing error/review handling. The account-scoped offline snapshot is debounced, rather than synchronously rewritten per item.
- A legacy CSS rule hid the per-food delete action. It is visible again with a 44-pixel control, while retaining the compact row layout and existing confirmation/undo.

## Controlled measurements

A Chromium development-browser fixture at 390 × 844, CPU throttled 4×, with 365 daily logs and 1,095 historical meals:

| Measurement | Before | After, two recorded runs |
| --- | ---: | ---: |
| Initially mounted search rows | 2,139 | 40 |
| Total document nodes with search open | 22,469 | 1,482 |
| Open interaction wall time | 12,369 ms | 2,316–3,026 ms |
| Largest observed long task during open/search | 6,582 ms | 254–511 ms |
| Search interaction wall time | 895 ms | 611–891 ms |

These are controlled development-tool measurements, including Playwright/browser work and on-demand development module loading; they are not production Core Web Vitals, real-device INP or guarantees for every phone/network. The bounded DOM count is enforced in the test. Physical Safari and production provider latency were not benchmarked.

## Verification

- `tests/food-performance-browser.mjs`: large-history fixture, CPU throttling, bounded initial results, additional pages, selection retention and complete-catalogue text matching. Run with `PERF_ASSERT=1`; optional `PERF_OUTPUT` writes measurements.
- `tests/food-progressive-browser.mjs`: an intentionally slow remote source does not block stored results; stale results cannot overwrite a newer query. Add/edit/delete/undo and multi-food saves issue no full-account GET, preserve authoritative revisions, calculate servings correctly, update the offline snapshot and survive reload.
- `tests/diary-fast-save.mjs`: immutable, client-scoped upsert; timestamp/order retention; duplicate retry and stale-response handling.
- `tests/food-search-api.mjs`: local scope skips external fetch, remote rate/cache limits remain, unknown macro data is rejected and genuine zeros are preserved.
- Existing calorie logging, recipe creation, search, nutrition, theme, AI and application regression checks remain in use. No feature, account data, custom colour choice, AI tool or database binding is removed.
