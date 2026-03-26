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
| `prototype/src/app/pages/BrowseSpacesPage.tsx` | Design reference for /spaces |
| `prototype/src/app/components/space/SpaceCard.tsx` | Design reference for SpaceCard |
| `prototype/src/app/components/ui/` | Primitives source (port from here) |
| `src/main/topLevelPages/topLevelSpaces/SpaceExplorerPage.tsx` | Page entry — swap view import here |
| `src/main/topLevelPages/topLevelSpaces/SpaceExplorerView.tsx` | Existing MUI view (kept but no longer imported) |
| `src/main/topLevelPages/topLevelSpaces/useSpaceExplorer.ts` | Data hook (keep unchanged) |

## Implementation Order

1. **Infrastructure**: Install deps, configure Vite plugin, import CSS
2. **Port primitives**: Copy 7 primitives from prototype to `src/crd/primitives/`
3. **Build CRD SpaceCard**: Port from prototype, replace mock data with props interface
4. **Build CRD SpaceExplorer**: Port page layout from prototype, replace mock data with props
5. **Data mapper**: Write `mapSpaceToCardData()` in the page directory
6. **Wire route**: Modify `SpaceExplorerPage.tsx` to import CRD view instead of MUI view
7. **Verify**: Check responsive behavior, verify zero MUI imports in `src/crd/`, navigate between CRD and MUI pages

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
