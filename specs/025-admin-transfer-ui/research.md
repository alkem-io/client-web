# Research: Admin UI for Space Conversions & Resource Transfers

**Date**: 2026-03-24 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

## Research Topics

### R1: URL Resolution Pattern for Entity Identification

**Decision**: Reuse the existing per-section URL resolver pattern — each new section defines its own GraphQL query fragment calling `urlResolver(url: $url)` and requesting only the fields it needs.

**Rationale**: The existing `TransferSpaceSection` and `TransferCalloutSection` each define focused URL resolve queries in their `.graphql` files (e.g., `SpaceTransferUrlResolve`, `CalloutUrlResolve`). These request only the entity fields needed for that operation rather than sharing a monolithic resolver. This keeps each section self-contained and avoids over-fetching.

**Alternatives considered**:
- *Shared URL resolver hook*: Would reduce code duplication but creates coupling between sections. Each section needs different fields from the resolved entity. Rejected because the per-section pattern is established and aligns with SRP.
- *Reuse the app-level `UrlResolverProvider`*: Too heavy — designed for routing, returns the full `UrlResolverQueryResults` type with 30+ fields. Rejected for over-fetching and tight coupling to the routing system.

**Key technical details**:
- Query: `urlResolver(url: String!)` returns `{ state: UrlResolverResultState, type: UrlType, ... }`
- `UrlResolverResultState` enum: `Resolved`, `NotFound`, `Forbidden`
- `UrlType` enum covers: `Space`, `User`, `Organization`, `VirtualContributor`, `InnovationPacks`, `InnovationHub`, `Callout`
- Space resolution includes `level` (L0/L1/L2) and `levelZeroSpaceID` — critical for space conversions
- Existing pattern: `src/domain/platformAdmin/management/transfer/transferSpace/TransferSpace.graphql`

---

### R2: Target Account Selection — Searchable Picker vs URL Input

**Decision**: Build a shared `AccountSearchPicker` component that uses a new lazy GraphQL query to search platform admin users and organizations by display name, presenting results in a `FormikAutocomplete` dropdown. Used by the 3 new resource transfer operations (Hub, Pack, VC).

**Rationale**: The spec mandates searchable pickers for new operations (FR-027). A dedicated account search query combining users and organizations avoids requiring admins to know exact URLs. The `FormikAutocomplete` component already exists in `src/core/ui/forms/` and provides MUI Autocomplete with Formik integration, including search-as-you-type.

**Alternatives considered**:
- *URL-based input like existing Transfer Space*: The spec explicitly requires pickers for new operations (FR-027, FR-028 preserves URL pattern only for existing sections). Rejected per spec requirement.
- *Two separate pickers (one for users, one for orgs)*: Creates unnecessary cognitive load — admin doesn't always know if the target account belongs to a user or organization. Rejected for UX reasons.
- *Reuse `FormikUserSelector`*: Too specialized — only searches users by email/displayName and renders `ProfileChipView`. Doesn't support organizations. Rejected because we need both entity types.

**Key technical details**:
- Source queries: `platformAdminUsersList` (with `UserFilterInput`) and `platformAdminOrganizationsList` (with `OrganizationFilterInput`) — both support `first`, `after`, `filter` parameters
- New query combines user + org search into a single lazy query triggered on input change
- Results display: `displayName (User)` or `displayName (Organization)` with account ID as value
- Must check `AuthorizationPrivilege.TransferResourceAccept` on the target account
- Reuses `FormikAutocomplete` from `src/core/ui/forms/FormikAutocomplete.tsx`

---

### R3: L1 Space Target Picker for L1→L2 Demotion

**Decision**: Use `SubspacesInSpace` query on the resolved space's `levelZeroSpaceID` to fetch all L1 sibling subspaces, then present them in a `FormikAutocomplete` excluding the source space itself.

**Rationale**: The `SubspacesInSpace(spaceId)` query already exists at `src/domain/space/graphql/queries/Subspaces.graphql` and returns `space.subspaces[]` with `id`, `level`, and profile info. Filtering client-side for `level === SpaceLevel.L1` and excluding the current space gives exactly the valid target set.

**Alternatives considered**:
- *Server-side filtered query*: No existing query filters subspaces by level. Adding one would require backend changes, which are out of scope. Rejected.
- *New dedicated query*: Redundant — `SubspacesInSpace` already returns what we need. The L0 space's direct children are always L1. Rejected for unnecessary duplication.
- *URL-based input for target L1*: Spec explicitly requires searchable picker for this operation (FR-026). Rejected per spec.

**Key technical details**:
- When admin resolves an L1 space URL, the URL resolver returns `levelZeroSpaceID`
- Use `levelZeroSpaceID` to fetch all L0 subspaces — these are always L1 by definition
- Filter out the source space from the picker options
- If no other L1 spaces exist, show explanatory message and disable operation (acceptance scenario 5)
- May need a lightweight query variant to avoid fetching heavy card fragments — only need `id`, `about.profile.displayName`, and `level`

---

### R4: Confirmation Dialog Patterns for Destructive Operations

**Decision**: Use the existing `ConfirmationDialog` component from `src/core/ui/dialogs/ConfirmationDialog.tsx` with operation-specific content populated via i18n keys. Each destructive operation gets distinct warning text listing exact consequences.

**Rationale**: The `ConfirmationDialog` already supports all needed features: title/content via i18n or direct props, loading state, confirm/cancel actions. The existing transfer sections use exactly this pattern. No need to create a new component.

