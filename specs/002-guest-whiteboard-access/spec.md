# Feature Specification: Guest Whiteboard Public Access Page

**Feature Branch**: `002-guest-whiteboard-access`
**Created**: 2025-11-04
**Status**: Draft
**Input**: User description: "I need to add a feature to the application which displays Whiteboards to guest users. On that page only the Whiteboard should be displayed without anything else from the layout of the application. The page should reside on a separate URL like so: `public/whiteboard/:whiteboardId`. When a user lands on the page application should try to load the whiteboard from the server and if it can't the user should be presented with a popup that prompts him to join the whiteboard by providing a nickname - see the pasted image. After the user provides the nickname the application should store it in a cookie/session storage until the end of the session and send with every request to the server as `x-guest-name` header. The button `Sign in to Alkemio` should lead to the sign in form. When the whiteboard is displayed there should be a warning in the bottom right corner reading `This whiteboard is visible to guest users`."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Guest Accesses Public Whiteboard Without Authentication (Priority: P1)

As a **guest user**, I want to access a public whiteboard via a shared URL without needing to sign in, so that I can view and contribute to the whiteboard immediately.

**Why this priority**: This is the foundational capability that delivers the core value - allowing external collaborators to access whiteboards without creating accounts.

**Independent Test**: Can be fully tested by navigating to `/public/whiteboard/:whiteboardId` URL, providing a nickname when prompted, and verifying the whiteboard loads and displays the guest visibility warning.

**Acceptance Scenarios**:

1. **Given** I am a guest user with a public whiteboard URL, **When** I navigate to `/public/whiteboard/:whiteboardId`, **Then** the application attempts to load the whiteboard from the server
2. **Given** the whiteboard cannot be loaded without authentication, **When** the initial load fails, **Then** I see a modal dialog prompting me to "Join Whiteboard" with a nickname input field
3. **Given** the join dialog is displayed, **When** I enter a nickname and click "JOIN AS GUEST", **Then** the nickname is stored in session storage and added as `x-guest-name` header to all subsequent requests
4. **Given** I have provided a valid nickname, **When** the whiteboard loads successfully, **Then** I see only the whiteboard content without any application layout (navigation, sidebar, header, etc.)
5. **Given** the whiteboard is displayed, **When** I look at the dialog header area, **Then** I see a persistent error-severity alert badge with a public icon reading "This whiteboard is visible and editable by guest users"
6. **Given** I am viewing a public whiteboard as a guest, **When** I refresh the page, **Then** my nickname persists from session storage and I am not prompted again

---

### User Story 2 - Guest Sign-In Flow from Public Whiteboard (Priority: P2)

As a **guest user**, I want the option to sign in to Alkemio from the public whiteboard page, so that I can access additional features or save my contributions to my account.

**Why this priority**: This provides a conversion path from guest to authenticated user, supporting user engagement and retention.

**Independent Test**: Can be tested by clicking "SIGN IN TO ALKEMIO" button in the join dialog and verifying it navigates to the sign-in page with proper return-to-URL handling.

**Acceptance Scenarios**:

1. **Given** I see the join whiteboard dialog, **When** I click the "SIGN IN TO ALKEMIO" button, **Then** I am redirected to the Alkemio sign-in page
2. **Given** I signed in after clicking "SIGN IN TO ALKEMIO", **When** authentication completes successfully, **Then** I am redirected back to the public whiteboard URL
3. **Given** I am now an authenticated user viewing the public whiteboard, **When** the page loads, **Then** I see the full application layout with navigation (standard authenticated experience)

---

### User Story 3 - Guest Session Persistence (Priority: P2)

As a **guest user**, I want my nickname to persist for the duration of my session, so that I don't have to re-enter it when navigating between whiteboards or refreshing the page.

**Why this priority**: Ensures a smooth user experience by avoiding repetitive authentication prompts within the same session.

**Independent Test**: Can be tested by providing a nickname, navigating away, returning to a public whiteboard URL, and verifying the nickname is still present in session storage and headers.

