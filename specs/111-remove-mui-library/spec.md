# Feature Specification: Remove MUI library and code

**Feature Branch**: `story/9885-remove-mui-library-and-code`
**Created**: 2026-06-17
**Status**: Draft
**Input**: GitHub story alkem-io/client-web#9885 (child of epic alkem-io/alkemio#1888 "Remove completely the MUI dependency from client-web")

> **As a user** I want a more performant client.
> **As a developer (and agent)** I want less code, fewer libraries, and fewer rendering conditions (context).

## Scope Decision (read first)

The literal goal of story #9885 — "remove the Material UI libraries, all MUI view
components, all MUI route/page/dialog conditions, and the legacy
`translation.[lang].json` files" — is the **terminal, epic-closing** task of epic
#1888. At the time this spec is written the codebase is **mid-migration**:

- **786 of 2754** source files (≈28.5%) still import `@mui/*` or `@emotion/*`.
- The entire legacy design system `src/core/ui/` (216 MUI files), the
  authentication pages (`src/core/auth/`), the top-level app shell, navigation,
  and footer (`src/main/ui/`), and 435 `src/domain/*` files are still MUI and
  serve **live, production routes**.
- `src/root.tsx` still wraps the whole application in MUI's `ThemeProvider`, and
  `TopLevelRoutes.tsx` still selects between a MUI route tree and a CRD route tree
  based on the per-user `designVersion` toggle.

Deleting the MUI packages and view components **today** would delete the running
application for every not-yet-migrated route and every user on `designVersion=1`.
That is neither shippable as a single PR nor compatible with the repository
constitution (Experience Quality & Safeguards) or the repo rule that MUI "MAY only
be removed as pages are migrated, and MUST NOT be extended."

**This feature therefore delivers the safe, mergeable, non-app-breaking slice of
#9885 that is achievable now**, and explicitly defers the destructive bulk removal
behind migration completion. Concretely, this feature delivers:

