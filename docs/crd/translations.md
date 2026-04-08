# CRD Translations

## Overview

CRD uses **per-feature i18next namespaces**. Each feature gets its own set of translation files, loaded lazily so users only download translations for the pages they visit.

Translation files live in `src/crd/i18n/<feature>/` directories, one per feature. They are managed manually with AI-assisted translations (not Crowdin).

## Namespace Map

| Namespace | Directory | Loaded when | Contains |
|-----------|-----------|-------------|----------|
| `crd-layout` | `i18n/layout/` | App starts (eager for EN) | Header nav, footer links, menu items |
| `crd-common` | `i18n/common/` | On demand (lazy) | Shared strings: "Space", "OK", "Cancel", "Save", etc. |
| `crd-exploreSpaces` | `i18n/exploreSpaces/` | User visits /spaces (lazy) | Space explorer labels, filters, cards |

Supported languages: `en`, `nl`, `es`, `bg`, `de`, `fr`.

## How Components Use Translations

### Single namespace

Most components only need their own feature namespace:

```tsx
// Layout components (Header, Footer)
const { t } = useTranslation('crd-layout');
<button>{t('header.search')}</button>

// Feature components (SpaceExplorer, SpaceCard)
const { t } = useTranslation('crd-exploreSpaces');
<button>{t('spaces.loadMore')}</button>
```

### Multiple namespaces (feature + common)

When a component needs shared strings from `crd-common` alongside its feature strings, pass an array. The first namespace is the default — its keys need no prefix. Other namespaces require a `namespace:key` prefix:

```tsx
const { t } = useTranslation(['crd-exploreSpaces', 'crd-common']);

// Feature-specific keys — no prefix needed (first namespace is default)
t('spaces.filters')        // → "Filters" (from crd-exploreSpaces)
t('spaces.loadMore')       // → "Load More" (from crd-exploreSpaces)

// Common keys — prefix with namespace
t('crd-common:save')       // → "Save" (from crd-common)
t('crd-common:cancel')     // → "Cancel" (from crd-common)
t('crd-common:space')      // → "Space" (from crd-common)
```

Both namespaces are lazy-loaded automatically when the component mounts. TypeScript autocomplete works across both.

Keys are nested in the JSON but referenced with dot notation: `t('spaces.filters')` reads `{ "spaces": { "filters": "Filters" } }`.

## What Goes Where

| Text type | Example | Where it lives |
|-----------|---------|----------------|
| Reusable labels | "Space", "OK", "Cancel", "Save", "Private" | `crd-common` |
| Feature-specific labels | "Filters", "Load More", "Sort by" | Feature namespace (e.g., `crd-exploreSpaces`) |
| Page titles | "Explore Spaces" | Feature namespace |
| Business data | Space names, user names | GraphQL (passed as props) |
| App config | Language names, nav URLs | Main `translation` namespace (passed as props) |

**When to use `crd-common`:** If a string appears in 2+ features and isn't specific to any one page. "Space", "OK", "Cancel", "Private", "Public" are good candidates. "Load More" might seem generic but is fine in a feature namespace until it's actually reused.

## Adding a Translation Key to an Existing Feature

1. Add the key to the English file (e.g., `src/crd/i18n/exploreSpaces/exploreSpaces.en.json`)
2. Add the translated key to all other language files (`es`, `nl`, `bg`, `de`, `fr`)
3. Use it in the component: `t('spaces.newKey')`

That's it. No config changes needed.

## Adding a New Feature Namespace

When migrating a new page to CRD:

### 1. Create translation files

Create `src/crd/i18n/<feature>/<feature>.en.json` with your keys:

```json
{
  "dashboard": {
    "welcome": "Welcome back",
    "recentActivity": "Recent Activity"
  }
}
```

Create the same file for all languages: `<feature>.<lang>.json` in the same directory.

### 2. Register the namespace

In `src/core/i18n/config.ts`, add an entry to `crdNamespaceImports`:

```typescript
const crdNamespaceImports = {
  // ... existing namespaces
  'crd-dashboard': {
    en: () => import('@/crd/i18n/dashboard/dashboard.en.json'),
    es: () => import('@/crd/i18n/dashboard/dashboard.es.json'),
    nl: () => import('@/crd/i18n/dashboard/dashboard.nl.json'),
    bg: () => import('@/crd/i18n/dashboard/dashboard.bg.json'),
    de: () => import('@/crd/i18n/dashboard/dashboard.de.json'),
    fr: () => import('@/crd/i18n/dashboard/dashboard.fr.json'),
  },
};
```

### 3. Register the types

In `@types/i18next.d.ts`, add the new namespace:

```typescript
import type crdDashboardTranslation from '@/crd/i18n/dashboard/dashboard.en.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      // ... existing namespaces
      'crd-dashboard': typeof crdDashboardTranslation;
    };
  }
}
```

This gives you autocomplete and compile-time checks for translation keys.

### 4. Use it in components

```tsx
// Feature keys only
const { t } = useTranslation('crd-dashboard');
<h1>{t('dashboard.welcome')}</h1>

// Or with common keys
const { t } = useTranslation(['crd-dashboard', 'crd-common']);
<h1>{t('dashboard.welcome')}</h1>
<button>{t('crd-common:save')}</button>
```

### 5. Update the standalone preview app

In `src/crd/app/main.tsx`, import and register the new namespace so it works in the preview app (`pnpm crd:dev`).

## How Loading Works

- **English layout** translations are bundled with the app (instant).
- **Everything else** is lazy-loaded on demand via dynamic `import()`.
- When a component calls `useTranslation('crd-exploreSpaces')` for the first time, i18next triggers the backend to load that namespace.
- When using multiple namespaces (`useTranslation(['crd-exploreSpaces', 'crd-common'])`), both are loaded in parallel.
- When the user switches language, all currently-loaded namespaces are fetched for the new language automatically.

## Rules

- CRD components must never access `i18n` directly (`i18n.language`, `i18n.changeLanguage()`). Language state comes via props from the app layer.
- All user-visible strings must use `t()` — including `aria-label`, `sr-only` text, and badge labels. No hardcoded strings in JSX.
- Only edit English files in PRs. Other language files are translated manually (AI-assisted) and should be updated alongside.
- Prefer `crd-common` for strings shared across features. Don't duplicate "Cancel", "Save", etc. in every feature namespace.
