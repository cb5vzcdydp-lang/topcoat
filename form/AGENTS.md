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

The user's current request and higher-priority runtime instructions always take
precedence over repository guidance.
