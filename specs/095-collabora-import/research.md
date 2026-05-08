# Phase 0 Research: Document Framing on a Post — Create New or Upload

**Branch**: `095-collabora-import` | **Date**: 2026-05-04 | **Plan**: [plan.md](plan.md)

## Research findings

### 1. Apollo upload-link wiring (already done)

**Decision**: Reuse the existing `apollo-upload-client` configuration; no transport work needed.

**Rationale**: `src/core/apollo/graphqlLinks/httpLink.ts` already constructs `createUploadLink({ uri, credentials: 'include', headers: { 'apollo-require-preflight': 'true' } })`. The link is split with the WebSocket link only for subscriptions; all queries and mutations route through the upload link. Sending a regular operation without a `file` variable produces a normal `application/json` POST; sending one *with* a `file` produces a `multipart/form-data` POST that conforms to the [graphql-multipart-request-spec](https://github.com/jaydenseric/graphql-multipart-request-spec). The `apollo-require-preflight` header is required by Apollo Server's CSRF protection and is set on every request that goes through the upload link, so the FE doesn't need to add it per-mutation.

**Alternatives considered**:
- Adding a separate upload-only Apollo Client instance — Rejected. Two clients would mean two caches, two auth sessions; the existing single-client setup already handles uploads correctly via the upload link's split.
- Building a custom multipart serializer — Rejected. The library handles the `operations` / `map` / file parts per spec; reinventing this adds risk for no value.

**Implication for tasks**: zero transport setup work. Tasks start at the GraphQL operation file change.

### 2. Where the existing `createCalloutOnCalloutsSet` mutation is invoked

**Decision**: Single source of truth — `useCalloutCreation` hook in `src/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation.ts`. Both MUI and CRD form paths consume it.

**Rationale**: Search results confirm only one production code path uses `useCreateCalloutMutation` (the generated hook). The MUI form (`CalloutCreationDialog` style components in `src/domain/collaboration/callout/...`) and the CRD form (`CalloutFormConnector.tsx`) both pass their inputs through `handleCreateCallout` from this shared hook. There is also a thin wrapper, `useCalloutCreationWithPreviewImages.ts`, used by the whiteboard-framing path that still needs to coordinate a preview-image upload after callout creation; it forwards to the same `handleCreateCallout`.

**Alternatives considered**:
- Adding a separate `useCalloutCreationWithFile` hook — Rejected. Doubles the surface for one optional argument; the existing hook already has a clean parameter object that we can extend.
- Inlining the mutation call inside the upload-zone CRD component — Rejected. Violates the design-system rule that CRD components have no Apollo / business-logic dependencies.

**Implication for tasks**: extend `useCalloutCreation` to accept an optional `file: File`. Pass it through to the mutation variables. Update `useCalloutCreationWithPreviewImages` to forward the param so the whiteboard path doesn't break.

### 3. Client-side pre-check strategy

**Decision**: Three pure-synchronous checks ordered as: (a) exactly one file, (b) extension ∈ canonical list, (c) byte size ≤ 15 MB. Return a discriminated-union error type or `{ ok: true, file }`.

**Rationale**: All three checks complete in O(1) with information already available on a `File` object. No content sniffing on the client — the server's MIME sniff is the authoritative content check, and matching the server's logic on the client would add bytes (a sniffer library) for negligible UX gain. The discriminated-union return shape lets the UI map directly to the right inline error message.

```ts
export type ValidationError =
  | { kind: 'no-file' }
  | { kind: 'multiple-files' }
  | { kind: 'folder' }                    // empty type / non-File entry from a directory drop
  | { kind: 'extension'; received: string }
  | { kind: 'size'; bytes: number; maxBytes: number };

export type ValidationResult =
  | { ok: true; file: File }
  | { ok: false; error: ValidationError };
```

The supported-format constant and 15 MB byte cap live in a single module (`collaboraImportFormats.ts`) shared by:
- the MUI helper text + accept-attr,
- the CRD upload zone's helper text + accept-attr,
- the validator,
- the i18n message templates (which interpolate the cap as MB).

**Alternatives considered**:
- Throw exceptions on rejection — Rejected. Errors are expected control flow here, not exceptional; a typed result is easier to test and clearer at callsites.
- Validate via Formik validators (`Yup` schema) — Rejected. The pre-check needs to run on file-stage (before submit) to disable the submit button and show inline errors as soon as the file is dropped. Formik validators run on submit by default; the validation logic belongs in a pure helper called from both the file-staging handler and (defensively) from the submit handler.
- Reject case-sensitively (`.docx` only, not `.DOCX`) — Rejected. Uppercase extensions are common on Windows; the comparison is case-insensitive in the helper.

**Implication for tasks**: the validator + format-list module are added under `src/domain/collaboration/calloutContributions/collaboraDocument/`. Vitest table tests cover each rejection branch and the exact-cap boundary.

### 4. Auto-prefill detection strategy

**Decision**: When a file is staged, capture the auto-prefilled value (filename minus extension) as a separate piece of Formik state (`framing.collaboraDocument.autoPrefilledTitle`). At submit time, compare the current `framing.profile.displayName` against the captured `autoPrefilledTitle` value: if equal, send empty `framing.collaboraDocument: {}` and let the server derive the document's display name from the filename (FR-004b); if different (the user typed/edited), send `framing.collaboraDocument.displayName = <post title>`.

**Rationale**: A simple "is the field dirty since the prefill" check via Formik's `touched` object is unreliable here — Formik considers a field "dirty" the moment the user focuses it, not when they actually change the value. Capturing the prefilled string separately and doing an equality check at submit is precise: it correctly handles the corner case where the user types over the prefill and then types it back character-for-character (the spec explicitly accepts this — see Edge Cases in spec.md).

**Alternatives considered**:
- A hidden boolean `userTypedTitle` flag, set on the first non-prefill keystroke — Rejected. Hard to keep accurate when the user clears the field, switches framing types, removes the file, etc.
- Always send `displayName: <post title>` (Option A from clarify) — Rejected by clarification (the user picked Option C).
- Always send empty `{}` (Option B from clarify) — Rejected by clarification.

**Implication for tasks**: a small pure helper `deriveCollaboraDocumentDisplayName({ postTitle, autoPrefilledTitle })` returns either `{ displayName: string }` or `{}`. Used from `calloutFormMapper.ts` (CRD path) and the equivalent submit-mapping in the MUI path. Vitest covers all four branches:
- prefill-equals-current → `{}`
- prefill-differs-from-current → `{ displayName }`
- no prefill (blank-create path) → `{ displayName, documentType }` (existing behaviour preserved)
- no prefill, no title yet (shouldn't happen because title is required) — defensively returns `{}`

### 5. Atomic-failure FE pattern

**Decision**: On any error from the create-callout mutation, the dialog stays open with all current input preserved; the FE does NOT issue any compensating mutations or refetches. On success the dialog closes, the caller (CRD page or MUI list page) navigates / scrolls to the new callout, and the editor opens.

**Rationale**: The server contract (issue #9629) is atomic by design — "on any failure (validation, ingestion, storage, persistence, auth, quota, file-service-go upstream unavailable), zero new rows in callout/framing/document tables and zero new storage objects." The FE has no partial state to clean up, and any "I'll try a second time to be safe" code would add risk (idempotency questions, duplicate posts) for no benefit. The dialog's existing failure path (Formik onError + Apollo error toast) already keeps the form open; this iteration just ensures the Apollo error gets routed to inline copy near the offending field rather than a generic dialog-level toast (FR-010).

**Alternatives considered**:
- Auto-retry on `STORAGE_SERVICE_UNAVAILABLE` — Rejected. Issue explicitly says "Server fails fast — do NOT retry inside the dialog". The user retries manually.
- Two-step: create blank callout, then attempt upload as contribution if the upload fails — Rejected. That would create exactly the orphan-state the atomic contract avoids.

**Implication for tasks**: error mapping table from server error codes (`FORMAT_NOT_SUPPORTED`, `STORAGE_UPLOAD_FAILED`, `STORAGE_SERVICE_UNAVAILABLE`, `BAD_USER_INPUT`, `FORBIDDEN`) → i18n keys → inline placement (which Formik field's helperText, or a dialog-level alert). Belongs in the CRD `CalloutFormConnector.tsx` and the equivalent MUI form-submit handler.

### 6. Response-options removal scope

**Decision**: Remove the Document choice from two surfaces — the MUI radio group in `CalloutFormContributionSettings.tsx` (currently hardcoded `disabled: true` at line 157) and the CRD "Documents (Coming soon)" tab in the CRD response-options panel. Removed entirely (not feature-flagged, not hidden via CSS) so neither the radio nor the tab can re-appear by accident.

**Rationale**: The product scope is firm — Documents are framing-only in P1. Leaving disabled/hidden code paths around invites accidental re-enablement and noise in code review. When/if the contribution variant ships in a future iteration, it will be reintroduced through the equivalent of the existing PR for the framing variant — not by un-deleting code.

**Alternatives considered**:
- Feature-flag the response option — Rejected. There's no positive use case for ever showing it in P1; a feature flag adds branching for no benefit.
- Hide via CSS — Rejected. Same problem as the flag approach plus accessibility (screen readers still see hidden elements).
- Keep the disabled radio for "you can see it's coming" affordance — Rejected. A "Coming soon" UI element is a worse UX than its absence; users click them and get nothing back.

**Implication for tasks**: two delete-or-trim tasks: (a) remove the COLLABORA_DOCUMENT entry from the radio options array in `CalloutFormContributionSettings.tsx`, and (b) remove the Documents tab from the CRD response-options panel. Adjust corresponding tests if they reference the removed entries.

## Open issues

None remaining.

## Out-of-scope but worth a thought (for future tickets)

- **Drawing (`.odg`) support** in the picker — server already supports `DRAWING`; FE excludes it in P1.
- **Legacy formats** (`.doc`, `.xls`, `.ppt`, `.odt`, `.ods`, `.odp`, `.rtf`, `.csv`) — server accepts; FE excludes in P1.
- **Replace existing document content** — would need server work; out of scope per issue.
- **Documents as a contribution / response option** — explicitly out of P1 scope; the existing `importCollaboraDocument` server mutation (sibling ticket #9620) is not consumed by the FE in this iteration.
- **Multi-file batch import** — out of scope; pre-check enforces single file.
