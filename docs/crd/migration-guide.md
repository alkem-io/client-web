# Migrating a Page from MUI to CRD

## What is CRD?

CRD (Client Re-Design) is the new design system replacing MUI. It's built on shadcn/ui + Tailwind CSS + Radix UI. The migration is incremental — MUI pages and CRD pages coexist, and the split happens at the route level.

The prototype in `prototype/` (generated from Figma Make) is the design reference. CRD components are production-ready versions of prototype components, with i18n, accessibility, and real data instead of mocks.

## Architecture at a Glance

```
TopLevelRoutes.tsx
  ├── MUI routes  → TopLevelLayout (existing MUI header/footer)
  └── CRD routes  → CrdLayoutWrapper → CrdLayout (CRD header/footer)
       (gated by       └── <Outlet /> → Your page
        localStorage
        toggle)
```

CRD pages get a completely different shell — CRD header, CRD footer, Tailwind styling. MUI pages are untouched.

During migration, CRD routes are gated behind a **localStorage toggle** (`alkemio-crd-enabled`, default OFF). Deployed environments always render the old MUI pages. Developers and QA opt in locally.

## Feature Toggle

The toggle lives in `src/main/crdPages/useCrdEnabled.ts` and is used in `TopLevelRoutes.tsx` to conditionally render CRD or MUI pages.

**Enable CRD pages** (browser console):
```js
localStorage.setItem('alkemio-crd-enabled', 'true');
location.reload();
```

**Disable CRD pages** (back to MUI):
```js
localStorage.removeItem('alkemio-crd-enabled');
location.reload();
```

Both page versions are lazy-loaded — the unused chunk is never fetched, so there is no bundle penalty.

When migration is complete and all CRD pages are validated, remove the toggle: delete `useCrdEnabled.ts`, remove conditional routing in `TopLevelRoutes.tsx`, delete old MUI page files from `src/main/topLevelPages/`.

## The Three Layers

Every CRD page has three distinct layers. Understanding the boundary between them is the most important concept.

### 1. CRD Components (`src/crd/`)

Pure presentational components. They:
- Receive all data as **props** (plain TypeScript, never GraphQL types)
- Receive all behavior as **callback props** (`onClick`, `onSubmit`, etc.)
- Use **Tailwind** for styling, **lucide-react** for icons
- Use `useTranslation('crd-<feature>')` for UI labels
- Know nothing about GraphQL, routing, auth, or the host app

Think of them as a component library that could be used by a completely different application.

### 2. Integration Layer (`src/main/crdPages/<page>/`)

The glue between the app and CRD components. This layer:
- Calls data hooks (GraphQL queries)
- Maps GraphQL types to CRD component props via a **data mapper**
- Renders CRD components with the mapped data
- Must NOT import from `@mui/*` or `@emotion/*`

### 3. Route Wiring (`TopLevelRoutes.tsx`)

Connects the URL to the page component, wrapped in `CrdLayoutWrapper` for the CRD shell.

## Step-by-Step Migration

### Step 1: Port Primitives

Check if the page needs shadcn/ui primitives not yet in `src/crd/primitives/`. If so, port them from `prototype/src/app/components/ui/`.

- Update the `cn()` import to `@/crd/lib/utils`
- Verify zero MUI imports

### Step 2: Build CRD Components

Create presentational components in `src/crd/components/<domain>/`.

**Hard rules:**
- Zero `@mui/*` imports
- Props are plain TypeScript (never `CalloutModelLightExtended` or similar)
- All `on*` handlers are props — the component never navigates, calls APIs, or changes app state
- Use `<a href>` for links, not `react-router-dom`
- Icons from `lucide-react` only
- All text uses `t()` — no hardcoded strings
- WCAG 2.1 AA: interactive elements are `<a>`/`<button>`, icon buttons have `aria-label`, focus indicators are visible

**Porting from prototype:**
The prototype uses hardcoded data and inline styles. When porting:
- Replace mock data with props
- Convert inline styles to Tailwind classes (see conversion table in `src/crd/CLAUDE.md`)
- Add i18n via `useTranslation('crd-<feature>')`
- Add accessibility attributes

### Step 3: Create the Data Mapper

Create `src/main/crdPages/<page>/dataMapper.ts`. This is the **only file** where GraphQL types meet CRD prop types.

```typescript
// Example: maps GraphQL space data to SpaceCardData
export function mapSpaceToCardData(space: SpaceWithParent): SpaceCardData {
  return {
    id: space.id,
    name: space.about.profile.displayName,
    description: space.about.profile.tagline ?? '',
    href: space.about.profile.url,
    isPrivate: !space.about.isContentPublic,
    // ... map all fields
  };
}
```

