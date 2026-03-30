# CRD Migration Pattern

This document describes the repeatable pattern for migrating a page from MUI to CRD (shadcn/ui + Tailwind).

## Architecture

```
TopLevelRoutes.tsx
  ├── [MUI routes] → TopLevelLayout (existing MUI header/nav/footer)
  └── [CRD routes] → CrdLayoutWrapper → CrdLayout (CRD header/footer)
                                          └── <Outlet /> → Page component
```

Page-level integration for CRD-migrated pages lives in `src/main/crdPages/<pageName>/`. This is separate from `src/main/topLevelPages/` which retains the original MUI page implementations. Files in `src/main/crdPages/` MUST NOT import from `@mui/*` or `@emotion/*`.

## Steps to Migrate a Page

### 1. Port Required Primitives

If the page uses shadcn/ui primitives not yet in `src/crd/primitives/`, port them from `prototype/src/app/components/ui/`. Update `cn()` import to `@/crd/lib/utils`.

### 2. Build CRD Components

Create presentational components in `src/crd/components/<domain>/`. Rules:
- Zero MUI imports
- Props are plain TypeScript (no GraphQL types)
- Use `useTranslation('crd')` for **design-system** text only (UI labels like "Filters", "Load More"). Business-domain text must be passed as props.
- All `on*` event handlers must be received as props — components never implement behavior (navigation, API calls, state changes) internally
- Use `<a href>` for navigation links (no `react-router-dom`, no `window.location.href`)
- Icons from `lucide-react` only
- Styling via Tailwind classes + `cn()` only — no inline `style` props except for truly dynamic values (user-provided colors, `color-mix()` with no Tailwind equivalent)
- WCAG 2.1 AA: icon-only buttons need `aria-label`, decorative icons need `aria-hidden="true"`, interactive elements need visible `focus-visible:ring` indicators, clickable elements must be `<a>` or `<button>` (not clickable `<span>`/`<div>`), lists use `role="list"`/`role="listitem"`, loading states use `role="status"` with `aria-label`, all user-visible text must use `t()` (no hardcoded strings in JSX)

### 3. Create Data Mapper

Create `src/main/crdPages/<page>/dataMapper.ts` that maps GraphQL types to CRD component props. This is the **only file** where GraphQL types meet CRD view types.

### 4. Create CRD View Wrapper

Create `src/main/crdPages/<page>/PageCrdView.tsx` that:
- Imports the CRD component from `src/crd/`
- Calls the data mapper to transform props
- Maps filter enums between MUI and CRD types

### 5. Create the Page Component

Create a new page component in `src/main/crdPages/<page>/PageDep.tsx` that:
- Calls the existing data hook (can be copied from the MUI page or imported)
- Renders the CRD view wrapper
- Does NOT wrap in `TopLevelPageLayout` — the CRD layout shell (header/footer) is provided by `CrdLayoutWrapper` at the route level

The original MUI page in `src/main/topLevelPages/` stays untouched — it can be removed once the migration is complete.

### 6. Wire the Route (with Lazy Loading)

In `TopLevelRoutes.tsx`, move the route under the `<Route element={<CrdLayoutWrapper />}>` group. Lazy-load the new page using `lazyWithGlobalErrorHandler()`:

```typescript
const MyPage = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/<page>/MyPage'));

// Under CrdLayoutWrapper route group:
<Route path="/<page>" element={
  <WithApmTransaction path="/<page>">
    <Suspense fallback={<Loading />}>
      <MyPage />
    </Suspense>
  </WithApmTransaction>
} />
```

**Lazy loading rules:**
- Page components: always lazy-loaded via `lazyWithGlobalErrorHandler()` + `<Suspense fallback={<Loading />}>`
- Dialogs triggered from CRD: lazy-loaded with `<Suspense fallback={null}>` (e.g., `HelpDialog`)
- `CrdLayoutWrapper` itself: eager (must be available to render the page shell immediately)
- Existing MUI dialogs (Messages, Notifications): already lazy-loaded in `root.tsx`, reuse via context providers — never duplicate
- CRD primitives: bundled with the page chunk (small, no separate vendor chunk needed)

### 7. Add i18n Keys

Add translation keys to all `src/crd/i18n/components.<lang>.json` files (the `crd` namespace). English keys go in `components.en.json`; add translations for `es`, `nl`, `bg`, `de`, `fr`. CRD components use `useTranslation('crd')` — keys are prefixless: `t('spaces.title')`, not `t('crd.spaces.title')`.

## File Layout Example

```
src/crd/components/space/
├── SpaceCard.tsx          # CRD presentational component
└── SpaceExplorer.tsx      # CRD page-level composite

src/main/crdPages/spaces/
├── SpaceExplorerPage.tsx       # Page entry — hook + data mapping + CRD SpaceExplorer
├── spaceCardDataMapper.ts      # Pure mapper functions
├── SpaceExplorerQueries.graphql # GraphQL queries
└── useSpaceExplorer.ts         # Data hook

src/main/topLevelPages/topLevelSpaces/
├── SpaceExplorerPage.tsx       # Old MUI page (kept, no longer routed)
├── SpaceExplorerView.tsx       # Old MUI view (kept, not imported)
└── useSpaceExplorer.ts         # Old data hook (kept for reference)
```
