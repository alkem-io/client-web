# Quickstart Guide: PUBLIC_SHARE Privilege Implementation

**Feature**: Whiteboard PUBLIC_SHARE Privilege
**Audience**: Frontend developers implementing this feature
**Estimated Time**: ~30 minutes (after backend deploys)

---

## Prerequisites

### Backend Requirements (BLOCKER)

✅ **Backend team must deploy** `PUBLIC_SHARE` to `AuthorizationPrivilege` enum first.

**Verify backend readiness:**

```bash
# Check GraphQL schema introspection
curl http://localhost:3000/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __type(name: \"AuthorizationPrivilege\") { enumValues { name } } }"}'

# Look for PUBLIC_SHARE in response:
# "enumValues": [
#   { "name": "READ" },
#   { "name": "UPDATE" },
#   ...
#   { "name": "PUBLIC_SHARE" }  ← Must be present
# ]
```

❌ **Do not start frontend work until PUBLIC_SHARE exists in schema.**

### Local Environment

- Node.js 20+ (project uses 20.15.1 via Volta)
- pnpm 10+ (project uses 10.17.1)
- Alkemio backend running on `http://localhost:3000` (or configured via `.env.local`)
- Existing whiteboard with `allowGuestContributions=true` in a Space for testing

---

## Step 1: Regenerate GraphQL Types

After backend deploys `PUBLIC_SHARE`, regenerate frontend types:

```bash
# From project root
pnpm run codegen
```

**Expected output:**

```
✔ Parse Configuration
✔ Generate outputs
Generated:
  - src/core/apollo/generated/graphql-schema.ts
  - src/core/apollo/generated/apollo-hooks.ts
```

**Verify generation:**

```typescript
// Open: src/core/apollo/generated/graphql-schema.ts
// Search for: AuthorizationPrivilege enum

export enum AuthorizationPrivilege {
  Read = 'READ',
  Update = 'UPDATE',
  // ...
  PublicShare = 'PUBLIC_SHARE', // ← Must exist
}
```

❌ **If `PublicShare` is missing:**

- Backend hasn't deployed yet, or
- Codegen is pointing to wrong endpoint (check `codegen.yml`)

---

## Step 2: Verify Existing GraphQL Queries

Check if whiteboard queries include `authorization.myPrivileges`:

```bash
# Search for whiteboard query fragments
grep -r "fragment.*Whiteboard" src/domain/collaboration/whiteboard/**/*.graphql
```

**Required field:**

```graphql
fragment WhiteboardDetails on Whiteboard {
  id
  nameID
  profile {
    url
  }
  authorization {
    id
    myPrivileges # ← This field MUST exist
  }
}
```

**If missing**, add `authorization.myPrivileges` to the query fragment used in Share dialog.

**Re-run codegen after editing `.graphql` files:**

```bash
pnpm run codegen
```

---

## Step 3: Update WhiteboardShareControls Component

**File to edit**: `src/domain/collaboration/whiteboard/WhiteboardShareDialog/WhiteboardShareControls.tsx`

### 3.1 Import AuthorizationPrivilege Enum

```typescript
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
```

### 3.2 Update Component Props Interface

**Before** (current):

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
  canEnablePublicSharing: boolean; // ← Remove this prop
  onGuestAccessToggle: (enabled: boolean) => void;
}
```

**After** (updated):

```typescript
interface WhiteboardShareControlsProps {
  whiteboard: {
    id: string;
    nameID: string;
    profile: {
      url: string;
    };
    authorization?: {
      myPrivileges: AuthorizationPrivilege[]; // ← Add this
    };
  };
  allowGuestContributions: boolean; // Keep for read-only URL check
  onGuestAccessToggle: (enabled: boolean) => void;
}
```

### 3.3 Add Privilege Check Logic

**At top of component function:**

```typescript
const WhiteboardShareControls: FC<WhiteboardShareControlsProps> = ({
  whiteboard,
  allowGuestContributions,
  onGuestAccessToggle
}) => {
  // Check for PUBLIC_SHARE privilege
  const hasPublicSharePrivilege = whiteboard.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.PublicShare
  ) ?? false;

  // Hide controls if no privilege
  if (!hasPublicSharePrivilege) {
    return null;
  }

  // Rest of component logic...
```

### 3.4 Remove Old `canEnablePublicSharing` Checks

**Find and remove** any references to `canEnablePublicSharing` prop inside component.

**Example cleanup:**

```typescript
// ❌ REMOVE:
{canEnablePublicSharing && <GuestAccessToggle />}

