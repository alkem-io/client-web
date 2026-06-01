# prototype/ — Read-Only Reference

**DO NOT MODIFY any files in this folder.**

This folder is a verbatim copy of Jeroen's prototype and will be deleted once the migration to `src/crd/` is complete. It exists solely as a visual and structural reference.

## For code agents (Claude Code, Copilot, etc.)

- **No edits** — never create, modify, or delete files under `prototype/`.
- **No code review** — do not lint, flag style issues, suggest refactors, or report warnings for any file in this folder. Ignore all linting, formatting, type-checking, and style concerns here.
- **Reference only** — you may read files here to understand the design intent when building components in `src/crd/`.

## No Python scripts

This is a JavaScript/TypeScript repo. The upstream prototype ships helper scripts under `utils/*.py` (font merging, corruption fixes) — **these must never be synced or committed here.** When updating this folder from the source repo, strip every `*.py` file before committing. `.coderabbit.yaml` flags any stray `.py` as a blocking review issue.

## For humans

Same rules: don't touch it. Copy what you need into `src/crd/` and adapt it there.
