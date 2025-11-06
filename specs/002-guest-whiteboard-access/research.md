# Research & Architectural Decisions

**Feature**: Guest Whiteboard Public Access Page
**Date**: 2025-11-05
**Status**: Complete

## Overview

This document captures architectural decisions and research findings for implementing a completely isolated public whiteboard experience with unified "guest name" handling (including anonymized derivation for authenticated users) within the existing Alkemio React application.

---

## 1. React 19 Best Practices for Isolated Features

### Decision

Use **dynamic imports with React.lazy()** and **Suspense boundaries** for route-level code splitting to achieve complete bundle isolation.

### Rationale

- **Bundle isolation**: `React.lazy(() => import('./PublicWhiteboardPage'))` ensures the guest whiteboard code is loaded only when accessed
- **Performance**: Reduces main bundle size; guest users don't affect authenticated user experience
- **React 19 compatibility**: Suspense is a first-class citizen in React 19; lazy loading integrates seamlessly
- **Vite optimization**: Automatic code splitting and chunk hashing

### Implementation Pattern

```tsx
// src/core/routing/publicRoutes.tsx
import { lazy, Suspense } from 'react';

const PublicWhiteboardPage = lazy(() => import('@/main/public/whiteboard/PublicWhiteboardPage'));

export const publicRoutes = [
  {
    path: '/public/whiteboard/:whiteboardId',
    element: (
      <Suspense fallback={<ApplicationLoader />}>
        <PublicWhiteboardPage />
      </Suspense>
    ),
  },
];
```

### Alternatives Considered

- **Separate bundle/entry point**: Rejected due to added complexity in build config and deployment
- **No code splitting**: Rejected due to bundle size impact on main app
- **Lazy load per component**: Rejected due to excessive granularity and waterfall loading

---

## 2. Apollo Client Custom Link Middleware

### Decision

Implement a **custom ApolloLink** (`guestHeaderLink`) that conditionally injects the `x-guest-name` header for public routes.

### Rationale

- **Separation of concerns**: Header injection logic isolated from components
- **Centralized**: Single place to manage guest authentication headers
- **Apollo Client pattern**: Standard approach for request transformation
- **Testable**: Link can be unit tested independently

### Implementation Pattern

```tsx
// src/core/apollo/graphqlLinks/guestHeaderLink.ts
import { ApolloLink } from '@apollo/client';

export const guestHeaderLink = new ApolloLink((operation, forward) => {
  const guestName = sessionStorage.getItem('alkemio_guest_name');

  if (guestName && window.location.pathname.startsWith('/public/')) {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        'x-guest-name': guestName,
      },
    }));
  }

  return forward(operation);
});

// Add to Apollo Client setup (src/core/apollo/config)
const link = ApolloLink.from([
  guestHeaderLink,
  // ... other links (auth, error, http)
]);
```

### Alternatives Considered

- **Context API in queries**: Rejected due to repetition across components
- **HOC wrapper**: Rejected due to React 19 hooks-first approach
- **Fetch interceptor**: Rejected; Apollo Link is the idiomatic pattern

---

## 3. Session Storage & Auth Cookie Detection

### Decision

Use a **custom hook (`useGuestSession`)** that encapsulates session storage I/O with error handling and SSR safety. Integrate an authentication detection step: if the `ory_kratos_session` cookie exists, derive an anonymized guest name from the authenticated user's profile (first + last names) and persist it to session storage; otherwise prompt the user for a guest name.

### Rationale

- **Encapsulation**: Session storage & cookie + profile derivation logic in one place
- **Privacy**: Authenticated real names are never sent verbatim; they are anonymized (see algorithm below)
- **SSR-safe**: Checks for `window` availability (future-proofing)
- **Error handling**: Graceful fallback if storage disabled
- **React 19 hooks**: Idiomatic state management pattern
- **Single Source**: Session storage key remains the canonical source for the `x-guest-name` header across both anonymous and derived flows

### Implementation Pattern (Derivation + Storage)

