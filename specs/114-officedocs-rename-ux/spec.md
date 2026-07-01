# Feature Specification: OfficeDocs Rename UX

**Feature Branch**: `114-officedocs-rename-ux`  
**Created**: 2026-06-30 (clarified 2026-07-01; permission model revised round 2; relocated to client-web 2026-07-01)  
**Status**: Draft  
**Backlog Story**: [alkem-io/client-web#9879 — *OfficeDocs: rename UX*](https://github.com/alkem-io/client-web/issues/9879) (parent epic [alkemio#1842 — OfficeDocs Phase 2](https://github.com/alkem-io/alkemio/issues/1842))  
**Scope**: **client-web only.** The backend already ships everything needed — the `updateCollaboraDocument(displayName)` mutation, `CollaboraDocument.authorization`, and file-service extension preservation. This feature only wires UI + selects one already-existing schema field in a query. (Originally drafted as an agents-hq workspace spec `016-officedocs-rename-ux`; relocated here because it is a single-repo change — see the OfficeDocs Phase 2 epic for the cross-repo context.)

## Context

Alkemio lets contributors add **Collabora (OfficeDocs) documents** — text documents,
spreadsheets, and presentations — to a collaboration space, edited inline through the
Collabora Online editor. A document carries a **display name** (its human title), separate
from the stored file's technical filename and extension.

Today a Collabora document is used as a callout's **framing** (its main body). Its display
name is fixed after creation: the full-screen editor's title bar is read-only, and the
callout's **edit dialog** shows the document only as a read-only "Create new" type reminder
— there is **no rename affordance anywhere**. By contrast, whiteboards and memos already let
a user rename them inline, gated on the entity's own `Update` privilege.

**Two distinct permissions.** A user's right to edit the **document/file** is **independent**
of their right to edit the **callout** that hosts it — one may hold either, both, or neither.
Today the client conflates them (everything is gated on the callout). This feature
**separates** them: rename is allowed to anyone who can edit the **document** *or* the
**callout**. Because the callout's own **edit dialog** is only reachable by callout editors, a
document editor who cannot edit the callout needs a **separate entry point** — a per-callout
menu action opening a small rename dialog.

The backend already supports renaming: `updateCollaboraDocument` updates `displayName`, and
the file service preserves the original file **extension** so downloads keep a valid filename.
The client already contains the `updateCollaboraDocument` operation + generated hook (unused).
`CollaboraDocument` also exposes its own `authorization.myPrivileges`, though the callouts
query does not yet select it.

**What this feature does:** expose Collabora document rename from **three surfaces**, with the
correct per-surface gate — the **open editor's title bar**, a new **per-callout "Rename
document" menu action → standalone dialog**, and a **cleanup of the callout edit dialog's
document box** — mirroring the whiteboard/memo rename pattern, and ensuring the new name
propagates to the editor title bar and the download filename (original extension preserved).
The rename control is built **reusably** for future documents-as-contributions surfaces. No
backend or schema change; one **GraphQL query** field is added (the document's authorization —
an existing schema field, newly selected).

## Clarifications

### Session 2026-07-01

- Q: Which Collabora document context does rename target — framing, standalone contributions, or both? → A: **Framing only.** Documents-as-standalone-contributions are **not rendered in the UI yet**; build the rename mechanism **reusably** so contribution documents inherit it later.
- Q: Is the document's display name available without opening the document? → A: **Yes.** The callout's framing model already carries the Collabora document's `displayName`; no new fetch or document open is required (a query field is added only for the document's *authorization*, below).

### Session 2026-07-01 (round 2 — permission model & surfaces revised; supersedes earlier gating/surface answers)

- Q: Who may rename a document? → A: **Anyone who can edit the document/file OR the callout** — two **independent** privileges (`CollaboraDocument.authorization.myPrivileges ⊇ Update` OR `Callout.authorization.myPrivileges ⊇ Update`).
- Q: What does "can edit the file" mean technically? → A: The **CollaboraDocument's own `Update` privilege** (distinct from the callout's). It must be **added to the callouts query** (`collaboraDocument { authorization { id myPrivileges } }`), which is not selected today.
- Q: How does a document editor who **cannot** edit the callout rename it? → A: Via a **new per-callout "Rename document" menu action** in the space innovation-step callouts list, opening a **small standalone rename dialog**. Visibility gate: **document-edit OR callout-edit** (union).
- Q: Does the callout **edit dialog's** document box still offer inline rename? → A: **No.** In edit mode it is **cleanup only** — remove the stale "Create new" picker and show the existing document with its name **read-only**.
- Q: What gates the **editor header** rename? → A: The same **union** (document-edit OR callout-edit), using the now-queried document privilege rather than the overlay's old "authenticated ⇒ editable" assumption.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rename via the per-callout "Rename document" action, without editing the callout (Priority: P1) 🎯 MVP

