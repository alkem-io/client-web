# MUI Footprint Baseline

Authoritative "before" snapshot for epic #1888 (story #9885). Re-run the commands
in any later checkout to compute the "after" delta. See `quickstart.md` for the
full command reference and `contracts/footprint-baseline.contract.md` for the
required shape.

## Provenance

| Field | Value |
|-------|-------|
| Commit SHA | `8e1dbcfd0dc395b1de6032da36f92cf7ec61829b` |
| Base branch | `origin/develop` |
| Date measured | 2026-06-17 |
| Repo | `alkem-io/client-web` |

## 1. Source-import metric

| Metric | Value | Command |
|--------|-------|---------|
| Files matching the bare string `@mui/` (headline metric) | **786** | `grep -rlE "@mui/" --include='*.ts' --include='*.tsx' src \| wc -l` |
| Files with a real `@mui/*` import statement | **784** | `grep -rlE "(import\|require\|from)[^;]*['\"]@mui/" --include='*.ts' --include='*.tsx' src \| wc -l` |
| Files importing `@emotion/*` directly | **1** | `grep -rlE "@emotion/" --include='*.ts' --include='*.tsx' src \| wc -l` |
| Total `.ts`/`.tsx` files under `src/` | **2754** | `find src -name '*.ts' -o -name '*.tsx' \| wc -l` |
| MUI share of source files | **≈28.5%** | 786 / 2754 |

**Note on the 2-file gap (786 vs 784):** two CRD files match the string `@mui/`
only in a comment / test assertion, not an import — they confirm the CRD layer
stays MUI-free:
- `src/main/crdPages/subspace/hooks/useSubspaceSidebarCollapsed.ts` (comment)
- `src/main/routing/__tests__/crdContributorSettingsRoutes.test.ts` (assertion)

The headline `786` (bare-string grep) is the simplest reproducible number; `784`
is the import-statement-precise figure. Either is valid for the before/after
delta as long as the same command is used on both ends. Emotion is almost entirely
transitive through MUI's `styled`/theme, which is why eliminating MUI is what
removes Emotion in practice.

## 2. Distribution breakdown

By top-level area (bare-string grep, `cut -d/ -f1`):

| Area | MUI files | Command |
|------|-----------|---------|
| `src/domain` | 435 | `grep -rlE "@mui/" --include='*.ts*' src/domain \| wc -l` |
| `src/core` | 250 | `grep -rlE "@mui/" --include='*.ts*' src/core \| wc -l` |
| ↳ of which `src/core/ui` (legacy design system) | 216 | `grep -rlE "@mui/" --include='*.ts*' src/core/ui \| wc -l` |
| ↳ of which `src/core/auth` | 27 | `grep -rlE "@mui/" --include='*.ts*' src/core/auth \| wc -l` |
| `src/main` | 94 | `grep -rlE "@mui/" --include='*.ts*' src/main \| wc -l` |
| `src/dev` (dev-only, see §6) | 6 | `grep -rlE "@mui/" --include='*.ts*' src/dev \| wc -l` |

Top `src/domain` slices: `collaboration` 95, `community` 86, `space` 57,
`shared` 42, `platformAdmin` 35, `spaceAdmin` 26, `templates` 25,
`communication` 21.

Import occurrences per subpackage
(`grep -rho "@mui/[a-z-]*\|@emotion/[a-z-]*" --include='*.ts*' src | sort | uniq -c`):

| Subpackage | Occurrences |
|------------|-------------|
| `@mui/material` | 836 |
| `@mui/icons-material` | 440 |
| `@mui/system` | 11 |
| `@mui/x-data-grid` | 10 |
| `@mui/x-date-pickers` | 2 |
| `@mui/types` | 2 |
| `@emotion/react` | 1 |

## 3. Runtime dependency list

From `package.json` `dependencies`:

| Package | Declared version |
|---------|------------------|
| `@mui/material` | `7.1.0` |
| `@mui/icons-material` | `7.1.0` |
| `@mui/system` | `^7.1.0` |
| `@mui/types` | `^7.4.6` |
| `@mui/x-data-grid` | `7.28.3` |
| `@mui/x-date-pickers` | `^8.3.0` |
| `@emotion/react` | `^11.13.5` |
| `@emotion/styled` | `^11.13.5` |

Also pinned in `package.json` `pnpm.overrides`: `@emotion/styled` `^11.13.5`.

**Total MUI/Emotion runtime packages: 8.**

## 4. Production bundle contribution

- **Method**: `pnpm analyze` (`ANALYZE=true pnpm build`) emits
  `build/stats.html` via `rollup-plugin-visualizer`. The MUI/Emotion contribution
  is the summed size of the emitted JS chunk(s) whose modules resolve under
  `@mui`/`@emotion` (read raw + gzipped from the report). The method, not a
  hard-coded chunk filename, is the durable record (chunk names drift as chunking
  evolves).
