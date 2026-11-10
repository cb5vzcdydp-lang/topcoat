# Web-first changes and verification

## Fixed in this update

- Replaced the weekday-bound custom builder with a searchable exercise picker and independently persisted, versioned workout templates.
- No longer requires a Monday–Sunday slot or overwrites a weekly plan when creating a standalone template. Existing weekly templates/programs remain accessible.
- Removed inert workout controls: Add Exercise now searches/adds, Personal Records uses completed history, calculator and timer have functional panels, elapsed time is distinct from rest time.
- Restored multiple bands/custom names, gym-pin load, failure/RIR, warm-up classification, exercise notes and set-video history lost from the initial logger redesign.
- Moved the workout screen outside the generic modal; retained draft minimising/resume and keyboard focus containment.
- Added template edit conflict detection and retained completed history when deleting templates.
- Extended exported profile data and AI context with standalone templates.
- Removed native-only pairing/provider promises from the web Connections flow. Preserved optional native source rather than deleting a possible future integration.
- Apple Health streaming import avoids creating a full XML DOM. Added sleep stages, merged overlapping asleep intervals, energy-unit conversion and source-separated totals. IDs are stable across repeat imports; daily health CSV import is also available.
- Extended Oura sync with provider-supplied sleep stages, heart metrics and steps. Expenditure uses total calories without adding active calories twice.
- Nutrition history imports now batch daily summaries instead of failing above the backend batch size.

## Verification

Automated tests cover standalone template creation beyond seven slots, persistence, optimistic edit conflicts, access isolation, profile export, dated workout saving, band/gym-pin/RIR/note retention, deletion preserving history, exercise search/add callbacks, logger actions, streaming/chunk-split XML, overlapping sleep intervals, source isolation, repeat import IDs and CSV validation. Existing regression tests for authentication, social/media, AI mocks, food, cardio, provider OAuth mocks, plans, rendering, home layout and calculations are retained.

No live provider call, production deployment or real-device browser interaction was performed. Managed browser control was unavailable; no visual/mobile overflow certification is claimed. Build success is not a substitute for device testing. See WEB_APP_SETUP.md for the required live checks and migration.
