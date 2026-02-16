# Feature Specification: Space Inactive Visibility

**Feature Branch**: `001-inactive-spaces`
**Created**: February 16, 2026
**Status**: Draft
**Input**: User description: "Licensing: Inactive spaces#1613 - Ensuring that spaces with expired licenses are still accessible + are shown as 'inactive'"

## Clarifications

### Session 2026-02-16

Resolved ambiguities (integrated into spec below):
- Search/navigation: Follow Demo space rules
- Banner interaction: Tooltip with license expiration message
- Live transitions: Real-time updates within 5s
- Admin feedback: Confirmation message on save
- Reactivation: Manual admin visibility change

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Inactive Space Status (Priority: P1)

When a user accesses a space with an expired license, they immediately see a clear inactive status banner with contextual information explaining the space's status and continued accessibility. The system follows Demo space visibility rules for all access control, search visibility, and navigation.

**Why this priority**: This is the core user-facing value - providing transparency about space status is essential for managing expectations.

**Independent Test**: Can be fully tested by accessing a space marked as inactive and verifying the inactive banner displays with proper tooltip/popover interaction, following Demo space visibility rules.

**Acceptance Scenarios**:

1. **Given** a space has its visibility set to "Inactive", **When** a user navigates to the space, **Then** an inactive status banner is displayed similar to the Demo banner (following Demo visibility rules)
2. **Given** a user is viewing an inactive space, **When** they hover over or interact with the banner, **Then** a tooltip/popover displays: "This space's license has expired. Content remains accessible for viewing and reference."
3. **Given** a user views a space list or searches for spaces, **When** spaces include inactive ones, **Then** inactive spaces appear following Demo space visibility rules with visual distinction indicating their inactive status
4. **Given** a user is actively working in a space, **When** an admin changes the space visibility to Inactive, **Then** the inactive banner appears via real-time update within 5 seconds without requiring manual page refresh

---

### User Story 2 - Platform Admin Sets Space to Inactive (Priority: P2)

Global Admins and Global License Managers can manually mark a space as "Inactive" when its license expires, with immediate confirmation feedback and system-wide propagation to all active users within 5 seconds. When licenses are renewed, admins use the same interface to manually reactivate spaces by changing visibility back to "Active". This follows the same permission model as changing a space from Demo to Active.

**Why this priority**: Administrative control is needed after the display mechanism exists, enabling manual status management by platform-level roles responsible for licensing.

**Independent Test**: Can be tested by logging in as a Global Admin or Global License Manager, accessing platform admin space settings, changing visibility to "Inactive", confirming the immediate feedback message appears, and verifying the change persists and propagates to active users.

**Acceptance Scenarios**:

1. **Given** a Global Admin or Global License Manager accesses platform admin space settings, **When** they view the visibility options, **Then** "Inactive" appears as a visibility option alongside Active, Demo, and Archive
2. **Given** a Global Admin or Global License Manager selects "Inactive" visibility, **When** they save the settings, **Then** the space immediately shows the inactive banner and the admin receives a confirmation message: "Space visibility updated to Inactive"
3. **Given** a space is set to Inactive, **When** a user accesses it, **Then** they can view the space content and see the inactive notification (following Demo space visibility rules)
4. **Given** a space's license has been renewed, **When** a Global Admin or Global License Manager accesses platform admin space settings, **Then** they can manually change visibility from "Inactive" to "Active" using the same interface, reactivating the space

---

### User Story 3 - Access Inactive Space Content (Priority: P3)

Users can continue to view and reference content within inactive spaces, preserving access to historical work while understanding the space's current status. Inactive spaces follow Demo space visibility rules.

**Why this priority**: Ensures business continuity - users need access to past work even when licenses expire.

**Independent Test**: Can be tested by setting a space to inactive, then accessing its content (pages, posts, boards) and verifying all content remains viewable, following Demo space visibility rules.

**Acceptance Scenarios**:

1. **Given** a space is marked as Inactive, **When** a user accesses space content (pages, discussions, whiteboards), **Then** all content is viewable with full access (following Demo space visibility rules)
2. **Given** an inactive space contains collaboration boards, **When** users view those boards, **Then** they can see, edit, and contribute to existing content as normal
3. **Given** an inactive space, **When** users attempt to create new content, **Then** the system allows creation without restrictions (inactive is purely a visual label)

