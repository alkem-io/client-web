# Quickstart — CRD Templates System (098)

Practical guide for implementing this feature. Read `plan.md` first (architecture), then this.

## Prerequisites

```bash
pnpm install
pnpm start          # app on localhost:3001 (expects backend at localhost:3000)
# OR, for iterating on CRD components with mock data, no backend needed:
pnpm crd:dev        # standalone CRD preview on localhost:5200
```

Enable the CRD design system in the browser (or via Admin → Platform Settings → Design System):

```js
localStorage.setItem('alkemio-crd-enabled', 'true'); location.reload();
```

Lint/type/test gates (run before staging):

```bash
pnpm lint           # tsc + Biome + ESLint (react-compiler rule)
pnpm vitest run     # all tests once
```

## Where things go (recap)

| Layer | Location | Rule |
|---|---|---|
| Presentational CRD components | `src/crd/components/templates/`, `src/crd/components/innovationPack/`, `src/crd/components/innovationLibrary/` | No MUI. Plain-TS props. Behaviour via callbacks. Tailwind + `lucide-react` + semantic typography tokens. `useTranslation('crd-templates')`. |
| Integration (data + mapping + mutations + routing) | `src/main/crdPages/templates/`, `src/main/crdPages/innovationPack/`, `src/main/crdPages/innovationLibrary/`, `src/main/crdPages/topLevelPages/spaceSettings/templates/` | No MUI. Apollo generated hooks only. Maps GraphQL → CRD props. `useTransition` for mutations. |
| Routing & toggle | `src/main/routing/TopLevelRoutes.tsx` (`/innovation-library`); **`src/domain/InnovationPack/InnovationPackRoute.tsx`** (pack public profile `<pack.profile.url>` + pack admin `<pack.profile.url>/settings`, both there — NOT `AdminInnovationPackRoutes.tsx`, which only hosts the un-migrated `/admin/innovation-packs` list); `src/domain/community/contributor/Account/ContributorAccountView.tsx` (create-pack dialog + the pack-card three-dot "Delete" menu) | Lazy CRD/MUI route pairs gated by `useCrdEnabled()`. |
| i18n | `src/crd/i18n/templates/templates.{en,nl,es,bg,de,fr}.json` + register `crd-templates` in `src/core/i18n/config.ts` (`crdNamespaceImports`) + `@types/i18next.d.ts` | English source + all 5 other languages edited in this PR (CRD i18n is NOT Crowdin-managed). |
| Untouched | `src/domain/templates/*`, `src/domain/templates-manager/*`, `src/domain/InnovationPack/*` (incl. the legacy `AdminInnovationPackPage` / `InnovationPackProfilePage`), `src/domain/platformAdmin/domain/innovationPacks/*` (the `/admin/innovation-packs` list — not migrated, FR-037), `src/domain/spaceAdmin/SpaceAdminTemplates/*`, `src/main/topLevelPages/InnovationLibraryPage/*` | These stay; serve toggle-off. Read them for reference only. |

## Suggested build order (matches the spec's user-story priorities)

The MVP is **US1 + US3**. Build the keystone and the picker first; everything else layers on.

### Step 0 — primitives & i18n scaffold
- Confirm needed shadcn primitives exist (`collapsible`, `dropdown-menu`, `tabs`, `badge`, `card`, `dialog`, `scroll-area`, `skeleton`, `tooltip`, `separator`, `select`, `switch`, `input`, `textarea`). Port any missing one from `prototype/src/app/components/ui/` (update `cn()` import).
- Create `src/crd/i18n/templates/templates.en.json` (+ 5 other languages), register `crd-templates`.

### Step 1 — the keystone: `TemplatesManagerView` + `TemplateCard` (US1, US2)
- Generalise `src/crd/components/space/settings/SpaceSettingsTemplatesView.tsx` → `src/crd/components/templates/TemplatesManagerView.tsx` per `contracts/templates-manager.ts` (add `holderKind`, the `can*` predicates, `onCreate`/`onImport`/`onTemplateAction`; extract the inline card into `TemplateCard.tsx` and the section header into `TemplateSectionHeader.tsx`).
- Section visibility rule from `contracts/templates-manager.ts`. Inline search box filters cards (visual only).
- In `src/main/crdPages/templates/`: `templateCardMapper.ts`, `templatesManagerMapper.ts`, and `useTemplatesManager.ts` (generalise `topLevelPages/spaceSettings/templates/useTemplatesTabData.ts` — keep the optimistic-evict-on-delete pattern; add the per-type create-form lifecycle).
- Refactor the Space Settings → Templates tab (`045`) to render `<TemplatesManagerView holderKind="space" .../>` from `useTemplatesManager`. Verify the tab still works toggle-on.

