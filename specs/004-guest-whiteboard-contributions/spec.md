# Feature Specification: Guest Whiteboard Contributions Toggle

**Feature Branch**: `004-guest-whiteboard-contributions`
**Created**: 2025-10-31
**Status**: Draft
**Input**: User description: "I want to add an admin space settings toggle for guest (public) contributions in the alkemio/client-web repo. The toggle should be available in the (sub)space settings panel. It should say 'Allow admins and whiteboard creators to share whiteboards publicly.' If turned ON, the text should also say 'Turning this off will make all whiteboards in this space unreachable by guests. URL will be disabled.' By default, guest contributions are disabled ('off/closed'). When admin setting toggle is enabled, admins and owners of whiteboards in the (sub)space can click a checkbox in each whiteboard's Share dialog which allows them to see and copy a URL which is to serve only a whiteboard and nothing else which allows contributions from both guests and authenticated users. Once the checkbox is on, members of the space can see and copy the shareable link which allows external users to contribute to the whiteboard. When admin setting toggle is disabled, guest contributions are blocked and the public callout page returns 404 to indicate contributions are closed to guests. Also when disabled, the creators of each whiteboard and the admins of the (sub)space cannot see the checkbox. Only admins can change this toggle, and its setting applies across all whiteboards in the (sub)space they are a direct part of. No inheritance between spaces and their subspace of this setting. Admins should see a clear, accessible toggle control in the settings UI. The status of guest contributions (enabled/disabled) should be shown on the space callout page for each whiteboard. The toggle must have immediate effect, updating permissions and messaging."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Admin Enables Guest Contributions at Space Level (Priority: P1)

As a **space admin**, I want to enable guest contributions for whiteboards in my space so that I can control whether whiteboard creators can share their content publicly. Admins will be able to share all whiteboards publicly.

**Why this priority**: This is the foundational capability that unlocks all subsequent functionality. Without the admin-level toggle, no public sharing is possible.

**Independent Test**: Can be fully tested by navigating to space settings, toggling the setting on/off, and verifying the toggle state persists and is reflected in the UI with appropriate warning messages. The toggle will persist in the db, controlled and returned by the server.

**Acceptance Scenarios**:

1. **Given** I am an admin of a space, **When** I navigate to Space Settings → Allowed Actions section, **Then** I see a toggle labeled "Allow admins and whiteboard creators to share whiteboards publicly"
2. **Given** the guest contributions toggle is OFF (default), **When** I turn it ON, **Then** I see additional text: "Turning this off will make all whiteboards in this space unreachable by guests. Created URLs will be disabled."
3. **Given** I have changed the toggle state, **Then** the toggle state is persisted correctly
4. **Given** I am a member (non-admin) of a space, all is as is it is now - I **Cannot** access space settings.

---

### User Story 2 - Whiteboard Creator Shares Publicly (When Enabled) (Priority: P2)

As a **whiteboard creator or admin**, I want to share my whiteboard publicly when guest contributions are enabled at the space level, so that external users can view and contribute to it.

**Why this priority**: This delivers the core user-facing value once the admin has enabled the capability. It's the primary use case for enabling guest contributions.

**Independent Test**: Can be tested by creating a whiteboard in a space where guest contributions are enabled, opening the Share dialog, enabling public sharing, and verifying the shareable URL is displayed and copyable.

**Acceptance Scenarios**:

1. **Given** guest contributions are enabled at space level AND I am a whiteboard owner/creator, **When** I open the whiteboard's Share dialog, **Then** I see a checkbox labeled "Allow public contributions"
2. **Given** the "Allow public contributions" checkbox is unchecked, **When** I check it, **Then** a shareable public URL is generated and displayed. I cannot edit it in any way, nor anyone else.
3. **Given** a public URL is displayed, **When** I click the copy button, **Then** the URL is copied to my clipboard
4. **Given** I am a space member (not whiteboard creator, not admin), **When** public sharing is enabled for a whiteboard, **Then** I can see and copy the shareable public URL from a button named "Share with guests". I do not see the URL anywhere until I paste it myself.
5. **Given** guest contributions are enabled at space level BUT I am not the whiteboard creator or admin, **When** I open a whiteboard's Share dialog, **Then** I do NOT see the "Allow public contributions" checkbox (authorization check)

