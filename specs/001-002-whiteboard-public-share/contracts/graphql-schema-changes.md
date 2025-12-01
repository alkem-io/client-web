# GraphQL Schema Changes

**Feature**: Whiteboard PUBLIC_SHARE Privilege
**Date**: 2025-11-06
**Backend Coordination Required**: ✅ Yes

---

## Overview

This document describes the GraphQL schema changes required for this feature. **All changes are backend-only**. The frontend consumes these changes after running `pnpm run codegen`.

---

## Schema Changes

### 1. AuthorizationPrivilege Enum Extension

**Type**: Enum value addition
**Location**: Core authorization schema (backend)
**Change**: Add `PUBLIC_SHARE` to existing `AuthorizationPrivilege` enum

#### Before (Existing)

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
  # ... other existing privileges
}
```

#### After (With PUBLIC_SHARE)

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
  PUBLIC_SHARE # ← NEW: Grants ability to enable guest contributions on whiteboard
  # ... other existing privileges
}
```

---

## Authorization Logic (Backend Implementation)

### Privilege Grant Rules

The backend MUST include `PUBLIC_SHARE` in `authorization.myPrivileges[]` when **ALL** of these conditions are true:

1. **Space Setting**: `Space.settings.collaboration.allowGuestContributions === true`
2. **User Authorization**: One of:
   - User is a **Space Admin**, OR
   - User is the **Whiteboard Owner** (created the whiteboard)

### Privilege Revocation Rules

Backend MUST remove `PUBLIC_SHARE` from `myPrivileges[]` when:

- Space setting `allowGuestContributions` changes to `false`
- User loses Space Admin role
- User loses whiteboard ownership (if transferred/deleted)

### Example Scenarios

```typescript
// Scenario 1: Space Admin in Space with allowGuestContributions=true
Space.settings.collaboration.allowGuestContributions = true;
User.role = SpaceAdmin;
Whiteboard.authorization.myPrivileges = [
  AuthorizationPrivilege.READ,
  AuthorizationPrivilege.UPDATE,
  AuthorizationPrivilege.UPDATE_WHITEBOARD,
  AuthorizationPrivilege.PUBLIC_SHARE, // ✅ Granted
];

// Scenario 2: Regular member in Space with allowGuestContributions=true
Space.settings.collaboration.allowGuestContributions = true;
User.role = SpaceMember;
User !== Whiteboard.createdBy;
Whiteboard.authorization.myPrivileges = [
  AuthorizationPrivilege.READ,
  AuthorizationPrivilege.UPDATE,
  // ❌ PUBLIC_SHARE NOT granted (not admin, not owner)
];

// Scenario 3: Whiteboard owner in Space with allowGuestContributions=true
Space.settings.collaboration.allowGuestContributions = true;
User === Whiteboard.createdBy;
Whiteboard.authorization.myPrivileges = [
  AuthorizationPrivilege.READ,
  AuthorizationPrivilege.UPDATE,
  AuthorizationPrivilege.UPDATE_WHITEBOARD,
  AuthorizationPrivilege.PUBLIC_SHARE, // ✅ Granted (owner)
];

// Scenario 4: Space Admin in Space with allowGuestContributions=false
Space.settings.collaboration.allowGuestContributions = false;
User.role = SpaceAdmin;
Whiteboard.authorization.myPrivileges = [
  AuthorizationPrivilege.READ,
  AuthorizationPrivilege.UPDATE,
  AuthorizationPrivilege.UPDATE_WHITEBOARD,
  // ❌ PUBLIC_SHARE NOT granted (Space setting disabled)
];
```

---

## Existing Queries (No Schema Changes)

### Whiteboard Query

**No schema changes required**—frontend already queries `authorization.myPrivileges` in existing queries.

```graphql
query WhiteboardDetails($whiteboardId: UUID!) {
  whiteboard(ID: $whiteboardId) {
    id
    nameID
    profile {
      id
      url
      displayName
    }
    authorization {
      id
      myPrivileges # ← Already queried, will now include PUBLIC_SHARE
    }
  }
}
```

**Frontend Action Required**: Ensure all whiteboard queries used in Share dialog include `authorization.myPrivileges` field.

---

## Generated TypeScript Types