---

### Edge Cases

- How does the system handle bulk space visibility changes (e.g., setting multiple spaces to Inactive)?
- What notifications (if any) are sent to space members when a space becomes Inactive?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support "Inactive" as an additional visibility option for spaces, distinct from Active, Demo, and Archive
- **FR-002**: System MUST persist the Inactive visibility state in the space data model
- **FR-003**: Client MUST detect when a space has Inactive visibility and display an appropriate status banner
- **FR-004**: Client MUST render the Inactive banner with similar styling and placement as the existing Demo banner
- **FR-004a**: Client MUST provide an interactive tooltip/popover on the Inactive banner that displays: "This space's license has expired. Content remains accessible for viewing and reference."
- **FR-004b**: Client MUST display the Inactive banner via real-time update mechanisms when a space transitions to Inactive status, ensuring users see the banner within 5 seconds without manual refresh
- **FR-005**: Server authorization rules MUST treat Inactive spaces identically to Demo spaces for access control
- **FR-006**: Global Admins and Global License Managers MUST be able to set a space's visibility to "Inactive" through platform admin space settings (following the same permission model as changing visibility from Demo to Active)
- **FR-006a**: System MUST display confirmation message "Space visibility updated to Inactive" immediately after a Global Admin or Global License Manager changes space visibility to Inactive
- **FR-006b**: Global Admins and Global License Managers MUST be able to manually reactivate a space by changing its visibility from "Inactive" to "Active" using the same platform admin settings interface
- **FR-007**: System MUST display inactive spaces in space listings with visual indication of their status following Demo space visibility rules
- **FR-007a**: Inactive spaces MUST follow the same search result and navigation menu display rules as Demo spaces
- **FR-008**: Inactive spaces MUST follow Demo space visibility rules for all access control
- **FR-009**: System MUST preserve all existing content and structure when a space transitions to Inactive status
- **FR-010**: Banner message MUST clearly communicate to users that the space is inactive due to licensing

### Key Entities

- **Space**: Existing entity with enhanced visibility property now supporting "Inactive" status alongside Active, Demo, and Archive

- **Visibility**: Enumeration expanded to include "Inactive" option representing spaces with expired licenses but maintained accessibility

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users viewing an inactive space see a status banner within 1 second of page load
- **SC-002**: Global Admins and Global License Managers can change visibility to "Inactive" and have the change reflected across all users within 5 seconds
- **SC-003**: 100% of users accessing an inactive space receive clear visual feedback about the inactive status
- **SC-004**: Authorization rules for inactive spaces match Demo spaces with zero permission differences
- **SC-005**: System supports marking any number of spaces as inactive without performance degradation
- **SC-006**: Users can navigate and view content in inactive spaces with the same load times as active spaces (< 3 second page loads)

## Assumptions

- The "Inactive" status is purely a visual/informational label in this initial implementation
- Authorization and access patterns for Inactive spaces exactly mirror existing Demo space visibility rules
- Search result and navigation menu visibility for Inactive spaces follows Demo space visibility rules
- Full user permissions are maintained in inactive spaces (view, edit, create content) subject to Demo space visibility rules
- Visibility changes to "Inactive" require Global Admin or Global License Manager platform roles (same permission model as changing Demo to Active visibility)
- Reactivation of Inactive spaces requires manual admin action (changing visibility from "Inactive" to "Active") via the same settings interface
- No automated license expiration detection is included in this scope (manual admin action required)
- Existing banner UI components can be reused with minimal modification
- No new notifications or email alerts are triggered when spaces become inactive (future enhancement)

## Out of Scope

- Automated license expiration detection and auto-transition to Inactive status
- Automated reactivation upon license renewal
- Restricting privileges or functionality within inactive spaces (future epic)
- Bulk visibility management tools for administrators
- Reactivation workflows when licenses are renewed
- Notifications to space members about status changes
- Analytics or reporting on inactive space usage

## Future Considerations

- **Restricted Permissions for Inactive Spaces**: A potential enhancement would allow viewing and editing of existing content in inactive spaces while blocking new content creation. This balanced approach would enable users to complete work-in-progress without expanding the scope of inactive spaces. This would require a secondary epic to implement permission restrictions distinct from the current "inactive as label" approach.
