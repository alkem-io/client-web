# Data Model: Guest Whiteboard Access

**Feature**: Guest Whiteboard Public Access Page
**Date**: 2025-11-05
**Status**: Complete

## Overview

This document defines the data structures, state management, and entity relationships for the guest whiteboard feature. The model emphasizes client-side state (session storage) with minimal server-side dependencies.

**UI Framework**: All UI components use Material-UI (MUI) with the existing application theme configuration.

---

## 1. Client-Side Entities

### 1.1 Guest Session

**Description**: Ephemeral user session representing a guest user identified by a guest name (either user-entered or anonymized derived from authenticated profile: `First L.` / `First` / `L.`).

**Storage**: Session Storage (`alkemio_guest_name` key) – stores guest name (entered or derived)

**Lifecycle**:

- Created: When user submits a guest name in join dialog OR when derived from authenticated profile
- Persists: Across page refreshes within same browser session
- Cleared: On browser close OR explicit sign-in

**Attributes**:

| Field       | Type   | Required | Constraints                                    | Description                       |
| ----------- | ------ | -------- | ---------------------------------------------- | --------------------------------- |
| `guestName` | string | Yes      | 1-50 chars, alphanumeric + hyphens/underscores | Display name (entered or derived) |

**Validation Rules**:

```typescript
interface GuestSessionValidation {
  minLength: 1;
  maxLength: 50;
  pattern: /^[a-zA-Z0-9_-]+$/;
  trimWhitespace: true;
  errorMessages: {
    empty: "Please enter a valid guest name";
    tooLong: "Guest name must be 50 characters or less";
    invalidChars: "Guest name can only contain letters, numbers, hyphens, and underscores";
  };
}
```

**State Transitions**:

```text
[No Session] → (Cookie present & profile derivable) → (Derive anonymized name) → [Active Guest Session]
[No Session] → (Submit Guest Name) → [Active Guest Session]
[Active Guest Session] → (Browser Close) → [No Session]
[Active Guest Session] → (Sign In) → [No Session] + Navigate to /signin
[Active Guest Session] → (Clear Session) → [No Session]
```

---

### 1.2 Guest Session Context

**Description**: React context providing guest session state and methods throughout the public whiteboard component tree.

**Implementation**: `GuestSessionContext` (React Context API)

**Context Value Type**:

```typescript
interface GuestSessionContextValue {
  // State
  guestName: string | null;
  isGuest: boolean;
  isStorageAvailable: boolean;

  // Actions
  setGuestName: (name: string) => void;
  clearGuestSession: () => void;
}
```

**Provider Location**: Wraps `PublicWhiteboardLayout` in `PublicWhiteboardPage`

**Consumer Pattern**:

```typescript
// In any child component
import { useContext } from 'react';
import { GuestSessionContext } from '@/domain/collaboration/whiteboard/guestAccess/context/GuestSessionContext';

const { guestName, setGuestName, isGuest } = useContext(GuestSessionContext);
```

**Alternative Hook Pattern** (recommended):

```typescript
// Custom hook for cleaner consumption
export const useGuestSession = () => {
  const context = useContext(GuestSessionContext);
  if (!context) {
    throw new Error('useGuestSession must be used within GuestSessionProvider');
  }
  return context;
};
```

---

## 2. Server-Side Entities (GraphQL)

### 2.1 Whiteboard

**Description**: Existing server-side entity; no modifications needed. Guest access control is server-side logic.

**GraphQL Type** (from existing schema):

```graphql
type Whiteboard {
  id: UUID!
  content: WhiteboardContent!
  profile: Profile!
  createdBy: User
  createdDate: DateTime!
  updatedDate: DateTime!
  # ... other fields not used by guest view
}
```

**Access Model**:

- Server determines if guest can access whiteboard
- If allowed: Returns whiteboard data
- If denied: Returns GraphQL error with 403 code

**Guest Access Fields Used**:

| Field         | Type              | Purpose                       |
| ------------- | ----------------- | ----------------------------- |
| `id`          | UUID              | Unique identifier             |
| `content`     | WhiteboardContent | Whiteboard data for rendering |
| `profile`     | Profile           | Display name, description     |
| `createdBy`   | User              | Original creator (optional)   |
| `createdDate` | DateTime          | Creation timestamp            |
| `updatedDate` | DateTime          | Last modification timestamp   |

---

## 3. Data Flow Diagrams

### 3.1 Guest Session Creation & Derivation