---

### User Story 3 - Guest Contributions Disabled State (Priority: P2)

As a **space admin**, when I disable guest contributions, I want all public whiteboard URLs to become inaccessible and the sharing controls to be hidden, so that I maintain control over public access.

**Why this priority**: This is critical for security and privacy. Admins must be able to revoke public access globally and immediately.

**Independent Test**: Can be tested by disabling the space-level toggle and verifying that: (1) Share dialog checkboxes disappear, (2) previously public URLs return 404, (3) UI reflects the disabled state. It is as if this setting does not even exist and never has.

**Acceptance Scenarios**:

1. **Given** guest contributions are enabled with some whiteboards shared publicly, **When** I (admin) turn OFF the space-level toggle, **Then** all whiteboard Share dialogs no longer show the "Allow public contributions" checkbox to whiteboard creators and admins, and they do no longer show button "Share with guests" to all members.
2. **Given** a whiteboard was previously shared publicly and guest contributions are now disabled, **When** a guest accesses the public URL, **Then** they receive a 404 error as if the page was never there. This is verified by the server once it checks whether this whiteboard has allowed public access or not.
3. **Given** guest contributions are disabled at space level, **When** a whiteboard creator opens the Share dialog, **Then** they do NOT see the public sharing checkbox at all

---

### User Story 4 - No Inheritance Between Spaces and Subspaces (Priority: P3)

As a **subspace admin**, I want the guest contributions setting to be independent from my parent space, so that I have full control over sharing in my subspace regardless of parent space settings.

**Why this priority**: This ensures governance flexibility and prevents unintended inheritance that could create security risks or confusion.

**Independent Test**: Can be tested by creating a space and subspace, setting different toggle states for each, and verifying that the subspace setting does not inherit from the parent.

**Acceptance Scenarios**:

1. **Given** a parent space has guest contributions ENABLED, **When** I create or navigate to a subspace, **Then** the subspace guest contributions toggle is OFF by default (no inheritance)
2. **Given** a parent space has guest contributions DISABLED and a subspace has it ENABLED, **When** I create a whiteboard in the subspace and share it publicly, **Then** the public URL works (subspace setting is independent)
3. **Given** I am an admin of both a space and its subspace, **When** I change the guest contributions setting in one, **Then** the other's setting remains unchanged

---

### User Story 5 - Visibility Status Indicators on Callout Pages (Priority: P3)

As a **space admin or member**, I want to see the status of guest contributions on whiteboard callout pages, so that I understand whether public sharing is available.

**Why this priority**: Provides transparency and helps users understand why they may or may not see public sharing options. Nice-to-have for clarity but not blocking for core functionality.

**Independent Test**: Can be tested by viewing whiteboard callout pages in spaces with different guest contribution settings and verifying status indicator for availability is displayed correctly.

**Acceptance Scenarios**:

1. **Given** guest contributions are DISABLED at space level, **When** I view a whiteboard callout page, **Then** I do not see any status indication anywhere
2. **Given** guest contributions are ENABLED at space level, **When** I view a whiteboard callout page, **Then** I see a status indicator: "Guest contributions enabled" (or no negative message)
3. **Given** I am viewing a whiteboard callout page, **When** I am NOT an admin, **Then** the status indicator is informational only (no action items for non-admins)

---

### User Story 6 - Guest Contributions Warning in Whiteboard Dialog (Priority: P2)

As a **whiteboard owner, admin, or space member**, when I open a whiteboard that allows guest contributions, I want to see a clear visual warning indicator, so that I am aware the whiteboard is publicly accessible.

