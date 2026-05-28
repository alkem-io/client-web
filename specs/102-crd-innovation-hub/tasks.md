---

description: "Tasks for CRD Innovation Hub & Innovation Hub Settings migration"
---

# Tasks: CRD Innovation Hub & Innovation Hub Settings

**Input**: Design documents from `/specs/102-crd-innovation-hub/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Included for the three test surfaces named in plan.md (per-section save reducer, privilege guard, data mappers). All other test coverage is via the existing `pnpm vitest run` baseline + manual verification per `quickstart.md`. The CRD migration playbook does not require TDD — these tests verify behaviour, they do not drive design.

**Organization**: Tasks are grouped by user story (US1: Hub home / US2: Settings About / US3: Settings Spaces / US4: Toggle coexistence — folded into route wiring and polish) to enable independent implementation and verification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3); polish/setup tasks have no story label
- Paths are absolute from repo root

## Path Conventions

Single-project SPA. CRD presentational components: `src/crd/components/innovationHub/*`. Integration layer: `src/main/crdPages/innovationHub/*`. i18n: `src/crd/i18n/innovationHub/*`. Route dispatch: `src/main/routing/TopLevelRoutes.tsx` + `src/main/topLevelPages/Home/CrdHomePage.tsx` (modified in place).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the new directory tree, register the i18n namespace, scaffold the empty CRD route surface.

- [ ] T001 Create new directories `src/crd/components/innovationHub/`, `src/crd/i18n/innovationHub/`, `src/main/crdPages/innovationHub/`, `src/main/crdPages/innovationHub/routing/`, `src/main/crdPages/innovationHub/hooks/`, `src/main/crdPages/innovationHub/dataMappers/`, `src/main/crdPages/innovationHub/dialogs/`, `src/main/crdPages/innovationHub/__tests__/`
- [ ] T002 [P] Create skeleton i18n files `src/crd/i18n/innovationHub/innovationHub.{en,nl,es,bg,de,fr}.json` — start with `{}` placeholders for the section namespaces (`home`, `settings`); per-story tasks populate keys
- [ ] T003 Register `'crd-innovationHub'` namespace in `src/core/i18n/config.ts` — add a lazy import entry to the `crdNamespaceImports` registry for all 6 supported languages (en, nl, es, bg, de, fr)
- [ ] T004 Register the `'crd-innovationHub'` namespace + key types in `@types/i18next.d.ts` so `useTranslation('crd-innovationHub')` is type-checked
- [ ] T004a Update `src/domain/innovationHub/useInnovationHub/InnovationHub.graphql` — add `spaceListFilter { id }` to the `InnovationHubHomeInnovationHub` fragment. Run `pnpm codegen` (backend at `localhost:3000/graphql` required) and commit the regenerated `src/core/apollo/generated/*` files. This unblocks T008 / T013 (US1) which intersect the id list with `DashboardSpaces`. **Note**: this edit has already been applied to the `.graphql` file by `/speckit.analyze` remediation; this task is the codegen + commit step.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire the empty CRD route surface so the per-story tasks can mount their pages. Update `TopLevelRoutes.tsx` and `CrdHomePage.tsx` to dispatch through the toggle.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 Create `src/main/crdPages/innovationHub/routing/CrdHubRoute.tsx` with a placeholder `<Routes>` that renders `<div />` for `/:nameID`, `/:nameID/settings`, `/:nameID/settings/about`, `/:nameID/settings/spaces`, and `<Error404 />` for any unmatched path. Wrap in `<StorageConfigContextProvider locationType="platform">` matching the legacy `HubRoute.tsx`. Per-story tasks will fill the route elements.
- [ ] T006 Update `src/main/routing/TopLevelRoutes.tsx` — add a lazy import `const CrdHubRoute = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/innovationHub/routing/CrdHubRoute'));` next to the existing `HubRoute` import (line 61 area).
- [ ] T007 Update `src/main/routing/TopLevelRoutes.tsx` — gate the `${TopLevelRoutePath.Hub}/*` route block (lines ~317–326) on `crdEnabled`: render `<CrdHubRoute />` inside `<CrdLayoutWrapper />` when true, render the legacy `<HubRoute />` otherwise. Mirror the existing dispatch pattern used by `/spaces` (`CrdSpaceExplorerPage` vs `MuiSpaceExplorerPage`).

**Checkpoint**: `pnpm start`, set `designVersion=2`, visit `/hub/<slug>` — the empty CRD route surface should render (no errors); set `designVersion=1` and the legacy `HubRoute` still resolves.

---

## Phase 3: User Story 1 — Hub home page renders on subdomain + path (Priority: P1) 🎯 MVP

**Goal**: Visitor lands on a hub's subdomain root (or `/hub/<slug>`) and sees the CRD hub home — banner, name, tagline, description, Spaces grid, "Browse all Spaces" CTA — inside the CRD shell.

**Independent Test**: Per `quickstart.md` § US1. With `designVersion=2`, visiting `localhost:3001/?subdomain=<existing-hub-subdomain>` AND `localhost:3001/hub/<existing-hub-slug>` both render the CRD home page with all visual elements; admin users see the settings gear. Flip to `designVersion=1` and the legacy MUI hub home renders, unchanged.

### Data layer for US1

- [ ] T008 [P] [US1] Create `src/main/crdPages/innovationHub/dataMappers/mapInnovationHubToHomeData.ts` — pure function: GraphQL `InnovationHubHomeInnovationHubFragment` (now including `spaceListFilter { id }` per T004a) + `DashboardSpacesQuery` result + auth state + canonical domain → `InnovationHubHomeData`. **Spaces grid is built by intersecting `hub.spaceListFilter.map(s => s.id)` with `dashboardSpaces`, then sorting by the `spaceListFilter` order — NOT the full dashboardSpaces list.** Compute `pickColorFromId(hub.id)` for `bannerColor`. Build `settingsUrl` via `buildSettingsUrl(\`/hub/${hub.nameID}\`)` only when `authorization.myPrivileges` includes `Update`. Build `allSpacesUrl` as `//${config.locations.domain}/spaces`.
- [ ] T009 [P] [US1] Create `src/main/crdPages/innovationHub/dataMappers/spaceCardDataMapper.ts` — reuse the existing space-card mapping pattern from `src/main/crdPages/spaces/spaceCardDataMapper.ts`; alias or re-export it for hub-home consumption (NO duplication — import the shared mapper if present, otherwise extract a shared helper).
- [ ] T010 [P] [US1] Add `src/main/crdPages/innovationHub/__tests__/mapInnovationHubToHomeData.test.ts` — covers: present/absent banner, admin vs non-admin privilege → settings URL present/absent, ordered Spaces, empty Spaces array, all-spaces URL composition.

### CRD presentational layer for US1

- [ ] T011 [P] [US1] Create `src/crd/components/innovationHub/InnovationHubBanner.tsx` — full-width banner block with `-mt-16` offset (variant `'page'`) and a compact variant for future reuse. Renders `<img>` when `imageUrl` is set; otherwise renders a 135° gradient from `color → color-mix(in srgb, color 70%, black)` via `backgroundGradient()` from `@/crd/lib/backgroundGradient`. Zero MUI imports.
- [ ] T012 [US1] Create `src/crd/components/innovationHub/InnovationHubHome.tsx` — full page composition: `InnovationHubBanner` + info bar (`<h1 className="text-hero">` + italic tagline + optional settings gear `<a>`) + description block rendered through `MarkdownContent` + Spaces grid (`<ul role="list">` of `SpaceCard` from `@/crd/components/space/SpaceCard`) + footer CTA (`<a href={data.allSpacesUrl}>`). Uses `useTranslation('crd-innovationHub')` for chrome strings. All event handlers as props.

### Integration layer for US1

- [ ] T013 [US1] Create `src/main/crdPages/innovationHub/hooks/useInnovationHubHomeData.ts` — accepts a discriminator `{ kind: 'byId'; id: string } | { kind: 'bySubdomain' }`. Branches:
  - `byId`: calls `useInnovationHubByIdQuery({ variables: { id } })` directly (so the path-based `/hub/<slug>` route doesn't go through `useInnovationHub` / subdomain logic).
  - `bySubdomain`: returns the already-resolved hub from the caller's `useInnovationHub()` to avoid double-fetching.
  Also calls `useDashboardSpacesQuery()` (for the **rich Space-card shape only**), `useConfig()`, and `useCurrentUserContext()`. The mapper intersects `hub.spaceListFilter` (id list — sourced from the extended home-page fragment per T004a) with `dashboardSpaces`, sorting by the hub's `spaceListFilter` order. Runs the result through `mapInnovationHubToHomeData`.
- [ ] T014 [US1] Create `src/main/crdPages/innovationHub/CrdInnovationHubHomePage.tsx` — accepts an optional `innovationHubFromSubdomain?: InnovationHubHomeInnovationHubFragment` prop (passed by the `CrdHomePage` dispatcher) OR resolves via `useUrlResolver()` on the `/hub/<slug>` route. Calls `useInnovationHubHomeData(...)`, shows `<Loading />` while pending, renders `<InnovationHubHome data={...} />` otherwise.
- [ ] T015 [US1] Update `src/main/crdPages/innovationHub/routing/CrdHubRoute.tsx` — replace the placeholder for `/:nameID` with `<CrdInnovationHubHomePage />` (lazy-imported via `lazyWithGlobalErrorHandler`).

### Route dispatch fix for US1 (the FR-027 latent bug)

- [ ] T016 [US1] Update `src/main/topLevelPages/Home/CrdHomePage.tsx` — replace the unconditional fallback to the legacy `InnovationHubHomePage` with a conditional: when `innovationHub` is resolved AND `useCrdEnabled()` returns true, render the new `CrdInnovationHubHomePage` (passing the resolved hub as a prop OR letting the page re-resolve via cache). When `useCrdEnabled()` is false, keep the current legacy render. Add a lazy import for the new page.

### i18n for US1

- [ ] T017 [P] [US1] Add keys under `home.*` to all 6 language files: `home.spacesSection.title` (e.g. "{{hubName}} Spaces"), `home.spacesSection.empty`, `home.allSpacesCta`, `home.settingsAria`. Dutch translation MUST keep "Spaces" in English (do-not-translate glossary).

### Verification for US1

- [ ] T018 [US1] Manual verification per `quickstart.md` § "Verifying User Story 1" — both subdomain entry AND path entry render the CRD hub home; admin sees the gear; reload with `designVersion=1` confirms the legacy chunk loads and the CRD chunk does not.

**Checkpoint**: US1 is complete and independently testable. Hub home renders in CRD; subdomain dispatch bug fixed; toggle behaviour verified.

---

## Phase 4: User Story 2 — Settings About tab (Priority: P1)

**Goal**: Hub admin lands on `/hub/<slug>/settings`, sees the sticky tabbed header (About tab active by default), can edit each profile section independently with inline save indicators. Non-admins are redirected away.

**Independent Test**: Per `quickstart.md` § US2. Sign in as admin, open the settings URL, verify the sticky header (thumbnail per Q1 — banner OR gradient+initials), edit each of the 6 sections (subdomain, name, tagline, description, tags, banner), verify per-section save semantics (idle → saving → saved → idle), no cross-section flicker. Sign out / sign in as non-admin, open the same URL, verify redirect to `/hub/<slug>`.

### Data layer for US2

- [ ] T019 [P] [US2] Create `src/main/crdPages/innovationHub/dataMappers/mapInnovationHubToSettingsHeader.ts` — maps `InnovationHubSettings` fragment to `HubSettingsHeaderData`. Computes `thumbnailColor = pickColorFromId(hub.id)`, `initials` (shared helper — extract `computeInitials(displayName)` to `src/main/crdPages/innovationHub/dataMappers/computeInitials.ts` if not already present), and `viewHubUrl = buildInnovationHubUrl(hub.subdomain)`.
- [ ] T020 [P] [US2] Create `src/main/crdPages/innovationHub/dataMappers/mapInnovationHubToAboutValues.ts` — maps `InnovationHubSettings` fragment to `HubAboutFormValues`. Pulls subdomain, profile.displayName, profile.tagline, profile.description, profile.tagset.tags, profile.visual?.uri.
- [ ] T021 [P] [US2] Add `src/main/crdPages/innovationHub/__tests__/settingsMappers.test.ts` covering `mapInnovationHubToSettingsHeader`, `mapInnovationHubToAboutValues`, `computeInitials`. Test: banner present/absent, empty tagline, empty tags, multi-word display name initials.

### CRD presentational layer for US2

- [ ] T022 [P] [US2] Create `src/crd/components/innovationHub/HubSettingsHeaderThumbnail.tsx` — uses CRD `Avatar` + `AvatarImage` + `AvatarFallback`. `AvatarImage` only when `imageUrl` is set; `AvatarFallback` accepts the `color` prop and renders the gradient internally with `initials` text in `text-white` over it.
- [ ] T023 [P] [US2] Create `src/crd/components/innovationHub/InlineSectionSave.tsx` — renders nothing when clean; renders `<Button>` "Save" when dirty + idle; renders inline `Loader2`-spinner "Saving…" with `aria-live="polite"` during saving; renders check-icon "Saved" with `aria-live="polite"` on saved; renders `<p role="alert" className="text-caption text-destructive">{error}</p>` when `error` is set. Uses Tailwind `animate-in fade-in slide-in-from-left-1 duration-200` per the prototype.
- [ ] T024 [US2] Create `src/crd/components/innovationHub/InnovationHubSettingsShell.tsx` — sticky `<header>` with `HubSettingsHeaderThumbnail` + `<h1 className="text-page-title">` + tagline + `<a href={header.viewHubUrl}>` (eye icon, `aria-label`); tab strip built from CRD `Tabs.Root` + `Tabs.List` + two `<Link>`-style triggers rendered as `<a>` (so the URL updates on click without programmatic navigation); body slot for `{children}`.
- [ ] T025 [US2] Create `src/crd/components/innovationHub/InnovationHubAboutTab.tsx` — six sections (subdomain, name, tagline, description, tags, banner) with `<Separator />` between. Subdomain/name/tagline use `<Input>` + `<EditPencil />` adornment. Description uses `MarkdownEditor` from `@/crd/forms/markdown/MarkdownEditor`. Tags uses `TagsInput` from `@/crd/forms/tags-input`. Banner uses a hover-reveal "Change Banner" button over the preview image (the file input is hidden; the integration's `onBannerFileSelected` handler is wired through it). Each section embeds an `InlineSectionSave`.

### Integration layer for US2

- [ ] T026 [P] [US2] Create `src/main/crdPages/innovationHub/hooks/useInnovationHubSettingsData.ts` — wraps `useInnovationHubSettingsQuery` keyed by `useUrlResolver().innovationHubId`. Returns `{ hub, loading, refetch }`.
- [ ] T027 [P] [US2] Create `src/main/crdPages/innovationHub/hooks/useHubAccessGuard.ts` — reads the hub's `authorization.myPrivileges` (from the home fragment in Apollo cache, since the settings fragment doesn't include it; falls back to `useInnovationHubByIdQuery` for cache priming). Returns `{ allowed: true } | { allowed: false; redirectTo: string }`. The `redirectTo` is `buildInnovationHubUrl(hub.subdomain)` or the hub's `profile.url`, whichever resolves first.
- [ ] T028 [P] [US2] Add `src/main/crdPages/innovationHub/__tests__/useHubAccessGuard.test.ts` — verifies: privilege present → `{ allowed: true }`; privilege missing → `{ allowed: false, redirectTo: <hub-home> }`; hub still loading → `{ allowed: true }` (or a `loading` flag — match implementation choice).
- [ ] T028a [P] [US2] Create `src/main/crdPages/innovationHub/hooks/hubAboutValidators.ts` — port the four legacy validators to plain TypeScript functions returning `string | undefined` (i18n key for the error message, or `undefined` if valid):
  - `validateSubdomain(value: string)` — matches the legacy `subdomainValidator` regex (lowercase alphanumeric + hyphens, length bounds).
  - `validateDisplayName(value: string)` — required, length bounds matching `displayNameValidator({ required: true })`.
  - `validateDescription(value: string)` — required, length ≤ `MARKDOWN_TEXT_LENGTH` (import the constant from `@/core/ui/forms/field-length.constants`).
  - `validateTagline(value: string)` — length ≤ `MID_TEXT_LENGTH`.
  - `validateTags(values: string[])` — pass-through for now (legacy `tagsetsSegmentSchema` is permissive); export a stub for future tightening.
  Error message strings are i18n keys (e.g. `'settings.about.subdomain.errors.invalidFormat'`), resolved at render time in T025 via `t(errorKey)`. No Formik, no yup, no react-hook-form.
- [ ] T029 [US2] Create `src/main/crdPages/innovationHub/hooks/useHubAboutTabData.ts` — the per-section save state machine. Owns: `values` (local state seeded from `saved` via `useEffect`), `valuesRef`, `saveStatusByField`, `dirtyByField`, `errorsByField`, `savedFlashTimers`, `useTransition`. Exposes `onChange(patch)`, `onSaveSection(key)`, `onBannerFileSelected(file)`. **On `onSaveSection(key)`, run the corresponding validator from T028a; if it returns an error, set `errorsByField[key]` and bail out (no mutation fired, status stays `idle`). On valid input, clear the error, call `useUpdateInnovationHubMutation` with only that section's fields, transition idle → saving → saved → idle.** Banner upload calls `useUploadVisualMutation` against `profile.visual.id`. Mirror the pattern of `src/main/crdPages/topLevelPages/spaceSettings/about/useAboutTabData.ts`.
- [ ] T030 [P] [US2] Add `src/main/crdPages/innovationHub/__tests__/useHubAboutTabData.test.ts` — covers: dirty detection per section (subdomain, name, tagline, tags, description); **client-side validation blocks the mutation when invalid (invalid subdomain regex, empty displayName, description over `MARKDOWN_TEXT_LENGTH`, tagline over `MID_TEXT_LENGTH`) and the error appears in `errorsByField`**; `onSaveSection` triggers mutation with the right subset of fields **when valid**; status transitions idle → saving → saved → idle; mutation failure → error surfaced and status returns to idle; banner-file-selected triggers upload mutation.
- [ ] T030a [P] [US2] Add `src/main/crdPages/innovationHub/__tests__/hubAboutValidators.test.ts` — table-driven cases per validator covering boundary values and rejection messages (invalid subdomain characters, subdomain too long/short, empty displayName, displayName too long, description over `MARKDOWN_TEXT_LENGTH`, description empty, tagline over `MID_TEXT_LENGTH`).
- [ ] T031 [US2] Create `src/main/crdPages/innovationHub/CrdInnovationHubSettingsPage.tsx` — page entry. Runs `useHubAccessGuard()`; on `!allowed`, returns `<Navigate to={redirectTo} replace />`. Otherwise: `useInnovationHubSettingsData`, `useHubAboutTabData`, maps to shell props, renders `<InnovationHubSettingsShell header={...} activeTab={tab} tabHrefs={...}>` with the active tab's content (`<InnovationHubAboutTab>` for `about`, `<InnovationHubSpacesTab>` for `spaces` — wired in US3).

### Route wiring for US2

- [ ] T032 [US2] Update `src/main/crdPages/innovationHub/routing/CrdHubRoute.tsx` — replace settings placeholders: route `/:nameID/settings` redirects (`<Navigate replace />`) to `.../settings/about`; route `/:nameID/settings/about` renders `<CrdInnovationHubSettingsPage tab="about" />` (lazy-imported).
- [ ] T033 [US2] In `src/crd/components/innovationHub/InnovationHubHome.tsx` (created in US1), confirm the `settingsUrl` link target uses the canonical settings URL (`buildSettingsUrl(\`/hub/${nameID}\`)` from the mapper). No code change here if T008 set this correctly — this task is a verification step that the link survives.

### i18n for US2

- [ ] T034 [P] [US2] Add keys under `settings.*` to all 6 language files: `settings.tabs.about`, `settings.tabs.spaces`, `settings.header.viewHubAria`, `settings.guard.redirecting`, `settings.about.subdomain.{label,placeholder,errors.invalidFormat,errors.tooLong}`, `settings.about.name.{label,placeholder,errors.required,errors.tooLong}`, `settings.about.tagline.{label,placeholder,errors.tooLong}`, `settings.about.description.{label,errors.required,errors.tooLong}`, `settings.about.tags.{label,placeholder,emptyHelp}`, `settings.about.banner.{label,change,uploading,helperText,errors.uploadFailed}`, `settings.about.save.{save,saving,saved,errorPrefix}`. Dutch glossary: "Layout", "template", "Space" stay in English in any combined strings.

### Verification for US2

- [ ] T035 [US2] Manual verification per `quickstart.md` § US2: per-section save UX, banner upload, validation errors, privilege-guard redirect. Verify Cancel from the user menu / browser back works.

**Checkpoint**: US2 complete. About tab fully functional with per-section save; privilege guard redirects non-admins; settings shell is reusable for US3.

---

## Phase 5: User Story 3 — Settings Spaces tab (Priority: P1)

**Goal**: Hub admin opens the Spaces tab, sees the current curated list as a table with drag-reorder, can add (via the existing "Add Space by URL" flow), can remove (with `ConfirmationDialog`), each action auto-saves.

**Independent Test**: Per `quickstart.md` § US3. Drag a row, reload — order persists. Click Add → CRD AddSpaceByUrl dialog opens → submit a valid Space URL → row appears → reload persists. Click Remove → ConfirmationDialog → confirm → row gone → reload persists. Empty the list → empty state renders.

### Data layer for US3

- [ ] T036 [P] [US3] Create `src/main/crdPages/innovationHub/dataMappers/mapInnovationHubSpaceToTableRow.ts` — maps `InnovationHubSpaceFragment` + i18n `t(...)` to `HubSpacesTableRow`. Normalises `space.visibility` to the `SpaceVisibilityVariant` union (`'active' | 'demo' | 'archived' | 'unknown'`). Pulls `hostAccount` from `space.about.provider?.profile?.displayName ?? '—'`.
- [ ] T037 [P] [US3] Add `src/main/crdPages/innovationHub/__tests__/spacesMapper.test.ts` covering visibility normalisation (all enum values), absent provider, empty display name.

### CRD presentational layer for US3

- [ ] T038 [P] [US3] Create `src/crd/components/innovationHub/InnovationHubSpacesTab.tsx` — header row (title + subtitle + Add button), `<DndContext>` + `<SortableContext>` wrapping the table; sensor setup matches the legacy `InnovationHubSpacesField` (`PointerSensor` with `distance: 5`, `KeyboardSensor` with `sortableKeyboardCoordinates`). Rows render via CRD `<Table>` primitive; each row exposes a drag handle, name, visibility badge, host account, and a remove icon button. Empty state when `rows.length === 0`. The remove icon calls `onRemoveRequest(row)` — the dialog is mounted by the integration layer.

### Integration layer for US3

- [ ] T039 [US3] Create `src/main/crdPages/innovationHub/hooks/useHubSpacesTabData.ts` — wraps `useUpdateInnovationHubMutation` and exposes `add(spaceId)`, `remove(spaceId)`, `reorder(orderedIds)`. Each writes `spaceListFilter` with the optimistic-response shape from the legacy implementation. Surfaces a `busy` boolean (loading from the mutation tuple). Triggers a `refetch()` on success to reconcile visibility/host-account metadata. Surfaces `sonner` toasts (`@/crd/primitives/sonner`) for success/failure.
- [ ] T040 [US3] Create `src/main/crdPages/innovationHub/dialogs/CrdAddSpaceByUrlDialog.tsx` — CRD port of the legacy `AddSpaceByUrlDialog`. Uses CRD `Dialog` + `DialogContent` + `Input` + `Button` primitives. Reuses the headless `useResolveSpaceUrl` domain hook from `src/domain/innovationHub/InnovationHubsSettings/useResolveSpaceUrl.ts` (verified to be headless — no MUI imports inside). Props: `{ open, onClose, onAdd: (spaceId: string) => Promise<void>, existingSpaceIds: string[] }`. Discriminated status union: `idle | validating | invalid | duplicate`. Inline error message below the input.
- [ ] T041 [US3] Wire the Spaces tab into `CrdInnovationHubSettingsPage.tsx`: when `tab === 'spaces'`, render `<InnovationHubSpacesTab rows={...} busy={...} onReorder={...} onAddClick={...} onRemoveRequest={...} />`. Mount `<CrdAddSpaceByUrlDialog>` and `<ConfirmationDialog>` from `@/crd/components/dialogs/ConfirmationDialog` for the remove confirm flow (using the `pendingDeleteId` pattern per the CRD "all deletions must be confirmed" rule).

### Route wiring for US3

- [ ] T042 [US3] Update `src/main/crdPages/innovationHub/routing/CrdHubRoute.tsx` — replace the placeholder for `/:nameID/settings/spaces` with `<CrdInnovationHubSettingsPage tab="spaces" />`.

### i18n for US3

- [ ] T043 [P] [US3] Add keys under `settings.spaces.*` to all 6 language files: `settings.spaces.title`, `settings.spaces.subtitle`, `settings.spaces.columns.{name,visibility,host,actions}`, `settings.spaces.visibility.{active,demo,archived,unknown}`, `settings.spaces.actions.{add,remove}`, `settings.spaces.removeAria`, `settings.spaces.dragHandle`, `settings.spaces.empty`, `settings.spaces.confirmRemove.{title,body,confirm,cancel}`, `settings.spaces.toast.{added,removed,reordered,error}`, `settings.spaces.addDialog.{title,description,placeholder,submit,cancel,validating,invalid,duplicate}`. Dutch glossary: "Space"/"Spaces" stay in English.

### Verification for US3

- [ ] T044 [US3] Manual verification per `quickstart.md` § US3: drag-reorder (mouse + keyboard), add via URL, remove with confirmation, empty state, toast feedback.

**Checkpoint**: US3 complete. Settings page fully functional with both tabs.

---

## Phase 6: Polish & Cross-Cutting Concerns (US4 verification + cleanup)

**Purpose**: Verify both designs coexist per US4. Run all gates. Catch any cross-cutting regressions (a11y, bundle size, Dutch glossary, lazy-loading).

- [ ] T045 [P] Verify `designVersion=1` legacy paths: visit `/hub/<slug>`, `/hub/<slug>/settings`, and the subdomain entry — each renders the legacy MUI page unchanged. Confirm via DevTools Network that CRD chunks (`CrdInnovationHubHomePage`, `CrdInnovationHubSettingsPage`, `CrdHubRoute`) are NOT fetched on `designVersion=1`.
- [ ] T046 [P] Verify `designVersion=2` lazy-loading: visit each of `/hub/<slug>`, `/hub/<slug>/settings/about`, `/hub/<slug>/settings/spaces`. Confirm via DevTools Network that the legacy `InnovationHubHomePage` and `InnovationHubSettingsPage` chunks are NOT fetched.
- [ ] T046a [P] Lighthouse / web-vitals verification of SC-003: run Lighthouse on `localhost:3001/hub/<existing-slug>` with `designVersion=2`, throttled to "Fast 3G" + 4× CPU slowdown. Record FCP, LCP, TBT, CLS. Pass criterion: **LCP ≤ 2.5s** for the banner image, **FCP ≤ 1.8s** for the info-bar text, **CLS ≤ 0.1**. Capture the report in the PR description per constitution §V.
- [ ] T047 [P] Run `pnpm lint` — must pass with zero new warnings or errors. CRD components are checked for forbidden imports (`@mui/*`, `@emotion/*`, `@/core/apollo/*`, `@/domain/*`, `react-router-dom`, `formik`).
- [ ] T048 [P] Run `pnpm vitest run` — full suite passes (baseline 57 files / 595 tests + the new tests from T010, T021, T028, T030, T037).
- [ ] T049 [P] Run `pnpm codegen` — must produce no diff **beyond the `spaceListFilter { id }` addition introduced in T004a**. No other schema changes are expected.
- [ ] T050 [P] Run `pnpm analyze` and confirm the new `src/main/crdPages/innovationHub/` chunk does NOT contain any `@mui/*` or `@emotion/*` node_modules.
- [ ] T051 [P] Accessibility sweep per `src/crd/CLAUDE.md` § Accessibility: every icon button has `aria-label`; decorative icons are `aria-hidden`; `<ul role="list">` for the Spaces grid; semantic `<table>` for the Spaces tab; focus-visible rings on every interactive element; the inline save indicator announces via `aria-live="polite"`; the privilege-guard redirect has an `sr-only` announcement; keyboard drag-reorder works via Space + arrow keys.
- [ ] T052 [P] Dutch glossary verification on `src/crd/i18n/innovationHub/innovationHub.nl.json` — "Space", "Spaces", "Subspace", "Post", "template", "Layout", "Virtual Contributor" remain in English in every key that combines them with Dutch words. The surrounding sentence is translated and inflected around them. Cross-reference `specs/101-translation-glossary/glossary.md`.
- [ ] T053 [P] Verify i18n completeness — every key in `innovationHub.en.json` has a matching key in nl, es, bg, de, fr. No missing keys, no extra orphan keys.
- [ ] T054 Update `prototype/` references in the spec/plan if any prototype tweaks were made during implementation — typically no-op since `prototype/` is read-only, but confirm no implementation file accidentally imports from `prototype/`.
- [ ] T055 Visual fidelity check against the prototype: open `localhost:5173/innovation-hub/vng-innovation-hub/` (prototype) side-by-side with `localhost:3001/hub/<existing-slug>` (CRD). Spot differences in: banner offset, info-bar typography, description card padding, Spaces grid gaps, CTA placement. Same for `/settings/about` and `/settings/spaces`.

---

## Dependencies & Execution Order

**Phase order**: Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6.

**Cross-phase blocks**:
- Phase 2 (foundational route surface) blocks all per-story work.
- Within each story, the parallel-eligible data-layer + CRD-presentational tasks can run together; integration-layer tasks generally come after both.
- The shared `pickColorFromId` and `computeInitials` helpers used by US1 mapper (T008) and US2 mapper (T019) are independent (T008 only needs `pickColorFromId` which already exists; T019 needs `computeInitials` which T019 itself creates).

**Within US2**:
- T024 (`InnovationHubSettingsShell`) depends on T022 (`HubSettingsHeaderThumbnail`).
- T025 (`InnovationHubAboutTab`) depends on T023 (`InlineSectionSave`).
- T031 (page entry) depends on T024, T025, T029 (`useHubAboutTabData`), and T027 (`useHubAccessGuard`).
- T032 (route wiring) depends on T031.

**Within US3**:
- T041 (page integration) depends on T038 (`InnovationHubSpacesTab`), T039 (`useHubSpacesTabData`), T040 (CRD `AddSpaceByUrlDialog`), AND T025/T024/T031 from US2 (the settings shell + page entry).
- T042 (route wiring) depends on T041.

**US3 depends on US2** — the Spaces tab is mounted inside the settings page/shell that US2 builds. **US1 is independent** from US2 and US3 and is the natural MVP slice.

---

## Parallel Execution Examples

### Setup phase (T002–T004)

After T001 (directory creation), the following can run in parallel:
- T002 (skeleton i18n files — different files)
- T003 (config.ts namespace registration — single file)
- T004 (i18next types — different file)

T002, T003, T004 each touch different files → all `[P]`.

### US1 data + presentational (T008–T012)

T008, T009, T010, T011 are `[P]` because they touch different files. T012 (`InnovationHubHome.tsx`) depends on T011 (`InnovationHubBanner.tsx`) being importable.

```text
T008 ─┐
T009 ─┼─ parallel
T010 ─┤
T011 ─┘
       └→ T012 → T013 → T014 → T015 → T016 → T018
                  T017 (i18n, [P]) can run anywhere after T002
```

### US2 mappers + presentational atoms (T019–T023)

```text
T019 ─┐
T020 ─┼─ parallel (different files)
T021 ─┤
T022 ─┤
T023 ─┘
       └→ T024 (depends on T022)
       └→ T025 (depends on T023)
                  └→ T026 / T027 / T028 [P]
                          └→ T029 → T030 → T031 → T032 → T035
                                                  T034 (i18n, [P])
```

### US3 mappers + presentational (T036–T040)

```text
T036 ─┐
T037 ─┼─ parallel
T038 ─┤
T039 ─┤   ← can start in parallel; uses CRD primitives only via T038
T040 ─┘   ← parallel with T038/T039
       └→ T041 → T042 → T044
                 T043 (i18n, [P])
```

### Polish phase (T045–T055)

All polish tasks except T054, T055 are `[P]` — they verify different surfaces of the running app and can be done in any order.

---

## Implementation Strategy

### MVP — Ship US1 first

**Slice**: Phase 1 + Phase 2 + Phase 3 (US1) + minimal Phase 6 verification.

- Lands the public-facing CRD hub home on both subdomain and path entry points.
- Fixes the latent `CrdHomePage` dispatcher bug (FR-027) — visible quality win.
- Bundles legacy MUI hub home stays intact for `designVersion=1` users.
- Settings page still bounces to legacy MUI when admins click the gear — acceptable for an MVP.

**Acceptance**: `quickstart.md` § US1 verification passes; `pnpm lint` and `pnpm vitest run` are green.

### Incremental delivery

After US1 ships:
1. **US2** — admins on `designVersion=2` who click the gear now see the CRD About tab. The Spaces tab placeholder shows "coming soon" or, more simply, deep-links to the legacy `/hub/<slug>/settings` URL (this would mean the gear icon on the CRD home links to the legacy settings, briefly — that's an acceptable transitional state).
2. **US3** — the Spaces tab lights up. End-to-end CRD parity with the legacy settings is reached.
3. **Polish** — Dutch glossary, bundle analysis, full a11y sweep.

### Out of scope for this feature (deferred)

- Migration of the platform-admin Innovation Hubs entry point (`/innovation-hubs/<slug>/settings`) — still MUI.
- Migration of the Create Innovation Hub flow — still MUI.
- Toggle retirement / legacy file deletion — will follow when the broader CRD migration is complete.
- Prototype-only tabs ("Settings", "Account" placeholders) — not in scope.

---

## Format Validation

All 59 tasks follow the strict checklist format `- [ ] T### [P?] [Story?] Description with file path`:

- Checkbox `- [ ]` on every task ✓
- Sequential / suffixed task IDs T001–T055 + T004a, T028a, T030a, T046a (4 tasks added during `/speckit.analyze` remediation) ✓
- `[P]` markers only on tasks touching different files with no dependency on incomplete tasks ✓
- `[USn]` labels on all per-story tasks (T008–T018, T019–T035 + T028a + T030a, T036–T044) ✓
- No `[USn]` labels on Setup (T001–T004 + T004a), Foundational (T005–T007), or Polish (T045–T055 + T046a) ✓
- Every task names a concrete file path or a concrete verification step ✓

**Total tasks**: 59
**Tasks per story**: US1 = 11 (T008–T018), US2 = 19 (T019–T035 + T028a + T030a), US3 = 9 (T036–T044), Setup = 5 (T001–T004 + T004a), Foundational = 3 (T005–T007), Polish = 12 (T045–T055 + T046a).

**MVP scope**: T001–T004a + T005–T007 + T008–T018 (Setup + Foundational + US1) = 19 tasks. The fragment-extension codegen step (T004a) is foundational for US1 because T008/T013 read `hub.spaceListFilter`.
