# Feature Specification: CRD Pending Memberships Dialog

**Feature Branch**: `084-crd-pending-memberships-dialog`
**Created**: 2026-04-07
**Status**: Draft
**Input**: Migrate the PendingMembershipsDialog from MUI to the CRD design system. Create CRD presentational components for the list view and detail view, with an integration wrapper reusing existing business logic hooks.

## User Scenarios & Testing

### User Story 1 - View Pending Invitations List (Priority: P1)

An authenticated user opens the Pending Memberships dialog to see all their pending space invitations and applications in one place. The dialog shows three sections: regular invitations, virtual contributor invitations, and open applications. Each invitation displays the space name, sender name, a welcome message excerpt, and the time elapsed since the invitation was sent.

**Why this priority**: This is the core functionality - without the list view, users cannot see or act on any pending memberships. It is the entry point for all subsequent actions.

**Independent Test**: Open the CRD dashboard, click "Invitations" in the sidebar. The dialog opens with sections for invitations, VC invitations, and applications. Each item is rendered as a card with the expected information. Clicking an invitation card navigates to the detail view.

**Acceptance Scenarios**:

1. **Given** an authenticated user with pending invitations and applications, **When** the user clicks "Invitations" in the dashboard sidebar, **Then** the Pending Memberships dialog opens showing separate sections for regular invitations, virtual contributor invitations, and open applications
2. **Given** an authenticated user with no pending invitations or applications, **When** the user opens the Pending Memberships dialog, **Then** an empty state message is displayed
3. **Given** the dialog is loading data, **When** the user opens the dialog, **Then** skeleton loading placeholders are shown until data arrives
4. **Given** an authenticated user has pending invitations, **When** the user clicks an invitation card, **Then** the dialog transitions to the invitation detail view for that specific invitation
5. **Given** an authenticated user has pending applications, **When** the user clicks an application card, **Then** the dialog closes and the user is navigated to the corresponding space

---

### User Story 2 - View and Act on Invitation Details (Priority: P1)

When a user clicks on an invitation card in the list, a detail view opens showing the full invitation information: space card (avatar, name, tagline, tags), invitation description (who invited, when), welcome message, and community guidelines. The user can accept or decline the invitation from this view.

**Why this priority**: Accepting or declining invitations is the primary action users need to take. Without the detail view, users cannot review invitation details or act on them.

**Independent Test**: Open the Pending Memberships dialog, click an invitation card. The detail dialog shows the space card, invitation description, welcome message, and community guidelines. Accept and decline buttons are present and functional.

**Acceptance Scenarios**:

1. **Given** the user is viewing an invitation detail, **When** the user clicks "Accept" (or "Join" for regular invitations), **Then** the invitation is accepted, the dialog closes, and the user is navigated to the space
2. **Given** the user is viewing an invitation detail, **When** the user clicks "Decline", **Then** the invitation is declined and the dialog returns to the list view with updated data
3. **Given** the user is viewing an invitation detail, **When** the user clicks the back button, **Then** the dialog returns to the list view without any changes
4. **Given** the user is accepting an invitation, **When** the mutation is in progress, **Then** the accept button shows a loading state and the decline button is disabled
5. **Given** the user is viewing a virtual contributor invitation, **When** the detail view opens, **Then** the title indicates it is a VC invitation and the accept button says "Accept" instead of "Join"
6. **Given** the invitation has a welcome message, **When** the detail view renders, **Then** the welcome message is displayed (with markdown formatting)
7. **Given** the space has community guidelines, **When** the detail view renders, **Then** the community guidelines are displayed below the welcome message

---

### User Story 3 - Open Dialog via URL Parameter (Priority: P2)

The dashboard supports a `?dialog=invitations` URL parameter that automatically opens the Pending Memberships dialog when the page loads. This enables deep linking to the dialog from notifications or external links.

**Why this priority**: Deep linking enhances discoverability and integrates with the notification system, but it is not the primary entry point for most users.

**Independent Test**: Navigate to `/home?dialog=invitations` with CRD enabled. The dashboard loads and the Pending Memberships dialog opens automatically.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they navigate to `/home?dialog=invitations`, **Then** the Pending Memberships dialog opens automatically on page load
2. **Given** an authenticated user with no pending memberships, **When** they navigate to `/home?dialog=invitations`, **Then** the dialog opens with the empty state message

---

### User Story 4 - Dialog Triggered from Header Menu (Priority: P2)

The Pending Memberships dialog can also be triggered from the user menu in the CRD layout header (not only from the dashboard sidebar). The pending invitations count badge in the header reflects the current count.

