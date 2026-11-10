# Import layouts and equipment-aware replacements

This release completes roadmap 019 and 222. It does not mark the remaining roadmap complete.

## Import layouts

The main Import screen offers explicit versioned CSV layouts for Hevy set rows, Strong kg set rows, Cronometer food rows and MacroFactor daily macro summaries. Automatic CSV/TSV/JSON detection and manual mapping remain available. These layouts are tested against the included example fixtures, not a guarantee of compatibility with all current or historical provider exports. No live provider connection is implied.

Choosing a layout shows its required headings, ISO date order and load unit, with a downloadable example clearly identified as sample data. Missing headings, empty numeric cells, negative values, impossible dates and fractional repetition counts produce a row-specific error before any import is submitted. A labelled zero remains zero. Users must review and explicitly import through the existing account-scoped, duplicate-safe history/template pipeline. The upload handler also clears the file input before awaiting parsing, avoiding an existing null-event error after successful or failed file reads. Files with different headings must use another layout, automatic detection or manual mapping; no silent fallback changes their units.

## Replacement suggestions

Workout → options → Swap this exercise now shows up to six suggested replacements. Saved preferred alternative names rank first. Other suggestions require overlapping direct muscles and the same name-based movement family. Selecting a gym requires all of the candidate's known equipment tags to be available. Current exercises, exercises already in the session and duplicate IDs are excluded. Unknown assignments do not produce invented equivalents.

Suggestions follow search, muscle and equipment filters and are explicitly described as browsing aids rather than equivalent loads or a medical/technique assessment. Users choose a replacement; no automatic swap occurs. The existing session-only replacement records the reason and can be undone, without editing the saved template or completed history. Existing user muscle overrides are respected. Catalogue conversion is shared instead of rebuilding every entry when a filter changes.

## Verification

- `tests/import-presets-swaps.mjs`: all supported fixture layouts, required headings, true zero versus missing macros, load units, daily summaries, invalid calendar dates, preferred alternatives, equipment restrictions, current/selected exclusions and unknown muscles.
- `tests/import-swaps-browser.mjs`: mobile preset selection, mismatched-file errors, explicit preview/confirmation, downloadable CSV, live replacement selection, Undo and unchanged template.
- Existing importer, workout, account-isolation, food, theme and AI regressions are retained.

Physical-device Safari and Android testing is not certified by these automated Chromium checks.