**Acceptance Scenarios**:

1. **Given** I have provided a nickname for one public whiteboard, **When** I navigate to a different public whiteboard URL in the same session, **Then** my nickname is automatically applied without prompting
2. **Given** I close the browser tab (but not the entire browser), **When** I reopen the public whiteboard URL in a new tab within the same browser session, **Then** my nickname persists (session storage behavior)
3. **Given** I close the entire browser, **When** I reopen the public whiteboard URL in a new browser session, **Then** I am prompted to enter a nickname again (session storage cleared)

---

### User Story 4 - Whiteboard Load Failure Handling (Priority: P3)

As a **guest user**, I want to see clear error messages when a whiteboard cannot be loaded, so that I understand why access is denied.

**Why this priority**: Provides transparency and prevents user confusion when whiteboards are unavailable or guest access is disabled.

**Independent Test**: Can be tested by attempting to access a non-existent whiteboard, a whiteboard with guest contributions disabled, or during server errors, and verifying appropriate error messages are displayed.

**Acceptance Scenarios**:

1. **Given** I navigate to a public whiteboard URL that does not exist, **When** the server returns a 404 error, **Then** I see an error message "Whiteboard not found"
2. **Given** I navigate to a public whiteboard where guest contributions are disabled, **When** the server denies access, **Then** I see an error message "This whiteboard is not available for guest access"
3. **Given** the server encounters an error while loading the whiteboard, **When** the request fails, **Then** I see a generic error message "Unable to load whiteboard. Please try again later"
4. **Given** an error message is displayed, **When** I click a retry or back button, **Then** I can either retry the request or navigate away gracefully

---

### User Story 5 - Guest Contribution

As a **guest user**, I want to edit the whiteboard (add shapes, draw, add text, export) with real-time persistence, so that I can collaborate without authenticating and see my changes saved.

**Why this priority**: Ensures transparency about data visibility, privacy, and editing capabilities, helping users make informed decisions about what they share and contribute.

**Independent Test**: Can be tested by loading a public whiteboard as a guest and verifying the visibility warning is displayed consistently in the WhiteboardDialog header as an Alert badge, plus confirming edits persist via real-time WebSocket sync.

**Acceptance Scenarios**:

1. **Given** I am viewing a public whiteboard as a guest, **When** the whiteboard dialog loads, **Then** I see a persistent error-severity Alert badge in the dialog header (top-right) reading "This whiteboard is visible and editable by guest users" with a public icon
2. **Given** the visibility warning is displayed, **When** I scroll the whiteboard canvas or interact with tools, **Then** the warning remains visible in the dialog header
3. **Given** the visibility warning is displayed, **When** I am an authenticated user viewing the same public whiteboard, **Then** I see the same guest visibility warning (always shown for public whiteboards regardless of user authentication status)
4. **Given** I am a guest user, **When** I make edits to the whiteboard, **Then** my changes are immediately visible to other collaborators via real-time synchronization
5. **Given** I am a guest user, **When** I use the export feature, **Then** I can save the whiteboard to my local disk
6. **Given** I am a guest user editing the whiteboard, **When** I make changes, **Then** those changes are automatically persisted to the backend via WebSocket connection without requiring manual save
7. **Given** I am a guest user, **When** the WebSocket connection is established, **Then** I see a connection status indicator showing "Connected"
8. **Given** I am a guest user and the connection drops, **When** the WebSocket disconnects, **Then** the system attempts auto-reconnect and shows "Reconnecting..." status
9. **Given** I am a guest user with an active connection, **When** other users edit the same whiteboard, **Then** I see their changes appear in real-time
10. **Given** I am viewing a public whiteboard as a guest, **When** I click the close/cancel button in the WhiteboardDialog, **Then** I am redirected to the `/home` page

---

### User Story 6 - Guest Session Return Flow (Priority: P2)

As a **guest user**, I want to see a helpful notification when I close the whiteboard and land on the sign-in page, so that I can easily return to my whiteboard session, explore Alkemio, or sign up for a full account.