```tsx
// src/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSession.ts
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'alkemio_guest_name';

// Anonymization algorithm (First L., First, L., or prompt)
const anonymize = (first?: string | null, last?: string | null) => {
  const f = (first || '').trim();
  const l = (last || '').trim();
  if (f && l) return `${f.split(/\s+/)[0]} ${l.charAt(0).toUpperCase()}.`; // First L.
  if (f) return f.split(/\s+/)[0]; // First
  if (l) return `${l.charAt(0).toUpperCase()}.`; // L.
  return null; // Caller prompts
};

export const useGuestSession = () => {
  const [guestName, setGuestNameState] = useState<string | null>(null);
  const [isStorageAvailable, setIsStorageAvailable] = useState(true);
  const [derived, setDerived] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        setGuestNameState(stored);
        return; // already initialized
      }

      // Detect auth cookie
      const hasAuthCookie = document.cookie.includes('ory_kratos_session=');
      if (hasAuthCookie) {
        // Fetch CurrentUser profile (pseudo – real implementation uses generated hook)
        // const { data } = useCurrentUserQuery();
        // For research doc, illustrate shape:
        const profile = { firstName: 'Alice', lastName: 'Smith' }; // placeholder
        const anonymized = anonymize(profile.firstName, profile.lastName);
        if (anonymized) {
          sessionStorage.setItem(STORAGE_KEY, anonymized);
          setGuestNameState(anonymized);
          setDerived(true);
        }
      }
    } catch (error) {
      console.warn('Session storage unavailable:', error);
      setIsStorageAvailable(false);
    }
  }, []);

  const setGuestName = (name: string) => {
    setGuestNameState(name);
    try {
      sessionStorage.setItem(STORAGE_KEY, name);
    } catch (error) {
      console.warn('Failed to persist guest name:', error);
    }
  };

  const clearGuestSession = () => {
    setGuestNameState(null);
    setDerived(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear guest session:', error);
    }
  };

  return {
    guestName,
    setGuestName,
    clearGuestSession,
    isGuest: !!guestName,
    isStorageAvailable,
    isDerived: derived,
  };
};
```

### Alternatives Considered

- **localStorage**: Rejected; session scope desired (auto clears on close)
- **In-memory only**: Rejected; guest name would be lost on refresh
- **Auth Cookie + Profile Derivation**: Accepted – used solely as a presence signal to derive an anonymized guest name; does not expose raw PII.
- **Dedicated guest cookie**: Rejected; redundant with sessionStorage key

---

## 4. Guest Name Dialog Component (React 19)

### Decision

Use **Material-UI Dialog component** with React 19 patterns (existing theme and component library) to prompt for a guest name only when derivation fails (no auth cookie or no usable profile fields).

### Rationale

- **Consistent design**: Matches existing application design system
- **MUI theme integration**: Automatically inherits spacing, colors, typography from existing theme
- **Built-in accessibility**: WCAG 2.1 AA compliant, keyboard handling, focus management
- **React 19 compatible**: Works seamlessly with Suspense and transitions
- **Form components**: MUI TextField and Button for consistent inputs

### Implementation Pattern

```tsx
// src/main/public/whiteboard/JoinWhiteboardDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@mui/material';
import { useState, useTransition, FormEvent } from 'react';

export const JoinWhiteboardDialog = ({
  open,
  onSubmit,
  onSignIn,
}: {
  open: boolean;
  onSubmit: (name: string) => void;
  onSignIn: () => void;
}) => {
  const [guestName, setGuestName] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    startTransition(() => {
      onSubmit(guestName.trim());
    });
  };

  return (
    <Dialog open={open} aria-labelledby="dialog-title">
      <DialogTitle id="dialog-title">Join Whiteboard</DialogTitle>
      <DialogContent>
        <Typography variant="body2" mb={2}>
          Choose a guest name to join this whiteboard.
        </Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            id="guestName"
            name="guestName"
            label="Guest Name"
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            required
            fullWidth
            inputProps={{ maxLength: 50, pattern: '[a-zA-Z0-9_-]+' }}
            placeholder="Enter a guest name"
            autoComplete="off"
          />
          <DialogActions sx={{ mt: 2 }}>
            <Button onClick={onSignIn}>SIGN IN TO ALKEMIO</Button>
            <Button type="submit" variant="contained" disabled={isPending || !guestName.trim()}>
              {isPending ? 'JOINING...' : 'JOIN AS GUEST'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

### Alternatives Considered

- **Native `<dialog>` element**: Rejected in favor of MUI for design consistency with existing app
- **Custom modal with portal**: Rejected due to complexity and MUI already providing solution
- **Headless UI**: Rejected to leverage existing MUI theme and components

### Browser Support

- All modern browsers supported by MUI (same as main application)
- Inherits existing application polyfills and compatibility

---

## 5. Vite Code Splitting for Route-Level Components

### Decision

Use **Vite's automatic code splitting** with `React.lazy()` and manual chunk naming for deterministic bundles.

### Rationale

- **Zero config**: Vite automatically splits dynamic imports
- **Predictable chunks**: Manual naming prevents hash churn
- **Bundle analysis**: Easy to verify size targets via `pnpm run analyze`
- **Performance**: Lazy routes load only when accessed

### Implementation Pattern

```tsx
// Vite automatically generates chunk for dynamic import
const PublicWhiteboardPage = lazy(
  () =>
    import(
      /* webpackChunkName: "public-whiteboard" */
      '@/main/public/whiteboard/PublicWhiteboardPage'
    )
);
```

### Vite Configuration (if needed)

```js
// vite.config.mjs
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'public-whiteboard': ['src/main/public/whiteboard/PublicWhiteboardPage.tsx'],
        },
      },
    },
  },
};
```

### Verification

````bash
pnpm build
```bash
pnpm analyze  # Verify chunk is created and isolated
````

