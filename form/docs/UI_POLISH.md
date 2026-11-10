# Theme-preserving interface polish — 23 October 2026

## Existing project inspected

Form uses React 19, Vinext/Vite and TypeScript, with Cloudflare Workers, D1 and R2. The existing stack, account authentication, data schemas and dependencies were retained. The interface uses DM Sans/Manrope, shared CSS in `app/design-system.css` and `app/professional.css`, and feature-specific styles. Home has user-configurable cards; casual and science modes share the mobile navigation. Six colour presets and custom accent/background values are stored through the existing account preference API, with a local device copy.

The existing server-only AI adapter supports Gemini/OpenAI text and vision, with no billed-provider fallback. Henry has persistent conversations, memory, suggestions and account-scoped history; other tools include health screenshots, nutrition labels, meal suggestions and workout drafts. Their request handlers, models, providers, secrets, storage and behaviour were not changed. No paid services or new dependencies were introduced.

## Implementation

- Extended the existing shared stylesheet rather than adding another global override file. Standardised card/control shape, compact headings, spacing, secondary actions, form surfaces, active navigation, empty states and chart tooltips.
- Added pure derived theme tokens for readable secondary text, links, controls, focus rings, selected surfaces and charts. Saved accent/background values and the preference schema are unchanged. The existing accent readability behaviour remains; additional foreground tones are derived from it, not from a replacement palette.
- Checked text/link contrast at least 4.5:1 and focus/control contrast at least 3:1 on main, raised, navigation, hover, pressed and selected surfaces. Very low-contrast custom backgrounds receive readable derived surface tones. The high-contrast option remains supported.
- Connected the older theme toggle to the preference provider; the toggle and appearance dropdown now agree. An old `form-theme` device preference is read only when the newer `form-appearance` record is absent. Account-loaded preferences retain precedence.
- Home keeps the user's card order/visibility/sizing, tightens its hierarchy and places its existing training action within the phone layout. Main navigation has a clear selected state. Larger-text labels fit each mobile navigation button.
- Charts, anatomy highlights and unilateral input cells follow the selected theme. Nutrition and sleep series retain semantic colours to distinguish their data; surrounding text, cards and controls inherit the account theme.
- Added short screen entry, button feedback and width transitions. Henry has a quieter welcome layout, clearer composer, themed conversations drawer, loading skeleton and working indicator. Only actual pending states show loading feedback.
- Account and OS reduced-motion choices disable presentation effects and smooth scrolling. Training chart animation also follows both choices. Opening appearance settings from the phone menu closes that menu; closing the modal restores visible keyboard focus.

## Validation

- `pnpm run check`, all 33 existing/expanded test programs and production build passed. Presentation changes after the full run were followed by the relevant rendering, Home, workout and preference checks.
- `tests/theme-tokens.mjs` checks 60 combinations of presets, custom crossover/white/black colours, light/dark/system modes and high contrast, without mutating preferences.
- Chromium browser checks covered Home, Food, Train, Social, Henry and Sleep + cardio across all six dark presets, light mode, custom colours with larger text/high contrast, and reduced motion. Screenshots are in ignored `artifacts/polish-59/`.
- Checked 320, 390, 768 and 1280 px layouts; no document overflow. Larger-text navigation labels stay inside their buttons. Verified independent unilateral input/edit/completion and adding a pair.
- Verified Henry suggestion input, conversations drawer, Escape and focus restoration without making AI requests. Existing AI-provider/Henry tests verify provider selection, message/memory persistence, failures and isolation using controlled responses. No live model call or paid recognition request was made.
- Browser settings checks exercised live custom colours, both theme controls, casual-mode navigation and refresh persistence of colour and motion preferences.
- No physical iPhone Safari or Android hardware testing is claimed. Workout/food/AI persistence and account separation are covered by the existing automated API suite.

The five project reference repositories were consulted as required by AGENTS.md; their source stays outside the app build and deployment.
