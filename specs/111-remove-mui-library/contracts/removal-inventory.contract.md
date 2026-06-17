# Contract: MUI Removal Inventory artifact

**Artifact**: `specs/111-remove-mui-library/mui-removal-inventory.md`
**Satisfies**: FR-005, FR-006, FR-007; SC-003, SC-004

The inventory artifact MUST contain, as readable markdown:

1. **One section (or table block) per removal category** — all six MUST be present:
   - `runtime-library` — the `@mui/*` and `@emotion/*` packages.
   - `view-component` — MUI presentational components (`src/core/ui/*` and MUI
     views under `src/domain/*`, `src/core/auth/*`, `src/main/ui/*`, etc.).
   - `route-dialog-condition` — the `designVersion` toggle
     (`useCrdEnabled`/`useDesignVersionToggle`/`useDesignVersionSync`), the MUI
     route tree in `TopLevelRoutes.tsx`, and the MUI `ThemeProvider` in `root.tsx`.
   - `coupled-business-logic` — MUI-coupled logic reused by CRD that must be
     extracted before its host component is deleted.
   - `mui-test` — tests that exercise MUI components.
   - `legacy-translation` — `src/core/i18n/<lang>/translation.<lang>.json` files.

2. **Per row/entry**, the fields from `data-model.md`:
   - concrete path(s) or precise glob,
   - count where countable,
   - a **non-empty** unblocking precondition,
   - the removal owner (per-page migration vs final cleanup),
   - extraction/extract-strings notes where relevant.

3. **Coverage assertion** — an explicit statement (with the reproducing command)
   that the `view-component` + `coupled-business-logic` + `route-dialog-condition`
   + `mui-test` rows together account for **all** currently `@mui/*`-importing
   `.ts`/`.tsx` files (the baseline's `sourceImportCount`), i.e. zero files are
   unclassified. (`runtime-library` covers packages, and `legacy-translation`
   covers `.json` files; neither contributes to the `.ts`/`.tsx` import count.)

4. **Ordering note** — that the `runtime-library` removal is last and gated on the
   source MUI import count reaching zero.

**Acceptance checks**:
- All six categories present (FR-005).
- Every entry has a non-empty precondition (FR-006 / SC-004).
- Coverage assertion holds against a live grep of `@mui/*` imports (FR-007 /
  SC-003): no unclassified MUI-importing `.ts`/`.tsx` file (the four code
  categories cover all of them).
