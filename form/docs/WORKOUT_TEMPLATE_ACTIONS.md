# Finished and historical workouts as templates

After a successful workout save, the app offers a review screen. Users can update the original saved template or save an independent template, or keep only the workout. Train also includes a searchable, paged “Past workouts → templates” section. Copying does not edit or relabel the historical workout.

The conversion keeps exercise order, working-set counts, individual rep targets, unilateral mode, muscle assignments, equipment/gym-pin settings, rest presets and exercise notes. Warm-ups are excluded. Paired unilateral sides count as one set. By default a finished-session update includes uncompleted planned working sets, while a historical copy includes completed working sets. The review exposes a toggle and lists the exact resulting exercises and counts. Existing template limits are validated explicitly; oversized or ambiguous sets are not silently truncated. Session load suggestions continue to come from history through the existing start-workout logic.

Updating preserves the template identity, folder, tags, favourite and load scale, and uses the existing versioned save/history API. Copies receive one new identity retained across retries, with rapid-save protection. The source version is recorded when starting a session and retained in saved workout data. Older sessions without a version, externally changed templates and deleted originals cannot be silently overwritten. A deleted-template update now returns a conflict instead of recreating the deleted template. Finishing a session does not depend on successfully updating its template.

Where the session came from a weekly program, an authorized plan editor can update just that source day with the existing plan-version check. Assigned clients retain existing coach permissions and can save an independent template. Other days and completed workout history are preserved. The review always requires an explicit template action.

Newly saved-and-started builder templates pass their actual new version to the logger. Failure to clear optional device storage no longer prevents the already-saved workout from reaching template review. Existing sign-in, themes, AI, social auto-sharing and offline save behaviour remain.

## Verification

- `tests/workout-template-actions.mjs`: conversion rules; completion/warm-up exclusions; unilateral pairs; per-set targets; metadata; immutable source; real D1 save/update/history; persisted source version; stale/deleted update conflicts; stable-copy retry; account isolation.
- `tests/workout-template-browser.mjs`: past-workout copy; failed-save retry; rapid repeated presses; session finish before template review; changed set-count update; warm-up exclusion; unchanged history and organization; mobile/desktop layouts; stale-source warning.
- Existing workout/template, unilateral, import, food, theme and AI regression checks remain enabled. Chromium automation does not certify physical iPhone/Android behaviour.
