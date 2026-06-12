# Phase 0 Research: CRD Create Space Dialog

All decisions below resolve the spec's assumptions into concrete, parity-checked choices. No `[NEEDS CLARIFICATION]` remained after spec validation; this document records the *why* and the alternatives considered.

## R1 — The model is the CRD Create Subspace dialog (clone + adapt)

**Decision**: Build the dialog as a **direct clone of the already-migrated CRD Create Subspace dialog** (`src/crd/components/space/settings/CreateSubspaceDialog.tsx` + `src/main/crdPages/topLevelPages/spaceSettings/subspaces/useCreateSubspace.ts`), with these deltas:

1. **Avatar → Page Banner** — replace the subspace dialog's Avatar visual (`VisualType.Avatar`, `aspect-square`) with a **Page Banner** (`VisualType.Banner`, wide aspect); keep the **Card Banner** (`VisualType.Card`, `aspect-video`) unchanged.
2. **+ URL slug field** — a `nameID` input after the display name (auto-derived from the name, locked once edited, `nameIdValidator` format). L0 Spaces require a `nameID`; subspaces don't, so this is the one net-new field.
3. **+ Add Tutorials checkbox** and **+ Accept Terms checkbox** (required, with an inline link opening a terms dialog) — at the bottom of the body, the two checkboxes the user called out.
4. **+ License-plan selection** + **account scoping** — the two L0-only concerns (research R5).

The MUI `CreateSpace` flow (`src/domain/space/components/CreateSpace/createSpace/`) remains the source of truth for *behavior* (validation limits, plan selection, post-create side-effects, terms/tutorials copy). The prototype (`prototype/.../CreateSpaceDialog.tsx` + `CreateSpaceForm.tsx`) is a *secondary* visual reference for the inline `alkem.io/<slug>` row only — it is mock-only (no templates, no plans, no account) and is not the structural base.

**Rationale**: The user directed the dialog to be modeled on the Create Subspace dialog. That dialog already solves the hard parts in CRD (template picker + preview + pre-fill + overwrite-confirm, image resize to constraints, markdown description upload, discard guard, sticky chrome), so cloning it minimizes novel surface and guarantees visual consistency with its sibling. The field set therefore matches the Subspace dialog — **including the markdown Description** (research R3) — plus the four deltas above.

**Alternatives considered**:
- *Build from the prototype / strict MUI-L0 field set* — rejected: the user chose the Subspace dialog as the model, and the prototype has no real data layer.
- *Wrap the MUI dialog in a CRD shell* — rejected: still pulls `@mui/*` into `crdPages`, the leak we're removing.

## R2 — Three-layer structure (reuse the Create Subspace pattern)

**Decision**: 
- **CRD component** `src/crd/components/space/CreateSpaceDialog.tsx` — pure presentational, plain-TS props, mirrors `CreateSubspaceDialog` (incl. the local `FieldShell` / `FileField` helpers and `useDialogCloseGuard`).
- **Integration hook** `src/main/crdPages/topLevelPages/createSpace/useCreateSpace.ts` — owns form state, yup-on-submit validation, slug derivation, plan selection, image resize, and calls the reused `useSpaceCreation`.
- **Connector** `src/main/crdPages/topLevelPages/createSpace/CrdCreateSpaceDialog.tsx` — renders `<CreateSpaceDialog {...hook} />` + `<TemplatePicker {...hook.picker} />`, props `{ open, onClose, accountId, onSpaceCreated? }`.

**Rationale**: Matches `useCreateSubspace` + `CreateSubspaceDialog` + the `CrdSpaceSettingsPage` mounting pattern one-for-one, minimizing novel surface and review risk. The connector mirrors the MUI `CreateSpace` container's responsibility (account resolution + post-create navigation).

**Alternatives considered**: Folding the connector into each account tab — rejected (DRY; two tabs would duplicate the mount + picker wiring).

## R3 — Field set = the Subspace dialog's, KEEP the markdown Description

**Decision**: The dialog captures, in order: **Space template** (optional, + preview/pre-fill/overwrite-confirm), **display name** (required), **URL slug / nameId** (required), **tagline**, **description** (markdown), **tags**, **page banner** + **card banner**, **Add tutorials** (checkbox), **Accept terms** (required checkbox + terms info dialog/link). **The markdown Description field is kept** (matching the Subspace dialog).

