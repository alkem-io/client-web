# MUI Removal Inventory

The authoritative, categorized map of every MUI surface in `client-web` and the
precondition that unblocks each removal. Produced by story #9885; **executed
incrementally by epic #1888's per-page migration stories** — this story removes
nothing from runtime. See `contracts/removal-inventory.contract.md` for the
required shape and `mui-footprint-baseline.md` for the "before" numbers.

> **Removal ordering (read first):** MUI is removed **page by page** as each page
> migrates to CRD. The runtime packages are uninstalled **last**, only once the
> source `@mui/*` import count reaches **0**. Removing earlier breaks live routes
> and any user still on `designVersion=1` (legacy/MUI).

## Category: `runtime-library`

| Surface | Count | Unblocking precondition | Removal owner | Notes |
|---------|-------|-------------------------|---------------|-------|
| `@mui/material`, `@mui/icons-material`, `@mui/system`, `@mui/types`, `@mui/x-data-grid`, `@mui/x-date-pickers`, `@emotion/react`, `@emotion/styled` (deps) + `@emotion/styled` (`pnpm.overrides`) | 8 pkgs | Source `@mui/*` import count == **0** | Final cleanup PR | Uninstall + drop the `pnpm.overrides` Emotion pin; run `pnpm install` to update the lockfile. |

## Category: `view-component`

| Surface | Count | Unblocking precondition | Removal owner | Notes |
|---------|-------|-------------------------|---------------|-------|
| `src/core/ui/**` — the legacy MUI design system (buttons, cards, dialogs, forms, grid, navigation, typography, themes, etc.) | 216 | All consumers (domain/main pages) migrated to CRD equivalents | Per-page migration | Internal fan-out point most `src/domain`/`src/main` MUI usage depends on; remove after consumers migrate. |
| `src/domain/**` MUI views | 435 | Each owning page migrated to CRD | Per-page migration | Largest slices: `collaboration` 95, `community` 86, `space` 57, `shared` 42, `platformAdmin` 35, `spaceAdmin` 26, `templates` 25, `communication` 21, `timeline` 15, `InnovationPack` 11, `innovationHub` 8. |
| `src/core/auth/**` MUI auth UI (login, registration, recovery, Kratos UI, accept-terms) | 27 | Auth pages migrated to CRD | Per-page migration | — |
| `src/main/ui/**`, `src/main/topLevelPages/**`, `src/main/guidance/**`, `src/main/userMessaging/**`, `src/main/search/**`, `src/main/inAppNotifications/**`, `src/main/admin/**`, `src/main/public/**` MUI shells/layouts/nav/footer | 94 (all `src/main`) | Owning shells/pages migrated to CRD | Per-page migration | Includes the top-level layout, platform navigation, footer. |
| `src/dev/**` MUI demo route components | 6 | Owning component(s) migrated | Per-page migration | **Dev-only** — `import.meta.env.MODE === 'development'` gated in `src/dev/routes.tsx`; tree-shaken from production (zero prod footprint). |

## Category: `route-dialog-condition`

| Surface | Count | Unblocking precondition | Removal owner | Notes |
|---------|-------|-------------------------|---------------|-------|
| `src/main/crdPages/useCrdEnabled.ts`, `useDesignVersionToggle.ts`, `useDesignVersionSync.ts` (+ their tests) — the `designVersion` (MUI vs CRD) toggle | ~3 + tests | **Every** page migrated to CRD and the toggle retired | Final cleanup PR | Server-side `UserSettings.designVersion`; LS mirror `alkemio-design-version`. Toggle UI in the user menu also removed. |
| `src/main/routing/TopLevelRoutes.tsx` — selection between MUI and CRD route trees off `useCrdEnabled()` | 1 | Same as above (toggle retired) | Final cleanup PR | After removal, CRD routes are the only routes. |
| `src/root.tsx` + `src/core/ui/themes/RootThemeProvider.tsx` — MUI `ThemeProvider` wrapping the whole app | 2 | No descendant route needs MUI theming | Final cleanup PR | CRD never calls `useTheme()`; removable once all MUI views are gone. |

## Category: `coupled-business-logic`

| Surface | Count | Unblocking precondition | Removal owner | Notes |
|---------|-------|-------------------------|---------------|-------|
| MUI-coupled hooks/utils reused by CRD (e.g. logic in `src/core/ui/**` or `src/domain/**` `.ts` helpers that also feed CRD) | (subset of the 784 import files that are `.ts`, not view `.tsx`) | The CRD consumer no longer needs the MUI-coupled variant | Per-page migration | **Extract** the reusable logic into an MUI-free module before deleting the MUI host (story instruction). Identify per migration via the import graph. |

## Category: `mui-test`

| Surface | Count | Unblocking precondition | Removal owner | Notes |
|---------|-------|-------------------------|---------------|-------|
| `*.test.ts`/`*.test.tsx` referencing MUI | 1 (`src/main/routing/__tests__/crdContributorSettingsRoutes.test.ts`, assertion only) + any tests covering MUI components | Removed with the component(s) each test covers | Per-page migration | Most MUI tests live next to MUI components and are deleted alongside them. |

## Category: `legacy-translation`

| Surface | Count | Unblocking precondition | Removal owner | Notes |
|---------|-------|-------------------------|---------------|-------|
| `src/core/i18n/<lang>/translation.<lang>.json` — `en`, `nl`, `es`, `bg`, `de`, `fr`, `ach`, `pt` | 8 files | No MUI component references the `translation` (default) namespace | Final cleanup PR | Before deletion, **extract still-used strings into a new legacy translations file** (story instruction). Core EN is already FROZEN for new keys (constitution Std #3). |

## Coverage assertion (FR-007 / SC-003)

The four code categories above — `view-component` (216 + 435 + 27 + 94 + 6 across
`src/core/ui`, `src/domain`, `src/core/auth`, `src/main`, `src/dev`),
`route-dialog-condition`, `coupled-business-logic`, and `mui-test` — together
account for **every** `.ts`/`.tsx` file matching the baseline source-import grep.
`runtime-library` covers packages (not files) and `legacy-translation` covers
`.json` files (not counted in the `.ts`/`.tsx` import metric), so neither adds to
the file total.

Reproduce / re-validate the file coverage:

```bash
# Total MUI-importing .ts/.tsx files (must equal the sum classified above)
grep -rlE "@mui/" --include='*.ts' --include='*.tsx' src | wc -l        # 786
# By area (cross-check the per-row counts)
grep -rlE "@mui/" --include='*.ts' --include='*.tsx' src \
  | sed 's#^src/##' | cut -d/ -f1 | sort | uniq -c | sort -rn
```

The per-area counts reconcile to the 786 headline:
`src/domain` 435 + `src/core` 250 + `src/main` 94 + `src/dev` 6 + `src/root.tsx`
1 = **786**. (`src/core` 250 = `src/core/ui` 216 + `src/core/auth` 27 + 7 other
core; `src/root.tsx` is the MUI `ThemeProvider` host, classified under
`route-dialog-condition`.) No MUI-importing source file is left unclassified.
