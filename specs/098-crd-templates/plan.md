# Implementation Plan: CRD Templates System

**Branch**: `098-crd-templates` | **Date**: 2026-05-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/098-crd-templates/spec.md`

## Summary

Re-implement the entire Templates system on the CRD design system (shadcn/ui + Tailwind), behind the existing `alkemio-crd-enabled` toggle (default OFF), following the same parallel-design-system pattern used by 039 / 041 / 042 / 043 / 045 / 096. The Apollo data layer is **untouched** — every CRD surface gets its data from the existing generated hooks, and thin **data mappers** under `src/main/crdPages/` bridge GraphQL shapes to plain-TS CRD component props.

The work has one structural keystone: a **holder-agnostic templates-management view** (`TemplatesManagerView`) that renders a holder's templates grouped into one section per type (Space, Collaboration tools / Callout, Whiteboard, Post, Community Guidelines) with per-type Create / Import / Preview / Edit / Duplicate / Delete actions. The *same* view, cards and dialogs serve **both** template holders — a Space's templates set (Space Settings → Templates tab) and an Innovation Pack's templates set (the pack admin screen) — and the read-only listing on a pack's public profile. Action availability is driven only by authorisation; the one intentional contextual difference is that **Import-from-library is offered for a Space holder only** (a pack is a template source, not a sink — per the clarification). The legacy holder quirks (packs jumping straight to Edit; packs having no Import; packs hard-coding "all 5 types creatable") are removed.

Around that keystone, this feature delivers: the reusable **template picker** (two modes — *import-into-Space* = persistent library manager; *consumption* = single-pick-then-apply — sources grouped Space / Account / Platform, empty sections omitted, preview before selection); the **per-type template preview** (callout framing & contribution defaults / whiteboard drawing / post description / space phases & starter callouts / guidelines text & references); the **per-type create/edit forms** (the Callout framing editor being the heavyweight one; Whiteboard reuses the CRD whiteboard editor; Post reuses the CRD markdown editor; Space is authored by copying an existing space/subspace; Community Guidelines is text + references); the **Innovation Pack** admin (pack-details form + the templates-manager view) and **public profile page**; the **Innovation Library** page (`/innovation-library` — an Innovation Packs section + a type-filterable gallery of all platform templates); and the **picker wiring** into every consumption flow (callout creation — already CRD; whiteboard creation; space/subspace creation + default subspace template + save-subspace-as-template; community guidelines; innovation-flow phase default callout template; callout contribution-defaults post template). New i18n namespace: `crd-templates`.

**Relationship to in-flight CRD work.** Spec `045-crd-space-settings` already shipped a partial CRD Templates tab (`src/crd/components/space/settings/SpaceSettingsTemplatesView.tsx`, `TemplateLibraryDialog.tsx`, `TemplateEditDialog.tsx`, `TemplatePreviewDialog.tsx`, `SaveSubspaceAsTemplateDialog.tsx`, `ChangeDefaultSubspaceTemplateDialog.tsx`, and hooks under `src/main/crdPages/topLevelPages/spaceSettings/templates/`). This feature **owns and supersedes** those: the section-list view is *generalised and relocated* to a holder-agnostic `src/crd/components/templates/TemplatesManagerView.tsx`; the dialogs are evolved (the Edit dialog gains per-type content forms; the Library dialog becomes the persistent library manager / picker); `045`'s Templates tab is reduced to a thin consumer of the new components. `045`'s Layout-tab *per-phase default callout template* and Subspaces-tab *default subspace template* + *save-subspace-as-template* affordances stay in `045`'s scope but consume this feature's `TemplatePicker` / `SaveAsTemplateDialog`. The account-templates-in-picker behaviour from spec `041` is realised by the new picker's Account source section (no extension of the MUI dialog). Gated behind the existing `alkemio-crd-enabled` localStorage toggle; legacy MUI templates surfaces (`src/domain/templates/*`, `src/domain/templates-manager/*`, `src/domain/InnovationPack/*`, `src/domain/spaceAdmin/SpaceAdminTemplates/*`, `src/main/topLevelPages/InnovationLibraryPage/*`) stay intact and serve toggle-off.

**Design references (prototype, read-only):** `prototype/src/app/components/space/SpaceSettingsTemplates.tsx` (Templates tab), `prototype/src/app/components/template-library/{TemplateLibrary,TemplatePackDetail,TemplateDetail}.tsx` and `prototype/src/app/pages/{TemplateLibraryPage,TemplatePackDetailPage,TemplateDetailPage,TemplateSettingsPage}.tsx` (Library / pack profile / template detail / pack admin), `prototype/src/app/data/template-data.ts` (mock shapes).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), class-variance-authority, lucide-react, Apollo Client, react-i18next, react-router-dom (only the integration layer touches it), date-fns (CRD/crdPages date layer) — all existing; **no new runtime dependencies**. Whiteboard editing inside template forms reuses the existing CRD whiteboard editor (which itself wraps the Excalidraw stack already in `package.json`).
**Storage**: localStorage (`alkemio-crd-enabled`) for the CRD toggle (existing). GraphQL data layer unchanged.
**Testing**: Vitest with jsdom (`pnpm vitest run`); component-prop mappers and picker/holder hooks get unit coverage.
**Target Platform**: Web SPA (Vite dev server on `localhost:3001`; standalone CRD preview on `localhost:5200`).
**Project Type**: Web application (frontend only — no backend changes).
**Performance Goals**: template preview content (incl. large whiteboard drawings / deep space trees) loads without blocking paint (Suspense / lazy queries) — first interactive under typical conditions; picker open → first card render under 200 ms with already-fetched data; no Innovation Library bundle penalty (lazy-loaded route chunk, same as other CRD pages).
**Constraints**: Zero MUI / Emotion imports anywhere in `src/crd/` or `src/main/crdPages/`; CRD components receive plain-TS props (never generated GraphQL types) and behaviour as callbacks (never `useNavigate` / `window.location` / Apollo inside `src/crd/`); every destructive action goes through the CRD `ConfirmationDialog`; parity with the MUI templates system on every action (no regression); the holder-management view, cards and dialogs are *identical* across the two holder kinds (only the Space-only Import affordance differs); reuse — not re-create — existing CRD assets (`ConfirmationDialog`, `MarkdownEditor`, `MarkdownContent`/`InlineMarkdown`, `tags-input`, the CRD whiteboard editor, `ShareDialog`/`ShareButton`, `pickColorFromId`, the CRD layout/page shells).
**Scale/Scope**: 1 holder-agnostic templates-management view + ~6 supporting CRD components (card, picker, preview dispatcher + 5 per-type previews, ~5 per-type create/edit forms, set-default dialog, save-as-template dialog) + 1 Innovation Pack admin view + 1 Innovation Pack profile view + 1 pack-details form + 1 pack card + 1 create-pack dialog + 1 Innovation Library view + gallery + type filter ≈ **~30 new/relocated CRD components**; ~7 consumption-flow wirings; 1 new i18n namespace (`crd-templates`); ~3 new route blocks (`/innovation-library`, pack public profile, pack admin) added to `TopLevelRoutes.tsx` / the relevant admin route trees, toggle-gated; ~25 existing Apollo operations reused (`useAllTemplatesInTemplatesSetQuery`, `useSpaceTemplatesManagerQuery`, `useTemplateContentLazyQuery`, `useCreateTemplateMutation`, `useCreateTemplateFromSpaceMutation`, `useCreateTemplateFromContentSpaceMutation`, `useUpdateTemplateMutation`, `useUpdateCalloutTemplateMutation`, `useUpdateTemplateFromSpaceMutation`, `useUpdateCommunityGuidelinesMutation`, `useUpdateWhiteboardMutation`, `useDeleteTemplateMutation`, `useUpdateTemplateDefaultMutation`, the import-dialog source queries `useImportTemplateDialogQuery` / `…AccountTemplatesQuery` / `…PlatformTemplatesQuery`, `useInnovationLibraryQuery`, `useAdminInnovationPackQuery`, `useCreateInnovationPackOnAccountMutation`, `useUpdateInnovationPackMutation`, `useDeleteInnovationPackMutation`, `useInnovationPackProfilePageQuery`, plus the upload helpers `useHandlePreviewImages` / `useUploadMediaGalleryVisuals`); 0 new GraphQL documents expected (any gap is added via codegen in-PR — see Phase 0).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Domain-Driven Frontend Boundaries | PASS | CRD components purely presentational. All template business logic stays in the existing `src/domain/templates/*`, `src/domain/templates-manager/*`, `src/domain/InnovationPack/*` hooks (and the existing Apollo mutations). New integration glue lives under `src/main/crdPages/templates/`, `src/main/crdPages/innovationPack/`, `src/main/crdPages/innovationLibrary/`. No new domain rules invented (FR-070). |
| II. React 19 Concurrent UX Discipline | PASS | CRD components pure / concurrency-safe; template-content fetches are lazy queries surfaced through Suspense or explicit loading props; mutations wrapped in `useTransition` in the integration layer. Skeletons + `role="status"`/ARIA live regions for async state (FR-005, FR-025). No `useMemo`/`useCallback`/`React.memo` (React Compiler). |
| III. GraphQL Contract Fidelity | PASS | No GraphQL changes planned (FR "data layer unchanged"); all operations go through generated hooks; CRD components never import generated types. If any CRD surface needs a field not exposed today, a `.graphql` edit + `pnpm codegen` happens in-PR with a schema diff note (Phase 0 will confirm coverage; current expectation is full coverage). |
| IV. State & Side-Effect Isolation | PASS | CRD components hold only visual state (dialog open/close, active section collapse, picker preview-vs-list view, inline search box). Dirty-form buffers, mutation wiring, route navigation, optimistic cache eviction all live under `src/main/crdPages/`. |
| V. Experience Quality & Safeguards | PASS | FR-005 / FR-006 / FR-024 / FR-025 codify WCAG 2.1 AA, confirmation-gated deletions, accessible preview/loading states. SC-007/SC-008 are the acceptance evidence. |
| Arch #1: Feature directories map to domain contexts | PASS | CRD composites under `src/crd/components/templates/`, `src/crd/components/innovationPack/`, `src/crd/components/innovationLibrary/`; integration under `src/main/crdPages/{templates,innovationPack,innovationLibrary}/` and `src/main/crdPages/topLevelPages/spaceSettings/templates/` (Space Settings tab consumer). |
| Arch #2: Styling standardizes on MUI theming → CRD | **JUSTIFIED VIOLATION** | Same intentional, constitution-acknowledged migration as 039 / 041 / 042 / 043 / 045 / 096. CRD (shadcn/ui + Tailwind) is the announced successor design system. See Complexity Tracking. |
| Arch #3: i18n via react-i18next | PASS | New CRD namespace `crd-templates` (`src/crd/i18n/templates/templates.<lang>.json`), lazy-loaded via `crdNamespaceImports`, English + nl/es/bg/de/fr maintained in-PR per `src/crd/CLAUDE.md` (CRD i18n is not Crowdin-managed). No hard-coded strings; business text (template / pack names) passed as props. |
| Arch #4: Build artifacts deterministic | PASS | No Vite config changes. No new runtime dependencies. New routes are lazy chunks (no eager bundle growth on non-CRD routes). |
| Arch #5: No barrel exports | PASS | All imports use explicit file paths. |
| Arch #6: SOLID + DRY | PASS | **SRP**: presentational view vs. data mapper vs. data hook split per surface. **OCP**: `TemplatesManagerView` is configured by props (`holderKind`, `canCreate/Edit/Delete/Import` predicates, `categories`) — adding the pack holder needs zero changes to the view. **LSP**: the picker honours one `onSelect`/`onImport` contract regardless of consumer; the preview honours one `templateContent` contract regardless of type (discriminated by `type`). **ISP**: per-type form prop interfaces are minimal & type-specific; the picker exposes a `mode: 'import' | 'select'` discriminated union rather than a kitchen-sink prop bag. **DIP**: CRD components depend on plain prop abstractions injected by mappers, never on Apollo. **DRY**: the *core* of this plan — one templates-management view, one card, one picker, one preview, shared across Spaces + packs + library + Space Settings tab; reuse of existing CRD `ConfirmationDialog` / `MarkdownEditor` / `tags-input` / whiteboard editor / `pickColorFromId`; the existing `045` view/hooks are refactored-in-place, not duplicated. |

**Post-Phase 1 re-check**: All gates pass; the Arch #2 violation is identical to prior CRD migrations and is the only one. No new violations introduced by the design.

## Project Structure

### Documentation (this feature)

```text
specs/098-crd-templates/
├── plan.md              # This file
├── spec.md              # Feature specification (8 user stories, FR-001..FR-071, SC-001..SC-008)
├── research.md          # Phase 0: research findings & decisions
├── data-model.md        # Phase 1: entities, content shapes, mapping notes, state
├── quickstart.md        # Phase 1: setup + implementation walkthrough
├── contracts/           # Phase 1: TypeScript prop interfaces for the CRD components
│   ├── templates-manager.ts     # TemplatesManagerView + TemplateCard + section types
│   ├── template-picker.ts       # TemplatePicker (import & select modes), source sections
│   ├── template-preview.ts      # TemplateContentPreview + per-type preview prop shapes
│   ├── template-forms.ts        # Per-type create/edit form prop shapes + submitted-values
│   ├── set-default-dialog.ts    # SetDefaultTemplateDialog + SaveAsTemplateDialog
│   ├── innovation-pack.ts        # InnovationPackAdminView / ProfileView / Form / Card / CreateDialog
│   ├── innovation-library.ts     # InnovationLibraryView / TemplateGallery / TemplateTypeFilter
│   └── data-mapper.ts            # GraphQL → CRD-prop mapper signatures (integration layer)
└── checklists/
    └── requirements.md  # Spec quality checklist (all items pass)
```

### Source Code (repository root)

```text
src/
├── crd/
│   ├── primitives/                                  # Existing; port from prototype only if missing
│   │   └── collapsible.tsx                           # EXISTING (used by the section list)
│   ├── components/
│   │   ├── dialogs/
│   │   │   └── ConfirmationDialog.tsx               # EXISTING — reused for every template/pack delete + discard (Rule 9)
│   │   ├── common/
│   │   │   ├── MarkdownContent.tsx / InlineMarkdown.tsx   # EXISTING — read-only guidelines/post text in previews
│   │   │   ├── ShareDialog.tsx / ShareButton.tsx    # EXISTING — pack profile / template detail share
│   │   │   └── StackedAvatars.tsx                   # EXISTING — pack provider avatar
│   │   ├── templates/                               # NEW — holder-agnostic templates UI (the keystone)
│   │   │   ├── TemplatesManagerView.tsx             # Section-per-type card grid + per-type Create/Import/actions — generalised from `space/settings/SpaceSettingsTemplatesView.tsx`
│   │   │   ├── TemplateCard.tsx                     # One template card (name, description, type icon/badge, banner/preview, kebab) — replaces inline card markup
│   │   │   ├── TemplateSectionHeader.tsx            # Per-type header (icon, title, count, Create/Import buttons, collapse)
│   │   │   ├── TemplatePicker.tsx                   # Reusable picker dialog. `mode: 'import'` = persistent library manager (gallery, import individually, mark/remove already-in-set); `mode: 'select'` = single-pick-then-apply + "no template" clear path. Source sections Space / Account / Platform, empty omitted, preview before commit.
│   │   │   ├── TemplatePickerCard.tsx               # Card used inside the picker (preview hover, "in this set" / "imported" state, select/import button)
│   │   │   ├── TemplateContentPreview.tsx           # Dispatcher → per-type preview; used in the preview dialog, picker preview pane, pack profile detail
│   │   │   ├── preview/
│   │   │   │   ├── CalloutTemplatePreview.tsx       # Framing kind + framing content + allowed contributions + contribution defaults (read-only)
│   │   │   │   ├── WhiteboardTemplatePreview.tsx    # Whiteboard drawing (read-only viewer)
│   │   │   │   ├── PostTemplatePreview.tsx          # Default post description (markdown)
│   │   │   │   ├── SpaceTemplatePreview.tsx         # Innovation-flow phases + starter callouts + nested subspace templates
│   │   │   │   └── CommunityGuidelinesTemplatePreview.tsx  # Guidelines text + references
│   │   │   ├── TemplatePreviewDialog.tsx            # Wraps TemplateContentPreview in a CRD dialog (+ Edit affordance when allowed) — evolved from `space/settings/TemplatePreviewDialog.tsx`
│   │   │   ├── TemplateFormDialog.tsx               # Create/Edit shell — title + common fields (name, description, tags, banner) + slot for the per-type content form + Save/Cancel; discard-guard via ConfirmationDialog — evolved from `space/settings/TemplateEditDialog.tsx`
│   │   │   ├── forms/
│   │   │   │   ├── CalloutTemplateForm.tsx          # Framing kind picker + framing content editor + allowed-contributions toggles + comment settings + contribution defaults (default post description, default whiteboard) — the heavyweight one
│   │   │   │   ├── WhiteboardTemplateForm.tsx       # Wraps the CRD whiteboard editor + preview settings
│   │   │   │   ├── PostTemplateForm.tsx             # Wraps the CRD MarkdownEditor for the default description
│   │   │   │   ├── SpaceTemplateForm.tsx            # "Pick a space/subspace to copy" + recursive toggle + captured-structure preview (re-capture on edit)
│   │   │   │   └── CommunityGuidelinesTemplateForm.tsx  # Guidelines text (MarkdownEditor) + references list editor
│   │   │   ├── SetDefaultTemplateDialog.tsx         # Generalised from `space/settings/ChangeDefaultSubspaceTemplateDialog.tsx` — pick + preview a template to set as a per-type default; also used for the innovation-flow phase default callout template
│   │   │   └── SaveAsTemplateDialog.tsx             # Generalised from `space/settings/SaveSubspaceAsTemplateDialog.tsx` — capture a space/subspace (or callout, etc.) as a new template
│   │   ├── innovationPack/                          # NEW — Innovation Pack surfaces
│   │   │   ├── InnovationPackAdminView.tsx          # Pack-details form (InnovationPackForm) + TemplatesManagerView (holderKind='innovationPack')
│   │   │   ├── InnovationPackProfileView.tsx        # Public profile: hero (avatar/banner/name/description), provider card, tags, references, TemplatesManagerView in read-only mode, admin-screen entry point when authorised
│   │   │   ├── InnovationPackForm.tsx               # name, description, avatar, tags, references, provider org, listedInStore toggle, searchVisibility select
│   │   │   ├── InnovationPackCard.tsx               # Pack card for the Library packs section (+ horizontal variant if needed)
│   │   │   └── CreateInnovationPackDialog.tsx       # New-pack dialog (subset of InnovationPackForm)
│   │   ├── innovationLibrary/                       # NEW — Innovation Library page
│   │   │   ├── InnovationLibraryView.tsx            # Page body: packs section (InnovationPackCard grid) + template gallery + type filter — from prototype TemplateLibrary.tsx
│   │   │   ├── TemplateGallery.tsx                  # Filterable grid of all platform templates (uses TemplateCard) with preview
│   │   │   └── TemplateTypeFilter.tsx               # Template-type filter chips/segmented control (desktop + mobile variants)
│   │   └── i18n/
│   │       └── templates/                           # NEW
│   │           └── templates.en.json (+ .nl .es .bg .de .fr)
│   └── components/space/settings/
│       ├── SpaceSettingsTemplatesView.tsx          # REPLACED — becomes a thin wrapper that renders `<TemplatesManagerView holderKind="space" .../>` (or deleted, with `045`'s tab rendering TemplatesManagerView directly)
│       ├── TemplateLibraryDialog.tsx               # REPLACED — superseded by `templates/TemplatePicker.tsx` (mode='import')
│       ├── TemplateEditDialog.tsx                  # REPLACED — superseded by `templates/TemplateFormDialog.tsx`
│       ├── TemplatePreviewDialog.tsx               # MOVED → `templates/TemplatePreviewDialog.tsx`
│       ├── SaveSubspaceAsTemplateDialog.tsx        # REPLACED — superseded by `templates/SaveAsTemplateDialog.tsx`
│       └── ChangeDefaultSubspaceTemplateDialog.tsx # REPLACED — superseded by `templates/SetDefaultTemplateDialog.tsx`
├── main/
│   └── crdPages/
│       ├── templates/                               # NEW — shared integration layer for templates
│       │   ├── useTemplatesManager.ts              # Holder-agnostic: takes { templatesSetId, holderKind, accountId, privileges } → categories + Create/Import/Preview/Edit/Duplicate/Delete handlers; owns delete confirmation + optimistic eviction (generalised from `topLevelPages/spaceSettings/templates/useTemplatesTabData.ts`)
│       │   ├── useTemplatePicker.ts                # The picker hook used by ALL consumers: loads Space/Account/Platform sources (reuses the import-dialog source queries), lazy-loads template content for preview, exposes open/close + mode + selection. `mode='import'` also wires create-into-set / remove-from-set.
│       │   ├── useTemplateForms.ts                 # Create/Edit mutation orchestration per type (reuses `useCreateTemplate*` / `useUpdate*` mutations) + image uploads (`useHandlePreviewImages`, `useUploadMediaGalleryVisuals`); discard-guard state
│       │   ├── useSetDefaultTemplate.ts            # Wraps `useUpdateTemplateDefaultMutation` (Space defaults) + the innovation-flow phase-default callout template path
│       │   ├── useSaveAsTemplate.ts                # Wraps `useCreateTemplateFromSpaceMutation` / `…FromContentSpaceMutation` (and any future callout-as-template)
│       │   ├── templateCardMapper.ts              # GraphQL template → `TemplateCardData` (name, description, type, banner via `pickColorFromId` fallback)
│       │   ├── templateContentMapper.ts           # GraphQL template content (per type) → `TemplateContent` discriminated-union prop
│       │   └── templatesManagerMapper.ts          # GraphQL templates set → `TemplateCategorySection[]`
│       ├── innovationPack/                          # NEW — Innovation Pack pages (admin + public profile)
│       │   ├── CrdInnovationPackAdminPage.tsx      # Route entry — resolves pack id, renders InnovationPackAdminView; wires InnovationPackForm save + the templates manager
│       │   ├── CrdInnovationPackProfilePage.tsx    # Route entry — public profile
│       │   ├── useInnovationPackAdmin.ts           # `useAdminInnovationPackQuery` + `useUpdateInnovationPackMutation` + `useDeleteInnovationPackMutation` + `useTemplatesManager(holderKind='innovationPack')`
│       │   ├── useInnovationPackProfile.ts         # `useInnovationPackProfilePageQuery` + read-only templates manager
│       │   ├── useCreateInnovationPack.ts          # `useCreateInnovationPackOnAccountMutation` (account-owned) — used by CreateInnovationPackDialog
│       │   └── innovationPackMapper.ts            # GraphQL pack → InnovationPack* prop shapes
│       ├── innovationLibrary/                       # NEW — Innovation Library page
│       │   ├── CrdInnovationLibraryPage.tsx        # Route entry — `useInnovationLibraryQuery`; renders InnovationLibraryView
│       │   ├── useInnovationLibrary.ts            # Library data + type-filter state + lazy preview content
│       │   └── innovationLibraryMapper.ts         # GraphQL library → packs[] + templates[] CRD props
│       └── topLevelPages/spaceSettings/templates/  # EXISTING — refactored to consume the shared layer
│           ├── useTemplatesTabData.ts             # MODIFIED — thin adapter over `crdPages/templates/useTemplatesManager` (holderKind='space') + `useTemplatePicker` (mode='import') + `useTemplateForms` + `useSetDefaultTemplate` (default subspace template) + `useSaveAsTemplate` (save subspace as template, called from the Subspaces tab)
│           ├── useTemplateActions.ts / useTemplateLibrary.ts / templatesMapper.ts  # MERGED into / replaced by the shared layer above (kept only as compatibility re-exports if `045` imports break)
├── main/routing/
│   └── TopLevelRoutes.tsx                          # MODIFIED — add toggle-gated CRD routes: `/innovation-library` (CrdInnovationLibraryPage) and the public Innovation Pack profile route; keep MUI versions for toggle-off (lazy, only one chunk fetched)
├── domain/platformAdmin/domain/innovationPacks/
│   └── AdminInnovationPackRoutes.tsx               # MODIFIED — when CRD enabled, render CrdInnovationPackAdminPage; else the existing MUI page (toggle-gated, like other admin areas)
└── domain/{templates,templates-manager,InnovationPack,spaceAdmin/SpaceAdminTemplates}/, src/main/topLevelPages/InnovationLibraryPage/
                                                    # UNCHANGED — existing MUI implementations stay; serve toggle-off
```

**Structure Decision.** Presentational CRD components live under `src/crd/components/templates/` (the holder-agnostic keystone + previews + forms + picker), `src/crd/components/innovationPack/`, and `src/crd/components/innovationLibrary/`. All data fetching, mapping, mutation wiring, route navigation and feature-toggle gating live under `src/main/crdPages/{templates,innovationPack,innovationLibrary}/` and the existing `src/main/crdPages/topLevelPages/spaceSettings/templates/` (the Space Settings tab is a *consumer* of the shared `crdPages/templates/` hooks, not a parallel implementation). The `045`-era CRD templates files under `src/crd/components/space/settings/` are refactored-in-place: `SpaceSettingsTemplatesView` becomes a thin wrapper (or is removed in favour of `045`'s tab rendering `TemplatesManagerView` directly), and the dialogs are superseded by the generalised ones under `src/crd/components/templates/`. Existing `src/domain/templates/*`, `src/domain/templates-manager/*`, `src/domain/InnovationPack/*`, `src/domain/spaceAdmin/SpaceAdminTemplates/*`, and `src/main/topLevelPages/InnovationLibraryPage/*` stay intact and serve the MUI variant when `useCrdEnabled()` returns `false`.

**Holder-agnostic contract.** `TemplatesManagerView` takes: `holderKind: 'space' | 'innovationPack'`, `categories: TemplateCategorySection[]`, `loading`, per-type permission predicates (`canCreate(type) / canEdit(type) / canDelete(type) / canImport(type)` — `canImport` is wired only for `holderKind === 'space'`), and callbacks `onCreate(type)`, `onImport(type)`, `onTemplateAction(id, action)` (`'preview' | 'edit' | 'duplicate' | 'delete'`). It renders nothing about navigation or Apollo. Both the Space Settings tab (`045`) and `CrdInnovationPackAdminPage` build those props from the shared `useTemplatesManager` hook with different `holderKind` and privilege inputs; `InnovationPackProfileView` builds them with all permission predicates returning `false` (read-only listing) plus `onTemplateAction` restricted to `'preview'`.

**Picker contract.** `TemplatePicker` takes a discriminated-union `mode`: `{ mode: 'import'; templatesSetId; alreadyInSet: Set<id>; onImport(templateId); onRemoveFromSet(templateId) }` (persistent library manager — dialog stays open, marks/removes) or `{ mode: 'select'; allowedTypes: TemplateType[]; selectedId?; onSelect(templateId | null) }` (single-pick-then-apply + a "no template / clear" path). Both modes share: `sources` (the Space / Account / Platform sections, empty omitted), `onPreview(templateId)` (loads content lazily), and the preview pane. The consumption hooks (`useCalloutTemplateImport` equivalent, whiteboard, space/subspace, guidelines, phase-default, post-default) all instantiate the *select* mode; the Space Settings tab and (no — packs have no import) only the Space Settings tab instantiates the *import* mode.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Arch #2 (parallel CRD design system) | CRD (shadcn/ui + Tailwind) is the announced successor design system; all new pages adopt it per 039 / 041 / 042 / 043 / 045 / 096 precedent | Continuing MUI-only would block the CRD migration mandate; this intentional parallel-systems phase is tracked, toggle-gated, and bounded (legacy files stay until the toggle is removed project-wide) |
| Generalising & relocating `045`-era CRD templates files (`SpaceSettingsTemplatesView`, the four dialogs, the three hooks) | The spec puts this feature in charge of all templates surfaces and requires *one* holder-agnostic view shared by Spaces + packs + library; `045` shipped a Space-only first cut | Leaving `045`'s Space-only versions in place and adding a parallel pack-only set would duplicate the section list, the picker and the dialogs (DRY violation) and guarantee drift between the two holders — the exact problem the unification mandate exists to prevent |