### Step 4: Create the Page Component

Create `src/main/crdPages/<page>/Page.tsx`:

```typescript
const MyPage = () => {
  const { data, loading } = useMyDataHook();
  const mappedData = mapToCardData(data);

  return <MyCrdComponent items={mappedData} loading={loading} />;
};
```

The data hook can be imported from the existing MUI page or copied — the GraphQL layer is shared.

### Step 5: Wire the Route (with Feature Toggle)

In `TopLevelRoutes.tsx`, add both lazy imports and a conditional route based on the toggle:

```typescript
// CRD (new) version
const CrdMyPage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/myPage/MyPage')
);
// MUI (old) version — stays until migration is validated
const MuiMyPage = lazyWithGlobalErrorHandler(
  () => import('@/main/topLevelPages/myPage/MyPage')
);
```

Then in the JSX, add a conditional block (the `crdEnabled` value comes from `useCrdEnabled()` already called in the component):

```tsx
{crdEnabled ? (
  <Route element={<NonIdentity><CrdLayoutWrapper /></NonIdentity>}>
    <Route path="/my-page" element={
      <WithApmTransaction path="/my-page">
        <Suspense fallback={<Loading />}><CrdMyPage /></Suspense>
      </WithApmTransaction>
    } />
  </Route>
) : (
  <Route path="/my-page" element={
    <NonIdentity>
      <WithApmTransaction path="/my-page">
        <Suspense fallback={<Loading />}><MuiMyPage /></Suspense>
      </WithApmTransaction>
    </NonIdentity>
  } />
)}
```

The old MUI page files stay in `src/main/topLevelPages/` and are the default. The CRD version only renders when the toggle is on.

### Step 6: Add Translations

See [translations.md](./translations.md) for the full guide. Short version:

1. Create `src/crd/i18n/<feature>.en.json` (+ other languages)
2. Register namespace in `src/core/i18n/config.ts`
3. Register types in `@types/i18next.d.ts`
4. Use `useTranslation('crd-<feature>')` in components

## Key Considerations

### CSS Isolation

Tailwind is loaded globally but scoped via `.crd-root` — MUI pages outside this scope are unaffected. CRD pages must never import MUI, ensuring no MUI CSS is loaded for CRD routes.

### Existing MUI Dialogs

Some app-wide features (Messages, Notifications) are MUI dialogs rendered in `root.tsx`. CRD pages trigger them via callback props (`onMessagesClick`, `onNotificationsClick`) — the CRD component doesn't know they're MUI under the hood.

### Data Hooks Are Shared

The GraphQL data layer doesn't change. Existing hooks from MUI pages can be reused directly. Only the view layer is replaced.

### Standalone Preview

Run `pnpm crd:dev` to see CRD components with mock data on `localhost:5200`. No backend needed. Useful for iterating on design without the full app running.

### Don't Over-Migrate

Only migrate what's asked. The existing MUI page continues to work and is the default (toggle OFF). CRD is an alternative gated behind the toggle, not a replacement that needs to happen all at once.

### Old MUI Files Stay in the Codebase

When migrating a page, **do not delete** the old MUI page files from `src/main/topLevelPages/`. They remain as the default rendering path until the toggle is removed. Both versions coexist — lazy loading ensures only the active version's chunk is fetched.

## File Layout Example

```
src/crd/components/space/
├── SpaceCard.tsx              # CRD presentational component
└── SpaceExplorer.tsx          # CRD composite (search, filters, card grid)

src/crd/i18n/
├── layout/                    # Header/footer translations
│   └── layout.en.json (+ .es, .nl, .bg, .de, .fr)
└── exploreSpaces/             # Space explorer translations
    └── exploreSpaces.en.json (+ .es, .nl, .bg, .de, .fr)

src/main/crdPages/
├── useCrdEnabled.ts           # Feature toggle hook (localStorage, default OFF)
└── spaces/
    ├── SpaceExplorerPage.tsx      # CRD page component (calls hook, renders CRD)
    ├── spaceCardDataMapper.ts     # GraphQL → CRD prop mapping
    └── useSpaceExplorer.ts        # Data hook (GraphQL queries)

src/main/topLevelPages/topLevelSpaces/   # Old MUI page (rendered when toggle is OFF)
├── SpaceExplorerPage.tsx
├── SpaceExplorerView.tsx
├── useSpaceExplorer.ts
└── useSpaceExplorerViewState.ts
```
