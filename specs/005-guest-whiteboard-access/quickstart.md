# Quickstart Guide: Public Whiteboard Guest Access

**Feature**: Public Whiteboard Guest Access Page (Unified Guest Name Derivation + Fallback Prompt)
**Date**: 2025-11-05
**Audience**: Frontend developers implementing the unified guest access & anonymized derivation workflow

---

## Prerequisites

### Required Software

- **Node.js**: ≥ 20.9.0 (pinned to 20.15.1 via Volta)
- **pnpm**: ≥ 10.17.1
- **Git**: For branch management
- **Modern browser**: Chrome/Firefox/Safari/Edge (ES2020+ support)

### Required Knowledge

- React 19 (Suspense, useTransition, useOptimistic, Actions)
- TypeScript (strict mode)
- Apollo Client 3.x + GraphQL codegen
- Session Storage API
- Cookie inspection basics (for `ory_kratos_session`)
- React Router 7.x
- Material-UI (MUI) theme & components

---

## Initial Setup

### 1. Clone and Install

```bash
# Navigate to repository
cd /path/to/alkem.io/client-web

# Checkout feature branch
git checkout 002-guest-whiteboard-access

# Install dependencies
pnpm install
```

### 2. Verify Environment

```bash
# Check Node version
node --version  # Should be 20.15.1 or 20.9.0+

# Check pnpm version
pnpm --version  # Should be 10.17.1+

# Verify .env file exists
cat .env  # Should contain VITE_APP_* variables
```

### 3. Backend Setup

**Option A: Local Backend** (recommended for development)

```bash
# In separate terminal, start Alkemio server
# See alkem.io/server repository for instructions
cd /path/to/alkem.io/server
# ... start server on http://localhost:3000
```

**Option B: Remote Backend** (if local server unavailable)

Update `.env.local`:

```bash
VITE_APP_ALKEMIO_DOMAIN=https://dev.alkem.io  # Or appropriate dev environment
```

### 4. Start Development Server

```bash
# Start Vite dev server
pnpm start

# Application runs on http://localhost:3001
# Backend proxied via Traefik at http://localhost:3000
```

---

## Development Workflow

### File Structure (Target State)

```text
src/
├── main/public/whiteboard/          # NEW: Guest whiteboard UI
│   ├── PublicWhiteboardPage.tsx     # Uses MUI theme
│   ├── PublicWhiteboardLayout.tsx   # MUI Box/Container for layout
│   ├── JoinWhiteboardDialog.tsx     # MUI Dialog (only when derivation fails)
│   └── PublicWhiteboardError.tsx    # MUI Typography, Button
│
├── domain/collaboration/whiteboard/
│   ├── WhiteboardDisplay/           # EXISTING: Modified component
│   │   └── WhiteboardDisplay.tsx    # MODIFIED: Add showWarning prop (MUI Alert)
│   └── guestAccess/                 # NEW: Guest domain logic
│       ├── context/GuestSessionContext.tsx
│       ├── hooks/
│       │   ├── useGuestSession.ts
│       │   ├── useGuestWhiteboardAccess.ts
│       │   └── useGuestNameValidation.ts
│       └── utils/
│           ├── sessionStorage.ts
│           └── guestNameValidator.ts
│
└── core/apollo/graphqlLinks/
    └── guestHeaderLink.ts           # NEW: Apollo middleware
```

**Note**: All new UI components use the existing Material-UI (MUI) theme and component library already configured in the application. Import MUI components from `@mui/material`.

### GraphQL Development

#### 1. Create GraphQL Documents

**Location**: `src/domain/collaboration/whiteboard/guestAccess/GetPublicWhiteboard.graphql`

```graphql
query GetPublicWhiteboard($whiteboardId: UUID!) {
  lookup {
    whiteboard(ID: $whiteboardId) {
      ...PublicWhiteboardFragment
    }
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

#### 2. Generate TypeScript Hooks

```bash
# Backend server must be running on http://localhost:3000/graphql
pnpm codegen

