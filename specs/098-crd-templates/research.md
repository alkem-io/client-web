# Phase 0 Research — CRD Templates System

This feature has **no open `[NEEDS CLARIFICATION]` markers** in the spec (all three clarification rounds are resolved). Phase 0 therefore focuses on (a) confirming the existing data layer covers every CRD surface, (b) the patterns to follow when re-skinning the heavy legacy logic without importing MUI, and (c) the seam with the in-flight `045`/`041` work. Each item below is a decision with rationale and the alternatives weighed.

---

## 1. Does the existing GraphQL cover everything the CRD surfaces need? — *No new documents expected; confirm in-PR*

**Decision**: Reuse the existing template/pack/library Apollo operations as-is. Treat the following as the canonical set:
- Holder templates list: `AllTemplatesInTemplatesSet` (`src/domain/templates/components/TemplatesAdmin/AllTemplatesInTemplatesSet.graphql`) — used for both a Space's set (`space.templatesManager.templatesSet`) and a pack's set (`innovationPack.templatesSet`).
- Space holder wiring: `SpaceTemplatesManager` (`src/domain/space/graphql/SpaceTemplatesQueries.graphql`) → `templatesManager.id` + `templatesSet.id` + `templateDefaults`.
- Template content (per type, conditional fetches): `TemplateContent` / `SpaceTemplateContent` / `CalloutTemplateContent` / `WhiteboardTemplateContent` / `CommunityGuidelinesTemplateContent` (`src/domain/templates/graphql/TemplateContent.graphql`) via `useTemplateContentLazyQuery`.
- Picker sources: `ImportTemplateDialog` / `ImportTemplateDialogAccountTemplates` / `ImportTemplateDialogPlatformTemplates` (`src/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplateDialog.graphql`).
- Mutations: `CreateTemplate`, `CreateTemplateFromSpace`, `CreateTemplateFromContentSpace`, `UpdateTemplate`, `UpdateCalloutTemplate`, `UpdateTemplateFromSpace`, `DeleteTemplate` (`TemplateMutations.graphql`); `UpdateCommunityGuidelines`, `UpdateWhiteboard` (existing, used by legacy `TemplatesAdmin`); `updateTemplateDefault` (`TemplatesManagerMutations.graphql`).
- Innovation Library page: `InnovationLibrary` (`src/main/topLevelPages/InnovationLibraryPage/InnovationLibraryPage.graphql`) → `platform.library.templates` (filterable by `types`) + `platform.library.innovationPacks`.
- Innovation Pack admin: `AdminInnovationPack` (`src/domain/InnovationPack/admin/InnovationPacksMutations.graphql` / `AdminInnovationPackPage.tsx` query) + `UpdateInnovationPack` + `DeleteInnovationPack` + the account-level `CreateInnovationPackOnAccount` (used by the legacy `CreateInnovationPackDialog`).
- Innovation Pack public profile: `InnovationPackProfilePage` (`src/domain/InnovationPack/InnovationPackProfilePage/InnovationPackProfile.graphql`).
- Image uploads: `useHandlePreviewImages` (`src/domain/templates/utils/useHandlePreviewImages.ts`) and `useUploadMediaGalleryVisuals` (`src/domain/collaboration/mediaGallery/useUploadMediaGalleryVisuals`).

**Open verification (do early in implementation, before building the dependent UI)**: confirm `InnovationLibrary` already exposes enough per-template fields to render the gallery card without a follow-up fetch (display name, description, tags, visual, type, owning pack name/url) — the legacy gallery uses `TemplateCardProfileInfo`, which it does. If any CRD card needs a field the legacy query omits (none anticipated), add it to the `.graphql` document and run `pnpm codegen` in the same PR with a schema diff note (Constitution III). Current expectation: **zero new GraphQL documents**.

**Rationale**: the spec mandates "data layer unchanged"; the legacy code already exercises every operation this feature needs; reusing the generated hooks is required by Constitution III anyway.

**Alternatives considered**: writing leaner CRD-specific queries (rejected — duplicates fragments, risks cache shape divergence per Constitution III, and the legacy queries are already tuned for these exact screens).