1. An authoritative, reproducible **MUI footprint baseline** (acceptance criterion
   #8 — "Measure the footprint before and after the removals").
2. A validated **removal inventory** — the complete, categorized list of every MUI
   surface (packages, view components, route/dialog conditions, tests, legacy
   translation files) that the remaining epic work removes, with the removal
   precondition stated per category.
3. **Documentation accuracy** (acceptance criterion #7) — bringing `docs/`,
   `CLAUDE.md`, the CRD docs, and `.coderabbit.yaml` references in line with the
   migration-gated removal policy and recording the baseline.

The destructive removals (uninstalling packages, deleting view components, removing
route conditions, deleting legacy translations) are enumerated as **Out of Scope
(deferred)** below, each tied to its unblocking precondition. They are tracked by
epic #1888 and executed by the per-page migration stories, with the final package
uninstall happening once the footprint reaches zero.

## Clarifications

### Session 2026-06-17 (clarify loop iteration 1 — YOLO, resolved by decision)

- **Q1 — Where do the deliverable artifacts (footprint baseline, removal
  inventory) live?** (Functional Scope)
  **Decision**: Inside the feature spec directory:
  `specs/111-remove-mui-library/mui-footprint-baseline.md` and
  `specs/111-remove-mui-library/mui-removal-inventory.md`, and linked from
  `docs/crd/migration-guide.md` (the existing MUI→CRD migration doc) so the rest
  of epic #1888 discovers them.
  **Rationale**: Keeps SDD artifacts colocated with their spec (repo convention),
  while the migration guide is the natural epic-facing entry point. Avoids
  inventing a new top-level docs location.

- **Q2 — Is the footprint baseline a static snapshot or a runnable script?**
  (Domain & Completion)
  **Decision**: A static, committed markdown snapshot recording the numbers, the
  commit SHA, and the **exact shell commands** that reproduce them. No new script
  file is added.
  **Rationale**: Reproducibility (FR-004) is satisfied by documenting the
  commands; adding a bespoke measurement script is over-engineering for a
  one-axis metric and conflicts with the repo's "minimal change" rule. The
  commands use tools already present (`grep`, `pnpm analyze`).

- **Q3 — Which bundle-size number is authoritative, and how is it obtained given
  no backend is available in this environment?** (Non-Functional / Measurement)
  **Decision**: The authoritative production-bundle metric is the summed size of
  the emitted JS chunk(s) whose modules resolve under `@mui`/`@emotion`, taken
  from a production build's bundle analysis (`pnpm analyze` →
  `build/stats.html`), reported in both raw and gzipped bytes when available. The
  baseline records the **method**; the numeric bundle figure is captured from a
  production build run as part of the exit-gate build (which does not require a
  backend — the build compiles the bundle; only live GraphQL calls need the
  backend). The source-file import count and dependency list (which need no
  build) are the primary, always-reproducible metrics.
  **Rationale**: Uses the repo's documented bundle-analysis tooling
  (`docs/bundle-analysis.md`); keeps the always-reproducible metrics independent
  of build/runtime availability.

- **Q4 — Should the `CLAUDE.md` "Active Technologies"/"Recent Changes" trailer be
  touched, given the SpecKit `update-agent-context` step also writes there?**
  (Interaction / tooling)
  **Decision**: The plan step's agent-context update owns the
  "Active Technologies"/"Recent Changes" trailer. The FR-008 documentation edit
  targets the human-authored prose (Overview and MUI-policy paragraphs) only, so
  the two do not collide.
  **Rationale**: Prevents double-editing the same section and keeps the
  agent-context script's output authoritative for its trailer.

- **Q5 — The story says "coderabbit.yml"; the repo file is `.coderabbit.yaml`.
  Which is canonical?** (Terminology)
  **Decision**: `.coderabbit.yaml` is the canonical, real file and the FR-009
  target. "coderabbit.yml" in the story is treated as a loose reference to the
  same file.
  **Rationale**: Matches the actual repository file; avoids creating a duplicate
  config.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Establish a reproducible MUI footprint baseline (Priority: P1)

A developer (or agent) needs a single, trustworthy, repeatable measurement of how
much MUI remains in the codebase and in the shipped bundle, so the epic's progress
toward zero is objective and the "before/after" comparison required by the story
can actually be computed.

**Why this priority**: Acceptance criterion #8 ("Measure the footprint before and
after") is the one criterion that is fully achievable now and is a hard
prerequisite for evaluating every later removal. Without an agreed baseline, no
later PR can demonstrate the "after" delta.

**Independent Test**: Run the footprint measurement command/script on a clean
checkout of `develop` and confirm it emits the documented metrics (source-file
count importing MUI, MUI runtime dependency list, and the MUI vendor chunk size
from the production bundle) deterministically, with the same numbers recorded in
the baseline artifact.

**Acceptance Scenarios**:

1. **Given** a clean checkout, **When** the footprint measurement is run, **Then**
   it reports the number of source files importing `@mui/*` or `@emotion/*`, the
   list of MUI/Emotion runtime dependencies in `package.json`, and the MUI vendor
   chunk size from a production build.
2. **Given** the measurement has been run, **When** a developer reads the baseline
   artifact, **Then** the exact numbers, the commit SHA they were taken at, and the
   commands that produced them are recorded so the measurement is reproducible.
3. **Given** a future migration PR that removes some MUI files, **When** the same
   measurement is re-run, **Then** the delta against the baseline is computable
   without ambiguity.

---

### User Story 2 - Produce the authoritative MUI removal inventory (Priority: P1)

A developer (or agent) executing the remaining migration stories needs a complete,
categorized map of every MUI surface in the repo and the precondition that must be
true before each surface can be safely removed, so removals proceed in the correct
order and nothing is missed when the epic closes.

**Why this priority**: The story lists five removal categories (libraries, view
components, route/page/dialog conditions, MUI-coupled business logic, MUI tests,
legacy translations). Turning these into a verified inventory is the highest-value
output that is safe to produce now and is what the rest of the epic executes
against.

**Independent Test**: Open the removal inventory artifact and confirm every MUI
category from the story is represented, each entry names concrete paths (or a
precise glob) and an unblocking precondition, and spot-checking a sample of entries
against the codebase confirms they are accurate.

**Acceptance Scenarios**:

1. **Given** the inventory artifact, **When** a developer reviews it, **Then** it
   enumerates: the MUI/Emotion runtime packages; the legacy design-system surface
   (`src/core/ui/`); the MUI route/dialog/page conditions (the `designVersion`
   toggle and the MUI route tree in `TopLevelRoutes.tsx`); MUI-coupled business
   logic that needs extraction; MUI-related tests; and the legacy
   `translation.<lang>.json` files.
2. **Given** any inventory entry, **When** a developer reads it, **Then** the entry
   states the precondition that unblocks its removal (e.g. "all consuming pages
   migrated to CRD", "package import count for X reaches zero").
3. **Given** the inventory, **When** it is cross-checked against the live grep of
   MUI imports, **Then** the categories account for all 786 currently-importing
   files (no MUI surface is unclassified).

---

### User Story 3 - Make the documentation reflect the migration-gated removal policy (Priority: P2)

A developer (or agent) reading the repo's guidance documents must see accurate,
non-contradictory information about MUI's status: that MUI is frozen and being
removed page-by-page, where the footprint baseline lives, and that no documentation
implies MUI is the current or permanent design system.

**Why this priority**: Acceptance criterion #7 ("Update the documentation … where
we have outdated information related to the MUI"). Documentation can be corrected
now without touching live code, and accurate docs prevent new MUI being introduced.

**Independent Test**: Grep the documentation set for MUI references and confirm
each remaining reference is either (a) historically accurate context, or (b)
updated to state the frozen/removal-in-progress policy and points at the footprint
baseline; no doc presents MUI as the design system for new work.

**Acceptance Scenarios**:

1. **Given** `CLAUDE.md`, **When** a developer reads the Overview, **Then** it no
   longer describes MUI as the design system without qualifying that it is frozen
   and being removed in favour of CRD.
2. **Given** the docs set (`docs/`, CRD docs, `.coderabbit.yaml`), **When** a
   developer searches for MUI guidance, **Then** statements about MUI's role are
   consistent with the constitution (MUI frozen; CRD is the only system for new
   features) and reference the footprint baseline location.
3. **Given** the documentation changes, **When** the repo's static-analysis and
   build gates run, **Then** they pass unchanged (documentation edits do not alter
   code behavior).

---

### Edge Cases

- **What happens when a "dead" MUI file looks removable but is reachable only in
  dev mode?** The `src/dev/` UI demo routes import MUI but are gated by
  `import.meta.env.MODE === 'development'` and tree-shaken out of production. They
  contribute zero production footprint and are still live in dev; they are listed
  in the inventory tied to their owning component migrations, **not** removed in
  this feature.
- **How does the system handle MUI imported transitively (not via `@mui/*`
  literal) — e.g. through `src/core/ui/` re-exports?** The footprint measurement
  counts direct `@mui/*`/`@emotion/*` imports as the primary metric and notes that
  `src/core/ui/` files are the main internal fan-out point, so consumer counts in
  the inventory reflect both direct and via-`core/ui` usage.
- **What happens if a legacy `translation.<lang>.json` key is still referenced by a
  not-yet-migrated MUI component?** The inventory marks legacy translation removal
  as blocked until the consuming components are migrated; the story's instruction
  to extract still-used strings into a new legacy translations file is recorded as
  the migration-time procedure, not executed now.
- **What happens to a user on `designVersion=1` (legacy/MUI) if removal proceeds
  too early?** Their entire experience breaks. The inventory makes "the
  `designVersion` toggle and MUI route tree may be removed only after every page is
  migrated and the toggle is retired" an explicit, blocking precondition.
- **What if the production bundle's MUI chunk name changes between builds?** The
  measurement records the chunk-identification method (vendor chunk(s) whose
  modules resolve under `@mui`/`@emotion`) rather than a hard-coded chunk filename,
  so it remains valid as chunking evolves.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The feature MUST produce a footprint baseline that records the count
  of source files under `src/` importing `@mui/*` or `@emotion/*`, measured at a
  recorded commit SHA.
- **FR-002**: The footprint baseline MUST record the complete list of MUI/Emotion
  runtime dependencies declared in `package.json` (currently `@mui/material`,
  `@mui/icons-material`, `@mui/system`, `@mui/types`, `@mui/x-data-grid`,
  `@mui/x-date-pickers`, `@emotion/react`, `@emotion/styled`).
- **FR-003**: The footprint baseline MUST record a bundle-size measurement of the
  MUI/Emotion contribution to the production build (the MUI/Emotion vendor
  chunk(s)), including the method used to identify those chunks.
- **FR-004**: The footprint measurement MUST be reproducible: the exact commands
  used MUST be documented so any developer/agent can re-run them and compute the
  before/after delta on a later commit.
- **FR-005**: The feature MUST produce a removal inventory that categorizes every
  MUI surface into the story's categories: (a) runtime libraries, (b) MUI view
  components, (c) route/page/dialog/context conditions, (d) MUI-coupled business
  logic requiring extraction, (e) MUI-related tests, (f) legacy
  `translation.<lang>.json` files.
- **FR-006**: Each removal-inventory category MUST state the precondition that must
  hold before that category can be removed without breaking the running
  application (e.g. "all consuming pages migrated to CRD", "MUI import count
  reaches zero", "designVersion toggle retired").
- **FR-007**: The removal inventory MUST account for all currently MUI-importing
  source files (no MUI surface left unclassified), cross-checked against a live
  grep of `@mui/*`/`@emotion/*` imports.
- **FR-008**: The feature MUST update `CLAUDE.md` so its Overview and any MUI
  guidance reflect that MUI is frozen and being removed in favour of CRD, and so it
  references the footprint baseline location.
- **FR-009**: The feature MUST review the documentation set (`docs/`, CRD docs,
  `.coderabbit.yaml`) and update any reference that presents MUI as the current or
  permanent design system, or that contradicts the constitution's MUI-frozen /
  CRD-only policy.
- **FR-010**: The feature MUST NOT remove any MUI runtime dependency from
  `package.json` while MUI import count is greater than zero.
- **FR-011**: The feature MUST NOT delete MUI view components, route/dialog
  conditions, the `designVersion` toggle, or legacy `translation.<lang>.json` files
  whose consuming components have not yet been migrated.
- **FR-012**: The feature MUST keep the repository's exit gates green: the full
  test suite, the production build, and the lint/format/typecheck pipeline MUST all
  pass after the changes.
- **FR-013**: The deliverable artifacts MUST live at
  `specs/111-remove-mui-library/mui-footprint-baseline.md` and
  `specs/111-remove-mui-library/mui-removal-inventory.md`, and MUST be linked from
  `docs/crd/migration-guide.md` so the rest of epic #1888 can consume them.
- **FR-014**: The footprint baseline MUST distinguish production-impacting MUI usage
  from dev-only MUI usage (e.g. `src/dev/` demo routes gated by
  `import.meta.env.MODE === 'development'`) so the "performance for the user"
  framing is measured against the production bundle.

### Key Entities

- **Footprint baseline**: A recorded snapshot of MUI's presence — source-file
  import count, runtime dependency list, production bundle contribution — captured
  at a known commit, with the commands that produced it.
- **Removal inventory**: A categorized catalog of every MUI surface with concrete
  paths/globs and the unblocking precondition per category.
- **MUI surface**: Any code, dependency, configuration, test, or translation file
  that depends on or describes MUI/Emotion.
- **Migration precondition**: The condition (typically "owning page(s) migrated to
  CRD" or "import count reaches zero") that must be true before a given MUI surface
  can be removed safely.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reproducible footprint baseline exists recording the source-file
  MUI import count (baseline observed at spec authoring: **786** files), the MUI
  runtime dependency list (**8** packages), and the production MUI bundle
  contribution, all at a recorded commit SHA.
- **SC-002**: Re-running the documented measurement commands on the same commit
  reproduces identical source-file and dependency numbers (deterministic
  measurement).
- **SC-003**: The removal inventory classifies **100%** of currently MUI-importing
  source files into the story's removal categories, with zero unclassified files.
- **SC-004**: Every removal-inventory category has an explicit, stated unblocking
  precondition — a developer can read the inventory and know, for any MUI surface,
  what must be true before it is removed.
- **SC-005**: After the documentation updates, **no** documentation file presents
  MUI as the design system for new or future work; every remaining MUI reference is
  either historical context or states the frozen/removal-in-progress policy.
- **SC-006**: The repository's three exit gates — full test suite, production build,
  lint/format/typecheck — all pass after the changes, with **zero** MUI runtime
  dependencies removed and **zero** live MUI components/routes/translations deleted
  (no behavioral change to the running app).
- **SC-007**: The "after" footprint for a future migration PR is computable as a
  delta against this baseline using only the documented commands.

## Assumptions

- **Migration is incomplete and gating.** ≈28.5% of source files still depend on
  MUI; the full literal removal is the epic's terminal task and cannot land as a
  single non-breaking PR now. This is the central scoping assumption.
- **Footprint = source import count + runtime dependency list + production bundle
  contribution.** The story says "measure the footprint" without defining it; this
  three-part definition is adopted as the measurable, technology-appropriate
  interpretation, with production-bundle size as the user-facing performance proxy.
- **`pnpm analyze` / the existing bundle-analysis tooling** (documented in
  `docs/bundle-analysis.md`, output at `build/stats.html`) is the supported way to
  measure the MUI bundle contribution; no new analysis tooling is introduced.
- **Dev-only MUI** (`src/dev/` demo routes) is excluded from the production
  footprint because it is tree-shaken out of production builds; it is still listed
  in the inventory for completeness, removed with its owning component migrations.
- **Legacy `translation.<lang>.json` files remain in service** for the
  not-yet-migrated MUI app and are therefore not removed now; the story's
  extract-still-used-strings-into-a-new-legacy-file procedure is recorded as the
  migration-time step.
- **No GraphQL schema changes** are involved; no `pnpm codegen` run is required.
- **Documentation-only and additive-artifact changes** are behavior-neutral, so the
  exit gates must pass unchanged.

## Out of Scope (deferred to epic #1888 / per-page migration stories)

Each item below is part of the literal story but is **not safe to execute now**;
it is captured in the removal inventory with its unblocking precondition.

- **Uninstalling the MUI/Emotion runtime packages** — blocked until the MUI source
  import count reaches **zero**.
- **Deleting MUI view components** (`src/core/ui/` and the MUI views under
  `src/domain/*`, `src/core/auth/*`, `src/main/ui/*`) — blocked until each
  component's consuming pages are migrated to CRD.
- **Removing the MUI route/page/dialog conditions** — the `designVersion` toggle
  (`useCrdEnabled`/`useDesignVersionToggle`/`useDesignVersionSync`) and the MUI
  route tree in `TopLevelRoutes.tsx`, plus the MUI `ThemeProvider` in `root.tsx` —
  blocked until **every** page is migrated and the toggle is retired.
- **Extracting MUI-coupled business logic reused by CRD** — performed per migration
  as each consuming page moves to CRD.
- **Deleting MUI-related tests** — removed alongside the components they cover.
- **Removing the legacy `translation.<lang>.json` files** (en, nl, es, bg, de, fr,
  plus ach/pt if still present) and extracting still-used strings into a new legacy
  translations file — blocked until no MUI component references them.
