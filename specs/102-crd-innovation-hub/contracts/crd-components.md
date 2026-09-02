# Contract — CRD Presentational Components

**Feature**: 102-crd-innovation-hub
**Scope**: `src/crd/components/innovationHub/*`

Every component listed here lives under `src/crd/components/innovationHub/`. They are pure presentational components, governed by the CRD golden rules: no MUI, no GraphQL types in props, no business logic, no `react-router-dom`, no `formik`. All event handlers are props. All user-visible strings come from `useTranslation('crd-innovationHub')`. Styling: Tailwind + `cn()` + semantic typography tokens. Icons: `lucide-react`.

---

## `InnovationHubHome`

**File**: `src/crd/components/innovationHub/InnovationHubHome.tsx`

**Purpose**: Render the public hub home page — banner, info bar, description card, Spaces grid, footer CTA. The page itself is wrapped in `CrdLayoutWrapper` by the integration page (via `TopLevelRoutes`), so this component renders the content area only.

**Props**:

```typescript
export type InnovationHubHomeProps = {
  data: InnovationHubHomeData; // (see data-model.md)
  /**
   * Optional click handler for the settings gear icon. When omitted, the gear renders
   * as a plain `<a href={data.settingsUrl}>` link. When provided, it overrides
   * the click target (used for analytics tracking from the integration layer).
   */
  onSettingsClick?: () => void;
};
```