A user who can edit a **document** but **not** its callout opens the callout's context menu in
the space innovation-step list, chooses **"Rename document"**, and a small dialog opens with the
current name. They enter a valid new name and save. The document is renamed even though they
cannot open the callout edit dialog.

**Why this priority**: This is the defining capability of the revised feature — it de-conflates
document-edit from callout-edit and gives file editors a path that does not require callout-edit
rights.

**Independent Test**: As a user with the document's `Update` privilege but without the callout's,
open the callout menu → "Rename document" is present → rename to a valid value → the name updates
on the document surfaces (editor header, rename dialog, edit-dialog box). As a user with **neither**
privilege, the action is absent.

**Acceptance Scenarios**:

1. **Given** a user with the document's `Update` privilege but **not** the callout's, **When** they
   open the callout's context menu, **Then** a **"Rename document"** action is shown.
2. **Given** that action, **When** they open it, edit to a valid name, and save, **Then** the display
   name is persisted and the document-name surfaces reflect it.
3. **Given** a user who can edit the **callout** (with or without the document privilege), **When**
   they open the callout's context menu, **Then** the "Rename document" action is also shown (union).
4. **Given** a user with **neither** the document nor the callout `Update` privilege, **When** they
   open the callout's context menu, **Then** no "Rename document" action is shown.

---

### User Story 2 - Rename from the open editor's title bar (Priority: P1)

A user who may rename the document opens it; the full-screen editor shows the title in its header.
They activate the rename affordance next to the title, edit the name, and confirm. The title bar
immediately reflects the new name, and the change is persisted.

**Why this priority**: The editor is where a user spends the most time with a document and where a
wrong/auto-generated title is most noticed.

**Independent Test**: Open the document as a user who may rename it (document-edit OR callout-edit);
rename from the title bar to a valid name; the title updates without reopening, and reopening later
shows the new name. A user who may **not** rename sees the title read-only.

**Acceptance Scenarios**:

1. **Given** a user who may rename has the document open, **When** they activate the title-bar rename
   affordance, edit to a valid value, and confirm, **Then** the display name is persisted and the
   title bar shows the new name without a reload.
2. **Given** the rename field is open, **When** the user cancels, **Then** the title is unchanged and
   the field returns to read-only.
3. **Given** a user who may **not** rename has the document open, **When** they view the title bar,
   **Then** no rename affordance is offered and the title is read-only.
4. **Given** the rename field is open, **When** the user enters an invalid name (empty, too short, too
   long, or only whitespace), **Then** the change is rejected with a validation message and the previous
   name is retained.

---

### User Story 3 - Callout edit dialog document box: cleanup (Priority: P2)

A callout editor opens the callout's **edit dialog** for a Collabora-document callout. In edit mode
the document box no longer shows the "Create new" type picker; it shows the existing document (type
and current name) **read-only**. Renaming is done from the editor header or the "Rename document"
menu action, not here.

**Why this priority**: Removing the stale "Create new" picker (the document already exists) is a
correctness/clarity fix that stands on its own.

**Independent Test**: Open the edit dialog of a Collabora-document callout; the document box shows the
current document name (not the "Create new" picker) and offers **no** rename control in the box.

**Acceptance Scenarios**:

1. **Given** a callout editor opens the edit dialog of a Collabora-document callout, **When** the dialog
   renders, **Then** the document box shows the existing document's name read-only and **not** the
   "Create new" type picker.
2. **Given** the same dialog, **When** the user looks for a rename control **in the box**, **Then** none
   is present.

---

### User Story 4 - Renamed document downloads with the new name and original extension (Priority: P3)

After a document is renamed, downloading it produces a file named after the new display name that
keeps its original file extension (e.g. a spreadsheet renamed to "Budget" downloads as `Budget.xlsx`).

**Why this priority**: Correct download naming is the tangible end-to-end payoff, but it is primarily a
**verification** that the already-shipped backend/file-service extension handling carries the renamed
title through — not new client behaviour.

**Independent Test**: Rename a document, then download it; the saved file's base name matches the new
display name and its extension matches the document's original extension.

**Acceptance Scenarios**:

