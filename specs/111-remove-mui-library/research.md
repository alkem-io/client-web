# Phase 0 Research: Remove MUI library and code

All Technical Context items were resolvable; no `NEEDS CLARIFICATION` remained
after `/speckit-clarify`. This file consolidates the investigative findings that
ground the plan, the baseline metrics, and the removal inventory.

## R1 — Current MUI footprint (measured at baseline commit)

- **Decision**: Define and record the footprint as three axes: source-file import
  count, runtime dependency list, and production bundle contribution.
- **Findings** (commit `8e1dbcfd0dc395b1de6032da36f92cf7ec61829b`, branch base
  `origin/develop`):
  - **786** files under `src/` import `@mui/*` (out of **2754** `.ts`/`.tsx`
    files ≈ 28.5%).
  - Direct `@emotion/*` imports appear in only **1** file; the rest of Emotion
    usage is transitive through MUI's `styled`/theme. This is why removing MUI is
    what eliminates Emotion in practice.
  - Import-occurrence counts by subpackage: `@mui/material` ≈ 836, `@mui/icons-material`
    ≈ 440, `@mui/system` ≈ 11, `@mui/x-data-grid` ≈ 10, `@mui/x-date-pickers` ≈ 2,
    `@mui/types` ≈ 2, `@emotion/react` ≈ 1.
  - Distribution by area: `src/domain/*` ≈ 435, `src/core/*` ≈ 250 (of which
    `src/core/ui/*` ≈ 216 — the legacy design system), `src/main/*` ≈ 94,
    `src/dev/*` = 6 (dev-only, see R4).
  - Runtime MUI/Emotion packages in `package.json`: `@mui/material@7.1.0`,
    `@mui/icons-material@7.1.0`, `@mui/system@^7.1.0`, `@mui/types@^7.4.6`,
    `@mui/x-data-grid@7.28.3`, `@mui/x-date-pickers@^8.3.0`,
    `@emotion/react@^11.13.5`, `@emotion/styled@^11.13.5` (also pinned in `pnpm.overrides`).
- **Rationale**: These are the objective, reproducible numbers the story's
  "before/after" comparison needs. The source-import count and dependency list are
  build-independent and therefore always reproducible; the bundle figure is the
  user-facing performance proxy.

## R2 — Bundle-size measurement method

- **Decision**: Use the repo's existing bundle-analysis path — `pnpm analyze`
  (`ANALYZE=true pnpm build`) emits `build/stats.html` via
  `rollup-plugin-visualizer`. The MUI contribution is the summed size of the JS
  chunk(s) whose modules resolve under `@mui`/`@emotion`. Record the
  identification method, not a hard-coded chunk filename.
- **Alternatives considered**: (a) A bespoke script summing `node_modules/@mui`
  source size — rejected: measures on-disk source, not shipped bundle, and is not
  the user-facing metric. (b) `source-map-explorer` — rejected: adds a dependency;
  the repo already ships `rollup-plugin-visualizer`.
- **Rationale**: Reuses documented tooling (`docs/bundle-analysis.md`); no new
  dependency; resilient to chunk-name drift (edge case in spec).

## R3 — Reproducibility approach (static snapshot vs script)

- **Decision** (clarify Q2): The baseline is a committed markdown snapshot that
  records the numbers, the commit SHA, and the exact shell commands. No new
  measurement script is added.
- **Commands recorded** (run from repo root):
  - Source import count: a `grep -rlE "@mui/" --include='*.ts' --include='*.tsx' src | wc -l`.
  - Dependency list: read `package.json` `dependencies` for `@mui/*` and `@emotion/*`.
  - Bundle contribution: `pnpm analyze` then inspect `build/stats.html` for the
    `@mui`/`@emotion` chunk sizes.
- **Rationale**: Minimal-change / no over-engineering (CLAUDE.md). A one-axis
  measurement does not warrant a maintained script.

## R4 — Dev-only MUI usage must be excluded from the production footprint

- **Decision**: Treat `src/dev/` MUI usage as out of the production footprint but
  list it in the inventory.
- **Findings**: `src/dev/routes.tsx` exports
  `import.meta.env.MODE === 'development' ? devRoutes : () => null`, so the demo
  routes (and their MUI imports) are tree-shaken out of production builds. They are
  reachable in dev only.
- **Rationale**: The user-facing performance framing must be measured against the
  production bundle; counting dev-only code would overstate the footprint and
  misdirect removal effort.

## R5 — Removal preconditions / ordering

- **Decision**: Each MUI surface category gets an explicit unblocking precondition
  in the inventory; the package uninstall is last.
- **Findings / dependency facts that set the order**:
  - `src/root.tsx` wraps the whole app in MUI `ThemeProvider`; it can only be
    removed once no descendant route needs MUI.
  - `TopLevelRoutes.tsx` selects MUI vs CRD trees via `useCrdEnabled()`
    (`designVersion`); the MUI tree + toggle (`useCrdEnabled`,
    `useDesignVersionToggle`, `useDesignVersionSync`) can only be removed once every
    page is migrated and the toggle is retired.
  - `src/core/ui/*` (216 files) is the internal fan-out point most `src/domain`
    and `src/main` MUI usage depends on; it is removed after its consumers migrate.
  - Legacy `translation.<lang>.json` files still serve MUI components, so they
    cannot be deleted until those components migrate; still-used strings get
    extracted into a new legacy translations file at that time (story instruction,
    deferred).
  - Packages can be uninstalled only when the source import count reaches zero.
- **Rationale**: Removing in the wrong order breaks live routes or users on
  `designVersion=1`.

## R6 — Documentation surfaces needing accuracy updates

- **Decision**: Update `CLAUDE.md` Overview/MUI-policy prose; review and correct
  outdated MUI references in `docs/` and `.coderabbit.yaml`; add baseline+inventory
  links to `docs/crd/migration-guide.md`.
- **Findings**: MUI is referenced in `CLAUDE.md`, `src/crd/CLAUDE.md`,
  `.coderabbit.yaml`, and `docs/` (`i18n.md`, `svg.md`, `crd/why-shadcn.md`,
  `crd/migration-guide.md`, `crd/suspense-teardown-audit.md`, `crd/markdown-editor.md`,
  `crd/notifications.md`). Most CRD docs already describe MUI as legacy/being
  removed; the one inaccuracy of note is `CLAUDE.md`'s Overview line ("It uses MUI
  and Emotion for the design system") which omits the frozen/removal-in-progress
  qualifier.
- **Rationale**: Satisfies AC #7 without altering code; prevents new MUI being
  introduced by readers of stale guidance. Only genuinely outdated statements are
  changed (minimal-change rule); accurate historical context is left intact.
