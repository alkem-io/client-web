# Feature Specification: Dynamic Page Title in Browser Tabs

**Feature Branch**: `6557-dynamic-page-title`
**Created**: 2026-01-22
**Status**: Draft
**Input**: User description: "Dynamic page title in browser tabs - change the browser tab title based on the current page context"
**GitHub Issue**: [#6557](https://github.com/alkem-io/client-web/issues/6557)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Dynamic Space Titles (Priority: P1)

As a user navigating between spaces, I want the browser tab title to reflect the current space name, so I can easily identify which space I'm viewing when I have multiple tabs open.

**Why this priority**: Spaces are the primary organizational unit in Alkemio. Users frequently work with multiple spaces simultaneously in separate tabs, making identification critical for productivity.

**Independent Test**: Navigate to any space page and verify the browser tab shows "[Space Name] | Alkemio".

**Acceptance Scenarios**:

1. **Given** I am viewing a Space page, **When** the page loads, **Then** the browser tab title displays "[Space Name] | Alkemio"
2. **Given** I am viewing a Subspace (L1), **When** the page loads, **Then** the browser tab title displays "[Subspace Name] | Alkemio"
3. **Given** I am viewing a Subspace (L2), **When** the page loads, **Then** the browser tab title displays "[L2 Subspace Name] | Alkemio" (not including parent space names to avoid excessive length)

---

### User Story 2 - Static Page Titles (Priority: P1)

As a user navigating the platform, I want static top-level pages to have descriptive titles, so I can identify the page purpose in my browser tabs.

**Why this priority**: Top-level pages are frequently accessed and having descriptive titles improves navigation across multiple tabs.

**Independent Test**: Navigate to any static page (Forum, Contributors, Spaces, etc.) and verify the appropriate title appears.

**Acceptance Scenarios**:

1. **Given** I am on the Dashboard/Home page, **When** the page loads, **Then** the browser tab title displays "Alkemio"
2. **Given** I am on the Template Library page, **When** the page loads, **Then** the browser tab title displays "Template Library | Alkemio"
3. **Given** I am on the Global Administration page, **When** the page loads, **Then** the browser tab title displays "Global Administration | Alkemio"
4. **Given** I am on the Administration page (support admin), **When** the page loads, **Then** the browser tab title displays "Administration | Alkemio"
5. **Given** I am on the Forum page, **When** the page loads, **Then** the browser tab title displays "Forum | Alkemio"
6. **Given** I am on the Explore Spaces page, **When** the page loads, **Then** the browser tab title displays "Spaces | Alkemio"
7. **Given** I am on the Contributors page, **When** the page loads, **Then** the browser tab title displays "Contributors | Alkemio"

---

### User Story 3 - Contributor Profile Titles (Priority: P2)

As a user viewing contributor profiles, I want the browser tab to show the contributor's name, so I can identify whose profile I'm viewing across multiple tabs.

**Why this priority**: Users often compare profiles or reference specific contributors, requiring clear identification.

**Independent Test**: Navigate to any user, organization, or virtual contributor profile and verify the name appears in the tab.

**Acceptance Scenarios**:

1. **Given** I am viewing a user profile page, **When** the page loads, **Then** the browser tab title displays "[User Name] | Alkemio"
2. **Given** I am viewing an organization page, **When** the page loads, **Then** the browser tab title displays "[Organization Name] | Alkemio"
3. **Given** I am viewing a virtual contributor page, **When** the page loads, **Then** the browser tab title displays "[VC Name] | Alkemio"

---

### User Story 4 - Innovation Pack and Template Titles (Priority: P2)

As a user browsing the innovation library, I want innovation packs to have descriptive titles, so I can identify which pack I'm viewing.

**Why this priority**: Users exploring templates need to track which packs they're reviewing.

**Independent Test**: Navigate to an innovation pack page and verify the title format includes the pack name and library context.

**Acceptance Scenarios**:

1. **Given** I am viewing an Innovation Pack page, **When** the page loads, **Then** the browser tab title displays "[Pack Name] | Template Library | Alkemio"

---

### User Story 5 - Title Updates on Navigation (Priority: P1)

As a user navigating within the application, I want the browser tab title to update immediately when I navigate to a new page, without requiring a full page reload.

**Why this priority**: The application is a SPA; users expect smooth transitions with accurate tab identification at all times.

**Independent Test**: Navigate between different pages using in-app links and verify the title updates for each navigation.

**Acceptance Scenarios**:

1. **Given** I am on any page, **When** I navigate to another page via in-app navigation, **Then** the browser tab title updates to reflect the new page
2. **Given** I am on a page with a dynamic title, **When** the entity data is loading, **Then** the browser tab shows "Alkemio" until the entity name is available
3. **Given** I am on a page with a dynamic title, **When** the entity data loads, **Then** the browser tab title updates to include the entity name

---

### Edge Cases

- What happens when a space/entity name is extremely long (100+ characters)?
  - The title should use the full name; browsers handle truncation in the tab display
- What happens when entity data fails to load?
  - Fall back to "Alkemio" as the default title
- What happens on error pages (404, restricted access)?
  - Display appropriate titles like "Page Not Found | Alkemio" or "Access Restricted | Alkemio"
- What happens during authentication flows?
  - Display context-appropriate titles like "Sign In | Alkemio" or "Sign Up | Alkemio"

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST update the browser tab title when navigating between pages
- **FR-002**: System MUST use the format "[Page Context] | Alkemio" for all pages except the main dashboard
- **FR-003**: System MUST display only "Alkemio" for the main dashboard/home page
- **FR-004**: System MUST display "[Space Name] | Alkemio" when viewing a Space page (L0)
- **FR-005**: System MUST display "[Subspace Name] | Alkemio" when viewing a Subspace (L1 or L2)
- **FR-006**: System MUST display "[User/Organization/VC Name] | Alkemio" for contributor profile pages
- **FR-007**: System MUST display "[Pack Name] | Template Library | Alkemio" for innovation pack pages
- **FR-008**: System MUST display "Template Library | Alkemio" for the template library listing page
- **FR-009**: System MUST display "Forum | Alkemio" for the forum page
- **FR-010**: System MUST display "Spaces | Alkemio" for the spaces explorer page
- **FR-011**: System MUST display "Contributors | Alkemio" for the contributors page
- **FR-012**: System MUST display "Global Administration | Alkemio" for platform admin pages
- **FR-013**: System MUST display "Administration | Alkemio" for support admin/settings pages
- **FR-014**: System MUST fall back to "Alkemio" when entity data is not yet loaded or unavailable
- **FR-015**: System MUST update titles for authentication-related pages (Sign In, Sign Up, etc.)
- **FR-016**: System MUST display "Page Not Found | Alkemio" for 404 error pages
- **FR-017**: System MUST display "Documentation | Alkemio" for documentation/help pages

### Page Title Matrix

| Page Type               | Title Format                               |
| ----------------------- | ------------------------------------------ |
| Dashboard/Home          | Alkemio                                    |
| Space (L0)              | [Space Name] \| Alkemio                    |
| Subspace (L1)           | [Subspace Name] \| Alkemio                 |
| Subspace (L2)           | [Subspace Name] \| Alkemio                 |
| User Profile            | [User Name] \| Alkemio                     |
| Organization Page       | [Organization Name] \| Alkemio             |
| Virtual Contributor     | [VC Name] \| Alkemio                       |
| Innovation Pack         | [Pack Name] \| Template Library \| Alkemio |
| Template Library        | Template Library \| Alkemio                |
| Forum                   | Forum \| Alkemio                           |
| Spaces Explorer         | Spaces \| Alkemio                          |
| Contributors            | Contributors \| Alkemio                    |
| Global Administration   | Global Administration \| Alkemio           |
| Administration/Settings | Administration \| Alkemio                  |
| Documentation           | Documentation \| Alkemio                   |
| Sign In                 | Sign In \| Alkemio                         |
| Sign Up                 | Sign Up \| Alkemio                         |
| 404 Error               | Page Not Found \| Alkemio                  |
| Access Restricted       | Access Restricted \| Alkemio               |

### Key Entities

- **Page Title**: The text displayed in the browser tab, composed of a page context segment and the "Alkemio" suffix
- **Page Context**: The dynamic or static text that describes the current page (e.g., space name, "Forum", "Contributors")

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of listed page types display the correct title format as specified in the Page Title Matrix
- **SC-002**: Title updates occur within 100ms of navigation completion for static pages
- **SC-003**: Title updates occur within 100ms of entity data becoming available for dynamic pages
- **SC-004**: No page displays the default HTML title ("Alkemio - Safe Spaces for Collaboration") after initial app load completes
- **SC-005**: Users can distinguish between tabs when 3+ Alkemio pages are open simultaneously based on tab titles alone

## Assumptions

- The existing static title "Alkemio - Safe Spaces for Collaboration" in index.html will serve as the initial title before the SPA takes over
- Entity names (spaces, users, organizations) are assumed to be available from existing GraphQL queries/contexts without additional API calls
- The pipe separator (|) with spaces is the standard format for multi-part titles
- Browser tab title length is not explicitly limited; browsers handle truncation appropriately
- The feature follows React 19 concurrent rendering patterns for title updates
