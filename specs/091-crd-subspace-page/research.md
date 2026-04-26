# Phase 0 Research: CRD SubSpace Page

**Branch**: `091-crd-subspace-page` | **Date**: 2026-04-26

This document resolves the open technical questions surfaced by `plan.md` and the assumptions called out in `spec.md`. Every decision is backed by code references (absolute paths) verified against the current `develop` branch.

---

## R1 — True community member count

### Question
The L0 banner currently displays `memberAvatars.length` as the "+N" overflow count, where `memberAvatars` is computed from `space.about.membership.leadUsers`. This means the count is the lead-user count (typically 1–3), not the actual community size. The fix needs a real total. Does the GraphQL schema expose one?

### Investigation
- Searched `src/core/apollo/generated/graphql-schema.ts` for `memberCount`, `memberUsersCount`, `totalMembers`, `membersCount` near `Community`, `RoleSet`, and `SpaceAboutMembership`. No scalar count field exists on any of those types.
- The `RoleSet` type exposes `usersInRole(role: CommunityRoleType!): [User!]!` which returns the full member list.
- `src/domain/platformAdmin/management/transfer/spaceConversion/SpaceConversion.graphql` already uses this pattern: `memberUsers: usersInRole(role: MEMBER) { id }`.

### Decision
Add a new GraphQL document at `src/domain/space/community/CommunityMemberCount.graphql`:

```graphql
query CommunityMemberCount($spaceId: UUID!) {
  lookup {
    space(ID: $spaceId) {
      id
      about {
        membership {
          roleSetID
          memberUsers: roleSet { usersInRole(role: MEMBER) { id } }
        }
      }
    }
  }
}
```

Run `pnpm codegen`. The integration mapper computes `totalCount = memberUsers.length`. The query fetches only `id` (no avatar URI, no profile), so the wire payload is small.

### Rationale
- **Frontend-only**: no backend change required, ships with this branch.
- **Cheap**: each user object is one UUID; even a community of 10,000 fits comfortably in a single response.
- **Cached**: Apollo caches the result keyed on `spaceId`, so the dialog opening pre-warms the count.

### Alternatives considered
| Alternative | Rejected because |
|---|---|
| Add `RoleSet.memberCount: Int!` to the schema | Right long-term fix but requires backend coordination outside this branch. Tracked as a follow-up. |
| Reuse the existing `useRoleSetManager` hook (returns full member list) on every page load | Over-fetches: returns full profiles + avatar URIs even when only the count is needed for the banner. |
| Compute the count inside the existing `useApplicationButtonQuery` | That query is scoped to permissions, not membership. Adding a member count there would mix concerns. |

---

## R2 — Active innovation flow phase

### Question
Per the spec clarification, the L1 page must default to the subspace's currently-active innovation flow phase. How is "current" represented in the schema, and which hook resolves it?

### Investigation
- `src/domain/collaboration/InnovationFlow/graphql/InnovationFlowStates.fragment.graphql` defines the phase shape: `id`, `displayName`, `description`, `sortOrder`, `settings`.
- `src/domain/space/layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboard.graphql` already selects `innovationFlow.currentState { displayName }` for L0.
- `src/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates.ts:12` exposes:
  ```typescript
  const currentInnovationFlowState =
    innovationFlowStates?.find(state => state.id === innovationFlow?.currentState?.id);
  ```

### Decision
The integration hook `useCrdSubspaceFlow(phases)` resolves the active phase id with this priority:

1. URL `?phase=<id>` — when present and matches a known phase id (deep-linkable per FR-011).
2. `space.collaboration.innovationFlow.currentState.id` — when no URL param and the current state matches a known phase.
3. The first phase by `sortOrder` — fallback when no current state is defined.

Switching phases writes the new id back into the URL via `setSearchParams({ phase: id }, { replace: true })`. The data mapper extends the existing `useSubspacePageQuery` selection (or composes a small additional fragment) to include `innovationFlow.currentState.id`.

### Rationale
Mirrors legacy behaviour, supports deep-linking and shareable URLs, and remains pure (no per-user persistence to manage).

---

## R3 — Parent space banner image

