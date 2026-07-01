# Data Model: OfficeDocs Rename UX

No new persisted entities and no **schema** change. One client **query field** is added
(the document's authorization, which already exists server-side). Documented here for the
permission model and validation.

## Entities (existing, consumed)

### CollaboraDocument (read + write `displayName`; read `authorization`)
| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Used as `updateData.ID`. |
| `documentType` | enum (`WORDPROCESSING` \| `SPREADSHEET` \| `PRESENTATION`) | Read-only; drives the box/menu icon. |
| `authorization.myPrivileges` | `AuthorizationPrivilege[]` | **NEW selection.** The **document-edit** gate (`⊇ Update`). Exists in schema (`graphql-schema.ts:1391`); added to the callout gate queries. |
| `profile.id` | UUID | Returned by the mutation. |
| `profile.displayName` | string | **The field renamed.** Validated (below). |
| `profile.url` | string | Present; not modified. |

### Callout (read — the other gate + the card title)
| Field | Type | Notes |
|---|---|---|
| `authorization.myPrivileges` | `AuthorizationPrivilege[]` | The **callout-edit** gate (`⊇ Update`); already queried. |
| `framing.profile.displayName` | string | The **callout framing** title — bound to the space-feed **card** title (`calloutDataMapper.ts:119`). **Distinct** from the document displayName; **not** changed by this feature (C2 / FR-010). |

## Derived permission

```
canRename(document, callout) =
    document.authorization.myPrivileges ⊇ Update
 OR callout.authorization.myPrivileges ⊇ Update
```
Independent privileges. `canRename` governs **every** rename affordance (editor header, "Rename document"
menu action + dialog). The edit-dialog document box shows the name **read-only** regardless.

## Query change (client only) — C1

Add the document's authorization to **every** callout query that feeds a rename gate. Both the list menu
and the editor overlay read `callout.framing.collaboraDocument` from the CalloutsSet model:

```graphql
# CalloutsSetQueries.graphql (CalloutDetails) AND CalloutContent.graphql — ideally via a shared fragment:
collaboraDocument {
  id
  documentType
  authorization { id myPrivileges }   # <-- ADDED
  profile { id displayName url }
}
```
Then `pnpm codegen`. (The callout already selects `authorization { id myPrivileges }`.)

## Menu-visibility input change — U1

`deriveCalloutMenuVisibility` input (`CalloutMenuPermissionsInput`) already carries `isCollaboraDocument`.
Add:
```ts
documentMyPrivileges?: AuthorizationPrivilege[]; // the CollaboraDocument's own privileges
```
and derive `canRenameDocument = isCollaboraDocument && (documentMyPrivileges?.includes(Update) || editable)`.

## Mutation input (existing)

`UpdateCollaboraDocumentInput = { ID: UUID; displayName?: string }`, called as
`updateCollaboraDocument({ variables: { updateData: { ID, displayName } } })`.

## Validation rules (reused)

`displayName` validated by `displayNameValidator` (`textLengthValidator`): **non-blank**, **min 3**,
**max `SMALL_TEXT_LENGTH` = 128**. Invalid input rejected with shared messages
(`forms.validations.nonBlank | minLength | maxLength`); persisted value unchanged (FR-007, SC-008).
A submit equal to the current name (after trim) is a no-op. The UI exposes a **name field only** — no
type/extension control (FR-012).

## Client-side state (new — transient)

Owned by `useRenameCollaboraDocument` (used by the inline control and the dialog):
| State | Type | Meaning |
|---|---|---|
| `editing` | boolean | Rename field/dialog open. |
| `draft` | string | In-progress input (controlled). |
| `saving` | boolean | Mutation in flight. |
| `error` | string \| null | Validation/save message. |

Transitions: `idle → (open/edit) → editing → (save, valid) → saving → (success) → idle(new name)` /
`(save, invalid) → editing(error)` / `(cancel) → idle(unchanged)` / `(failure) → editing(error), persisted name retained` (FR-013).
