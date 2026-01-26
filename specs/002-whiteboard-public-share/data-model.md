# Data Model

**Feature**: Whiteboard PUBLIC_SHARE Privilege
**Phase**: 1 (Design)
**Date**: 2025-11-06

## Overview

This document describes the data structures and types involved in the PUBLIC_SHARE privilege feature. **Note**: This is a frontend-only feature that consumes existing backend data structures. No new database models or backend entities are created by this work.

---

## GraphQL Schema (Backend-Provided)

### Existing Types (No Changes)

```graphql
type Whiteboard {
  id: ID!
  nameID: String!
  # ... other fields
  authorization: Authorization # Already exists
}

type Authorization {
  id: ID!
  myPrivileges: [AuthorizationPrivilege!] # Already exists - frontend reads this
  # ... other fields
}
```

### Enum Extension (Backend Adds)

```graphql
enum AuthorizationPrivilege {
  READ
  UPDATE
  DELETE
  CREATE
  GRANT
  CONTRIBUTE
  FILE_UPLOAD
  FILE_DELETE
  UPDATE_WHITEBOARD
  # ... existing privileges
  PUBLIC_SHARE # ← NEW: Backend adds this value
}
```

**Backend Responsibility**: Add `PUBLIC_SHARE` to enum and include it in `myPrivileges` array when user is authorized (Space admin or whiteboard owner + `allowGuestContributions=true`).

---

## Frontend Types (Generated)

### Generated TypeScript Types

After running `pnpm run codegen`, these types are auto-generated in `src/core/apollo/generated/graphql-schema.ts`:

```typescript
export enum AuthorizationPrivilege {
  Read = 'READ',
  Update = 'UPDATE',
  Delete = 'DELETE',
  Create = 'CREATE',
  Grant = 'GRANT',
  Contribute = 'CONTRIBUTE',
  FileUpload = 'FILE_UPLOAD',
  FileDelete = 'FILE_DELETE',
  UpdateWhiteboard = 'UPDATE_WHITEBOARD',
  // ... existing privileges
  PublicShare = 'PUBLIC_SHARE', // ← NEW: Generated when backend adds enum value
}

export type Authorization = {
  __typename?: 'Authorization';
  id: Scalars['ID'];
  myPrivileges?: Maybe<Array<AuthorizationPrivilege>>;
  // ... other fields
};

export type Whiteboard = {
  __typename?: 'Whiteboard';
  id: Scalars['ID'];
  nameID: Scalars['String'];
  authorization?: Maybe<Authorization>;
  // ... other fields
};
```

---

## Component Props (Explicit Types)

### WhiteboardShareControls Props

**Current** (existing implementation from feature 001):

```typescript
interface WhiteboardShareControlsProps {
  whiteboard: {
    id: string;
    nameID: string;
    profile: {
      url: string;
    };
  };
  allowGuestContributions: boolean;
  canEnablePublicSharing: boolean; // ← Currently uses Space-level setting
  onGuestAccessToggle: (enabled: boolean) => void;
}
```

**Updated** (this feature):

```typescript
interface WhiteboardShareControlsProps {
  whiteboard: {
    id: string;
    nameID: string;
    profile: {
      url: string;
    };
    authorization: {
      myPrivileges: AuthorizationPrivilege[]; // ← NEW: Check for PUBLIC_SHARE
    };
  };
  allowGuestContributions: boolean; // Space-level setting (still needed for read-only URL check)
  onGuestAccessToggle: (enabled: boolean) => void;
}
```

**Note**: `canEnablePublicSharing` prop removed—replaced with privilege check inside component.

---

## Data Flow

### Authorization Flow

```
Backend Authorization System
├── Space Setting: allowGuestContributions (boolean)
├── User Role: Space Admin / Whiteboard Owner
└── Privilege Calculation Logic
    ↓
    Includes PUBLIC_SHARE in myPrivileges array
    ↓
GraphQL Query Response
├── whiteboard.authorization.myPrivileges: [AuthorizationPrivilege]
    ↓
Apollo Client Cache
├── Normalized whiteboard object with authorization
    ↓
React Component (WhiteboardShareControls)
├── const hasPrivilege = myPrivileges.includes(AuthorizationPrivilege.PUBLIC_SHARE)
├── Conditional Rendering: hasPrivilege ? <Toggle /> : null
```

### Cache Update Flow

