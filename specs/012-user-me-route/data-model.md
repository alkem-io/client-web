# Data Model: User "Me" Route Shortcut

**Feature**: 001-user-me-route
**Date**: 2026-01-26

## Overview

This feature introduces no new data entities. It reuses existing data models and adds minimal React context for routing.

## Existing Entities (No Changes)

### UserModel

**Location**: `src/domain/community/user/models/UserModel.ts`

The existing user profile model. The `/user/me` route displays the same data as `/user/{nameId}`.

```typescript
interface UserModel {
  id: string; // UUID - used for profile queries
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profile: {
    id?: string;
    displayName: string;
    description?: string;
    tagline?: string;
    location?: LocationModel;
    tagsets?: TagsetModel[];
    references?: ReferenceModel[];
    url?: string; // Profile URL (e.g., "/user/nameId")
    avatar?: { uri: string };
  };
}
```

### CurrentUserModel

**Location**: `src/domain/community/userCurrent/model/CurrentUserModel.ts`

Context model providing the authenticated user's data including their `UserModel`.

```typescript
interface CurrentUserModel {
  userModel: UserModel | undefined; // Current user's profile
  loading: boolean;
  loadingMe: boolean;
  isAuthenticated: boolean;
  // ... other fields (privileges, roles, etc.)
}
```

### UrlResolverContextValue

**Location**: `src/main/routing/urlResolver/UrlResolverProvider.tsx`

Existing context for resolved URL entities. The `/user/me` route bypasses this for the user ID.

```typescript
type UrlResolverContextValue = {
  userId: string | undefined; // Resolved from URL by backend
  loading: boolean;
  // ... other resolved IDs (spaceId, etc.)
};
```

## New Context (Minimal Addition)

### MeUserContextValue

**Location**: `src/domain/community/user/routing/MeUserContext.tsx` (NEW)

Minimal context to signal "me" route and provide current user's ID.

```typescript
type MeUserContextValue = {
  userId: string; // Current user's ID from CurrentUserContext
};
```

**Usage pattern**:

```typescript
// In UserProfilePage
const meContext = useMeUserContext(); // undefined if not in /me route
const { userId: resolvedUserId } = useUrlResolver();
const userId = meContext?.userId ?? resolvedUserId;
```

## Data Flow

### Standard User Profile Route (`/user/{nameId}`)

```
URL: /user/john-doe-1234
  ↓
UrlResolverProvider (queries backend with URL)
  ↓
useUrlResolver() → { userId: "uuid-from-backend" }
  ↓
UserProfilePage → useUserProvider(userId) → fetches profile
```

### "Me" Route (`/user/me`)

```
URL: /user/me
  ↓
NoIdentityRedirect (ensures authentication)
  ↓
UserMeRoute → useCurrentUserContext() → { userModel: { id: "current-user-uuid" } }
  ↓
MeUserContext.Provider value={{ userId: "current-user-uuid" }}
  ↓
UserProfilePage → useMeUserContext() → { userId: "current-user-uuid" }
  ↓
useUserProvider(userId) → fetches profile (same as standard route)
```

## State Transitions

No state machines. The route either:

1. Shows loading (while auth or profile data loads)
2. Shows profile (when data is available)
3. Shows 404 (if user not found - shouldn't happen for current user)

## Validation Rules

No additional validation. User ID comes from trusted sources:

- **Standard route**: Backend UrlResolver validates nameId exists
- **"Me" route**: CurrentUserContext provides authenticated user's ID (already validated by auth)

## Relationships

```
MeUserContext (NEW)
  └── provides: userId (string)
        │
        │  consumed by
        ↓
UserProfilePage
  └── uses: userId to fetch profile via useUserProvider()
```

No database relationships affected. This is a frontend-only routing abstraction.