---

## 2. Re-skinning the heavy legacy logic (preview renderers, callout-template form) without MUI — *port the logic, replace the chrome*

**Decision**: For each per-type **preview**, lift the *content-shaping logic* from the legacy `Template*Preview` components (`src/domain/templates/components/Previews/*`) into the integration-layer `templateContentMapper.ts`, which produces a plain-TS `TemplateContent` discriminated union; the CRD `preview/*` components are pure renderers of that union (Tailwind chrome, `lucide-react` icons, `MarkdownContent`/`InlineMarkdown` for any markdown). The whiteboard preview reuses the existing CRD read-only whiteboard viewer; the space-template preview reuses the CRD innovation-flow phase chips + a callout list (both already exist in the CRD space-page work). For the **Callout template create/edit form** (the heavyweight one), mirror the legacy `TemplateCalloutForm` *field set* (framing kind, framing content per kind, allowed-contribution toggles, comment settings, default post description, default whiteboard) but build it from CRD form primitives + the CRD MarkdownEditor + the CRD whiteboard editor; form state lives in the integration layer (no Formik inside `src/crd/`).

**Rationale**: the genuinely complex part is *what to show* (the content shape), not *how to show it*; the legacy components already encode the former and the CRD layer rules forbid importing them. Keeping the shaping in the mapper makes the CRD renderers trivially testable with plain fixtures.

**Alternatives considered**: wrapping the legacy MUI preview components in an iframe / portal (rejected — drags MUI/Emotion into CRD routes, violates the CSS-isolation strategy); re-deriving the content shapes from raw GraphQL inside the CRD components (rejected — business logic in `src/crd/`, Constitution I/IV).

---

## 3. The picker's two modes vs. the legacy import dialog — *consolidate into one component with a discriminated `mode`*

**Decision**: One `TemplatePicker` component. `mode: 'import'` reproduces the legacy `ImportTemplatesDialog` behaviour used by `TemplatesAdmin`: a gallery of source templates (Space / Account / Platform sections), click → preview pane, "Import" adds a copy to the destination set **and the dialog stays open**, templates already present are marked and removable from within the dialog, the admin closes when finished (the resolved clarification). `mode: 'select'` is what every *consumption* flow needs: pick exactly one template (filtered to the allowed type(s)), preview it, confirm → the dialog closes and the consumer applies it; a persistent "no template / start blank" affordance lets the user clear the selection. The two modes share the source-loading hook, the preview-content lazy query, and the picker card.

**Rationale**: the spec's FR-016/FR-017 already split these two behaviours; one component with a `mode` discriminator (ISP-friendly) avoids duplicating the source-section layout, the preview pane, and the empty-state handling. The legacy code is effectively two behaviours bolted onto one dialog already; CRD makes the split explicit.

**Alternatives considered**: two separate components (`TemplateImportManager` + `TemplateSelectDialog`) sharing a sub-component (rejected — more files, and the shared surface is ~80% of each; a `mode` union is the cleaner OCP/ISP shape); reusing the legacy dialog for the import case and only building the select case (rejected — MUI in CRD).

---

## 4. Whiteboard editing/viewing inside template forms & previews — *reuse the existing CRD whiteboard editor/viewer*

**Decision**: The Whiteboard template form embeds the existing CRD whiteboard editor (the same one used elsewhere in CRD callout/whiteboard work); the Whiteboard template preview and the Callout template's "default whiteboard" preview embed the CRD read-only whiteboard viewer. No new whiteboard component. Preview images for whiteboard templates are uploaded via `useHandlePreviewImages` from the integration layer.

**Rationale**: the CRD whiteboard editor already exists and handles the Excalidraw stack; re-creating it would be a large, unnecessary duplication. The CLAUDE.md "reuse, don't re-create" rule applies directly.

**Alternatives considered**: a read-only image-only preview (rejected — regression vs. the legacy interactive whiteboard preview, and the editor is already available).

---

## 5. Holder unification — *one `holderKind` prop + authorisation-driven action predicates*

