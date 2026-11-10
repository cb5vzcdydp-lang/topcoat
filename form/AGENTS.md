# Project reference repositories

For every response and every task in this project, first consult all
repositories under `repositories/`. Apply the relevant, compatible guidance
from each repository before replying or implementing. This applies to short
follow-ups, reviews, bug fixes, planning, code changes, and deployment work.
Record durable project decisions in the project rather than relying on chat
memory. Keep repository source separate from the Form application and excluded
from application type-checking, builds, commits, archives, and deployments.

- `codex-on-crack`: use its planning, execution, and review workflow when the
  configured runtime supports it. Do not silently invoke paid model routes.
- `codex-router`: use its routing and provider guidance when model routing is
  requested. Do not alter credentials or global routes without user authority.
- `prompt-optimizer`: use its prompt-analysis practices for prompts and AI
  features; do not introduce paid or exposed client-side API keys.
- `goal`: use its completion-audit standard. Create or complete a persistent
  goal only when the user explicitly requests that lifecycle action.
- `agency-agents`: select the relevant installed specialist profile as a
  checklist for the task. Follow host rules governing whether subagents may be
  started.

## Project-local REA and Taste skills

Run `node scripts/setup-project-skills.mjs` if the two project-local skill links
are missing. This restores the pinned user-owned repositories without changing
global agent settings. Read the applicable full SKILL.md before using a workflow.

- `rea`: `.agents/skills/reverse-engineer-anything/SKILL.md`
  (source: `repositories/rea/.agents/skills/reverse-engineer-anything/`).
  Consult its target-routing guidance for requests to investigate reference-app
  behavior, shipped artifacts or runtime evidence. Follow its evidence and
  limitation reporting. For ordinary source-code work, the skill explicitly says
  to use repository tools instead of invoking REA. Skill installation alone does
  not install/register its MCP server or native analysis engines.
- `taste-skill`: `.agents/skills/design-taste-frontend/SKILL.md`
  (source: `repositories/taste-skill/skills/taste-skill/`).
  Use for relevant design, styling and visual-review work. Apply consistent
  typography, alignment, purposeful motion and browser verification. Form is a
  functional fitness dashboard: preserve its saved colours, compact logging,
  nutrition carousel, accessibility/reduced motion, data, and AI behaviour.
  User requirements take precedence over marketing-site hero sizing, mandatory
  visual effects, fixed palettes or other incompatible defaults.

Keep both clones, skill symlinks and generated Taste evidence out of app builds,
archives and deployments. Setup details and recorded revisions are in
`docs/PROJECT_SKILLS.md`. Do not claim that external tools or hooks are active
unless the current host actually exposes or runs them.

The user's current request and higher-priority runtime instructions always take
precedence over repository guidance.
