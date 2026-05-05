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

### 7. Use `date-fns`, not `dayjs`

Inside `src/crd/` and inside CRD-feature integration code under `src/main/crdPages/`, **use `date-fns` exclusively** for date formatting, parsing, arithmetic, and comparators. Do NOT import `dayjs` in these layers — it is reserved for the legacy domain code under `src/domain/` (which we are progressively migrating away from).

**Why:**
- `react-day-picker` (the calendar primitive) requires `date-fns` as a peer dependency, so it's already in the bundle.
- `date-fns` accepts `locale` as a per-call option, which is concurrency-safe under React 19. `dayjs.locale()` mutates global state and is unsafe across simultaneously-rendering components in different languages.
- Mixing both in the same layer doubles the bundle for no functional benefit.

```typescript
// GOOD
import { addMinutes, format, isAfter, isSameDay, startOfDay } from 'date-fns';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';

const locale = resolveDateFnsLocale(i18n.language);
const startOfToday = startOfDay(new Date());
const endsAt = format(addMinutes(start, 30), 'p', { locale });

// BAD — dayjs anywhere in CRD or crdPages
import dayjs from 'dayjs';
const startOfToday = dayjs().startOf('day');
```

**Locale helper.** Always resolve `date-fns` locales via `resolveDateFnsLocale(i18n.language)` from `@/crd/lib/dateFnsLocale.ts` rather than re-declaring a `LOCALE_BY_LANG` map in each component. The shared helper is the single source of truth for the supported-language → date-fns Locale mapping.

