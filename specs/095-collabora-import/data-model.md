# Phase 1 Data Model: Document Framing on a Post — Create New or Upload

**Branch**: `095-collabora-import` | **Date**: 2026-05-04 | **Plan**: [plan.md](plan.md)

## Scope

The client owns no persistent data. Everything below is either (a) a transient form-state shape Formik holds while the dialog is open, (b) a return type from a pure helper, or (c) an existing server-side type the FE consumes. Server-owned schema is documented in `contracts/graphql-mutation-extension.md`.

## New client-side types

### `CollaboraImportFormats` (constant module)

Single source of truth for the supported-format list and the size cap.

```ts
// src/domain/collaboration/calloutContributions/collaboraDocument/collaboraImportFormats.ts

export const COLLABORA_IMPORT_EXTENSIONS_P1 = ['.docx', '.xlsx', '.pptx'] as const;

export type CollaboraImportExtensionP1 = (typeof COLLABORA_IMPORT_EXTENSIONS_P1)[number];

/** Max upload size in bytes, equal to file-service-go's configured cap (15 MB). */
export const COLLABORA_IMPORT_MAX_BYTES = 15 * 1024 * 1024;

/** Comma-joined string for the native picker `accept` attribute. */
export const COLLABORA_IMPORT_ACCEPT_ATTR = COLLABORA_IMPORT_EXTENSIONS_P1.join(',');
```

| Field | Type | Notes |
|---|---|---|
| `COLLABORA_IMPORT_EXTENSIONS_P1` | readonly tuple of strings | The P1 picker list. Drawing / legacy / ODF excluded. |
| `COLLABORA_IMPORT_MAX_BYTES` | `number` | 15 × 1 048 576 = 15 728 640. |
| `COLLABORA_IMPORT_ACCEPT_ATTR` | `string` | `'.docx,.xlsx,.pptx'`. |

Consumed by: validator helper, MUI helper-text + accept-attr, CRD upload zone helper-text + accept-attr, i18n message templates that interpolate the cap as MB.

### `ValidationResult` (helper return type)

Discriminated union returned by `validateCollaboraImportFile`.

```ts
// src/domain/collaboration/calloutContributions/collaboraDocument/validateCollaboraImportFile.ts

export type ValidationError =
  | { kind: 'no-file' }
  | { kind: 'multiple-files' }
  | { kind: 'folder' }
  | { kind: 'extension'; received: string }                      // received = e.g. '.pdf'
  | { kind: 'size'; bytes: number; maxBytes: number };

export type ValidationResult =
  | { ok: true; file: File }
  | { ok: false; error: ValidationError };

export function validateCollaboraImportFile(input: FileList | File[] | DataTransferItemList): ValidationResult;
```

| Variant | Mapped i18n key (sketch) | UI placement |
|---|---|---|
| `no-file` | `collaboraDocument.upload.errors.noFile` | submit button disabled state hint |
| `multiple-files` | `collaboraDocument.upload.errors.multipleFiles` | inline error on the upload zone |
| `folder` | `collaboraDocument.upload.errors.folder` | inline error on the upload zone |
| `extension` | `collaboraDocument.upload.errors.unsupported` (interpolates list of extensions) | inline error on the upload zone |
| `size` | `collaboraDocument.upload.errors.tooLarge` (interpolates 15 MB) | inline error on the upload zone |

The same union is the single mapping target for both client-side pre-check rejections and server-side `FORMAT_NOT_SUPPORTED` / `STORAGE_UPLOAD_FAILED` errors — i.e., the inline message shown after a server-side rejection of a content-mismatched file is the same `extension` variant copy. This satisfies SC-002's "names supported formats and never with a raw HTTP code" requirement.

### `DisplayNameDecision` (helper return type)

Decides whether to send `framing.collaboraDocument.displayName` explicitly or rely on the server's filename-derivation default.

```ts
// src/domain/collaboration/calloutContributions/collaboraDocument/deriveCollaboraDocumentDisplayName.ts

export type DisplayNameDecision =
  | { displayName: string; documentType: CollaboraDocumentType }   // blank-create branch
  | { displayName: string }                                        // upload, user-typed
  | Record<string, never>;                                         // upload, prefill-unchanged → empty {}

export function deriveCollaboraDocumentDisplayName(input: {
  mode: 'blank-create' | 'upload';
  postTitle: string;
  autoPrefilledTitle?: string;
  documentType?: CollaboraDocumentType;
}): DisplayNameDecision;
```

