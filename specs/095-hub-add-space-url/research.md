# Research: Innovation Hub — Add Space by URL

**Phase**: 0 (Outline & Research)
**Date**: 2026-05-09
**Spec**: [spec.md](./spec.md)

## Goal

Resolve all NEEDS CLARIFICATION items so design artifacts can be produced without unknowns. The spec is intentionally simple: replace the existing search-based "Add Space" dialog in the Innovation Hub admin with a URL-input dialog; the server is the single source of truth for validity.

## Findings

### 1. Existing dialog to replace

**Decision**: Replace the dialog block inside `src/domain/innovationHub/InnovationHubsSettings/InnovationHubSpacesField.tsx` (currently at lines 108–224 of that file). The surrounding component continues to render the sortable list of currently-added Spaces and the top-right "Add" button — only the dialog body changes.

**Rationale**: Minimal blast radius. The list rendering, drag-and-drop, and remove behaviour are all unaffected by the spec; only the dialog's content and the underlying GraphQL changes. Co-locating the new dialog in a sibling file (`AddSpaceByUrlDialog.tsx`) keeps the parent component readable and the new dialog independently testable.

**Alternatives considered**:
- *Inline the new dialog directly into `InnovationHubSpacesField.tsx`* — rejected. The current file is already 250 lines and mixes table + dialog concerns. Extracting at this rewrite is cheaper than later.
- *Move the whole field component to CRD (shadcn/ui + Tailwind)* — rejected. The Innovation Hub admin page is not yet on CRD; introducing CRD here would require migrating the surrounding admin shell. Out of scope.

### 2. URL → Space resolution

**Decision**: Reuse the existing `urlResolver(url: String!)` GraphQL query (defined in `src/main/routing/urlResolver/UrlResolvers.graphql`) via the generated `useUrlResolverLazyQuery` hook. The resolver already returns:
- `state: UrlResolverResultState` (`Resolved | Forbidden | NotFound`)
- `type: UrlType` (we check for `UrlType.Space`)
- `space.id`
- `space.level` (we require `=== 0`)
- `space.levelZeroSpaceID`

**Rationale**: No schema change is needed; the platform already exposes the exact resolver the spec assumes. There is precedent: `src/domain/templates/components/Forms/SpaceContentFromSpaceUrlForm.tsx:35` already uses `useUrlResolverLazyQuery` to validate a Space URL. We follow the same pattern, plus the additional `level === 0` check.

**Alternatives considered**:
- *Use `lookupByName.space(NAMEID)`* — rejected. Requires client-side URL parsing to extract the nameID, adds host-validation responsibility back to the client, and returns minimal fields (no `level`). Server-side `urlResolver` does the whole job uniformly.
- *Add a new dedicated mutation `addSpaceToInnovationHubByUrl`* — rejected. No backend work is in scope; the spec is a client-only workaround.

### 3. Mutation to add the Space

**Decision**: Reuse the existing `updateInnovationHub` mutation (defined in `InnovationHubsMutations.graphql`) with `spaceListFilter: [UUID]` populated from the current list plus the newly resolved Space ID. This is the same mechanism already used by the search-based add path (see `InnovationHubSettingsPage.tsx:55–76`, `handleSubmitSpaceListFilter`).

**Rationale**: One code path for "set the list of Spaces", optimistic-response support already wired, no schema change.

**Alternatives considered**: None worth listing — this is the established pattern in the existing page.

### 4. Failure case classification

**Decision**: Map every non-success outcome to a single i18n key `pages.admin.innovationHub.spaceListFilter.addByUrl.invalidSpaceUrl` rendering "URL is not a valid top level space". Specifically:

| Outcome | Mapped to |
|---|---|
| Apollo network/server error (incl. 500, timeout, schema error) | Generic error |
| `state === Forbidden` | Generic error |
| `state === NotFound` | Generic error |
| `state === Resolved` && `type !== UrlType.Space` | Generic error |
| `state === Resolved` && `type === UrlType.Space` && `space.level !== 0` | Generic error |
| `state === Resolved` && `type === UrlType.Space` && `space.level === 0` && Space ID already in `spaceListFilter` | Distinct duplicate i18n key |
| `state === Resolved` && `type === UrlType.Space` && `space.level === 0` && Space ID NOT already in `spaceListFilter` | Success: append + close dialog |

**Rationale**: Aligns 1:1 with FR-007/FR-008. No client-side host check or path-segment heuristic per the 2026-05-09 clarifications.

**Alternatives considered**: A status-specific message map (subspace vs. not-found vs. wrong-type) — explicitly rejected by the spec ("anything else should just show 'URL is not a valid top level space'").

### 5. Submit-button enablement

**Decision**: The submit button is disabled while the trimmed input is empty OR `new URL(input)` throws. The `URL` constructor is the canonical way to test for a syntactically valid URL and is supported in 100% of target browsers.

**Rationale**: Spec FR-003. Standard form UX, zero new dependency.

**Alternatives considered**: A regex test — rejected as fragile and harder to read than `try { new URL(value) } catch {}`.

### 6. Loading and error UX

**Decision**:
- During `parseUrl` call: submit button disabled, spinner inside the button, status text "URL is being validated…" rendered above the submit row.
- On any error: inline message rendered below the input field; dialog stays open; the message clears on the next `onChange` of the input.
- On success: parent `onChange` (existing prop) is called with `[...currentIds, newId]`, then the dialog closes.

**Rationale**: Spec FR-005, FR-007a (existing 2026-05-01 clarification, retained).

**Alternatives considered**: Toast/snackbar for errors — rejected; keeps the user away from the input they need to correct.

### 7. Translation keys

**Decision**: Add the following keys under `src/core/i18n/en/translation.en.json` only (Crowdin manages the others, per CLAUDE.md):

```
pages.admin.innovationHub.spaceListFilter.addByUrl.dialogTitle
pages.admin.innovationHub.spaceListFilter.addByUrl.urlInputLabel
pages.admin.innovationHub.spaceListFilter.addByUrl.urlInputPlaceholder
pages.admin.innovationHub.spaceListFilter.addByUrl.submit
pages.admin.innovationHub.spaceListFilter.addByUrl.cancel
pages.admin.innovationHub.spaceListFilter.addByUrl.validating
pages.admin.innovationHub.spaceListFilter.addByUrl.invalidSpaceUrl
pages.admin.innovationHub.spaceListFilter.addByUrl.alreadyAdded
```

**Rationale**: Namespacing under the existing `pages.admin.innovationHub.spaceListFilter.*` block keeps related strings together. No CRD i18n is involved (this is an MUI admin page, not a CRD page).

### 8. What gets removed

**Decision**: Delete `InnovationHubAvailableSpaces.graphql` and the `useInnovationHubAvailableSpacesQuery` import in `InnovationHubSpacesField.tsx`, plus the `filter`/`filteredAvailableSpaces`/`sortedAvailableSpaces`/`columns`/`DataGridTable` blocks belonging to the search dialog.

**Rationale**: Spec FR-001 is explicit: "The previous search-based Add dialog MUST be removed." Leaving the dead query around would clutter the schema and codegen output.

**Alternatives considered**: Keeping the file for future restoration when the platform search bug (#1848) is fixed — rejected. Git history retains it; carrying dead code is the wrong default.

## Open questions

None remaining. All NEEDS CLARIFICATION items resolved or determined out of scope.
