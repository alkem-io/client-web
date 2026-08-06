# Phase 0 Research: Documents as Post Responses

All research below was performed by direct inspection of the shipped GraphQL
schema (`src/core/apollo/generated/graphql-schema.ts`) and the existing
client-web codebase — no `[NEEDS CLARIFICATION]` markers remain in the
Technical Context; this phase closes the mechanism-level questions the
spec's Clarifications section already resolved at the product level.

## R1: Server contract for adding a document response

**Decision**: Use the existing `importCollaboraDocument(file: Upload!, uploadData: ImportCollaboraDocumentInput!): CalloutContribution` mutation as-is. `ImportCollaboraDocumentInput = { calloutID: UUID!, displayName: String, sortOrder: Float }`. Do not send `displayName` (server derives it from the filename) or `sortOrder` (server default — new contribution first — matches every other response type's implicit ordering).

**Rationale**: Confirmed directly in `graphql-schema.ts` (`MutationImportCollaboraDocumentArgs`, `ImportCollaboraDocumentInput`, `CalloutContribution.collaboraDocument`). This is the only mutation that produces a `CalloutContribution` from an uploaded file; no schema change is possible or needed (Assumption A-001).

**Alternatives considered**: A "blank document" contribution mutation — does not exist server-side; rejected (spec Clarifications Q1). Reusing the generic `createContributionOnCallout` mutation family (used by Whiteboard/Memo/Post add-connectors) — does not support Collabora documents; the schema only wires them through `importCollaboraDocument`.

## R2: Reading document contributions

**Decision**: No new read-side GraphQL work. `useCalloutContributions` (list) and `useCalloutContributionQuery` (single, via `CalloutContribution.graphql`) already declare `includeCollaboraDocument` and a `collaboraDocument { id documentType profile { id url displayName } authorization { id myPrivileges } createdDate createdBy { ...ContributionAuthor } }` selection, wired for `CalloutContributionType.CollaboraDocument`. This is leftover, unused-until-now plumbing from the prior "Documents MVP" (#9615).

**Rationale**: Verified by reading `CalloutContributions.graphql`, `useCalloutContributions.tsx` (the `includeCollaboraDocument`/`totalContributionsCount` switch already has a `CollaboraDocument` case), and `CalloutContributionPreview.graphql`. Reusing this avoids a duplicate query and keeps one canonical fragment shape for the entity across both list and single-item reads.

**Alternatives considered**: None — building a new query would directly violate GraphQL Contract Fidelity (constitution III) by duplicating an existing, already-shipped operation.

## R3: Add-document UI (upload zone)

**Decision**: Reuse `DocumentImportZone` (`src/crd/forms/callout/DocumentImportZone.tsx`) as-is for the upload UI, and `validateCollaboraImportFile` / `COLLABORA_IMPORT_EXTENSIONS_P1` / `COLLABORA_IMPORT_MAX_BYTES` (`src/domain/collaboration/calloutContributions/collaboraDocument/`) as-is for client-side pre-checks — the identical mechanism the framing document-upload path already uses (`CalloutFormConnector.tsx`).

**Rationale**: `DocumentImportZone` is already a fully generic, CRD-compliant (no business logic, props-only), tested drag-drop/click-to-upload component with no dependency on the framing use case — its props (`acceptAttr`, `value`, `onChange`, `onError`, `error`, `busy`, labels) are exactly what an add-document dialog needs. Duplicating it would violate constitution Architecture Std 6f (DRY) and Std 6a (SRP — this component's one job is already "stage and validate one file").

**Alternatives considered**: `useStorageConfig` + the generic `uploadFileOnStorageBucket` mutation (the `LinkUrlAttachFileButton.tsx` pattern) — rejected. That pattern uploads to a storage bucket and returns a URL for a *Link* contribution; it is not wired to `importCollaboraDocument` at all (a different mutation, a different backend path — file-service-go's Collabora-aware import, not the generic bucket upload) and using it would mean re-deriving the Collabora-specific `.docx`/`.xlsx`/`.pptx`/15 MB constraints a second time instead of reusing the single existing canonical source (`collaboraImportFormats.ts`).

## R4: Opening / editing a document response

**Decision**: Reuse `CollaboraDocumentEditor` (the iframe + WOPI session component) and `useCollaboraEditorConnection` (connection health, token refresh, recovery) exactly as the framing editor overlay does, inside one new sibling overlay component parameterized for contribution use (see Project Structure). Reuse `canRenameCollaboraDocument` / `useRenameCollaboraDocument` unchanged for the rename control.

**Rationale**: These are already entity-scoped by `collaboraDocumentId`, not framing-scoped — `CollaboraDocumentEditor`'s only required prop is the document id. The one framing-specific piece is `CollaboraFramingEditorOverlay`'s own `refetchDocumentName` call, which targets the framing-only queries `CalloutDetails` / `CalloutsOnCalloutsSetUsingClassification`. A contribution-scoped variant needs `CalloutContributions` / `CalloutDetails` instead (the queries that actually list contributions), and additionally needs a delete affordance (contribution documents are independently deletable; a framing document is not — it's deleted only by deleting the whole post). A parameterized `refetchQueries` prop plus a new `onDelete`/`canDelete` prop pair is the minimal change; copying the whole 150-line component was considered and rejected as unnecessary duplication once the actual per-branch deltas (refetch targets, delete affordance) are this small — see R5 for why delete itself stays out of this new component.

**Alternatives considered**: Generalizing `CollaboraFramingEditorOverlay` in place to accept a `refetchQueries` prop and an optional delete affordance, used by both framing and contribution call sites — considered, but rejected for this story: the framing call site has zero desire for a delete button (framing documents cannot be deleted independently), so a shared component would need a conditional-prop branch purely to keep an irrelevant capability out of an unrelated surface. A small, clearly-named sibling (`CollaboraContributionEditorOverlay`) is more readable and satisfies Interface Segregation (constitution Std 6d) — each overlay's prop surface exactly matches what its one call site needs.

## R5: Delete a document response

**Decision**: Reuse the generic `useDeleteContributionMutation` (already used by Whiteboard/Post/Link/Memo contribution deletion) and the *existing, centralized* confirm-before-delete mechanism already present in `CalloutDetailDialogConnector.tsx` (`confirmDeleteContribution` state + `deleteContributionDialog`, a single shared `ConfirmationDialog` instance) rather than building a new, document-specific delete-confirmation UI. The new editor overlay exposes a header delete icon that calls an `onDelete` callback prop; the parent (`CalloutDetailDialogConnector`) supplies that callback, staging the id/title/`kind: 'document'` into the existing centralized state.

**Rationale**: `useDeleteContributionMutation` is entity-agnostic (`DeleteContributionMutationVariables = { contributionId }`) — it already deletes whiteboard, post, and link contributions identically. The confirm-dialog mechanism is likewise already generic (keyed by `{ id, title, kind }`); extending the `kind` union from `'post' | 'whiteboard'` to include `'document'` is a two-line change versus building a second `ConfirmationDialog` instance, which would violate Golden Rule #9 ("no exceptions... reuse the shared mechanism") and DRY (constitution Std 6f).

**Alternatives considered**: An internal delete-confirm flow inside the new overlay itself, mirroring `CrdWhiteboardDialog`'s self-contained delete UI — rejected as materially more code for no behavioral benefit, since `CalloutDetailDialogConnector` already owns exactly this mechanism one call site away.

## R6: Response-type selection UI

**Decision**: Add a fifth `'document'` entry to the existing `ResponseType` union, `ResponseTypeChipStrip`'s `CHIPS` array (icon: `FileText` from `lucide-react`, already imported elsewhere in this file's sibling modules), and `calloutFormMapper.ts`'s `RESPONSE_TO_CONTRIBUTION_TYPE` map. Add a `'document'` case to `ResponsePanel`'s dispatch switch, routing to the existing `SimpleContributionPanel` (the same sub-panel Whiteboard/Memo already use — `ActorSwitches` only, no "Set Default Response" button since `responseTypeSupportsDefaults` in `CalloutFormConnector.tsx` already excludes `'document'` by construction, exactly like `'link'`).

**Rationale**: This is a closed, enumerable set of small edits across files whose shape already anticipates a fifth type — the FR-015/FR-016 comment in `types.ts` and the `contributionSettings.types.document` / `responseDefaults.title.document` i18n keys were pre-scaffolded and are simply unused today. No new sub-panel component is needed; `SimpleContributionPanel` is already generic (`ActorSwitches` + optional defaults button).

**Alternatives considered**: A dedicated `DocumentResponsePanel` — rejected; there is no document-specific configuration to show at response-type-selection time (no pre-populate rows, no defaults), so a distinct component would be an empty wrapper.

## R7: Contribution-card rendering

**Decision**: New `ContributionDocumentCard` (CRD, `src/crd/components/contribution/`), structurally copying `ContributionWhiteboardCard`'s box/hover/gradient-footer pattern but rendering only the icon-fallback branch (no image branch — no preview URL exists in the schema for `CollaboraDocument`, confirmed absent). The icon is chosen via the existing `toCollaboraPreviewType` mapping (`src/main/crdPages/space/callout/collaboraDocumentTypeMap.ts`) plus a small `text|spreadsheet|presentation → lucide icon` lookup (`FileText`/`Sheet`/`Presentation` — the same three icons already used by `CollaboraFramingEditorOverlay` and `CollaboraDocumentTypePicker`).

**Rationale**: Reuses the one existing type-mapping helper rather than inventing a parallel one (DRY); keeps this story's new card visually and structurally consistent with the sibling `ContributionWhiteboardCard` it is closest in kind to (both are "click opens a fullscreen collaborative editor" cards), per spec Clarifications Q3 / Assumption A-006.

**Alternatives considered**: Depending on the sibling `client-web#9872` story's in-flight `CalloutCollaboraPreview` color treatment — rejected; that component previews **framing** documents specifically (different props, different data source, different PR, uncertain merge order) and coupling this story to it would create an unnecessary cross-PR dependency for a purely cosmetic decision.

## R8: i18n

**Decision**: Reuse existing keys wherever already present and generic (`callout.addDocument`, `callout.openDocument`, `callout.documentImportHint`, `callout.documentImportMaxSize`, `callout.documentImportOr`, `callout.documentImportRemoveFile`, `callout.documentImportErrorUnsupported`, `callout.documentImportErrorTooLarge`, `callout.documentImportErrorMultiple`, `callout.documentImportErrorFolder`, `callout.documentImportErrorServiceUnavailable`, `contributionSettings.types.document`, `contentType.document`). Add a small number of new keys only where none exist: a dialog title for the add-document flow (e.g. `callout.addDocumentDialogTitle`) and a delete-confirmation content-type label if the existing `deleteContribution.description`/`contentType` map needs a document-specific noun phrase. All new keys added to all six `src/crd/i18n/space/space.{en,nl,es,bg,de,fr}.json` files in the same PR, per constitution Architecture Std 3.

**Rationale**: The pre-scaffolded keys (confirmed by direct read of `space.en.json`) were placed for exactly this follow-up story; reusing them satisfies DRY and avoids duplicate-with-drift copy for the same concept (e.g. two different "upload a document" hint strings).

**Alternatives considered**: None — this is a mechanical inventory step, not a design decision.

## Summary of resolved unknowns (Technical Context)

No item in the Technical Context below required `[NEEDS CLARIFICATION]` — every dependency is already present in the repo (confirmed by direct inspection above) and no new runtime package is introduced.
