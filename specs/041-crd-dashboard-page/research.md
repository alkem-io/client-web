# Research: CRD Dashboard Page Migration

**Branch**: `041-crd-dashboard-page` | **Date**: 2026-04-03

## R1: Primitive Availability — Switch and ScrollArea

**Decision**: Port both `switch.tsx` and `scroll-area.tsx` from prototype.

**Rationale**: The prototype already has both components at `prototype/src/app/components/ui/switch.tsx` and `prototype/src/app/components/ui/scroll-area.tsx`. These are standard shadcn/ui primitives built on Radix UI (`@radix-ui/react-switch`, `@radix-ui/react-scroll-area`). Radix UI packages are already in the dependency tree from existing CRD primitives.

**Alternatives considered**: Building custom Toggle/ScrollArea from scratch — rejected; shadcn/ui primitives are well-tested and accessibility-compliant out of the box.

## R2: Compact Space Card vs Full SpaceCard Variant

**Decision**: Create a separate `CompactSpaceCard` component instead of adding a `variant` prop to the existing `SpaceCard`.

**Rationale**: The full `SpaceCard` (from SpaceExplorer) renders: banner, name, description, tags, leads (with StackedAvatars), privacy/member badges, and parent space indicator (~180 lines). The dashboard's compact card only needs: banner, name, lock icon, and optional home pin indicator (~40 lines). These are structurally different components with different prop interfaces. Adding a variant would:
- Bloat the full card's interface with dashboard-specific props (home pin)
- Create conditional rendering that obscures each variant's structure
- Violate ISP — consumers would depend on unused props

**Alternatives considered**: (A) `SpaceCard variant="compact"` — rejected per rationale above. (B) Reusing the prototype's `RecentSpaces` card directly — rejected; it uses react-slick carousel and mock data.

## R3: Activity Feed Architecture

**Decision**: Single `ActivityFeed` CRD component with `variant` prop, two separate data hooks in integration layer.

**Rationale**: The "Latest Activity in my Spaces" and "My Latest Activity" feeds share identical UI structure: title, filter dropdowns, scrollable list, "Show more" link. The only difference is that the space activity feed has a Role filter. A `variant` prop (`'spaces' | 'personal'`) controls this. In the integration layer, they use different GraphQL hooks (`useLatestContributionsQuery` for space activity, `useLatestContributionsGroupedQuery` for personal) but both map to the same `ActivityItemData` type.

**Alternatives considered**: Two separate feed components (`SpaceActivityFeed`, `PersonalActivityFeed`) — rejected; >80% code duplication.

## R4: Sidebar Resource Sections — Unified vs Type-Specific

**Decision**: Single `SidebarResourceItem` component for all 4 resource types.

**Rationale**: All sidebar resource items (spaces, VCs, innovation hubs, innovation packs) have identical UI: avatar (image or initials) + name + link. The section headers differentiate them. A type-specific component per resource type would duplicate the same ~20 lines of JSX. The `SidebarResourceItem` has a minimal interface: `{ name: string; href: string; avatarUrl?: string; initials: string; avatarColor?: string }`.

**Alternatives considered**: Separate `SidebarSpaceItem`, `SidebarVCItem`, `SidebarHubItem`, `SidebarPackItem` — rejected per DRY.

## R5: DashboardSpaces View (No Prototype Reference)

**Decision**: Build `DashboardSpaces` and `SpaceHierarchyCard` following CRD card patterns from `SpaceCard.tsx`.

**Rationale**: The prototype only shows the activity view. The MUI `DashboardSpaces` component renders parent space cards with banner images and lists of subspace cards beneath them. The CRD version will follow the card visual patterns established by the existing `SpaceCard.tsx` (rounded corners, banner image, Tailwind utility classes) but with a hierarchical layout: parent card with full banner and tagline, followed by inline chips or compact links for subspaces. The data comes from `useDashboardWithMembershipsLazyQuery` (existing hook).

**Alternatives considered**: (A) Deprecate the spaces view and force activity-only — rejected by user decision (keep both views). (B) Reuse the full `SpaceCard` component — rejected; parent cards in this view need a different layout with subspace nesting.

## R6: Dialog Reuse Pattern

**Decision**: Dashboard dialogs compose the existing CRD `Dialog` primitive with dashboard-specific content components.

**Rationale**: The CRD `dialog.tsx` primitive (already ported in 039) provides Radix UI Dialog with focus trapping, Escape dismissal, and overlay. Dashboard dialogs are thin wrappers:
- `TipsAndTricksDialog` — Dialog + list of items from i18n
- `ActivityDialog` — Dialog + ActivityFeed component (with full data)
- `MembershipsTreeDialog` — Dialog + recursive tree component

This avoids building custom modal infrastructure and reuses accessibility features from Radix UI Dialog.

**Alternatives considered**: Custom sheet/drawer component — rejected; Dialog primitive already handles this pattern well.

## R7: Global Dialog Integration Pattern

**Decision**: CRD components receive callback props for global dialogs (PendingMemberships, VC Wizard). Integration layer wires callbacks to existing context providers.

**Rationale**: This is the same pattern used by `CrdLayoutWrapper` for the Header's `onPendingMembershipsClick`. The CRD sidebar and campaign banner call `onClick` props. The integration layer connects these to `usePendingMembershipsDialog()`, `useVirtualContributorWizard()`, etc. CRD components never know about MUI dialogs.

**Alternatives considered**: Passing context providers into CRD — rejected; breaks the "no business logic in CRD" rule.

## R8: URL Parameter Dialog Handling

**Decision**: Integration layer hook `useDashboardDialogs.ts` reads `?dialog=invitations` on mount and triggers the corresponding callback.

**Rationale**: The existing MUI `useMyDashboardDialogs()` hook reads URL search params to auto-open dialogs. The CRD version follows the same pattern: read params on mount, call the appropriate dialog callback. URL params are an app-level concern — they don't leak into CRD components.

**Alternatives considered**: Handling URL params inside CRD components — rejected; breaks the "no routing" rule.
