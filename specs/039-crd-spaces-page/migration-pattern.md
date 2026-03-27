# CRD Migration Pattern

This document describes the repeatable pattern for migrating a page from MUI to CRD (shadcn/ui + Tailwind).

## Architecture

```
TopLevelRoutes.tsx
  ├── [MUI routes] → TopLevelLayout (existing MUI header/nav/footer)
  └── [CRD routes] → CrdLayoutWrapper → CrdLayout (CRD header/footer)
                                          └── <Outlet /> → Page component
```

Page-level integration for CRD-migrated pages lives in `src/new-ui/topLevelPages/<pageName>/`. This is separate from `src/main/topLevelPages/` which retains the original MUI page implementations. Files in `src/new-ui/` MUST NOT import from `@mui/*` or `@emotion/*`.

## Steps to Migrate a Page

### 1. Port Required Primitives

If the page uses shadcn/ui primitives not yet in `src/crd/primitives/`, port them from `prototype/src/app/components/ui/`. Update `cn()` import to `@/crd/lib/utils`.

### 2. Build CRD Components

Create presentational components in `src/crd/components/<domain>/`. Rules:
- Zero MUI imports
- Props are plain TypeScript (no GraphQL types)
- Use `useTranslation('crd')` for UI text (keys are prefixless: `t('spaces.title')`)
- Use `<a href>` for navigation (no `react-router-dom`)
- Icons from `lucide-react` only

### 3. Create Data Mapper

Create `src/new-ui/topLevelPages/<page>/dataMapper.ts` that maps GraphQL types to CRD component props. This is the **only file** where GraphQL types meet CRD view types.

### 4. Create CRD View Wrapper

Create `src/new-ui/topLevelPages/<page>/PageCrdView.tsx` that:
- Imports the CRD component from `src/crd/`
- Calls the data mapper to transform props
- Maps filter enums between MUI and CRD types

### 5. Create the Page Component

Create a new page component in `src/new-ui/topLevelPages/<page>/PageDep.tsx` that:
- Calls the existing data hook (can be copied from the MUI page or imported)
- Renders the CRD view wrapper
- Does NOT wrap in `TopLevelPageLayout` — the CRD layout shell (header/footer) is provided by `CrdLayoutWrapper` at the route level

The original MUI page in `src/main/topLevelPages/` stays untouched — it can be removed once the migration is complete.

### 6. Wire the Route

In `TopLevelRoutes.tsx`, move the route under the `<Route element={<CrdLayoutWrapper />}>` group. Lazy-load the new page from `@/new-ui/topLevelPages/<page>/PageDep`.

### 7. Add i18n Keys

Add translation keys to `src/crd/i18n/en.json` (the `crd` namespace). CRD components use `useTranslation('crd')` — keys are prefixless: `t('spaces.title')`, not `t('crd.spaces.title')`.

## File Layout Example

```
src/crd/components/space/
├── SpaceCard.tsx          # CRD presentational component
└── SpaceExplorer.tsx      # CRD page-level composite

src/new-ui/topLevelPages/spaces/
├── SpaceExplorerPage.tsx       # Page entry — hook + data mapping + CRD SpaceExplorer
├── spaceCardDataMapper.ts      # Pure mapper functions
├── SpaceExplorerQueries.graphql # GraphQL queries
└── useSpaceExplorer.ts         # Data hook

src/main/topLevelPages/topLevelSpaces/
├── SpaceExplorerPage.tsx       # Old MUI page (kept, no longer routed)
├── SpaceExplorerView.tsx       # Old MUI view (kept, not imported)
└── useSpaceExplorer.ts         # Old data hook (kept for reference)
```
