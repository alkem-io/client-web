# Quickstart: Reproduce the MUI footprint measurement

These are the exact commands behind the footprint baseline. Run them from the
repo root of a clean checkout to recompute the footprint on any commit and diff it
against `mui-footprint-baseline.md`.

## 1. Source-file MUI import count (build-independent, deterministic)

```bash
# Files importing @mui/*
grep -rlE "@mui/" --include='*.ts' --include='*.tsx' src | wc -l

# Files importing @emotion/* directly
grep -rlE "@emotion/" --include='*.ts' --include='*.tsx' src | wc -l

# Total .ts/.tsx files under src/
find src -name '*.ts' -o -name '*.tsx' | wc -l
```

## 2. Distribution breakdown

```bash
# By top-level area
grep -rlE "@mui/" --include='*.ts' --include='*.tsx' src | sed 's#^src/##' | cut -d/ -f1 | sort | uniq -c | sort -rn

# Legacy design-system surface specifically
grep -rlE "@mui/" --include='*.ts' --include='*.tsx' src/core/ui | wc -l

# Import occurrences per subpackage
grep -rho "@mui/[a-z-]*\|@emotion/[a-z-]*" --include='*.ts' --include='*.tsx' src | sort | uniq -c | sort -rn
```

## 3. Runtime dependency list

```bash
# MUI/Emotion runtime deps
node -e "const p=require('./package.json'); console.log(Object.entries({...p.dependencies}).filter(([k])=>/^@(mui|emotion)\//.test(k)))"
```

(or simply read the `@mui/*` and `@emotion/*` lines in `package.json`
`dependencies` and `pnpm.overrides`.)

## 4. Production bundle contribution

```bash
# Build with bundle analysis (no backend required for the build itself)
pnpm analyze
# Open the report and read the @mui / @emotion chunk sizes
open build/stats.html   # macOS; use xdg-open on Linux
```

The MUI/Emotion contribution is the summed size of the chunk(s) whose modules
resolve under `@mui`/`@emotion`. Record raw and gzipped bytes.

## 5. Recording the commit

```bash
git rev-parse HEAD
git rev-parse --abbrev-ref HEAD
```

## Computing the "after" delta (for future migration PRs)

Re-run steps 1–4 on the new commit and subtract from the baseline. A migration PR
is "footprint-positive" when `sourceImportCount` and `bundleContribution` both
decrease and never increase. The packages may be uninstalled only once
`sourceImportCount == 0`.