After backend adds `PUBLIC_SHARE` enum value, running `pnpm run codegen` will generate:

```typescript
// src/core/apollo/generated/graphql-schema.ts
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
  PublicShare = 'PUBLIC_SHARE', // ← Auto-generated when backend adds enum
}
```

---

## Migration Strategy

### Backend Changes (Required First)

1. **Schema Definition**: Add `PUBLIC_SHARE` to `AuthorizationPrivilege` enum
2. **Authorization Service**: Update privilege calculation logic
   - Check `Space.settings.collaboration.allowGuestContributions`
   - Check user is Space Admin OR Whiteboard Owner
   - Add `PUBLIC_SHARE` to `myPrivileges` array when conditions met
3. **Tests**: Add unit tests for privilege grant/revoke scenarios
4. **Deploy**: Backend schema change (non-breaking—adds enum value)

### Frontend Changes (After Backend Deploys)

1. **Codegen**: Run `pnpm run codegen` to regenerate types
2. **Implementation**: Update `WhiteboardShareControls.tsx` to check for `AuthorizationPrivilege.PublicShare`
3. **Tests**: Add tests for privilege-based rendering
4. **Deploy**: Frontend change (safe—gracefully handles missing privilege)

---

## Backward Compatibility

### Before Backend Deploys

```typescript
// Frontend checks for PUBLIC_SHARE
const hasPrivilege = myPrivileges.includes(AuthorizationPrivilege.PublicShare);
// → Returns false (enum value doesn't exist)
// → Controls remain hidden ✅ Safe default
```

### After Backend Deploys

```typescript
// Frontend checks for PUBLIC_SHARE
const hasPrivilege = myPrivileges.includes(AuthorizationPrivilege.PublicShare);
// → Returns true/false based on backend authorization
// → Controls show/hide correctly ✅ Expected behavior
```

**Risk**: None. Frontend gracefully handles missing privilege (hides controls). No breaking changes.

---

## Contract Validation Checklist

### Backend Team Must Provide

- [ ] `PUBLIC_SHARE` added to `AuthorizationPrivilege` enum
- [ ] Authorization logic implemented (Space setting + user role checks)
- [ ] Privilege included in `myPrivileges[]` when conditions met
- [ ] Privilege removed when Space setting changes to `false`
- [ ] Unit tests for privilege grant/revoke scenarios
- [ ] Schema deployed to dev/test environments

### Frontend Team Must Verify

- [ ] `pnpm run codegen` successfully generates `AuthorizationPrivilege.PublicShare`
- [ ] Whiteboard queries include `authorization.myPrivileges` field
- [ ] Component checks for `AuthorizationPrivilege.PublicShare` before showing toggle
- [ ] Tests validate privilege-based rendering
- [ ] Manual testing: Toggle visibility changes when Space admin toggles setting

---

## Open Questions for Backend Team

### Q1: Subspace Inheritance

**Question**: Should PUBLIC_SHARE privilege inherit from parent Space to subspaces?
**Frontend Impact**: None (frontend reads `myPrivileges` as-is)
**Backend Decision Needed**: Define inheritance rules if applicable

### Q2: Privilege Persistence

**Question**: When Space setting `allowGuestContributions` toggles off → on, should backend recalculate privileges immediately or wait for next query?
**Frontend Impact**: Determines if we need explicit refetch on setting change
**Frontend Preference**: Immediate recalculation with cache invalidation notification

### Q3: Real-time Updates

**Question**: Should privilege changes trigger GraphQL subscriptions for real-time UI updates?
**Frontend Impact**: Determines if we use refetch-on-open vs subscriptions
**Current Decision**: Refetch on Share dialog open (simpler, lower risk)

---

## Summary

**Contract Type**: Enum extension (non-breaking)
**Backend Responsibility**: Add `PUBLIC_SHARE` to enum + authorization logic
**Frontend Responsibility**: Codegen + conditional rendering
**Deployment Order**: Backend first, then frontend (safe rollout)
**Risk Level**: Low (graceful degradation before backend deploys)

**Next Steps**:

1. Backend team: Implement enum + authorization logic
2. Backend team: Deploy to dev environment
3. Frontend team: Run `pnpm run codegen` against dev
4. Frontend team: Implement privilege check
5. QA: Test privilege-based toggle visibility