1. **Given** a document with a known original extension has been renamed to a valid new name, **When**
   the user downloads it, **Then** the downloaded filename is the new display name with the original
   extension preserved.
2. **Given** a display name containing dots or filename-invalid characters, **When** the document is
   downloaded, **Then** a valid filename is still produced and the original extension is preserved.

---

### Edge Cases

- **Can edit the file but not the callout**: sees the "Rename document" menu action and the editor
  header rename; does **not** see (or need) the callout edit dialog.
- **Can edit the callout but not the file**: sees the "Rename document" menu action and the editor
  header rename (union); the callout edit dialog's document box shows the name read-only (no rename).
- **Can edit neither**: no rename affordance on any surface; all titles read-only; no menu action.
- **Callout list card title is a separate name**: the space-feed callout **card** title is bound to the
  **callout framing** display name (`callout.framing.profile.displayName`), a **distinct** field from the
  document's `displayName`. Renaming the document does **not** change the card title, and this feature
  does not attempt to (see FR-010 / Assumptions). Only the document-name surfaces converge.
- **Invalid name**: empty, whitespace-only, below minimum, or above maximum length is rejected with the
  same validation feedback as whiteboard/memo rename; the prior name is retained.
- **Unchanged name**: confirming the same value (after trim) is a no-op.
- **Concurrent rename**: last successful write wins; surfaces converge on the persisted name.
- **Save failure**: the user is informed and the name falls back to the last persisted value.
- **Extension in the display name**: the display name is independent of the stored file extension; the
  download still appends the original extension. The rename UI exposes a **name field only** — no type or
  extension control — so type/extension cannot be changed by construction (FR-012).
- **Non-document callout**: the "Rename document" menu action appears only for callouts whose framing is
  a Collabora document.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001 (permission model)**: A user MUST be permitted to rename a Collabora document if they hold
  the **document's** `Update` privilege **OR** the **callout's** `Update` privilege. These are
  **independent** and MUST NOT be conflated.
- **FR-002 (document privilege availability)**: The client MUST obtain the document's own authorization
  wherever a rename gate is evaluated — `collaboraDocument.authorization.myPrivileges` MUST be selected in
  **every** callout query that feeds a rename surface (the callouts-set query behind the list menu and the
  editor overlay, and any other callout query selecting `collaboraDocument`). A shared GraphQL fragment
  SHOULD be used to avoid divergence.
- **FR-003 (menu action)**: The per-callout context menu in the space innovation-step callouts list MUST
  offer a **"Rename document"** action for Collabora-document callouts, visible iff the user may rename
  (FR-001). Activating it MUST open a **small standalone rename dialog** pre-filled with the current name.
- **FR-004 (editor header)**: A user who may rename MUST be able to rename from the **open editor's title
  bar**; the affordance MUST be absent (title read-only) for users who may not rename. This MUST use the
  document/callout `Update` privileges (FR-001), **superseding** the overlay's prior "authenticated ⇒
  editable" assumption.
- **FR-005 (edit-dialog cleanup)**: In the callout edit dialog, when the Collabora document **already
  exists** (edit mode), the "Create new" document-type picker MUST NOT be shown; the box MUST show the
  existing document's type and name **read-only**, with **no** rename control in the box.
- **FR-006 (consistent interaction)**: The inline rename affordance (editor header, and any inline reuse)
  MUST follow the **same pattern as whiteboard/memo rename** (activate → edit → confirm/cancel; Enter=save,
  Escape=cancel). The standalone dialog MUST present a single name field with Save/Cancel.
- **FR-007 (validation)**: A submitted name MUST be validated with the same display-name rules as
  whiteboards/memos (non-blank, min and max length); invalid input MUST be rejected with feedback and MUST
  NOT change the persisted name.
- **FR-008 (persistence)**: A successful rename MUST persist the new display name via the existing
  `updateCollaboraDocument` capability (no new backend behaviour).
- **FR-009 (editor propagation)**: After a successful rename, the **editor title bar** MUST reflect the new
  name without a reload or reopen.
- **FR-010 (cross-surface consistency, document-name surfaces)**: After a successful rename, the surfaces
  bound to the **document's** display name — the editor title bar, the standalone rename dialog, and the
  callout edit dialog's document box — MUST converge on the persisted name. The space-feed callout **card**
  title is bound to the separate **callout framing** display name and is **out of scope** (not changed by
  this feature).
- **FR-011 (download)**: After a rename, **downloading** the document MUST produce a file named after the
  new display name with the **original file extension preserved** (provided by the existing backend/file
  service; this feature MUST NOT break it).