### Question
The SubSpace banner inherits the parent's banner image (FR-002). `SubspaceContext` exposes `parentSpaceId` but does not fetch the parent's `about.profile.banner.uri`. How do we get it?

### Investigation
- `src/domain/space/context/SubspaceContext.tsx:26` exposes `parentSpaceId: string | undefined`.
- `useSpaceAboutDetailsQuery({ spaceId, skip: !spaceId })` already exists and returns `about.profile.banner.uri` for any space id. Apollo caches per-id.

### Decision
In `useCrdSubspace`, call `useSpaceAboutDetailsQuery({ variables: { spaceId: parentSpaceId ?? '' }, skip: !parentSpaceId })` and read `data?.lookup.space?.about.profile.banner?.uri`. Fall back to `pickColorFromId(parentSpaceId)` when the parent has no banner image.

### Rationale
- Reuses an existing, schema-stable query.
- Two queries per page is acceptable: the parent query is cached, so navigating between sibling subspaces costs zero additional round-trips after the first.
- Avoids adding a `parentSpace { ... }` field to `useSubspacePageQuery`, which would require a schema change to expose a parent-space selector on the subspace type.

### Alternatives considered
| Alternative | Rejected because |
|---|---|
| Extend `useSubspacePageQuery` with a parent-space selector | Requires either a new schema field or an extra `lookup.space(ID: parentSpaceId)` block in the same operation; the second-query approach is cleaner because Apollo handles dedup. |
| Pass parent data down via a router-level loader | The router doesn't know about the parent until the route resolves; would couple routing and data layers unnecessarily. |

---

## R4 — Members listing pattern (community dialog)

### Question
The community dialog (consumed by both L0 and L1 banners per FR-027) must reuse the same listing pattern as the L0 Community tab. What does that pattern look like and is the component already wrappable in a Dialog?

### Investigation
- `src/crd/components/space/SpaceMembers.tsx` is the L0 component. Props (lines 39–55):
  ```typescript
  type SpaceMembersProps = {
    members: MemberCardData[];
    usersCount?: number;
    organizationsCount?: number;
    title?: string;
    subtitle?: string;
    pageSize?: number;          // default 9
    canInvite?: boolean;
    onInvite?: () => void;
    onMemberClick?: (href: string) => void;
    className?: string;
  };
  ```
- Pagination is **client-side only** (in-memory slice).
- Search input on `name + tagline`, role-filter pills (`all` / `admin` / `lead` / `member` / `organization`), supports overlapping role membership.
- Currently rendered only in `src/main/crdPages/space/tabs/CrdSpaceCommunityPage.tsx` via `useCrdSpaceCommunity()`. Not yet inside a Dialog.

### Decision
Create `src/crd/components/space/SubspaceCommunityDialog.tsx` as a thin Radix `Dialog` shell that takes `open`, `onOpenChange`, `title`, and `children`. The integration connector `CrdSubspaceCommunityDialogConnector` calls `useRoleSetManager(roleSetId)` (same hook the Community tab uses), maps the result to `MemberCardData[]`, and renders `<SubspaceCommunityDialog>{<SpaceMembers members={...} />}</SubspaceCommunityDialog>`. The connector is consumed by both `CrdSpacePageLayout` (L0) and `CrdSubspacePageLayout` (L1).

### Rationale
- Zero new listing logic; full feature parity with the Community tab.
- A single connector keeps the two banner-click handlers DRY.
- The existing `SpaceMembers` component does not need changes — it already accepts `pageSize`, search, and filter props.

---

## R5 — Events / Timeline reuse

### Question
FR-019 says the SubSpace Events Quick Action MUST reuse the existing space-level Events / Timeline component. Where is it and is it scope-able?

### Investigation
- `src/crd/components/space/timeline/TimelineDialog.tsx` is a Dialog/Sheet shell that takes `children` (the actual calendar/list content).
- `src/crd/components/space/timeline/EventsCalendarView.tsx` is the calendar UI from spec 086.
- The TimelineDialog is **not currently mounted on L0** — it was built but not yet wired into `CrdSpacePageLayout`. The Quick Action wiring is thus the first consumer for both L0 and L1.

