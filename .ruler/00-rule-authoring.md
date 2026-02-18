---
applyTo: '**'
---

## Rule Authoring Source Of Truth

- Add or update project rules in `.ruler/*.md` files only.
- Do not edit generated `AGENTS.md` or `CLAUDE.md` directly.
- After rule changes, regenerate outputs via `pnpm run ruler:apply`.
