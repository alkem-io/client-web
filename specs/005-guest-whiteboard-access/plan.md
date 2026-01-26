# Implementation Plan: Guest Whiteboard Public Access Page

**Branch**: `005-guest-whiteboard-access` | **Date**: 2025-11-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-guest-whiteboard-access/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a completely isolated public whiteboard **real-time collaborative editing** experience for any user at `/public/whiteboard/:whiteboardId`. The implementation must be fully separated from the main application—no shared React components except the CollaborativeExcalidrawWrapper (no modifications needed). On initial load the system checks for the `ory_kratos_session` cookie: if present it fetches the CurrentUser profile and derives an anonymized guest name (`First L.` / `First` / `L.`) used as the `x-guest-name` header; if absent (or derivation fails) it prompts for a guest name and stores it in session storage. The header `x-guest-name` is included in all GraphQL requests. Guests have **full editing capabilities** (draw, shapes, text, images, export) with **real-time WebSocket-based persistence** via the existing `CollaborativeExcalidrawWrapper` component. Changes are automatically synchronized to the backend through WebSocket connections (`useCollab` hook, room-based collaboration using `whiteboard.id`). The component handles connection state (connecting, connected, disconnected) with auto-reconnect logic and connection status indicators. The page displays only the whiteboard content with zero application layout (no navigation, sidebar, or header). A persistent visibility warning ("This whiteboard is visible and editable by guest users") is rendered via fixed-position MUI Alert component. The architecture follows React 19 best practices with lean, purpose-built components using Suspense, transitions, and modern patterns.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), React 19
**Primary Dependencies**:

- React 19 (Suspense, useTransition, useOptimistic, Actions)
- Apollo Client 3.x (GraphQL data fetching with custom link middleware)
- React Router 6.x (public route registration)
- Vite (code splitting for isolated bundle)
- Material-UI (MUI) - existing theme and component library

**Storage**: Session Storage (`alkemio_guest_name` key for guest name persistence; user-entered or derived from authenticated profile, `alkemio_guest_whiteboard_url` for storing the last visited whiteboard URL to support return-to-whiteboard flow)

**Authentication Integration**: Both `LoginSuccessPage` and `RegistrationSuccessPage` call `clearAllGuestSessionData()` to remove all guest session data (`alkemio_guest_name` and `alkemio_guest_whiteboard_url`) when authentication succeeds. Historical guest contributions remain attributed to the previous guest name value.

**Testing**: Vitest (unit tests), React Testing Library (component tests), E2E framework for integration

**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - ES2020+)

**Project Type**: Web application (React SPA)

**Constraints**:

- Complete UI isolation from main app (no shared components except Whiteboard display)
- Layout-free page (zero application chrome)
- HTML escaping for XSS protection (React default)
- Session storage fallback for browsers with disabled storage
- Use existing Material-UI (MUI) theme and components from application

**Scale/Scope**:

- Single public route (`/public/whiteboard/:whiteboardId`)
- ~4-5 new components (lean, purpose-built)
- Reuses existing `WhiteboardDialog` component (no modifications needed)
- 3 custom hooks (guest session, whiteboard access with cookie detection, guest name validation)
- 1 Apollo link middleware
- GraphQL query (GetPublicWhiteboard)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

✅ **Domain Alignment**:

- **Affected contexts**: `collaboration/whiteboard` (guest access sub-domain)
- **Façade location**: `src/domain/collaboration/whiteboard/guestAccess/`
  - `useGuestSession()` - manages guest name (user-entered or derived) in session storage
  - `useGuestWhiteboardAccess(whiteboardId)` - loads whiteboard with guest context and handles cookie + CurrentUser derivation flow
- **Orchestration boundary**: React components in `src/main/public/whiteboard/` remain pure orchestrators; all business logic (validation, storage, header injection) lives in domain hooks
- **Component reuse**: Public whiteboard page uses existing `WhiteboardDialog` component with guest-specific configuration (read-only display name, public warning in header, no delete capability)

✅ **React 19 Concurrency**:

- **Suspense boundaries**: Whiteboard loading wrapped in `<Suspense fallback={<ApplicationLoader />}>`
- **Transitions**: Guest name form submission (when prompting) uses `useTransition` to avoid blocking UI
- **Optimistic updates**: `useOptimistic` for immediate whiteboard display after nickname submission
- **Actions**: Form submission via React 19 Actions pattern (server action simulation)
- **Legacy surfaces**: None; all components are new and built with React 19 patterns
- **Concurrency risks**: Mitigated by pure components, Suspense for async data, transitions for state updates

✅ **GraphQL Contract**:

- **Queries**:
  - `GetPublicWhiteboard(whiteboardId: UUID!)` - fetch whiteboard for guest
  - Fragment: `PublicWhiteboardFragment` (id, content, profile)
- **Mutations**: None (guest contributions handled by existing whiteboard mutations with guest context)
- **Codegen workflow**: Run `pnpm run codegen` after backend schema update
- **Schema diff review**: Required when `GetPublicWhiteboard` query is added to backend schema
- **Generated hooks**: `useGetPublicWhiteboardQuery` with context option for custom headers
- **Type safety**: Component props explicitly typed; no direct export of generated types

✅ **State & Effects**:

- **State sources**:
  - Session Storage: `alkemio_guest_name` (managed by `useGuestSession` hook; stores anonymized or user-entered guest name)
  - Apollo cache: Whiteboard data (normalized by ID)
  - React Context: `GuestSessionContext` in `src/domain/collaboration/whiteboard/guestAccess/context/GuestSessionContext.tsx`
- **Side-effect isolation**:
  - `useGuestSession`: reads/writes session storage (single responsibility, supports derived names)
  - Apollo Link middleware: injects `x-guest-name` header (isolated to `src/core/apollo/graphqlLinks/guestHeaderLink.ts`)
  - Socket.IO Portal: injects guest name via `auth` option for WebSocket connections (`src/domain/common/whiteboard/excalidraw/collab/Portal.ts`)
  - Error handler link: respects `skipGlobalErrorHandler` context flag to suppress error toasters for specific queries (`src/core/apollo/graphqlLinks/useErrorHandlerLink.ts`)
  - Error notifications: via existing `useNotification` adapter from `src/core/ui/notifications`
- **Pure components**: All UI components free of side effects; hooks encapsulate all I/O

✅ **Experience Safeguards**:

- **Accessibility (WCAG 2.1 AA)**:
  - Join dialog: semantic `<dialog>` element, focus trap, ARIA labels, keyboard navigation (Tab, Enter, Esc)
  - Guest name input: `<label>` association, error messaging, required validation
  - Visibility warning: `role="status"`, screen-reader accessible text
  - Color contrast: ≥4.5:1 for all text
-
- **Testing evidence**:
  - Unit tests: `useGuestSession`, `useGuestWhiteboardAccess`, session storage mocking
  - Integration tests: Route rendering, nickname submission flow, error handling
  - E2E test: Full guest journey (land → nickname → whiteboard → refresh)
  - Accessibility audit: Manual keyboard testing, screen reader validation
- **Observability**:
  - Analytics: `guest_whiteboard_accessed` event (whiteboard ID, success/failure)
  - Error tracking: Sentry for load failures (404, 403, 500)
  - Performance: No additional monitoring; rely on existing RUM
  - Logging: Guest session creation (anonymized, no PII)

## Project Structure

### Documentation (this feature)