```
User Action (e.g., admin toggles Space setting)
    ↓
Backend recalculates privileges
    ↓
GraphQL mutation response / refetch
    ↓
Apollo Cache Update
├── whiteboard.authorization.myPrivileges modified
    ↓
React Re-render (automatic via Apollo reactivity)
├── Component re-evaluates hasPrivilege
├── UI updates (toggle appears/disappears)
```

---

## State Transitions

### Privilege State Machine

```
User opens Share dialog
    ↓
[LOADING] Whiteboard query in flight
    ↓
    ├─→ [ERROR] Query fails → Hide controls (no privilege assumed)
    ├─→ [NO_DATA] authorization undefined → Hide controls
    └─→ [SUCCESS] authorization.myPrivileges available
        ↓
        Check myPrivileges.includes(PUBLIC_SHARE)
        ↓
        ├─→ [HAS_PRIVILEGE] → Show toggle
        └─→ [NO_PRIVILEGE] → Hide toggle

Mid-session privilege change (cache update)
    ↓
[HAS_PRIVILEGE] → Apollo cache removes PUBLIC_SHARE
    ↓
[NO_PRIVILEGE] → Toggle disappears gracefully
```

---

## Validation Rules

### Frontend Validation (Runtime Checks)

```typescript
// 1. Check myPrivileges array exists
if (!whiteboard?.authorization?.myPrivileges) {
  // Hide controls - no privilege data available
  return null;
}

// 2. Check for PUBLIC_SHARE privilege (type-safe)
const hasPublicSharePrivilege = whiteboard.authorization.myPrivileges.includes(
  AuthorizationPrivilege.PublicShare
);

// 3. Render conditionally
if (!hasPublicSharePrivilege) {
  // Hide toggle - user not authorized
  return null;
}

// 4. Show toggle only if Space setting allows AND user has privilege
if (hasPublicSharePrivilege && allowGuestContributions) {
  return <GuestAccessToggle />;
}
```

### Backend Validation (Not Implemented Here)

Backend MUST ensure:

- `PUBLIC_SHARE` only included when Space has `allowGuestContributions=true`
- Privilege removed when Space setting changed to `false`
- No inheritance between parent/subspace levels
- Space admins and whiteboard owners receive privilege when conditions met

---

## GraphQL Query Example

### Updated Whiteboard Query Fragment

```graphql
fragment WhiteboardDetails on Whiteboard {
  id
  nameID
  profile {
    id
    url
    displayName
  }
  authorization {
    id
    myPrivileges # ← Must include this field to check for PUBLIC_SHARE
  }
  # ... other fields
}
```

**Note**: If existing whiteboard queries don't include `authorization.myPrivileges`, add it to the fragment.

---

## Performance Considerations

### Array Check Performance

```typescript
// Performance: O(n) where n = number of privileges
// Typical n = 5-10 privileges
// Expected overhead: <1ms (well under 10ms target)
const hasPrivilege = myPrivileges.includes(AuthorizationPrivilege.PublicShare);
```

### Optimization Opportunities

1. **Memoization** (if needed):

   ```typescript
   const hasPublicSharePrivilege = useMemo(
     () => whiteboard?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.PublicShare) ?? false,
     [whiteboard?.authorization?.myPrivileges]
   );
   ```

2. **Early Return** (already optimal):
   ```typescript
   if (!myPrivileges) return null; // No rendering needed
   if (!myPrivileges.includes(AuthorizationPrivilege.PublicShare)) return null;
   ```

---

## Data Consistency

### Cache Normalization

Apollo Client normalizes whiteboard objects by `id`. When `authorization.myPrivileges` changes:

- Cache update triggers automatic React re-render
- All components reading same whiteboard ID receive updated data
- No manual cache management needed

### Refetch Strategy

```typescript
// On Share dialog open
const { data, refetch } = useWhiteboardQuery({
  variables: { id: whiteboardId },
  fetchPolicy: 'cache-and-network', // Use cache immediately, fetch fresh data
});

// Trigger refetch when dialog opens (optional)
useEffect(() => {
  refetch();
}, [dialogOpen]);
```

---

## Summary

**Data Model Complexity**: Minimal

- **Backend Changes**: +1 enum value (PUBLIC_SHARE)
- **Frontend Changes**: Read existing `myPrivileges` array, perform type-safe check
- **New Types**: None (reusing existing Authorization type)
- **New Queries**: None (add field to existing query fragment)
- **Performance Impact**: <10ms array check (negligible)

**Ready for Phase 2**: Contract definition and task breakdown.