- **Figure** (captured from the exit-gate `pnpm build` at commit
  `8e1dbcfd0`, Vite 7 / production mode): the build emits two dedicated MUI vendor
  chunks:

  | Chunk | Raw | Gzipped |
  |-------|-----|---------|
  | `vendor-mui-core` | 440.18 kB | 130.83 kB |
  | `vendor-mui-extended` | 461.66 kB | 137.38 kB |
  | **MUI total** | **901.84 kB** | **268.21 kB** |

  These are the chunks whose modules resolve under `@mui`/`@emotion` (the manual
  chunk grouping in `vite.config.mjs` names them `vendor-mui-*`). This is the
  user-facing performance figure the epic drives toward zero. Note: Emotion is
  bundled within these MUI chunks (transitive), and additional MUI code may also
  be inlined into route chunks that import MUI components directly — so 901.84 kB
  raw is a lower bound on MUI's total shipped weight; the `vendor-mui-*` chunk
  sum is the stable, reproducible headline. (The build needs no backend — it
  compiles the bundle; only live GraphQL calls need the backend.)
- For a richer per-module view, run `pnpm analyze` and open `build/stats.html`.

## 5. MUI-importing tests

- Exactly **1** of the MUI-importing files is a test
  (`src/main/routing/__tests__/crdContributorSettingsRoutes.test.ts`, and it
  references `@mui` only in an assertion). MUI test coverage is therefore tied to
  the components it exercises and is removed alongside them.

## 6. Dev-only exclusion note

`src/dev/routes.tsx` ends with
`export default import.meta.env.MODE === 'development' ? devRoutes : () => null`,
so the `src/dev/` UI demo routes (6 MUI-importing files) are tree-shaken out of
production builds. They contribute **zero** production bundle footprint and are
excluded from the user-facing performance metric; they are still listed in the
removal inventory for completeness and removed with their owning component
migrations.

## 7. Reproduction

```bash
git rev-parse HEAD                                                          # provenance
grep -rlE "@mui/" --include='*.ts' --include='*.tsx' src | wc -l            # headline source count (786)
grep -rlE "@emotion/" --include='*.ts' --include='*.tsx' src | wc -l        # emotion direct (1)
find src -name '*.ts' -o -name '*.tsx' | wc -l                              # total (2754)
grep -rlE "@mui/" --include='*.ts' --include='*.tsx' src \
  | sed 's#^src/##' | cut -d/ -f1 | sort | uniq -c | sort -rn               # by area
grep -rho "@mui/[a-z-]*\|@emotion/[a-z-]*" --include='*.ts' --include='*.tsx' src \
  | sort | uniq -c | sort -rn                                               # by subpackage
pnpm analyze && open build/stats.html                                       # bundle (xdg-open on Linux)
```

A future migration PR is "footprint-positive" when the source count and the
bundle figure both decrease (never increase). The 8 packages may be uninstalled
only once the source MUI import count reaches **0**.

## 8. After increment 1 (story #9885 — retire designVersion toggle + delete legacy-only tree)

First real code-removal increment of epic #1888. CRD is now the only runtime
path (the `designVersion` toggle and its MUI route siblings are gone); the
unreachable legacy tree was deleted. `@mui`/`@emotion` remain installed and the
CRD→MUI bridge files (dominated by `src/core/ui/*`) are untouched — those are
later increments.

| Metric | Before (commit `8e1dbcfd0`) | After increment 1 | Delta |
|--------|------|------|------|
| Files matching bare string `@mui/` (headline) | **786** | **572** | **−214** |
| Files importing `@emotion/*` directly | 1 | 1 | 0 |
| Total `.ts`/`.tsx` files under `src/` | 2754 | 2311 | −443 |
| Total source files deleted this PR | — | **443** | — |
| `src/core/ui/*` MUI files (bridge — untouched) | 216 | 216 | 0 |

Commands (same as §7):

```bash
grep -rlE "@mui/" --include='*.ts' --include='*.tsx' src | wc -l   # 572
find src -name '*.ts' -o -name '*.tsx' | wc -l                     # 2311
```

**Bundle:** the dedicated MUI vendor chunks are essentially unchanged
(`vendor-mui-core` ≈420 kB, `vendor-mui-extended` ≈462 kB, plus a split-out
`vendor-mui-icons` ≈48 kB). Expected: this increment removes legacy-only
*routes/pages* (already lazy, largely tree-shaken from the eager graph) and does
not yet touch the `src/core/ui/*` primitives that dominate the shared MUI chunks.
Bundle reduction lands when the bridge layer is removed.

**Why 443 deleted ≫ the 167 "legacy-only" estimate:** the 167/98 figures counted
only files *reachable solely via the legacy route tree*; the full dead subtree
also includes their non-MUI leaves (hooks, models, mappers, GraphQL-adjacent
`.ts`, and co-located tests) plus the dropped Contributors / InnovationHubs route
subtrees. Every deletion is validated unreachable by `tsc --noEmit`, the Vite
production build, and the full vitest suite all passing.
