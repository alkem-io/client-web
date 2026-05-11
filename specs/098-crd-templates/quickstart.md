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
| Routing & toggle | `src/main/routing/TopLevelRoutes.tsx`, `src/domain/platformAdmin/domain/innovationPacks/AdminInnovationPackRoutes.tsx` | Lazy CRD/MUI route pairs gated by `useCrdEnabled()`. |
| i18n | `src/crd/i18n/templates/templates.{en,nl,es,bg,de,fr}.json` + register `crd-templates` in `src/core/i18n/config.ts` (`crdNamespaceImports`) + `@types/i18next.d.ts` | English source + all 5 other languages edited in this PR (CRD i18n is NOT Crowdin-managed). |
| Untouched | `src/domain/templates/*`, `src/domain/templates-manager/*`, `src/domain/InnovationPack/*`, `src/domain/spaceAdmin/SpaceAdminTemplates/*`, `src/main/topLevelPages/InnovationLibraryPage/*` | These stay; serve toggle-off. Read them for reference only. |

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
- `src/crd/components/templates/TemplateFormDialog.tsx` (evolve `space/settings/TemplateEditDialog.tsx`) — common fields + per-type form slot + Save/Cancel + discard guard (`DiscardChangesDialog` = `ConfirmationDialog` variant).
- `forms/{Callout,Whiteboard,Post,Space,CommunityGuidelines}TemplateForm.tsx` per `contracts/template-forms.ts`. Reuse `MarkdownEditor`, `tags-input`, the CRD whiteboard editor, the CRD references-list editor. **CalloutTemplateForm is the big one** — framing-kind picker + per-kind framing content + allowed-contribution toggles + comment settings + contribution defaults.
- `src/main/crdPages/templates/useTemplateForms.ts` — form state + validation + `useCreateTemplate*` / `useUpdate*` mutations + image uploads (`useHandlePreviewImages`, `useUploadMediaGalleryVisuals`); reuse the MUI-free `src/domain/templates/components/Forms/common/mappings.ts`. Wire create/edit into `useTemplatesManager` (replace the existing `onCreateTemplate` TODO).

### Step 5 — set-default & save-as-template (US1, US4)
- `src/crd/components/templates/SetDefaultTemplateDialog.tsx` (← `ChangeDefaultSubspaceTemplateDialog`) + `SaveAsTemplateDialog.tsx` (← `SaveSubspaceAsTemplateDialog`) per `contracts/set-default-dialog.ts`; both reuse `TemplatePicker` (`mode: 'select'`).
- `src/main/crdPages/templates/useSetDefaultTemplate.ts` (`updateTemplateDefault` + the innovation-flow phase-default path) and `useSaveAsTemplate.ts` (`createTemplateFromSpace` / `…FromContentSpace`).
- Wire the default-subspace-template card in `045`'s Subspaces tab and the per-phase default in `045`'s Layout tab to these (they consume `098`'s components).

### Step 6 — remaining consumption flows (US4, US5)
- Space/subspace creation: in the CRD create-space / create-subspace flow (`src/main/crdPages/space/settings/CreateSubspaceDialog.tsx` exists), add a Space-template selector via `useTemplatePicker({ allowedTypes: ['space'] })` with an explicit "Empty" option; pre-select the parent's default subspace template; confirm-before-overwrite when the form has data; create from the selected template (or empty).
- Whiteboard creation: in the CRD whiteboard add flow, `useTemplatePicker({ allowedTypes: ['whiteboard'] })`; on select, start the new whiteboard from that drawing; clear → blank.
- Community guidelines: in `045`'s Community tab guidelines editor, `useTemplatePicker({ allowedTypes: ['communityGuidelines'] })`; on select, replace text + references behind a `ConfirmationDialog` (existing content) — port the legacy `useCommunityGuidelines.onSelectCommunityGuidelinesTemplate` logic into the integration layer.
- Post default description: in the CRD callout contribution-defaults settings, `useTemplatePicker({ allowedTypes: ['post'] })`; on select, set the callout's default post description.
- For any host that is **not yet CRD**, leave the MUI picker (FR-037) — don't migrate the host here.

### Step 7 — Innovation Library page (US6)
- `src/crd/components/innovationLibrary/{InnovationLibraryView,TemplateGallery,TemplateTypeFilter}.tsx` per `contracts/innovation-library.ts` — from `prototype/src/app/components/template-library/TemplateLibrary.tsx`. Packs section (uses `InnovationPackCard`) + type-filterable template gallery (uses `TemplateCard`) + preview.
- `src/main/crdPages/innovationLibrary/{CrdInnovationLibraryPage,useInnovationLibrary,innovationLibraryMapper}.ts(x)` — `useInnovationLibraryQuery`; client-side type filter (mirror legacy); lazy preview content.
- Route: in `TopLevelRoutes.tsx`, add `CrdInnovationLibraryPage` (lazy) + keep `MuiInnovationLibraryPage` (lazy), conditional on `crdEnabled` for `/innovation-library`, wrapped in `CrdLayoutWrapper`. Verify anonymous access.

### Step 8 — Innovation Pack admin + public profile (US7, US8)
- `src/crd/components/innovationPack/{InnovationPackForm,InnovationPackCard,CreateInnovationPackDialog,InnovationPackAdminView,InnovationPackProfileView}.tsx` per `contracts/innovation-pack.ts`. AdminView = `InnovationPackForm` + `<TemplatesManagerView holderKind="innovationPack" canImport={() => false} .../>`. ProfileView = hero + provider card + tags + references + read-only templates manager + "Manage pack" entry when authorised + `ShareButton`.
- `src/main/crdPages/innovationPack/{CrdInnovationPackAdminPage,CrdInnovationPackProfilePage,useInnovationPackAdmin,useInnovationPackProfile,useCreateInnovationPack,innovationPackMapper}.ts(x)` — `useAdminInnovationPackQuery` / `useInnovationPackProfilePageQuery` / `useUpdateInnovationPackMutation` / `useDeleteInnovationPackMutation` / `useCreateInnovationPackOnAccountMutation`; reuse `useTemplatesManager(holderKind='innovationPack')` for the templates area.
- Routes: pack public profile route in `TopLevelRoutes.tsx` (CRD vs. legacy `InnovationPackRoute`), toggle-gated; pack admin route in `AdminInnovationPackRoutes.tsx` (CRD `CrdInnovationPackAdminPage` vs. legacy `AdminInnovationPackPage`), toggle-gated. Delete-pack goes through `ConfirmationDialog`.

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