**Why this priority**: Critical for transparency and security awareness. Users must know when their whiteboard content is visible to unauthenticated guests.

**Independent Test**: Can be tested by opening a whiteboard with `guestContributionsAllowed: true` and verifying the warning badge appears in the dialog footer with correct styling and translated text.

**Acceptance Scenarios**:

1. **Given** I open a whiteboard with `guestContributionsAllowed: true`, **When** the whiteboard dialog is displayed, **Then** I see a warning badge in the footer with red border, Public icon, and text "This whiteboard is visible to guest users"
2. **Given** I open a whiteboard with `guestContributionsAllowed: false` or undefined, **When** the whiteboard dialog is displayed, **Then** I do NOT see the guest contributions warning badge
3. **Given** the warning badge is displayed, **Then** it uses the error color from the theme (`theme.palette.error.main`) for border and text
4. **Given** the warning badge is displayed, **Then** it is positioned on the right side of the dialog footer, space-between layout with other footer controls on the left
5. **Given** the warning text is displayed, **Then** it is translated using the i18next key `pages.whiteboard.guestContributionsWarning`

---

### Edge Cases

- **What happens when guest contributions are toggled OFF while guests are actively collaborating?**
  - System should immediately revoke access; active guest sessions should be terminated or switched to read-only mode, then disconnected.

- **How does the system handle whiteboards shared publicly before the space-level toggle existed?**
  - All existing whiteboards should default to NOT publicly shared.

- **What if a user is both a member of a parent space and a subspace with different settings?**
  - Each space's setting applies only to whiteboards directly within that space; no cross-contamination.

- **What permissions are required to see the public URL once sharing is enabled?**
  - Minimum: space member; specifics TBD during planning (may require READ privilege on whiteboard).

- **What happens if the GraphQL schema doesn't support the new field yet?**
  - Frontend should gracefully handle missing field by defaulting to `false` (disabled) and logging a warning.

- **What happens if multiple spaces with different settings contain similar whiteboard names?**
  - Each space's setting applies only to whiteboards directly within that space; no cross-contamination or naming conflicts.

## Clarifications

### Session 2025-10-31

- Q: When a whiteboard is shared publicly (checkbox enabled), where should the `publicSharingEnabled` state be persisted? → A: Whiteboard entity persistence (deferred to future work)
- Q: When the admin toggles `allowGuestContributions`, what immediate user feedback should be shown? → A: Display toast notification only
- Q: When the `UpdateSpaceSettings` mutation fails due to network error, what should happen? → A: Revert optimistic update, error message
- Q: What is the maximum expected scale for testing the toggle functionality? → A: Space with 50-100 whiteboards (typical use case)

## Requirements _(mandatory)_

### Constitution Alignment

This feature satisfies the Constitution as follows:

**I. Domain-Driven Frontend Boundaries**

- New domain logic resides in `src/domain/spaceAdmin` (space settings management) and `src/domain/collaboration` (whiteboard sharing).
- A façade in `src/domain/space/settings` will expose a typed hook (e.g., `useSpaceGuestContributions(spaceId)`) consumed by UI components in `src/main` and `src/domain/spaceAdmin/SpaceAdminSettings`.
- UI components remain orchestration-only; no business logic in React components.

**II. React 19 Concurrent UX Discipline**

- Settings toggle updates use `useTransition` to avoid blocking paint during mutation.
- Optimistic updates via `useOptimistic` may be applied for immediate UI feedback before server confirmation.
- No deprecated lifecycle methods; all components are function-based with hooks.

**III. GraphQL Contract Fidelity**

- GraphQL schema update required: add `allowGuestContributions: Boolean!` to `SpaceSettingsCollaboration` type.
- Fragments to update: `SpaceSettings.graphql` (add field), `UpdateSpaceSettings.graphql` (add input field).
- Generated hooks via `pnpm run codegen`: `useSpaceSettingsQuery`, `useUpdateSpaceSettingsMutation`.
- Schema diff must be reviewed in PR.
- UI components will NOT export generated GraphQL types directly; props are explicitly declared.