Decision rule (mirrors FR-004b):

| `mode` | `postTitle` vs `autoPrefilledTitle` | `documentType` | Returns |
|---|---|---|---|
| `blank-create` | n/a | required | `{ displayName: postTitle, documentType }` |
| `upload` | equal (or no prefill) | n/a | `{}` (empty) — server derives from filename |
| `upload` | different (user typed) | n/a | `{ displayName: postTitle }` |

### `CalloutFormSubmittedValues.framing.collaboraDocument` (extension)

The Formik form-values shape gains two new optional fields. The existing `displayName` and `documentType` keep their current semantics for the blank-create branch.

```ts
// src/domain/collaboration/callout/CalloutForm/CalloutFormModel.ts (excerpt)

export type CalloutFormSubmittedValues = {
  // ... existing fields ...
  framing: {
    type: CalloutFramingType;
    profile: CreateProfileInput;
    collaboraDocument?: {
      // existing — used on the blank-create branch
      displayName?: string;
      documentType?: CollaboraDocumentType;
      // NEW — used on the upload branch
      uploadFile?: File;                      // staged in browser memory; never persisted
      autoPrefilledTitle?: string;            // captured at file-stage time for the typed-vs-prefill comparison
    };
    // ... other framing-type-specific fields unchanged ...
  };
  // ...
};
```

| Field | Set by | Cleared when |
|---|---|---|
| `uploadFile` | the upload zone's `onChange` | author picks a blank-create card (mutual exclusion); author switches framing type away from Document; dialog closes |
| `autoPrefilledTitle` | the upload zone's `onChange`, only if `framing.profile.displayName` was empty at staging time | same conditions as `uploadFile` |
| `displayName` (existing) | the blank-create card's `onChange` | author stages a file; author switches framing type |
| `documentType` (existing) | the blank-create card's `onChange` | same as above |

**Invariants** (enforced by the form):

- Exactly one of `uploadFile` or (`displayName` + `documentType`) is set when `type === COLLABORA_DOCUMENT` and the form is submittable.
- `autoPrefilledTitle` is set if and only if `uploadFile` is set AND the post title was empty at staging time.

## Existing types touched

### `CreateCollaboraDocumentInput` (server schema)

Server-owned. Pre-existing field requirements relaxed in the new contract — both `displayName` and `documentType` are now optional. The FE consumes this as is via codegen.

```graphql
input CreateCollaboraDocumentInput {
  displayName: String          # newly optional
  documentType: CollaboraDocumentType   # newly optional
}
```

### `MutationCreateCalloutOnCalloutsSetArgs` (server schema)

Gains one optional argument:

```graphql
type Mutation {
  createCalloutOnCalloutsSet(
    calloutData: CreateCalloutOnCalloutsSetInput!
    file: Upload                # NEW — optional
  ): Callout!
}
```

After codegen, `useCreateCalloutMutation` accepts `{ calloutData, file? }` as its variables. The hook signature change is documented in the contracts file.

### `Callout` and `CalloutFraming` (response shapes — unchanged)

The mutation return type is unchanged — still `Callout`, with `framing.collaboraDocument` populated for both blank-create and upload paths (server materialises the document either way). The existing `CalloutFragmentDoc` / `CalloutDetails` fragment already selects `framing.collaboraDocument { id, documentType, profile { id, displayName } }`, so the FE has the data it needs to open the editor on the new framing document immediately.

## State transitions

The form-level state for the Document framing branch:

```text
[no framing chosen]
       ↓ (author picks Document framing)
[Document framing selected, no card / no file]
       ↓ (clicks blank card)                      ↓ (drops/picks a file)
[blank-create branch]                       [upload branch — file staged]
       ↓ (submit)                                   ↓ (submit)
[mutation: createCalloutOnCalloutsSet]      [mutation: createCalloutOnCalloutsSet WITH file]
       ↓ (success)                                  ↓ (success)
[dialog close → navigate to new post → editor opens]
       ↓ (error from server)
[dialog open, all input preserved, inline error rendered]
       ↓ (author retries)
[mutation re-attempted]
```

Switching framing types or closing the dialog from any state discards both `uploadFile` and `autoPrefilledTitle` along with the rest of the framing-type-specific values.
