# Contract: MUI Footprint Baseline artifact

**Artifact**: `specs/111-remove-mui-library/mui-footprint-baseline.md`
**Satisfies**: FR-001, FR-002, FR-003, FR-004, FR-014; SC-001, SC-002, SC-007

The baseline artifact MUST contain, as readable markdown:

1. **Provenance block**
   - Commit SHA the measurement was taken at.
   - Base branch (`origin/develop`).
   - Date of measurement.

2. **Source-import metric**
   - The integer count of `src/` files importing `@mui/*`.
   - The integer count of files importing `@emotion/*` directly.
   - The total `.ts`/`.tsx` file count and the resulting percentage.
   - The exact command(s) that reproduce these counts.

3. **Distribution breakdown**
   - MUI-importing files grouped by top-level area (`src/core`, `src/domain`,
     `src/main`, `src/dev`), with `src/core/ui` called out.
   - Import occurrences per `@mui/*` subpackage.

4. **Runtime-dependency list**
   - Every `@mui/*` and `@emotion/*` entry in `package.json` `dependencies` with
     its declared version, plus the `pnpm.overrides` Emotion pins.

5. **Production bundle contribution**
   - The method used to identify the MUI/Emotion chunk(s) (`pnpm analyze` →
     `build/stats.html`, chunks whose modules resolve under `@mui`/`@emotion`).
   - The numeric size (raw and gzipped where available) if a production build was
     run; otherwise an explicit "method recorded; figure to be captured from the
     gate build" note.

6. **Dev-only exclusion note**
   - A statement that `src/dev/` MUI usage is tree-shaken from production
     (`src/dev/routes.tsx` is `MODE === 'development'` gated) and is therefore
     excluded from the production footprint.

7. **Reproduction section**
   - A copy-pasteable command list so any developer/agent can recompute the
     "after" footprint on a later commit and diff it against this baseline.

**Acceptance check**: Re-running the documented source-import and dependency
commands on the recorded commit reproduces the recorded integers exactly
(deterministic — SC-002).
