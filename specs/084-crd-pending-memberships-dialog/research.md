# Research: CRD Pending Memberships Dialog

**Feature**: 084-crd-pending-memberships-dialog
**Date**: 2026-04-08

## R1: Dialog Component Pattern

**Decision**: Use the same dialog composition pattern as `TipsAndTricksDialog` and `MembershipsTreeDialog` — CRD `Dialog` primitive from `src/crd/primitives/dialog.tsx` wrapping domain-specific content.

**Rationale**: This pattern is already established in 041 and works well with Radix UI's built-in accessibility (focus trap, Escape dismiss, overlay). All 3 existing CRD dashboard dialogs follow it.

**Alternatives considered**:
- Custom modal infrastructure → Rejected: unnecessary when Radix Dialog provides everything needed
- Reusing MUI `DialogWithGrid` → Rejected: violates CRD zero-MUI rule

## R2: Per-Item Hydration via Wrapper Components

**Decision**: Hydration hooks (`useInvitationHydrator`, `useApplicationHydrator`) run inside small wrapper components in the integration layer. Each wrapper renders one CRD card with mapped data.

**Rationale**: These hooks make individual GraphQL queries per item. React hooks must be called at the component level (not in loops). The MUI version uses the same pattern (`HydratedInvitationCard`, `HydratedApplicationCard`). Migrating to a single bulk query would change the data layer (out of scope).

**Alternatives considered**:
- Bulk query that returns all hydrated data → Rejected: would require GraphQL changes (out of scope, FR-013)
- Passing raw GraphQL data to CRD components → Rejected: violates CRD no-GraphQL-types rule

## R3: Slot Props for MUI-Dependent Content

**Decision**: The `InvitationDetailDialog` CRD component accepts `descriptionSlot`, `welcomeMessageSlot`, and `guidelinesSlot` as `ReactNode` props. The integration layer renders MUI components (`WrapperMarkdown`, `DetailedActivityDescription`) into these slots.

**Rationale**: `WrapperMarkdown` uses MUI internally. Creating a CRD markdown renderer is out of scope. Slot props keep the CRD component clean (zero MUI imports) while supporting markdown content.

**Alternatives considered**:
- Plain text strings instead of slots → Rejected: loses markdown formatting (welcome messages use markdown)
- CRD-native markdown component → Rejected: out of scope for this feature
- Rendering markdown in data mapper → Not possible: React components can't be returned from mappers

## R4: Children Pattern for List Dialog

**Decision**: `PendingMembershipsListDialog` accepts `children: ReactNode` instead of typed data arrays.

**Rationale**: Per-item hydration (R2) means each card is rendered by a wrapper component in the integration layer. The dialog shell doesn't know the data types — it provides layout, loading/empty states, and the dialog frame. The integration layer renders `PendingMembershipsSection` components as children.

**Alternatives considered**:
- Typed data arrays + render props → Rejected: doesn't work with per-item hydration hooks
- Section-based named slots → More complex with no benefit over children

## R5: Separator Primitive Porting

**Decision**: Port `Separator` from `prototype/src/app/components/ui/separator.tsx` to `src/crd/primitives/separator.tsx`.

**Rationale**: Needed for visual separation between dialog sections. Uses `@radix-ui/react-separator` which is already a project dependency.

**Alternatives considered**:
- Tailwind `border-t` divider → Less semantic; Radix Separator handles `role="separator"` and orientation
- Skip separator entirely → Visually worse for multi-section dialog

## R6: Mobile Responsive Dialog

**Decision**: Dialog uses `max-h-[85vh]` with scrollable body on all screen sizes. Footer buttons stack vertically on mobile (`flex-col-reverse sm:flex-row`). Detail view layout stacks vertically on mobile.

**Rationale**: Matches prototype patterns (CreateSpaceDialog uses `h-[80vh] md:h-auto`). The existing CRD `DialogContent` already handles `max-w-[calc(100%-2rem)]` for horizontal sizing on mobile.

**Alternatives considered**:
- Full-screen sheet on mobile → Overengineered for a dialog with limited content
- Same layout on all sizes → Poor UX on small screens

## R7: Reusing Existing Dashboard i18n Namespace

**Decision**: Add `pendingMemberships.*` keys to the existing `crd-dashboard` namespace. No new namespace.

**Rationale**: The `crd-dashboard` namespace already exists and contains related keys (`invitations.*`, `dialogs.*`). Adding a sub-section keeps translations co-located with the dashboard feature.

**Alternatives considered**:
- New `crd-pendingMemberships` namespace → Unnecessary complexity; the dialog is part of the dashboard feature
- Adding to `crd-layout` namespace → Wrong scope; this is dashboard-specific, not layout

## R8: Prototype Sender Information

**Decision**: The prototype's `InvitationsDialog` shows sender avatar and sender name per invitation. The existing `useInvitationHydrator` hook already fetches `userDisplayName` for the invitation creator. We use the sender name in card descriptions but not a sender avatar (not available from the hydrator without additional queries).

**Rationale**: The user specified "stick to the data and design we already have in the pending memberships components." The hydrator provides sender display name but not avatar URL. Adding a sender avatar query is out of scope.

**Alternatives considered**:
- Add sender avatar fetching → Rejected: out of scope, would require new GraphQL queries
- Show sender initials without avatar → Could work but the MUI version doesn't show sender avatars in the card either; stick to existing behavior
