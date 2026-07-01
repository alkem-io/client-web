# Implementation Plan: OfficeDocs Rename UX

**Branch**: `114-officedocs-rename-ux` | **Date**: 2026-07-01 | **Spec**: [spec.md](./spec.md)
**Scope**: `client-web` only (single repo). Backend already ships the mutation, document authorization, and extension preservation.

## Summary

Expose Collabora (OfficeDocs) document **rename** in `client-web`, gating on the **union of two
independent `Update` privileges** — the **document's own** and the **callout's** — which today are
conflated. Three surfaces:

1. **Open editor title bar** (`CollaboraFramingEditorOverlay`) — inline rename, gated on the union.
2. **Per-callout "Rename document" context-menu action** (`CalloutContextMenu`) in the space
   innovation-step list → a **new small standalone rename dialog** — gated on the union. The path for a
   document editor who cannot open the callout edit dialog.
3. **Callout edit dialog document box** (`FramingEditorConnector` `case 'document'`) — **cleanup only**:
   on edit, drop the "Create new" picker and show the document name read-only (no rename).

Rename persists via the already-generated `updateCollaboraDocument` mutation. A reusable
`CollaboraDocumentDisplayName` control + `useRenameCollaboraDocument` hook back the inline affordance and
the dialog. The only data change is selecting `collaboraDocument.authorization { id myPrivileges }` (an
existing schema field) in the callout queries that feed a gate. No backend/schema change.

## Placement note (why this is a client-web spec)

Originally drafted as an agents-hq workspace spec (`016-officedocs-rename-ux`) under the OfficeDocs Phase 2
epic. Verification confirmed **zero** cross-repo work — `server` already exposes
`updateCollaboraDocument` + `CollaboraDocument.authorization`, and `file-service` already preserves the
file extension (all present in the generated schema / shipped). Per the workspace constitution (a single-PR,
single-repo change is not a vertical feature), it was **relocated** into `client-web/specs/`. The epic
(alkemio#1842) and story (#9879) remain the cross-repo context.

## Technical Context

**Language/Version**: TypeScript ~5.x, React 18 (functional components + hooks)
**Primary Dependencies**: Apollo Client (GraphQL + codegen), react-i18next, Radix-based "crd" primitives, lucide-react, Yup. No new dependencies.
**Storage**: N/A (server via GraphQL; Apollo normalized cache for reactive title propagation)
**Testing**: Vitest (unit/component); optional Playwright e2e
**Target Platform**: Web SPA (Vite build)
**Constraints**: Reuse `displayNameValidator` (non-blank, min 3, max 128 = `SMALL_TEXT_LENGTH`); mirror `WhiteboardDisplayName`/`MemoDisplayName`; gate on **`collaboraDocument.authorization.myPrivileges ⊇ Update` OR `callout.authorization.myPrivileges ⊇ Update`**
**Scale/Scope**: ~1 reusable component, ~1 hook, ~1 new dialog, 1 menu item + visibility gate (new input field on the deriver), 1 query-field addition across the gate queries (+ codegen), 2 wiring sites + 1 data-plumb site + i18n. No `NEEDS CLARIFICATION`.

## Source Code (files touched, under `client-web/src`)

```text
crd/components/collabora/
└── CollaboraDocumentDisplayName.tsx        # NEW — reusable inline rename control (mirrors Whiteboard/MemoDisplayName)

crd/components/callout/
└── CalloutContextMenu.tsx                  # EDIT — add "Rename document" item (onRenameDocument, gated visible)

domain/collaboration/calloutContributions/collaboraDocument/
├── graphql/UpdateCollaboraDocument.graphql # EXISTS — mutation operation (already generated)
├── useRenameCollaboraDocument.ts           # NEW — hook: draft/edit/save state + validation + useUpdateCollaboraDocumentMutation
└── RenameCollaboraDocumentDialog.tsx       # NEW — small standalone single-field rename dialog (Dialog primitives)

domain/collaboration/calloutsSet/useCalloutsSet/
└── CalloutsSetQueries.graphql              # EDIT — add collaboraDocument.authorization { id myPrivileges } (feeds list menu + detail overlay)

domain/collaboration/callout/graphql/
└── CalloutContent.graphql                  # EDIT — same addition (other consumers of collaboraDocument); prefer a SHARED fragment across both

main/crdPages/space/callout/
├── CollaboraFramingEditorOverlay.tsx       # EDIT — render inline rename in header; accept canRename
├── CalloutDetailDialogConnector.tsx        # EDIT — derive canRename (doc.Update || callout.Update) from framing.collaboraDocument.authorization; pass to overlay
├── deriveCalloutMenuVisibility.ts          # EDIT — add documentMyPrivileges input; canRenameDocument = isCollaboraDocument && (documentUpdate || editable)
├── CalloutSettingsConnector.tsx            # EDIT — supply documentMyPrivileges; wire "Rename document" action + host RenameCollaboraDocumentDialog
├── LazyCalloutItem.tsx                     # EDIT (if needed) — pass the rename action wiring through to the menu
├── FramingEditorConnector.tsx              # EDIT — case 'document' edit: read-only existing-doc box (drop "Create new" picker), no rename
├── CalloutFormConnector.tsx                # EDIT — pass editCollaboraDocument{Id,DisplayName,Type} into FramingEditorConnector
└── dataMappers/mapCalloutDetailsToFormValues.ts  # EDIT — add collaboraDocumentId (+displayName,type) to editMeta (mirror memoId)

crd/i18n/space/space.en.json (+ locales)    # EDIT — "Rename document", dialog, validation strings
```

**Structure Decision**: The **presentational control** lives in `crd/components/collabora/`; the **hook** +
**standalone dialog** in the collabora domain folder — the split makes rename reusable across the header, the
dialog, and the future contributions surface (FR-014). The **document privilege** is threaded two ways: into
`deriveCalloutMenuVisibility` (new `documentMyPrivileges` input) for the list menu, and into
`CalloutDetailDialogConnector` for the overlay. Both read `callout.framing.collaboraDocument.authorization`,
so the query addition must land on the callout queries feeding those paths (`CalloutsSetQueries.graphql`
primarily; `CalloutContent.graphql` for consistency) — best via a shared fragment (FR-002 / C1).

## Notes on the two analyzer findings folded in

- **C1 (query coverage)**: both the list menu and the editor overlay read `callout.framing.collaboraDocument`
  from the CalloutsSet model, so `CalloutsSetQueries.graphql` is the primary target; `CalloutContent.graphql`
  also selects `collaboraDocument` (other consumers) and is updated too. A shared `CollaboraDocumentGate`
  fragment is recommended so the `authorization` selection can't drift between them.
- **C2 (card title)**: the space-feed card title binds to `callout.framing.profile.displayName`
  (`calloutDataMapper.ts:119`), a **separate** field from the document displayName — so document rename does
  **not** update the card. Scope of FR-010/SC-004 is limited to the document-name surfaces; aligning the card
  is an explicit optional follow-up.
- **U1**: `deriveCalloutMenuVisibility` already exposes `isCollaboraDocument`; it gains a new
  `documentMyPrivileges` input for the document-edit half of the gate.