**Alternatives considered**:
- *Custom dialog per operation*: Over-engineering — `ConfirmationDialog` already handles all cases. Rejected.
- *Single generic warning*: Spec requires operation-specific consequences in confirmation dialogs (FR-007 through FR-011, SC-006). Rejected per spec.

**Key technical details**:
- Props: `{ entities: { title, content, confirmButtonText }, actions: { onConfirm, onCancel }, options: { show }, state: { isLoading } }`
- Loading state: `useState` with `try/finally` pattern (established convention in `TransferSpaceSection`)
- Success: `useNotification()` with `'success'` severity (auto-hides in 3s)
- Error: `useNotification()` with `'error'` severity (auto-hides in 15s) or `useApolloErrorHandler`
- L1→L2 confirmation must list: user members, user leads, org members, org leads, VC members removed (FR-008)
- L1→L0 confirmation must warn: innovation flow reset to defaults (FR-009)
- VC conversion must warn: callouts moved, not copied (FR-010)

---

### R5: Page Organization — Two Areas with Subsections

**Decision**: Reorganize the existing `TransferPage.tsx` into two visual areas using `PageContentBlock` components with `BlockTitle` headers: "Conversions" (top) and "Transfers" (bottom). Each area contains its subsections as collapsible or stacked blocks.

**Rationale**: The spec requires a single page with two main areas by use case (FR-002). The existing `TransferPage` already renders `TransferCalloutSection` and `TransferSpaceSection` in a flat layout. Reorganizing into two labeled areas with `PageContentBlock` (used throughout admin pages) maintains consistency.

**Alternatives considered**:
- *Tab-based navigation between areas*: Adds unnecessary navigation. Both areas fit on a single scrollable page. Rejected for simplicity.
- *Separate routes per area*: Spec says single page (FR-001). Rejected per spec.
- *Accordion/collapsible sections*: Considered for reducing visual clutter with 7 subsections. May be worth implementing if the page feels too long, but start with simple stacked blocks and iterate. Deferred to implementation.

**Key technical details**:
- Use `PageContentBlock` with `BlockTitle` for area headers (e.g., "Space Conversions", "Transfers")
- Each subsection is a self-contained component receiving no props (each manages its own state)
- Conversions area: `SpaceConversionSection` + `VcConversionSection`
- Transfers area: `TransferSpaceSection` (existing) + `TransferInnovationHubSection` + `TransferInnovationPackSection` + `TransferVirtualContributorSection` + `TransferCalloutSection` (existing)
- Page title changes from "Transfer" to "Conversions & Transfers" — requires i18n key update and admin tab label update

---

### R6: Space State Display for Conversions

**Decision**: After URL resolution, fetch space details via a lookup query and display: name, current level (L0/L1/L2), community role counts (for L1→L2), account owner name, and parent space chain. Then dynamically show only applicable operations.

**Rationale**: The spec requires displaying current state before any operation (FR-004) and showing only applicable operations based on level (FR-025). The URL resolver already returns `level` and `levelZeroSpaceID`. A follow-up lookup query provides the remaining display fields.

**Alternatives considered**:
- *Fetch everything in the URL resolve query*: URL resolver is a lightweight routing-focused query. Adding community counts and account details would bloat it. Rejected for separation of concerns.
- *Show all operations with disabled states*: Spec says hide inapplicable operations (FR-024, FR-025). Showing disabled buttons creates confusion about what's possible. Rejected per spec.

**Key technical details**:
- URL resolve → get `spaceId`, `level`, `levelZeroSpaceID`
- Lookup query → get `about.profile.displayName`, `community.roleSet` (member/lead counts for L1→L2 warning), `account.host.profile.displayName`
- L0 space: show informational message "L0 spaces cannot be converted"
- L1 space: show "Promote to Space (L1→L0)" and "Demote to Sub-subspace (L1→L2)" buttons
- L2 space: show "Promote to Subspace (L2→L1)" button
- Each operation button opens its confirmation dialog with operation-specific warnings

---

### R7: Entity Lookup Queries for New Transfer Operations

**Decision**: Each new transfer section defines its own lightweight lookup query to fetch the resolved entity's display details (name, current account owner) plus authorization privileges. Pattern matches existing `SpaceTransferLookup` and `CalloutLookup`.

**Rationale**: Consistent with the established one-query-per-entity pattern. Each entity type has different fields worth displaying (hub has subdomain, pack has template count, VC has type).

**Alternatives considered**:
- *Shared generic entity lookup*: No single query can fetch all entity types. The GraphQL `lookup` root field has typed accessors (`lookup.innovationHub`, `lookup.innovationPack`, etc.). Rejected — not possible with GraphQL type system.

**Key technical details**:
- Innovation Hub lookup: `lookup.innovationHub(ID)` → `{ id, about.profile.displayName, account.host.profile.displayName, authorization.myPrivileges }`
- Innovation Pack lookup: `lookup.innovationPack(ID)` → `{ id, about.profile.displayName, account.host.profile.displayName, authorization.myPrivileges }`
- Virtual Contributor lookup: `lookup.virtualContributor(ID)` → `{ id, about.profile.displayName, account.host.profile.displayName, aiPersona.bodyOfKnowledgeType, authorization.myPrivileges }`
- For VC conversion: also need source space info + callout count from the VC's `aiPersona.bodyOfKnowledgeID` → space lookup → `collaboration.calloutsSet.callouts` count