```text
specs/005-guest-whiteboard-access/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (architectural decisions)
├── data-model.md        # Phase 1 output (Guest Session, context shape)
├── quickstart.md        # Phase 1 output (dev setup, test instructions)
├── contracts/           # Phase 1 output (GraphQL schema, fragments)
│   ├── graphql-schema.graphql
│   └── fragments.graphql
├── checklists/
│   └── requirements.md  # Already created during /speckit.specify
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── main/
│   └── public/                              # NEW: Public-facing features
│       └── whiteboard/                      # NEW: Guest whiteboard page
│           ├── PublicWhiteboardPage.tsx     # NEW: Route-level page component (uses WhiteboardDialog)
│           ├── PublicWhiteboardLayout.tsx   # NEW: Layout (no app chrome)
│           ├── JoinWhiteboardDialog.tsx     # NEW: Nickname prompt modal
│           ├── PublicWhiteboardError.tsx    # NEW: Error state component
│           └── styles/                      # NEW: Scoped CSS modules (if needed)
│               └── PublicWhiteboard.module.css
│
├── domain/
│   └── collaboration/
│       └── whiteboard/
│           ├── WhiteboardDialog/            # EXISTING: Reused for public whiteboards
│           │   └── WhiteboardDialog.tsx     # REUSED: No modifications needed
│           └── guestAccess/                 # NEW: Guest-specific domain logic
│               ├── context/
│               │   └── GuestSessionContext.tsx       # NEW: React context for guest state
│               ├── hooks/
│               │   ├── useGuestSession.ts            # NEW: Session storage management
│               │   ├── useGuestWhiteboardAccess.ts   # NEW: Whiteboard loading logic
│               │   └── useGuestNicknameValidation.ts # NEW: Nickname validation
│               └── utils/
│                   ├── sessionStorage.ts             # NEW: Session storage helpers (getGuestName, setGuestName, clearGuestName, getGuestWhiteboardUrl, setGuestWhiteboardUrl, clearGuestWhiteboardUrl, clearAllGuestSessionData)
│                   └── nicknameValidator.ts          # NEW: Validation rules
│
├── core/
│   ├── apollo/
│   │   ├── hooks/
│   │   │   └── useGraphQLClient.ts          # UPDATED: Register guestHeaderLink in link chain
│   │   ├── graphqlLinks/
│   │   │   ├── index.ts                     # UPDATED: Export guestHeaderLink
│   │   │   └── guestHeaderLink.ts           # NEW: Apollo link for x-guest-name injection
│   │   └── generated/
│   │       ├── graphql-schema.ts            # UPDATED: New types from codegen
│   │       └── apollo-hooks.ts              # UPDATED: New hooks from codegen
│   │
│   └── routing/
│       └── publicRoutes.tsx                 # UPDATED: Register /public/whiteboard/:id
│
└── root.tsx                                 # UPDATED: Add public routes to router

tests/
└── domain/
    └── collaboration/
        └── whiteboard/
            └── guestAccess/
                ├── useGuestSession.test.ts
                ├── useGuestWhiteboardAccess.test.ts
                └── nicknameValidator.test.ts
```

**Structure Decision**:
This feature uses a **hybrid isolation pattern** within the existing React web application:

- **`src/main/public/whiteboard/`**: New top-level public UI directory for guest-facing pages (parallel to existing `src/main/landing`, `src/main/admin`)
- **`src/domain/collaboration/whiteboard/guestAccess/`**: New guest-specific domain sub-context for session management and access logic
- **`src/domain/collaboration/whiteboard/WhiteboardDialog/`**: Existing component reused with guest-specific configuration (no modifications needed)
- **`src/core/apollo/graphqlLinks/`**: New Apollo middleware for header injection (cross-cutting concern)
- **Complete component reuse**: Public whiteboards use the same `WhiteboardDialog` as authenticated users, configured with guest-appropriate options (read-only display name, public warning in header, no delete capability)
- **Material-UI styling**: All new components use existing MUI theme and component library (TextField, Button, Typography, Dialog, Alert, etc.)
- **Lean structure**: Minimal new components (4-5), purpose-built for guest experience, avoiding unnecessary abstraction
- **Warning visibility**: Public warning badge displayed in WhiteboardDialog header via `headerActions` prop

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations identified.** All constitution principles are satisfied:

- Domain boundaries respected (guest logic in `src/domain/collaboration/whiteboard/guestAccess/`)
- React 19 patterns used throughout (Suspense, transitions, Actions)
- GraphQL contract maintained via codegen workflow
- State isolated to session storage and Apollo cache
- Accessibility, performance, and testing safeguards documented

## Phase 0: Research & Architectural Decisions

### Research Tasks

1. **React 19 Best Practices for Isolated Features**
   - Topic: How to structure a completely isolated feature within an existing React 19 app
   - Focus: Code splitting, dynamic imports, avoiding shared dependencies
   - Outcome: Document bundle isolation strategy

2. **Apollo Client Custom Link Middleware**
   - Topic: Creating custom Apollo links for header injection
   - Focus: ApolloLink API, context passing, middleware ordering
   - Outcome: Pattern for `x-guest-name` header injection

