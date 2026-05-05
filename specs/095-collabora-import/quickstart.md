# Phase 1 Quickstart: Document Framing on a Post — Create New or Upload

**Branch**: `095-collabora-import` | **Date**: 2026-05-04

## Prerequisites

1. **Server**: alkem-io/server branch `095-collabora-import` checked out and running locally on `localhost:4000/graphql`.
2. **file-service-go**: running and reachable (it's where the upload goes after the GraphQL gateway parses the multipart request).
3. **Collabora Online**: running and reachable from the browser (for the editor iframe after creation).
4. **License entitlement**: the test space's license must include `SPACE_FLAG_OFFICE_DOCUMENTS`. Without it, the Document framing option is disabled by design (FR-013).
5. **Node ≥ 24.0.0 (Volta 24.14.0)**, **pnpm ≥ 10.17.1**.

## Setup

```bash
# 1. Switch to feature branch
git switch 095-collabora-import

# 2. Install dependencies
pnpm install

# 3. Regenerate GraphQL types (requires backend on localhost:4000/graphql with the matching server branch)
pnpm codegen

# 4. Start dev server
pnpm start
```

## Development workflow

### Step 1 — GraphQL change first

Update `src/domain/collaboration/calloutsSet/useCalloutCreation/calloutCreation.graphql` per `contracts/graphql-mutation-extension.md`. Run `pnpm codegen`. Verify:

- `useCreateCalloutMutation` accepts `{ calloutData, file? }`.
- `CreateCollaboraDocumentInput.{displayName, documentType}` are optional in `graphql-schema.ts`.

Commit `calloutCreation.graphql` and the regenerated `src/core/apollo/generated/*.ts` together.

### Step 2 — Domain helpers (pure functions)

Create under `src/domain/collaboration/calloutContributions/collaboraDocument/`:

1. `collaboraImportFormats.ts` — the supported-extensions tuple, the 15 MB cap, the joined accept-attr.
2. `validateCollaboraImportFile.ts` — pre-check returning `{ ok, file } | { ok: false, error }`. Order: single file → extension → size.
3. `deriveCollaboraDocumentDisplayName.ts` — typed-vs-prefill decision rule (see `data-model.md`).
4. `filenameWithoutExtension.ts` — strip-extension helper.

Each ships with a `*.spec.ts` neighbour. Vitest table tests for each rejection branch and the exact-cap boundary. Tests should pass green before any UI work.

### Step 3 — Hook extension

Update `src/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation.ts` to accept an optional `file: File` argument on `handleCreateCallout` and pass it through to the mutation variables. Mirror in `useCalloutCreationWithPreviewImages.ts` (the whiteboard wrapper). Existing callsites must compile unchanged.

### Step 4 — UI (CRD path)

1. Create `src/crd/forms/callout/DocumentImportZone.tsx` — pure CRD presentational component:
   - Drag-and-drop area with click-to-upload affordance.
   - Helper text near the zone showing `.docx, .xlsx, .pptx up to 15 MB` (i18n'd).
   - Accept-attr from `COLLABORA_IMPORT_ACCEPT_ATTR`.
   - Emits `onChange(file)` and `onError(error)` — never imports `@apollo/client` or anything from `@/domain/`.
   - Keyboard-operable (focus-visible ring, Enter/Space opens picker), `aria-busy` while uploading, `role="alert"` on error.
2. Modify `src/crd/forms/callout/CollaboraDocumentTypePicker.tsx` to render the import zone after the three blank-create cards, separated by an "or" divider.
3. Wire it in `src/main/crdPages/space/callout/CalloutFormConnector.tsx`:
   - Read the staged file from form values.
   - Pass it to `handleCreateCallout(input, file)`.
   - Map server errors (`FORMAT_NOT_SUPPORTED`, `STORAGE_UPLOAD_FAILED`, `STORAGE_SERVICE_UNAVAILABLE`, `BAD_USER_INPUT`, `FORBIDDEN`) to the same i18n keys the client validator uses, surfacing inline.
4. Update `src/main/crdPages/space/callout/calloutFormMapper.ts` to branch on upload-vs-blank — call `deriveCollaboraDocumentDisplayName` to decide whether to send `displayName` explicitly. Update `calloutFormMapper.test.ts` accordingly.

### Step 5 — UI (MUI path)

1. Modify `src/domain/collaboration/callout/CalloutForm/CalloutFormFramingSettings.tsx`: add the upload zone after the three document-type radios when `framing.type === COLLABORA_DOCUMENT`. The MUI implementation can be a simple `<input type="file">` with a styled wrapper — drag-and-drop is nice-to-have on the MUI surface (the CRD surface is the design-canonical one).
2. Wire the file through whichever submit-mapping the MUI form uses (mirror the CRD `calloutFormMapper.ts` logic; reuse `deriveCollaboraDocumentDisplayName`).
3. Same server-error mapping as the CRD path.

### Step 6 — Auto-prefill behaviour

In both UI paths, when a file is staged:

- If `framing.profile.displayName` is empty, set it to `filenameWithoutExtension(file.name)` AND set `framing.collaboraDocument.autoPrefilledTitle` to the same value.
- If non-empty, do NOT overwrite (FR-004a).

At submit time, both UI paths use `deriveCollaboraDocumentDisplayName({ mode: 'upload', postTitle, autoPrefilledTitle })` to produce the right `framing.collaboraDocument` payload.

### Step 7 — Response-options cleanup

1. `src/domain/collaboration/callout/CalloutForm/CalloutFormContributionSettings.tsx`: remove the `CalloutContributionType.CollaboraDocument` entry (the one currently `disabled: true` at line ~157) from the radio-options array. Adjust any tests that referenced it.
2. CRD response-options panel (the surface that today shows the "Documents (Coming soon)" tab): remove that tab entirely.

### Step 8 — i18n

Add the new strings:

- `src/core/i18n/en/translation.en.json`: MUI scope (`callout.create.framingSettings.collaboraDocument.upload.*` for label, helper, errors).
- `src/crd/i18n/space/space.en.json`: CRD scope (`forms.collaboraImport.*`).
- Same keys with translated values in `space.{nl,es,bg,de,fr}.json` (manual per the CRD CLAUDE policy).

## Validation

```bash
# Type-check + lint
pnpm lint

# All tests (helpers + mapper)
pnpm vitest run

# Targeted tests for new helpers
pnpm vitest run src/domain/collaboration/calloutContributions/collaboraDocument
pnpm vitest run src/main/crdPages/space/callout/calloutFormMapper.test.ts
```

Manual tests below; expect to run them against the dev stack.

## Manual test recipes

### US1 — Blank-create flow

1. In a space whose license has `SPACE_FLAG_OFFICE_DOCUMENTS`, click "Add Post".
2. Pick **Document** in "Add to post".
3. Click the **Word Document** card. Verify:
   - The card highlights.
   - The upload zone (when present in the same dialog) becomes inactive while the card is selected.
   - The submit button enables.
4. Enter a post title, click Post. Verify:
   - The dialog closes.
   - The view scrolls / navigates to the new post.
   - The Collabora editor opens with an empty Word document.
5. Repeat with Spreadsheet and Presentation.

### US2 — Upload flow

1. Same setup as above.
2. Pick **Document** framing.
3. Drop a `.docx` (or `.xlsx`, `.pptx`) file into the upload zone (or click to pick). Verify:
   - The dialog reflects the chosen file (filename + size).
   - The blank-create cards become inactive.
   - The post title auto-prefills to the filename minus extension.
4. Click Post. Verify:
   - Busy indicator shown; second click ignored.
   - On success: dialog closes, view navigates to new post, editor opens with the file's content.
5. Variant: enter a custom post title before submit. Verify on submit that the doc's display name in the editor matches the typed title (sent explicitly via `displayName`).
6. Variant: leave the auto-prefill alone. Submit. Verify the doc's name in the editor matches the filename minus extension (server-derived because FE sent `framing.collaboraDocument: {}`).

### US3 — Unsupported file rejection

1. Open the upload zone; try to drop a `.pdf`. Verify:
   - The OS picker filters it out (non-deterministic across OSes — drag-drop bypasses).
   - If the file lands in the zone, the dialog shows an inline error naming `.docx, .xlsx, .pptx`.
   - No network request goes out (verify in DevTools Network tab).
   - All other inputs preserved.
2. Repeat with `.doc`, `.odt`, `.txt`, an image — same outcome.
3. Server-side: rename a `.pdf` to `.docx` and drop it. Verify the upload starts but the server rejects with `FORMAT_NOT_SUPPORTED` (415) and the dialog surfaces the same inline supported-formats message.

### US4 — Oversized file rejection

1. Find or generate a `.docx` slightly larger than 15 MB.
2. Drop it. Verify:
   - The dialog shows an inline error naming the 15 MB cap.
   - No network request goes out.
   - All other inputs preserved.
3. Verify a `.docx` exactly at 15 MB is accepted (boundary).

### US5 — License + permission gate

1. As an author in a space WITHOUT `SPACE_FLAG_OFFICE_DOCUMENTS`, open Add Post. Verify:
   - The Document framing option is disabled with the existing "not enabled" tooltip on hover.
   - Neither the cards nor the upload zone are reachable.
2. As an unauthenticated viewer, verify the post-creation entry point is hidden entirely (existing behaviour, unchanged).

### US6 — Documents not in Response Options

1. Open Add Post on a space that allows responses. Pick a non-Document framing (Memo, Whiteboard, etc.).
2. Scroll to the Responses section. Verify:
   - **CRD path**: no "Documents" tab (no "Coming soon" stub).
   - **MUI path**: no "Document" or "Collabora Document" radio button (visible or disabled).
3. Verify the four other response types (Links & Files, Posts, Memos, Whiteboards) are unchanged.

### US7 — Parity (post-creation behaviour)

1. Create a post with a blank Word Document (US1) and another by uploading a `.docx` (US2).
2. For each:
   - Open the editor — both load identically.
   - Edit a few characters; observe the save indicator.
   - Rename the post via the existing rename UX; verify the Collabora editor's title bar updates and the underlying file extension is preserved.
   - Delete the post; verify cascading deletion (no orphan storage).

### Service-unavailable behaviour (FR-011)

1. Stop file-service-go. Try an upload.
2. Verify the dialog shows a non-technical "Document service is temporarily unavailable" message.
3. Verify the dialog stays open and the FE does not auto-retry (Network tab shows exactly one request).

## Commands cheat sheet

```bash
pnpm start                              # dev server (localhost:3001)
pnpm codegen                            # regenerate GraphQL hooks
pnpm vitest run                         # all tests
pnpm vitest run --reporter=basic <path> # focused test file
pnpm lint                               # tsc + biome + eslint
pnpm format                             # biome format
```

## References

- Spec: [spec.md](spec.md)
- Plan: [plan.md](plan.md)
- Phase 0 research: [research.md](research.md)
- Data model: [data-model.md](data-model.md)
- GraphQL contract: [contracts/graphql-mutation-extension.md](contracts/graphql-mutation-extension.md)
- Server branch: <https://github.com/alkem-io/server/tree/095-collabora-import>
- Sibling FE ticket (out of P1): <https://github.com/alkem-io/client-web/issues/9620>
- This iteration's FE ticket: <https://github.com/alkem-io/client-web/issues/9629>
- Apollo upload-link config: `src/core/apollo/graphqlLinks/httpLink.ts`
- Existing Documents MVP: `specs/085-collabora-callout/`