// ✅ REPLACE WITH:
// (Already handled by privilege check at top of component)
<GuestAccessToggle />
```

---

## Step 4: Update Parent Component (WhiteboardShareDialog)

**File to edit**: `src/domain/collaboration/whiteboard/WhiteboardShareDialog/WhiteboardShareDialog.tsx`

### 4.1 Remove `canEnablePublicSharing` Prop

**Before**:

```tsx
<WhiteboardShareControls
  whiteboard={whiteboard}
  allowGuestContributions={allowGuestContributions}
  canEnablePublicSharing={canEnablePublicSharing} // ← Remove this
  onGuestAccessToggle={handleGuestAccessToggle}
/>
```

**After**:

```tsx
<WhiteboardShareControls
  whiteboard={whiteboard} // Already includes authorization.myPrivileges
  allowGuestContributions={allowGuestContributions}
  onGuestAccessToggle={handleGuestAccessToggle}
/>
```

### 4.2 Optional: Add Refetch on Dialog Open

If you want fresh privilege data when dialog opens:

```typescript
const { data, refetch } = useWhiteboardQuery({
  variables: { id: whiteboardId },
  fetchPolicy: 'cache-and-network',
});

useEffect(() => {
  if (dialogOpen) {
    refetch(); // Fetch latest privileges when dialog opens
  }
}, [dialogOpen, refetch]);
```

---

## Step 5: Run Type Checks & Lints

```bash
# TypeScript type check
pnpm run lint:prod

# ESLint check
pnpm run lint

# Fix auto-fixable issues
pnpm run lint:fix
```

**Expected result**: No errors related to `WhiteboardShareControls` or `AuthorizationPrivilege`.

---

## Step 6: Manual Testing

### Test Case 1: Space Admin with allowGuestContributions=true

**Setup:**

1. Log in as **Space Admin**
2. Navigate to Space with `allowGuestContributions=true`
3. Open a whiteboard
4. Click **Share** button

**Expected Result:**
✅ Guest access toggle is **visible**

---

### Test Case 2: Regular Member with allowGuestContributions=true

**Setup:**

1. Log in as **regular Space member** (not admin)
2. Navigate to Space with `allowGuestContributions=true`
3. Open a whiteboard you **did not create**
4. Click **Share** button

**Expected Result:**
❌ Guest access toggle is **hidden** (no PUBLIC_SHARE privilege)

---

### Test Case 3: Whiteboard Owner with allowGuestContributions=true

**Setup:**

1. Log in as **regular Space member**
2. Navigate to Space with `allowGuestContributions=true`
3. Open a whiteboard you **created**
4. Click **Share** button

**Expected Result:**
✅ Guest access toggle is **visible** (owner has PUBLIC_SHARE)

---

### Test Case 4: Space Admin with allowGuestContributions=false

**Setup:**

1. Log in as **Space Admin**
2. Navigate to Space with `allowGuestContributions=false`
3. Open a whiteboard
4. Click **Share** button

**Expected Result:**
❌ Guest access toggle is **hidden** (Space setting disabled)

---

### Test Case 5: Mid-Session Privilege Change

**Setup:**

1. Open Share dialog (toggle visible)
2. In another tab, have **another admin** toggle Space setting `allowGuestContributions` to `false`
3. **Close and re-open** Share dialog

**Expected Result:**
❌ Guest access toggle **disappears** (privilege revoked, refetch on open updates UI)

---

## Step 7: Automated Tests

### Unit Test: Privilege Check Logic

**File**: `src/domain/collaboration/whiteboard/WhiteboardShareDialog/WhiteboardShareControls.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import WhiteboardShareControls from './WhiteboardShareControls';

