# CRD Breadcrumbs

## Overview

On CRD pages, breadcrumbs live **in the top nav**, next to the Alkemio logo — not on the page itself. Pages declare their trail with a hook; the nav reads it and renders. The `Header` component itself has no knowledge of what page is loaded.

This decouples the nav from content: the Header stays presentational and just accepts a `breadcrumbs: ReactNode` prop. Coordination happens in a small app-layer context.

## Data flow

```
Page (e.g. CrdSpacePageLayout)
   │  useSetBreadcrumbs([{ label, href?, icon? }, …])
   ▼
BreadcrumbsProvider  ◄──── state held here
   │  useBreadcrumbs() → items[]
   ▼
CrdLayoutConnector
   │  <BreadcrumbsTrail items={items} />
   ▼
CrdLayout → Header (breadcrumbs prop)
   │
   ▼
Rendered next to the logo, hidden below `md`
```

## Files

| File | Role |
|------|------|
| `src/crd/primitives/breadcrumb.tsx` | shadcn primitives: `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator` |
| `src/crd/components/common/BreadcrumbsTrail.tsx` | items-based renderer; composes the primitives from a `BreadcrumbTrailItem[]` |
| `src/main/ui/breadcrumbs/BreadcrumbsContext.tsx` | `BreadcrumbsProvider`, `useBreadcrumbs`, `useSetBreadcrumbs` |
| `src/crd/layouts/Header.tsx` | renders `breadcrumbs?: ReactNode` next to the logo |
| `src/main/ui/layout/CrdLayoutWrapper.tsx` | mounts the provider and wires the trail into the layout |

## Adding breadcrumbs to a CRD page

Call `useSetBreadcrumbs` once in your page/layout component. The hook publishes the trail on mount and clears it on unmount.

```tsx
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import { Layers } from 'lucide-react';

export default function MyPage() {
  const { space } = useSpace();

  const items: BreadcrumbTrailItem[] = [
    { label: space.about.profile.displayName, href: space.about.profile.url, icon: Layers },
    { label: 'Settings', href: `${space.about.profile.url}/settings` },
    { label: 'About' },
  ];
  useSetBreadcrumbs(items);

  return <MyPageContent />;
}
```

### Item shape

```ts
type BreadcrumbTrailItem = {
  label: string;          // visible text
  href?: string;          // omit on the terminal (current-page) item
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
};
```

- The **last** item renders as the current page (bold, no link), regardless of `href`.
- Non-terminal items with `href` render as links; without `href`, as plain text.
- `icon` is optional; use `lucide-react` icons.

### Hook placement

Call `useSetBreadcrumbs` **before any early returns** in the component. React's rules of hooks require consistent hook order between renders. Pass `[]` during loading states if you don't have data yet — the trail will update once data arrives.

```tsx
// ✅ Good — hook always called
const items = isReady ? [...] : [];
useSetBreadcrumbs(items);
if (!isReady) return <LoadingSpinner />;

// ❌ Bad — hook skipped when loading
if (!isReady) return <LoadingSpinner />;
useSetBreadcrumbs([...]);
```

### Clearing

Navigating away automatically clears the trail — the hook's effect cleanup runs on unmount. If a page conditionally shows breadcrumbs (e.g. only on `/settings`), pass `[]` in the non-settings branch; the effect will publish the empty list.

## What goes where

| Concern | Where |
|---------|-------|
| Declaring a page's trail | Page/layout component via `useSetBreadcrumbs` |
| Dynamic labels (space names, entity titles) | In the page; pull from Apollo / domain hooks and pass as `label` |
| i18n for generic segments ("Settings", "About") | Page calls `t(...)` and passes the result as `label` |
| Visual rendering | `BreadcrumbsTrail` + the `breadcrumb` primitives |
| Placement in the chrome | `Header.tsx` (left of the icon cluster, after a divider) |

CRD primitives and `BreadcrumbsTrail` never know about pages, routing, or GraphQL — they take plain `items` props. All business logic stays in the caller.

## Responsive behavior

The trail is hidden below the `md` breakpoint (`hidden md:inline-flex` on the nav wrapper). On phones, only the logo shows; the page header / title below takes over as the "where am I" cue. This keeps the top bar from overflowing on narrow viewports.

## Accessibility

- The primitive renders a `<nav aria-label="breadcrumb">` landmark with an `<ol>` inside.
- Separators use `role="presentation" aria-hidden="true"` (not announced).
- The terminal segment uses `aria-current="page"` (no `role="link"` — it is not interactive).
- Icons decoratively paired with labels must have `aria-hidden="true"`.

## Rules

- **One setter at a time.** Only one component should publish breadcrumbs per route. Nested `useSetBreadcrumbs` calls clobber each other (last effect wins).
- **Hook before early returns.** Always call `useSetBreadcrumbs` at the top of the component, before any conditional `return`.
- **No hardcoded page text.** All segment labels must come from `t()` (for generic words like "Settings") or from domain data (for names). No literal strings in JSX like `{ label: 'Settings' }` without `t()`.
- **Keep it shallow.** A trail of 2–3 segments is the sweet spot. Beyond 4, consider whether the information belongs in the page header instead.
- **Dev-only: React Compiler stability.** The provider de-duplicates identical items via shallow content equality, so passing a fresh array literal each render is safe — no need for `useMemo` in callers (and it's forbidden by project rules anyway).
