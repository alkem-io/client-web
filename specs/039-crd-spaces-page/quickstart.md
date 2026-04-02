# Quickstart: CRD Spaces Page Migration

**Branch**: `039-crd-spaces-page`

## Prerequisites

- Node >= 22.0.0, pnpm >= 10.17.1
- Backend running at localhost:3000 (for GraphQL data on the /spaces page)
- Familiarity with the prototype at `prototype/src/app/pages/BrowseSpacesPage.tsx`

## Setup

### 1. Install missing dependencies

```bash
pnpm add -D @tailwindcss/vite tailwindcss class-variance-authority
pnpm add lucide-react @radix-ui/react-slot @radix-ui/react-select @radix-ui/react-dropdown-menu @radix-ui/react-avatar
```

### 2. Add Tailwind Vite plugin

In `vite.config.mjs`, add:

```javascript
import tailwindcss from '@tailwindcss/vite';

// In the plugins array:
tailwindcss(),
```

### 3. Import CRD styles

In `src/index.tsx` (or `src/root.tsx`), add:

```typescript
import '@/crd/styles/crd.css';
```

### 4. Verify build

```bash
pnpm build
```

The build should succeed with no regressions — existing MUI pages must render identically.

## Key Files to Know

| File | Role |
| --- | --- |
| `src/crd/CLAUDE.md` | Golden rules for CRD components |
| `src/crd/styles/theme.css` | Design tokens (CSS custom properties) |
| `src/crd/styles/crd.css` | Tailwind entry point with `.crd-root` scoping |
| `src/crd/lib/utils.ts` | `cn()` utility |
| `prototype/src/app/layouts/MainLayout.tsx` | Design reference for CRD page shell |
| `prototype/src/app/components/layout/Header.tsx` | Design reference for CRD header |
| `prototype/src/app/components/layout/Footer.tsx` | Design reference for CRD footer |
| `prototype/src/app/pages/BrowseSpacesPage.tsx` | Design reference for /spaces content |
| `prototype/src/app/components/space/SpaceCard.tsx` | Design reference for SpaceCard |
| `prototype/src/app/components/ui/` | Primitives source (port from here) |
| `src/main/routing/TopLevelRoutes.tsx` | Route config — CRD routes wrapped in CrdLayoutWrapper |
| `src/main/ui/layout/CrdLayoutWrapper.tsx` | Smart container connecting CrdLayout to app data |
| `src/main/topLevelPages/topLevelSpaces/SpaceExplorerPage.tsx` | Page entry — no longer wraps in TopLevelPageLayout |
| `src/main/topLevelPages/topLevelSpaces/SpaceExplorerView.tsx` | Existing MUI view (kept but no longer imported) |
| `src/main/topLevelPages/topLevelSpaces/useSpaceExplorer.ts` | Data hook (keep unchanged) |

## Implementation Order

1. **Infrastructure**: Install deps, configure Vite plugin, import CSS — DONE
2. **Port primitives**: Copy 7 primitives from prototype to `src/crd/primitives/`
3. **Build CRD layout shell**: Port Header, Footer, CrdLayout from prototype to `src/crd/layouts/`
4. **Build CrdLayoutWrapper**: Smart container in `src/main/` that connects CrdLayout to auth/user data
5. **Wire CRD routes**: Wrap `/spaces` in CrdLayoutWrapper in TopLevelRoutes.tsx
6. **VALIDATE**: Check that /spaces renders CRD shell, other pages render MUI shell
7. **Build CRD SpaceCard**: Port from prototype, replace mock data with props interface
8. **Build CRD SpaceExplorer**: Port page layout from prototype, replace mock data with props
9. **Data mapper**: Write `mapSpaceToCardData()` in the page directory
10. **Replace placeholder**: Wire real SpaceExplorer into SpaceExplorerCrdView
11. **Verify**: Check responsive behavior, verify zero MUI imports in `src/crd/`, navigate between CRD and MUI pages

## Verification Checklist

```bash
# No MUI imports in CRD
grep -r "@mui" src/crd/
# Should return nothing

# Build succeeds
pnpm build

# Type check passes
pnpm lint

# Tests pass
pnpm vitest run

# Dev server shows CRD /spaces page
pnpm start
# Navigate to /spaces — should render with new design
# Navigate to other pages — MUI pages should be unaffected
```