**Composition** (Tailwind + CRD primitives):
- Full-width banner block — fixed height `256px`, top-offset `-mt-16` (`-64px`) to tuck under the CRD header. Uses `<img>` if `bannerImageUrl` is present, else a 135° gradient from `bannerColor → color-mix(in srgb, bannerColor 70%, black)`.
- Info bar with name (`text-hero`) + tagline (italic, `text-body`, muted-foreground). Settings `<a>` icon button rendered only when `data.settingsUrl` is set.
- 12-col responsive grid (`col-span-12 lg:col-start-2 lg:col-span-10`) inside two padded sections: description block + Spaces grid + CTA.
- Description rendered through the existing `MarkdownContent` component (parses the markdown string into HTML).
- Spaces grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`. Each card is the existing `@/crd/components/space/SpaceCard` consuming a `SpaceCardData`. List semantics: `<ul role="list">` + `<li>` per card.
- Empty-state when `data.spaces.length === 0`: muted card with i18n'd empty copy.
- Footer CTA: small flex row with `AlkemioSymbolSquare` icon + caption text + underlined `<a href={data.allSpacesUrl}>Browse all Spaces on Alkemio</a>`.

**Accessibility**:
- Banner `<img>` has `alt={data.bannerAlt}`.
- `<h1>` for the hub name (only one per page).
- `<h2>` for the Spaces section.
- Settings link has `aria-label={t('settings.header.viewSettings')}`.
- Spaces grid uses `<ul role="list">` + `<li>`.

**Forbidden in this file**: any import from `@mui/*`, `@/core/apollo/*`, `@/domain/*`, `@/core/auth/*`, `react-router-dom`, `formik`, `dayjs`, generated GraphQL types.

---

## `InnovationHubBanner`

**File**: `src/crd/components/innovationHub/InnovationHubBanner.tsx`

**Purpose**: Render the full-width banner block at the top of the hub home page. Extracted from `InnovationHubHome` because the same visual is used in the settings sticky header preview (different size) — and extraction makes the gradient-vs-image fork easier to test in isolation.

**Props**:

```typescript
export type InnovationHubBannerProps = {
  imageUrl?: string;
  color: string;        // accent for the gradient fallback
  alt: string;          // alt text when image is present
  /** Visual variant — affects height, border-radius, top-offset. Default 'page'. */
  variant?: 'page' | 'compact';
};
```

---

## `InnovationHubSettingsShell`

**File**: `src/crd/components/innovationHub/InnovationHubSettingsShell.tsx`

**Purpose**: Render the settings page chrome — sticky header (thumbnail + name + tagline + "view hub" icon) and the two-tab strip. Active-tab content is composed by the integration page and passed as `children`.

**Props**:

```typescript
export type InnovationHubSettingsShellProps = {
  header: HubSettingsHeaderData;
  activeTab: HubSettingsTabKey;
  tabHrefs: Record<HubSettingsTabKey, string>;
  children: React.ReactNode;
};
```

**Composition**:
- Sticky `<header>` with `top-16 z-20 border-b border-border bg-card`.
- Inside: `HubSettingsHeaderThumbnail` + `<h1 className="text-page-title">{header.name}</h1>` + `<p className="text-body text-muted-foreground">{header.tagline}</p>` + `<a href={header.viewHubUrl} aria-label={t('settings.header.viewHub')}>` icon button (eye icon).
- Tabs row: composed of CRD primitives — uses Radix `Tabs.Root` from `@/crd/primitives/tabs.tsx` with two triggers (About / Spaces). Each trigger is rendered as an `<a>` (not a `<button>`) so the URL updates on click without programmatic navigation; the integration layer provides the hrefs.
- Body: `<main>` containing `{children}` inside a 12-col grid with the same `col-start-2 col-span-10` layout as the home page.

**Accessibility**:
- Tab list has `role="tablist"` via Radix Tabs.
- Each tab trigger announces its active state via `aria-selected`.
- The "view hub" icon button has a visible `focus-visible:ring`.

---

## `HubSettingsHeaderThumbnail`

**File**: `src/crd/components/innovationHub/HubSettingsHeaderThumbnail.tsx`

**Purpose**: The circular `w-12 h-12 rounded-full` thumbnail rendered in the Settings sticky header. Q1 clarification: cropped `BANNER_WIDE` image when present, else `pickColorFromId` gradient + initials.

**Props**:

```typescript
export type HubSettingsHeaderThumbnailProps = {
  imageUrl?: string;
  color: string;
  initials: string;
  /** Accessible name (e.g. the hub display name) for screen readers. */
  alt: string;
};
```

**Composition**:
- Uses CRD `Avatar` + `AvatarImage` + `AvatarFallback` primitives.
- `AvatarFallback` natively accepts a `color` prop and renders the gradient internally.
- `AvatarImage` shown only when `imageUrl` is set.

---

## `InnovationHubAboutTab`

**File**: `src/crd/components/innovationHub/InnovationHubAboutTab.tsx`

**Purpose**: Render the About tab content — six sections (subdomain, name, tagline, description, tags, banner), each with its own dirty/saving/saved indicator and a single Save button.

**Props**: `InnovationHubAboutTabProps` (see data-model.md).

**Composition**:
- Outer `space-y-8` container with `<Separator />` between sections.
- Each section:
  - `<Label className="text-label uppercase text-muted-foreground">` — section name (i18n key under `settings.about.<section>.label`)
  - Input control (one of: `<Input>`, `MarkdownEditor`, `TagsInput`, banner-upload preview)
  - Right-aligned `<InlineSectionSave>` showing the current state
- For the **banner** section: hover-to-reveal "Change Banner" button per the prototype; integration's `onBannerFileSelected` handler is wired through a hidden `<input type="file" accept="image/*" />`.

**Components used**:
- `@/crd/primitives/input` (subdomain, name, tagline)
- `@/crd/forms/markdown/MarkdownEditor` (description)
- `@/crd/forms/tags-input` (tags)
- `@/crd/primitives/separator`
- `@/crd/primitives/button`
- `@/crd/primitives/label`
- Internal `InlineSectionSave` (see below)

**Forbidden imports**: `@mui/*`, `formik`, `yup`, `react-quill`.

---

## `InnovationHubSpacesTab`

**File**: `src/crd/components/innovationHub/InnovationHubSpacesTab.tsx`

**Purpose**: Render the Spaces tab — header (title + subtitle + Add button), table with drag-reorder + remove, empty state.

**Props**: `InnovationHubSpacesTabProps` (see data-model.md).

**Composition**:
- Header row: `<h2 className="text-page-title">` + subtitle + `<Button>` (Add).
- `@dnd-kit/core` `<DndContext>` + `@dnd-kit/sortable` `<SortableContext>` wrapping the table body. Sensor setup identical to the legacy `InnovationHubSpacesField` (`PointerSensor` with `distance: 5`, `KeyboardSensor` with `sortableKeyboardCoordinates`).
- Table uses semantic `<table>`/`<thead>`/`<tbody>`/`<tr>` via the `@/crd/primitives/table.tsx` primitive. Columns: Name (with drag handle), Visibility (badge), Host Account, Actions (remove icon button).
- Visibility badge styling chosen from `visibility` variant — uses `color-mix(in srgb, var(--chart-2) 15%, transparent)` for `'active'`, muted for everything else. Falls under "inline style acceptable when Tailwind has no equivalent" rule.
- Empty state: muted box with i18n'd copy + an inline `<Button onClick={onAddClick}>` for fast recovery.
- The "remove" button calls `onRemoveRequest(row)` — the integration layer mounts the `ConfirmationDialog` to actually delete.

**Accessibility**:
- Drag handle has `aria-label={t('settings.spaces.dragHandle')}` and a visible `focus-visible:ring`.
- Table has `<caption className="sr-only">` describing the table's purpose.
- Remove button has `aria-label={t('settings.spaces.removeAria', { name: row.name })}`.

---

## `InlineSectionSave`

**File**: `src/crd/components/innovationHub/InlineSectionSave.tsx`

**Purpose**: A small status indicator + Save button used across the About tab sections.

**Props**:

```typescript
export type InlineSectionSaveProps = {
  dirty: boolean;
  status: 'idle' | 'saving' | 'saved';
  onSave: () => void;
  error?: string;
};
```

**Behaviour**:
- `status === 'saved'`: shows "Saved" + check icon, `aria-live="polite"` so screen readers announce.
- `status === 'saving'`: shows "Saving…" + spinning loader, `aria-live="polite"`.
- `status === 'idle'` AND `dirty`: shows a `Save` button.
- `status === 'idle'` AND `!dirty`: renders nothing (component body is empty `<></>`).
- `error` present: rendered as `<p role="alert" className="text-caption text-destructive">{error}</p>` next to the status.

**Animation**: uses Tailwind `animate-in fade-in slide-in-from-left-1 duration-200` per the prototype's reveal animation. No external animation library.

---

## CRD primitives needed (already exist — no new ports required)

All required primitives are present in `src/crd/primitives/` per the prior audit:
- `avatar.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `label.tsx`, `popover.tsx`, `separator.tsx`, `skeleton.tsx`, `sonner.tsx`, `table.tsx`, `tabs.tsx`, `textarea.tsx`, `tooltip.tsx`.

CRD composites reused: `@/crd/components/common/AlkemioSymbolSquare`, `@/crd/components/space/SpaceCard`, `@/crd/components/dialogs/ConfirmationDialog`, `@/crd/forms/markdown/MarkdownEditor`, `@/crd/forms/tags-input`.

---

## What's NOT included in the CRD layer

These belong in the integration layer (`src/main/crdPages/innovationHub/`), NOT in CRD presentational components:

- `useInnovationHubByIdQuery`, `useInnovationHubQuery`, `useInnovationHubSettingsQuery`, `useUpdateInnovationHubMutation`, `useUploadVisualMutation`
- `useUrlResolver`, `useResolveSpaceUrl`, `useConfig`
- `useCurrentUserContext`, authorization-privilege checks
- `useNavigate`, `<Navigate>`, route params
- The per-section save status machine (data only)
- The optimistic-update logic for `spaceListFilter`
- The privilege guard hook
- `pickColorFromId` calls — done in the data mapper, the colour is passed in as a prop
- `buildInnovationHubUrl`, `buildSettingsUrl` — done in the data mapper / integration page
