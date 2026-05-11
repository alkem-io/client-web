# Tasks: CRD Templates System

**Input**: Design documents from `/specs/098-crd-templates/`
**Prerequisites**: `plan.md`, `spec.md` (8 user stories US1–US8), `research.md`, `data-model.md`, `contracts/*.ts`, `quickstart.md`

**Tests**: Targeted unit tests only (pure mappers + key integration hooks) — the spec does not request TDD; the Constitution requires test evidence for non-trivial logic, so a small set of mapper/hook tests is included. No exhaustive component test suite.

**Organization**: Phase 1 Setup → Phase 2 Foundational (the complete CRD "templates kit" — blocking for every story) → Phases 3–10 one per user story in priority order (US1, US2, US3 are P1; US4, US5, US6 are P2; US7, US8 are P3) → Phase 11 Polish.

**Path conventions**: Presentational CRD components under `src/crd/components/{templates,innovationPack,innovationLibrary}/` (no MUI, plain-TS props, callbacks for behaviour, Tailwind + lucide-react, `useTranslation('crd-templates')`). Integration (data/mappers/mutations/routing/toggle) under `src/main/crdPages/{templates,innovationPack,innovationLibrary}/` and the existing `src/main/crdPages/topLevelPages/spaceSettings/templates/`. Legacy MUI under `src/domain/{templates,templates-manager,InnovationPack,spaceAdmin/SpaceAdminTemplates}/` and `src/main/topLevelPages/InnovationLibraryPage/` is **untouched** (serves toggle-off) — read for reference. Prototype design refs (read-only) under `prototype/src/app/components/{space/SpaceSettingsTemplates.tsx,template-library/*}` + `prototype/src/app/pages/Template*Page.tsx` + `prototype/src/app/data/template-data.ts`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: scaffolding the rest of the feature builds on.

- [ ] T001 [P] Audit the shadcn primitives needed by this feature (`collapsible`, `dropdown-menu`, `scroll-area`, `select`, `switch`, `tabs`, `badge`, `card`, `dialog`, `skeleton`, `tooltip`, `separator`, `input`, `textarea`, `popover`, `command`/segmented-control for the type filter) against `src/crd/primitives/`; port any missing one verbatim from `prototype/src/app/components/ui/` into `src/crd/primitives/<name>.tsx`, updating the `cn()` import to `@/crd/lib/utils` and verifying zero MUI imports.
- [ ] T002 [P] Scaffold the `crd-templates` i18n namespace: create empty `src/crd/i18n/templates/templates.{en,nl,es,bg,de,fr}.json` (`{}`), register `'crd-templates'` in `crdNamespaceImports` in `src/core/i18n/config.ts`, and add the namespace type entry in `@types/i18next.d.ts`. (Standalone preview: also wire it into `src/crd/app/main.tsx` if it eagerly imports CRD namespaces.)
- [ ] T003 [P] Create `src/crd/components/templates/types.ts` — the CRD-layer prop types from `contracts/templates-manager.ts`, `contracts/template-preview.ts` and `contracts/template-forms.ts`: `TemplateType` string union + `TEMPLATE_TYPE_ORDER`, `TemplateCardData`, `TemplateCategorySection`, `TemplateAction`, `FramingKind`, the `TemplateContent` discriminated union, the `TemplateFormValues` discriminated union, `TemplateFormErrors`, `ReferenceRow`. Plain TS only — no GraphQL imports.

---

## Phase 2: Foundational — the CRD "templates kit" (BLOCKING PREREQUISITE for all user stories)

**Purpose**: build the holder-agnostic, presentational templates components + the shared integration hooks and mappers. Every user story (US1–US8) is pure wiring on top of this. **No user-story work may begin until this phase is complete.**

### Mappers (integration layer, pure functions)

- [ ] T004 [P] `src/main/crdPages/templates/templateCardMapper.ts` — GraphQL `Template` (profile + id + type) → `TemplateCardData`: `bannerUrl = profile.visual?.uri || undefined`, `color = pickColorFromId(template.id)` (from `@/crd/lib/pickColorFromId`), `type` mapped from the GraphQL `TemplateType` enum to the CRD string union, `ownerLabel` left undefined (set only by library/account callers).
- [ ] T005 [P] `src/main/crdPages/templates/templatesManagerMapper.ts` — GraphQL `TemplatesSet` (`calloutTemplates`, `whiteboardTemplates`, `postTemplates`, `spaceTemplates`, `communityGuidelinesTemplates`) → `TemplateCategorySection[]` in `TEMPLATE_TYPE_ORDER`, using `templateCardMapper` per template.
- [ ] T006 [P] `src/main/crdPages/templates/templateContentMapper.ts` — port the per-type content-shaping logic from `src/domain/templates/components/Previews/{TemplateContentCalloutPreview,TemplateContentWhiteboardPreview,TemplateContentPostPreview,TemplateContentSpacePreview,TemplateContentCommunityGuidelinesPreview}.tsx` as **pure functions** that take the lazy `TemplateContent` query result and a type, and return the `TemplateContent` discriminated union from `types.ts`. No React, no MUI, no Apollo.
- [ ] T007 [P] Unit tests in `src/main/crdPages/templates/__tests__/mappers.test.ts` — fixtures for each of the 5 template types exercising `templateCardMapper`, `templatesManagerMapper`, `templateContentMapper` (including the missing-banner → `bannerUrl` undefined case).

### Manager view + card

