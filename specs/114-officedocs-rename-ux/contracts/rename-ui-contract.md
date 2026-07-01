# UI Contract: OfficeDocs Rename UX

`client-web` exposes no external API. The "contracts" are the **component interfaces**, the
**query change**, and the **existing mutation** the feature depends on.

## Query contract (client selection extended — no schema change) — C1

Add to **every** callout query selecting `collaboraDocument` that feeds a gate — `CalloutsSetQueries.graphql`
(`CalloutDetails`, feeds the list menu + the editor overlay) and `CalloutContent.graphql` — ideally via a
shared fragment:
```graphql
fragment CollaboraDocumentGate on CollaboraDocument {
  id
  documentType
  authorization { id myPrivileges }
  profile { id displayName url }
}
```
Run `pnpm codegen` after.

## Consumed GraphQL mutation (existing — not modified)

```graphql
mutation UpdateCollaboraDocument($updateData: UpdateCollaboraDocumentInput!) {
  updateCollaboraDocument(updateData: $updateData) {
    id
    profile { id displayName }
  }
}
# UpdateCollaboraDocumentInput = { ID: UUID!, displayName?: String }
```
Returning `{ id, profile.displayName }` normalizes the Apollo cache (FR-009/FR-010).

## Derived gate (used by every surface)

```ts
const documentUpdate = (collaboraDocument.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Update);
const calloutUpdate  = (callout.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Update);
const canRename = documentUpdate || calloutUpdate;
```

## New component — `CollaboraDocumentDisplayName` (inline control)

Mirrors `WhiteboardDisplayName` / `MemoDisplayName` exactly (SC-007):
```ts
type CollaboraDocumentDisplayNameProps = {
  displayName: string; value?: string; readOnly?: boolean;
  editing?: boolean; saving?: boolean; error?: string | null;
  onChange?: (v: string) => void; onEdit?: () => void; onSave?: () => void; onCancel?: () => void;
};
```

## New hook — `useRenameCollaboraDocument`

```ts
function useRenameCollaboraDocument(args: {
  collaboraDocumentId: string; displayName: string; canRename: boolean;
}): {
  editing: boolean; draft: string; saving: boolean; error: string | null; readOnly: boolean; // = !canRename
  startEdit(): void; changeDraft(v: string): void; save(): Promise<void>; cancel(): void;
};
```
`save()` trims, validates (`displayNameValidator`), no-ops if unchanged, calls the mutation, and on failure
keeps the persisted name + sets `error` (FR-013). Reuse target for header, dialog, and future contributions.

## New component — `RenameCollaboraDocumentDialog` (standalone)

```ts
type RenameCollaboraDocumentDialogProps = {
  open: boolean; collaboraDocumentId: string; displayName: string; onClose: () => void;
};
```
Single name field + Save/Cancel, built on the Dialog primitives (`src/crd/primitives/dialog.tsx`), backed by
`useRenameCollaboraDocument`. Opened from the "Rename document" menu action.

## Host surface contracts (edits)

### 1. `deriveCalloutMenuVisibility` + `CalloutContextMenu` — "Rename document" action (U1)
- `CalloutMenuPermissionsInput` gains `documentMyPrivileges?: AuthorizationPrivilege[]` (the doc's own privileges);
  `isCollaboraDocument` already exists.
- Derive `canRenameDocument = isCollaboraDocument && (documentMyPrivileges?.includes(Update) || editable)`.
- `CalloutContextMenu` gains `onRenameDocument?: () => void` + shows the item iff `canRenameDocument`.
- `CalloutSettingsConnector` supplies `documentMyPrivileges` from
  `callout.framing.collaboraDocument?.authorization?.myPrivileges` and hosts `RenameCollaboraDocumentDialog`.

### 2. `CollaboraFramingEditorOverlay` — editor header
- **New prop**: `canRename: boolean`. Renders `CollaboraDocumentDisplayName` in the header (replacing the
  static `DialogTitle` text) via `useRenameCollaboraDocument`; local title synced on success (R5).
- `CalloutDetailDialogConnector` passes `canRename = documentUpdate || calloutUpdate` (from
  `framing.collaboraDocument.authorization` + `callout.authorization`).

### 3. `FramingEditorConnector` `case 'document'` — edit-dialog box (CLEANUP ONLY)
- **Edit mode**: read-only existing-document box (icon + type + name); **no** `CollaboraDocumentTypePicker`
  "Create new" box; **no** rename control (FR-005, SC-005). Create mode unchanged.

## Out-of-scope binding (C2)
The space-feed callout **card** title (`calloutDataMapper.ts:119` → `callout.framing.profile.displayName`)
is a **separate** field and is **not** updated by document rename. FR-010/SC-004 exclude it.

## i18n contract
New keys under `crd-space`: "Rename document" (menu + dialog title), Save/Cancel; reuse existing
`forms.validations.*`. Mirror to the other locale files.
