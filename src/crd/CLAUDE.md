# src/crd — Alkemio Design System

This folder is a **client-agnostic, reusable design system** built with **shadcn/ui + Tailwind CSS v4 + Radix UI**. It replaces the MUI-based `src/core/ui/` layer.

> **Planned rename**: `src/crd/` will be renamed to `src/design-system/` in a future phase. The `@/crd/` path alias will change to `@/design-system/`. All internal documentation and imports will be updated at that time. Until then, use `@/crd/` for all references.

## Design Philosophy

This is a **design system, not an app layer**. Every component must be reusable by any consumer — whether the Alkemio main app, the standalone preview app, or a hypothetical different client. This means:

- **No knowledge of the host application** — components don't know about GraphQL, routing, auth, or any application-level concern
- **All data flows in via props** — the component never fetches, mutates, or derives data
- **All behavior flows in via callbacks** — the component never decides what happens on user interaction; it calls a prop callback and the consumer decides
- **All user-visible text is either from the `'crd'` i18n namespace (for design-system labels like "Filters", "Load More") or passed as props (for business-domain text)**

---

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

**Forbidden:** navigating programmatically (`window.location.href = ...`), calling APIs, dispatching actions, changing application-level state (e.g. `i18n.changeLanguage()`), or any logic beyond calling the prop callback.

```typescript
// GOOD — handler is a prop, consumer decides what happens
type SpaceCardProps = {
  href: string;
  onParentClick?: () => void;  // consumer navigates, tracks analytics, etc.
};

// GOOD — language change is a callback, consumer wires i18n
type FooterProps = {
  languages: { code: string; label: string }[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
};

// BAD — component decides navigation behavior
onClick={() => { window.location.href = space.parent!.href; }}

// BAD — component manipulates application-level state
onClick={() => { i18n.changeLanguage(lang.code); }}
```

**Litmus test:** Could this component work in a completely different application with different routing, different state management, and different i18n? If the answer is no, behavior is leaking in.

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
- **No `sx` prop**, no `styled()`, no `useTheme()`, no inline `style` objects (except for truly dynamic values — see below)
- Icons come from `lucide-react`, never `@mui/icons-material`

**When inline `style` is acceptable:**
- User-provided runtime values (e.g. `avatarColor` from data)
- Complex CSS functions with no Tailwind equivalent (e.g. `color-mix()` with gradient stops)

**When inline `style` is NOT acceptable (use Tailwind instead):**
- `style={{ color: 'var(--foreground)' }}` → `text-foreground`
- `style={{ background: 'var(--card)' }}` → `bg-card`
- `style={{ border: '1px solid var(--border)' }}` → `border border-border`
- `style={{ fontSize: '11px' }}` → `text-[11px]`
- `style={{ fontWeight: 600 }}` → `font-semibold`
- `style={{ zIndex: 3 }}` → `z-[3]`
- `style={{ width: 10, height: 10 }}` → `size-2.5`

