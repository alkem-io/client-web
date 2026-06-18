# Quickstart: CRD Create Space Dialog

## What this delivers

A CRD-native **Create Space** dialog that replaces the MUI one at the contributor account pages (user + organization). The MUI dialog stays for legacy-design surfaces.

## Build order

1. **CRD component** — `src/crd/components/space/CreateSpaceDialog.tsx`
   - Clone `src/crd/components/space/settings/CreateSubspaceDialog.tsx` as the scaffold (incl. `FieldShell` / `FileField` + `MarkdownEditor` + `useDialogCloseGuard` + sticky header/footer). **Keep the markdown description field** (matches the Subspace dialog).
   - Deltas vs. the Subspace dialog: **Avatar → Page Banner** (`VisualType.Banner`, wide aspect; Card Banner unchanged); add a **URL slug** input (inline `alkem.io/` prefix), an **Add Tutorials** checkbox, a required **Accept terms** checkbox whose `<terms>` link (`<Trans>`) opens a terms dialog, and a **no-available-plan** message.
   - Props per `contracts/createSpaceDialog.ts` (incl. `MarkdownUploadProps` + `termsUrl`). Zero `@mui/*`. All strings via `useTranslation('crd-createSpace')`. `isDirty` includes `description`.

2. **i18n** — `src/crd/i18n/createSpace/createSpace.{en,nl,es,bg,de,fr}.json`
   - Keys: `dialog.title/subtitle`, field `label/hint/placeholder` (incl. `description.*`), `validation.*`, `slug.*`, `terms.*` (verbatim MUI copy — `terms.checkboxLabel` carries the `<terms>` tag), `license.noPlans`, `addTutorials.label`, `buttons.{cancel,create,creating}`.
   - Register `'crd-createSpace'` in `crdNamespaceImports` (`src/core/i18n/config.ts`); add namespace types in `@types/i18next.d.ts`.
   - "Space"/"Host" stay English (glossary). All six languages in this PR.

3. **Integration hook** — `src/main/crdPages/topLevelPages/createSpace/useCreateSpace.ts`
   - Copy `…/spaceSettings/subspaces/useCreateSubspace.ts` as the scaffold (keeps `description` in form state, validated `max MARKDOWN_TEXT_LENGTH`).
   - Add: `useSpacePlans({ accountId, skip:!open||!accountId })` → first plan / no-plan guard; slug auto-derive via `createNameId` + `isSlugEdited` lock + `nameIdValidator`; page-banner/card constraints via `useDefaultVisualTypeConstraintsQuery` (`Banner`/`Card`); filter picker sources to selectable 4-state-flow templates (research R6).
   - Submit via the reused `useSpaceCreation` (incl. `about.profile.description`); on success `addSpaceWelcomeCache` + Sentry `info` + refetch `AccountInformation` (+ `useDashboardSpaces().refetchSpaces`) + `onSpaceCreated ?? navigate(url)`.

4. **Connector** — `src/main/crdPages/topLevelPages/createSpace/CrdCreateSpaceDialog.tsx`
   - Props per `contracts/useCreateSpace.ts`. Wrap in `StorageConfigContextProvider` (`locationType="account"`, `accountId`, `skip={!open}`); run `useCreateSpace(...)` + `mdCreate = useMarkdownEditorIntegration({ temporaryLocation: true })`; read `termsUrl = useConfig().locations?.terms` and `urlPrefix = usePlatformOrigin()?.toLowerCase() + '/'`.
   - Render `<CreateSpaceDialog {...hook} {...mdCreate} termsUrl={termsUrl} urlPrefix={urlPrefix} accountName={accountName} />` + `<TemplatePicker {...hook.picker} />` + the overwrite-confirm dialog. The org tab passes `accountName` (org display name); the user tab omits it.

5. **Wire entry points** — replace the MUI dialog in both:
   - `…/userPages/settings/account/CrdUserAccountTab.tsx` (drop the `CreateSpace` import at line 23; swap the JSX at line 215).
   - `…/organizationPages/settings/account/CrdOrgAccountTab.tsx` (line 24 import; line 207 JSX).
   - Keep the existing `createSpaceOpen` state + `tryCreate('spaces', entitled.spaces, …)` gate.

6. **Standalone demo (optional, P3)** — `src/crd/app/pages/CreateSpacePage.tsx` + route in `CrdApp.tsx`, with mock props.

## Run / verify

```bash
pnpm crd:dev                 # standalone preview on :5200 (no backend) — iterate on the dialog
pnpm start                   # full app on :3001 (backend on :3000)
pnpm lint                    # TS + Biome + ESLint (react-compiler)
pnpm vitest run src/main/crdPages/topLevelPages/createSpace
```

**No `pnpm codegen`** — no `.graphql` changes.

## Manual QA (design version = CRD: `localStorage.setItem('alkemio-design-version','2'); location.reload()`)

- User account page → **Create Space** opens the **CRD** dialog (no MUI styling); subtitle says "in your account". From an **org** account → subtitle names the org.
- Type a name → slug auto-fills (lowercase, accents folded) and the field shows the env origin prefix (`http://localhost:3000/` locally); edit the slug → it stops following the name.
- On a wide screen the **page banner (left)** and **card banner (right)** sit side by side.
- The **Accept terms** checkbox sits in the footer with Cancel/Create (above them on mobile).
- Pick a template with many callouts → the preview accordion's **last item is not clipped**.
- Pick a template → preview + pre-fill; only 4-state-flow templates are offered.
- Upload an undersized banner → clear error; upload a valid one → preview.
- Leave terms unchecked → **Create** disabled; check it (valid name) → create → land on the new Space.
- Force an account with no Space plan → no-plan message, **Create** blocked.
- Edit fields then press Esc / X → **Discard changes?** confirm appears.
- Header + Cancel/Create stay visible at a short viewport while the body scrolls.
- Repeat from the **organization** account page → Space created under the org account.

## Definition of done

- [ ] CRD dialog opens at both account tabs; MUI `CreateSpace` no longer imported by `crdPages` (SC-006).
- [ ] Field set complete (name, slug, tagline, description, tags, page banner, card banner, template, tutorials, terms) — markdown description carried over from the Subspace dialog (SC-003).
- [ ] No-plan / invalid-image / server-error each show a clear message; no orphaned Space (SC-007).
- [ ] All six languages present, "Space" untranslated (SC-005).
- [ ] Sticky header/footer at 768px height (SC-004).
- [ ] `pnpm lint` + `pnpm vitest run` green; no codegen needed.