**Rationale**: The user chose to mirror the Subspace dialog, which has a markdown Description, so Create Space keeps it. This intentionally diverges from the MUI L0 `CreateSpaceForm` (which omits a description input, leaving `SpaceFormValues.description` as `''`) — the Subspace dialog is the chosen model, not the MUI L0 form. The cost is low: the Subspace dialog already wires description uploads through the shared `useMarkdownEditorIntegration({ temporaryLocation: true })` hook (so inline images land in a temporary bucket before the Space exists), and the MUI `CreateSpace` already wraps creation in an account-scoped `StorageConfigContextProvider` — the CRD connector combines both (see R7). Validation limits mirror the Subspace dialog / MUI: displayName `min 3 / max SMALL_TEXT_LENGTH`; tagline `min 3 / max SMALL_TEXT_LENGTH`; description `max MARKDOWN_TEXT_LENGTH`; tags `min 2` each; `acceptedTerms` must be `true`.

**Alternatives considered**: Dropping description for strict MUI-L0 parity — considered and **rejected by the user** (they chose "keep it, match Subspace"); the description is added later via the About dialog under that alternative.

## R4 — URL slug field (the one net-new field vs. subspace)

**Decision**: Add a slug/`nameId` input below the name, displaying the platform's **origin as a prefix** and **auto-deriving** the slug from the display name until the user edits it (then **locked**). Replicate the MUI `NameIdField` exactly:
- **Prefix** = `usePlatformOrigin()` + `/` (dev → `VITE_APP_ALKEMIO_DOMAIN` e.g. `http://localhost:3000`; prod → `https://${locations.domain}`), shown lowercase. The CRD component stays pure — the connector resolves the origin and passes it as a `urlPrefix` prop.
- **Derivation** = the canonical `createNameId` helper (`src/core/utils/nameId/createNameId.ts`) — the same routine the server uses: accent-fold (diacritics → base letters), strip whitespace and disallowed characters, **lowercase**, cap at `NAMEID_MAX_LENGTH`. This replaces the earlier naive prototype rule (which turned accents into `-`).
- Validate format with the existing `nameIdValidator` rules. **No server-side availability check.**

**Rationale**: Create Space requires `nameID`; the Subspace dialog has no slug field, so this is the only genuinely new *field* (the checkboxes are new controls but map to existing form values). The auto-derive + lock behavior comes from the prototype (`isSlugEdited`) and the MUI `NameIdField` (`sourceFieldName`); place it directly under the display name (MUI ordering). The MUI flow validates slug *format* only and lets the backend reject duplicates on submit — so the prototype's green "Available" badge is cosmetic with no backing query; reproducing real availability checking would add a query the legacy flow never made (out of scope). On a duplicate, the server error surfaces via R8's error handling.

**Alternatives considered**: Live availability lookup — rejected (no such query in the legacy flow; scope creep). Hiding the slug entirely and auto-generating — rejected (loses user control the MUI flow provides).

## R5 — License-plan selection (reuse `useSpacePlans`)

**Decision**: In `useCreateSpace`, call `useSpacePlans({ accountId, skip: !open || !accountId })` and submit `licensePlanId = availablePlans[0]?.id`. If `availablePlans` is empty, block submission and show the no-plan message (parity with the MUI `createSpace.license.noPlansError`). Both underlying queries (`usePlansTableQuery`, `useAccountPlanAvailabilityQuery`) are `skip`-gated until the dialog opens.

**Rationale**: Identical to the MUI `CreateSpace` container (`availablePlans[0]?.id` + `ensurePresence(..., 'noPlansError')`). Reusing the domain hooks keeps the plan/entitlement logic in one place (Constitution I/IV).

**Alternatives considered**: Letting the user pick a plan in the dialog — rejected (the legacy flow auto-selects; no plan-picker UI exists and none is requested).

## R6 — Template "selectable" parity (4-state innovation flow)

**Decision**: Only Space templates whose captured space has a **complete (4-state) innovation flow** may seed an L0 Space. Since `TemplatePickerSelectProps` has no per-row disabled/selectable capability, **filter non-selectable templates out of the picker's source rows at the integration layer** (in `useCreateSpace`'s picker wiring), so only valid L0 templates appear.