### Step 2 — preview (US1)
- `templateContentMapper.ts` — port the shaping logic from `src/domain/templates/components/Previews/*` as pure functions → `TemplateContent` union (`contracts/template-preview.ts`).
- `src/crd/components/templates/TemplateContentPreview.tsx` + `preview/{Callout,Whiteboard,Post,Space,CommunityGuidelines}TemplatePreview.tsx` — pure renderers. Whiteboard preview reuses the CRD read-only whiteboard viewer; space preview reuses CRD flow-phase chips + callout list. Markdown via `MarkdownContent`/`InlineMarkdown`.
- `TemplatePreviewDialog.tsx` (evolve `space/settings/TemplatePreviewDialog.tsx`) — header from `TemplateCardData`, lazy content, Edit affordance when allowed. Wire `useTemplateContentLazyQuery` in `useTemplatesManager`.

### Step 3 — the picker (US3 — and reused by US4/US5 and Step 1's Import)
- `src/crd/components/templates/TemplatePicker.tsx` + `TemplatePickerCard.tsx` per `contracts/template-picker.ts`. Two modes: `'import'` (persistent library manager — gallery, import individually, mark/remove `alreadyInSet`, dialog stays open) and `'select'` (single-pick-then-apply + "no template / clear"). Source sections Space/Account/Platform, empty omitted, "no templates available" when all empty. Shared preview pane.
- `src/main/crdPages/templates/useTemplatePicker.ts` (`mode: 'select'` for consumers) — loads sources from `useImportTemplateDialogQuery` / `…AccountTemplatesQuery` / `…PlatformTemplatesQuery` filtered to `allowedTypes`; lazy content for preview. In `useTemplatesManager`, wire `mode: 'import'` (Space holder only) reusing the same source loaders + the `createTemplate`/`createTemplateFromContentSpace` import mutations + a remove-from-set path (with `ConfirmationDialog`).
- **US3 wiring**: in the CRD callout-creation surface (`src/main/crdPages/space/callout/` — `TemplateImportConnector.tsx` already exists), replace its template-import path with `useTemplatePicker({ allowedTypes: ['callout'], spaceTemplatesSetId, accountId })`; on select, fetch the callout template content and pre-fill the creation form; "clear" → blank callout.