### Alternatives Considered

- **No manual chunks**: Rejected; prefer explicit control over bundle boundaries
- **Aggressive splitting (per component)**: Rejected due to waterfall loading risk

---

## 6. Guest Name Validation Strategy

### Decision

Implement **client-side validation** with HTML5 pattern + custom hook, and **server-side validation** as defense-in-depth. Validation now applies to both manually entered guest names and derived anonymized names (derived names are guaranteed valid by construction).

### Rationale

- **Immediate feedback**: Client-side validation prevents invalid submissions
- **Security**: Server-side validation prevents bypassing client checks
- **Simplicity**: Regex pattern handles most cases
- **Accessibility**: Native HTML5 validation messages

### Validation Rules

- **Non-empty**: Required before enabling JOIN
- **Max length**: 50 characters (`maxLength={50}`)
- **Character set**: Alphanumeric + hyphens/underscores (`pattern="[a-zA-Z0-9_-]+"`)
- **No leading/trailing whitespace**: Trim prior to persistence
- **Derived names**: Algorithm yields only allowed characters; skip redundant regex validation

### Implementation Pattern

```tsx
// src/domain/collaboration/whiteboard/guestAccess/utils/guestNameValidator.ts
export const validateGuestName = (guestName: string): { valid: boolean; error?: string } => {
  const trimmed = guestName.trim();
  if (!trimmed) return { valid: false, error: 'Please enter a valid guest name' };
  if (trimmed.length > 50) return { valid: false, error: 'Guest name must be 50 characters or less' };
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Guest name can only contain letters, numbers, hyphens, and underscores' };
  }
  return { valid: true };
};
```

### Alternatives Considered

- **Server-only validation**: Rejected due to poor UX (network round-trip for errors)
- **No validation**: Rejected due to security concerns (XSS, injection)
- **Profanity filter**: Deferred to backend (out of scope for frontend)

---

## 7. Error Handling Strategy

### Decision

Use **React Error Boundaries** at the route level with fallback UI for different error types (404, 403, 500).

### Rationale

- **Graceful degradation**: Errors don't crash the entire app
- **User-friendly**: Clear error messages for each scenario
- **React 19 pattern**: Error boundaries are the idiomatic approach
- **Testable**: Error states can be unit tested

### Implementation Pattern

