# Feature Specification: User "Me" Route Shortcut

**Feature Branch**: `012-user-me-route`
**Created**: 2026-01-26
**Status**: Draft
**Input**: User description: "Create a user `/user/me` route that points to the profile of the currently logged in user - e.g. for user with nameid valentinadmin-yanak-5936, going to `https://alkem.io/user/me` when that user is logged in renders the same page - `alkem.io/user/valentinadmin-yanak-5936`."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Own Profile via `/user/me` (Priority: P1)

As an authenticated user, I want to navigate to `/user/me` and see my own profile page so that I can quickly access my profile without needing to know or type my nameId.

**Why this priority**: This is the core feature - providing a convenient shortcut to access one's own profile. Without this, the feature has no value.

**Independent Test**: Can be fully tested by logging in as any user, navigating to `/user/me`, and verifying the user's own profile page is displayed with all expected content.

**Acceptance Scenarios**:

1. **Given** a user is logged in with nameId "valentinadmin-yanak-5936", **When** they navigate to `/user/me`, **Then** they see the same profile page content as when navigating to `/user/valentinadmin-yanak-5936`

2. **Given** a user is logged in, **When** they navigate to `/user/me`, **Then** the URL in the browser remains `/user/me` (no redirect occurs)

3. **Given** a user is logged in with profile data (display name, bio, avatar), **When** they navigate to `/user/me`, **Then** all their profile information is correctly displayed

---

### User Story 2 - Unauthenticated Access Handling (Priority: P1)

As an unauthenticated visitor, when I try to access `/user/me`, I should be redirected to the login page so that only authenticated users can access this personal shortcut.

**Why this priority**: Security and proper access control are fundamental. Without authentication handling, the feature could expose errors or confusing behavior to anonymous users.

**Independent Test**: Can be tested by visiting `/user/me` while logged out and verifying redirection to the authentication flow.

**Acceptance Scenarios**:

1. **Given** a user is not logged in, **When** they navigate to `/user/me`, **Then** they are redirected to the login page

2. **Given** a user is not logged in, **When** they navigate to `/user/me` and then successfully log in, **Then** they are redirected back to `/user/me` (which then shows their profile)

---

### User Story 3 - Access Profile via Platform Navigation (Priority: P1)

As an authenticated user, I want to click "My Profile" or "My Account" in the platform navigation menu and be taken to `/user/me` (or its sub-routes) so that I have a consistent entry point to my profile regardless of my nameId.

**Why this priority**: The platform navigation menu is the primary way users access their profile. Using `/user/me` provides a consistent, memorable URL and aligns with the feature's core value proposition.

**Independent Test**: Can be tested by logging in, opening the platform navigation menu, clicking "My Profile" or "My Account", and verifying navigation to `/user/me` or `/user/me/settings/account`.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they click "My Profile" in the platform navigation menu, **Then** they navigate to `/user/me`

2. **Given** a user is logged in, **When** they click "My Account" in the platform navigation menu, **Then** they navigate to `/user/me/settings/account`

3. **Given** a user is logged in and on `/user/me`, **When** they view breadcrumbs or navigation elements, **Then** all links to their profile use `/user/me` (not `/user/{nameId}`)

---

### Edge Cases

- What happens when the user is authenticated but their profile data is still loading?
  - Display a loading state consistent with the standard user profile page loading behavior

- What happens if the current user's authentication token expires while on `/user/me`?
  - Follow existing session expiry patterns (redirect to login)

- What happens if `/user/me` is shared as a link with another user?
  - Each authenticated user sees their own profile; unauthenticated users see login page

- What happens if the authenticated user's profile data fails to load (network/server error)?
  - Display the standard app error UI with retry option, consistent with other data fetch failures

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a `/user/me` route that displays the current authenticated user's profile
- **FR-002**: System MUST render the same profile page content at `/user/me` as at `/user/{nameId}` for the logged-in user
- **FR-003**: System MUST require authentication to access `/user/me`
- **FR-004**: System MUST redirect unauthenticated users from `/user/me` to the login page, and return them to `/user/me` after successful authentication
- **FR-005**: System MUST preserve `/user/me` in the URL (not redirect to `/user/{nameId}`)
- **FR-006**: System MUST support deep linking - `/user/me` saved as a bookmark or shared should work for any authenticated user to view their own profile
- **FR-007**: System MUST support sub-paths under `/user/me/*` that mirror all existing `/user/{nameId}/*` routes (e.g., `/user/me/settings`, `/user/me/contributions`)
- **FR-008**: System MUST preserve `/user/me` URL context in all navigation elements (breadcrumbs, settings links, profile banner) when user is on a `/user/me/*` route
- **FR-009**: System MUST use `/user/me` as the target URL for "My Profile" and "My Account" links in the platform navigation menu

### Out of Scope

- Profile editing UI changes or enhancements
- New profile features or capabilities
- Analytics or tracking for `/user/me` usage
- Changes to the underlying user profile page component behavior

### Key Entities

- **Current User**: The authenticated user whose profile should be displayed when accessing `/user/me`. Retrieved from the existing authentication context.
- **User Profile**: The profile data (display name, avatar, bio, etc.) displayed on the profile page. Same data structure used for all user profiles.
- **User Route Context**: Abstraction that provides unified access to user ID and profile URL generation, handling both `/user/me` and `/user/{nameId}` routes transparently.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of authenticated users navigating to `/user/me` see their own profile page within the standard page load time
- **SC-002**: 100% of unauthenticated users navigating to `/user/me` are redirected to the login flow
- **SC-003**: `/user/me` renders identical content to `/user/{currentUserNameId}` for the same user
- **SC-004**: The URL remains `/user/me` after navigation (no client-side redirect to `/user/{nameId}`)
- **SC-005**: Platform navigation menu "My Profile" link navigates to `/user/me`
- **SC-006**: Platform navigation menu "My Account" link navigates to `/user/me/settings/account`
- **SC-007**: All navigation elements (breadcrumbs, settings links) preserve `/user/me` context when on me route

## Clarifications

### Session 2026-01-26

- Q: What happens after successful authentication when redirected from `/user/me`? → A: Return user to `/user/me` after login (profile auto-displays)
- Q: What happens if the authenticated user's profile data fails to load? → A: Show standard app error UI with retry option
- Q: Should `/user/me` support sub-paths mirroring `/user/{nameId}/*`? → A: Yes, `/user/me/*` mirrors all sub-routes
- Q: What should be explicitly out of scope? → A: Profile editing UI changes, new profile features, analytics tracking

### Session 2026-01-26 (Post-Implementation Review)

- Added User Story 3 (Platform Navigation) to capture implemented behavior: "My Profile" and "My Account" menu links now use `/user/me`
- Added FR-008 (URL context preservation): Navigation elements preserve `/user/me` when on me route
- Added FR-009 (Navigation menu targets): Platform navigation uses `/user/me` for profile/account links
- Added SC-005, SC-006, SC-007 for new requirements

## Assumptions

- The existing `useCurrentUserContext()` hook reliably provides the current authenticated user's data including their `nameId`
- The existing `UserProfilePage` component can be reused with the current user's ID
- The existing `NoIdentityRedirect` wrapper or similar authentication guard patterns can be leveraged
- Page loading states and error handling follow existing patterns in the user profile flow