**Cross-layer boundary.** When a CRD page consumer needs to call into a domain hook that returns dayjs values (e.g., `src/domain/timeline/calendar/utils/icsUtils.ts`'s `formatDateTimeUtc(dayjs.Dayjs)`), wrap or inline a JS Date equivalent locally instead of importing dayjs into the CRD/crdPages layer. The domain code itself stays on dayjs until that file is itself migrated.

### 8. Use Semantic Typography Tokens

**Avoid raw Tailwind typography class combos** like `text-sm font-semibold` or `text-2xl font-bold`. Use the semantic tokens defined in `src/crd/styles/typography.css`. Each token bundles font-size, line-height, font-weight, and letter-spacing into a single Tailwind utility via `@theme inline`.

**Tokens:**

| Token | Size | Weight | Purpose | HTML |
|-------|------|--------|---------|------|
| `text-page-title` | 30px | 700 | Main page headings | `<h1>` |
| `text-section-title` | 20px | 700 | Section headings within a page | `<h2>` |
| `text-subsection-title` | 18px | 600 | Subsection headings, dialog titles | `<h3>` |
| `text-card-title` | 14px | 600 | Card headings, list item titles | `<h3>` |
| `text-body` | 14px | 400 | Body text, descriptions | `<p>` |
| `text-body-emphasis` | 14px | 500 | Emphasized body text, links | `<p>`/`<span>` |
| `text-control` | 14px | 400 | UI-chrome in single-line interactive controls (menu items, dropdown rows, select triggers, inputs, button labels). Same size as body but tighter leading (1.25) so rows don't gain vertical space. | `<span>`/inline |
| `text-caption` | 12px | 400 | Timestamps, metadata, secondary text | `<p>`/`<span>` |
| `text-label` | 11px | 600 | Uppercase section headers, sidebar labels (includes 0.05em tracking) | `<span>` |
| `text-badge` | 10px | 500 | Badge text, tag labels, avatar fallback initials | `<span>` |

**Migration from raw classes:**

| Raw Tailwind (DO NOT USE) | Semantic token |
|---------------------------|---------------|
| `text-2xl font-bold` / `text-3xl font-bold` | `text-page-title` |
| `text-xl font-bold` / `text-xl font-semibold` | `text-section-title` |
| `text-lg font-semibold` / `text-lg font-medium` | `text-subsection-title` |
| `text-lg font-bold` (PostCard title) | `text-subsection-title font-bold` |
| `text-sm font-semibold` | `text-card-title` |
| `text-sm font-medium` | `text-body-emphasis` |
| `text-sm` / `text-sm leading-relaxed` / `text-sm leading-normal` (prose) | `text-body` |
| `text-sm` (UI-chrome: menu/dropdown/select rows, inputs, buttons, calendar day cells) | `text-control` |
| `text-sm font-medium` (button base label) | `text-control font-medium` |
| `text-xs` | `text-caption` |
| `text-[11px] font-semibold uppercase tracking-wider` | `text-label uppercase` (drop `tracking-wider` — token includes tracking) |
| `text-xs font-semibold uppercase tracking-wider` | `text-label uppercase` (drop `font-semibold`, `tracking-wider`) |
| `text-[10px] font-medium` / `text-[10px] font-semibold` | `text-badge` |
| `text-[9px]` (any weight) | `text-badge` |
| `text-[12px]` (any weight) | `text-caption` (+ weight override if needed) |

**Composability** — tokens compose naturally with other Tailwind utilities:

```tsx
// Responsive
<h1 className="text-section-title md:text-page-title">Title</h1>

// Color override
<p className="text-body text-destructive">Error description</p>

// Weight override
<h3 className="text-subsection-title font-bold">Bolder heading</h3>
```

**Exception: SpaceHeader hero text** — the `clamp(28px, 5vw, 48px)` inline style in `SpaceHeader.tsx` is a one-off exception (fluid font sizing, no Tailwind equivalent). Do not create a token for it.

**Figma Make workflow** — Figma Make always outputs raw Tailwind classes. After generating, replace raw class combos with semantic tokens using the table above. See `specs/042-crd-space-page/typography/spec.md` for the full specification.

### 9. All Deletions Must Be Confirmed

**Every** destructive action in the CRD layer — anything that removes data the user can't trivially recover — **must** go through `ConfirmationDialog` (`@/crd/components/dialogs/ConfirmationDialog`) before the mutation fires. No exceptions, no "small" deletions, no inline "are you sure" toasts.

**This includes (non-exhaustive):**
- Deleting a comment, reply, or reaction
- Deleting a poll option (and any other in-form list rows that map to a server-side delete on save)
- Deleting a callout, post, memo, whiteboard, contribution, or any other entity
- Removing a member, role, application, or invitation
- Removing a reference, file, or media-gallery image
- Discarding unsaved form state (use `DiscardChangesDialog`, which is a `ConfirmationDialog` variant)

**The pattern:**

1. The trash / "Delete" / "Remove" UI sets a `pendingDeleteId` (or similar) — it must NOT call the mutation directly.
2. Render `<ConfirmationDialog open={Boolean(pendingDeleteId)} variant="destructive" ...>`.
3. Only the dialog's `onConfirm` calls the actual delete mutation. Cancel resets `pendingDeleteId` to undefined.
4. Use `variant="destructive"` and a `confirmLabel` that names the action (e.g. `t('comments.delete')`, `t('mediaGallery.deleteImage')`) — not a generic "Yes".

**Reference implementations:**
- `useCrdRoomComments.tsx` — comment deletion via `pendingDeleteId` + `ConfirmationDialog`
- `CalloutSettingsConnector.tsx` — callout deletion via `DeleteCalloutDialog`
- `CrdMemoDialog.tsx` — memo deletion via `ConfirmationDialog`

**Why this rule exists:** an accidental click destroys user content with no undo at the server level. A dialog is cheap; a lost contribution or comment is not. This rule applies regardless of the entity's "importance" — once a user has typed it, they get to confirm before it goes away.

### 10. Never Render Markdown / HTML-Tagged Strings As Plain Text

Any string that can contain markdown, HTML tags, or `<Trans>`-style placeholders **must** be rendered through a markdown/rich-text renderer — never as `{someString}` inside a `<p>` or `<span>`. Doing so displays the raw markup to the user (bold asterisks, literal `<b>` tags, escaped entities), which is the bug this rule exists to prevent.

**Two kinds of strings to watch for:**

1. **User-generated content** — comment bodies, message text, post snippets, descriptions. These arrive from the backend as markdown. Render with `MarkdownContent` for full-width rich rendering, or `InlineMarkdown` for truncated previews (notification/activity items, list snippets).
2. **Translation strings with HTML tags** — many i18n keys under `components.inAppNotifications.*` and `innovationHub.*` contain `<b>`, `<br />`, `<i>`, `<pre>`, `<strong>` tags (e.g. `"In <b>{{spaceName}}</b>, of which you are a $t(common.member)."`). Render via `<Trans i18nKey={...} components={{ b: <strong />, br: <br />, i: <em />, pre: <pre /> }} />` — never via `t(...)` dropped into a JSX expression.

**Where this shows up:**

- Notification items (`NotificationItem`): `title`, `description`, `comment` fields. `CrdNotificationItemData` typed as `ReactNode` so the consumer can pre-render `<Trans>` / `<InlineMarkdown>`. See `src/main/ui/layout/notificationDataMapper.tsx`.
- Activity feed items (`ActivityItem`): `title` is typed `ReactNode`. Comment-type activities (`CalloutPostComment`, `DiscussionComment`, `UpdateSent`) have markdown `description`/`message` — wrap in `InlineMarkdown`. All other types pass the entity display-name as a plain string. See `src/main/crdPages/dashboard/dashboardDataMappers.tsx` → `resolveActivity`.
- Any new component receiving text from the backend that could contain formatting.

**Checklist when adding a new text-rendering component:**

- [ ] Is the string user-generated or translated? If user-generated → assume markdown → use `InlineMarkdown` or `MarkdownContent`.
- [ ] Does the translation key contain `<...>` tags? If yes → use `<Trans components={...} />`, not bare `t()`.
- [ ] Are you about to render a block-producing component (`<div>` from `InlineMarkdown`) inside `<p>`? If yes → change the wrapper to `<div>` to avoid invalid HTML.
- [ ] Provide a plain-text equivalent for `aria-label` and other accessibility attributes when the rendered content is not pure text (see `ActivityItemData.titlePlain`).

**Reference:** the legacy MUI stack uses `<Trans>` + `WrapperMarkdown plain={true}` for exactly these cases (see `src/main/inAppNotifications/views/InAppNotificationBaseView.tsx` and `src/domain/collaboration/activity/ActivityLog/views/ActivitySubjectMarkdown.tsx`). CRD's `InlineMarkdown` is the equivalent of `WrapperMarkdown plain={true}`.

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
│   └── components/      # Layout building blocks (sub-components of Header, Footer, etc.)
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
- `Header.tsx` — site header with navigation, composes building blocks from `layouts/components/`
- `Footer.tsx` — site footer with links and language selector, accepts languages and `onLanguageChange` as props

### layouts/components/

Building blocks for layout components — sub-components extracted from `Header.tsx`, `Footer.tsx`, etc. These are not independently reusable across feature areas; they are structural parts of the page shell. They follow the same rules as `layouts/` (no business logic, props-only, Tailwind styling).

**Rules:**
- Same golden rules as all CRD components (no MUI, no business logic, plain TS props, Tailwind-only)
- Import only from `@/crd/primitives/`, `@/crd/layouts/types`, `@/crd/lib/`, and `lucide-react`
- Extracted when a self-contained section of a layout component exceeds ~100 lines or is logically independent (e.g., a dropdown menu)

**Key files:**
- `UserMenu.tsx` — profile dropdown menu (extracted from Header)
- `PlatformNavigationMenu.tsx` — platform navigation dropdown (Innovation Library, Forum, Spaces, Docs)

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
- [ ] Typography uses semantic tokens (`text-page-title`, `text-body`, etc.) — no raw combos like `text-sm font-semibold`

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

For layout components (Header, Footer), extract building blocks to `layouts/components/` instead. These are structural parts of the page shell, not reusable feature-area composites. Example: `UserMenu` and `PlatformNavigationMenu` are extracted from `Header` because each is a self-contained dropdown menu with its own props interface.

### Shared Layout Types

Layout-related types are defined once in `src/crd/layouts/types.ts` and imported by all layout components. When adding new layout props:
1. Add the type to `types.ts`
2. Import it in the layout component
3. Update the contracts in `specs/039-crd-exploreSpaces-page/contracts/crd-layout.ts` to match

### Deterministic Accent Colors (`pickColorFromId`)

When a space (or any space-like entity) has no avatar or card banner image, the design system does **not** fall back to a generic muted gradient or a stock placeholder. Instead, every space gets a stable accent colour derived from its id, so the same entity is always recognisable by its colour across every component on the page.

The single source of truth lives in `@/crd/lib/pickColorFromId.ts`:

```typescript
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
const color = pickColorFromId(space.id); // → '#42a5f5' (one of 6 palette colours)
```

The function hashes the id's char codes and indexes into a 6-colour palette. It is **deterministic** — the same id always returns the same colour, in production data, mock data, and across reloads.

#### Where the colour is applied

The colour is used in two visual treatments, and **only** as a fallback when the corresponding image is missing:

| Treatment | Trigger | Visual |
|---|---|---|
| **Avatar fallback** | `avatarUrl` is missing | `<AvatarFallback style={{ backgroundColor: color }} className="text-white">` |
| **Banner / cardBanner fallback** | `bannerUrl` / `cardBanner` is missing | `<div style={{ background: \`linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 70%, black))\` }}>` |

The components that participate in these treatments today:

- **Banners / cardBanners (gradient)**: `CompactSpaceCard` (recent spaces banner area), `SpaceCard` (explore spaces banner), `SpaceHierarchyCard` (parent + subspace banners), `MyMembershipsPanel` `BannerThumbnail`.
- **Avatar fallbacks (solid colour)**: `MyMembershipsPanel` `NodeAvatar`, `InvitationsBlock` avatar, `PendingInvitationCard`, `PendingApplicationCard`, `InvitationDetailDialog`, `SpaceCard`'s `StackedAvatars`.

#### Where the colour is NOT applied

The accent colour is intentionally absent from a few spots — too many coloured tiles per row makes the layout feel noisy. These keep the muted prototype treatment:

- **`SidebarResourceItem`** (small `size-6` rows in the sidebar's My Spaces / Innovation Hubs / Innovation Packs sections) — default grey `AvatarFallback`. Virtual Contributors get a single shared `var(--chart-2)` accent so they remain visually distinct from spaces, but they do not use `pickColorFromId`.
- **`CompactSpaceCard`'s initials tile** (the small rectangle next to the space name in the card body, *not* the banner) — `bg-primary text-primary-foreground`.

The rule of thumb: **prominent display avatars and banner areas use the colour; small list rows and label tiles use the prototype's muted/primary treatment.**

#### Data flow

1. The data mapper in `src/main/crdPages/<page>/` calls `pickColorFromId(entity.id)` and attaches the result to a `color` (or `avatarColor`) field on the CRD component's prop type.
2. The CRD component receives the field as a plain string prop. It applies the colour **only** when the corresponding image (`bannerUrl`, `avatarUrl`, etc.) is `undefined` — a real image always wins.
3. CRD components **never** call `pickColorFromId` themselves. Determining the colour is mapping logic; the component is purely visual.

#### Adding it to a new mapper

```typescript
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

export const mapMyEntityToCardData = (entity: GraphQLEntity): MyCardData => ({
  id: entity.id,
  name: entity.profile.displayName,
  href: entity.profile.url,
  avatarUrl: entity.profile.avatar?.uri,
  // No `getDefaultSpaceVisualUrl` fallback — leave undefined so the component
  // renders the deterministic gradient from `color`.
  bannerUrl: entity.profile.cardBanner?.uri || undefined,
  color: pickColorFromId(entity.id),
});
```

> **Naming note:** Some prop types use `color`, others use `avatarColor` for historical reasons (`SpaceCardData.avatarColor`, `SidebarResourceData.avatarColor`). When adding a new component, prefer `color` for the field name. Both are populated from the same `pickColorFromId` helper.

### Share Dialog and Slot-Based Sub-Views

`src/crd/components/common/ShareDialog.tsx` is the canonical CRD share dialog (URL + clipboard copy + optional Share-on-Alkemio sub-view). `src/crd/components/common/ShareButton.tsx` is a self-contained icon button that composes the dialog. `src/crd/forms/UserSelector.tsx` is the multi-select user picker used by the Alkemio sub-flow.

#### Two consumption patterns

- **`ShareButton`** — owns the trigger (32 px ghost icon button) AND the open state. Use when one button = one dialog. Props are minimal (`url`, `disabled`, `tooltip`, `dialogTitle`, `shareOnAlkemioSlot`, `children`).
- **`ShareDialog` directly** — controlled (`open` / `onOpenChange`), trigger lives elsewhere. Use when multiple triggers (context-menu item, header icon, reactions-bar button) need to open the **same** dialog instance — lift the open state to a parent and pass `() => setShareOpen(true)` to each trigger. Don't mount one dialog per trigger.

#### Slot-based view-switching (reusable pattern)

`ShareDialog` exposes `shareOnAlkemioSlot?: ReactNode`. When provided:
- An outlined "Share on Alkemio" button appears below the URL row.
- Clicking it switches the dialog body to the slot.
- The dialog header gains a Back arrow (managed by `ShareDialog`, not the slot) that returns to the URL view.
- The view state resets to `'default'` whenever `open` transitions to `false`.

This is the design-system pattern for **a CRD dialog that needs to host an integration-layer sub-view that uses Apollo / current-user / domain logic**. The dialog stays a pure CRD primitive (no Apollo, no business logic); the consumer fills the slot with whatever needs domain wiring. The slot is just a `ReactNode` — no render-prop, no context — because the dialog manages all dialog-level affordances (Back arrow, focus trap, close behaviour) and the slot is purely the body.

When you add a new `Foo` sub-view to a CRD dialog:
1. Add a `fooSlot?: ReactNode` prop on the CRD dialog. Render an entry-point button when the slot is provided. Manage the view state internally; reset on close.
2. Build the integration form in `src/main/crdPages/<page>/<Foo>FormConnector.tsx` (or `_shared/`). It owns mutation state, Apollo hooks, current-user filtering.
3. Mount the dialog at the consumer parent (page connector / list connector). Pass the integration form as the slot. If multiple triggers need the same dialog, lift the open state to that parent.

#### `UserSelector` (form layer)

`src/crd/forms/UserSelector.tsx` — multi-select picker. Inline result list (no popover, no `cmdk`) absolutely positioned over the input wrapper so it overlays content below without resizing the dialog. Plain TS prop type `ShareUser = { id; displayName; avatarUrl?; city?; country? }`. All labels (`placeholder`, `noResultsLabel`, `loadingLabel`, `removeAriaLabel(name)`, `searchAriaLabel`) come from props — the consumer i18n's. Filters already-selected users from results client-side. When you need a user picker for a non-Share context, this is the building block.

#### MUI coexistence

The MUI `ShareDialog` at `src/domain/shared/components/ShareDialog/ShareDialog.tsx` still ships and is used by 7+ MUI-page callsites (memo, calendar, discussion, community updates, etc.). They keep using it. They migrate to the CRD dialog when their host page migrates. Don't pre-migrate ahead of the host.
