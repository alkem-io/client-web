# Quickstart: OfficeDocs Rename UX

## 1. Branch

```bash
# from the client-web repo root
git checkout develop && git pull
git checkout -b 114-officedocs-rename-ux
```

## 2. Dev loop

```bash
pnpm install            # if needed
pnpm codegen            # REQUIRED — the callout gate queries gain collaboraDocument.authorization
pnpm dev
pnpm test               # vitest
pnpm lint
```

## 3. What to build (see plan.md → Source Code)

1. **Query + codegen (C1)**: add `authorization { id myPrivileges }` to the `collaboraDocument` selection in
   `src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql` (`CalloutDetails`) **and**
   `src/domain/collaboration/callout/graphql/CalloutContent.graphql` — ideally via a shared
   `CollaboraDocumentGate` fragment; run `pnpm codegen`.
2. `crd/components/collabora/CollaboraDocumentDisplayName.tsx` — mirror `WhiteboardDisplayName`.
3. `domain/…/collaboraDocument/useRenameCollaboraDocument.ts` — state + `displayNameValidator` +
   `useUpdateCollaboraDocumentMutation`.
4. `domain/…/collaboraDocument/RenameCollaboraDocumentDialog.tsx` — single-field dialog.
5. **Menu action (U1)**: `deriveCalloutMenuVisibility.ts` (add `documentMyPrivileges` input;
   `canRenameDocument = isCollaboraDocument && (documentUpdate || editable)`), `CalloutContextMenu.tsx` (the
   item), `CalloutSettingsConnector.tsx` (supply `documentMyPrivileges`, host the dialog).
6. **Editor header**: `CollaboraFramingEditorOverlay.tsx` (accept `canRename`, render control) +
   `CalloutDetailDialogConnector.tsx` (derive & pass `canRename`).
7. **Edit-dialog cleanup**: `FramingEditorConnector.tsx` `case 'document'` edit mode — read-only existing-doc
   box, drop the "Create new" picker, no rename; plumb the doc via `CalloutFormConnector` +
   `mapCalloutDetailsToFormValues.ts` (`editMeta`, mirror `memoId`).
8. i18n strings.

## 4. Manual acceptance walkthrough (maps to spec)

Prereq: a callout whose **framing is a Collabora document**, and three accounts — (A) can edit the
**document** but **not** the callout, (B) can edit the **callout** but **not** the document, (C) can edit
**neither**.

- **US1 (P1) — menu action** — As **A**: callout context menu → **"Rename document"** present → rename to a
  valid name → the document-name surfaces update. As **C**: action absent. As **B**: action present (union).
- **US2 (P1) — editor header** — As **A** or **B**: open the doc → pencil next to the title → rename → header
  updates without reload. As **C**: title read-only, no pencil.
- **US3 (P2) — edit-dialog cleanup** — As a callout editor: open the callout edit dialog → DOCUMENT box shows
  the current name **read-only**, no "Create new" picker, no rename control in the box.
- **US4 (P3) — download** — After rename, download from Collabora's File menu → filename is the new name with
  the **original extension** preserved.
- **Validation** — empty / whitespace / <3 / >128 chars → rejected with a message, name unchanged (inline + dialog).
- **Card title (expected divergence, C2)** — the space-feed callout **card** title does **not** change on
  document rename (it shows the callout framing title). This is intended.

## 5. Automated verification

```bash
pnpm test CollaboraDocumentDisplayName useRenameCollaboraDocument RenameCollaboraDocumentDialog
```

## 6. PR

- Branch `114-officedocs-rename-ux`; PR body closes `alkem-io/client-web#9879` and references epic alkemio#1842.