### Decision
`CrdSubspaceEventsDialogConnector` instantiates `<TimelineDialog open ... title="Events"><EventsCalendarView events={...} /></TimelineDialog>` with events fetched from the existing space-level events hook (scoped via `spaceId = subspaceId`). The same connector pattern is suitable for L0; if L0 needs an Events Quick Action in the future, the connector lives in the right place to be shared.

### Rationale
The shell components from 086 are explicitly designed to be reused — they take data as children — so we only build the data-fetch wrapper here.

---

## R6 — Recent Activity reuse

### Question
FR-020 says the Recent Activity Quick Action MUST reuse the existing home-page activity widget. Is the component scopable to a subspace?

### Investigation
- `src/crd/components/dashboard/ActivityFeed.tsx` is presentation-only and accepts pre-mapped activity items.
- `src/main/crdPages/dashboard/DashboardWithMemberships.tsx:127` shows the data flow: `useLatestContributionsQuery({ filter: { spaceIds, ... } })` → `mapActivityToFeedItems(...)` → `<ActivityFeed activityItems={...} />`.

### Decision
`CrdSubspaceActivityDialogConnector` calls `useLatestContributionsQuery({ variables: { filter: { spaceIDs: [subspaceId] }, limit: 25 } })`, maps the result via `mapActivityToFeedItems` (already exported), and renders the activity feed inside a Dialog. The dialog wrapper is small (Radix `Dialog` + `DialogContent` with the feed inside).

### Rationale
The dashboard component is genuinely stateless and accepts arbitrary scoped data. Reusing it means the SubSpace activity dialog inherits any future improvements to the activity rendering automatically.

---

## R7 — Hallucinated KPI section

### Question
FR-029 says we must remove the dashboard-style KPI section that was previously shown in the community context. Where is it?

### Investigation
- `src/main/crdPages/space/tabs/CrdSpaceCommunityPage.tsx` renders only `SpaceMembers` + `CalloutListConnector`.
- `src/crd/components/space/SpaceMembers.tsx` has no KPI tiles — only counts in a section subtitle and pagination info.
- The "hallucinated KPI" Jeroen described appears in the **prototype** (`prototype/src/app/components/space/...`) but was never ported to CRD.

### Decision
**No removal required.** The KPI section was never shipped in CRD code. Document this as a "negative finding" so the implementer doesn't go hunting for code to delete. The risk this FR mitigates is regressive: the prototype's KPI is a tempting reference, and the FR is a guard against it being copied during the SubSpace port. Treat FR-029 as a **don't-add** rule rather than a **delete-existing** rule.

### Rationale
A negative finding is useful; without it, a future implementer copying from the prototype could re-introduce the KPI block.

---

## R8 — Application / Join CTA reuse

### Question
Does `useApplicationButton` already handle the L1 case (subspace + parent membership prerequisite)?

### Investigation
- `src/domain/access/ApplicationsAndInvitations/useApplicationButton.ts` accepts `{ parentSpaceId, spaceId, loading, onJoin }`.
- The query (`useApplicationButtonQuery`) takes `includeParentSpace: !!parentSpaceId` and conditionally fetches the parent's role-set privileges.
- The returned `applicationButtonProps` includes `canJoinParentCommunity` and `canApplyToParentCommunity` (lines 126–127, 164–165).

### Decision
Use the hook unchanged. `useCrdSubspace` calls:
```typescript
const { applicationButtonProps } = useApplicationButton({
  spaceId: subspaceId,
  parentSpaceId,
  loading: false,
});
```
The result is passed to the existing `SpaceAboutApplyButton` CRD component (already used by L0).

### Rationale
The hook was designed for the parent/child case and already covers every state in FR-023.

---

## R9 — Settings link target

### Question
Where does the settings icon on the SubSpace banner link to?

### Investigation
- `src/main/routing/urlBuilders.ts:19–29` exposes `buildSettingsUrl(entityUrl)` returning `${entityUrl}/settings` for any space-like entity.
- The legacy MUI `SubspacePageLayout` constructs its settings link as `${space.about.profile.url}/settings`.

### Decision
Add a thin alias `buildSubspaceSettingsUrl(subspaceUrl)` to `urlBuilders.ts` that returns `${subspaceUrl}/settings`. The L1 layout passes this to `SubspaceHeader`'s `settingsHref` prop. When L1 settings is migrated in a future spec, the helper's body is the only thing that needs to change.

