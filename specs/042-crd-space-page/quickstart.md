# Quickstart: CRD Space L0 Page Migration

**Branch**: `042-crd-space-page` | **Date**: 2026-04-07

## Prerequisites

- Node 24.14.0 (Volta-pinned)
- pnpm 10.17.1+
- Running Alkemio backend at localhost:3000 (Traefik) / localhost:4000 (GraphQL)
- CRD feature toggle enabled in browser console:
  ```js
  localStorage.setItem('alkemio-crd-enabled', 'true');
  location.reload();
  ```

## Setup

```bash
git checkout 042-crd-space-page
pnpm install
pnpm start  # Dev server on localhost:3001
```

## Development Workflow

### 1. CRD Components (`src/crd/`)

Build presentational components first. Test in the standalone preview app:

```bash
pnpm crd:dev  # Standalone CRD app on localhost:5200
```

Rules:
- Zero imports from `@mui/*`, `@emotion/*`, `@apollo/client`, `@/domain/*`, `@/core/apollo/*`, `@/core/auth/*`, `formik`, `react-router-dom`
- Props are plain TypeScript types (see `data-model.md`)
- Styling: Tailwind + `cn()` from `@/crd/lib/utils`
- Icons: `lucide-react` only
- i18n: `useTranslation('crd-space')` for UI labels
- State: `useState` for visual toggles only (open/close, expanded, active)
- Event handlers: received as props (`onClick`, `onExpand`, `onVote`, etc.)

### 2. Integration Layer (`src/main/crdPages/space/`)

Wire CRD components to app data:

- **Data mappers**: Transform GraphQL types → CRD prop types
- **Hooks**: Compose existing domain hooks (`useSpace`, `useCalloutsSet`, etc.)
- **Connectors**: Render CRD components with mapped data + mutation callbacks

This layer CAN import from `@/domain/*`, `@/core/apollo/*`, `formik`, `react-router-dom`.

### 3. Routing (`TopLevelRoutes.tsx`)

Wire the CRD Space routes alongside MUI:

```typescript
// In TopLevelRoutes.tsx, inside UrlResolverProvider Routes:
{crdEnabled ? (
  <Route element={<CrdLayoutWrapper />}>
    <Route path={`:${nameOfUrl.spaceNameId}/*`} element={<CrdSpaceRoutes />} />
  </Route>
) : (
  <Route path={`:${nameOfUrl.spaceNameId}/*`} element={<SpaceRoutes />} />
)}
```

### 4. i18n

Add translations to `src/crd/i18n/space/space.en.json`:

```json
{
  "banner": { "homeSpace": "Home Space" },
  "tabs": {
    "dashboard": "Dashboard",
    "community": "Community",
    "subspaces": "Subspaces",
    "knowledgeBase": "Knowledge Base"
  },
  "callout": {
    "draft": "Draft",
    "expand": "Show more",
    "collapse": "Show less"
  }
}
```

Register in `src/core/i18n/config.ts`:

```typescript
'crd-space': {
  en: () => import('@/crd/i18n/space/space.en.json'),
  bg: () => import('@/crd/i18n/space/space.bg.json'),
  // ... all 6 languages
},
```

Add types in `@types/i18next.d.ts`:

```typescript
'crd-space': typeof import('./src/crd/i18n/space/space.en.json');
```

## Testing

```bash
pnpm vitest run                    # All tests
pnpm lint                          # TypeScript + Biome + ESLint
```

### Manual Testing Checklist

1. Enable CRD toggle, navigate to any Space
2. Verify: CRD banner, tabs, header, footer — zero MUI elements
3. Verify: Tab names match Innovation Flow configuration
4. Verify: Each tab shows correct content (Dashboard, Community, Subspaces, Custom)
5. Verify: Callout blocks render all 5 framing types
6. Verify: Clicking whiteboard preview opens WhiteboardDialog (MUI portal)
7. Verify: Creating/editing callouts works with form validation
8. Verify: Mobile viewport shows bottom tabs + "More" drawer
9. Verify: No console errors navigating CRD ↔ MUI pages
10. Disable CRD toggle, verify MUI pages still work

## Key Files Reference

| What | Where |
|------|-------|
| CRD components | `src/crd/components/space/`, `src/crd/components/callout/`, `src/crd/components/contribution/` |
| CRD forms | `src/crd/forms/callout/`, `src/crd/forms/contribution/` |
| Integration layer | `src/main/crdPages/space/` |
| Data mappers | `src/main/crdPages/space/dataMappers/` |
| Route toggle | `src/main/routing/TopLevelRoutes.tsx` |
| Feature flag | `src/main/crdPages/useCrdEnabled.ts` |
| i18n translations | `src/crd/i18n/space/` |
| i18n config | `src/core/i18n/config.ts` |
| Type definitions | `@types/i18next.d.ts` |
| CRD conventions | `src/crd/CLAUDE.md` |
| Spec | `specs/042-crd-space-page/spec.md` |
| Plan | `specs/042-crd-space-page/plan.md` |
| Data model | `specs/042-crd-space-page/data-model.md` |
