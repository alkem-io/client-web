# Quickstart: CRD Dashboard Page Migration

**Branch**: `041-crd-dashboard-page` | **Date**: 2026-04-03

## Prerequisites

- Node >= 22.0.0 (pinned via Volta to 24.14.0)
- pnpm >= 10.17.1
- CRD infrastructure already set up from 039 (Tailwind, CrdLayoutWrapper, primitives, etc.)
- Backend running at localhost:3000 (for GraphQL data in dev)

## Quick Start

```bash
# Switch to feature branch
git checkout 041-crd-dashboard-page

# Install dependencies
pnpm install

# Start dev server
pnpm start
# → localhost:3001

# Enable CRD toggle in browser console
localStorage.setItem('alkemio-crd-enabled', 'true');
location.reload();

# Navigate to /home to see the CRD dashboard
```

## Development Workflow

### 1. Port Primitives First

Port `switch.tsx` and `scroll-area.tsx` from prototype before building components that depend on them:

```bash
# Source files:
# prototype/src/app/components/ui/switch.tsx
# prototype/src/app/components/ui/scroll-area.tsx

# Target:
# src/crd/primitives/switch.tsx
# src/crd/primitives/scroll-area.tsx
```

After porting, update `cn()` import to `@/crd/lib/utils` and verify zero MUI imports.

### 2. Create i18n Namespace

Create `src/crd/i18n/dashboard/dashboard.en.json` with all keys, then translations for other languages.

Register in `src/core/i18n/config.ts`:
```typescript
// In crdNamespaceImports:
'crd-dashboard': {
  en: () => import('@/crd/i18n/dashboard/dashboard.en.json'),
  nl: () => import('@/crd/i18n/dashboard/dashboard.nl.json'),
  // ... other languages
},
```

### 3. Build CRD Components Bottom-Up

Start with leaf components (ActivityItem, SidebarResourceItem, CompactSpaceCard) and work up to composites (ActivityFeed, DashboardSidebar, RecentSpaces) and then page-level (DashboardLayout).

### 4. Build Integration Layer

Create `src/main/crdPages/dashboard/` with:
- `dashboardDataMappers.ts` — GraphQL → CRD prop type mappers
- `useDashboardDialogs.ts` — dialog state management
- `useDashboardSidebar.ts` — sidebar data aggregation
- Sub-view components (DashboardWithMemberships, etc.)
- `DashboardPage.tsx` — main page entry

### 5. Wire Route

In `TopLevelRoutes.tsx`, add the CRD conditional route for `/home` following the same pattern as `/spaces`.

## Key Patterns

### CRD Component Pattern
```typescript
// src/crd/components/dashboard/ActivityItem.tsx
import { cn } from '@/crd/lib/utils';
import { Avatar } from '@/crd/primitives/avatar';

type ActivityItemProps = {
  avatarUrl?: string;
  avatarInitials: string;
  userName: string;
  actionText: string;
  targetName: string;
  targetHref?: string;
  timestamp: string;
  className?: string;
};

export function ActivityItem({ ... }: ActivityItemProps) {
  // Pure presentational — no hooks except useTranslation('crd-dashboard')
  return (...);
}
```

### Data Mapper Pattern
```typescript
// src/main/crdPages/dashboard/dashboardDataMappers.ts
import type { CompactSpaceCardData } from '@/crd/components/dashboard/CompactSpaceCard';

export function mapRecentSpacesToCompactCards(
  recentSpaces: RecentSpace[],
  homeSpace: HomeSpace | undefined,
  homeSpaceId: string | undefined
): CompactSpaceCardData[] {
  // Map GraphQL types to plain CRD types
  return recentSpaces.map(space => ({
    id: space.id,
    name: space.about.profile.displayName,
    href: space.about.profile.url,
    bannerUrl: space.about.profile.cardBanner?.uri,
    isPrivate: !space.about.isContentPublic,
    isHomeSpace: space.id === homeSpaceId,
  }));
}
```

### Integration Page Pattern
```typescript
// src/main/crdPages/dashboard/DashboardPage.tsx
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { DashboardWithMemberships } from './DashboardWithMemberships';
import { DashboardWithoutMemberships } from './DashboardWithoutMemberships';
import { DashboardUnauthenticated } from './DashboardUnauthenticated';

export default function DashboardPage() {
  const { isAuthenticated, loading: userLoading } = useCurrentUserContext();
  // ... membership check
  // Render correct sub-view based on auth + membership state
}
```

## Testing

```bash
# Run all tests
pnpm vitest run

# Run linting
pnpm lint

# Type checking is included in lint
```

### Manual Testing Checklist

1. Enable CRD toggle → navigate to /home
2. Test as authenticated user with memberships (main view)
3. Test Activity View toggle (activity ↔ spaces)
4. Test filter dropdowns in activity feeds
5. Click "Show more" → verify dialogs open
6. Click sidebar menu items → verify actions
7. Test as user without memberships
8. Test as unauthenticated user
9. Disable CRD toggle → verify MUI dashboard unchanged
10. Test responsive: resize to mobile width
11. Test `?dialog=invitations` URL param

## File Reference

See [plan.md](plan.md) → "Key Files Reference" section for complete file listings of:
- Existing MUI components (behavior reference)
- Existing CRD components (to reuse)
- Prototype reference files (design reference)