```text
User lands on /public/whiteboard/:id
          ↓
Check for `ory_kratos_session` cookie
          ↓
      ┌───┴───┐
      │ Found │ Not Found
      ↓       ↓
Request CurrentUser   Ask for guest name
(firstName + lastName)       ↓
  ↓       Validate guest name
      ↓       ↓
  ↓   Derive anonymized guest name (First L./First/L.) or validate entered name
  ↓   Save to session storage
      ↓       ↓
      ↓   Set context state
      ↓       ↓
      └───────┤
              ↓
          Load WB with x-guest-name header
              ↓
          Display whiteboard
              ↓
          Always show warning
```

### 3.2 Whiteboard Data Flow

```text
PublicWhiteboardPage (Route Component)
          ↓
  Extract whiteboardId from URL params
          ↓
  useGuestWhiteboardAccess(whiteboardId)
          ↓
  Check guestName from context
          ↓
      ┌───┴───┐
      │  Yes  │  No
      ↓       ↓
Apollo Query  Return null (show dialog)
with header
      ↓
  GraphQL: GetPublicWhiteboard
      ↓
  ┌───┴───┐
  │Success│ Error
  ↓       ↓
Return WB  Return error (404/403/500)
  ↓       ↓
Display   Show error UI
```

### 3.3 Sign-In Transition

```text
Guest viewing whiteboard
          ↓
  Click "SIGN IN TO ALKEMIO" in dialog
          ↓
  clearGuestSession() called
          ↓
  Remove 'alkemio_guest_name' from session storage
          ↓
  Navigate to /signin?returnTo=/public/whiteboard/:id
          ↓
  User signs in
          ↓
  Redirect to /public/whiteboard/:id
          ↓
  Authenticated user → Full app layout shown
```

---

## 4. State Management Strategy

### 4.1 Session Storage

**Purpose**: Persist guest name (entered or derived) across page refreshes

**Key**: `alkemio_guest_name`

**Lifecycle**:

- **Write**: When user submits nickname
- **Read**: On component mount, on route change
- **Clear**: On browser close (automatic), on sign-in (manual)

**Error Handling**:

```typescript
try {
  sessionStorage.setItem('alkemio_guest_name', guestName);
} catch (error) {
  console.warn('Session storage unavailable:', error);
  // Fall back to in-memory state (lose persistence on refresh)
  // Show optional warning to user
}
```

### 4.2 React Context

**Purpose**: Share guest session state across component tree without prop drilling

**Provider Location**: `PublicWhiteboardPage` (top-level route component)

**Consumers**:

- `JoinWhiteboardDialog` (sets guest name when prompting)
- `PublicWhiteboardLayout` (conditional rendering)
- `useGuestWhiteboardAccess` (reads nickname for query)
- `WhiteboardDisplay` (receives showWarning prop; renders warning internally)

### 4.3 Apollo Cache

**Purpose**: Cache whiteboard data to avoid redundant fetches

**Cache Key**: Normalized by `Whiteboard.id`

**Cache Policy**: `cache-first` (default)

**Invalidation**: On whiteboard update (handled by existing app logic)

---

## 5. Component State Ownership

| State             | Owner Component      | Storage         | Consumers                              |
| ----------------- | -------------------- | --------------- | -------------------------------------- |
| Guest name        | GuestSessionProvider | Session Storage | All children via context               |
| Whiteboard data   | Apollo Client        | Apollo Cache    | WhiteboardDisplay (existing component) |
| Dialog open state | JoinWhiteboardDialog | Component state | Dialog itself (native `<dialog>` API)  |
| Loading state     | Suspense boundary    | React internals | Fallback UI (ApplicationLoader)        |
| Error state       | Error boundary       | Component state | PublicWhiteboardError                  |
| Form input value  | Controlled input     | Component state | Nickname input field                   |

---

## 6. Validation Rules Summary

### Guest Name

| Rule            | Value                             | Error Message                                                            |
| --------------- | --------------------------------- | ------------------------------------------------------------------------ |
| Required        | Non-empty after trim (if entered) | "Please enter a valid guest name"                                        |
| Max length      | 50 characters                     | "Guest name must be 50 characters or less"                               |
| Character set   | `[a-zA-Z0-9_-]+`                  | "Guest name can only contain letters, numbers, hyphens, and underscores" |
| Trim whitespace | Auto-trim before validation       | N/A                                                                      |

---

## 7. GraphQL Schema Extensions

**Note**: These extensions are **proposed** for backend implementation. Frontend assumes they exist.

### New Query (if not exists)