**Decision**: `TemplatesManagerView` is holder-agnostic. It takes `holderKind: 'space' | 'innovationPack'` (used only for the few cosmetic differences a designer might want, e.g. a section subtitle) plus per-type permission predicates. `canImport` is wired by the consumer only for `holderKind === 'space'` (packs are sources, not sinks — the resolved clarification). Clicking a template **always** opens the Preview dialog first (with an Edit affordance when `canEdit(type)`), removing the legacy "packs jump straight to Edit". All Create / Edit / Preview / Delete / Duplicate go through the *same* CRD dialog components regardless of holder. The Innovation Pack admin builds the props with `holderKind='innovationPack'` and pack-authz predicates; the Space Settings tab builds them with `holderKind='space'` and space-authz predicates; the pack public profile builds them with all predicates `false` and `onTemplateAction` limited to `'preview'`.

**Rationale**: directly implements the spec's unification requirement (FR-012/FR-013/FR-014) and the resolved clarification; keeps a single source of truth (DRY) and lets a future third holder kind be added with zero changes to the view (OCP).

**Alternatives considered**: separate `SpaceTemplatesView` / `PackTemplatesView` (rejected — duplication + drift, the exact thing the mandate removes); a fully prop-less view that derives everything from a context (rejected — couples the CRD component to app state, Constitution I/IV).

---

## 6. Routing & feature-toggle gating for the new pages — *mirror the established CRD route pattern*

**Decision**: Add toggle-gated CRD routes the same way 042/045/096 did. In `src/main/routing/TopLevelRoutes.tsx`: a lazy `CrdInnovationLibraryPage` and a lazy `MuiInnovationLibraryPage`, with the existing `crdEnabled` conditional choosing which renders for `/innovation-library`; likewise the public Innovation Pack profile route (CRD vs. legacy `InnovationPackRoute`/`InnovationPackProfilePage`). The Innovation Pack **admin** is reached today via `src/domain/platformAdmin/domain/innovationPacks/AdminInnovationPackRoutes.tsx` (platform-level) and the account area for account-owned packs — those route components branch on `useCrdEnabled()` to render `CrdInnovationPackAdminPage` or the existing MUI `AdminInnovationPackPage`. CRD pack pages are wrapped in `CrdLayoutWrapper` (CRD shell) like other CRD routes; legacy pages keep their existing shells. All CRD pages are lazy chunks → no bundle penalty on toggle-off.

**Rationale**: this is the project's standard migration mechanism (migration-guide §"Wire the Route (with Feature Toggle)"); deviating would be surprising and would complicate the eventual toggle removal.

**Alternatives considered**: a single route component that internally swaps shells (rejected — the project standardised on the lazy-import + conditional-`<Route>` pattern); shipping CRD pack/library pages unconditionally (rejected — they must be opt-in until the migration is validated).

---

## 7. "Save as template" and "set as default" — *generalise the two `045` dialogs*

**Decision**: `SaveSubspaceAsTemplateDialog` (045) → generalised `SaveAsTemplateDialog` (CRD `templates/`) that captures *a source* (a space or subspace today; structured so a callout-as-template could be added) as a new template in a chosen destination templates set, via `useCreateTemplateFromSpaceMutation` / `…FromContentSpaceMutation`. `ChangeDefaultSubspaceTemplateDialog` (045) → generalised `SetDefaultTemplateDialog` (CRD `templates/`) that picks + previews a template and records it as a per-type default — used for the Space's default subspace/content template (`updateTemplateDefault`) and for the innovation-flow **phase default callout template** (the legacy `SetDefaultTemplateDialog` path inside `InnovationFlowSettingsDialog`). Both reuse `TemplatePicker` in `mode='select'` internally.

**Rationale**: these are the same interaction (pick a template → use it for X) with different "X"; generalising avoids three near-identical dialogs and keeps the picker the single selection surface.

**Alternatives considered**: keeping the 045 dialogs space-specific and adding parallel ones for packs/flows (rejected — duplication); folding "set default" into the picker itself (rejected — the picker is generic; "what the selection is for" belongs to the consumer hook).

---

## 8. Seam with spec `045-crd-space-settings` and spec `041-account-templates-dialog` — *098 owns the components; 045 hosts two of its consumers; 041 is realised by the picker*