3. **Session Storage Best Practices**
   - Topic: Session storage patterns in React apps
   - Focus: Hook patterns, SSR considerations, fallback strategies
   - Outcome: Robust session storage hook design

4. **React 19 Dialog Component**
   - Topic: Native `<dialog>` element vs modal libraries in React 19
   - Focus: Accessibility, focus management, Suspense compatibility
   - Outcome: Choose native `<dialog>` or custom implementation

5. **Vite Code Splitting for Route-Level Components**
   - Topic: Dynamic imports and lazy loading with Vite
   - Focus: `React.lazy()`, Suspense boundaries, bundle analysis
   - Outcome: Optimal code-splitting strategy for public route

### Research Output Location

All findings documented in: `specs/005-guest-whiteboard-access/research.md`

## Phase 1: Design & Contracts

### Data Model

**Output**: `specs/005-guest-whiteboard-access/data-model.md`

**Entities**:

1. **Guest Session** (Client-side)

- `guestName: string` (1-50 chars, alphanumeric + spaces/hyphens/underscores) — user-entered or derived (`First L.` / `First` / `L.`)
- Stored in: Session Storage (`alkemio_guest_name`)
- Lifecycle: Cleared on browser close
- Validation: Non-empty, max length, character restrictions

2. **Guest Session Context** (React Context)

   ```typescript
   interface GuestSessionContextValue {
     guestName: string | null;
     setGuestName: (name: string) => void;
     clearGuestSession: () => void;
     isGuest: boolean;
   }
   ```

3. **Public Whiteboard** (GraphQL)

- Schema type: `Whiteboard` (existing)
- Accessed fields: `id`, `content`, `profile`, `createdDate`
- Access control: Server-side (returns 403 if guest access disabled)

### API Contracts

**Output**: `specs/005-guest-whiteboard-access/contracts/`

**GraphQL Query**:

```graphql
# contracts/graphql-schema.graphql
query GetPublicWhiteboard($whiteboardId: UUID!) {
  whiteboard(ID: $whiteboardId) {
    ...PublicWhiteboardFragment
  }
}

fragment PublicWhiteboardFragment on Whiteboard {
  id
  content
  guestContributionsAllowed
  profile {
    id
    displayName
    description
    url
    storageBucket {
      id
    }
  }
  createdDate
  updatedDate
}
```

**HTTP Headers** (injected via Apollo Link):

```text
x-guest-name: <nickname from session storage>
```

**Error Responses**:

- `404`: Whiteboard not found
- `403`: Guest access not permitted
- `500`: Server error

### Component Architecture

**Output**: Documented in `data-model.md` and `quickstart.md`

**Component Hierarchy**:

```text
<PublicWhiteboardPage>                    # Route component, error boundary
  <GuestSessionProvider>                  # Context provider
    <Suspense fallback={<Loader />}>
      {!guestName ? (
        <PublicWhiteboardLayout>          # Layout wrapper (no app chrome)
          <JoinWhiteboardDialog />        # Modal for nickname input
        </PublicWhiteboardLayout>
      ) : (
        <WhiteboardDialog                 # REUSED from existing app
          entities={{ whiteboard }}       # Adapted guest data structure
          options={{
            show: true,
            canEdit: true,                # Guests can collaborate
            canDelete: false,             # Guests cannot delete
            readOnlyDisplayName: true,    # Guests cannot rename
            fullscreen: true,
            headerActions: () => (
              <Alert severity="error">    # Public warning badge
                This whiteboard is visible and editable by guest users
              </Alert>
            )
          }}
        />
      )}
    </Suspense>
  </GuestSessionProvider>
</PublicWhiteboardPage>
```

**Component Responsibilities**:

1. **PublicWhiteboardPage** (Smart component)
   - Route-level error boundary
   - Whiteboard ID extraction from URL params
   - Orchestrates `useGuestWhiteboardAccess` hook
   - Handles loading/error states
   - Adapts public whiteboard data to `WhiteboardDetails` format
   - Configures `WhiteboardDialog` with guest-specific options
   - Implements close button handler to redirect guests to `/home` page