**Rationale**: The MUI form enforces this via `isTemplateSelectable` (`template.contentSpace?.collaboration.innovationFlow.states.length === 4`). Filtering at the data/mapper seam keeps the CRD picker component unchanged (no new prop), consistent with "don't over-migrate the shared picker." Hidden-vs-disabled is acceptable because a non-selectable template offers the user nothing actionable here.

**Alternatives considered**: Extend `TemplatePicker` with an `isSelectable`/`disabledIds` capability and render disabled rows — deferred as a possible enhancement; not needed for parity and touches a shared component used by many flows.

## R7 — Visuals (Avatar→Page Banner) + markdown upload

**Decision (visuals)**: The dialog collects `bannerFile` (**Page Banner**, `VisualType.Banner`, wide aspect) and `cardBannerFile` (**Card Banner**, `VisualType.Card`, `aspect-video`) as `File` objects — the **Avatar** slot of the Subspace dialog (`VisualType.Avatar`, `aspect-square`) is **replaced by the Page Banner**. The two uploaders render **side by side on wide screens** (`grid-cols-1 md:grid-cols-2`) — page banner left, card banner right — rather than stacked. On pick, center-crop + resize each via the reused `resizeImageToConstraints` against `useDefaultVisualTypeConstraintsQuery({ visualType: Banner | Card })` results (exactly as `useCreateSubspace` does, only with `Banner` swapped in for `Avatar`). On submit, pass them to `useSpaceCreation` as `about.profile.visuals.banner/cardBanner`, which uploads them to the **new Space's** profile after creation via `useUploadVisualsOnCreate`.

**Decision (description markdown upload)**: Because the Description field is kept (R3), the connector reuses the shared `useMarkdownEditorIntegration({ temporaryLocation: true })` hook (the same one `CrdSpaceSettingsPage` uses for the Subspace create dialog) and wraps the dialog in an account-scoped `StorageConfigContextProvider` (`locationType="account"`, `accountId`, `skip={!open}`) — matching what the MUI `CreateSpace` already does. Inline images uploaded while typing the description land in a temporary account bucket before the Space exists.

**Rationale**: Mirrors `useCreateSubspace`'s resize + markdown pipeline; banner uploads still happen post-create (to the real storage bucket) via `useSpaceCreation`, and only the *editor* image uploads need the temporary-location account context — both are existing, shared building blocks.

**Alternatives considered**: Uploading banners to a temporary location during editing — rejected (the mutation handles post-create banner upload).

## R8 — Submit, errors, and post-create side-effects

**Decision**: Reuse the MUI `CreateSpace` container's success path inside the connector/hook: `addSpaceWelcomeCache(spaceId)`, Sentry `info('Space Created…', { category: SPACE_CREATION })`, refetch `AccountInformation` (+ dashboard spaces via the existing `useDashboardSpaces().refetchSpaces`), then either call `onSpaceCreated(result)` or `navigate(result.about.profile.url)`. On mutation error, keep the dialog open with the user's input intact and surface the failure (notification); `submitting`/`aria-busy` prevents double-submit; closing is blocked while submitting (`useDialogCloseGuard` `blockClose`).

**Rationale**: Behavioral parity with the legacy container; the only change is the visual layer. Keeping input on error satisfies FR-012/SC-007.

## R9 — Discard guard & dialog chrome

**Decision**: Wrap the dialog with `useDialogCloseGuard({ isDirty, onClose, blockClose: submitting })` and apply the sticky header / scrollable body / sticky footer pattern (`DialogContent` flex-column + `max-h-[90vh]`, `shrink-0` header/footer, `flex-1 min-h-0 overflow-y-auto` body) — identical to `CreateSubspaceDialog`. `isDirty` = any field touched (name/slug/tagline/description/tags/template/banner/card/tutorials).

**Rationale**: Required by CRD Rule #9 (authored content) and the migration guide's dialog-layout rule. The form holds user-typed content → closing must confirm via `DiscardChangesDialog`.

## R10 — i18n namespace

**Decision**: Add a dedicated **`crd-createSpace`** namespace (`src/crd/i18n/createSpace/createSpace.<lang>.json`) for all six languages (en, nl, es, bg, de, fr), registered in `crdNamespaceImports` (`src/core/i18n/config.ts`) + `@types/i18next.d.ts`. The English values mirror the existing MUI copy verbatim:

