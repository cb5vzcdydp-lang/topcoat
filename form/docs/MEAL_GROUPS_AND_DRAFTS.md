# Meal groups and creation recovery

## Meal groups (roadmap 065)

Food → Manage meal groups now supports adding, renaming and reordering up to 30 groups, with keyboard-operable arrow buttons. Uncategorized remains available as a fallback. Renaming asks for confirmation because it applies across all diary dates.

The authenticated endpoint checks profile access and a versioned, per-account/profile configuration. A transactional D1 batch gates every history/rename write on the exact successful configuration update. Concurrent/stale requests fail without changing diary rows. Renames change only the category and increment its revision; dates, nutrition, quantities, notes, timestamps and food IDs remain intact. Before/after snapshots go to entry history. Legacy custom-group records are updated too. Groups with history cannot be silently omitted. No database migration or new service is required.

The order persists through refresh and is used by diary sections and entry pickers. New-food defaults fall back to an existing group after Breakfast is renamed. Previously saved reusable meals choose a valid current group when opened, without rewriting their historical food snapshots.

## Unfinished meals and recipes (part of roadmap 123)

Meal/recipe creation saves a small form snapshot to the existing IndexedDB store under an account/profile/creation key. Home lists up to five recent unfinished creations with Resume and Discard controls. Restoration is explicit and retains ingredients, incomplete label fields, servings, eaten amount, group, original creation identity and retry/log identity. A failed server save leaves the draft available; a successful save clears it. Saved creations from a different version are not overwritten by an older draft. Normal calculations, validation and explicit save/log actions still apply.

These drafts are **on this device**; the UI says so. They do not sync across devices and are cleared with the existing sign-out/device-clearing workflow. The main account history is not serialized for each form change. IndexedDB failure leaves logging usable and displays a warning to keep the form open.

Roadmap 123 remains partial: standalone single-food/planning drafts and cross-device task synchronization are not implemented by this batch. Roadmap 065 is complete. This is not a claim that the entire roadmap is finished.

## Checks

- `tests/meal-groups-api.mjs`: real D1 migrations/routes; historical content preservation; entry history; default and legacy groups; stale/concurrent changes; account separation; omitted/duplicate group rejection; incomplete draft values and scoped keys.
- `tests/groups-drafts-browser.mjs`: mobile group controls and rapid-save protection; draft refresh recovery from Home; account separation; portion/group/identity restoration; failed-save retention and successful-save cleanup.
- Existing recipe, calorie logging, import, theme, AI and application regressions remain enabled. Physical Safari/Android verification is not implied by Chromium automation.
