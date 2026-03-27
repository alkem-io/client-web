# src/crd — Alkemio UI Layer

This folder contains the application's UI components, built with **shadcn/ui + Tailwind CSS v4 + Radix UI**. It is the replacement for the MUI-based `src/core/ui/` layer.

> **Planned rename**: `src/crd/` will be renamed to `src/design-system/` in a future phase. The `@/crd/` path alias will change to `@/design-system/`. All internal documentation and imports will be updated at that time. Until then, use `@/crd/` for all references.

## Golden Rules

### 1. NO Material UI

**Zero tolerance.** Nothing in `src/crd/` may import from:
- `@mui/material`
- `@mui/icons-material`
- `@mui/system`
- `@mui/x-data-grid`
- `@mui/x-date-pickers`
- `@emotion/react`
- `@emotion/styled`

If you need a component that only exists in MUI today, build it with Radix UI + Tailwind or find a shadcn equivalent.

### 2. NO Business Logic

This folder is **purely presentational**. Components here render UI and manage simple visual state (open/close, hover, expanded/collapsed, active tab). Nothing else.

**Forbidden imports:**
- `@/core/apollo/*` or `@apollo/client` — no GraphQL
- `@/domain/*` — no domain logic
- `@/core/auth/*` — no authentication
- `@/core/state/*` — no global state machines
- `react-router-dom` — no routing (accept `href` or `onClick` as props instead)
- `formik` — no form state management (accept `value`/`onChange` as props)

**Allowed state:** `useState` for visual toggles only (e.g., `isOpen`, `isExpanded`, `activeTab`). If a component needs data from the server, permissions, or routing, that logic belongs in a container component in `src/domain/` or `src/main/`, not here.

### 3. Event Handlers Are Props, Not Internal Logic

CRD components must **never implement behavior** in event handlers. All `onClick`, `onSubmit`, `onChange`, and other `on*` handlers must be received as props from the consumer — the component itself must not decide what happens when a user interacts.

**Allowed:** receiving `href` for links, rendering `<a>` tags with an `href` prop, and calling a prop callback.

**Forbidden:** navigating programmatically (`window.location.href = ...`), calling APIs, dispatching actions, or any logic beyond calling the prop callback.

```typescript
// GOOD — handler is a prop, consumer decides what happens
type SpaceCardProps = {
  href: string;
  onParentClick?: () => void;  // consumer navigates, tracks analytics, etc.
};

// BAD — component decides navigation behavior
onClick={() => { window.location.href = space.parent!.href; }}
```

### 4. Props Are Plain TypeScript

Component props must be plain types — never GraphQL generated types, never MUI types.

```typescript
// GOOD
type PostCardProps = {
  title: string;
  author: { name: string; avatarUrl?: string };
  onEdit?: () => void;
};

// BAD — GraphQL type leaking into UI
type PostCardProps = {
  callout: CalloutModelLightExtended; // NO
};
```

### 5. Styling Is Only Tailwind + Design Tokens

- Use Tailwind utility classes for all styling
- Use `cn()` from `@/crd/lib/utils` for class composition
- Use CSS variables from `@/crd/styles/theme.css` for theming
- **No `sx` prop**, no `styled()`, no `useTheme()`, no inline `style` objects (except for truly dynamic values: user-provided colors, complex CSS functions like `color-mix()`, or gradients with specific stops that have no clean Tailwind equivalent)
- Icons come from `lucide-react`, never `@mui/icons-material`

### 6. No Barrel Exports

Following the project convention: **no `index.ts` barrel files**. Always import from explicit file paths.

```typescript
// GOOD
import { Button } from '@/crd/primitives/button';
import { PostCard } from '@/crd/components/space/PostCard';

// BAD
import { Button } from '@/crd/primitives';
```

---

## Folder Structure