**Why this priority**: The header trigger provides access to the dialog from any CRD page, not just the dashboard. The existing `CrdLayoutWrapper` already renders the dialog at the layout level.

**Independent Test**: From any CRD page, click the invitations button in the header. The dialog opens with the pending memberships list.

**Acceptance Scenarios**:

1. **Given** an authenticated user on any CRD page, **When** the user clicks the invitations trigger in the header, **Then** the Pending Memberships dialog opens
2. **Given** an authenticated user with pending invitations, **When** the header loads, **Then** the invitations badge displays the correct pending count

---

### Edge Cases

- What happens when the user accepts an invitation but the mutation fails? The button returns to its normal state, the invitation remains in the list, and an error is surfaced.
- What happens when the user has invitations but loses network connectivity while the dialog is open? Previously loaded data remains visible; new mutations will fail gracefully.
- What happens when a pending invitation is accepted/declined by the inviter (external change) while the dialog is open? The data is refreshed when the user returns to the list view (existing refetch behavior).
- What happens when the invitation creator no longer exists on the platform? The sender name falls back to a platform-provided default string.

## Requirements

### Functional Requirements

- **FR-001**: The Pending Memberships dialog MUST be implemented using CRD design system components (shadcn/ui + Tailwind), with zero imports from MUI or Emotion in presentational components
- **FR-002**: The dialog MUST display three sections in the list view: regular invitations, virtual contributor invitations, and open applications -- each section hidden when its list is empty
- **FR-003**: Each invitation card in the list MUST display: space avatar, space name, sender name, welcome message excerpt (truncated), and time elapsed
- **FR-004**: Each application card in the list MUST display: space avatar, space name, tagline, and be clickable to navigate to the space
- **FR-005**: The dialog MUST show a loading skeleton state while data is being fetched
- **FR-006**: The dialog MUST show an empty state message when no invitations or applications exist
- **FR-007**: The invitation detail view MUST display: space card (avatar, name, tagline, tags), invitation description, welcome message (with markdown), and community guidelines (when available)
- **FR-008**: The detail view MUST provide Accept and Decline action buttons with loading/disabled states during mutations
- **FR-009**: The Accept button label MUST differ based on invitation type: "Join" for regular invitations, "Accept" for virtual contributor invitations
- **FR-010**: After accepting an invitation, the system MUST navigate the user to the space and close the dialog (for regular invitations) or return to the list view (for VC invitations without a space URL)
- **FR-011**: After declining an invitation, the system MUST return to the list view with updated data
- **FR-012**: The detail view MUST provide a back button to return to the list view
- **FR-013**: The dialog MUST reuse existing business logic hooks: `usePendingMemberships`, `useInvitationHydrator`, `useApplicationHydrator`, `useInvitationActions`, and `PendingMembershipsDialogContext`
- **FR-014**: The dialog MUST be rendered at the layout level (in `CrdLayoutWrapper`) as a lazy-loaded component, replacing the current MUI `PendingMembershipsDialog` import
- **FR-015**: The dialog MUST support being opened via the `?dialog=invitations` URL parameter (existing `useDashboardDialogs` hook)
- **FR-016**: All user-visible strings in CRD presentational components MUST use `useTranslation('crd-dashboard')` -- no hardcoded text
- **FR-017**: Accept and decline buttons MUST have accessible names that include the space name (e.g., `aria-label` with space context)
- **FR-018**: The dialog MUST use semantic HTML: `<section>` for sections, `<ul>/<li>` for lists, `<button>` for clickable cards, `<a>` for navigation links
- **FR-019**: All interactive elements MUST have visible `focus-visible` ring indicators for keyboard navigation
- **FR-020**: Loading states MUST use `role="status"` with appropriate `aria-label` for screen reader announcements

### Responsive / Mobile Design

- **FR-021**: On small screens (below `sm` breakpoint / 640px), the dialog MUST expand to near-fullscreen height (`h-[85vh]` or similar) so content is not cramped inside a small centered box
- **FR-022**: The detail view layout MUST stack vertically on small screens (`flex-col`) and switch to a side-by-side layout on larger screens (`sm:flex-row`)
- **FR-023**: Dialog footer buttons MUST stack vertically on small screens (`flex-col-reverse`) and display inline on larger screens (`sm:flex-row`), following the shadcn/ui `DialogFooter` convention
- **FR-024**: The dialog close button (`aria-label` from i18n) MUST remain reachable on all screen sizes
- **FR-025**: Touch targets for invitation and application cards MUST be at least 44x44 CSS pixels to meet WCAG 2.5.8