- **FR-012 (no type/extension change)**: Renaming MUST NOT change the document's **type** or stored file
  **extension**; the rename UI MUST expose a name field only (no type/extension control).
- **FR-013 (failure handling)**: A failed rename MUST inform the user and leave the displayed and persisted
  name at the last successful value.
- **FR-014 (reusability)**: The rename control MUST be built **reusably** so it can be attached to Collabora
  documents rendered as standalone contributions when that surface is introduced, without a rewrite.

### Key Entities *(include if feature involves data)*

- **Collabora document**: a collaborative office document (text, spreadsheet, or presentation) framing a
  callout, with a **display name** (renamed here), an original **extension** (unchanged), and its **own
  `authorization.myPrivileges`** (the document-edit gate).
- **Callout**: hosts the document; carries its **own `authorization.myPrivileges`** (the callout-edit gate),
  independent of the document's. Its **framing** has a **separate** `profile.displayName` used for the
  space-feed card title (distinct from the document's display name).
- **Display name (document)**: shown on the editor title bar, the rename dialog, and the edit-dialog box, and
  used as the base of the download filename; validated (non-blank, min/max).
- **Rename permission (derived)**: `document.Update OR callout.Update` — the union governing every rename
  affordance.

## Assumptions & Open Questions

- **Backend ready (confirmed in the generated schema).** `updateCollaboraDocument`, `UpdateCollaboraDocumentInput`,
  and `CollaboraDocument.authorization.myPrivileges` all exist in the client's generated schema (generated from
  the server). Only the client **query selection** is extended; no server/schema change.
- **Single repo (confirmed).** No `server`, `file-service`, or infrastructure change — the mutation,
  document authorization, and extension preservation already ship. This is why the spec lives in `client-web`.
- **Framing only; contributions don't exist yet.** Rename targets framing surfaces; the reusable control
  (FR-014) is the only contribution-facing deliverable.
- **De-conflation is new.** Today document-edit and callout-edit are conflated; this feature introduces the
  document's own `Update` privilege as a distinct gate (FR-002).
- **Editor overlay gate changes.** The overlay currently assumes authenticated ⇒ editable; it switches to the
  union of the queried document/callout privileges.
- **Callout card title divergence (open question).** The space-feed card title uses the callout framing
  displayName, not the document displayName; document rename does not update the card. If product later wants
  them aligned, that is a **small follow-up** (map the card title to the document displayName for document
  callouts) — deliberately out of scope here.
- **Pattern to mirror.** Whiteboard/memo inline rename control (pencil → input → confirm/cancel), validated by
  the shared display-name validator (non-blank, min 3, max 128). The header reuses this; the standalone dialog
  wraps the same validation in a single-field modal.
- **"Editor title bar"** means the app's editor header (the dialog title over the Collabora iframe), not
  Collabora's in-iframe chrome; propagation into the iframe title may require reopening and is not required.
- **Download is backend-driven.** No client download UI exists (export is inside the Collabora iframe); US4 is
  an end-to-end verification.
- **No conflict UX.** Concurrent-rename resolution beyond last-write-wins is out of scope.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with the **document's** `Update` privilege but **not** the callout's can rename the
  document via the per-callout "Rename document" action — **without** opening the callout edit dialog.
- **SC-002**: The "Rename document" action is shown to exactly the users satisfying `document.Update OR
  callout.Update` and to **no one** else (0 affordances for users with neither privilege).
- **SC-003**: A user who may rename can rename from the **open editor** and see the title bar reflect the new
  name **without reopening**.
- **SC-004**: After a rename, the **document-name surfaces** (editor title bar, rename dialog, edit-dialog box)
  agree on the document's name 100% of the time. (The space-feed card title is a separate field, excluded — see
  FR-010.)
- **SC-005**: In the callout edit dialog for an already-created document, the "Create new" picker is **never**
  shown (0 occurrences in edit mode) and the box offers **no** rename control; the name is read-only there.
- **SC-006**: After a rename, downloading the document yields a file whose base name is the new display name and
  whose extension matches the document's **original** extension in 100% of cases.
- **SC-007**: The inline rename interaction is **indistinguishable in shape** from whiteboard/memo rename (same
  control, validation, confirm/cancel).
- **SC-008**: Invalid display names (empty, whitespace-only, below min, above max) are **always** rejected with
  feedback and **never** persisted, on both the inline and the dialog surfaces.