```graphql
extend type Query {
  """
  Fetch a whiteboard for guest access.
  Requires x-guest-name header.
  Returns error if guest access not permitted.
  """
  publicWhiteboard(whiteboardId: UUID!): Whiteboard
}
```

**Alternative**: Reuse existing `whiteboard(ID: UUID!)` query with guest header handling on backend.

### Fragment Definition

```graphql
fragment PublicWhiteboardFragment on Whiteboard {
  id
  content
  profile {
    id
    displayName
    description
  }
  createdBy {
    id
    profile {
      displayName
    }
  }
  createdDate
  updatedDate
}
```

---

## 8. Type Definitions

### TypeScript Interfaces

```typescript
// src/domain/collaboration/whiteboard/guestAccess/types.ts

/**
 * Guest session stored in session storage
 */
export interface GuestSession {
  guestName: string; // user-entered or derived (anonymized)
}

/**
 * React context value for guest session
 */
export interface GuestSessionContextValue {
  guestName: string | null;
  isGuest: boolean;
  isStorageAvailable: boolean;
  setGuestName: (name: string) => void;
  clearGuestSession: () => void;
}

/**
 * Validation result for nickname input
 */
export interface GuestNameValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Props for PublicWhiteboardPage
 */
export interface PublicWhiteboardPageProps {
  // Route component; no props (uses URL params)
}

/**
 * Props for JoinWhiteboardDialog
 * Styled with Material-UI Dialog, TextField, and Button components
 */
export interface JoinWhiteboardDialogProps {
  onSubmit: (nickname: string) => void;
  onSignIn: () => void;
}

/**
 * Props for WhiteboardDisplay (modified existing component)
 * Warning rendered using Material-UI Alert component when showWarning is true
 */
export interface WhiteboardDisplayProps {
  // ... existing props
  showWarning?: boolean; // NEW: When true, renders visibility warning inside component
}

/**
 * Props for PublicWhiteboardError
 * Styled with Material-UI Typography and Button components
 */
export interface PublicWhiteboardErrorProps {
  error: Error;
  onRetry?: () => void;
}
```

---

## 9. Relationships

```text
┌─────────────────────────────────────────┐
│ Session Storage                         │
│ ┌─────────────────────────────────────┐ │
│ │ alkemio_guest_name: "Alice S."      │ │
│ └─────────────────────────────────────┘ │
└────────────────┬────────────────────────┘
                 │
                 ↓ (Read on mount, write on submit)
┌─────────────────────────────────────────┐
│ GuestSessionContext                     │
│ ┌─────────────────────────────────────┐ │
│ │ guestName: "JohnDoe"                │ │
│ │ isGuest: true                       │ │
│ │ setGuestName: fn                    │ │
│ │ clearGuestSession: fn               │ │
│ └─────────────────────────────────────┘ │
└────────────────┬────────────────────────┘
                 │
                 ↓ (Consumed by components)
┌─────────────────────────────────────────┐
│ Components                              │
│ - JoinWhiteboardDialog (writes)         │
│ - PublicWhiteboardLayout (reads)        │
│ - useGuestWhiteboardAccess (reads)      │
│ - WhiteboardDisplay (reads via prop)    │
└────────────────┬────────────────────────┘
                 │
                 ↓ (guestName → x-guest-name header)
┌─────────────────────────────────────────┐
│ Apollo Client (guestHeaderLink)         │
│ - Injects x-guest-name header           │
│ - Queries GetPublicWhiteboard           │
└────────────────┬────────────────────────┘
                 │
                 ↓ (GraphQL request)
┌─────────────────────────────────────────┐
│ Server (Alkemio API)                    │
│ - Validates guest access                │
│ - Returns Whiteboard OR Error           │
└─────────────────────────────────────────┘
```

---

## 10. Migration & Backward Compatibility

**No migration required.** This is a net-new feature with no existing user data.

**Backward compatibility**:

- Guest session storage key is namespaced (`alkemio_guest_name`)
- No conflicts with existing auth tokens or user state
- GraphQL schema additive only (no breaking changes)

---

## Summary

- **Client state**: Guest nickname in session storage + React context
- **Server state**: Whiteboard entity (existing, unmodified)
- **Data flow**: Session storage → Context → Apollo Link → GraphQL → Server
- **Validation**: Client-side (immediate feedback) + server-side (security)
- **Lifecycle**: Session-scoped (browser session), cleared on sign-in
- **Type safety**: Full TypeScript coverage with explicit interfaces

**Next Steps**: Generate GraphQL contracts and quickstart guide.
