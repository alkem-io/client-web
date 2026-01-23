# Quickstart: Dynamic Page Title Implementation

**Feature**: 6557-dynamic-page-title
**Date**: 2026-01-22

## Prerequisites

- Node.js 20.x+
- pnpm 10.x+
- Alkemio client-web repository cloned
- Feature branch checked out: `git checkout 6557-dynamic-page-title`

## Quick Setup

```bash
# Install dependencies
pnpm install

# Start dev server (requires backend running)
pnpm start

# Run type checking in watch mode (recommended)
pnpm run ts:watch
```

## Implementation Guide

### Step 1: Create the Hook

Create `src/core/routing/usePageTitle.ts`:

```typescript
import { useEffect } from 'react';

const DEFAULT_SUFFIX = 'Alkemio';
const SEPARATOR = ' | ';

interface UsePageTitleOptions {
  suffix?: string;
  skipSuffix?: boolean;
}

export const usePageTitle = (title: string | undefined, options?: UsePageTitleOptions): void => {
  const { suffix = DEFAULT_SUFFIX, skipSuffix = false } = options ?? {};

  useEffect(() => {
    if (!title || skipSuffix) {
      document.title = title || suffix;
    } else {
      document.title = `${title}${SEPARATOR}${suffix}`;
    }
  }, [title, suffix, skipSuffix]);
};
```

### Step 2: Add i18n Keys

Add to `src/core/i18n/en/translation.en.json` under a new `pages.titles` section:

```json
{
  "pages": {
    "titles": {
      "forum": "Forum",
      "spaces": "Spaces",
      "contributors": "Contributors",
      "templateLibrary": "Template Library",
      "globalAdmin": "Global Administration",
      "admin": "Administration",
      "documentation": "Documentation",
      "signIn": "Sign In",
      "signUp": "Sign Up",
      "notFound": "Page Not Found",
      "restricted": "Access Restricted"
    }
  }
}
```

### Step 3: Integrate with Pages

**Static page example** (ForumPage):

```typescript
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useTranslation } from 'react-i18next';

const ForumPage = () => {
  const { t } = useTranslation();
  usePageTitle(t('pages.titles.forum'));
  // ... rest of component
};
```

**Dynamic page example** (SpacePageLayout):

```typescript
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useSpace } from '@/domain/space/context/useSpace';

const SpacePageLayout = () => {
  const { space } = useSpace();
  usePageTitle(space.about.profile.displayName);
  // ... rest of component
};
```

**Home page** (no suffix):

```typescript
import { usePageTitle } from '@/core/routing/usePageTitle';

const HomePage = () => {
  usePageTitle('Alkemio', { skipSuffix: true });
  // ... rest of component
};
```

## Testing

### Unit Test the Hook

Create `src/core/routing/usePageTitle.test.ts`:

```typescript
import { renderHook } from '@testing-library/react';
import { usePageTitle } from './usePageTitle';

describe('usePageTitle', () => {
  beforeEach(() => {
    document.title = 'Initial Title';
  });

  it('sets title with default suffix', () => {
    renderHook(() => usePageTitle('Test Page'));
    expect(document.title).toBe('Test Page | Alkemio');
  });

  it('sets title without suffix when skipSuffix is true', () => {
    renderHook(() => usePageTitle('Alkemio', { skipSuffix: true }));
    expect(document.title).toBe('Alkemio');
  });

  it('falls back to suffix when title is undefined', () => {
    renderHook(() => usePageTitle(undefined));
    expect(document.title).toBe('Alkemio');
  });
});
```

Run tests:

```bash
pnpm vitest run src/core/routing/usePageTitle.test.ts
```

## Verification Checklist

- [ ] Hook created in `src/core/routing/usePageTitle.ts`
- [ ] i18n keys added to `translation.en.json`
- [ ] Unit tests passing
- [ ] Static pages integrated (Forum, Spaces, Contributors, etc.)
- [ ] Dynamic pages integrated (Space, Subspace, User, Org, VC, Pack)
- [ ] Home page shows just "Alkemio"
- [ ] Error pages show appropriate titles
- [ ] TypeScript compiles without errors (`pnpm run ts:watch`)
- [ ] Lint passes (`pnpm lint`)

## Common Issues

### Title not updating

- Ensure `usePageTitle` is called in the correct component (not a child that re-renders independently)
- Check that the entity data is available (not undefined during loading)

### TypeScript errors

- Run `pnpm run codegen` if you see GraphQL-related type errors
- Ensure proper imports from `@/core/routing/usePageTitle`

### Title flashing during navigation

- This is expected behavior during loading states
- The hook falls back to "Alkemio" which provides a clean loading experience
