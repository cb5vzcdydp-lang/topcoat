# Muscle map and unilateral logger — 23 October 2026

The catalogue has 1,389 rows (1,358 distinct normalised names). Every row now has explicit direct and indirect muscle assignments. The update does not overwrite raw historical workouts or remove catalogue exercises.

## Evidence and limitations

Muscle data was cross-referenced against the 876-exercise public-domain [free-exercise-db](https://github.com/yuhonas/free-exercise-db) snapshot downloaded on 23 October 2026. The reduced source fields and Unlicense are retained in `scripts/data/`. ExRx target/synergist descriptions were also read for [bench press](https://exrx.net/WeightExercises/PectoralSternal/BBBenchPress), [squat](https://exrx.net/WeightExercises/Quadriceps/BBSquat), [bent-over row](https://exrx.net/WeightExercises/BackGeneral/BBBentOverRow), and [serratus shoulder raise](https://exrx.net/WeightExercises/SerratusAnterior/BBInclineShoulderRaise).

Thirty distinct names match a source exercise and its primary muscle grouping. Another 1,327 names use an explicitly labelled movement-family estimate, adapted to Form's finer muscle groups. This is a full catalogue mapping audit, **not a claim that 1,389 individual exercise pages were independently verified**. Equipment, angle, technique and intended emphasis can change recruitment. References explain the related movement; they do not establish exact activation percentages for every variant.

One name, `Unilateral cable frontal penguin flap`, remains unverified after searching for the alias. It is retained as `Other`, visibly marked for review. It is never silently omitted or given a fabricated target. Users can set its muscles in the workout builder. Some uncommon aliases have limited evidence; Peter extensions were identified as a quadriceps movement and Newton extensions as a triceps movement from publicly indexed creator descriptions. Their assignments remain family estimates.

Regenerate and audit using `python3 scripts/audit-exercise-muscles.py`; verify with `node tests/muscle-heatmap.mjs`. The app uses committed local mappings and makes no runtime research/API requests.

## Scoring

- Each completed working set: **1 point** for each direct muscle, **0.5 points** for each indirect muscle.
- A muscle cannot receive both credits from the same set; duplicate assignments are removed.
- Completed view includes all saved workouts in the last seven calendar days, plus completed sets in the current workout. An already-saved session ID is not appended twice.
- Warm-ups and incomplete sets do not contribute. A unilateral R/L pair contributes once, once both sides are completed.
- Planned view uses required sets in the weekly plan. Optional work is excluded there; completed optional work contributes in completed view.
- These user-requested weights are a tracking heuristic, not measured activation, recovery, hypertrophy, or a validated biological equivalence.
- Higher values have visibly brighter colouring. Lower back and neck can now receive points. Hip flexors, rotator cuff, serratus and `Other` are listed and selectable; the simplified silhouette has no separate region for them.
- Exercise contributions show the direct/indirect arithmetic and reference/provenance. The builder permits multiple direct and indirect targets, stores account-owned overrides, and can restore the catalogue assignment.

## Paired unilateral sets

R1 / L1 rows have independent weight, reps, RIR, failure, bands and gym-pin values. Both sides must be completed before the logical set completes. Add Set adds a pair; Delete Set deletes a pair. Undo retains side values and order. Warm-ups reset completion on both sides.

Legacy shared unilateral sets are exposed as labelled copies to both sides. Explicit old left/right rows are paired without losing asymmetric values. An absent side remains incomplete and marked unrecorded. Migration is idempotent, runs on API reads and local draft restoration, and does not rewrite raw historical JSON. Re-saving retains the new side data. Progression requires both sides to meet targets at consistent loads; records compare the corresponding side. Summary load uses the actual lower-load side rather than constructing a fictitious weight/reps combination.

## Continuation — views and dates

The map now offers weighted points (default 1 direct / 0.5 indirect), raw direct set counts, or raw indirect set counts. Completed view supports 7, 14, 28, 56 and 90 days ending on the shared selected date. The diagram, sorted totals and exercise drill-down use the same selected model/window. Planned view remains the weekly plan. Contributing sets with the same exercise name but changed direct/indirect assignments are grouped separately, preserving correct provenance and arithmetic.