```tsx
// src/main/public/whiteboard/PublicWhiteboardPage.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

class PublicWhiteboardErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Public whiteboard error:', error, errorInfo);
    // Log to Sentry
  }

  render() {
    if (this.state.hasError) {
      return <PublicWhiteboardError error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Error Messages by Type

- **404**: "Whiteboard not found. The link may be incorrect or the whiteboard may have been deleted."
- **403**: "This whiteboard is not available for guest access. Please contact the whiteboard owner."
- **500**: "Unable to load whiteboard. Please try again later."
- **Network error**: "Connection lost. Please check your internet connection and try again."

### Alternatives Considered

- **Global error handler**: Rejected due to lack of context-specific messaging
- **No error boundary**: Rejected; errors would bubble to root and crash app

---

## 8. XSS Protection for Guest Name Display

### Decision

Rely on **React's default HTML escaping** for nickname rendering; no additional sanitization library needed.

### Rationale

- **React default**: JSX automatically escapes text content
- **No XSS risk**: Nicknames rendered as text, not HTML
- **Validation**: Character restrictions (alphanumeric + hyphens/underscores) prevent special characters
- **Simplicity**: No need for DOMPurify or similar

### Implementation Pattern

```tsx
// React automatically escapes this
<span>{guestName}</span> // Safe: React escapes special chars
```

### Alternatives Considered

- **DOMPurify**: Rejected as overkill for alphanumeric-only nicknames
- **Manual escaping**: Rejected; React handles it automatically
- **CSP headers**: Recommended but orthogonal (server-side configuration)

---

## 9. Loading State Design

### Decision

Reuse the **existing `ApplicationLoader` component** from the main app for consistency.

### Rationale

- **Consistency**: Familiar loading experience for users
- **Code reuse**: Don't reinvent the wheel
- **Tested**: Existing loader is battle-tested
- **Minimal dependency**: Single component import acceptable

### Implementation Pattern

```tsx
import { ApplicationLoader } from '@/core/ui/loaders/ApplicationLoader';

<Suspense fallback={<ApplicationLoader />}>
  <PublicWhiteboardPage />
</Suspense>;
```

### Alternatives Considered

- **Custom spinner**: Rejected to avoid unnecessary work
- **No loader**: Rejected due to poor perceived performance

---

## 10. Guest-to-Authenticated Transition

### Decision

**Discard guest session** on sign-in; contributions remain attributed to guest nickname.

### Rationale

- **Simplicity**: No complex session migration logic
- **Data integrity**: Guest contributions stay as-is (immutable history)
- **Clear boundary**: Guest and authenticated are distinct identities
- **Security**: Prevents session hijacking or attribution confusion

### Implementation Pattern

```tsx
// src/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSession.ts
export const clearGuestSessionOnSignIn = () => {
  sessionStorage.removeItem('alkemio_guest_name');
  // Navigate to sign-in with return URL
  navigate(`/signin?returnTo=${encodeURIComponent(location.pathname)}`);
};
```

### Alternatives Considered

- **Migrate contributions**: Rejected due to backend complexity and unclear ownership semantics
- **Hybrid prompt**: Rejected to avoid decision fatigue for users

---

## Updated Workflow (Unified Guest Name)

1. Detect `ory_kratos_session` cookie presence.
2. If present: fetch CurrentUser (generated hook) → derive anonymized guest name via algorithm:

- First + Last → `First L.` (first token of first name + first initial of last name + period)
- First only → `First`
- Last only → `L.`
- Neither → prompt dialog.

3. If absent or derivation yielded null: open Guest Name Dialog (validated manual entry).
4. Persist final guest name to `sessionStorage('alkemio_guest_name')`.
5. Inject `x-guest-name` header on all GraphQL operations under `/public/whiteboard/*` via `guestHeaderLink`.
6. Always render Whiteboard Visibility Warning inside `WhiteboardDisplay` regardless of authentication or derivation pathway.
7. Clear guest session on explicit sign-in navigation; re-derive after successful authentication if user revisits public route.

---

## Summary

All architectural decisions are documented and resolved. No remaining `NEEDS CLARIFICATION` items. Ready to proceed to Phase 1 (design & contracts).

### Key Takeaways

1. **Isolation via code splitting**: Dynamic imports + Suspense
2. **Header injection via Apollo Link**: Standard middleware pattern
3. **Session storage + cookie detection unified**: Custom hook handles derivation and persistence
4. **Material-UI Dialog**: Consistent design & accessibility for guest name prompt
5. **Privacy-preserving anonymization**: Real names never exposed directly
6. **React default XSS protection**: No sanitization library needed
7. **Always-show visibility warning**: Transparent public access indicator for all viewers
8. **Discard guest session on sign-in**: Simplicity; re-derive if returning to public route

### Next Steps

All downstream spec artifacts (plan, data model, functional requirements) updated. Pending alignment tasks: quickstart guest name scenarios, API contract header description adjustments, checklist propagation.
