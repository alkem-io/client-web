# Contract — GraphQL Operations

**Feature**: 102-crd-innovation-hub
**Scope**: GraphQL operations the integration layer (`src/main/crdPages/innovationHub/`) invokes. Every operation listed here **already exists** in `src/core/apollo/generated/apollo-hooks.ts` and is reused unchanged. No `pnpm codegen` rerun is required for this feature.

---

## Queries

### `InnovationHubById($id: UUID!)`

**Hook**: `useInnovationHubByIdQuery({ variables: { id }, skip: !id })`
**Source file**: `src/domain/innovationHub/HubLandingPage/InnovationHubById.graphql`
**Where invoked**: `useInnovationHubHomeData.ts` — when the user is on `/hub/<slug>` and `useUrlResolver().innovationHubId` resolves to a UUID.

**Returns** (`InnovationHubHomeInnovationHubFragment` from `Platform.innovationHub`):
- `id`, `nameID`
- `profile { id, displayName, tagline, description, banner: visual(BANNER_WIDE) { id, uri, alternativeText } }`
- `authorization { myPrivileges }` — drives the settings-gear visibility (`Update` privilege gates the gear; the same fragment is reused by `useInnovationHub()` so the legacy and CRD paths consume the same data)

**Cache policy**: default (cache-first via `useUrlResolver` resolution).

---

### `InnovationHub($subdomain: String)`

**Hook**: `useInnovationHubQuery({ variables: { subdomain }, fetchPolicy: 'cache-first' })`
**Source file**: `src/domain/innovationHub/useInnovationHub/InnovationHub.graphql`
**Where invoked**: indirectly via the existing `useInnovationHub()` domain hook (`src/domain/innovationHub/useInnovationHub/useInnovationHub.ts`) — reused in the CRD home-route dispatcher branch.

**Returns**: same fragment as `InnovationHubById` (above).

**Subdomain resolution**: server reads the host header when `subdomain` is `undefined`; in local dev, the value comes from the `?subdomain=` query param. The CRD dispatcher does NOT touch this resolution — it reuses the existing hook verbatim.

---

### `InnovationHubSettings($innovationHubId: UUID!)`

**Hook**: `useInnovationHubSettingsQuery({ variables: { innovationHubId }, skip: !innovationHubId })`
**Source file**: `src/domain/innovationHub/InnovationHubsSettings/InnovationHubsSettings.graphql`
**Where invoked**: `useInnovationHubSettingsData.ts` — the data hook backing both Settings tabs.

**Returns** (`InnovationHubSettingsFragment`):
- `id`, `subdomain`
- `profile { id, displayName, description, tagline, tagset { id, name, tags, type }, visual(BANNER_WIDE) { id, uri, alternativeText, name, ...VisualModelFull }, url }`
- `spaceListFilter [...InnovationHubSpace]` — ordered list of selected Spaces
- `spaceVisibilityFilter` — unused in this feature; out of scope

**Authorization**: this query returns the same hub regardless of viewer privilege. The integration layer enforces the privilege guard separately by reading `authorization.myPrivileges` from the home-page fragment (or by piggybacking on the existing `useInnovationHub()` data already in cache).

> **Note**: `InnovationHubSettings` fragment does NOT include `authorization.myPrivileges` today. The guard reads privilege from the home fragment (`InnovationHubHomeInnovationHubFragment`), which is what the settings-icon visibility already does. Both fragments share the same hub id, so the Apollo cache returns the same entity.

---

### `DashboardSpaces` (existing — used by the hub home page's Spaces grid)

**Hook**: `useDashboardSpacesQuery()`
**Where invoked**: `useInnovationHubHomeData.ts`.

The legacy home page renders `useDashboardSpacesQuery().data?.spaces` as the Spaces grid. The CRD page consumes the same data through a shared mapper that produces `SpaceCardData[]`.

> **TODO during implementation**: Confirm whether the Spaces grid on the hub home should render the hub's curated `spaceListFilter` (from `InnovationHubSettings`) or the platform's `DashboardSpaces`. The legacy `InnovationHubHomePage.tsx` uses `useDashboardSpacesQuery()` (the platform-wide list), but the prototype shows hub-specific curated spaces. Resolve in Phase 2 (`/speckit.tasks`) — likely the curated list, which would require fetching `InnovationHubSettings` from the hub-home page too (or a slimmer hub-spaces query). For now this contract documents both as options; the data mapper file in `dataMappers/` chooses one explicitly at implementation time.

