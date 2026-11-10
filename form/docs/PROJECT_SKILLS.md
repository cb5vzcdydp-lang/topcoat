# Project skills

Form's agent instructions use the two skills from the owner's repositories:

| Skill | Repository | Recorded commit | Project-local registration |
| --- | --- | --- | --- |
| REA / `reverse-engineer-anything` | https://github.com/cb5vzcdydp-lang/rea | `b2f3dc81fa503c2b9ff0d8625336ed2e74d1e829` | `.agents/skills/reverse-engineer-anything` |
| Taste / `design-taste-frontend` | https://github.com/cb5vzcdydp-lang/taste-skill | `f6b76575f949707b4e3c37cd86cb44b0b98643e8` | `.agents/skills/design-taste-frontend` |

Run from the project:

```sh
node scripts/setup-project-skills.mjs
```

The installer preserves existing checkouts and unrelated skill installations. It links each complete skill directory, including its references, scripts and assets, so relative references continue to work. It is safe to rerun; an unexpected origin, revision or existing conflicting path is reported rather than overwritten. Update the recorded commit in the script only after reviewing a newer revision.

`AGENTS.md` makes the skills part of the project workflow. REA is for reference behavior and runtime/artifact investigation; its instructions explicitly skip ordinary source analysis. Taste is for relevant visual work, subject to Form's saved themes, existing functionality, dashboard density and accessibility requirements. Neither skill changes user data or enables paid services.

This is a skill-instructions installation. It does not install or register the REA MCP service, native analysis engines, global configuration or Claude-specific stop hooks. Those capabilities must be separately available in the current agent host before they can be used or claimed. A host may need to reload its skill catalogue to discover new local skills; the files are available immediately through project instructions.

Repository sources, local registrations and generated visual evidence stay outside application bundles and deployments. No npm dependencies or application runtime code were changed.