2. **PublicWhiteboardLayout** (Presentational)
   - Zero application chrome (no nav, sidebar, header)
   - Simple container for whiteboard content
   - Responsive layout (full viewport)
   - Only used for error/loading states (WhiteboardDialog provides its own container)

3. **JoinWhiteboardDialog** (Smart component)
   - Native `<dialog>` element (React 19)
   - Nickname input form with validation
   - "JOIN AS GUEST" action (useTransition)
   - "SIGN IN TO ALKEMIO" link (router navigation)
   - Focus trap, Esc to close
   - Styled with Material-UI components (TextField, Button) and existing theme

   **Implementation Details**:
   - **Form Management**: Formik-based with integrated validation via `validateGuestName`
   - **Input Component**: `FormikInputField` (application standard) instead of raw MUI TextField
     - Provides built-in ARIA support, error handling, and consistent styling
     - Configured with `title=""` (no visible label per design)
     - Placeholder text from i18n: `public.whiteboard.join.placeholder`
   - **Typography System**: Uses MUI typography variants for semantic hierarchy
     - Welcome text: `variant="body1"` (16px Source Sans Pro)
     - Title: `variant="h2"` (40px Montserrat, fontWeight 500, lineHeight 48px)
     - Description: `variant="body2"` (14px Source Sans Pro)
   - **Theme Integration**: All colors via `theme.palette` (zero hardcoded hex values)
     - Text: `theme.palette.neutral.light` (#646464)
     - Title: `theme.palette.primary.main` (#1D384A)
     - Placeholder: `theme.palette.muted.main` (#A8A8A8)
     - Borders: `theme.palette.divider` (lightgrey)
     - Background: `theme.palette.background.paper` / `.default`
   - **Spacing System**: All spacing via `theme.spacing()` (10px base unit)
     - Container padding: `theme.spacing(4.4, 4.1)` (44px/41px)
     - Element gaps: `theme.spacing(2.5, 2, 1)` (25px, 20px, 10px)
     - Button padding: `py: 1.25` (12.5px vertical) for improved clickability
   - **CSS Optimization**: Removed ~15 style declarations that MUI provides by default
     - Font families (inherited from theme)
     - Default font weights and line heights
     - TextField border radius, background, border colors
     - Button background/hover states (handled by variants)
   - **Accessibility**: FormikInputField provides ARIA labels, error announcements, and keyboard navigation
   - **Validation**: Client-side via Formik, integrated with `guestNameValidator.ts` (non-empty, max 50 chars, alphanumeric + hyphens/underscores)

4. **WhiteboardDialog** (REUSED existing component - no modifications)
   - Accepts guest-configured options via props
   - Renders public warning via `headerActions` prop
   - Provides full collaborative whiteboard experience
   - Guests get same UI/UX as authenticated users
   - Warning badge displayed in dialog header (top-right)

5. **PublicWhiteboardError** (Presentational)
   - Error message display
   - Retry button (optional)
   - Different messages for 404/403/500
   - Styled with Material-UI Typography and Button components

### Quickstart Guide

**Output**: `specs/005-guest-whiteboard-access/quickstart.md`

**Topics**:

- Development environment setup
- Running the public page locally (`http://localhost:3001/public/whiteboard/<id>`)
- Testing guest session (manual browser testing)
- Backend mock/stub for whiteboard data
- GraphQL schema updates required
- Code generation steps (`pnpm run codegen`)

## Phase 2: Task Breakdown

**Note**: Task breakdown is performed by `/speckit.tasks` command (NOT part of `/speckit.plan`).

Tasks will cover:

1. Apollo link middleware for header injection
2. Guest session hook and context
3. Public route registration
4. Page components (dialog, layout, error)
5. Modify WhiteboardDisplay component to support showWarning prop
6. GraphQL query and fragment
7. Tests (unit, integration, E2E)
8. Documentation updates

---

## Next Steps

1. **Review this plan** for completeness and alignment
2. **Run Phase 0 research** - Generate `research.md` with architectural decisions
3. **Run Phase 1 design** - Generate `data-model.md`, `contracts/`, `quickstart.md`
4. **Update agent context** - Run `.specify/scripts/bash/update-agent-context.sh copilot`
5. **Proceed to tasks** - Run `/speckit.tasks` to generate implementation checklist