```
src/crd/
├── primitives/          # shadcn/ui atoms — smallest building blocks
├── components/          # Composites — reusable combinations of primitives
├── forms/               # Form-specific components (inputs with labels, field groups)
├── layouts/             # Page-level layout components
├── styles/              # CSS tokens, theme, Tailwind entry point
├── lib/                 # Utilities (cn, etc.)
└── hooks/               # UI-only hooks (useMediaQuery, etc.)
```

### primitives/

Standard shadcn/ui components. These are the atoms — the smallest UI building blocks. Each file exports one component (or a family of related sub-components like Card + CardHeader + CardContent).

**Rules:**
- One component family per file
- Accept `className` prop for composition
- Use `cn()` for merging classes
- Use CVA (class-variance-authority) for variants
- Use `React.forwardRef` or direct prop forwarding
- Zero application knowledge — these are generic UI atoms

**Source:** Ported from `prototype/src/app/components/ui/`. The prototype has 47 primitives; port them as needed.

**Examples:** `button.tsx`, `card.tsx`, `dialog.tsx`, `tabs.tsx`, `avatar.tsx`, `input.tsx`, `badge.tsx`, `skeleton.tsx`

### components/

Composites — reusable UI components built from primitives. These know about Alkemio's visual patterns but NOT about its data model.

**Rules:**
- Import only from `@/crd/primitives/`, `@/crd/components/` (peer composites), `@/crd/lib/`, `@/crd/hooks/`, `@/crd/forms/`, and `lucide-react`
- Props are plain TypeScript types with descriptive names
- May use `useTranslation('crd')` for built-in UI text (CRD i18n namespace)
- Organize by feature area in subdirectories: `space/`, `dashboard/`, `community/`, `user/`, `common/`

**Examples:** `space/SpaceCard.tsx`, `space/SpaceExplorer.tsx`, `common/AlkemioLogo.tsx`, `common/StackedAvatars.tsx`

**Inventory:** see `components/index.md` for a brief description of each component.

### forms/

Form UI components — inputs, selectors, field groups. These render form controls with labels, validation states, and help text, but do NOT manage form state (no Formik, no react-hook-form).

**Rules:**
- Accept `value`, `onChange`, `error`, `label` as props
- Never import form libraries — the container in `src/domain/` connects Formik/RHF to these components
- Build on top of primitives: `Input`, `Label`, `Textarea`, `Select`, `Switch`, `Checkbox`

**Examples:** `TextField.tsx`, `TextAreaField.tsx`, `SearchField.tsx`, `DateField.tsx`, `TagsField.tsx`

### layouts/

Page-level layout shells. These define the spatial arrangement of content areas (sidebar + main, two-column, full-width) without knowing what content goes in them.

**Rules:**
- Accept `children`, named slots (`sidebar`, `header`, `footer`), or render props
- Responsive behavior via Tailwind breakpoints
- No data fetching, no business logic

**Examples:** `PageLayout.tsx`, `TwoColumnLayout.tsx`, `ContentBlock.tsx`, `DialogLayout.tsx`

### styles/

Design tokens and Tailwind configuration.

- `theme.css` — CSS custom properties (colors, typography, spacing, elevation)
- `crd.css` — Tailwind entry point with `@source` directives
- Tokens are the same as the prototype's `styles/theme.css`

### lib/

Shared utilities.

- `utils.ts` — the `cn()` function (clsx + tailwind-merge)
- Keep this minimal — utilities that don't fit here probably belong in `src/core/utils/`

### hooks/

UI-only React hooks.

- `useMediaQuery.ts` — responsive breakpoint detection (no MUI dependency)
- `useScreenSize.ts` — convenience hook for common breakpoints
- Never fetch data, never access context providers from outside crd

---

## How Consumers Use These Components

Components in `src/crd/` are consumed by integration layers in `src/new-ui/`, `src/domain/`, or `src/main/`. The consumer handles data fetching and mapping; the crd component handles rendering.

**Primary pattern — CRD page integration via `src/new-ui/`:**

