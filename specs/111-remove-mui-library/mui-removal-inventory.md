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

## Increment 2a — layout & utility primitives (story #9885)

Batch 2a targeted the highest-CRD-fan-in `src/core/ui` layout/utility primitives.
After call-site analysis the actionable, non-entangling subset was a single file.
`@mui/` source count **572 → 571**.

**Severed via approach #2 (de-MUI in place, public API + import path unchanged):**

- `src/core/ui/loading/Loading.tsx` — `Box` + `CircularProgress` + MUI `Caption`
  → plain `div` + Tailwind utilities (`flex grow items-center justify-center
  gap-4 h-full text-primary`) + `lucide-react` `Loader2` (`animate-spin`) + a
  `<span>` for the uppercase/medium caption. `gap: 2` → `gap-4` (16px), spinner
  `size-10` (~40px, MUI default), caption `text-xs` (12px) `font-medium`
  `leading-none`, `primary.main` → CRD `text-primary` token. Props (`{ text? }`)
  and import path identical → its **13** direct CRD importers unchanged.
  Co-located `Loading.spec.tsx` rewritten from 3 `test.skip` (stale snapshot
  tests) to 2 real passing assertions; stale `__snapshots__` removed.

**Deferred (principle #3 — entangled with MUI theming / out-of-scope consumers):**

- `grid/Gutters.tsx`, `grid/GuttersGrid.tsx`, `grid/GridContainer.tsx`,
  `grid/constants.ts`, `grid/utils.ts` — `Gutters`/etc. `extends BoxProps`; ~90+
  (mostly out-of-scope legacy MUI) callers pass MUI shorthands (`sx`,
  `alignItems`, `gap`, `flexDirection`, `paddingX`, …) that only a MUI `Box`
  accepts. `gutters()` returns a `(theme) => theme.spacing(...)` callback used by
  **229** consumers incl. out-of-scope `PreviewStyles.ts`; `useScreenSize` /
  `useGlobalGridColumns` wrap MUI `useMediaQuery` + theme breakpoints (50 / 9
  consumers). **0** direct CRD importers of the grid components except `Gutters`
  (2). De-MUI in place would break the out-of-scope `BoxProps`/callback contract.
- `link/RouterLink.tsx` — `extends MuiLinkProps`; **27** callers use it as
  `component={RouterLink}` inside MUI components, 15 pass `underline=`, 4 pass
  `sx=`. **0** direct CRD importers.
- `overflow/AutomaticOverflowGradient.tsx`, `overflow/OverflowGradient.tsx`,
  `overflow/ScrollerWithGradient.tsx`, `overflow/utils.ts` — render `Box` with
  `sx`/`BoxProps`, consume `gutters()` and `overflowBorderGradient()` (theme
  palette gradient, also used by out-of-scope `PreviewStyles.ts`). **0** direct
  CRD importers — sever no CRD→MUI edge yet.

These unblock once the shared `BoxProps`/theme-callback contracts (`gutters()`,
`overflowBorderGradient()`, `useScreenSize`) are themselves migrated, in a later
increment.

## Increment 2b — dead-code cascade sweep (story #9885)

Pure deletion. After increment 1 removed the legacy MUI route tree and 2a
de-MUI'd `Loading`, a reachability trace from the real app entry `src/index.tsx`
(following static + dynamic + `vi.mock` + type imports, with **every `*.spec`/
`*.test`/`*.stories` file, `setupTests.ts`, and `*.d.ts` treated as live roots**
so nothing a test still exercises is mis-flagged) found a set of files reachable
by **nothing** — dead. They were deleted as a cascade and revalidated; the cascade
**converged in 1 round** (re-running the trace after the deletion found 0 new dead
files). **50 files deleted: 27 MUI + 23 non-MUI** (the non-MUI files are co-located
hooks/services/types/empty-stubs that only the dead MUI/CRD files dragged).

`@mui/` source count **571 → 544** (−27).

**Deleted by area (MUI / non-MUI):**

| Area | MUI | non-MUI | Total |
|------|-----|---------|-------|
| `src/core/ui/*` | 23 | 9 | 32 |
| `src/crd/components/*` | 0 | 12 | 12 |
| `src/crd/forms/*` | 0 | 1 | 1 |
| `src/dev/ui/plansTable/*` | 2 | 0 | 2 |
| `src/domain/license/plans/*` | 1 | 1 | 2 |
| `src/domain/community/organization/*` | 1 | 0 | 1 |
| **Total** | **27** | **23** | **50** |

Notable deletions: `core/ui` orphans — `Breadcrumbs`/`BreadcrumbsItem` (+ their
type-only `Expandable.ts` and `flattenChildren.ts`), the `SettingsGroups`
`Dual`/`Triple`SwitchSettingsGroup cluster (+ its now-orphaned
`services/NotificationValidationService.ts`, `types/NotificationTypes.ts`,
`components/NotificationSwitchTooltip.tsx`), `pageBanner`/`pageBannerCard`,
`notifications/*` (`NotificationHandler`, `NotificationView`,
`ErrorNotificationContent`), `card/CardFooter*`, `content/DashboardBanner`,
`SeeMoreExpandable`, `LabeledCount`, `actions/ButtonNarrow`, `error/ErrorBlock`,
`forms/FormikRadiosSwitch`, `forms/editMode.ts`, `list/SubspaceLinkList`,
`typography/TextWithTooltip`, `utils/Overlay`, an empty
`forms/MarkdownInput/CollaborativeMarkdownInput.tsx` stub, and a stale
`markdown/html/Converter.test_.ts`. CRD dead set — never-wired demo/scaffold
components (`DashboardSpaces` + its `SpaceHierarchyCard`, `ReleaseNotesBanner`,
`ContributionPreview`/`ContributionCreateButton`, `SaveAsTemplateDialog`,
`SetDefaultTemplateDialog`, `WhiteboardTemplateForm`, `SpaceSettingsShell`,
`DeleteFramingDialog`, `ContentBlock`, `ExpandableDescription`,
`ContributionFormLayout`). `dev/ui/plansTable/*` (dev-only) and the
`domain/license` plans-table UI + its `getPlanTranslations.ts` (only consumer was
the dead `PlansTableDialog`), and `domain/community` `OrganizationVerifiedStatus`.

**Validation gate (all green):** `pnpm lint` exit 0 (348 pre-existing biome
warnings, no errors), `pnpm vitest run` **164 files / 1468 tests passing**,
`pnpm build` exit 0 (20283 modules transformed). No co-located test/snapshot/style
siblings existed for any deleted file (none to remove). Emptied directories
(`pageBanner`, `pageBannerCard`, `plansTable`, `SettingsGroups/{services,types,components}`)
were pruned.

**Kept despite looking dead (conservative holds):** files that the app entry does
not reach but a **live test** still imports are NOT dead — deleting them would
break that test. The reference app-entry-only trace flags 29 such MUI files; the
test-aware trace narrows the truly-orphaned set to 27 because the difference is
held alive by `*.spec`/`*.test` roots. Two `*.spec`/`*.test` files that themselves
contain `@mui` imports (`guestContributionsWarningBadge.spec.tsx`,
`crdContributorSettingsRoutes.test.ts`) are live test roots, not orphaned
components, and were left untouched. Type-only-reachable live code (per the story
constraint) was not touched in this increment.
