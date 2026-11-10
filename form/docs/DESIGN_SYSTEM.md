# Form interface decisions

Implemented 21 October 2026 following the UX, creative and frontend review.

## Visual language

- Retain Form's navy and turquoise identity and account colour preferences. Raised panels, page backgrounds and text must follow the selected light/dark theme.
- Use a shared 18 px card radius, 12 px control radius, consistent headings and 44 px primary touch targets. Nutrition retains peach, mint, cyan and purple indicators.
- Mobile navigation keeps Home, Food, Train, Social, Touch grass and Sleep + cardio visible. Casual desktop navigation also includes Sleep + cardio. Science mode keeps its additional tools.
- Keep the common action visible; move occasional tools into labelled disclosures. Food starts with Add food, barcode scanning, a single swipeable dashboard, hydration and compact meal entries. Saved meals and additional tools follow the diary.
- Use native scrolling, scroll snapping and date inputs. Preserve keyboard focus, visible focus rings, Escape behaviour and reduced-motion preferences.

## Feature-specific decisions

- Food search uses a single scroll region beneath its search/filter controls, with persistent review/save actions. Selection targets are 44 px. Missing nutrients remain unknown; they are not converted to zero.
- Nutrition coverage averages available general adult Daily Values and reports the number of known values. It excludes upper-limit nutrients from adequacy scoring and is not presented as a measure of health outcomes. Energy rings use recorded or explicitly labelled estimated expenditure.
- Active workouts show full exercise names, accessible exercise tabs, nearby Add working set/Add warm-up controls, visible Delete controls and a distinct Finish action. Targets and workout storage remain unchanged.
- Social keeps Like and Comment visible and places post management in a labelled disclosure. Filtered empty states provide a working route back to all updates.
- Touch grass shows the checklist before the create form when tasks exist. Sleep + cardio keeps the date, step input and screenshot import near the top; optional manual/review fields expand when needed.
- The balance illustration retains the user's two supplied people, a shared static alignment and a wide feathered reveal from feet upward. It does not abruptly switch people or rescale their bodies independently. OS and account reduced-motion settings are both respected. This update does not change activity scoring.

## Verification

- TypeScript, all 28 test files and production build are required for publication.
- Browser checks cover both experience modes; 320, 390 and 1280 px viewports; dark/light appearance; larger text; reduced motion; navigation/drawer keyboard actions; dashboard controls; meal collapse; food selection and portion review; hydration edits/Undo/refresh; and active-workout set addition/deletion and recap navigation.
- Controlled API fixtures exercise the browser logging flows. Separate D1 tests cover persistence and account separation. This release does not claim physical iPhone Safari, Android camera or live friend-account testing.
- Screenshots and browser results are stored locally under `artifacts/design-50/` and excluded from publication.

Reference repositories remain isolated under `repositories/`, excluded from application builds and publication. No paid model routes, credentials or infrastructure were added.

## 23 October 2026 refinement

Use the derived `lib/theme-tokens.ts` tones for control borders, accent text, focus, hover/pressed/selected surfaces and secondary chart series. Keep account accent/background values intact. Apply the 16 px shared card radius, 12 px controls, compact heading hierarchy and 140–280 ms interaction durations. Both account and OS reduced-motion choices apply. The older theme toggle now delegates to the same appearance provider. Detailed validation: [UI_POLISH.md](UI_POLISH.md).

## 31 October navigation refinement

Four user-configurable daily destinations plus More replace the crowded fixed seven-item mobile bar. More opens the existing sidebar; advanced panels live under Workspace tools with a context selector. Home remains customizable, Food keeps its primary log/search/scan controls, and occasional food actions use a labelled disclosure. All new surfaces use account-derived tokens. The nutrition carousel measures the active pane; empty weight charts use a compact helpful state.
