# MUI Removal Inventory

The authoritative, categorized map of every MUI surface in `client-web` and the
precondition that unblocks each removal. See
`contracts/removal-inventory.contract.md` for the required shape and
`mui-footprint-baseline.md` for the "before"/"after-increment-1" numbers.

> **The verified removal model (read first — supersedes the old "per-page
> migration of 435 domain views" framing).** Removal is driven at the **route
> level**, not by rewriting every domain view:
>
> 1. **CRD is the default and only runtime path.** `TopLevelRoutes` previously
>    swapped each top-level route between a `Crd*` and a MUI sibling off
>    `useCrdEnabled()`. Story #9885 **removed the `designVersion` toggle and forced
>    CRD for everyone** — the MUI route siblings are no longer rendered, so the
>    whole legacy route tree became unreachable.
> 2. **Legacy-only deletion (done in this PR).** Once the toggle was gone, every
>    file reachable *only* through the legacy MUI route tree was dead and was
>    deleted (443 source files; `@mui/` source count 786 → 572). Validated
>    unreachable by `tsc`, the production build, and the full vitest suite.
> 3. **The remaining work is the CRD→MUI bridge.** ~**229 MUI files are imported
>    directly by CRD code** ("bridge edges"), dominated by **67 `src/core/ui/*`
>    primitives** (Gutters, PageContentBlock, Avatar, RouterLink, Loading,
>    Breadcrumbs, cards, forms…) plus ~160 domain dialogs/components. **These are
>    NOT yet removable** — CRD still depends on them. They are the gating work
>    before `@mui`/`@emotion` can be uninstalled, and the focus of later
>    increments (replace each bridge primitive with a CRD equivalent, then delete
>    the MUI one). The runtime packages are uninstalled **last**, only once the
>    source `@mui/*` import count reaches **0**.
> 4. **Three non-toggled routes were product-dropped.** `Contributors`
>    (`/contributors`) and `InnovationHubs` (`/innovation-hubs/*`) rendered MUI
>    even on CRD and had no CRD inbound links — their routes + page subtrees were
>    removed outright. `InnovationPacks` (`/innovation-packs/*`) was *kept*: unlike
>    the other two it has a live CRD branch (`CrdInnovationPackProfilePage` /
>    `CrdInnovationPackAdminPage`) that CRD navigation links into, so its route was
>    forced to CRD and only the MUI branch (`InnovationPackProfilePage`,
>    `AdminInnovationPackPage`) was deleted.

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
| ~~`useCrdEnabled.ts`, `useDesignVersionToggle.ts`, `useDesignVersionSync.ts` (+ tests), `DesignVersionUpgradePromptMount`, `DesignVersionUpgradeDialog`, the user-menu switch, and the Sentry/APM `designVersion` tag hooks~~ | — | **DONE (#9885)** | — | ✅ Removed. The `designVersion` toggle machinery and all client read-paths that drove routing are gone. Server-side `UserSettings.designVersion` GraphQL field is intentionally left in place (just no longer read on the client). |
| ~~`src/main/routing/TopLevelRoutes.tsx` — MUI-vs-CRD selection off `useCrdEnabled()`~~ | — | **DONE (#9885)** | — | ✅ Forced CRD. Every top-level route now renders its `Crd*` branch unconditionally; the MUI siblings and their lazy imports were removed. |
| `src/root.tsx` + `src/core/ui/themes/RootThemeProvider.tsx` — MUI `ThemeProvider` wrapping the whole app | 2 | No descendant route needs MUI theming (i.e. the 229 bridge files are gone) | Final cleanup PR | CRD never calls `useTheme()`; removable once all bridge MUI views are gone. **Stays for now.** |

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

The category tables above are the original **786-file baseline** taxonomy (the
"before" snapshot). After increment 1 the live MUI surface is **572** files (786
− 214); the deleted 214 came out of `view-component` (legacy-only domain/main/auth
pages + the dropped Contributors/InnovationHubs/InnovationPacks-MUI subtrees) and
`route-dialog-condition` (the toggle machinery). `src/core/ui/*` (216, the
bridge) is **unchanged** — it is the bulk of the remaining 572.

Reproduce / re-validate the current count:

```bash
grep -rlE "@mui/" --include='*.ts' --include='*.tsx' src | wc -l        # 572 (was 786)
# By area
grep -rlE "@mui/" --include='*.ts' --include='*.tsx' src \
  | sed 's#^src/##' | cut -d/ -f1 | sort | uniq -c | sort -rn
```

The remaining 572 are dominated by the **229 CRD→MUI bridge files** (still
imported by live CRD code) plus their transitive MUI leaves — these are removed
in later increments by replacing each bridge primitive with a CRD equivalent. No
live route renders a MUI page directly any more; the only MUI that reaches the
user is via these bridge imports.