```typescript
// src/new-ui/topLevelPages/spaces/SpaceExplorerPage.tsx (INTEGRATION — in new-ui)
import { SpaceExplorer } from '@/crd/components/space/SpaceExplorer';
import { mapSpacesToCardDataList } from './spaceCardDataMapper';

export const SpaceExplorerCrdView = ({ spaces, loading, ... }: SpaceExplorerViewProps) => {
  const cardData = mapSpacesToCardDataList(spaces, authenticated);
  return <SpaceExplorer spaces={cardData} loading={loading} ... />;
};
```

**Alternative — domain-level container:**

```typescript
// src/domain/collaboration/callout/CalloutFeedContainer.tsx (CONTAINER — in domain)
import { useCalloutsSet } from '@/domain/collaboration/calloutsSet/useCalloutsSet';
import { PostCard } from '@/crd/components/space/PostCard';

export function CalloutFeedContainer({ calloutsSetId }) {
  const { callouts } = useCalloutsSet({ calloutsSetId });

  return callouts.map(callout => (
    <PostCard
      key={callout.id}
      title={callout.framing.profile.displayName}
      author={{ name: callout.createdBy?.profile.displayName ?? 'Unknown' }}
      type="text"
    />
  ));
}
```

The mapping from GraphQL types to component props happens in the consumer, never inside the crd component.

---

## Porting From the Prototype

The prototype at `/prototype/src/` is the design reference. When porting:

1. **Primitives** — copy from `prototype/src/app/components/ui/` and update imports to use `@/crd/lib/utils`
2. **Components** — copy from `prototype/src/app/components/space/` etc., remove any mock data, extract props interfaces
3. **Styles** — the prototype's `styles/theme.css` is the source of truth for design tokens
4. **Always check** that the ported component has zero forbidden imports before committing

---

## i18n

CRD has its own i18next namespace (`'crd'`) with translations in `src/crd/i18n/en.json`. This JSON file is the single source of truth for all CRD UI text.

**How it works:**
- **Main app** (`src/core/i18n/config.ts`): imports `en.json` and registers it as the `'crd'` namespace alongside the default `'translation'` namespace
- **Standalone app** (`src/crd/app/main.tsx`): imports the same `en.json` and uses `'crd'` as its default namespace
- **CRD components**: always call `useTranslation('crd')` and reference keys without prefix: `t('spaces.title')`, `t('header.search')`

```typescript
const { t } = useTranslation('crd');
<Button>{t('buttons.cancel')}</Button>
```

**Adding new translations:**
1. Add the key to `src/crd/i18n/en.json`
2. Use it in the component via `useTranslation('crd')` + `t('section.key')`
3. No need to touch `translation.en.json` — the CRD namespace is independent

Business domain text ("Space Dashboard", "Innovation Flow") comes from the container via props — never use the default translation namespace inside crd.

---

## Standalone Preview App (`src/crd/app/`)

The `app/` subdirectory is a **standalone Vite application** that renders CRD components with mock data. It is designed for designers to preview and iterate on CRD components without running the full Alkemio backend.

### Running

```bash
pnpm crd:dev    # Dev server on http://localhost:5200
pnpm crd:build  # Production build
```

### Architecture

- `app/main.tsx` — entry point: initializes i18next with CRD translations, renders `CrdApp`
- `app/CrdApp.tsx` — root: BrowserRouter + CrdLayout with mock user/auth
- `app/pages/` — mock pages (e.g., `SpacesPage.tsx` with hardcoded space data)
- `app/data/` — mock data sets (reused from the prototype)
- `app/vite.config.ts` — standalone Vite config (port 5200, path alias `@/crd` → `src/crd/`)

### Rules for `app/`

- `app/` is the **only** directory in `src/crd/` that may use `react-router-dom` (for standalone routing)
- `app/` may import from anywhere in `src/crd/` (components, layouts, primitives, forms, styles)
- `app/` MUST NOT be imported by any file outside `app/` — it is a standalone entry point
- Mock data in `app/data/` uses the same types as CRD components (`SpaceCardData`, etc.)