---

## Mutations

### `UpdateInnovationHub`

**Hook**: `useUpdateInnovationHubMutation()`
**Source file**: `src/domain/innovationHub/InnovationHubsMutations.graphql`
**Where invoked**:
- `useHubAboutTabData.ts` — partial profile updates per section (subdomain, displayName, tagline, description, tagsets)
- `useHubSpacesTabData.ts` — `spaceListFilter` writes on add/remove/reorder

**Input shape per section save**:

```graphql
mutation UpdateInnovationHub($hubData: UpdateInnovationHubInput!) {
  updateInnovationHub(updateData: $hubData) { ... }
}

# Per-section variables:
#  - subdomain  → { ID, subdomain: "<new>" }
#  - name       → { ID, profileData: { displayName: "<new>" } }
#  - tagline    → { ID, profileData: { tagline: "<new>" } }
#  - description → { ID, profileData: { description: "<new>" } }
#  - tags       → { ID, profileData: { tagsets: [{ ID, name, tags }] } }
#  - spaces (reorder/add/remove) → { ID, spaceListFilter: ["<spaceId1>", "<spaceId2>", ...] }
```

The mutation accepts partial input; unspecified fields remain unchanged server-side. Apollo cache is updated through the mutation's return value (the full `InnovationHubSettings` fragment is returned).

**Optimistic response for `spaceListFilter` reorder** — reuses the legacy pattern:

```typescript
optimisticResponse: {
  updateInnovationHub: {
    ...innovationHub,
    spaceListFilter: sortBy(
      innovationHub.spaceListFilter,
      ({ id }) => orderedIds.indexOf(id)
    ),
  },
},
```

---

### `UploadVisual`

**Hook**: `useUploadVisualMutation()` (existing across multiple CRD migrations).
**Where invoked**: `useHubAboutTabData.ts` — when the user selects a new banner file in the About tab.

**Input shape**:

```graphql
mutation UploadVisual($file: Upload!, $uploadData: VisualUploadImageInput!) {
  uploadImageOnVisual(uploadData: $uploadData, file: $file) {
    id
    uri
    alternativeText
  }
}

# Variables:
#  - file = the File selected by the <input type="file" />
#  - uploadData = { visualID: <id of profile.visual(BANNER_WIDE)> }
```

The mutation result updates the Apollo cache in place. The `useInnovationHubSettingsQuery` re-resolves with the new `uri`, propagating to:
- the Settings sticky header thumbnail
- the About tab banner preview
- the public Hub home banner (after re-navigation / cache refresh)

---

## Existing domain hooks reused

These are **headless** domain hooks. They MAY be imported into the integration layer (`src/main/crdPages/innovationHub/`) per the migration guide; they MUST NOT be imported into the CRD layer (`src/crd/components/innovationHub/`).

- `useUrlResolver()` (`src/main/routing/urlResolver/useUrlResolver.ts`) — resolves the current URL to entity ids (`innovationHubId`, etc.).
- `useInnovationHub()` (`src/domain/innovationHub/useInnovationHub/useInnovationHub.ts`) — wraps `useInnovationHubQuery` + `useInnovationHubAttrs` to resolve the hub from subdomain.
- `useResolveSpaceUrl()` (`src/domain/innovationHub/InnovationHubsSettings/useResolveSpaceUrl.ts`) — used by the CRD `AddSpaceByUrlDialog` port to validate a Space URL and resolve its `id`.
- `useCurrentUserContext()` (`src/domain/community/userCurrent/useCurrentUserContext.ts`) — used on the home page to decide whether to show leads on Space cards.
- `useConfig()` (`src/domain/platform/config/useConfig.ts`) — provides `locations.domain` used by the "Browse all Spaces" CTA.
- `useNotification()` (`src/core/ui/notifications/useNotification.ts`) — or its CRD equivalent (toast via `sonner`) — used for save success / failure feedback. The Space-Settings CRD page uses `sonner` toasts; this feature follows that pattern.

---

## Forbidden in the CRD layer

The CRD layer (`src/crd/components/innovationHub/*`) MUST NOT import:
- Any of the generated hooks listed above
- Any of the generated GraphQL types (`InnovationHubHomeInnovationHubFragment`, `InnovationHubSettingsFragment`, etc.)
- Any of the domain hooks
- `react-router-dom`
- `@mui/*`, `@emotion/*`
- `formik`, `yup`

This is enforced by code review against `src/crd/CLAUDE.md`.