**Why this priority**: Improves user retention and conversion by providing clear next steps after closing the whiteboard, preventing drop-off and encouraging account creation.

**Independent Test**: Can be tested by opening a whiteboard as a guest, providing a nickname, then closing the whiteboard and verifying the notification appears on the sign-in page with all three action options working correctly.

**Acceptance Scenarios**:

1. **Given** I am viewing a public whiteboard as a guest with an active session, **When** I close the WhiteboardDialog, **Then** I am redirected to `/sign_up` (not `/home`) with the whiteboard URL stored in session storage
2. **Given** I closed the whiteboard as a guest, **When** I land on the sign-up page, **Then** I see a notification box with the title "You've left your whiteboard"
3. **Given** the notification box is displayed, **When** I read the content, **Then** I see:
   - Main message: "Your guest session is still active. You can return to your whiteboard, or explore what Alkemio has to offer."
   - Primary button: "BACK TO WHITEBOARD" (dark blue background)
   - Secondary button: "GO TO OUR WEBSITE" (white background with border)
   - Info box: "Want to contribute more?" with arrow icon
   - Info text: "Sign up for an Alkemio account on the right to collaborate with teams and access advanced tools."
4. **Given** the notification box is displayed, **When** I click "BACK TO WHITEBOARD", **Then** I am redirected to the public whiteboard URL I was previously viewing (with my guest session still active)
5. **Given** the notification box is displayed, **When** I click "GO TO OUR WEBSITE", **Then** I am redirected to the main Alkemio website (external URL)
6. **Given** I close the whiteboard and see the notification, **When** I complete sign-up or sign-in, **Then** the notification disappears and I see the normal authenticated experience
7. **Given** I closed the whiteboard as a guest, **When** I navigate directly to `/sign_up` without an active guest session, **Then** I do NOT see the notification box (it only appears when there's an active guest session from a closed whiteboard)
8. **Given** I see the notification box, **When** I refresh the page, **Then** the notification persists as long as my guest session is active in session storage
9. **Given** I see the notification box, **When** my session storage is cleared, **Then** the notification disappears on the next page load

---

### User Story 7 - Public Whiteboard Header Actions (Priority: P2)

As a **guest user**, I want to access essential whiteboard controls (fullscreen, share link, save status) directly from the header, so that I can have a productive collaboration experience similar to authenticated users.

**Why this priority**: Improves usability and feature parity for guests, making the public whiteboard a viable tool for real work.

**Independent Test**: Can be tested by loading a public whiteboard as a guest and verifying the presence and functionality of the Share button (with guest link), Fullscreen button, and Save indicator.

**Acceptance Scenarios**:

1. **Given** I am viewing a public whiteboard as a guest, **When** I look at the dialog header, **Then** I see the following actions:
   - Share button (opens dialog with guest link)
   - Fullscreen toggle button
   - Save status indicator (cloud icon)
2. **Given** I click the Share button, **When** the dialog opens, **Then** I see the guest link URL and a copy button
3. **Given** I am a guest user, **When** I view the Share dialog, **Then** I do NOT see the "Enable guest access" toggle (as I lack permissions)
4. **Given** I am a guest user, **When** I view the Share dialog, **Then** I do NOT see the "Collaboration Settings" section (as I lack permissions)
5. **Given** I click the Fullscreen button, **When** the action triggers, **Then** the whiteboard expands to fill the entire screen
6. **Given** I make changes to the whiteboard, **When** the changes are saving, **Then** the Save indicator shows the saving status
7. **Given** I am an authenticated user viewing a public whiteboard, **When** I have update privileges, **Then** I see additional controls (Collaboration Settings, Preview Settings) consistent with the standard whiteboard view

---

### Edge Cases

- **What happens when a guest provides an empty or invalid nickname (e.g., only whitespace)?**
  - System should validate input and display error message: "Please enter a valid nickname"

- **What happens when a guest loses network connectivity while viewing a whiteboard?**
  - System should display an offline indicator and attempt to reconnect when connectivity is restored

- **What happens when a guest tries to access a whiteboard that was public but guest access is now disabled?**
  - System should return an error: "This whiteboard is no longer available for guest access"

- **What happens when the `x-guest-name` header is missing or invalid in subsequent requests?**
  - System should detect missing header and re-prompt the join dialog

- **What happens when session storage is disabled in the user's browser?**
  - System should fall back to in-memory storage (re-prompt on page refresh) or display a warning about browser settings

- **What happens when a guest navigates directly to `/public/whiteboard/:whiteboardId` with an authenticated session?**
  - System should recognize the authenticated user and display the full application layout instead of the guest-only view

## Clarifications

### Session 2025-11-04

- Q: When multiple guests choose the same nickname on a whiteboard, how should the system handle this conflict? → A: Allow duplicate nicknames - server identifies guests by session ID internally; nicknames are display-only
- Q: While the whiteboard is loading after a guest provides their nickname, what should be displayed? → A: Reuse existing application loader
- Q: When a guest signs in to Alkemio (after clicking "SIGN IN TO ALKEMIO"), what happens to their guest session and any contributions they made as a guest? → A: Guest session is discarded - user starts fresh as authenticated; any guest contributions remain attributed to guest nickname
- Q: To prevent abuse, should there be rate limiting on nickname submission attempts? → A: No rate limiting (deferred for now)
- Q: When displaying guest nicknames in the whiteboard UI, how should the system protect against XSS (cross-site scripting) attacks? → A: HTML escape all nicknames - standard XSS protection by escaping special characters before rendering (React default behavior)

## Requirements _(mandatory)_

### Constitution Alignment

This feature satisfies the Constitution as follows:

**I. Domain-Driven Frontend Boundaries**

- New domain logic resides in:
  - `src/domain/collaboration/whiteboard/guestAccess` - guest authentication and session management
  - `src/main/routing/publicRoutes.tsx` - public route registration for `/public/whiteboard/:whiteboardId`
  - `src/domain/collaboration/whiteboard/PublicWhiteboardPage.tsx` - guest-facing whiteboard page
- A façade in `src/domain/collaboration/whiteboard` will expose typed hooks:
  - `useGuestWhiteboardAccess(whiteboardId)` - handles loading, authentication, and session persistence
  - `useGuestSession()` - manages guest nickname storage and header injection
- UI components remain orchestration-only; guest authentication logic is isolated in domain hooks
- No business logic in React components; all state and validation logic lives in domain services
- **Architectural Decision**: Public whiteboards reuse the existing `WhiteboardDialog` component with guest-specific configuration (adapter pattern) instead of creating a duplicate `PublicWhiteboardDisplay` component. This ensures consistency, reduces code duplication (~120 LOC saved), and provides guests the same battle-tested UI/UX as authenticated users.

**II. React 19 Concurrent UX Discipline**

- Whiteboard loading uses Suspense boundaries to avoid blocking paint during fetch
- Guest nickname submission uses `useTransition` for non-blocking form submission
- Modal dialog uses React 19's `<dialog>` element or Suspense-compatible modal component
- All new components are function-based with hooks; no legacy lifecycle methods
- Optimistic rendering for guest session: display whiteboard immediately after nickname submission while request is pending

**III. GraphQL Contract Fidelity**

- GraphQL operations required:
  - `GetPublicWhiteboard(whiteboardId: UUID!, guestName: String)` - query to fetch whiteboard data for guests
  - Fragment: `PublicWhiteboardFragment` - minimal whiteboard data for guest view (id, content, visibility status)
- Generated hooks via `pnpm run codegen`:
  - `useGetPublicWhiteboardQuery` - with `context` option to inject `x-guest-name` header
- Apollo Client middleware required to inject `x-guest-name` header from session storage into all requests on `/public/*` routes
- Schema diff must be reviewed in PR
- UI components will NOT export generated GraphQL types directly; props are explicitly declared

**IV. State & Side-Effect Isolation**

- State sources:
  - Session storage: guest nickname (key: `alkemio_guest_name`)
  - Apollo cache: whiteboard data (normalized by whiteboard ID)
  - React context: `GuestSessionContext` in `src/domain/collaboration/whiteboard/context/GuestSessionContext.tsx`
- Side effects isolated to:
  - `useGuestSession` hook: reads/writes session storage
  - Apollo link middleware: injects `x-guest-name` header
  - `useNotification` adapter: displays error messages on load failures
- No direct DOM manipulation; all UI updates via React state/props

**V. Experience Quality & Safeguards**

- **Accessibility**:
  - Join dialog follows WCAG 2.1 AA (keyboard navigation, focus trap, ARIA labels, semantic HTML)
  - Nickname input has clear label and error messages
  - Visibility warning is screen-reader accessible
  - All UI components use Material-UI (MUI) for consistent, accessible design
- **Performance**:
  - No regression expected; whiteboard load time should match authenticated user experience
  - Measure with Lighthouse pre/post implementation
  - Code splitting for `PublicWhiteboardPage` to avoid impacting main bundle size
- **Styling**:
  - Use existing Material-UI (MUI) theme and component library already configured in the application
  - All new components (dialog, buttons, inputs, error messages) styled with MUI components
  - Warning message rendered using MUI Alert component for consistency
- **Testing**:
  - Unit tests for `useGuestSession` hook (session storage CRUD, header injection)
  - Integration tests for public route rendering and authentication flow
  - Manual accessibility audit of join dialog and visibility warning
  - E2E test: guest navigates to URL → provides nickname → whiteboard loads → warning displayed
- **Security**:
  - Guest nicknames MUST be HTML-escaped when displayed to prevent XSS attacks (React default behavior)
  - Nickname validation (non-empty, max 50 characters, alphanumeric plus hyphens/underscores) provides baseline input sanitization
  - Session storage keys use namespaced prefix (`alkemio_guest_name`) to avoid conflicts
- **Observability**:
  - Log guest session creation (anonymized, no PII)
  - Track whiteboard load failures by error type (404, 403, 500)
  - Analytics event: "guest_whiteboard_accessed" (whiteboard ID, success/failure)

### Functional Requirements

- **FR-001**: System MUST register a public route `/public/whiteboard/:whiteboardId` that renders a layout-free whiteboard page (no navigation, sidebar, or header)
- **FR-002**: System MUST attempt to load the whiteboard from the server when a guest navigates to the public URL
- **FR-003**: System MUST display a modal dialog with nickname input when the whiteboard cannot be loaded without guest authentication
- **FR-003a**: System MUST display the existing application loader while the whiteboard is loading after guest nickname submission
- **FR-004**: Modal dialog MUST include:
  - Title: "Join Whiteboard"
  - Subtitle: "Choose a nickname to join this whiteboard as a guest"
  - Nickname input field with placeholder "Enter your nickname"
  - "JOIN AS GUEST" button (primary action)
  - "SIGN IN TO ALKEMIO" button (secondary action)
    **FR-005**: System MUST validate guest name input (non-empty, max 50 characters, alphanumeric plus hyphens/underscores)
    **FR-006**: System MUST store the validated guest name in session storage (key: `alkemio_guest_name`) when the user clicks "JOIN AS GUEST"
    **FR-007**: System MUST inject the guest name as an `x-guest-name` HTTP header in all GraphQL requests when accessing public whiteboards
    **FR-008**: System MUST retrieve the guest name from session storage on subsequent requests and auto-populate the header without prompting
    **FR-009**: System MUST clear the guest name from session storage when the browser session ends (not on tab close)
    **FR-010**: System MUST redirect to the sign-in page when the user clicks "SIGN IN TO ALKEMIO", preserving return URL
    **FR-011**: System MUST redirect authenticated users back to the public whiteboard URL after successful sign-in, retaining stripped public layout (no app chrome)
    **FR-011a**: System MUST clear all guest session data (guest name and whiteboard URL) from session storage when sign-in completes using `clearAllGuestSessionData()`; historical guest contributions remain attributed to previous guest name value
    **FR-011b**: System MUST clear all guest session data (guest name and whiteboard URL) from session storage when registration completes using `clearAllGuestSessionData()`
    **FR-012**: System MUST display a persistent visibility warning to all viewers (guest or authenticated): "This whiteboard is visible and editable by guest users". Implementation: MUI Alert badge in the WhiteboardDialog header (top-right), always visible, using severity="error" with PublicIcon.
    **FR-013**: System MUST handle whiteboard load errors gracefully:
  - 404: "Whiteboard not found"
  - 403: "This whiteboard is not available for guest access"
  - 500/other: "Unable to load whiteboard. Please try again later"
    **FR-014**: System MUST provide a retry mechanism or back navigation option when an error occurs
    **FR-015**: (Removed – superseded by FR-012 always-show rule)
    **FR-016**: System MUST NOT display any application layout elements (navigation, sidebar, header, footer) on the public whiteboard page for any user
    **FR-017**: System MUST code-split the `PublicWhiteboardPage` component to avoid impacting the main application bundle size
    **FR-018**: System MUST on initial load check for `ory_kratos_session` cookie; if present attempt to fetch CurrentUser (firstName, lastName)
    **FR-019**: System MUST derive an anonymized guest name using algorithm: both names -> `First L.`; only first -> `First`; only last -> `L.`; neither -> prompt
    **FR-020**: System MUST store derived anonymized guest name in session storage and use it as `x-guest-name` header without prompting
    **FR-021**: System MUST fall back to prompting for a guest name if CurrentUser fetch fails or yields no usable name fields
    **FR-022**: System MUST apply validation rules to user-entered guest names; derived names bypass user validation except safe character enforcement
    **FR-023**: System MUST ensure all GraphQL requests on the public page include `x-guest-name` header once a guest name is set or derived
    **FR-024**: System MUST redirect guest users to `/home` when the WhiteboardDialog close/cancel button is clicked, providing a clear exit path from the public whiteboard view
    **FR-025**: System MUST include guest name in Socket.IO WebSocket connection via `auth` option to enable backend tracking and attribution in real-time collaboration sessions
    **FR-026**: System MUST suppress error toaster notifications for CurrentUser query failures on public whiteboard page using `errorPolicy: 'ignore'` and custom `skipGlobalErrorHandler` context flag
    **FR-027**: System MUST allow individual GraphQL queries to opt-out of global error handling by setting `context.skipGlobalErrorHandler: true`, preventing unwanted error notifications for expected failures

#### Guest Session Return Flow (User Story 6)

**FR-028**: System MUST redirect guest users to `/sign_up` (instead of `/home`) when the WhiteboardDialog close/cancel button is clicked IF the user has an active guest session, using `buildSignUpUrl(currentPath)` to preserve return URL
**FR-029**: System MUST store the last visited public whiteboard URL in session storage (key: `alkemio_guest_whiteboard_url`) when a guest closes the whiteboard
**FR-030**: System MUST display a "Guest Session Notification" component on the sign-up page when: - User navigates to `/sign_up` page - AND has an active guest session (`alkemio_guest_name` exists in session storage) - AND has a stored whiteboard URL (`alkemio_guest_whiteboard_url` exists in session storage)
**FR-031**: Guest Session Notification component MUST include: - Title: "You've left your whiteboard" (Montserrat Medium, 40px, #181828) - Description: "Your guest session is still active. You can return to your whiteboard, or explore what Alkemio has to offer." (Source Sans Pro Regular, 14px, #717182) - Primary button: "BACK TO WHITEBOARD" with left arrow icon (dark blue #1D384A background, white text, uppercase) - Secondary button: "GO TO OUR WEBSITE" (white background, light grey border, dark text, uppercase) - Info box with light blue background (#DEEFF6) containing: - Heading: "Want to contribute more?" with right arrow icon (Montserrat Regular, 15px) - Text: "Sign up for an Alkemio account on the right to collaborate with teams and access advanced tools." (Source Sans Pro Regular, 14px, #717182, centered)
**FR-032**: System MUST navigate to stored whiteboard URL when "BACK TO WHITEBOARD" button is clicked
**FR-033**: System MUST navigate to main Alkemio website (external URL) when "GO TO OUR WEBSITE" button is clicked
**FR-034**: System MUST hide the Guest Session Notification component when: - User successfully signs in or signs up (authenticated session created) - OR guest session is cleared from session storage - OR user navigates away from `/sign_up` page
**FR-035**: System MUST persist the notification across page refreshes as long as guest session data remains in session storage
**FR-036**: System MUST clear all guest session data (guest name and whiteboard URL) when user successfully authenticates, using `clearAllGuestSessionData()` utility (called from both LoginSuccessPage and RegistrationSuccessPage)

### Key Entities

- **Guest Session**: Ephemeral user session representing a guest user identified by a guest name (user-entered or anonymized derived). Attributes: `guestName` (string, 1-50 chars). Note: guest name is display-only; server uses internal session ID for unique identification.
- **Public Whiteboard**: A whiteboard entity accessible via public URL. Core attributes from GraphQL schema: `id` (UUID), `content` (WhiteboardContent), `profile` (Profile), `createdDate`, `updatedDate`. Note: Guest access control is determined server-side; if a guest can access a whiteboard, it is returned in the GraphQL response, otherwise an error is returned.
- **Guest Authentication Context**: React context providing guest session state and methods. Exposes: `guestName` (string | null), `setGuestName(name: string)` (function), `clearGuestSession()` (function), `isGuest` (boolean).
- **Guest Whiteboard Session**: Transient session tracking guest's last visited whiteboard. Attributes: `whiteboardUrl` (string, stored in session storage). Used to support return-to-whiteboard flow after sign-in interruption.

## Success Criteria _(mandatory)_

### Measurable Outcomes

**SC-001**: 100% of public whiteboard URLs are accessible to unauthenticated users with a valid whiteboard ID
**SC-002**: Guest name input validates 100% of invalid inputs (empty, >50 chars, XSS attempts) before submission
**SC-003**: Guest name persists across page refreshes with 100% reliability using session storage
**SC-004**: Real-time collaboration enables guests to see and make whiteboard changes with <500ms latency (p95)
**SC-005**: Guest contributions display guest name attribution in contribution history with 100% accuracy
**SC-006**: Whiteboard dialog loads with <2s TTI (Time to Interactive) for public users on 3G connections (p75)
**SC-007**: Socket.IO WebSocket connections include guest name in auth metadata with 100% reliability
**SC-008**: CurrentUser query errors are suppressed on public whiteboard page with 0 error toasters displayed to guests
**SC-009**: Guest Session Notification displays on `/sign_up` page when guest session active and whiteboard URL stored
**SC-010**: "Back to Whiteboard" button navigates to stored whiteboard URL with 100% accuracy
**SC-011**: Guest session data persists notification visibility across page refreshes with 100% reliability until authentication or session clear

**SC-001**: Zero layout elements (navigation, sidebar, header) are visible on the public whiteboard page for any user (guest or authenticated)
**SC-002**: 100% of public whiteboard loads display the visibility warning Alert badge in the WhiteboardDialog header
**SC-003**: ≥95% of authenticated visits derive and store an anonymized guest name without prompting
**SC-004**: ≤5% of authenticated visits fall back to manual guest name prompt
**SC-005**: 100% of GraphQL requests on public page include `x-guest-name` header once a guest name is set or derived
**SC-006**: Derived anonymized names never expose full last name (sample audits)
**SC-007**: Socket.IO WebSocket connections include guest name in auth payload for real-time collaboration tracking
**SC-008**: Zero error toasters displayed for expected CurrentUser query failures on public whiteboard page when users are not authenticated