### i18n Separation

CRD translations live in `src/crd/i18n/en.json` as a proper i18next JSON resource file. This is the single source of truth for CRD UI text.

- **Main app**: `src/core/i18n/config.ts` imports `en.json` and registers it as the `'crd'` namespace
- **Standalone app**: `app/main.tsx` imports the same `en.json` as the `'crd'` namespace (set as default)
- CRD components use `useTranslation('crd')` and reference keys without prefix: `t('spaces.title')`, `t('header.search')`

---

## Checklist for Every New Component

- [ ] No MUI imports
- [ ] No domain/apollo/auth/routing imports
- [ ] Props are plain TypeScript (no GraphQL types)
- [ ] Styling is only Tailwind classes + cn()
- [ ] Icons from lucide-react only
- [ ] Accepts className for composition
- [ ] No barrel exports — explicit file paths only
- [ ] Event handlers (`on*`) are props, not internal logic
- [ ] State is visual only (open/close, hover, expanded)
- [ ] Icon-only buttons have `aria-label` (not just `title`)
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Interactive elements are `<a>` or `<button>`, never clickable `<span>`/`<div>`
- [ ] All interactive elements have visible `focus-visible:ring` indicators
- [ ] Lists use `role="list"` and `role="listitem"`
- [ ] Loading states use `role="status"` with `aria-label`
- [ ] Form inputs have `aria-label` that persists regardless of placeholder state

---

## Patterns & Conventions

### Tailwind Conversion Reference

When porting from the prototype or replacing inline `style` objects, use this mapping (based on `@theme inline` in `theme.css`):

| Inline style | Tailwind class |
|---|---|
| `background: 'var(--card)'` | `bg-card` |
| `color: 'var(--muted-foreground)'` | `text-muted-foreground` |
| `border: '1px solid var(--border)'` | `border border-border` |
| `borderTop: '1px solid var(--border)'` | `border-t border-border` |
| `fontSize: 'var(--text-sm)'` | `text-sm` |
| `fontWeight: 600` | `font-semibold` |
| `zIndex: 10` | `z-10` |
| `aspectRatio: '16 / 9'` | `aspect-video` |
| `padding: '24px 16px 0'` | `px-4 pt-6` |
| `borderRadius: 'var(--radius)'` | `rounded-lg` |
| `background: 'linear-gradient(135deg, var(--muted), var(--accent))'` | `bg-gradient-to-br from-muted to-accent` |
| Conditional bg based on `isPrivate` at 50% opacity | `bg-foreground/50` (Tailwind opacity modifier) |

**Keep as `style`** only when:
- The value is user-provided at runtime (e.g. `avatarColor`)
- The CSS function has no Tailwind equivalent (e.g. `color-mix()` with gradient stops)
- Hover effects that use `onMouseEnter`/`onMouseLeave` should be replaced with Tailwind `hover:` modifiers

### Nested Interactive Elements Inside Cards

When a card wraps in `<a href={...}>` but contains sub-elements that should navigate elsewhere (e.g. a parent link inside a space card), use `stopPropagation` + a callback prop:

```typescript
// The card is an <a> link — clicking anywhere navigates to the space
<a href={space.href} onClick={handleClick} className="group block">
  {/* Sub-element calls its own callback, stops the card click */}
  <span
    className="hover:underline cursor-pointer"
    onClick={e => {
      e.preventDefault();
      e.stopPropagation();
      onParentClick?.(space.parent!);
    }}
  >
    {space.parent.name}
  </span>
</a>
```

Never use `window.location.href` or `useNavigate` inside a CRD component — the callback prop lets the consumer decide.

### Component Extraction

When a component exceeds ~150 lines or contains a self-contained visual pattern used in multiple contexts, extract it to `components/common/`. Example: `StackedAvatars` was extracted from `SpaceCard` because the parent-child avatar overlay is reusable across entity types.