### Rationale
A named helper documents the intent and gives a single migration point later.

---

## R10 — Where the L0 layout bails out for non-L0 (and why we keep it)

### Verification
The subspace route is **already nested** inside `CrdSpaceRoutes.tsx:95-104`:

```typescript
const SubspaceRoutes = lazyWithGlobalErrorHandler(() => import('@/domain/space/routing/SubspaceRoutes'));
// ...
{/* Subspace routes have their own layout */}
<Route
  path={`/challenges/:${nameOfUrl.subspaceNameId}/*`}
  element={
    <SubspaceContextProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <SubspaceRoutes />
      </Suspense>
    </SubspaceContextProvider>
  }
/>
```

It currently lazy-loads the **legacy MUI** `SubspaceRoutes`. The bailout in `CrdSpacePageLayout.tsx:133-139` exists so that for non-L0 levels the L0 layout returns just the outlet (no L0 banner / tabs / sidebar), letting the legacy or CRD subspace page render its own chrome:

```typescript
if (!isLevelZero) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Outlet context={{ activeTabIndex, totalTabs: tabs.length }} />
    </Suspense>
  );
}
```

### Decision
**Keep the bailout exactly as-is. Swap the lazy import at `CrdSpaceRoutes.tsx:18`** from `SubspaceRoutes` (legacy MUI) to the new `CrdSubspaceRoutes` (this branch). No other route or layout changes are needed.

```typescript
// Before
const SubspaceRoutes = lazyWithGlobalErrorHandler(() => import('@/domain/space/routing/SubspaceRoutes'));
// ...
<SubspaceRoutes />

// After
const CrdSubspaceRoutes = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/subspace/routing/CrdSubspaceRoutes'));
// ...
<CrdSubspaceRoutes />
```

`CrdSubspaceRoutes` mounts `CrdSubspacePageLayout` as the route element for the default path and `/about`, and delegates `/settings/*` (and any other un-migrated subroute) to the legacy MUI `SubspaceRoutes` via a fall-through child route. This preserves currently-working subspace functionality (settings, calendar, etc.) while shipping the new CRD home + about.

### Rationale
The bailout is **load-bearing**: without it, the L0 banner/tabs would wrap the L1 page (showing the L0 chrome above the L1 chrome). The route nesting and `SubspaceContextProvider` wrap are already in place. The minimal change is the import swap.

### Initial misunderstanding (corrected)
An earlier draft of this research said "delete the bailout AND add the nested route". Inspection of `CrdSpaceRoutes.tsx` confirmed the route is already nested and the bailout's purpose is to prevent layout double-wrapping. The corrected decision above reflects what the file actually does today.

---

## Summary

| ID | Area | Decision | Status |
|----|------|----------|--------|
| R1 | Member count | New GraphQL doc, `roleSet.usersInRole(role: MEMBER) { id }`, count in mapper | Resolved |
| R2 | Active phase | URL → currentState → first; `useCrdSubspaceFlow` hook | Resolved |
| R3 | Parent banner | Reuse `useSpaceAboutDetailsQuery({ spaceId: parentSpaceId })` | Resolved |
| R4 | Members listing | New `SubspaceCommunityDialog` shell wrapping existing `SpaceMembers`; shared connector | Resolved |
| R5 | Events reuse | Reuse `TimelineDialog` + `EventsCalendarView` from spec 086 | Resolved |
| R6 | Activity reuse | Reuse `ActivityFeed` + scoped `useLatestContributionsQuery` | Resolved |
| R7 | KPI removal | None needed; FR-029 is a "don't add" guard | Resolved |
| R8 | Apply / Join | `useApplicationButton({ spaceId, parentSpaceId })` unchanged | Resolved |
| R9 | Settings link | New `buildSubspaceSettingsUrl` helper; legacy URL | Resolved |
| R10 | L0 bailout | Keep the bailout as-is; swap the lazy import at `CrdSpaceRoutes.tsx:18` from `SubspaceRoutes` (legacy) to `CrdSubspaceRoutes` (new) | Resolved |

All Phase 0 unknowns are resolved. No `[NEEDS CLARIFICATION]` markers remain in the plan.