describe('WhiteboardShareControls - PUBLIC_SHARE Privilege', () => {
  const mockWhiteboard = {
    id: 'whiteboard-1',
    nameID: 'test-whiteboard',
    profile: { url: '/whiteboard/test' },
  };

  it('shows toggle when user has PUBLIC_SHARE privilege', () => {
    const whiteboardWithPrivilege = {
      ...mockWhiteboard,
      authorization: {
        myPrivileges: [
          AuthorizationPrivilege.Read,
          AuthorizationPrivilege.Update,
          AuthorizationPrivilege.PublicShare,  // ← Has privilege
        ],
      },
    };

    render(
      <WhiteboardShareControls
        whiteboard={whiteboardWithPrivilege}
        allowGuestContributions={true}
        onGuestAccessToggle={jest.fn()}
      />
    );

    expect(screen.getByRole('switch', { name: /guest access/i })).toBeInTheDocument();
  });

  it('hides toggle when user lacks PUBLIC_SHARE privilege', () => {
    const whiteboardWithoutPrivilege = {
      ...mockWhiteboard,
      authorization: {
        myPrivileges: [
          AuthorizationPrivilege.Read,
          AuthorizationPrivilege.Update,
          // ← No PUBLIC_SHARE
        ],
      },
    };

    render(
      <WhiteboardShareControls
        whiteboard={whiteboardWithoutPrivilege}
        allowGuestContributions={true}
        onGuestAccessToggle={jest.fn()}
      />
    );

    expect(screen.queryByRole('switch', { name: /guest access/i })).not.toBeInTheDocument();
  });

  it('hides toggle when authorization data is missing', () => {
    const whiteboardNoAuth = {
      ...mockWhiteboard,
      authorization: undefined,  // ← No authorization data
    };

    render(
      <WhiteboardShareControls
        whiteboard={whiteboardNoAuth}
        allowGuestContributions={true}
        onGuestAccessToggle={jest.fn()}
      />
    );

    expect(screen.queryByRole('switch', { name: /guest access/i })).not.toBeInTheDocument();
  });
});
```

**Run tests:**

```bash
pnpm run vitest run --reporter=basic
```

---

## Step 8: Build & Smoke Test

```bash
# Production build
pnpm run build

# Check for build errors or warnings
# Expected: No errors, possible large chunk warnings (known, non-blocking)

# Serve built assets locally
pnpm run serve:dev

# Open browser: http://localhost:3001
# Repeat manual test cases 1-5
```

---

## Troubleshooting

### Issue: `AuthorizationPrivilege.PublicShare` is undefined

**Cause**: Backend hasn't deployed `PUBLIC_SHARE` enum value yet.

**Fix**:

1. Verify backend schema includes `PUBLIC_SHARE` (see Prerequisites)
2. Ensure `codegen.yml` points to correct backend URL
3. Re-run `pnpm run codegen`

---

### Issue: Toggle shows for regular members

**Cause**: Backend privilege logic not enforcing authorization correctly.

**Debug**:

1. Open browser DevTools → Network tab
2. Find GraphQL query response for whiteboard
3. Check `whiteboard.authorization.myPrivileges` array
4. Verify `PUBLIC_SHARE` is **not** present for regular members
5. If present incorrectly → backend authorization bug (escalate to backend team)

---

### Issue: Toggle doesn't disappear when Space setting changed

**Cause**: Apollo cache not updating after setting change.

**Fix**:

1. Ensure Share dialog refetches on open (see Step 4.2)
2. Check if mutation response includes updated `authorization.myPrivileges`
3. Manually refetch whiteboard query after setting change:
   ```typescript
   await refetch();
   ```

---

### Issue: TypeScript errors on `myPrivileges` prop

**Cause**: Component props not updated to include `authorization`.

**Fix**:

1. Verify props interface matches Step 3.2 (updated version)
2. Run `pnpm run lint:prod` to check for type errors
3. Ensure all parent components pass `whiteboard` with `authorization` field

---

## Performance Checklist

After implementation, verify:

- [ ] No console warnings/errors in browser DevTools
- [ ] Share dialog opens in <200ms (no perceivable delay)
- [ ] Toggle visibility check completes in <10ms (negligible overhead)
- [ ] No unnecessary re-renders (use React DevTools Profiler)
- [ ] Apollo cache normalized correctly (check cache in DevTools)

---

## Deployment Checklist

Before merging PR:

- [ ] `pnpm run codegen` executed and generated files committed
- [ ] All TypeScript/ESLint checks pass (`pnpm run lint:prod` + `pnpm run lint`)
- [ ] Unit tests pass (`pnpm run vitest run --reporter=basic`)
- [ ] Manual test cases 1-5 verified
- [ ] Production build succeeds (`pnpm run build`)
- [ ] PR description includes test evidence (screenshots/recordings)
- [ ] Backend team confirms `PUBLIC_SHARE` deployed to target environment

---

## Success Criteria

✅ **Feature is complete when:**

1. Toggle visible **only for** Space admins + whiteboard owners in Spaces with `allowGuestContributions=true`
2. Toggle hidden for regular members (no privilege)
3. Toggle disappears when Space setting changes to `false` (after dialog reopen)
4. No TypeScript/ESLint errors
5. All tests pass (unit + manual)
6. Production build succeeds

---

## Support & Questions

- **Backend coordination**: Check `contracts/graphql-schema-changes.md` for open questions
- **Constitution compliance**: See `plan.md` Constitution Check section
- **Architecture questions**: Review `research.md` for design decisions

**Estimated implementation time**: ~30 minutes (coding) + ~15 minutes (testing) = **45 minutes total**
