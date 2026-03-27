# CRD Migration Pattern

This document describes the repeatable pattern for migrating a page from MUI to CRD (shadcn/ui + Tailwind).

## Architecture

```
TopLevelRoutes.tsx
  ├── [MUI routes] → TopLevelLayout (existing MUI header/nav/footer)
  └── [CRD routes] → CrdLayoutWrapper → CrdLayout (CRD header/footer)
                                          └── <Outlet /> → Page component
```

## Steps to Migrate a Page

### 1. Port Required Primitives

If the page uses shadcn/ui primitives not yet in `src/crd/primitives/`, port them from `prototype/src/app/components/ui/`. Update `cn()` import to `@/crd/lib/utils`.

### 2. Build CRD Components

Create presentational components in `src/crd/components/<domain>/`. Rules:
- Zero MUI imports
- Props are plain TypeScript (no GraphQL types)
- Use `useTranslation()` with `crd.` prefix for UI text
- Use `<a href>` for navigation (no `react-router-dom`)
- Icons from `lucide-react` only

### 3. Create Data Mapper

Create `src/main/topLevelPages/<page>/dataMapper.ts` that maps GraphQL types to CRD component props. This is the **only file** where GraphQL types meet CRD view types.

### 4. Create CRD View Wrapper

Create `src/main/topLevelPages/<page>/PageCrdView.tsx` that:
- Imports the CRD component from `src/crd/`
- Calls the data mapper to transform props
- Maps filter enums between MUI and CRD types

### 5. Modify the Page Component

Strip the `TopLevelPageLayout` wrapper from the page. The CRD layout shell (header/footer) is provided by `CrdLayoutWrapper` at the route level. The page now renders just the data hook + CRD view.

### 6. Wire the Route

In `TopLevelRoutes.tsx`, move the route under the `<Route element={<CrdLayoutWrapper />}>` group.

### 7. Add i18n Keys

Add translation keys under `crd.` namespace in `src/core/i18n/en/translation.en.json`.

## File Layout Example

```
src/crd/components/space/
├── SpaceCard.tsx          # CRD presentational component
└── SpaceExplorer.tsx      # CRD page-level composite

src/main/topLevelPages/topLevelSpaces/
├── SpaceExplorerPage.tsx       # Page (hooks + CRD view, no MUI layout)
├── SpaceExplorerCrdView.tsx    # Maps GraphQL data → CRD component props
├── spaceCardDataMapper.ts      # Pure mapper functions
├── SpaceExplorerView.tsx       # Old MUI view (kept, not imported)
└── useSpaceExplorer.ts         # Data hook (unchanged)
```