See the [Tailwind Conversion Reference](#tailwind-conversion-reference) for the full mapping.

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

## Accessibility (WCAG 2.1 AA)

Accessibility is a **hard requirement**, not a nice-to-have. Every component must meet WCAG 2.1 AA criteria. These rules are enforced in code review.

### Interactive Elements
- Clickable elements must be `<a>` or `<button>` — never clickable `<span>`, `<div>`, or other non-interactive elements
- Icon-only buttons must have `aria-label` (not just `title`)
- All interactive elements must have visible `focus-visible:ring` indicators for keyboard navigation
- Buttons that toggle state should use `aria-pressed` or `aria-expanded` as appropriate

### Icons & Decorative Content
- Decorative icons must have `aria-hidden="true"`
- Meaningful icons (not next to visible text) need `aria-label` on the parent button/link

### Text & Labels
- All user-visible strings must use `t()` from the `'crd'` i18n namespace — no hardcoded text in JSX
- Screen-reader-only text uses the `sr-only` class and must also use `t()`, not hardcoded strings
- Form inputs must have a persistent `aria-label` or visible `<label>` that does not disappear when the input has a value

### Lists & Collections
- Lists use `role="list"` on the container and render items as `<li>` elements
- Grid layouts showing collections should use `<ul>` / `<li>` semantic structure

### Loading & Dynamic States
- Loading states use `<output>` or `role="status"` with `aria-label` describing what is loading
- Busy buttons use `aria-busy={true}` and `disabled` while processing

### Color & Contrast
- Text must meet 4.5:1 contrast ratio against its background (3:1 for large text)
- Information must not be conveyed by color alone — use icons, text, or patterns as additional indicators

---

## Folder Structure

```
src/crd/
├── primitives/          # shadcn/ui atoms — smallest building blocks
├── components/          # Composites — reusable combinations of primitives
├── forms/               # Form-specific components (inputs with labels, field groups)
├── layouts/             # Page-level layout components + shared types
├── styles/              # CSS tokens, theme, Tailwind entry point
├── lib/                 # Utilities (cn, etc.)
├── i18n/                # Per-feature translation directories (layout/, exploreSpaces/, etc.)
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
- May use `useTranslation('crd-<feature>')` for design-system UI text (labels like "Filters", "Load More", "Private", "Public"). Each feature area has its own namespace (e.g., `'crd-layout'`, `'crd-exploreSpaces'`)
- Must NOT use `useTranslation` to access or manipulate `i18n` directly (e.g. `i18n.changeLanguage()`, `i18n.language`) — these are application-level concerns that must be passed as props
- Page-level text (titles, subtitles) lives in the feature's CRD namespace alongside its design-system labels
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

Page-level layout shells and shared types. These define the spatial arrangement of content areas (sidebar + main, two-column, full-width) without knowing what content goes in them.

**Rules:**
- Accept `children`, named slots (`sidebar`, `header`, `footer`), or render props
- Layout-specific behavior (language selector, navigation callbacks) must be received as props from the consumer
- Shared types (`CrdUserInfo`, `CrdNavigationHrefs`, `CrdLanguageOption`) live in `layouts/types.ts`
- Responsive behavior via Tailwind breakpoints
- No data fetching, no business logic

**Key files:**
- `types.ts` — shared type definitions for layout components
- `CrdLayout.tsx` — full-page shell (header + main + footer)
- `Header.tsx` — site header with navigation, accepts callback props for messages/notifications/search
- `Footer.tsx` — site footer with links and language selector, accepts languages and `onLanguageChange` as props

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

Components in `src/crd/` are consumed by integration layers in `src/main/crdPages/`, `src/domain/`, or `src/main/`. The consumer handles data fetching, mapping, and wiring behavior; the crd component handles rendering.

**Primary pattern — CRD page integration via `src/main/crdPages/`:**

```typescript
// src/main/crdPages/spaces/SpaceExplorerPage.tsx (INTEGRATION — in crdPages)
import { SpaceExplorer } from '@/crd/components/space/SpaceExplorer';
import { mapSpacesToCardDataList } from './spaceCardDataMapper';

export const SpaceExplorerCrdView = ({ spaces, loading, ... }: SpaceExplorerViewProps) => {
  const cardData = mapSpacesToCardDataList(spaces, authenticated);
  return <SpaceExplorer spaces={cardData} loading={loading} ... />;
};
```

**Layout wiring pattern — CrdLayoutWrapper:**

```typescript
// src/main/ui/layout/CrdLayoutWrapper.tsx (APP LAYER — in main)
// Languages are derived from supportedLngs + main translation labels — not hardcoded
const languages = supportedLngs
  .filter(lng => lng !== 'inContextTool')
  .map(lng => ({ code: lng, label: t(`languages.${lng}`) }));

<CrdLayout
  user={user}
  authenticated={isAuthenticated}
  navigationHrefs={NAVIGATION_HREFS}
  languages={languages}
  currentLanguage={i18n.language}
  onLanguageChange={code => i18n.changeLanguage(code)}  // switches BOTH namespaces
  onLogout={handleLogout}
  onMessagesClick={() => setMessagingOpen(true)}       // opens MUI dialog directly
  onNotificationsClick={() => setNotificationsOpen(true)} // opens MUI dialog directly
>
  <Outlet />
</CrdLayout>
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
5. **Convert inline styles to Tailwind** — the prototype uses inline styles in many places; convert them using the [Tailwind Conversion Reference](#tailwind-conversion-reference)

---

## i18n

CRD uses **per-feature i18next namespaces** with atomic translation files in `src/crd/i18n/`. Each feature area gets its own namespace, enabling lazy loading per page/feature.

### Namespace Structure

| Namespace | File pattern | Contents | Loading |
|-----------|-------------|----------|---------|
| `crd-layout` | `layout.<lang>.json` | `header.*` + `footer.*` keys | **Eager** (EN), lazy (other langs) |
| `crd-exploreSpaces` | `exploreSpaces.<lang>.json` | `spaces.*` keys | **Lazy** (all langs) |
| `crd-<feature>` | `<feature>.<lang>.json` | Feature-specific keys | **Lazy** (all langs) |

**Supported languages:** `en`, `nl`, `es`, `bg`, `de`, `fr` — must match `supportedLngs` in `src/core/i18n/config.ts`

### How it works

- **Main app** (`src/core/i18n/config.ts`): eagerly imports `layout.en.json` as the `'crd-layout'` namespace. Feature namespaces (e.g., `'crd-exploreSpaces'`) are lazy-loaded on demand when a component calls `useTranslation('crd-exploreSpaces')`. Non-English languages are always lazy-loaded via the `crdNamespaceImports` registry.
- **Standalone app** (`src/crd/app/main.tsx`): eagerly imports all namespace files (dev tool, no lazy loading needed)
- **CRD components**: call `useTranslation('crd-<feature>')` for their specific namespace. Keys are prefixless within the namespace: `t('spaces.filters')`, `t('header.search')`
- **Language switching**: When the user changes language via `i18n.changeLanguage()`, all loaded namespaces are fetched for the new language. The lazy backend handles this automatically.

```typescript
// Layout components
const { t } = useTranslation('crd-layout');
<nav>{t('header.search')}</nav>

// Feature components
const { t } = useTranslation('crd-exploreSpaces');
<Button>{t('spaces.loadMore')}</Button>
```

### Translation Boundary: What Goes Where

| Category | Example | Where it lives | How it reaches the component |
|----------|---------|----------------|------------------------------|
| **Design-system labels** | "Filters", "Load More", "Search...", "Private" | `src/crd/i18n/` (`crd-*` namespaces) | `useTranslation('crd-exploreSpaces')` inside CRD component |
| **Page-level text** | "Explore Spaces", page subtitles | `src/crd/i18n/` (`crd-*` namespaces) | `useTranslation('crd-exploreSpaces')` inside CRD component |
| **Business data** | Space names, user names | GraphQL | Passed as **props** from `crdPages` container |

**What belongs in CRD namespaces:**
- Design-system labels: "Filters", "Load More", "Search", "Private", "Public", "Beta"
- Accessibility text: sr-only labels, aria-labels for icon buttons
- Layout text: footer links ("Terms", "Privacy"), header menu items ("Dashboard", "Profile")

**What does NOT belong (pass as props instead):**
- Business-domain text: space names, user names, entity descriptions
- Application configuration: supported languages, navigation URLs

### Adding translations to an existing feature

1. Add the key to `src/crd/i18n/<feature>/<feature>.en.json`
2. Add the translated key to all other `<feature>.<lang>.json` files
3. Use it in the component via `useTranslation('crd-<feature>')` + `t('section.key')`

### Adding a new feature namespace

1. Create `src/crd/i18n/<feature>/<feature>.en.json` (+ translated files for all other languages in the same directory)
2. Add a `'crd-<feature>'` entry to `crdNamespaceImports` in `src/core/i18n/config.ts`
3. Components use `useTranslation('crd-<feature>')`
4. No need to add to the `ns` array in `i18n.init()` — i18next loads namespaces on demand

### Adding a new language

1. Add the language code to `supportedLngs` in `src/core/i18n/config.ts`
2. Create `<feature>.<lang>.json` files in each `src/crd/i18n/<feature>/` directory
3. Add the language to each feature entry in `crdNamespaceImports`
4. The language will automatically appear in the footer selector (derived from `supportedLngs`)

### Translation management

CRD translations are managed manually with AI-assisted translations — **not via Crowdin**. Only the main `translation` namespace uses Crowdin.

### Critical rules

- Never access `i18n` directly (e.g. `i18n.language`, `i18n.changeLanguage()`) — these are application-level APIs. Read language state from props, call language-change callbacks via props.
- Never import from the default `'translation'` namespace inside CRD components.
- All user-visible strings in JSX must use `t()` — including sr-only text, badge labels, and other seemingly minor text.
- Page-level text (titles, subtitles) lives in the feature's CRD namespace alongside its design-system labels.

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
- `app/CrdApp.tsx` — root: BrowserRouter + CrdLayout with mock user/auth/language props (languages are hardcoded here since the standalone app doesn't have the main translation namespace)
- `app/pages/` — mock pages (e.g., `SpacesPage.tsx` with hardcoded space data)
- `app/data/` — mock data sets (reused from the prototype)
- `app/vite.config.ts` — standalone Vite config (port 5200, path alias `@/crd` → `src/crd/`)

### Rules for `app/`

- `app/` is the **only** directory in `src/crd/` that may use `react-router-dom` (for standalone routing)
- `app/` may import from anywhere in `src/crd/` (components, layouts, primitives, forms, styles)
- `app/` MUST NOT be imported by any file outside `app/` — it is a standalone entry point
- Mock data in `app/data/` uses the same types as CRD components (`SpaceCardData`, etc.)
- `app/` is also where callbacks like `onParentClick` can use `window.location.href` — this is the consumer layer, not the design system

### i18n Separation

CRD translations live in per-feature directories in `src/crd/i18n/` (e.g., `layout/layout.<lang>.json`, `exploreSpaces/exploreSpaces.<lang>.json`).

- **Main app**: `src/core/i18n/config.ts` eagerly imports `layout.en.json` as the `'crd-layout'` namespace. Feature namespaces are lazy-loaded via the `crdNamespaceImports` registry.
- **Standalone app**: `app/main.tsx` eagerly imports all namespace files (no lazy loading needed for dev tool)
- Layout components use `useTranslation('crd-layout')`, feature components use `useTranslation('crd-<feature>')`

---

## Checklist for Every New Component

### Independence
- [ ] No MUI imports (`@mui/*`, `@emotion/*`)
- [ ] No domain/apollo/auth/routing imports
- [ ] Props are plain TypeScript (no GraphQL types)
- [ ] No barrel exports — explicit file paths only
- [ ] Event handlers (`on*`) are props, not internal logic
- [ ] No direct `i18n` API access — language state/changes come via props
- [ ] State is visual only (open/close, hover, expanded)
- [ ] Component works in both main app and standalone preview app

### Styling
- [ ] Styling uses only Tailwind classes + `cn()`
- [ ] No inline `style` props for values that have Tailwind equivalents
- [ ] Icons from `lucide-react` only
- [ ] Accepts `className` for composition

### Accessibility (WCAG 2.1 AA)
- [ ] Icon-only buttons have `aria-label` (not just `title`)
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Interactive elements are `<a>` or `<button>`, never clickable `<span>`/`<div>`
- [ ] All interactive elements have visible `focus-visible:ring` indicators
- [ ] Lists use `<ul>` / `<li>` with proper semantic structure
- [ ] Loading states use `<output>` or `role="status"` with `aria-label`
- [ ] Form inputs have `aria-label` that persists regardless of placeholder state
- [ ] All user-visible strings use `t()` — no hardcoded text in JSX (including sr-only text)
- [ ] Busy buttons use `aria-busy` and `disabled`

---

## Patterns & Conventions

### Tailwind Conversion Reference

When porting from the prototype or replacing inline `style` objects, use this mapping (based on `@theme inline` in `theme.css`):

| Inline style | Tailwind class |
|---|---|
| `background: 'var(--card)'` | `bg-card` |
| `background: 'var(--border)'` | `bg-border` |
| `background: 'white'` | `bg-white` |
| `color: 'var(--foreground)'` | `text-foreground` |
| `color: 'var(--muted-foreground)'` | `text-muted-foreground` |
| `color: 'var(--destructive)'` | `text-destructive` |
| `color: 'var(--primary)'` | `text-primary` |
| `border: '1px solid var(--border)'` | `border border-border` |
| `borderTop: '1px solid var(--border)'` | `border-t border-border` |
| `fontSize: 'var(--text-sm)'` | `text-sm` |
| `fontSize: '9px'` | `text-[9px]` |
| `fontSize: '10px'` | `text-[10px]` |
| `fontSize: '11px'` | `text-[11px]` |
| `fontWeight: 600` | `font-semibold` |
| `fontWeight: 700` | `font-bold` |
| `zIndex: 3` | `z-[3]` |
| `width: 10, height: 10` | `size-2.5` |
| `aspectRatio: '16 / 9'` | `aspect-video` |
| `padding: '24px 16px 0'` | `px-4 pt-6` |
| `padding: '4px 8px'` | `px-2 py-1` |
| `borderRadius: 'var(--radius)'` | `rounded-lg` |
| `minWidth: 200` | `min-w-[200px]` |
| `maxWidth: 360` | `max-w-[360px]` |
| `height: 32` | `h-8` |
| `height: 40` | `h-10` |
| `background: 'linear-gradient(135deg, var(--muted), var(--accent))'` | `bg-gradient-to-br from-muted to-accent` |
| `gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'` | `grid-cols-[repeat(auto-fill,minmax(280px,1fr))]` |
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
  <button
    type="button"
    className="hover:underline cursor-pointer"
    onClick={e => {
      e.preventDefault();
      e.stopPropagation();
      onParentClick?.(space.parent);
    }}
  >
    {space.parent.name}
  </button>
</a>
```

Never use `window.location.href` or `useNavigate` inside a CRD component — the callback prop lets the consumer decide.

### Component Extraction

When a component exceeds ~150 lines or contains a self-contained visual pattern used in multiple contexts, extract it to `components/common/`. Example: `StackedAvatars` was extracted from `SpaceCard` because the parent-child avatar overlay is reusable across entity types.

### Shared Layout Types

Layout-related types are defined once in `src/crd/layouts/types.ts` and imported by all layout components. When adding new layout props:
1. Add the type to `types.ts`
2. Import it in the layout component
3. Update the contracts in `specs/039-crd-exploreSpaces-page/contracts/crd-layout.ts` to match