# Generates:
# - src/core/apollo/generated/graphql-schema.ts (types)
# - src/core/apollo/generated/apollo-hooks.ts (hooks)
```

#### 3. Verify Generated Code

```bash
# Check generated hook exists
grep -A 5 "useGetPublicWhiteboardQuery" src/core/apollo/generated/apollo-hooks.ts
```

---

## Testing the Feature

### Manual Testing Scenarios

#### 1. Anonymous Access – Prompted Guest Name (Happy Path A)

```bash
# 1. Start dev server (pnpm start)
# 2. Get a valid whiteboard ID from backend/database
# 3. Navigate to:
http://localhost:3001/public/whiteboard/<whiteboardId>

# Expected:
# - Join dialog appears (no derivation possible)
# - Enter guest name "TestUser"
# - Click "JOIN AS GUEST"
# - Whiteboard loads with full editing capabilities enabled
# - Warning displays: "This whiteboard is visible and editable by guest users"
# - Can draw, add shapes, text, and export to disk
# - Network requests include header: x-guest-name: TestUser
```

#### 2. Session Persistence (Same Guest Name Reuse)

```bash
# After joining as guest:
# 1. Refresh page (Cmd+R / Ctrl+R)
# Expected: No join dialog; whiteboard loads immediately

# 2. Open new tab, same URL
# Expected: No join dialog; whiteboard loads immediately

# 3. Close browser, reopen
# Expected: Join dialog appears again (session cleared)
```

#### 3. Error Scenarios

**404 - Whiteboard Not Found**:

```bash
http://localhost:3001/public/whiteboard/00000000-0000-0000-0000-000000000000

# Expected:
# - Error message: "Whiteboard not found"
```

**403 - Guest Access Disabled**:

```bash
# 1. Disable guest contributions for whiteboard's space (via backend/admin UI)
# 2. Navigate to public URL
# Expected:
# - Error message: "This whiteboard is not available for guest access"
```

#### 4. Authenticated Derivation – Anonymized Name (Happy Path B)

```bash
# Preconditions:
# - Signed in (ory_kratos_session cookie present)
# - Profile: firstName="Alice" lastName="Smith"
# Steps:
# 1. Navigate directly to /public/whiteboard/<id>
# 2. NO dialog (derivation succeeds)
# 3. Session storage set to "Alice S." automatically
# 4. GraphQL requests include: x-guest-name: Alice S.
# 5. Visibility warning present (same stripped layout as anonymous)
```

**Anonymization Algorithm** (implemented in `src/domain/collaboration/whiteboard/guestAccess/utils/anonymizeGuestName.ts`):

```typescript
// 4-tier priority system for privacy-safe name derivation
function anonymizeGuestName(firstName?: string | null, lastName?: string | null): string | null {
  const trimmedFirst = firstName?.trim();
  const trimmedLast = lastName?.trim();
  const firstToken = trimmedFirst?.split(/\s+/)[0];
  const lastInitial = trimmedLast ? `${trimmedLast.charAt(0).toUpperCase()}.` : null;

  // 1. Full name → "First L." (preferred)
  if (firstToken && lastInitial) return `${firstToken} ${lastInitial}`;

  // 2. First name only → "First"
  if (firstToken) return firstToken;

  // 3. Last name only → "L."
  if (lastInitial) return lastInitial;

  // 4. No usable fields → null (fallback to join dialog)
  return null;
}
```

**Derivation Trigger Logic**:

- Checks `ory_kratos_session` cookie → if present, user is authenticated
- Fetches `CurrentUserFull.profile` data (firstName, lastName)
- Applies anonymization algorithm
- Stores result in session storage under `alkemio_guest_name`
- Only attempts derivation **once per session** (prevents infinite loops)

#### 5. Authenticated Derivation – Partial Profile (First Only)

```bash
# Profile: firstName="Alice" lastName empty
# Derived: "Alice"
# Header: x-guest-name: Alice
# No dialog shown (derivation successful)
```

#### 6. Authenticated Derivation – Last Name Only

```bash
# Profile: lastName="Smith" firstName empty
# Derived: "S."
# Header: x-guest-name: S.
# No dialog shown (derivation successful)
```

#### 7. Authenticated Derivation – No Usable Fields (Fallback Prompt)

```bash
# Profile: firstName & lastName both missing/empty/whitespace
# Derived: null (derivation failed)
# Join dialog appears (same as Anonymous flow) → user manually enters guest name
```

**Edge Cases Handled**:

- Empty strings (`""`) → treated as missing
- Whitespace-only (`"   "`) → treated as missing
- Multi-word first names (`"Mary Jane"`) → reduced to the first token (`"Mary T."`)
- Last-name initials are always uppercased before appending the period
- Unicode characters (`"François"`) are preserved by anonymization; the current `guestNameValidator` still blocks manual Unicode entry (documentation will be updated when validator rules change)

#### 8. Sign-In After Anonymous Guest

```bash
# 1. Start anonymous guest (TestUser)
# 2. Click SIGN IN TO ALKEMIO; complete auth
# 3. Return to public route; derived anonymized name (e.g. Alice S.) replaces manual name
# 4. Warning still visible; stripped layout still used
```

```bash
# From join dialog:
# 1. Click "SIGN IN TO ALKEMIO"
# Expected:
# - Redirects to /signin
# - Return URL preserved in query params
# 2. Sign in
# Expected:
# - Redirects back to public whiteboard URL
# - Full app layout shown (authenticated experience)
```

### Browser DevTools Checks

**Session Storage**:

```javascript
// Open DevTools → Application → Session Storage
// Key: alkemio_guest_name
// Value: <guest name | anonymized derived name>