### Accessibility (WCAG 2.1 AA)

- **FR-026**: The dialog MUST trap focus while open and return focus to the trigger element on close (provided by Radix UI Dialog primitive)
- **FR-027**: The dialog MUST be dismissible via the Escape key (provided by Radix UI Dialog primitive)
- **FR-028**: Invitation and application card lists MUST use `<ul role="list">` with `<li>` items so screen readers announce list length
- **FR-029**: The back button in the detail view MUST have an accessible label (e.g., `aria-label` from i18n: "Back to list")
- **FR-030**: Color MUST NOT be the sole indicator of card state or action type; icons (Check, X) accompany Accept/Decline buttons
- **FR-031**: All text MUST meet a 4.5:1 contrast ratio against its background (3:1 for large text)

### Primitives & Reusability

- **FR-032**: The `Separator` primitive MUST be ported from the prototype (`prototype/src/app/components/ui/separator.tsx`) to `src/crd/primitives/separator.tsx` before use in dialog sections
- **FR-033**: All new CRD presentational components MUST be usable in the standalone CRD preview app (`src/crd/app/`) with mock data, ensuring they are truly decoupled from the main application

### Key Entities

- **PendingInvitation**: A space membership invitation with sender, space, role, welcome message, creation date, and actor type (regular or virtual contributor)
- **PendingApplication**: A user's pending application to join a space, with space details and application date
- **InvitationWithMeta**: An enriched invitation that includes hydrated space details (profile, banner, tagline, tags) and the sender's display name
- **ApplicationWithMeta**: An enriched application that includes hydrated space details

## Success Criteria

### Measurable Outcomes

- **SC-001**: The CRD Pending Memberships dialog renders identically in functionality to the MUI version -- all sections, actions, and states are present and working
- **SC-002**: Zero MUI or Emotion imports exist in the new CRD presentational component files
- **SC-003**: All existing acceptance scenarios for the MUI dialog (accept, decline, navigation, URL parameter) pass with the CRD replacement
- **SC-004**: The dialog opens within the same perceived latency as the MUI version (lazy loaded, data fetched on open)
- **SC-005**: All interactive elements are keyboard-navigable and screen-reader-accessible (WCAG 2.1 AA)
- **SC-006**: Translations are provided in all 6 supported languages (en, nl, es, bg, de, fr)
- **SC-007**: The project passes `pnpm lint` and `pnpm vitest run` with no regressions after the change
- **SC-008**: On a 375px-wide viewport (iPhone SE), the dialog is usable without horizontal scrolling and all cards/buttons are tappable
- **SC-009**: New CRD presentational components render correctly in the standalone CRD preview app (`pnpm crd:dev`) with mock data

## Assumptions

- The existing `PendingMembershipsDialogContext`, all GraphQL queries/mutations, and all business logic hooks are reused as-is with no modifications
- MUI-dependent components (`WrapperMarkdown`, `DetailedActivityDescription`) will be rendered by the integration layer and passed to CRD components as ReactNode slot props -- this is an accepted temporary compromise
- The prototype's `InvitationsDialog.tsx` design is the primary visual reference for the list view; the detail view follows the same CRD styling patterns but preserves the layout structure of the MUI `InvitationDialog`
- The `crd-dashboard` i18n namespace already exists and will be extended with new keys under `pendingMemberships.*`
- The old MUI `PendingMembershipsDialog` in `src/domain/community/pendingMembership/` remains unchanged and continues to be used by the non-CRD layout

## Scope Boundaries

### In Scope

- Porting the `Separator` primitive from the prototype to `src/crd/primitives/separator.tsx`
- New CRD presentational components for the list dialog, detail dialog, invitation card, application card, and section helper
- Integration wrapper component that connects CRD components to existing hooks
- Data mappers from hydrated domain types to CRD prop types
- i18n translations in all 6 languages under the `crd-dashboard` namespace (`pendingMemberships.*` keys)
- Swapping the dialog import in `CrdLayoutWrapper.tsx`
- Mobile-responsive dialog layout (near-fullscreen on small screens, stacked layout)

### Out of Scope

- Modifications to existing business logic hooks, GraphQL queries, or mutations
- Modifications to the `PendingMembershipsDialogContext`
- A CRD-native markdown renderer (MUI `WrapperMarkdown` is reused via slot props)
- A CRD-native `DetailedActivityDescription` component (reused via slot props)
- Changes to the MUI `PendingMembershipsDialog` (it remains for the non-CRD layout)
- Changes to the dashboard sidebar, header, or any other components