**Decision** (recorded in the spec's Clarifications):
- `098` **owns** the Templates tab body and all reusable template machinery. `045`'s Templates tab is reduced to: render `<TemplatesManagerView holderKind="space" .../>` fed by `crdPages/templates/useTemplatesManager` (+ the default-subspace-template card calling `useSetDefaultTemplate`). The `045`-era files `SpaceSettingsTemplatesView.tsx` / `TemplateLibraryDialog.tsx` / `TemplateEditDialog.tsx` / `TemplatePreviewDialog.tsx` / `SaveSubspaceAsTemplateDialog.tsx` / `ChangeDefaultSubspaceTemplateDialog.tsx` are refactored-in-place (relocated/replaced) — **not** duplicated.
- `045`'s **Layout tab** per-phase "default callout template" and **Subspaces tab** "default subspace template" + "save subspace as template" affordances stay in `045`'s tasks but consume `098`'s `TemplatePicker` / `SetDefaultTemplateDialog` / `SaveAsTemplateDialog`.
- `041`'s "account templates in the picker" requirement is satisfied by `TemplatePicker`'s **Account** source section (`useImportTemplateDialogAccountTemplatesQuery`); the legacy MUI dialog is not extended.

**Rationale**: prevents two specs implementing the same picker/section-list and guarantees the two holders share one experience.

**Alternatives considered**: `098` provides only primitives and `045` keeps its own tab implementation (rejected by the user — `098` owns and supersedes); `098` re-implements the entire Space Settings page (rejected — out of scope; `045` keeps the other tabs).

---

## 9. Async / large-content rendering — *lazy queries + Suspense + scroll areas; never block paint*

**Decision**: Template *content* (the heavy payloads — whiteboard JSON, deep space trees, callout framing) is fetched only when a preview/edit is opened, via `useTemplateContentLazyQuery`; the preview dialog and the picker preview pane render a skeleton (`role="status"` + `aria-label`) until it resolves, and put the rendered content in a `ScrollArea` so it can exceed the dialog. The section-list view shows per-card skeletons while `AllTemplatesInTemplatesSet` loads, and a per-row spinner during a delete/duplicate (already the pattern in `045`'s `useTemplatesTabData`). Mutations are wrapped in `useTransition` in the integration layer (Constitution II).

**Rationale**: FR-025 requires non-blocking preview loads; lazy-on-open is also the legacy behaviour and avoids over-fetching the list.

**Alternatives considered**: eager-fetching all template content with the list (rejected — huge over-fetch, especially in the Library where every platform template would pull its full content).

---

## Summary of decisions

| # | Topic | Decision |
|---|---|---|
| 1 | GraphQL coverage | Reuse all existing template/pack/library operations; expect **zero** new documents (verify the Library card fields early; add via codegen in-PR if a gap appears). |
| 2 | Heavy legacy logic | Lift content-shaping into mappers; CRD components are pure renderers; never import the MUI preview/form components. |
| 3 | Picker | One `TemplatePicker` with `mode: 'import' \| 'select'` — import = persistent library manager, select = single-pick-then-apply. |
| 4 | Whiteboard | Reuse the existing CRD whiteboard editor/viewer in the Whiteboard form & previews. |
| 5 | Holder unification | `holderKind` prop + authorisation-driven predicates; Import wired for Spaces only; Preview-before-Edit everywhere; identical dialogs. |
| 6 | Routing & toggle | Lazy CRD/MUI route pairs gated by `useCrdEnabled()` for `/innovation-library`, the pack public profile, and the pack admin — the established CRD pattern. |
| 7 | Save-as / set-default | Generalise the two `045` dialogs into `SaveAsTemplateDialog` / `SetDefaultTemplateDialog`; both reuse `TemplatePicker` (select mode). |
| 8 | 045 / 041 seam | `098` owns the components & the Templates tab body; `045` hosts the Layout/Subspaces template affordances as consumers; `041` is realised by the picker's Account section. |
| 9 | Async / large content | Lazy-on-open content fetch + Suspense skeletons + scroll areas; mutations in `useTransition`; never block paint. |
