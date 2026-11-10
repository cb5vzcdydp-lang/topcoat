# Topcoat UI integration

Form uses React adaptations of the card and button primitives from the selected `cb5vzcdydp-lang/topcoat` repository (Topcoat v0.12.0, base commit c249820). Upstream sources: `crates/topcoat-ui/registry/src/components/card.rs` and `button.rs`, documented in `docs/ui.md`. Their border/surface hierarchy, quiet outline/ghost actions and compact spacing inform `app/topcoat-ui.css`. The original MIT notice is retained in `components/topcoat/LICENSE`.

The React adapters in `components/topcoat/primitives.tsx` preserve native elements, labels, event handlers and stable caller keys. Home dashboard cards and customization controls use these adapters. Shared CSS maps every colour role to Form's existing account tokens (`--panel`, `--text`, `--accent-soft`, `--control-line`, `--focus`, etc.). It neither imports Topcoat's fixed palette nor writes new preference values.

Topcoat's Rust runtime is not installed into the existing React/Vinext app. This is a UI source adaptation, not a framework migration. Authentication, nutrition calculations, AI requests, account storage and iPhone pairing are unchanged. No dependencies or paid services are added. The original Topcoat framework remains isolated in its GitHub repository.

Reference repository guidance applied: plan/execute/review from codex-on-crack, unchanged model routing from codex-router, unchanged protected AI prompts/providers from prompt-optimizer, evidence-based completion from goal, and the agency-agents frontend accessibility/performance checklist. No persistent goals or paid model routes were started.

## Verification, 10 November 2026

Web TypeScript and production build passed. Existing Home tests (26 cases), page rendering (36 screens/modes), theme-token contrast checks (60 combinations), food-search/batch calculations and Henry persistence/account-isolation checks passed. Chromium interaction checks passed at 320, 390, 430, 844 and 1280 px: configurable hotbar, sidebar, food search/back restoration, shared selected date, disclosure panels, modal keyboard focus/restoration, larger text and Henry composer clearance. Rendered dark cyan, warm accent and light violet preferences were checked separately. No physical iPhone/Safari or Android device run is claimed.
