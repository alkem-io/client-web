# Research: OfficeDocs Rename UX

**Phase 0** — decisions resolving all code-level unknowns (branch `develop`), including the
de-conflated permission model, the standalone-dialog surface, and the analyzer findings C1/C2/U1.

## R1 — Rename control: reuse or build?

- **Decision**: Build `CollaboraDocumentDisplayName`, mirroring `WhiteboardDisplayName`
  (`src/crd/components/whiteboard/WhiteboardDisplayName.tsx`) and `MemoDisplayName` exactly
  (pencil → input → Check/Cancel; Enter=save, Escape=cancel).
- **Rationale**: Keeps the inline interaction "indistinguishable in shape" (SC-007) and reusable for
  the standalone dialog and the future contributions surface (FR-014).
- **Alternatives**: `InlineEditText` (auto-commit) — rejected (diverges from explicit confirm/cancel).

## R2 — Persistence path

- **Decision**: Existing `useUpdateCollaboraDocumentMutation`
  (`variables: { updateData: { ID, displayName } }`); the op returns `{ id, profile { id, displayName } }`.
- **Rationale**: Backend + client op exist; returned normalized fields update the Apollo cache so the
  document-name surfaces re-render consistently (FR-009/FR-010). No new op/schema.

## R3 — Permission model

- **Decision**: Rename allowed iff **`collaboraDocument.authorization.myPrivileges ⊇ Update` OR
  `callout.authorization.myPrivileges ⊇ Update`** — two **independent** privileges. Compute for (a) the
  context-menu visibility (`deriveCalloutMenuVisibility.ts`) and (b) the editor overlay
  (`CalloutDetailDialogConnector.tsx`).
- **Precedent**: memo/whiteboard already gate on the **entity's own** authorization
  (`CrdMemoDialog.tsx:81–86`). **Supersedes** the overlay's "authenticated ⇒ editable" assumption.

## R4 — "Can edit the file" + query coverage (C1)

- **Decision**: The **CollaboraDocument's own `Update` privilege**. `CollaboraDocument.authorization`
  exists in the schema (`graphql-schema.ts:1391`) but is **not selected** today. Both the list menu and
  the editor overlay read `callout.framing.collaboraDocument` from the **CalloutsSet** callout model, so
  add `authorization { id myPrivileges }` to the `collaboraDocument` selection in
  `CalloutsSetQueries.graphql` (`CalloutDetails`) **and** in `CalloutContent.graphql` (which also selects
  `collaboraDocument` for other consumers). **Prefer a shared fragment** (`CollaboraDocumentGate`) used by
  both so the selection cannot drift. Run `pnpm codegen`.
- **Rationale (C1)**: Multiple queries inline `collaboraDocument`; adding the field to only one would leave
  the gate undefined on the other path. Confirmed: `CalloutContent.graphql` + `CalloutsSetQueries.graphql`
  both select it; no existing shared fragment covers both.

## R5 — Editor header live propagation

- **Decision**: `CollaboraFramingEditorOverlay` accepts `canRename` (the union) and holds local
  `displayName` state seeded from `title`; on success it updates local state (FR-009) and the mutation's
  returned `{ id, profile.displayName }` normalizes the cache so other document-name surfaces converge
  (FR-010).

## R6 — Menu action + standalone dialog + menu-visibility inputs (U1)

- **Decision**: Add a **"Rename document"** item to `CalloutContextMenu.tsx` (the callout kebab in the
  space list, via `LazyCalloutItem.tsx` → `PostCard` settingsSlot). `deriveCalloutMenuVisibility.ts`
  **already** exposes `isCollaboraDocument`; add a new input `documentMyPrivileges: AuthorizationPrivilege[]
  | undefined` and compute `canRenameDocument = isCollaboraDocument && (documentUpdate || editable)`
  (`documentUpdate` from `documentMyPrivileges ⊇ Update`, `editable` = the existing callout-Update check).
  `CalloutSettingsConnector.tsx` supplies `documentMyPrivileges` from
  `callout.framing.collaboraDocument?.authorization?.myPrivileges` and hosts the new
  `RenameCollaboraDocumentDialog` (single field + Save/Cancel; Dialog primitives; reuses
  `useRenameCollaboraDocument` + `displayNameValidator`).
- **Rationale (U1)**: The deriver's input shape is known — `isCollaboraDocument` is present; only the
  document privilege is missing, so a single new input field closes the gap.
- **Alternatives**: Reuse the callout edit dialog — rejected (not accessible to file-only editors).

## R7 — Callout edit dialog document box (cleanup only)

- **Decision**: In `FramingEditorConnector` `case 'document'` **edit mode**, stop rendering the read-only
  `CollaboraDocumentTypePicker` ("Create new"); render a read-only existing-document box (icon + type +
  name, memo-box style at `FramingEditorConnector.tsx:311–330`). **No** rename control in the box.

## R8 — Callout list card title (C2)

- **Decision**: **Do not** propagate document rename to the space-feed callout **card** title.
  `mapCalloutDetailsToPostCard` (`src/main/crdPages/space/dataMappers/calloutDataMapper.ts:119`) sets
  `title: callout.framing.profile.displayName` — the **callout framing** display name, a **distinct** field
  from `collaboraDocument.profile.displayName`. Renaming the document does not change it. FR-010/SC-004 are
  therefore scoped to the document-name surfaces.
- **Rationale (C2)**: The card title is the callout framing title, not the document title; changing that
  binding is a product decision (would make document rename silently rewrite the callout framing name).
- **Optional follow-up**: If product wants the card to reflect document renames, map the card title to
  `framing.collaboraDocument?.profile?.displayName ?? framing.profile.displayName` for document callouts —
  a small, separable change, deliberately out of scope here.

## R9 — Download filename / extension

- **Decision**: **Verification only.** No client download UI exists — export is inside the Collabora iframe;
  the base name derives from the WOPI `BaseFileName` (fed by `displayName`) and the file service preserves
  the extension. US4 is validated end-to-end, not implemented.

## Open items deferred to implementation

- Exact menu-item placement for "Rename document" among existing items.
- Whether `useRenameCollaboraDocument` owns validation-error message mapping or the host does.
- Whether to introduce the shared `CollaboraDocumentGate` fragment now (recommended) or inline the field in
  both queries.