### Step 4 — create/edit forms (US1)
- `src/crd/components/templates/TemplateFormDialog.tsx` (evolve `space/settings/TemplateEditDialog.tsx`) — a **pure `src/crd/` shell**: common fields (name/description/tags/banner) + a `perTypeFormSlot: ReactNode` (the ShareDialog `shareOnAlkemioSlot` pattern) + Save/Cancel + discard guard (`DiscardChangesDialog` = `ConfirmationDialog` variant). It must NOT import any per-type form.
- `src/crd/components/templates/forms/{Whiteboard,Post,CommunityGuidelines}TemplateForm.tsx` + the **presentational** `SpaceTemplateForm.tsx` per `contracts/template-forms.ts` — pure CRD-layer (reuse `MarkdownEditor`, `tags-input`, `WhiteboardEditorShell` + `PreviewSettingsDialog`/`PreviewCropDialog` for the WB form's full preview-settings, the CRD references-list editor; the CG form has a **title** field [required] + body + references; the Space-source picker takes search results + `onSearch`/`onSelect` as props).
- **`src/main/crdPages/templates/CalloutTemplateForm.tsx`** — the big one — lives in the **integration layer** (not `src/crd/`), because it composes the Apollo/`@/domain/*`-bound callout-authoring connectors (framing connectors incl. Collabora-document and poll, the callout-settings *controls*, `ResponseDefaultsConnector`, `calloutFormMapper.ts`). Covers **every** framing kind (incl. Collabora-document + poll). It's controlled; mounted into `perTypeFormSlot` for `type:'callout'`.
- `src/main/crdPages/templates/useTemplateForms.ts` — form state + validation + `useCreateTemplate*` / `useUpdate*` mutations + image uploads (`useHandlePreviewImages`, `useUploadMediaGalleryVisuals`) + the Apollo space-search query for the Space form; assembles the `perTypeFormSlot` per type; reuse the MUI-free `src/domain/templates/components/Forms/common/mappings.ts`. Wire create/edit into `useTemplatesManager` (replace the existing `onCreateTemplate` TODO).
- **Before any of this reaches `CalloutSettingsConnector`** (Step 5's `useSaveAsTemplate`): remove the legacy-MUI `CreateTemplateDialog` import + the `CRD_SAVE_AS_TEMPLATE_ENABLED` kill-switch from `src/main/crdPages/space/callout/CalloutSettingsConnector.tsx` and re-point its "Save as template" menu item to the CRD `SaveAsTemplateDialog` via `useSaveAsTemplate` — so the CRD callout layer is MUI-free (FR-002/SC-004) from Phase 2 on.

### Step 5 — set-default & save-as-template (US1, US4)
- `src/crd/components/templates/SetDefaultTemplateDialog.tsx` (← `ChangeDefaultSubspaceTemplateDialog`) + `SaveAsTemplateDialog.tsx` (← `SaveSubspaceAsTemplateDialog`) per `contracts/set-default-dialog.ts`. **`SetDefaultTemplateDialog` branches on `purpose`**: `defaultSubspaceTemplate` → the Space's own Space templates only (a plain selector + a candidate preview — the default must reference a template in the set); `flowStateDefaultCalloutTemplate` → host `TemplatePicker` (`mode:'select'`, Space/Account/Platform), label "Default callout template". `SaveAsTemplateDialog` = `TemplateFormDialog` (create) pre-filled from a callout (no-regression) / current guidelines (a deliberate **new** flow) / subspace (no-regression).
- `src/main/crdPages/templates/useSetDefaultTemplate.ts` (`updateTemplateDefault` for the subspace default + `setDefaultCalloutTemplateOnInnovationFlowState`/`remove…` for the flow-state default) and `useSaveAsTemplate.ts` (`useCreateCalloutTemplate` for callouts; `createTemplate` w/ `communityGuidelinesData` for guidelines; `createTemplateFromSpace` / `…FromContentSpace` for subspaces).
- Wire the default-subspace-template card in `045`'s Subspaces tab and the per-phase default in `045`'s Layout tab to these (they consume `098`'s components).

### Step 6 — remaining consumption flows (US4, US5)
- Subspace creation (**done** — T052): `src/crd/components/space/settings/CreateSubspaceDialog.tsx` + `useCreateSubspace.ts` use `useTemplatePicker({ allowedTypes: ['space'] })` with an explicit "use blank" option; pre-select the parent's default subspace template; confirm-before-overwrite when the form has data; create from the selected template (or empty) via the existing create-subspace mutation. **The top-level (L0) create-Space wizard is NOT migrated by this feature** — it keeps the legacy MUI Space-template picker (FR-037 transitional fallback) until that wizard itself moves to CRD; record it as a "host not yet CRD" entry in the SC-002 parity checklist (T087).
- Whiteboard creation: in the CRD whiteboard add flow, `useTemplatePicker({ allowedTypes: ['whiteboard'] })`; on select, start the new whiteboard from that drawing; clear → blank.
- Community guidelines: **first deliver the CRD community-guidelines editor host** (FR-038 — `src/crd/components/space/settings/CommunityGuidelinesEditor.tsx` = guidelines **title** field + `MarkdownEditor` body + references-list editor, reusing the title/references sub-components from the CG template form, + an integration hook with `useUpdateCommunityGuidelinesMutation`) — `045`'s Community-tab editor is markdown-only/incomplete, supersede it. Then wire `useTemplatePicker({ allowedTypes: ['communityGuidelines'] })` into it; on select, replace `{ title, body, references }` behind a `ConfirmationDialog` (existing content) — port the legacy `useCommunityGuidelines.onSelectCommunityGuidelinesTemplate` logic into the integration layer (no MUI). This makes the guidelines flows native CRD, not an FR-037 fallback.
- Post default description (and default whiteboard): in the CRD callout contribution-defaults settings, `useTemplatePicker({ allowedTypes: ['post'] })` (and `['whiteboard']`); on select, set the callout's default post description / default whiteboard.
- For any host that is **not yet CRD**, leave the MUI picker (FR-037) — don't migrate the host here. After this feature the only such hosts are the top-level (L0) create-Space wizard and the platform-admin Innovation Pack list page.

### Step 7 — Innovation Library page (US6)
- `src/crd/components/innovationLibrary/{InnovationLibraryView,TemplateGallery,TemplateTypeFilter}.tsx` per `contracts/innovation-library.ts` — from `prototype/src/app/components/template-library/TemplateLibrary.tsx`. Packs section (uses `InnovationPackCard`) + type-filterable template gallery (uses `TemplateCard`) + preview.
- `src/main/crdPages/innovationLibrary/{CrdInnovationLibraryPage,useInnovationLibrary,innovationLibraryMapper}.ts(x)` — `useInnovationLibraryQuery`; client-side type filter (mirror legacy); lazy preview content.
- Route: in `TopLevelRoutes.tsx`, add `CrdInnovationLibraryPage` (lazy) + keep `MuiInnovationLibraryPage` (lazy), conditional on `crdEnabled` for `/innovation-library`, wrapped in `CrdLayoutWrapper`. Verify anonymous access.

### Step 8 — Innovation Pack admin + public profile (US7, US8)
- `src/crd/components/innovationPack/{InnovationPackForm,InnovationPackCard,CreateInnovationPackDialog,InnovationPackAdminView,InnovationPackProfileView}.tsx` per `contracts/innovation-pack.ts`. `InnovationPackForm` = name / description / avatar / tags / references / `listedInStore` / `searchVisibility`, **provider read-only (no org picker)**. `CreateInnovationPackDialog` = **name + description only** (mirroring the legacy create dialog). `InnovationPackAdminView` = `InnovationPackForm` + `<TemplatesManagerView holderKind="innovationPack" canImport={() => false} .../>` — **no delete-pack here**. `InnovationPackProfileView` = hero + provider card + tags + references + read-only templates manager + "Manage pack" entry when authorised + `ShareButton`.
- `src/main/crdPages/innovationPack/{CrdInnovationPackAdminPage,CrdInnovationPackProfilePage,useInnovationPackAdmin,useInnovationPackProfile,useCreateInnovationPack,useDeleteInnovationPack,innovationPackMapper}.ts(x)` — `useAdminInnovationPackQuery` / `useInnovationPackProfilePageQuery` / `useUpdateInnovationPackMutation` / `useDeleteInnovationPackMutation` / `useCreateInnovationPackMutation` (input `CreateInnovationPackOnAccountInput` = `{accountID, profileData:{displayName, description}}`); reuse `useTemplatesManager(holderKind='innovationPack')` for the templates area.
- Routes: **`src/domain/InnovationPack/InnovationPackRoute.tsx`** hosts BOTH the pack public profile (`<pack.profile.url>`) AND the pack admin (`<pack.profile.url>/settings`) — toggle-gate it (CRD pages vs. the legacy `InnovationPackProfilePage` / `AdminInnovationPackPage`). NOT `AdminInnovationPackRoutes.tsx` (that hosts only the un-migrated `/admin/innovation-packs` list). Pack **create** = the Account-tab `CreateInnovationPackDialog`; pack **delete** = the Account-tab pack-card three-dot menu → `ConfirmationDialog` → `useDeleteInnovationPack`. The platform-admin pack list stays MUI (FR-037). Verify anonymous access to the public profile.

## Verification checklist (maps to Success Criteria)

- [ ] **SC-001**: as a Space admin (toggle-on) — create, edit, duplicate, preview, delete, import for **each** of the 5 types, no MUI fallback, no missing action.
- [ ] **SC-002**: every MUI template-picking flow has a working CRD equivalent (callout, whiteboard, space/subspace, default subspace template, community guidelines, innovation-flow phase default, post default description, import-into-holder) — list any documented "host not yet CRD" fallbacks.
- [ ] **SC-003**: side-by-side, the Space and Innovation Pack templates-management areas are identical except the Space-only Import affordance.
- [ ] **SC-004**: no MUI/Emotion in the loaded bundles for the CRD templates routes/dialogs (`pnpm analyze` / import check).
- [ ] **SC-005**: signed-out — `/innovation-library` and any pack public profile load, browse/filter/preview work, no auth prompt, no errored region.
- [ ] **SC-006**: toggle off → exact legacy MUI templates experience, no residual state.
- [ ] **SC-007**: automated a11y (WCAG 2.1 AA) + keyboard-only walkthrough of create-a-template / pick-a-template / delete-a-template — no blocking issue.
- [ ] **SC-008**: every destructive action (template delete, pack delete, guidelines replacement, discard unsaved form) is preceded by a `ConfirmationDialog`.

## Gotchas

- **CRD layer rules**: no `@mui/*` / `@emotion/*` / `@apollo/client` / `@/domain/*` / `react-router-dom` / `formik` anywhere in `src/crd/`. Behaviour is callbacks; links are `<a href>`. CRD components never call `pickColorFromId` themselves — the mapper does.
- **No `useMemo`/`useCallback`/`React.memo`** — React Compiler handles it.
- **Markdown strings** (callout/post/guidelines text, framing memo) must render through `MarkdownContent`/`InlineMarkdown`, never as `{string}` in a `<p>`.
- **`date-fns` only** in `src/crd/` and `src/main/crdPages/` — not `dayjs`.
- **Don't pre-migrate hosts** — if the callout-creation dialog / whiteboard editor / create-space wizard isn't already CRD, this feature only delivers the picker and wires it where the host *is* CRD; the MUI picker stays elsewhere.
- **Reuse `045`'s files, don't fork** — `SpaceSettingsTemplatesView` and the four `space/settings/Template*Dialog.tsx` files are refactored-in-place (relocated/replaced), not duplicated; the `045` Templates tab becomes a thin consumer of the new components.
- **`useTemplatesTabData` currently has `onCreateTemplate` as a TODO** and `TemplateEditDialog` only edits profile+tags — Steps 4 closes both.
