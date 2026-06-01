# GraphQL Operations Contract

**Phase**: 1 (Design)
**Date**: 2026-05-09

This feature introduces **no new GraphQL operations**. It composes two existing operations and removes one.

## Reused operations

### `urlResolver` (read)

Source: `src/main/routing/urlResolver/UrlResolvers.graphql`

```graphql
query UrlResolver($url: String!) {
  urlResolver(url: $url) {
    state
    ...UrlResolverResult
    closestAncestor {
      ...UrlResolverResultClosestAncestor
      url
    }
  }
}
```

Generated hook used: `useUrlResolverLazyQuery` (already in `apollo-hooks.ts`).

**Inputs**:
- `url: String!` — the URL pasted by the admin (sent verbatim; no client normalisation beyond `String.prototype.trim()`).

**Outputs consumed by this feature**:
- `urlResolver.state` — accept only `Resolved`.
- `urlResolver.type` — accept only `UrlType.Space`.
- `urlResolver.space.id` — used as the new Space ID.
- `urlResolver.space.level` — must equal `0`.

All other returned fields (`closestAncestor`, `parentSpaces`, `collaboration`, `templatesSet`, etc.) are ignored by this feature.

**Failure modes** — all collapse to "URL is not a valid top level space" per spec FR-007:
- Apollo returns an `error` (network, server 5xx, GraphQL error).
- `state ∈ { Forbidden, NotFound }`.
- `type !== Space`.
- `space?.level !== 0`.
- `space?.id` missing.

### `updateInnovationHub` (mutation)

Source: `src/domain/innovationHub/InnovationHubsSettings/InnovationHubsMutations.graphql`

```graphql
mutation updateInnovationHub($hubData: UpdateInnovationHubInput!) {
  updateInnovationHub(updateData: $hubData) {
    ...InnovationHubSettings
  }
}
```

Generated hook used: `useUpdateInnovationHubMutation` (already wired in `InnovationHubSettingsPage.tsx`).

**Inputs**:
- `hubData.ID: UUID!` — the current Hub ID.
- `hubData.spaceListFilter: [UUID!]` — `[...existingSpaceIds, newSpaceId]`.

**Outputs**:
- The updated `InnovationHub`, including the refreshed `spaceListFilter`.

**Optimistic response**: The existing `handleSubmitSpaceListFilter` already builds an optimistic response; we reuse it as-is. Because we only know the new Space's `id` (not its full `Space` profile) at optimistic-response time, the optimistic list will not include the newly-added Space's UI fields — the network response fills them in. This is acceptable: the dialog closes immediately on success and the table will rerender with the real data when the server response arrives. *(If this UX feels jumpy in practice during implementation, consider replacing the optimistic response only for this code path — out of scope for the plan.)*

## Removed operation

### `InnovationHubAvailableSpaces` (delete)

Source (to be deleted): `src/domain/innovationHub/InnovationHubsSettings/InnovationHubAvailableSpaces.graphql`

```graphql
query InnovationHubAvailableSpaces {
  spaces(filter: {
    visibilities: [ACTIVE, DEMO, INACTIVE]
  }) {
    ...InnovationHubSpace
  }
}
```

This was the candidate-list query used by the search dialog. It is unused after this feature lands. Per spec FR-001 and the simplification directive, the file is deleted, the import in `InnovationHubSpacesField.tsx` is removed, and `pnpm codegen` regenerates `apollo-hooks.ts` without `useInnovationHubAvailableSpacesQuery`.

## No schema changes

No `.graphql` schema file or backend resolver is modified. `pnpm codegen` is required only because we are removing a query file, which alters the generated hooks index.