**IV. State & Side-Effect Isolation**

- State lives in Apollo cache (normalized by space ID).
- Side effects (mutation, notifications) handled via Apollo hooks and `useNotification` adapter in `src/core/ui/notifications`.
- No direct DOM manipulation; all UI updates via React state/props.

**V. Experience Quality & Safeguards**

- **Accessibility**: Toggle follows WCAG 2.1 AA (keyboard navigation, ARIA labels, semantic HTML).
- **Performance**: No regression expected; mutation is lightweight. Measure with Lighthouse pre/post.
- **Testing**: Unit tests for toggle logic, integration tests for mutation, manual accessibility audit. Test with 10-20 whiteboards per space for typical scale validation.
- **Observability**: Toast notifications for user feedback on toggle state changes. No analytics logging required.

### Functional Requirements

- **FR-001**: System MUST add a boolean field `allowGuestContributions` to the `SpaceSettingsCollaboration` GraphQL type, defaulting to `false`.
- **FR-002**: System MUST display a toggle control in the Space Settings → Allowed Actions section for admins only (requires `UPDATE` privilege on space settings).
- **FR-003**: Toggle MUST be labeled "Allow admins and whiteboard creators to share whiteboards publicly" with explanatory subtext when enabled.
- **FR-004**: System MUST persist toggle state changes via the `UpdateSpaceSettings` mutation and reflect updates in the Apollo cache immediately. On mutation failure, system MUST revert optimistic update and display error message.
- **FR-005**: System MUST NOT inherit the `allowGuestContributions` setting from parent spaces to subspaces; each space manages its own setting independently.
- **FR-006**: System MUST hide the "Allow public contributions" checkbox in whiteboard Share dialogs when `allowGuestContributions` is `false` at the space level.
- **FR-007**: System MUST display the "Allow public contributions" checkbox in whiteboard Share dialogs when `allowGuestContributions` is `true` AND the user is the whiteboard creator or a space admin.
- **FR-008**: System MUST generate and display a shareable public URL when the "Allow public contributions" checkbox is enabled (implementation of URL generation and public page deferred to future work). Whiteboard sharing state will be persisted at the whiteboard entity level.
- **FR-009**: System MUST allow space members to view and copy the shareable public URL once enabled by the whiteboard creator/admin.
- **FR-010**: System MUST return a 404 or "Contributions closed" message when a guest accesses a public whiteboard URL and `allowGuestContributions` is `false` (implementation deferred to future work).
- **FR-011**: System MUST display a status indicator on whiteboard callout pages showing whether guest contributions are enabled or disabled at the space level.
- **FR-012**: System MUST restrict toggle control to users with `UPDATE` authorization on the space's settings (admin-only).
- **FR-013**: System MUST display toast notification when toggle state changes (e.g., "Guest contributions enabled/disabled").
- **FR-014**: System MUST display a visual warning badge in the whiteboard dialog footer when `guestContributionsAllowed` is `true`, indicating the whiteboard is visible to guest users.
- **FR-015**: Warning badge MUST use error color from theme (`theme.palette.error.main`) for border and text, include a Public icon, and display translated text from `pages.whiteboard.guestContributionsWarning`.
- **FR-016**: Warning badge MUST be positioned on the right side of the dialog footer with space-between layout, while other footer controls (delete button, readonly messages) remain on the left.
- **FR-017**: Warning badge MUST NOT be displayed when `guestContributionsAllowed` is `false` or `undefined`.

### Key Entities