- [ ] T008 [P] `src/crd/components/templates/TemplateCard.tsx` — one template card per `contracts/templates-manager.ts` (`TemplateCardData`): type icon/badge, name, description (truncated), tags, banner (real image, else `color` gradient via the project's banner-fallback pattern — see migration guide), a kebab `dropdown-menu` whose entries are gated by the `can*`-derived flags passed in, plus an `onPreview` click on the body. WCAG: `<button>`/`<a>` for interactives, `aria-label` on the icon-only kebab.
- [ ] T009 [P] `src/crd/components/templates/TemplateSectionHeader.tsx` — per-type section header: icon, localized title + subtitle (`useTranslation('crd-templates')`), template count, optional "Create new" + "Library" (import) buttons, collapse chevron.
- [ ] T010 `src/crd/components/templates/TemplatesManagerView.tsx` — generalise `src/crd/components/space/settings/SpaceSettingsTemplatesView.tsx` to the holder-agnostic `TemplatesManagerViewProps` from `contracts/templates-manager.ts`: `holderKind`, `categories`, `loading`, `duplicatingId`/`deletingId`, the `canCreate/canEdit/canDelete/canImport` predicates, and `onCreate/onImport/onTemplateAction`. Renders one collapsible section per type using `TemplateSectionHeader` + a grid of `TemplateCard`; applies the section-visibility rule (`templates.length > 0 || canCreate(type) || canImport(type)`); empty-but-addable sections show an empty state with the available add affordance(s); inline client-side search box filters cards (visual only). Uses `lucide-react` per-row spinner when `duplicatingId`/`deletingId` matches. (Depends on T003, T008, T009.)

### Per-type previews + preview dialog

- [ ] T011 [P] `src/crd/components/templates/preview/CalloutTemplatePreview.tsx` — renders the `{ type: 'callout' }` branch of `TemplateContent`: framing kind badge, framing title, framing description (via `MarkdownContent`), framing whiteboard/memo/links/media-gallery as appropriate, allowed-contribution chips, comments-enabled indicator, default post description (via `MarkdownContent`) and default whiteboard (read-only CRD whiteboard viewer).
- [ ] T012 [P] `src/crd/components/templates/preview/WhiteboardTemplatePreview.tsx` — `{ type: 'whiteboard' }`: the drawing in the existing CRD read-only whiteboard viewer; preview-image fallback when content is empty.
- [ ] T013 [P] `src/crd/components/templates/preview/PostTemplatePreview.tsx` — `{ type: 'post' }`: the default description via `MarkdownContent`.
- [ ] T014 [P] `src/crd/components/templates/preview/SpaceTemplatePreview.tsx` — `{ type: 'space' }`: innovation-flow phase chips, the starter-callout list (name + framing-kind icon), nested subspace-template names. Reuse the CRD flow-phase chip component if one already exists in the space-page work.
- [ ] T015 [P] `src/crd/components/templates/preview/CommunityGuidelinesTemplatePreview.tsx` — `{ type: 'communityGuidelines' }`: the guidelines markdown (via `MarkdownContent`) + the references list (name → uri, optional description).
- [ ] T016 `src/crd/components/templates/TemplateContentPreview.tsx` — dispatcher: switches on `content.type` to render the matching `preview/*` component; `loading` → skeleton with `role="status"` + `aria-label`; wraps content in a `ScrollArea`. (Depends on T011–T015.)
- [ ] T017 `src/crd/components/templates/TemplatePreviewDialog.tsx` — evolve `src/crd/components/space/settings/TemplatePreviewDialog.tsx` to `contracts/template-preview.ts` `TemplatePreviewDialogProps`: header from `TemplateCardData` (available before the heavy content loads), lazy `content`, an "Edit" affordance shown only when `onEdit` is provided. (Depends on T016.)

### The reusable picker

- [ ] T018 `src/crd/components/templates/TemplatePicker.tsx` (+ `src/crd/components/templates/TemplatePickerCard.tsx`) — per `contracts/template-picker.ts`. Discriminated `mode`: `'import'` = persistent library manager (gallery, click→preview pane, "Import" adds a copy and the dialog **stays open**, templates in `alreadyInSet` are marked "in this set" and removable, admin closes when done); `'select'` = single-pick-then-apply (filter to `allowedTypes`, click→preview, confirm closes the dialog, persistent "No template / start blank" affordance to clear). Both share: source sections Space / Account / Platform (each omitted when empty; "no templates available" message when all empty), the lazy `onPreview` → `previewContent` pane (uses `TemplateContentPreview`), and `TemplatePickerCard`. (Depends on T008, T016.)
- [ ] T019 `src/main/crdPages/templates/useTemplatePicker.ts` — the picker hook every consumption flow uses (`mode: 'select'`): loads the Space / Account / Platform source lists by reusing the existing import-dialog queries (`useImportTemplateDialogQuery`, `useImportTemplateDialogAccountTemplatesQuery`, `useImportTemplateDialogPlatformTemplatesQuery`), filtered to `allowedTypes`; lazily loads template content for the preview via `useTemplateContentLazyQuery`; exposes `openPicker()`, `pickerProps: TemplatePickerSelectProps`, `selectedTemplateId`, `selectedTemplateContent`, `clearSelection()`. (Depends on T004, T006.)

### Per-type create/edit forms + the form dialog

- [ ] T020 [P] `src/crd/components/templates/forms/CalloutTemplateForm.tsx` — the heavyweight one, per `contracts/template-forms.ts` `CalloutTemplateValues`: framing-kind picker (text/whiteboard/memo/link/media-gallery) → the matching framing-content editor (whiteboard editor / `MarkdownEditor` for memo / references-list editor for links / file uploads for media gallery), allowed-contribution-type toggles, comments-enabled toggle, contribution defaults (default post description via `MarkdownEditor`, default whiteboard via the CRD whiteboard editor). Controlled (`value`/`onChange`/`errors`). Consider extracting the framing-content editor into a `CalloutFramingEditor.tsx` sub-component.
- [ ] T021 [P] `src/crd/components/templates/forms/WhiteboardTemplateForm.tsx` — `WhiteboardTemplateValues`: the CRD whiteboard editor + optional preview-image upload. Controlled.
- [ ] T022 [P] `src/crd/components/templates/forms/PostTemplateForm.tsx` — `PostTemplateValues`: `MarkdownEditor` for the default description. Controlled.
- [ ] T023 [P] `src/crd/components/templates/forms/SpaceTemplateForm.tsx` — `SpaceTemplateValues`: a "pick a space/subspace to copy" selector (URL/space picker) + "include nested subspaces" toggle + a read-only preview of the captured structure (reuse `SpaceTemplatePreview` once content is fetched). Re-selectable on edit (re-capture). Controlled.
- [ ] T024 [P] `src/crd/components/templates/forms/CommunityGuidelinesTemplateForm.tsx` — `CommunityGuidelinesTemplateValues`: `MarkdownEditor` for the guidelines text + a references-list editor (name/uri/description rows; add/remove rows). Controlled.
- [ ] T025 `src/crd/components/templates/TemplateFormDialog.tsx` — evolve `src/crd/components/space/settings/TemplateEditDialog.tsx` to `contracts/template-forms.ts` `TemplateFormDialogProps`: title from `intent` + `type`, common fields (name [required], description, tags via `tags-input`, banner upload), a slot rendering the per-type form (T020–T024) by `type`, Save (disabled + `aria-busy` while `submitting`) / Cancel; closing with unsaved changes triggers a `DiscardChangesDialog` (a `ConfirmationDialog` variant) before `onCancel`. (Depends on T003, T020–T024.)
- [ ] T026 `src/main/crdPages/templates/useTemplateForms.ts` — form state + per-type validation + the create/edit mutations: `useCreateTemplateMutation` / `useCreateTemplateFromSpaceMutation` / `useCreateTemplateFromContentSpaceMutation` / `useUpdateTemplateMutation` / `useUpdateCalloutTemplateMutation` / `useUpdateTemplateFromSpaceMutation` / `useUpdateCommunityGuidelinesMutation` / `useUpdateWhiteboardMutation`; reuse the MUI-free pure module `src/domain/templates/components/Forms/common/mappings.ts` for form→input mapping; perform image uploads via `useHandlePreviewImages` (`src/domain/templates/utils/useHandlePreviewImages.ts`) and `useUploadMediaGalleryVisuals` (`src/domain/collaboration/mediaGallery/useUploadMediaGalleryVisuals`); wrap mutations in `useTransition`. Exposes the `form` sub-state shape from `contracts/data-mapper.ts`. (Depends on T006.)

### Set-default & save-as-template dialogs

- [ ] T027 `src/crd/components/templates/SetDefaultTemplateDialog.tsx` — generalise `src/crd/components/space/settings/ChangeDefaultSubspaceTemplateDialog.tsx` to `contracts/set-default-dialog.ts` `SetDefaultTemplateDialogProps`: `purpose` (`'defaultSubspaceTemplate' | 'phaseDefaultCalloutTemplate'`), `allowedType`, current default shown selected with a clear option, internally hosts `TemplatePicker` in `mode: 'select'`, `onConfirm(templateId | null)`. (Depends on T018.)
- [ ] T028 `src/main/crdPages/templates/useSetDefaultTemplate.ts` — wraps `useUpdateTemplateDefaultMutation` (Space per-type defaults) and the innovation-flow phase-default callout-template path (the existing flow-settings mutation); exposes confirm + in-flight state. (Depends on T019.)
- [ ] T029 `src/crd/components/templates/SaveAsTemplateDialog.tsx` — generalise `src/crd/components/space/settings/SaveSubspaceAsTemplateDialog.tsx` to `contracts/set-default-dialog.ts` `SaveAsTemplateDialogProps`: name (prefilled), optional description, "include nested subspaces" toggle when `allowRecursive`, destination-set label, `onConfirm({ name, description, recursive })`.
- [ ] T030 `src/main/crdPages/templates/useSaveAsTemplate.ts` — wraps `useCreateTemplateFromSpaceMutation` / `useCreateTemplateFromContentSpaceMutation`; exposes confirm + in-flight state + refetch of the destination set.

### The holder-agnostic integration hook

- [ ] T031 `src/main/crdPages/templates/useTemplatesManager.ts` — generalise `src/main/crdPages/topLevelPages/spaceSettings/templates/useTemplatesTabData.ts` to the `UseTemplatesManager` shape in `contracts/data-mapper.ts`: takes `{ templatesSetId, holderKind, accountId? }`; runs `useAllTemplatesInTemplatesSetQuery`; produces `categories` via `templatesManagerMapper`; owns the **preview** state (lazy `useTemplateContentLazyQuery` → `templateContentMapper`), the **form** lifecycle (delegating to `useTemplateForms` — closes the existing `onCreateTemplate` TODO), **duplicate** (`useCreateTemplateMutation`/`...FromContentSpace`), **delete** (`useDeleteTemplateMutation` + `ConfirmationDialog`-driven `pendingDelete` + optimistic cache eviction + `isUsedAsDefault` flag from the holder's `templateDefaults`), and the **import** picker (`mode: 'import'`, Space holder only — reuses the same source loaders as `useTemplatePicker` + `useCreateTemplateMutation`/`...FromContentSpace` to import + a `ConfirmationDialog`-gated remove-from-set). Mutations in `useTransition`. (Depends on T005, T006, T017, T018, T019, T025, T026.)
- [ ] T032 [P] Unit tests in `src/main/crdPages/templates/__tests__/` for `useTemplatePicker` (source loading + `allowedTypes` filtering) and `useTemplatesManager` (delete confirmation + the post-delete default-clear path FR-019). (Depends on T019, T031.)

**Checkpoint**: the complete CRD templates kit exists and is unit-tested. All user-story phases can now proceed; US1, US2 and US3 (the P1 set / MVP) can run in parallel from here, as can US4–US8.

---

## Phase 3: User Story 1 — Manage a Space's templates (Priority: P1) 🎯 MVP

**Goal**: a Space admin opens Space Settings → Templates and can preview / create / edit / duplicate / delete / import every template type, and set the default subspace template — all in CRD.

**Independent Test**: toggle CRD on, open a space's Settings → Templates as an admin; create a template of each type, edit it, duplicate it, preview it, delete it (confirming the dialog), import one from the library; set the default subspace template; verify each action persists and the section list updates.

- [ ] T033 [US1] Refactor `src/main/crdPages/topLevelPages/spaceSettings/templates/useTemplatesTabData.ts` to a thin adapter over `useTemplatesManager({ holderKind: 'space', templatesSetId, accountId })` (resolving `templatesSetId` via `useSpaceTemplatesManagerQuery` as today) + `useSetDefaultTemplate` (default subspace template, reading the current default from `templatesManager.templateDefaults`) + expose `useSaveAsTemplate` for the Subspaces tab; remove the local `onCreateTemplate` TODO and the now-duplicated delete/duplicate logic. Keep the public hook shape `045`'s tab expects (or update the tab in T034). (Depends on T031, T028, T030.)
- [ ] T034 [US1] Replace `src/crd/components/space/settings/SpaceSettingsTemplatesView.tsx` with a thin wrapper that renders `<TemplatesManagerView holderKind="space" .../>` from the refactored hook (or delete it and have `045`'s Templates-tab component render `TemplatesManagerView` directly), wiring `canCreate/canEdit/canDelete` from the space's template privileges and `canImport` similarly; render the default-subspace-template card (the existing `045` placement) using `SetDefaultTemplateDialog`. (Depends on T010, T027, T033.)
- [ ] T035 [US1] Remove the superseded `045`-era CRD dialogs and re-point imports: `src/crd/components/space/settings/TemplateLibraryDialog.tsx` → `templates/TemplatePicker.tsx` (`mode: 'import'`), `TemplateEditDialog.tsx` → `templates/TemplateFormDialog.tsx`, `SaveSubspaceAsTemplateDialog.tsx` → `templates/SaveAsTemplateDialog.tsx`, `ChangeDefaultSubspaceTemplateDialog.tsx` → `templates/SetDefaultTemplateDialog.tsx`; move `TemplatePreviewDialog.tsx` usages to `templates/TemplatePreviewDialog.tsx`. Update every importer (CRD components and `crdPages` hooks). Delete `useTemplateActions.ts` / `useTemplateLibrary.ts` / `templatesMapper.ts` under `topLevelPages/spaceSettings/templates/` once nothing imports them (or leave temporary re-exports, removed in T090). (Depends on T034.)
- [ ] T036 [US1] Implement the FR-019 deletion behaviour: when `pendingDelete.isUsedAsDefault`, the `ConfirmationDialog` copy notes "this template is currently used as a default and will be unset"; after a successful delete, issue `updateTemplateDefault(template: null)` for every `templateDefault` that referenced it (or confirm the backend cascade handles it — verify against the existing `deleteTemplate` mutation behaviour). (Depends on T031.)
- [ ] T037 [US1] Add the `crd-templates` i18n keys used by the Space Settings → Templates surface (section titles/subtitles per type, the kebab actions, the create/import buttons, the form dialog titles/labels/validation, the preview dialog, the picker labels, the set-default and save-as dialogs, the delete-confirmation copy incl. the "used as default" note) to `templates.en.json` and the 5 other-language files (AI-assisted nl/es/bg/de/fr).

**Checkpoint**: Space Settings → Templates is fully functional in CRD; the `045`-era partial implementation is removed and the tab consumes the shared kit.

---

## Phase 4: User Story 2 — Manage an Innovation Pack's templates (unified holder experience) (Priority: P1)

**Goal**: managing a pack's templates uses the **same** surface, cards and dialogs as US1 — Preview / Create / Edit / Duplicate / Delete — with no Import affordance (Space-only) and preview-before-edit (the legacy "jump to Edit" is gone), gated only by authorisation.

**Independent Test**: toggle CRD on, open an Innovation Pack's admin screen; verify the templates area is visually/behaviourally identical to the Space Settings → Templates tab except no "Library/Import" button; clicking a template opens a Preview first (not Edit); create/edit/duplicate/delete work through the same dialogs; actions hidden when the user lacks the privilege.

- [ ] T040 [US2] `src/main/crdPages/innovationPack/innovationPackMapper.ts` — minimal mappers: GraphQL `InnovationPack` → `{ id, templatesSetId, profile basics, canManage flags }` (extended later in US7). (Depends on T004.)
- [ ] T041 [US2] `src/main/crdPages/innovationPack/useInnovationPackAdmin.ts` — resolve the pack id (via `useUrlResolver` or the route param), run `useAdminInnovationPackQuery`, derive `templatesSetId`, and call `useTemplatesManager({ holderKind: 'innovationPack', templatesSetId })`; surface the templates-manager props (the pack-details form & delete-pack come in US7). (Depends on T031, T040.)
- [ ] T042 [US2] `src/main/crdPages/innovationPack/CrdInnovationPackAdminPage.tsx` — page shell (CRD layout) hosting `<TemplatesManagerView holderKind="innovationPack" canImport={() => false} .../>` plus the shared preview / form / delete-confirm dialogs from `useInnovationPackAdmin`. Wire `canCreate/canEdit/canDelete` from the pack's template privileges (no holder-kind gating — FR-014). (Depends on T010, T041.)
- [ ] T043 [US2] Toggle-gate the route in `src/domain/platformAdmin/domain/innovationPacks/AdminInnovationPackRoutes.tsx` (and the account-area pack-admin entry point): render `CrdInnovationPackAdminPage` when `useCrdEnabled()` is true, otherwise the existing MUI `AdminInnovationPackPage` — lazy-loaded, only one chunk fetched. Wrap the CRD page in `CrdLayoutWrapper` if not already wrapped by the admin shell.
- [ ] T044 [US2] Add the `crd-templates` i18n keys specific to the pack templates surface (any that differ from US1 — e.g. a holder-kind-specific subtitle) to all 6 language files.

**Checkpoint**: a pack admin manages templates through the identical CRD surface; the two holders are unified (Import-Space-only being the sole intentional difference).

---

## Phase 5: User Story 3 — Use a template when creating a Callout (Priority: P1)

**Goal**: from the CRD callout-creation surface, "use a template" opens the CRD picker (Callout templates, Space/Account/Platform sources, preview before selection); selecting pre-fills the creation form; clearing returns it to blank.

**Independent Test**: toggle CRD on, open the CRD callout-creation dialog in a space, click "use a template", verify the picker shows Space/Account/Platform sections (each hidden when empty), preview a callout template, select it, confirm the form is pre-filled (framing kind+content, allowed contributions, comment settings, default post description, default whiteboard); clear the selection and confirm the form returns to blank.

- [ ] T046 [US3] In `src/main/crdPages/space/callout/TemplateImportConnector.tsx` (and the CRD callout-creation form it feeds), replace the existing template-import wiring with `useTemplatePicker({ allowedTypes: ['callout'], spaceTemplatesSetId, accountId })`; on select, take `selectedTemplateContent` (the `{ type: 'callout' }` branch) and pre-fill the callout-creation form; on `clearSelection()`, reset the form to an empty callout. Render `<TemplatePicker mode="select" {...pickerProps} />`. (Depends on T018, T019.)
- [ ] T047 [US3] Verify/handle the picker's edge cases in this host: empty source sections omitted; "no templates available" message when all sources are empty; the picker doesn't resize the dialog when the preview pane opens (overlay/scroll). (Depends on T046.)
- [ ] T048 [US3] Add the `crd-templates` i18n keys for the callout-creation picker entry point ("Use a template", "No template / start blank", source-section labels reused from the shared set) to all 6 language files.
- [ ] T049 [US3] Unit/integration test in `src/main/crdPages/space/callout/__tests__/` — selecting a callout template produces the expected pre-filled form values (via the connector + `templateContentMapper`). (Depends on T046.)

**Checkpoint**: MVP (US1 + US3) complete — a Space admin manages templates, and a creator uses callout templates, entirely in CRD.

---

## Phase 6: User Story 4 — Use a template when creating a Space or Subspace (Priority: P2)

**Goal**: the CRD create-space / create-subspace flow offers a Space (content) template selector (incl. "Empty"), with a preview of phases & starter callouts; subspace creation pre-selects the parent's default subspace template; changing the selection over unsaved data is confirmed; and a Space admin can save a subspace as a Space template.

**Independent Test**: toggle CRD on, run the CRD create-space and create-subspace flows; confirm a Space-template selector with an "Empty" option and a preview of phases/callouts; confirm the default subspace template is pre-selected when creating a subspace; confirm changing the template with unsaved form data prompts a confirmation; create a (sub)space from a template and from "Empty"; from a subspace's overflow menu choose "Save as template" and confirm a new Space template is created.

- [ ] T051 [US4] In the CRD create-space flow and `src/crd/components/space/settings/CreateSubspaceDialog.tsx` (+ its integration hook under `src/main/crdPages/`), add a Space-template selector via `useTemplatePicker({ allowedTypes: ['space'], spaceTemplatesSetId, accountId })` with an explicit "Empty / from scratch" option; show a preview of the selected template's phases + starter callouts (+ nested subspace templates) using `SpaceTemplatePreview`. (Depends on T018, T019, T014.)
- [ ] T052 [US4] When creating a *subspace*, pre-select the parent space's configured default subspace template (read from `templatesManager.templateDefaults`); when the creation form already holds user-entered data and the user changes the selected template, show a `ConfirmationDialog` before overwriting (cancel keeps data + selection). (Depends on T051.)
- [ ] T053 [US4] Create the (sub)space from the selected template (or empty) — wire the chosen template id (or none) into the existing create-space / create-subspace mutations. (Depends on T051.)
- [ ] T054 [US4] Wire "Save as template" in `045`'s Subspaces tab (the subspace overflow menu and/or the tab action) and its integration hook (`src/main/crdPages/topLevelPages/spaceSettings/subspaces/`) to `SaveAsTemplateDialog` + `useSaveAsTemplate` (exposed via T033). (Depends on T029, T030, T033.)
- [ ] T055 [US4] Add the `crd-templates` i18n keys for the space/subspace creation selector ("Empty / start from scratch", the overwrite-confirmation copy) and the save-as-template flow to all 6 language files.

**Checkpoint**: space/subspace creation from a template works in CRD, with defaults, the overwrite guard, and save-as-template.

---

## Phase 7: User Story 5 — Use a template in the remaining creation flows (Priority: P2)

**Goal**: whiteboard creation, community-guidelines editing, innovation-flow phase default, and callout contribution-defaults post template all use the CRD picker; the guidelines replacement is confirmation-guarded.

**Independent Test**: toggle CRD on; for each flow — add a whiteboard, edit community guidelines, set a phase's default callout template, set a callout's default post template — open the CRD picker, preview a candidate, apply it, confirm the target reflects the template; for the guidelines flow, confirm the replacement is guarded by a confirmation.

- [ ] T057 [US5] Whiteboard creation: in the CRD whiteboard-add flow (inside a callout / standalone), wire `useTemplatePicker({ allowedTypes: ['whiteboard'], spaceTemplatesSetId, accountId })`; on select, open the new whiteboard from the template's drawing; `clearSelection()` → blank. (Depends on T018, T019.)
- [ ] T058 [US5] Community guidelines: in `045`'s Community-tab guidelines editor + its integration hook, wire `useTemplatePicker({ allowedTypes: ['communityGuidelines'], spaceTemplatesSetId, accountId })`; on select, replace the guidelines text + references with the template's, behind a `ConfirmationDialog` when there is existing content — porting the logic from `src/domain/community/community/CommunityGuidelines/useCommunityGuidelines.ts` (`onSelectCommunityGuidelinesTemplate`) into the CRD integration layer (no MUI). (Depends on T018, T019.)
- [ ] T059 [US5] Innovation-flow phase default: in `045`'s Layout-tab per-column overflow menu (or the CRD innovation-flow settings surface), wire the "Default callout template for this phase" entry to `SetDefaultTemplateDialog` (`purpose: 'phaseDefaultCalloutTemplate'`, `allowedType: 'callout'`) + `useSetDefaultTemplate`; support clearing it. (Depends on T027, T028.)
- [ ] T060 [US5] Post default description: in the CRD callout contribution-defaults settings, wire `useTemplatePicker({ allowedTypes: ['post'], spaceTemplatesSetId, accountId })`; on select, set the callout's default post description to the template's default description. (Depends on T018, T019.)
- [ ] T061 [US5] Add the `crd-templates` i18n keys for these four surfaces (the guidelines-replacement confirmation copy, the phase-default labels, the whiteboard/post picker entry points) to all 6 language files.

**Checkpoint**: every template-consumption flow whose host is already CRD uses the CRD picker; hosts not yet CRD keep the legacy picker (FR-037) — list them explicitly in the PR.

---

## Phase 8: User Story 6 — Browse the Innovation Library (Priority: P2)

**Goal**: `/innovation-library` rebuilt in CRD — an Innovation Packs section + a type-filterable gallery of all platform templates, with preview — viewable signed-out.

**Independent Test**: toggle CRD on, open `/innovation-library` while signed out; confirm an Innovation Packs section and a templates gallery; filter the gallery by type and confirm the list updates; preview a template; click a pack and confirm navigation to its profile page; confirm an empty state (not an error) when there are no listed packs/templates.

- [ ] T063 [P] [US6] `src/crd/components/innovationLibrary/TemplateTypeFilter.tsx` — per `contracts/innovation-library.ts` `TemplateTypeFilterProps`: type-filter chips/segmented control with optional per-type counts; desktop + mobile variants (matching the prototype's `TemplateTypeFilter` / `TemplateTypeFilterMobile`).
- [ ] T064 [P] [US6] `src/crd/components/innovationLibrary/TemplateGallery.tsx` — per `TemplateGalleryProps`: a responsive grid of `TemplateCard` (already type-filtered by the consumer), loading skeletons, `emptyLabel` empty state, `onPreview` per card.
- [ ] T065 [P] [US6] `src/crd/components/innovationPack/InnovationPackCard.tsx` — per `contracts/innovation-pack.ts` `InnovationPackCardData`: banner (real or `color` gradient), provider avatar+name, name, description, tags, template count, links to `url`. (Used by US6 and US8.)
- [ ] T066 [US6] `src/crd/components/innovationLibrary/InnovationLibraryView.tsx` — per `InnovationLibraryViewProps`: an Innovation Packs section (grid of `InnovationPackCard`), the `TemplateGallery` with `TemplateTypeFilter`, and a preview surface (reuse `TemplatePreviewDialog`/`TemplateContentPreview`). From `prototype/src/app/components/template-library/TemplateLibrary.tsx`. (Depends on T063, T064, T065, T017.)
- [ ] T067 [US6] `src/main/crdPages/innovationLibrary/innovationLibraryMapper.ts` + `useInnovationLibrary.ts` — `useInnovationLibraryQuery` (`platform.library.templates` + `.innovationPacks`); map to `InnovationLibraryViewProps.{packs,templates}` (`ownerLabel` = owning pack display name; `color` via `pickColorFromId`); client-side type filter (mirror legacy single-fetch + filter); lazy preview content via `useTemplateContentLazyQuery` + `templateContentMapper`. (Depends on T004, T006, T040.)
- [ ] T068 [US6] `src/main/crdPages/innovationLibrary/CrdInnovationLibraryPage.tsx` — route entry composing `useInnovationLibrary` + `InnovationLibraryView` + the preview dialog. (Depends on T066, T067.)
- [ ] T069 [US6] Toggle-gate `/innovation-library` in `src/main/routing/TopLevelRoutes.tsx`: add `CrdInnovationLibraryPage` (lazy, wrapped in `CrdLayoutWrapper`) vs. the existing `MuiInnovationLibraryPage` (`src/main/topLevelPages/InnovationLibraryPage/`), conditional on `crdEnabled`; ensure anonymous access (the route is not behind an identity gate). 
- [ ] T070 [US6] Add the `crd-templates` i18n keys for the Library page (section titles, filter labels, gallery empty state) to all 6 language files.

**Checkpoint**: the Innovation Library is browsable in CRD, signed-out, with type filtering and preview.

---

## Phase 9: User Story 7 — Create and edit an Innovation Pack (Priority: P3)

**Goal**: an authorised user creates a new Innovation Pack (name/description/avatar/tags/references/provider org/store-listing/search-visibility), edits it later, and deletes it (confirmed); after creating, lands on its admin screen.

**Independent Test**: toggle CRD on as a platform admin; create a new Innovation Pack with all its fields; confirm it appears in the packs list and its admin screen opens; edit its details and confirm they persist; delete it via the confirmation dialog and confirm it is removed; confirm a non-authorised user sees no create/edit/delete affordances.

- [ ] T072 [P] [US7] `src/crd/components/innovationPack/InnovationPackForm.tsx` — per `contracts/innovation-pack.ts` `InnovationPackFormProps`: name [required], description, avatar upload, tags (`tags-input`), references-list editor, provider-organisation `Select` (shown only when `providerSelectable`), `listedInStore` `Switch`, `searchVisibility` `Select`; controlled; inline validation. 
- [ ] T073 [P] [US7] `src/crd/components/innovationPack/CreateInnovationPackDialog.tsx` — per `CreateInnovationPackDialogProps`: a dialog wrapping the subset of `InnovationPackForm` needed to create a pack, with a Create button (`aria-busy` while `creating`).
- [ ] T074 [US7] `src/crd/components/innovationPack/InnovationPackAdminView.tsx` — per `InnovationPackAdminViewProps`: composes `InnovationPackForm` + the `TemplatesManagerViewProps` block (US2's `CrdInnovationPackAdminPage` renders this view instead of `TemplatesManagerView` directly) + a "Delete pack" action (routes through `ConfirmationDialog variant="destructive"`). Update `CrdInnovationPackAdminPage` (T042) to render `InnovationPackAdminView`. (Depends on T042, T072.)
- [ ] T075 [US7] Extend `src/main/crdPages/innovationPack/`: `useInnovationPackAdmin.ts` gains `useUpdateInnovationPackMutation` + `useDeleteInnovationPackMutation`; new `useCreateInnovationPack.ts` (`useCreateInnovationPackOnAccountMutation` for account-owned packs; the platform-admin create path as in the legacy `CreateInnovationPackDialog`); `innovationPackMapper.ts` extended to `InnovationPackFormValues` ⇄ mutation inputs and `InnovationPackCardData`. `providerSelectable` = true for platform packs, false (fixed to the account host org) for account packs. Mutations in `useTransition`. (Depends on T040, T041.)
- [ ] T076 [US7] Wire create-pack from the platform-admin packs list and the account area to `CreateInnovationPackDialog` + `useCreateInnovationPack`; on success, navigate to `CrdInnovationPackAdminPage` for the new pack. Wire delete-pack from `InnovationPackAdminView` through `ConfirmationDialog`. Toggle-gate the create entry points alongside the admin route from T043. (Depends on T073, T074, T075.)
- [ ] T077 [US7] Add the `crd-templates` i18n keys for the pack form / create dialog / delete confirmation / search-visibility options to all 6 language files.

**Checkpoint**: Innovation Pack create/edit/delete works in CRD; the pack admin screen shows the details form + the templates manager together.

---

## Phase 10: User Story 8 — Innovation Pack public profile page (Priority: P3)

**Goal**: an Innovation Pack's public URL renders its profile in CRD (name/description/avatar/banner/provider/tags/references) + its templates by type with read-only preview; pack admins see an entry point to the admin screen; viewable signed-out.

**Independent Test**: toggle CRD on, open a pack's public URL while signed out; confirm the pack profile and its templates by type; preview a template; as a pack admin confirm a link to the admin screen is shown; as a non-admin confirm it is not.

- [ ] T079 [US8] `src/crd/components/innovationPack/InnovationPackProfileView.tsx` — per `InnovationPackProfileViewProps`: a hero (avatar/banner via `color` fallback, name, description), a provider card (avatar/name → `providerUrl`), tags, a references list, a read-only `TemplatesManagerView` (all `can*` predicates `false`; `onTemplateAction` restricted to `'preview'`), a `ShareButton` (`shareUrl`), and a "Manage this pack" entry (`adminHref`) shown only when `canManage`. (Depends on T010, T065.)
- [ ] T080 [US8] `src/main/crdPages/innovationPack/useInnovationPackProfile.ts` + `CrdInnovationPackProfilePage.tsx` — `useInnovationPackProfilePageQuery` for the profile + `useTemplatesManager({ holderKind: 'innovationPack', templatesSetId })` for the read-only templates listing + the preview dialog; resolve `canManage`/`adminHref` from the query's authorisation; compose `InnovationPackProfileView`. (Depends on T031, T079, T040.)
- [ ] T081 [US8] Toggle-gate the pack public profile route in `src/main/routing/TopLevelRoutes.tsx` (or wherever `InnovationPackRoute` is mounted): `CrdInnovationPackProfilePage` (lazy, wrapped in `CrdLayoutWrapper`) vs. the existing MUI `InnovationPackRoute`/`InnovationPackProfilePage`, conditional on `crdEnabled`; ensure anonymous access.
- [ ] T082 [US8] Add the `crd-templates` i18n keys for the pack profile page (provider card label, references label, "Manage this pack", share) to all 6 language files.

**Checkpoint**: all eight user stories delivered in CRD behind the toggle.

---

## Phase 11: Polish & Cross-Cutting Concerns

- [ ] T084 [P] Full 6-language audit of `src/crd/i18n/templates/templates.{en,nl,es,bg,de,fr}.json`: every key used in code exists in all 6 files; no orphan keys; AI-assisted translations for nl/es/bg/de/fr reviewed for placeholder/tag correctness; `<b>`/`<br/>`-style tags (if any) rendered via `<Trans>` not `t()` (CLAUDE.md Rule 10).
- [ ] T085 [P] Accessibility sweep (WCAG 2.1 AA, SC-007) across every new CRD templates surface — keyboard operability + visible `focus-visible` rings, `aria-label` on icon-only buttons, `aria-hidden` decorative icons, `role="status"`/`aria-label` on loading skeletons, `<ul>`/`<li>` for card grids, `aria-busy`+`disabled` on submitting buttons, 4.5:1 contrast; run the automated a11y check; keyboard-only walkthrough of create-a-template / pick-a-template / delete-a-template.
- [ ] T086 [P] Verify zero `@mui/*` / `@emotion/*` in the loaded bundles for the CRD templates routes & dialogs (SC-004) — `pnpm analyze` + an import grep over `src/crd/components/{templates,innovationPack,innovationLibrary}/` and `src/main/crdPages/{templates,innovationPack,innovationLibrary}/`.
- [ ] T087 [P] Verify toggle-off (SC-006): with `alkemio-crd-enabled` removed, every templates surface (Space Settings → Templates, the pack admin, the pack profile, `/innovation-library`, and every consumption flow) renders the exact legacy MUI experience with no residual state.
- [ ] T088 [P] Standalone preview: add mock pages under `src/crd/app/pages/` for `TemplatesManagerView`, `TemplatePicker` (both modes), `TemplatePreviewDialog`, `InnovationLibraryView`, `InnovationPackProfileView` and `InnovationPackAdminView`, fed by mock data adapted from `prototype/src/app/data/template-data.ts`, so designers can iterate via `pnpm crd:dev` with no backend.
- [ ] T089 [P] Additional unit tests: `templateContentMapper` per-type fixtures (callout-with-each-framing-kind, space-with-nested-subspaces, guidelines-with-references), `innovationLibraryMapper` (`ownerLabel`), `innovationPackMapper` (form ⇄ input round-trip).
- [ ] T090 Remove the temporary `045`-era compatibility re-exports under `src/main/crdPages/topLevelPages/spaceSettings/templates/` and `src/crd/components/space/settings/` once nothing imports them; run `pnpm lint` and `pnpm vitest run`; update `quickstart.md`'s verification checklist with results.
- [ ] T091 Assemble the PR evidence pack: screenshots of each new CRD surface, the a11y check output, the bundle/import check, and the **SC-002 parity checklist** — every legacy MUI template-picking flow mapped to its CRD equivalent, with each "host surface not yet CRD" transitional fallback explicitly listed (per FR-037 / SC-002).

---

## Dependencies & Execution Order

- **Phase 1 (Setup, T001–T003)** → no dependencies; all three are `[P]`.
- **Phase 2 (Foundational, T004–T032)** → depends on Phase 1. Internal order: mappers (T004–T007 `[P]`) → manager view (T008–T009 `[P]`, then T010) → previews (T011–T015 `[P]`, then T016, then T017) → picker (T018 needs T008+T016; then T019 needs T006) → forms (T020–T024 `[P]`, then T025 needs them; T026 needs T006) → set-default/save-as (T027 needs T018; T028 needs T019; T029; T030) → T031 needs T005, T006, T017, T018, T019, T025, T026 → T032 needs T019, T031. **No user-story phase may start until Phase 2 is complete.**
- **Phase 3 (US1)** depends on Phase 2 (T031, T028, T030, T010, T027).
- **Phase 4 (US2)** depends on Phase 2 (T031, T010); independent of US1, US3.
- **Phase 5 (US3)** depends on Phase 2 (T018, T019); independent of US1, US2.
- **Phase 6 (US4)** depends on Phase 2 (T018, T019, T014, T029, T030) and — for T054's wiring — on US1's T033 (which exposes `useSaveAsTemplate` to the Subspaces tab).
- **Phase 7 (US5)** depends on Phase 2 (T018, T019, T027, T028); independent of US1–US4 except shared `045` files.
- **Phase 8 (US6)** depends on Phase 2 (T017); T063/T064/T065 are `[P]`; independent of US1–US5, US7, US8 (T065's `InnovationPackCard` is reused by US8).
- **Phase 9 (US7)** depends on Phase 2 and on **US2's T042** (it extends `CrdInnovationPackAdminPage`/`useInnovationPackAdmin`); T072/T073 are `[P]`.
- **Phase 10 (US8)** depends on Phase 2 (T031, T010) and on **US6's T065** (`InnovationPackCard`).
- **Phase 11 (Polish)** depends on all user-story phases; T084–T089 are `[P]`; T090–T091 last.

**Parallelisable across teams once Phase 2 is done**: US1 ∥ US2 ∥ US3 ∥ US4 ∥ US5 ∥ US6; US7 after US2; US8 after US6.

---

## Parallel Execution Examples

- **Phase 1**: T001, T002, T003 together.
- **Phase 2 — mappers wave**: T004, T005, T006, T007 together. **previews wave**: T011, T012, T013, T014, T015 together (then T016). **forms wave**: T020, T021, T022, T023, T024 together (then T025).
- **Phase 8 (US6)**: T063, T064, T065 together (then T066).
- **Phase 9 (US7)**: T072, T073 together.
- **Phase 11**: T084, T085, T086, T087, T088, T089 together (then T090, T091).

---

## Implementation Strategy

1. **Setup + Foundational first.** Phases 1–2 are the bulk of the engineering effort and the blocking prerequisite — build the complete CRD templates kit (manager view, card, picker, previews, forms, the two dialogs, the shared hooks & mappers) and unit-test the mappers/hooks before touching any consuming surface.
2. **Ship the MVP: US1 + US3.** Once Phase 2 is done, wire the kit into the Space Settings → Templates tab (US1, also removing the `045`-era partial implementation) and into the CRD callout-creation flow (US3). That alone is a coherent, demoable slice — a Space admin manages templates; a creator uses callout templates.
3. **Then US2** — point the kit at the Innovation Pack admin (a route + a page shell + the same `useTemplatesManager` with `holderKind='innovationPack'`). This proves the holder unification with almost no new code.
4. **Then the P2 batch** — US4 (space/subspace creation + defaults + save-as), US5 (whiteboard / guidelines / phase default / post default), US6 (Innovation Library page). These are mostly picker-wiring + one new page; can run in parallel.
5. **Then the P3 batch** — US7 (pack create/edit/delete — extends US2's admin page) and US8 (pack public profile — reuses US6's pack card).
6. **Polish last** — full 6-language i18n audit, a11y sweep, bundle/no-MUI check, toggle-off verification, standalone-preview mock pages, extra unit tests, cleanup of compatibility shims, PR evidence pack (incl. the SC-002 parity checklist with any "host not yet CRD" fallbacks listed).

Throughout: legacy MUI templates files (`src/domain/{templates,templates-manager,InnovationPack,spaceAdmin/SpaceAdminTemplates}/`, `src/main/topLevelPages/InnovationLibraryPage/`) stay untouched and serve toggle-off; CRD layer rules (no MUI/Apollo/router/formik/`@/domain` in `src/crd/`; plain-TS props; callbacks for behaviour; `pickColorFromId` only in mappers; markdown via `MarkdownContent`/`InlineMarkdown`; `date-fns` not `dayjs`; no `useMemo`/`useCallback`/`React.memo`) apply to every new file.