| Key | English value (from MUI `createSpace.*` / shared) |
|---|---|
| `dialog.subtitle` | `Set up a new top-level Space in your account.` |
| `dialog.subtitleForAccount` | `Set up a new top-level Space in the {{account}} account.` |
| `addTutorials.label` | `Add Tutorials to this Space` |
| `terms.checkboxLabel` | `I accept the <terms>terms and conditions</terms> for creating a Space.` (shortened from the MUI copy to fit the footer) |
| `terms.dialogTitle` | `Terms and Conditions for creating a Space` |
| `terms.dialogContent` | `I understand that as a Host, I am responsible for all content within the Space.` |
| `terms.fullTermsLink` | `Click here to read more about the Terms & Conditions.` |
| `license.noPlans` | `No Available Plans. Please, contact support.` |

The `<terms>` placeholder is rendered via `<Trans>` as the link that opens the terms dialog (CRD Rule #10 — never drop tag-bearing strings into bare `t()`); the external "full terms" URL comes from platform config (`config.locations.terms`) passed in as a prop (`termsUrl`), not read inside the CRD component. The checkbox label is **shortened** from the verbatim MUI sentence because the control now lives in the footer next to the buttons (FR-007). `dialog.subtitleForAccount` is used when the connector passes an `accountName` (organization account); otherwise `dialog.subtitle` ("your account") is shown (FR-020). "Space"/"Host" stay English per the glossary.

**Rationale**: The dialog is a self-contained feature reused by both the user and organization account tabs (and potentially a future dashboard launch point), so a dedicated per-feature namespace (matching `crd-subspace`, `crd-spaceSettings`) is cleaner than overloading `crd-contributorSettings`. Reusing the exact MUI English strings keeps user-facing copy identical across designs. CRD translations are maintained manually (AI-assisted), not Crowdin, and all languages ship in the same PR.

**Alternatives considered**: Reuse `crd-contributorSettings` — acceptable but couples a reusable dialog to one consumer's namespace; rejected for clarity.

## R11 — Entry-point swap (both account tabs)

**Decision**: In `CrdUserAccountTab.tsx` and `CrdOrgAccountTab.tsx`, replace `import CreateSpace from '@/domain/space/components/CreateSpace/createSpace/CreateSpace'` + `<CreateSpace accountId={account.id} open={createSpaceOpen} onClose={…} />` with the CRD connector `<CrdCreateSpaceDialog accountId={account.id} open={createSpaceOpen} onClose={…} />`. Leave the `tryCreate('spaces', entitled.spaces, () => setCreateSpaceOpen(true))` gate and `createSpaceOpen` state untouched.

**Rationale**: The entitlement/privilege gating already lives on the account page and is out of scope; only the dialog component changes. This removes the MUI dependency these two `crdPages` files carry for Create Space (SC-006). The MUI `CreateSpace` stays in the repo for legacy-design callers (FR-019).

## R12 — Standalone demo (P3, optional)

**Decision**: Add `src/crd/app/pages/CreateSpacePage.tsx` rendering `CreateSpaceDialog` with mock props (mock template content, constraints, validation/submitting states), routed in `CrdApp.tsx` — mirroring the existing demo pages (e.g. `SubspacePage`, `TemplatesPage`).

**Rationale**: Lets design/QA iterate backend-free via `pnpm crd:dev`, consistent with the migration practice. Lower priority than the functional swap.

## R13 — Terms checkbox lives in the footer

**Decision**: Move the **Accept terms** checkbox out of the scrollable body and into the `DialogFooter`, alongside Cancel/Create. The footer is a responsive flex container: on wide screens the checkbox sits on the **left**, the buttons on the **right** (`sm:flex-row sm:justify-between sm:items-center`); on small screens the checkbox **stacks above** the button row (`flex-col items-stretch`). The **Add Tutorials** checkbox stays in the body (it is not a gating action). The no-plan message stays at the bottom of the body.

**Rationale**: Keeps the primary gating control next to the primary action (FR-007), and the shortened label (R10) fits the footer. The sticky footer means the checkbox + buttons are always reachable regardless of scroll.

## R14 — Template-preview overflow & last-item clipping (Radix ScrollArea misuse)

**Decision**: Replace the Radix `ScrollArea` in `TemplateContentPreview.tsx` with a plain `<div className="max-h-[60vh] overflow-y-auto pr-3">`. This is a shared-component fix (subspace dialog, template management, preview dialog).

**Root cause**: The `ScrollArea` Root carried only `max-h-[60vh]` (a *max-height*, not a definite height) and no `overflow:hidden`, while its Viewport is `height:100%`. A percentage height resolved against a max-height-only parent computes to **`auto`**, so the Viewport grew to the full content height and never clipped/scrolled — tall content (a template with **subspace cards**) **spilled out** of the bordered preview box entirely, and the Radix `display:table` content wrapper also clipped the **last accordion item's border by 2–3 px**. A native `max-height` + `overflow-y-auto` on the *same* element scrolls correctly (no definite-height requirement, no `display:table`), fixing both symptoms.

**Rationale**: Root-cause fix per the constitution's debugging rule — the earlier `pb-1` only masked the crop and did nothing for the overflow. Trade-off: a native scrollbar instead of the Radix styled one, acceptable for a contained preview. The `.last:border-b-0` utility the reviewer spotted is unrelated (generated for a different component).

## R15 — Copy & no-hardcode refinements (review round 2)

**Decisions**:
- **Tutorials**: add a small **"Tutorials"** header above the checkbox and change the label to **"Add Tutorials and example posts to this Space"** (`addTutorials.header` + reworded `addTutorials.label`).
- **Terms link**: the `<terms>` link rendered at the browser-default button font-size (the CRD reset doesn't fully normalize it) — force `font: inherit` and `cursor: pointer` on the link so it matches the surrounding caption label and shows the pointer cursor like the rest of the (clickable) label.
- **No hardcoded URLs**: the standalone demo must not hardcode strings. The slug **prefix** in the demo uses the **current domain** (`window.location.origin + '/'`); the **terms URL** moves into i18n (`terms.url`) and the component's "read more" link falls back to `t('terms.url')` when no `termsUrl` prop is supplied; the demo's markdown **image upload** mock returns `URL.createObjectURL(file)` instead of a hardcoded image URL.
- **Deferred**: the hardcoded Unsplash banner URL (copied from the prototype's `CreateSpaceForm`) is to be studied later — tracked as a reminder, out of scope for this round.

## Reused assets (no new dependencies)

| Asset | Path | Role |
|---|---|---|
| `useSpaceCreation` | `src/domain/space/components/CreateSpace/hooks/useSpaceCreation/` | Create mutation + post-create visual upload |
| `useSpacePlans` / `usePlanAvailability` | `…/hooks/spacePlans/` | First available Space plan + no-plan guard |
| `addSpaceWelcomeCache` | `src/domain/space/components/CreateSpace/utils.ts` | Post-create welcome cache |
| `createNameId` | `src/core/utils/nameId/createNameId.ts` | Canonical slug derivation (accent-fold, lowercase) |
| `usePlatformOrigin` | `src/domain/platform/routes/usePlatformOrigin.ts` | Environment origin for the URL prefix |
| `useTemplatePicker` | `src/main/crdPages/templates/useTemplatePicker.ts` | `mode:'select'` Space-template picker |
| `TemplateContentPreview` | `src/crd/components/templates/TemplateContentPreview.tsx` | Selected-template preview |
| `resizeImageToConstraints` | `src/main/crdPages/topLevelPages/spaceSettings/subspaces/` | Center-crop/resize visuals |
| `useDefaultVisualTypeConstraintsQuery` | generated | Banner/Card constraints |
| `useDialogCloseGuard` | `src/crd/components/dialogs/useDialogCloseGuard.tsx` | Dirty-close confirm |
| `TagsInput` | `src/crd/forms/tags-input.tsx` | Tags field |
| `MarkdownEditor` | `src/crd/forms/markdown/MarkdownEditor.tsx` | Description field (kept — R3) |
| `useMarkdownEditorIntegration` | `src/main/crdPages/markdown/useMarkdownEditorIntegration.ts` | `temporaryLocation: true` image upload for the description |
| `StorageConfigContextProvider` | `src/domain/storage/StorageBucket/StorageConfigContext` | Account-scoped storage for editor uploads (connector wrapper) |
| `Dialog`/`Input`/`Label`/`Button`/`Checkbox` | `src/crd/primitives/` | Form chrome |
