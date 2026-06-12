# Tasks: CRD Create Space Dialog

**Input**: Design documents from `/specs/105-create-space-dialog/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: The spec does not request TDD. Per the established CRD pattern, only a **pure-logic unit test** is included (slug derivation/lock + validation + `canSubmit`/`noPlanAvailable`), mirroring the subspace `resizeImageToConstraints.test.ts`. No broad test scaffolding.

**Organization**: Tasks are grouped by user story in spec priority order: US1(P1) → US2(P1) → US3(P2) → US4(P2) → US5(P3). The feature is one dialog + one integration hook + one connector reused by two account tabs, so US2/US4 edit the same hook/component US1 creates — a **sequential** dependency (noted per task), not parallel-team work. US3 and US5 are independent.

## Path & layer conventions (all stories)

- **Layer 3 (pure presentational)**: `src/crd/components/space/CreateSpaceDialog.tsx` — no `@mui/*`, `@emotion/*`, `@apollo/client`, `@/domain/*`, `react-router-dom`, `formik`; plain-TS props (`contracts/createSpaceDialog.ts`); `lucide-react` icons; `cn()` + Tailwind + semantic typography tokens; `useTranslation('crd-createSpace')`; sticky header/footer; `useDialogCloseGuard`.
- **Layer 2 (integration)**: `src/main/crdPages/topLevelPages/createSpace/**` — Apollo/domain hooks + mapping; no `@mui/*`/`@emotion/*`. Contract: `contracts/useCreateSpace.ts`.
- **Entry points**: `src/main/crdPages/topLevelPages/{userPages,organizationPages}/settings/account/Crd{User,Org}AccountTab.tsx` — the only wiring edits.
- **Model**: clone `src/crd/components/space/settings/CreateSubspaceDialog.tsx` (same field layout incl. markdown description) → swap Avatar for **Page Banner**, add the **URL slug** field, the **Add Tutorials** + **Accept Terms** checkboxes (terms dialog), and the **no-plan** message.
- **Reused unchanged**: `useSpaceCreation`, `useSpacePlans`/`usePlanAvailability`, `addSpaceWelcomeCache` (`src/domain/space/components/CreateSpace/**`); `useTemplatePicker`, `TemplateContentPreview` (`src/.../templates`); `resizeImageToConstraints` (`src/main/crdPages/topLevelPages/spaceSettings/subspaces/`); `MarkdownEditor` + `useMarkdownEditorIntegration` (`src/main/crdPages/markdown/`); `StorageConfigContextProvider` (`src/domain/storage/StorageBucket/StorageConfigContext`); `useDialogCloseGuard`, `TagsInput`, primitives (`src/crd/**`).
- **No new runtime deps. No `pnpm codegen`** (no `.graphql` changes). React Compiler on (no manual memoization). "Space" stays English (glossary). All 6 languages (en, es, nl, bg, de, fr) edited in this PR.

---

## Phase 1: Setup (orientation — no shared code to scaffold)

**Purpose**: Confirm the environment and the exact seams the dialog plugs into.

- [X] T001 Confirm CRD is active and the gap is reproducible: `localStorage.setItem('alkemio-design-version','2'); location.reload()`, open the user account page, click **Create Space**, and confirm today it opens the **MUI** `CreateSpace` dialog (the inconsistency this feature removes).
- [X] T002 [P] Re-read the reference implementation to mirror conventions exactly: `src/crd/components/space/settings/CreateSubspaceDialog.tsx`, `src/main/crdPages/topLevelPages/spaceSettings/subspaces/useCreateSubspace.ts`, and the mounting in `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx` (lines ~101, ~622).

---

## Phase 2: Foundational (confirm shared seams — no new blocking code)

**Purpose**: The CRD foundation (3-layer pattern, sticky-dialog rule, `pickColorFromId`, typography tokens, the template picker, the image-resize helper, the discard guard, the Space-creation/plan domain hooks) already exists. No new shared infrastructure is required before stories begin.

- [X] T003 Verify the reused seams exist and are importable from a `crdPages` file (no `@mui/*` pulled): `useSpaceCreation` + `useSpacePlans` (`src/domain/space/components/CreateSpace/hooks/**`), `addSpaceWelcomeCache`, `resizeImageToConstraints`, `useTemplatePicker`, `useDefaultVisualTypeConstraintsQuery`, `useDialogCloseGuard`. Confirm no `.graphql` change is needed (all mutations/queries already generated).

**Checkpoint**: Seams confirmed — US1 can begin.

---

## Phase 3: User Story 1 — Create a (blank) Space on the new design (Priority: P1) 🎯 MVP

**Goal**: A CRD-native Create Space dialog launched from the **user account page** that creates a top-level Space end-to-end (no template needed), reusing all GraphQL hooks. Contracts: `contracts/createSpaceDialog.ts`, `contracts/useCreateSpace.ts`.

**Independent test**: With CRD active, open the user account page → **Create Space** → fill name + accept terms → **Create**; a Space is created with zero MUI styling and the user lands on it (SC-001/SC-002). Slug auto-fills from the name and locks once edited; banner/card uploads resize and preview.

### i18n (namespace)

- [X] T004 [P] [US1] Create the `crd-createSpace` namespace: `src/crd/i18n/createSpace/createSpace.{en,es,nl,bg,de,fr}.json` with keys for `dialog.{title,subtitle}`, `displayName.{label,hint,placeholder}`, `slug.{label,prefix,placeholder}`, `tagline.*`, `description.{label,hint,placeholder}`, `tags.*`, `template.{label,hint,choose,change,clear,selectedLabel,loadingPreview}`, `banner.{label,upload}` (Page Banner), `cardBanner.{label,upload}`, `visuals.{remove,resolutionHint,tooSmall,loadFailed}`, `addTutorials.label` (= `Add Tutorials to this Space`), `terms.{checkboxLabel,dialogTitle,dialogContent,fullTermsLink}` (verbatim MUI copy per research R10 — `checkboxLabel` carries the `<terms>` tag for `<Trans>`), `license.noPlans` (= `No Available Plans. Please, contact support.`), `validation.{min3,maxSmall,maxMarkdown,required,acceptedTerms}`, `buttons.{cancel,create,creating}`. "Space"/"Host" untranslated per glossary.
- [X] T005 [US1] Register `'crd-createSpace'` in `crdNamespaceImports` (`src/core/i18n/config.ts`) and add `'crd-createSpace': typeof crdCreateSpaceTranslation;` to `@types/i18next.d.ts` (mirror the existing `crd-subspace` entry).

### Layer 3 — presentational (pure)

- [X] T006 [US1] Build `src/crd/components/space/CreateSpaceDialog.tsx` by cloning `CreateSubspaceDialog` (reuse the local `FieldShell` + `FileField` helpers, `useDialogCloseGuard`, sticky `DialogContent` flex-column/`max-h-[90vh]`/`shrink-0` header+footer/`flex-1 min-h-0 overflow-y-auto` body). Props per `contracts/createSpaceDialog.ts` (incl. `MarkdownUploadProps` + `termsUrl`). Fields in order: **template selector region** (`selectedTemplate*`/`onOpenTemplatePicker`/`onClearTemplate` + `TemplateContentPreview` slot), **display name** (required), **URL slug** row with inline `alkem.io/` prefix, **tagline**, **description** (`MarkdownEditor`, wired with `onImageUpload`/`iframeAllowedUrls`/`onError` — kept, matches Subspace), **tags** (`TagsInput`), **Page Banner** (`FileField`, `aspect-[3/1]` as a visual hint — the `VisualType.Banner` constraints from the query are authoritative for validation/resize) + **Card Banner** (`FileField`, `aspect-video`, `VisualType.Card`), then the two checkboxes — **Add Tutorials** and **Accept terms** (required) whose `<terms>` link (via `<Trans>`) opens a `terms` info sub-dialog (title/content + `termsUrl` "read more" external link). Render the **no-available-plan message** (from `noPlanAvailable`) above the footer. Footer: Cancel + Create (`aria-busy` while `submitting`, disabled unless `canSubmit`). `isDirty` includes description. Zero `@mui/*`; all strings via `useTranslation('crd-createSpace')`; WCAG 2.1 AA.

### Layer 2 — integration (reuse GraphQL hooks)

- [X] T007 [US1] Build `src/main/crdPages/topLevelPages/createSpace/useCreateSpace.ts` (scaffold from `useCreateSubspace.ts`), props/return per `contracts/useCreateSpace.ts`: local `CreateSpaceFormValues` state; **slug auto-derive from displayName + `isSlugEdited` lock** (research R4) using the prototype rule (`lowercase`, `[^a-z0-9]+`→`-`, trim `-`) and `nameIdValidator` format validation; yup-on-submit validation with translated messages (incl. `description` `max MARKDOWN_TEXT_LENGTH`); **plan selection** via `useSpacePlans({ accountId, skip: !open || !accountId })` → `availablePlans[0]?.id` and `noPlanAvailable = plansLoaded && availablePlans.length === 0`; **visual resize** via `resizeImageToConstraints` against `useDefaultVisualTypeConstraintsQuery(VisualType.Banner)` (page banner) / `(VisualType.Card)`; `canSubmit = displayName≥3 && nameId valid && acceptedTerms && !noPlanAvailable && !submitting`. `onSubmit` → reused `useSpaceCreation.createSpace({ accountId, nameId, licensePlanId, about.profile{displayName,tagline,description,tags,visuals{banner,cardBanner}}, addTutorialCallouts, addCallouts:true, spaceTemplateId||undefined })`. Wire a **basic** `useTemplatePicker({ allowedTypes:['space'], accountId })` exposing `picker`/`onOpenTemplatePicker`/`onClearTemplate` (selection sets `spaceTemplateId`; preview + pre-fill + selectable filter come in US2). On success: `addSpaceWelcomeCache(result.id)`, Sentry `info('Space Created…', { category: SPACE_CREATION })`, refetch `AccountInformation` (+ `useDashboardSpaces().refetchSpaces`), then `onSpaceCreated?.(result) ?? navigate(result.about.profile.url)`; close on success.
- [X] T008 [P] [US1] Add `src/main/crdPages/topLevelPages/createSpace/useCreateSpace.test.ts` (Vitest): slug auto-derives from name; editing slug locks it (name changes stop propagating); validation flags empty name / unaccepted terms; `canSubmit` false when `noPlanAvailable`; mapping to mutation variables matches `data-model.md`.
- [X] T009 [US1] Build the connector `src/main/crdPages/topLevelPages/createSpace/CrdCreateSpaceDialog.tsx` — props `{ open, onClose, accountId, onSpaceCreated? }` (per `contracts/useCreateSpace.ts`). Wrap in `StorageConfigContextProvider` (`locationType="account"`, `accountId`, `skip={!open}`); run `useCreateSpace({ accountId, onSpaceCreated })` + `mdCreate = useMarkdownEditorIntegration({ temporaryLocation: true })`; read `termsUrl = useConfig().locations?.terms`. Sync `open`/`onClose` to `openDialog`/`closeDialog`, and render `<CreateSpaceDialog {...hook} {...mdCreate} termsUrl={termsUrl} />` + `<TemplatePicker {...picker} />`.

### Entry point

- [X] T010 [US1] Wire the **user** account tab `src/main/crdPages/topLevelPages/userPages/settings/account/CrdUserAccountTab.tsx`: remove the `import CreateSpace from '@/domain/space/components/CreateSpace/createSpace/CreateSpace'` (line ~23) and replace the `<CreateSpace accountId open onClose />` JSX (line ~215) with `<CrdCreateSpaceDialog accountId={account.id} open={createSpaceOpen} onClose={() => setCreateSpaceOpen(false)} />`. Keep `createSpaceOpen` state and the `tryCreate('spaces', entitled.spaces, …)` gate unchanged; update the TEMP-fallback comment to drop the Space line.

**Checkpoint**: A blank Space can be created from the user account page entirely in CRD; MUI `CreateSpace` no longer imported by `CrdUserAccountTab`.

---

## Phase 4: User Story 2 — Start a Space from a template (Priority: P1)

**Goal**: Pick a Space template to seed the new Space; preview it and pre-fill the form; only fully-structured templates are offered. Contract: `contracts/useCreateSpace.ts` (template fields).

**Independent test**: Open the dialog → **Choose template** → the picker lists only Space templates with a valid 4-state innovation flow → select one → its content previews and the text fields pre-fill → if the form already had content, an overwrite-confirm appears → create → the Space is created from that template (US2 acceptance scenarios).

- [X] T011 [US2] In `useCreateSpace.ts`, **filter the picker's source rows to selectable L0 templates only** — those whose captured space has a complete 4-state innovation flow (research R6; parity with the MUI `isTemplateSelectable` rule). Non-selectable templates are excluded from `picker.sources` so they can't be chosen. *(depends on T007)*
- [X] T012 [US2] In `useCreateSpace.ts`, add template **content fetch + apply**: on picker selection, `useTemplateContentLazyQuery({ templateId, includeSpace:true })` → set `selectedTemplateName`/`selectedTemplateContent` (via `mapTemplateContent`) and **pre-fill** `displayName`/`tagline`/`description`/`tags` (slug re-derives unless locked) — same fields `useCreateSubspace.applyTemplate` fills; add the **overwrite-confirm** state (`overwriteConfirmOpen`/`onConfirm…`/`onCancel…`) guarding pre-fill when the form already holds user content — mirroring `useCreateSubspace.applyTemplate`. *(depends on T007)*
- [X] T013 [US2] In `CrdCreateSpaceDialog.tsx` (and the dialog's template region), render the selected-template **preview** (`selectedTemplateContent` → `TemplateContentPreview`, already slotted in T006) and mount the **overwrite-confirm** dialog (CRD `ConfirmationDialog`) driven by `overwriteConfirmOpen`. *(depends on T009, T012)*

**Checkpoint**: Template selection works with preview, pre-fill, overwrite-guard, and the 4-state selectable filter; US1 + US2 both functional.

---

## Phase 5: User Story 3 — Create a Space in an organization account (Priority: P2)

**Goal**: The same dialog creates a Space under an organization's account from the org account page.

**Independent test**: On an organization account page (CRD), **Create Space** → create → the Space belongs to the organization's account, and the plan applied is one available to that account (US3 acceptance scenarios).

- [X] T014 [US3] Wire the **organization** account tab `src/main/crdPages/topLevelPages/organizationPages/settings/account/CrdOrgAccountTab.tsx`: remove the `import CreateSpace …` (line ~24) and replace the `<CreateSpace accountId open onClose />` JSX (line ~207) with `<CrdCreateSpaceDialog accountId={account.id} open={createSpaceOpen} onClose={() => setCreateSpaceOpen(false)} />`. Keep `createSpaceOpen` + the `tryCreate('spaces', …)` gate; update the TEMP-fallback comment. *(reuses the US1/US2 connector unchanged — account scoping + plan availability already key off `accountId`)*

**Checkpoint**: Both account tabs open the CRD dialog; no `crdPages` Create Space entry point imports MUI (SC-006).

---

## Phase 6: User Story 4 — Clear messaging when creation isn't possible (Priority: P2)

**Goal**: Failure surfaces are explicit — no available plan, invalid image, and server error — with no silent failure or orphaned Space.

**Independent test**: Force each failure and confirm a clear message + recoverable state (US4 acceptance scenarios, SC-007).

- [X] T015 [US4] **No-plan**: confirm `useCreateSpace` sets `noPlanAvailable` once plans load and `canSubmit` stays false; ensure the dialog's no-plan message (T006) renders with the `license.noPlans` copy and Create is disabled. *(depends on T006, T007)*
- [X] T016 [US4] **Invalid image**: in `useCreateSpace`, on a too-small/failed resize set the per-field error (`bannerFile`/`cardBannerFile`) to `visuals.tooSmall`/`visuals.loadFailed` and clear the file (mirror `useCreateSubspace.applyImageResize`); confirm `FileField` shows it. *(depends on T007)*
- [X] T017 [US4] **Server error**: in `CrdCreateSpaceDialog`/`useCreateSpace`, on mutation rejection keep the dialog open with input intact and surface a notification (reuse `useNotification`); `submitting`/`aria-busy` blocks double-submit and `useDialogCloseGuard.blockClose` prevents close mid-create. *(depends on T007, T009)*
- [X] T018 [P] [US4] **Discard guard**: verify editing then Esc/X/overlay triggers `DiscardChangesDialog` via `useDialogCloseGuard` (`isDirty` covers name/slug/tagline/description/tags/template/banner/card/tutorials); clean close is immediate. *(depends on T006)*

**Checkpoint**: All failure paths produce clear, recoverable messages.

---

## Phase 7: User Story 5 — Standalone demo preview (Priority: P3)

**Goal**: Iterate on the dialog backend-free in the standalone CRD app.

**Independent test**: `pnpm crd:dev` → open the Create Space demo → the dialog renders with mock data and exercises template-selected / validation-error / submitting states (US5 acceptance scenarios).

- [X] T019 [P] [US5] Create `src/crd/app/pages/CreateSpacePage.tsx` rendering `CreateSpaceDialog` with mock props (mock `selectedTemplateContent`, `bannerConstraints`/`cardBannerConstraints`, `values`/`errors`, `submitting`, `noPlanAvailable` toggles), mirroring an existing demo page (e.g. `SubspacePage.tsx`).
- [X] T020 [US5] Route the demo page in `src/crd/app/CrdApp.tsx` (+ any nav list), following the existing demo-page registration pattern. *(depends on T019)*

**Checkpoint**: The dialog is previewable on `localhost:5200` with no backend.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T021 [P] Add the six `crd-createSpace` language files' keys review pass — ensure every key in `createSpace.en.json` exists in es/nl/bg/de/fr and "Space" is untranslated (SC-005).
- [X] T022 Confirm no MUI leak: `grep -rE "@mui/|@emotion/" src/main/crdPages/topLevelPages/createSpace src/crd/components/space/CreateSpaceDialog.tsx` returns nothing, and neither account tab imports `CreateSpace` from `@/domain/...` (SC-006).
- [X] T023 Run `pnpm lint` (TS + Biome + ESLint react-compiler) and `pnpm vitest run src/main/crdPages/topLevelPages/createSpace`; fix issues. Confirm **no `pnpm codegen`** was needed.
- [ ] T024 Run the `quickstart.md` manual-QA script (user + org, blank + template, no-plan, invalid image, server error, discard, sticky chrome at 768px) and tick the Definition of Done.

---

## Phase 9: Refinements (post-review feedback)

**Purpose**: Polish items raised after first review (FR-002/004/007/020, research R13/R14). All amend the already-built files.

- [X] T025 [P] Banners **side by side** on wide screens — in `CreateSpaceDialog.tsx`, change the visuals wrapper from `grid-cols-1` to `grid-cols-1 md:grid-cols-2` (page banner left, card banner right). (FR-004)
- [X] T026 URL **prefix + canonical slug** (FR-002): add a `urlPrefix` prop to `CreateSpaceDialog` and render it before the slug input (lowercased) instead of the static `slug.prefix`; in `CrdCreateSpaceDialog.tsx` resolve it via `usePlatformOrigin()` + `/`; in `useCreateSpace.ts` replace the local `deriveSlug` with `createNameId` (`@/core/utils/nameId/createNameId`) — accent-fold + lowercase + cap. Update `useCreateSpace.test.ts` for the new derivation (no hyphenation; diacritics fold to base letters).
- [X] T027 Terms checkbox in the **footer** (FR-007, R13): move the Accept-terms checkbox from the body into `DialogFooter` next to Cancel/Create — `flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between` (checkbox left/top, buttons right/bottom). Keep Add Tutorials in the body. Use the shortened `terms.checkboxLabel`.
- [X] T028 Account-aware **subtitle** (FR-020): add an `accountName` prop to `CreateSpaceDialog` (→ `dialog.subtitleForAccount` when set, else `dialog.subtitle`) and to the `CrdCreateSpaceDialog` connector; pass the org display name from `CrdOrgAccountTab.tsx` (user tab passes nothing).
- [X] T029 Fix template-preview clipping (R14): in `src/crd/components/templates/TemplateContentPreview.tsx`, add bottom padding inside the `ScrollArea` viewport (wrap the preview body in `pb-1`) so the last accordion item's border isn't clipped. Shared fix — verify the subspace dialog preview too.
- [X] T030 i18n + verify: shorten `terms.checkboxLabel` and add `dialog.subtitleForAccount` across all 6 `createSpace.<lang>.json` (+ standalone-app `main.tsx` already covers the namespace); update `CreateSpacePage.tsx` demo (mock `urlPrefix`, optional `accountName`, `createNameId`); run `tsc` + Biome + ESLint + `pnpm vitest run`.

---

## Phase 10: Refinements (review round 2)

**Purpose**: Layout/copy fixes from the second review (research R14/R15, FR-006).

- [X] T031 Fix template-preview **overflow + crop** (R14): in `src/crd/components/templates/TemplateContentPreview.tsx`, replace the Radix `ScrollArea` with `<div className="max-h-[60vh] overflow-y-auto pr-3">` (drop the `pb-1` and the `ScrollArea` import). Shared fix — verify subspace preview too.
- [X] T032 [P] **Tutorials** header + copy (FR-006): in `CreateSpaceDialog.tsx` add a "Tutorials" header (`addTutorials.header`) above the checkbox and use the reworded `addTutorials.label` ("Add Tutorials and example posts to this Space"); update all 6 i18n files.
- [X] T033 [P] **Terms link** styling: force `font: inherit` + `cursor-pointer` on the `<terms>` link so it matches the caption label and shows the pointer cursor.
- [X] T034 **Terms URL** in i18n: add `terms.url` to all 6 `createSpace.<lang>.json`; in `CreateSpaceDialog.tsx` the "read more" link uses `termsUrl ?? t('terms.url')` (always renders).
- [X] T035 **No hardcoded URLs in the demo** (`CreateSpacePage.tsx`): `urlPrefix = window.location.origin + '/'`; drop the hardcoded `termsUrl` (falls back to `t('terms.url')`); `onImageUpload = file => URL.createObjectURL(file)`.
- [X] T036 Verify: `tsc` + Biome + ESLint + `pnpm vitest run`. (Deferred — study the prototype's hardcoded Unsplash banner URL later; tracked as a reminder.)

---

## Phase 11: Dashboard direct-launch (review round 3 — FR-021)

**Purpose**: Open the dialog directly from the dashboard "Create my own space" item instead of linking to the account page (research R11).

- [X] T037 In `useDashboardSidebar.ts`: add `onCreateSpaceClick: () => void` to the options; change the `create-space` menu item from `href: createSpaceLink` to `onClick: onCreateSpaceClick`; drop the now-unused `useCreateSpaceLink` import.
- [X] T038 In `DashboardWithMemberships.tsx` and `DashboardWithoutMemberships.tsx`: read `accountId` from `useCurrentUserContext()`, add a `createSpaceOpen` state, pass `onCreateSpaceClick: () => setCreateSpaceOpen(true)` to `useDashboardSidebar`, and mount `{accountId && <CrdCreateSpaceDialog open={createSpaceOpen} accountId={accountId} onClose={() => setCreateSpaceOpen(false)} />}` (defaults to navigating to the new Space on success).
- [X] T039 Verify: `tsc` + Biome + ESLint + `pnpm vitest run`.

---

## Phase 12: Image crop dialog on visual selection (review round 4 — FR-004, R16)

**Purpose**: Selecting a banner/card image opens `ImageCropDialog` so the user crops before it's applied — in Create Space AND Create Subspace.

- [X] T040 [P] Create Space i18n: add `crop.{title,description,save,saving,cancel,altLabel,altPlaceholder}` to all 6 `createSpace.<lang>.json`.
- [X] T041 `useCreateSpace.ts`: add `pendingCrop = { key:'bannerFile'|'cardBannerFile', file, config }` state; in `onChange`, route a picked `File` into `pendingCrop` (config from the banner/card constraints) instead of form state; add `onCropComplete(file)` (set the field to the cropped+resized file) + `onCropCancel`; expose them; remove `applyImageResize` + the `resizeImageToConstraints` import (the crop dialog resizes).
- [X] T042 `CrdCreateSpaceDialog.tsx`: render `<ImageCropDialog open={!!pendingCrop} file config onSave onCancel ...crop labels />`.
- [X] T043 Create Subspace parity: apply the same `pendingCrop` + `ImageCropDialog` to `useCreateSubspace.ts` (replace `applyImageResize`) and mount the dialog in `CrdSpaceSettingsPage.tsx`; add `subspaces.createDialog.crop.*` to all 6 `spaceSettings.<lang>.json`.
- [X] T044 Verify: `tsc` + Biome + ESLint + `pnpm vitest run`.

---

## Phase 13: Polish fixes (review round 5)

- [X] T045 Fix the **Tutorials checkbox** layout in `CreateSpaceDialog.tsx`: the `Label` primitive defaults to `leading-none` (cramps the wrapped label) and the checkbox lacks the `mt-0.5` nudge the terms checkbox has → add `mt-0.5` to the checkbox and `leading-snug` to the label so the checkbox aligns with the first line and wrapped text isn't jammed.
- [X] T046 Fix the **banner/card form-field proportions**: the `FileField` preview box hardcodes `aspect-[3/1]`/`aspect-video`, which doesn't match the real visual aspect ratio (crop + upload are already correct — only the field box was wrong). Drive the box's aspect from `constraints.aspectRatio` (inline `style={{ aspectRatio }}`), falling back to the class only until constraints load. (Refines research R7/A1 — the real constraint aspect is authoritative.)
- [X] T047 Verify: `tsc` + Biome + ESLint + `pnpm vitest run`.

---

## Phase 14: Fixes (review round 6)

- [X] T048 Accordion **last-item bottom border** (R14b): in `src/crd/components/templates/preview/SpaceTemplatePreview.tsx`, add `last:border-b` to the `AccordionItem` className to override the primitive's default `last:border-b-0` (which strips the last card's bottom border). Shared fix.
- [X] T049 Dashboard create-space — **only replace existing links** (R11 refined): make `onCreateSpaceClick` **optional** in `useDashboardSidebar.ts`; when omitted, fall back to the original `href: useCreateSpaceLink()` (restore that import). Keep the dialog in `DashboardWithMemberships.tsx`; revert `DashboardWithoutMemberships.tsx` to its original (no dialog) — it keeps the link fallback.
- [X] T050 Verify: `tsc` + Biome + ESLint + `pnpm vitest run`.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (P1)** → no deps.
- **Foundational (P2)** → after Setup; confirms reused seams; blocks stories.
- **US1 (P3, MVP)** → after Foundational. Delivers the working create flow + user-tab entry point.
- **US2 (P4)** → depends on US1's hook/component (T007, T009) — adds template intelligence (same files).
- **US3 (P5)** → depends on US1's connector (T009); independent of US2/US4 (pure entry-point swap).
- **US4 (P6)** → depends on US1's hook/component (T006, T007, T009) — hardens failure surfaces.
- **US5 (P7)** → depends only on the pure component (T006); fully parallelizable with US2/US3/US4.
- **Polish (P8)** → after the stories you intend to ship.

### Within stories

- i18n namespace (T004/T005) before/with the component that consumes it (T006).
- Component + hook (T006/T007) before the connector (T009) before the entry-point wiring (T010/T014).

### Parallel opportunities

- T002 (setup read), T004 (i18n files), T008 (unit test), T018 (discard-guard check), T019 (demo page), T021 (i18n review) are `[P]` — different files, no incomplete-task deps.
- US3 (T014) and US5 (T019/T020) can proceed alongside US2/US4 once US1 lands.

---

## Implementation Strategy

### MVP first (US1 only)

1. Setup + Foundational (T001–T003).
2. US1 (T004–T010) → **STOP & VALIDATE**: create a blank Space from the user account page in CRD; MUI dialog gone there.
3. Demo/ship the MVP.

### Incremental delivery

1. US1 → MVP (user account, blank Space).
2. US2 → templates (preview, pre-fill, selectable filter).
3. US3 → organization account entry point.
4. US4 → failure-path hardening.
5. US5 → standalone demo.
6. Polish (lint/test/QA/no-MUI check).

---

## Notes

- `[P]` = different files, no incomplete-task deps. `[USx]` maps to spec user stories.
- Single-component feature: US2/US4 intentionally edit US1's hook/component — keep edits additive and ordered.
- The MUI `CreateSpace` stays in the repo (legacy-design callers) — do **not** delete it (FR-019).
- No `.graphql` edits → no `pnpm codegen`. No new runtime dependencies.
- Commit after each task or logical group; "Space" stays English in all locales.