- **SpaceSettingsCollaboration**: Extended to include `allowGuestContributions: Boolean!` field. Represents collaboration settings for a space, including whether guest contributions to whiteboards are permitted.
- **Space**: Context for the setting; each space independently manages its `allowGuestContributions` flag. No inheritance to/from subspaces.
- **Whiteboard**: Extended to include `guestContributionsAllowed: Boolean!` field. When `true`, the whiteboard can be accessed and edited by unauthenticated guest users via a public URL. The whiteboard dialog footer displays a visual warning badge to indicate public visibility.
- **WhiteboardDetails**: TypeScript interface extended with optional `guestContributionsAllowed?: boolean` field to support guest contributions warning display in WhiteboardDialog component.
- **WhiteboardDialogFooter**: React component extended to display conditional warning badge when `guestContributionsAllowed` is `true`. Uses MUI Box, Public icon, error theme colors, and i18next translation.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Space admins can enable/disable the guest contributions toggle in under 10 seconds, with immediate UI feedback (optimistic update).
- **SC-002**: Toggle state persists correctly across page reloads and sessions (verified via Apollo cache and backend query).
- **SC-003**: The toggle control meets WCAG 2.1 AA accessibility standards (keyboard navigation, screen reader support, sufficient color contrast).
- **SC-004**: Mutation to update `allowGuestContributions` completes in under 500ms (p95) with no server errors.
- **SC-005**: 100% of whiteboards in a space respect the space-level setting: Share dialog checkbox visibility matches `allowGuestContributions` state.
- **SC-006**: Documentation and code comments clearly indicate extensibility points for future Share dialog and public URL implementation.
- **SC-007**: Zero inheritance errors: changing a parent space's setting does not affect subspace settings (verified by integration test).
- **SC-008**: Toggle functionality tested with spaces containing 10-20 whiteboards (typical use case) without performance degradation.
- **SC-009**: Guest contributions warning badge is displayed in whiteboard dialog footer when `guestContributionsAllowed: true`, with correct styling (red border, error color, Public icon, translated text).
- **SC-010**: Warning badge is NOT displayed when `guestContributionsAllowed` is `false` or `undefined` (verified via conditional rendering test).
- **SC-011**: Warning badge layout uses space-between justification with left-aligned footer controls and right-aligned warning (verified via visual regression test).

---

## Implementation Details

### Guest Contributions Warning Badge

**Status**: ✅ Implemented

The guest contributions warning feature provides visual feedback to users when a whiteboard is publicly accessible. This ensures transparency and security awareness for all whiteboard users.

#### Components Modified

1. **WhiteboardDialog.tsx** (`src/domain/collaboration/whiteboard/WhiteboardDialog/`)
   - Extended `WhiteboardDetails` interface with `guestContributionsAllowed?: boolean`
   - Passes `guestContributionsAllowed` prop from whiteboard data to `WhiteboardDialogFooter`

2. **WhiteboardDialogFooter.tsx** (`src/domain/collaboration/whiteboard/WhiteboardDialog/`)
   - Extended `WhiteboardDialogFooterProps` interface with `guestContributionsAllowed?: boolean`
   - Added conditional warning badge rendering when `guestContributionsAllowed === true`
   - Restructured `Actions` layout from `justifyContent="start"` to `justifyContent="space-between"`
   - Wrapped existing footer controls (delete button, readonly messages) in left-aligned Box
   - Added right-aligned warning badge with:
     - Red border: `border: 1px solid ${theme.palette.error.main}`
     - Error color text: `color: theme.palette.error.main`
     - Public icon: `<Public fontSize="small" />`
     - Translated text: `t('pages.whiteboard.guestContributionsWarning')`
     - Padding and border-radius for visual emphasis

3. **PublicWhiteboardPage.tsx** (`src/main/public/whiteboard/`)
   - Added `guestContributionsAllowed` to `whiteboardDetails` adapter object
   - Maps GraphQL field `whiteboard.guestContributionsAllowed` to `WhiteboardDetails` interface

4. **translation.en.json** (`src/core/i18n/en/`)
   - Added translation key: `pages.whiteboard.guestContributionsWarning: "This whiteboard is visible to guest users"`

