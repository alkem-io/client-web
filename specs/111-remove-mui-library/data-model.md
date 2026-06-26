# Phase 1 Data Model: Remove MUI library and code

This feature ships no runtime data structures. The "entities" are the schemas of
the two committed markdown deliverables and the conceptual records they hold.

## Entity: Footprint Baseline (`mui-footprint-baseline.md`)

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| `commitSha` | string | Commit the measurement was taken at | `git rev-parse HEAD` |
| `baseBranch` | string | Branch the worktree was cut from | `origin/develop` |
| `sourceImportCount` | integer | Count of `src/` files importing `@mui/*` | grep + `wc -l` |
| `emotionDirectImportCount` | integer | Files importing `@emotion/*` directly | grep + `wc -l` |
| `totalSourceFiles` | integer | Total `.ts`/`.tsx` under `src/` | `find` + `wc -l` |
| `importsByArea` | map<string,int> | MUI-importing files per top-level area | grep + count |
| `importsBySubpackage` | map<string,int> | Import occurrences per `@mui/*` subpackage | grep + count |
| `runtimeDependencies` | list<{name,version}> | MUI/Emotion deps in `package.json` | `package.json` |
| `bundleContribution` | {method,rawBytes?,gzipBytes?} | Production MUI/Emotion chunk size + how it was identified | `pnpm analyze` → `build/stats.html` |
| `devOnlyExclusion` | note | Statement that `src/dev/` MUI is tree-shaken from prod | `src/dev/routes.tsx` |
| `reproductionCommands` | list<string> | Exact commands to recompute every metric | — |

**Invariants**:
- `sourceImportCount` ≤ `totalSourceFiles`.
- `emotionDirectImportCount` ≤ `sourceImportCount` (Emotion is mostly transitive).
- Every numeric metric MUST be paired with the command that produces it.
- `bundleContribution.method` MUST be present even if a numeric byte figure is
  pending a build.

## Entity: Removal Inventory (`mui-removal-inventory.md`)

A table of MUI surfaces, one row per surface category.

| Field | Type | Description |
|-------|------|-------------|
| `category` | enum | One of: `runtime-library`, `view-component`, `route-dialog-condition`, `coupled-business-logic`, `mui-test`, `legacy-translation` |
| `surface` | string | Concrete path(s) or precise glob |
| `count` | integer | Number of files/items in scope (where countable) |
| `unblockingPrecondition` | string | What must be true before safe removal |
| `removalOwner` | string | Which epic work removes it (per-page migration / final cleanup) |
| `notes` | string | Extraction or extract-strings instructions where relevant |

**Invariants**:
- Every one of the **786** currently `@mui/*`-importing `.ts`/`.tsx` files MUST be
  covered by at least one `view-component`, `coupled-business-logic`,
  `route-dialog-condition`, or `mui-test` row (FR-007 / SC-003: zero
  unclassified). `runtime-library` covers packages and `legacy-translation`
  covers `.json` files; neither contributes to the `.ts`/`.tsx` import count.
- Every row MUST have a non-empty `unblockingPrecondition` (FR-006 / SC-004).
- The `runtime-library` row's precondition MUST be "source MUI import count == 0".

## Conceptual record: Migration Precondition

A boolean condition over the codebase state (e.g. "all consuming pages migrated to
CRD", "`designVersion` toggle retired", "MUI import count == 0"). Not stored as
code; expressed in the inventory rows. Used by epic #1888 to sequence removals.

## State transitions (epic-level, informational)

```
[MUI surface present] --(owning page migrated to CRD)--> [surface unreferenced]
[surface unreferenced] --(removal PR)--> [surface deleted]
[all surfaces deleted => import count == 0] --(cleanup PR)--> [packages uninstalled]
```

This feature performs none of these transitions; it documents the map that drives
them.