// Manual test:
sessionStorage.getItem('alkemio_guest_name'); // Should return nickname
```

**Network Headers**:

```javascript
// Open DevTools → Network → Select GraphQL request → Headers
// Request Headers should include:
x-guest-name: <guest name | anonymized derived name>
```

---

## Automated Testing

### Unit Tests

**Run all tests**:

```bash
pnpm vitest run --reporter=basic
```

**Run specific test file**:

```bash
pnpm vitest run src/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSession.test.ts
```

**Watch mode** (for TDD):

```bash
pnpm vitest watch
```

**Coverage**:

```bash
pnpm test:coverage
```

### Integration Tests

**Test public route registration**:

```typescript
// tests/integration/publicRoutes.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicWhiteboardPage from '@/main/public/whiteboard/PublicWhiteboardPage';

test('public route renders anonymous dialog', () => {
  render(
    <MemoryRouter initialEntries={['/public/whiteboard/test-id']}>
      <Routes>
        <Route path="/public/whiteboard/:whiteboardId" element={<PublicWhiteboardPage />} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText(/join whiteboard/i)).toBeInTheDocument();
});

test('derived guest name skips dialog', () => {
  sessionStorage.setItem('alkemio_guest_name', 'Alice S.');
  render(
    <MemoryRouter initialEntries={['/public/whiteboard/test-id']}>
      <Routes>
        <Route path="/public/whiteboard/:whiteboardId" element={<PublicWhiteboardPage />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.queryByText(/join whiteboard/i)).toBeNull();
});
```

---

## Common Issues & Solutions

### Issue: Codegen Fails

**Symptom**: `pnpm codegen` errors with "Cannot connect to GraphQL API"

**Solution**:

```bash
# 1. Verify backend is running
curl http://localhost:3000/graphql

# 2. Check codegen.yml points to correct endpoint
cat codegen.yml  # Should have http://localhost:3000/graphql

# 3. If using remote backend, update codegen.yml temporarily
```

### Issue: Session Storage / Derivation Not Persisting

**Symptom**: Guest name lost on refresh OR derived name not set

**Solution**:

```bash
# 1. Check browser privacy settings (not in Incognito/Private mode)
# 2. Verify session storage is enabled:
//    DevTools → Application → Session Storage should be accessible
# 3. Check for JavaScript errors in console
```

### Issue: Whiteboard Doesn't Load

**Symptom**: Join dialog works, but whiteboard never appears

**Solution**:

```bash
# 1. Check network request succeeded
#    DevTools → Network → Filter by "graphql"
#    Status should be 200, response should contain whiteboard data

# 2. Verify x-guest-name header is present
#    Request Headers → x-guest-name: <guest name>

# 3. Check console for errors
#    Look for Apollo errors or React errors
```

### Issue: Code Splitting Not Working

**Symptom**: Main bundle includes public whiteboard code

**Solution**:

```bash
# 1. Verify dynamic import syntax
#    React.lazy(() => import('@/main/public/whiteboard/PublicWhiteboardPage'))

# 2. Run build and check chunks
pnpm build
ls -lh build/assets/*.js  # Should see separate chunk for public-whiteboard

# 3. Use bundle analyzer for debugging
pnpm analyze  # Visual treemap of bundle contents
```

---

## Debugging Tips

### React DevTools

```bash
# Install React DevTools browser extension
# Inspect component tree:
# - GuestSessionProvider → guestName, isDerived
# - PublicWhiteboardPage → derived vs prompted flags
# - JoinWhiteboardDialog (only when derivation failed)
```

### Apollo Client DevTools

```bash
# Install Apollo Client DevTools extension
# Features:
# - View active queries
# - Inspect cache (Whiteboard data)
# - Monitor mutations
# - Replay queries
```

### Network Debugging

```bash
# DevTools → Network → Throttling
# Test slow 3G to verify loading states
# Test offline to verify error handling
```

---

## Code Quality Checks

### Linting

```bash
# Run ESLint
pnpm lint

# Auto-fix issues
pnpm lint:fix
```

### Type Checking

```bash
# Run TypeScript compiler (no emit)
pnpm run tsc --noEmit
```

### Formatting

```bash
# Format code with Prettier
pnpm format
```

### Pre-Commit Checks

```bash
# Husky runs automatically on git commit
# Manually trigger lint-staged:
pnpm lint-staged
```

---

## Performance Profiling

### React Profiler

```typescript
// Wrap component in Profiler
import { Profiler } from 'react';

<Profiler id="PublicWhiteboardPage" onRender={(id, phase, actualDuration) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}}>
  <PublicWhiteboardPage />
</Profiler>
```

### Lighthouse Audit

```bash
# 1. Build production version
pnpm build

# 2. Serve locally
pnpm serve:dev

# 3. Open Chrome DevTools → Lighthouse
# 4. Run audit on http://localhost:3001/public/whiteboard/<id>
# 5. Review scores for:
#    - Performance
#    - Accessibility: 100
#    - Best Practices
```

---

## Next Steps After Development

### 1. Code Review Checklist

- [ ] All tests passing (`pnpm vitest run`)
- [ ] Linting clean (`pnpm lint`)
- [ ] Type check passes (`tsc --noEmit`)
- [ ] Code splitting verified (`pnpm build` shows separate chunk)
- [ ] Accessibility audit passed (manual keyboard test + Lighthouse)
- [ ] Session storage works across browsers (Chrome, Firefox, Safari)
- [ ] Derived anonymized guest name stored automatically when authenticated
- [ ] Manual prompt only appears when derivation not possible
- [ ] Error scenarios tested (404, 403, 500, network error)
- [ ] Sign-in & derivation flows validated
- [ ] Session persistence tested (refresh, new tab, browser restart)
- [ ] Visibility warning displays correctly inside whiteboard for ALL viewers (always present)

### 2. Documentation Updates

- [ ] Update main README.md with public route info
- [ ] Add JSDoc comments to public APIs
- [ ] Update architecture diagrams (if any)

### 3. Deployment

```bash
# 1. Merge to develop branch
git checkout develop
git merge 002-guest-whiteboard-access

# 2. CI/CD pipeline builds and deploys
# 3. Verify on dev environment (https://dev.alkem.io/public/whiteboard/<id>)
```

---

## Useful Commands Reference

| Command              | Purpose                        |
| -------------------- | ------------------------------ |
| `pnpm start`         | Start dev server               |
| `pnpm build`         | Production build               |
| `pnpm lint`          | Run ESLint                     |
| `pnpm lint:fix`      | Auto-fix ESLint issues         |
| `pnpm format`        | Format with Prettier           |
| `pnpm vitest run`    | Run all tests                  |
| `pnpm vitest watch`  | Run tests in watch mode        |
| `pnpm test:coverage` | Run tests with coverage        |
| `pnpm codegen`       | Generate GraphQL types/hooks   |
| `pnpm analyze`       | Bundle size analysis           |
| `pnpm serve:dev`     | Serve production build locally |

---

## Support

**Questions?**

- Check spec: `specs/005-guest-whiteboard-access/spec.md`
- Check plan: `specs/005-guest-whiteboard-access/plan.md`
- Review research: `specs/005-guest-whiteboard-access/research.md`
- Ask team: #frontend Slack channel

---

**Happy coding & verify anonymization! 🚀**