#### GraphQL Schema

The `guestContributionsAllowed` field is present in:
- `PublicWhiteboardFragment` in `GetPublicWhiteboard.graphql`
- Backend `Whiteboard` type (manually added, requires backend schema update)

#### Visual Design

The warning badge appears as:
```
┌──────────────────────────────────────────────────────────────────┐
│ [Delete] Readonly message...          [🌐 Public] Warning text   │
└──────────────────────────────────────────────────────────────────┘
```

- Left side: Existing footer controls (delete button, readonly messages, restart button)
- Right side: Warning badge (only when `guestContributionsAllowed: true`)
- Layout: `display: flex`, `justifyContent: space-between`

#### Accessibility

- Semantic HTML: Uses MUI `Box` with proper ARIA attributes inherited from parent dialog
- Color contrast: Error color meets WCAG 2.1 AA standards (verified via theme)
- Icon + text: Provides both visual (icon) and textual (translated message) indicators
- Screen reader friendly: Caption component ensures text is announced

#### Testing Recommendations

1. **Unit Tests**: Verify conditional rendering of warning badge based on `guestContributionsAllowed` prop
2. **Visual Regression**: Capture screenshots with warning visible and hidden
3. **Integration Tests**: Test data flow from GraphQL → PublicWhiteboardPage → WhiteboardDialog → WhiteboardDialogFooter
4. **Accessibility Audit**: Verify color contrast and screen reader compatibility

---

## Open Questions

1. **GraphQL Schema Ownership**: Does the backend `SpaceSettingsCollaboration` type already exist, or does it need to be created? It exists. We'll add the new setting there as well.
2. **Authorization Model**: Should we reuse existing space admin privileges (`UPDATE` on space settings), or introduce a new granular permission? Reuse.
3. **Public URL Format**: What should the public URL structure be? Deferred to future spec, but should be `/public/whiteboard/:whiteboardId` or similar.
4. **Analytics Events**: Which analytics adapter should we use for logging toggle changes? None. Do not log toggle changes.
5. **Backward Compatibility**: How should we handle spaces created before this feature exists? Default `allowGuestContributions` to `false` for safety.

---

## Out of Scope (Deferred to Future Work)

- **Implementation of public whiteboard URLs**: This spec does NOT implement the actual public-facing page or URL generation. It only adds the admin toggle and establishes the permission structure.
- **Share dialog enhancements**: Checkbox in the Share dialog for "Allow public contributions" will be added in a follow-up spec once this foundational work is merged.
- **Guest session management**: Handling of active guest sessions when toggle is disabled will be addressed in the public URL implementation spec.
- **Rate limiting or abuse prevention**: Not addressed in this spec; recommend separate security review for public endpoints.
- **Localization (i18n)**: Toggle labels and messages will use `react-i18next`, but translation to non-English languages is deferred.

---

## Dependencies

- **Backend Schema Update**: Backend team must add `allowGuestContributions` field to `SpaceSettingsCollaboration` type before frontend implementation can begin.
- **GraphQL Codegen**: Run `pnpm run codegen` after backend schema is updated to generate typed hooks.
- **Existing Space Settings Infrastructure**: Relies on `SpaceAdminSettingsPage.tsx`, `useUpdateSpaceSettingsMutation`, and `defaultSpaceSettings.tsx`.

---

## Next Steps

1. **Clarify Open Questions**: Confirm backend schema support and authorization model.
2. **Create Plan**: Develop detailed implementation plan (`plan.md`) with phased tasks.
3. **Backend Coordination**: Sync with backend team to ensure schema changes are deployed to dev environment.
4. **Prototype UI**: Create mockup or wireframe of toggle in settings panel for review.
5. **Implement & Test**: Follow Agentic flow (inline mini-plan) if scope remains under ~400 LOC; otherwise escalate to Full SDD.
