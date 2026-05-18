# Component Contracts — CRD Forum and Documentation Pages

This document specifies the public surface of every CRD component introduced by this feature. Each contract enumerates the props received, the events emitted (as callbacks), the rendering invariants, and the accessibility requirements.

> The component contracts replace the more usual REST/GraphQL contracts because this feature ships only frontend code. No backend or schema changes.

---

## 1. `ForumBanner` (new)

**Path**: `src/crd/components/forum/ForumBanner.tsx`
**Type**: Decorative page banner with title + subtitle + leading icon.

### Props in

```ts
type ForumBannerProps = {
  titleNode: ReactNode;
  subtitleNode: ReactNode;
  /** Icon node rendered in the rounded chip on the left (lucide-react MessageSquare by default
   *  in the consumer; the component itself does not import lucide-react). */
  iconNode: ReactNode;
};
```

### Events out

None. The banner is non-interactive.

### Rendering invariants

- Outer element: `<header>` with the dotted-pattern background (purple gradient + white SVG dot pattern at low opacity).
- Title uses `text-section-title md:text-page-title text-white`.
- Subtitle uses `text-body text-white/75 mt-1`.
- Icon chip uses `bg-white/15 size-9 rounded-md flex items-center justify-center`.
- No keyboard interactivity; `iconNode` should be `aria-hidden`.

### Accessibility

- Banner is wrapped in `<header role="banner">` (or `<header>` inside `<main>` per WAI-ARIA scoping rules).
- The title is the page's `<h1>`. Subtitle is `<p>`.

---

## 2. `ForumCategoryNav` (new)

**Path**: `src/crd/components/forum/ForumCategoryNav.tsx`
**Type**: Category filter — vertical sidebar on `md+`, embedded `Select` dropdown below `md`.

### Props in

```ts
import type { ForumCategoryEntry } from '@/crd/components/forum/forumTypes';

type ForumCategoryNavProps = {
  entries: ForumCategoryEntry[];
  activeSlug: string;
  onCategoryChange: (slug: string) => void;
  /** Translated heading rendered above the sidebar list (typically t('categories.sectionLabel')).
   *  Hidden visually below md, but still passed for the Select's accessible label. */
  sectionLabel: string;
  /** Translated aria-label for the mobile dropdown trigger when no value is selected. */
  selectAriaLabel: string;
};
```

### Events out

- `onCategoryChange(slug)` fires on sidebar button click and on `Select` value change.

### Rendering invariants

- Below the `md` breakpoint: renders a single `<Select>` (Radix UI primitive `src/crd/primitives/select.tsx`) with `value={activeSlug}`, `onValueChange={onCategoryChange}`, full width, full label as the trigger content.
- At and above `md`: renders a `<nav role="navigation">` with a `text-label uppercase opacity-60` heading (`sectionLabel`) and a vertical list of `<button>` entries; the active entry has `bg-accent text-accent-foreground font-medium`, others use `text-muted-foreground hover:bg-accent/50 hover:text-foreground`.
- Icon and label use `text-control` typography token; height is `h-9`; rows have `rounded-md`.
- The component is sticky on desktop (`sticky top-20`) so it stays visible while scrolling.

### Accessibility

- Each sidebar `<button>` has an `aria-current="page"` when its slug matches `activeSlug`.
- All buttons have visible focus rings (`focus-visible:ring-2 focus-visible:ring-ring`).
- The `<Select>` carries `aria-label={selectAriaLabel}` and is keyboard-operable per Radix defaults.

---

## 3. `ForumDiscussionList` + `ForumDiscussionListItem` (new)

**Paths**:
- `src/crd/components/forum/ForumDiscussionList.tsx`
- `src/crd/components/forum/ForumDiscussionListItem.tsx`

**Type**: Bordered card surface that wraps an unordered list of clickable discussion rows.

### `ForumDiscussionList` props in

```ts
import type { ForumDiscussionListItemData } from '@/crd/components/forum/forumTypes';

type ForumDiscussionListProps = {
  items: ForumDiscussionListItemData[];
  /** Rendered when items.length === 0 AND loading is false. Typically <ForumEmptyState />. */
  emptySlot: ReactNode;
  loading?: boolean;
  /** Optional slot for a loading row treatment (Skeletons). When omitted and `loading` is true,
   *  the component renders a default 5-row skeleton. */
  loadingSlot?: ReactNode;
};
```

### `ForumDiscussionListItem` props in

```ts
type ForumDiscussionListItemProps = {
  /** The full row data; the integration layer constructs this from the GraphQL response. */
  data: ForumDiscussionListItemData;
  /** Optional click callback. When provided, the row calls e.preventDefault on click and invokes
   *  the callback; when omitted, the row is a plain <a href> for browser-native navigation
   *  (middle-click, open-in-new-tab still work). */
  onActivate?: (id: string) => void;
};
```

### Events out

- `ForumDiscussionListItem.onActivate(id)` fires on left-click only when supplied; otherwise the `<a>`'s `href` carries the navigation.

### Rendering invariants

- `ForumDiscussionList` wrapper: `bg-card border border-border rounded-lg shadow-sm overflow-hidden`, `<ul role="list">` inside.
- Each item is `<li>` containing `<a href={data.href}>` with `flex items-start gap-3 w-full px-5 py-3.5 text-left hover:bg-accent/50`.
- The first column is `data.iconNode` (rendered at size-4 / size-5).
- The text column has the title in `text-card-title text-foreground line-clamp-1` and the meta line ("`{author}` on `{date}` · `{N}` comments") in `text-caption text-muted-foreground`.
- Borders between rows are produced via `border-b border-border` on the inner `<a>`, omitted on the last row.

### Accessibility

- Each row's `<a>` carries `aria-label={data.ariaLabel}` — a pre-composed label of the form "{title} by {author}, {date}, {N} comments" produced by the data mapper via `t('list.itemAriaLabel', { … })` so plural and locale-specific phrasing are resolved in the integration layer (the CRD component never composes translated strings for this label).
- Focus ring is `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- The list container has `role="list"`; each row is `<li>` (no `role` override).

---

## 4. `ForumDiscussionListHeader` (new)

**Path**: `src/crd/components/forum/ForumDiscussionListHeader.tsx`
**Type**: Header bar sitting above the discussion list — count, Initiate-Discussion slot, search input, sort selector.

### Props in

```ts
import type { ForumSortOrder } from '@/crd/components/forum/forumTypes';

type ForumDiscussionListHeaderProps = {
  /** Visible count text — typically t('list.headerCount', { count }). */
  countLabel: string;
  /** When undefined, the Initiate Discussion button is not rendered. The integration layer
   *  passes <Button>{t('list.initiate')}</Button> only when the viewer has CreateDiscussion. */
  initiateSlot?: ReactNode;
  searchValue: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  onSearchChange: (next: string) => void;
  sortValue: ForumSortOrder;
  sortAriaLabel: string;
  sortOptions: { value: ForumSortOrder; label: string }[];
  onSortChange: (next: ForumSortOrder) => void;
};
```

### Events out

- `onSearchChange(next)` fires on every keystroke in the search input.
- `onSortChange(next)` fires on `Select` value change.

### Rendering invariants

- Layout: two rows on mobile (count+Initiate, then search+sort), one row on `md+`.
- Count uses `text-card-title font-bold`; Initiate button slot is right-aligned.
- Search input has a leading lucide `Search` icon (`absolute top-1/2 -translate-y-1/2 left-3 size-4 text-muted-foreground`).
- Sort `<Select>` has `w-28 h-9` on desktop, full-width on mobile.

### Accessibility

- Search `<input>` has `aria-label={searchAriaLabel}` (also visible placeholder).
- Sort `<Select>` trigger has `aria-label={sortAriaLabel}`.

---

## 5. `ForumEmptyState` (new)

**Path**: `src/crd/components/forum/ForumEmptyState.tsx`

### Props in

```ts
type ForumEmptyStateProps = {
  title: string;
  subtitle: string;
  iconNode?: ReactNode;
};
```

### Rendering invariants

- Centered, `py-12 px-6 text-center`.
- Icon (default lucide `MessageSquare` size-10 with `text-muted-foreground/40`) rendered above title.
- Title `text-body text-muted-foreground`, subtitle `text-caption text-muted-foreground mt-1`.

### Accessibility

- Empty state container is `<div role="status" aria-live="polite">` so screen readers announce the change when filters reduce results to zero.

---

## 6. `ForumDiscussionDetail` (new)

**Path**: `src/crd/components/forum/ForumDiscussionDetail.tsx`
**Type**: Discussion detail card — back link, header (icon + title + share), author row, body slot, comments slot.

### Props in

```ts
import type { ForumDiscussionDetailData } from '@/crd/components/forum/forumTypes';

type ForumDiscussionDetailProps = {
  data: ForumDiscussionDetailData;
  /** Pre-resolved href for the back link; computed by the integration layer as
   *  `/forum/<categorySlug>` (Clarification Q5 / Decision 9). */
  backHref: string;
  /** Translated label for the back link (e.g. "See all discussions"). */
  backLabel: string;
  /** ReactNode containing the comments thread; the integration layer mounts
   *  <DiscussionCommentsConnector roomId={data.commentsRoomId} /> here. */
  commentsSlot: ReactNode;
  /** Translated copies for the icon-button tooltips/aria-labels. */
  shareLabel: string;
  editLabel: string;
  deleteLabel: string;
  /** When supplied, used instead of an internal <ShareButton>. Omit to fall back to
   *  the default ShareButton wired to data.shareUrl. */
  shareSlot?: ReactNode;
};
```

### Events out

- Edit / Delete callbacks come from `data.onEdit` and `data.onDelete`. The icon buttons render only when those callbacks are provided.

### Rendering invariants

- Top: `<a href={backHref}>` styled with `flex items-center gap-1.5 mb-4 text-body-emphasis text-muted-foreground hover:text-foreground` and a leading `<ArrowLeft size-4 aria-hidden />`.
- Card body: `<Card>` with `<CardHeader>` containing `<h2 className="text-section-title">{data.iconNode} {data.title}</h2>` plus the share button on the right.
- Author row: avatar (with `pickColorFromId` fallback when avatarUrl is missing) + name (text-card-title) + date (text-caption) + edit/delete icon buttons.
- Body: `data.body.contentNode` rendered inside the card body. The integration layer wraps the markdown in `<MarkdownContent>` from `src/crd/components/common/MarkdownContent.tsx`.
- Separator before the comments section.
- Comments section: `commentsSlot` rendered as-is.

### Accessibility

- Back link is a real `<a>` with `aria-label={backLabel}`.
- Edit/Delete icon buttons have `aria-label={editLabel} / aria-label={deleteLabel}` and visible focus rings.
- Share button (when not slotted) reuses `src/crd/components/common/ShareButton.tsx`, which already provides accessible labels.

---

## 7. `ForumInitiateDiscussionDialog` (new)

**Path**: `src/crd/components/forum/ForumInitiateDiscussionDialog.tsx`
**Type**: Radix Dialog shell. Body content is a `children` slot — the integration layer mounts the Formik-driven form inside.

### Props in

```ts
type ForumInitiateDiscussionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Selects the title and submit-button copy; the body is the same in both modes. */
  mode: 'initiate' | 'update';
  /** Translated title text — the consumer typically passes t('dialog.create.title')
   *  or t('dialog.update.title') based on `mode`. */
  title: string;
  /** Translated submit-button label. */
  submitLabel: string;
  /** Translated cancel-button label. */
  cancelLabel: string;
  /** When true, the submit button is disabled (form invalid) and busy=true, the form
   *  is non-interactive. Both flags come from the Formik form via context props. */
  submitDisabled: boolean;
  busy: boolean;
  /** Submit handler invoked when the user clicks the submit button. The handler is
   *  the consumer's bridge to Formik's submitForm(). */
  onSubmit: () => void;
  /** Body content — the consumer mounts <ForumDiscussionFormConnector ... /> here. */
  children: ReactNode;
};
```

### Events out

- `onOpenChange(false)` fires on X click, Escape key, outside-click, or Cancel click. The consumer is responsible for navigating to `/forum` on close.
- `onSubmit()` fires on submit-button click. The consumer's submit handler runs Formik's submission.

### Rendering invariants

- `Dialog` is controlled (`open` from props); never self-mounts.
- `DialogContent` classes: `w-full sm:max-w-4xl p-0 gap-0 overflow-hidden rounded-xl border-0 shadow-2xl bg-background flex flex-col max-h-[90vh]`.
- Sticky header (`px-6 py-4 border-b backdrop-blur-sm`) with `<DialogTitle className="text-subsection-title">{title}</DialogTitle>` and a close button (`X` icon) in the top-right.
- Scrollable body (`flex-1 overflow-y-auto p-6 space-y-6`) renders `children`.
- Sticky footer (`px-6 py-4 border-t bg-muted/10 flex items-center justify-between`) with Cancel button on the left and Submit button on the right.
- Submit button uses `text-control font-medium`.

### Accessibility

- `DialogTitle` is the dialog's accessible name.
- Close button (X) has `aria-label={cancelLabel}` (or a separate translated label like `closeLabel`).
- Focus is trapped inside the dialog by Radix; the first focusable element on open is the title input inside `children` (or the close button if `children` is empty).
- Pressing Escape closes the dialog (Radix default).

---

## 8. `ForumLayout` (new)

**Path**: `src/crd/components/forum/ForumLayout.tsx`
**Type**: Page-level layout shell — composes banner + 12-column grid (sidebar + main).

### Props in

```ts
type ForumLayoutProps = {
  /** Optional ribbon node (e.g. Innovation Hub outside-of-space ribbon). Rendered above the banner. */
  ribbonNode?: ReactNode;
  bannerNode: ReactNode;
  sidebarNode: ReactNode;
  mainNode: ReactNode;
};
```

### Rendering invariants

- Outer container: `flex flex-col w-full px-6 md:px-8 pb-12`.
- Ribbon row (when provided): full-width above the banner.
- Banner row uses the prototype's grid: `grid grid-cols-12 gap-6` with the banner spanning `col-span-12 lg:col-start-2 lg:col-span-10`.
- Body row uses `grid grid-cols-12 gap-6` with sidebar at `col-span-3 lg:col-span-2 lg:col-start-2 hidden md:block` and main at `col-span-12 md:col-span-9 lg:col-span-8`.
- On mobile, the sidebar slot is empty (`ForumCategoryNav` itself decides whether to render the dropdown above the list).

---

## 9. `DocumentationFrame` (new)

**Path**: `src/crd/components/documentation/DocumentationFrame.tsx`
**Type**: Pure iframe renderer for the embedded external documentation site.

### Props in

```ts
type DocumentationFrameProps = {
  /** Absolute URL; when undefined, the iframe is not rendered. */
  src: string | undefined;
  title: string;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  /** Initial inline height; defaults to '100vh'. The integration hook mutates the
   *  iframe's style.height directly via the ref to apply PAGE_HEIGHT updates. */
  initialHeight?: string;
};
```

### Events out

None. The component is purely presentational.

### Rendering invariants

- When `src` is undefined: the component renders nothing (returns `null`).
- When `src` is defined: renders a single `<iframe>` with:
  - `src={src}`
  - `title={title}` (required for accessibility)
  - `sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"` (verbatim from the legacy MUI page)
  - `ref={iframeRef}`
  - `style={{ width: '100%', height: initialHeight ?? '100vh', border: 'none' }}`
- Inline `style` is acceptable here per `src/crd/CLAUDE.md` § "When inline `style` is acceptable" — the iframe height is a runtime-computed value that has no Tailwind equivalent and is mutated directly via the ref.

### Accessibility

- The `title` attribute is required (FR-039) and resolved by the integration layer from `crd-documentation:frameLabel` with a fallback to `pages.documentation.title`.
- No focus trap; the iframe content's own focus management is preserved.

---

## Component diagram

```text
                                  ┌──────────────────────────────────────────┐
TopLevelRoutes.tsx ── useCrdEnabled() ──┐                                    │
                       │                ▼                                    ▼
                       │       ┌────────────────────┐               ┌─────────────────┐
                       │       │ CrdLayoutWrapper   │               │ TopLevelLayout  │
                       │       │  (CRD shell)       │               │  (MUI shell)    │
                       │       └────────────────────┘               └─────────────────┘
                       │                │                                    │
        ┌──────────────┘                ▼                                    ▼
        │                       ┌────────────────────┐               ┌─────────────────┐
        │ /forum/*    ─────►    │ CrdForumRoute      │               │ ForumRoute      │
        │                       │  (integration)     │               │  (legacy MUI)   │
        │                       └────────────────────┘               └─────────────────┘
        │                                │
        │                                ├── CrdForumPage (landing)
        │                                │     ├── ForumLayout ◄── ribbonNode (innovationHub.outsideOfSpace.forum)
        │                                │     │     ├── ForumBanner
        │                                │     │     ├── ForumCategoryNav (sidebar / mobile dropdown)
        │                                │     │     └── main:
        │                                │     │           ├── ForumDiscussionListHeader (count, initiate slot, search, sort)
        │                                │     │           └── ForumDiscussionList → many ForumDiscussionListItem
        │                                │     │                                  └── ForumEmptyState (when no items)
        │                                │     └── ForumInitiateDiscussionDialog (when ?dialog=new or button click)
        │                                │           └── ForumDiscussionFormConnector (Formik)
        │                                │
        │                                └── CrdDiscussionPage (detail)
        │                                      ├── ForumDiscussionDetail
        │                                      │     ├── header: iconNode + title + ShareButton
        │                                      │     ├── author row + edit/delete icon buttons
        │                                      │     ├── body: <MarkdownContent>
        │                                      │     └── commentsSlot:
        │                                      │           └── DiscussionCommentsConnector
        │                                      │                 └── CommentThread → CommentInput + many CommentItem
        │                                      ├── ForumInitiateDiscussionDialog (mode="update", when isEditOpen)
        │                                      └── ConfirmationDialog (when pendingDeleteDiscussion or pendingDeleteCommentId)
        │
        └─ /docs/*   ─────►    CrdDocumentationPage (integration)
                                     ├── usePageTitle(t('pages.titles.documentation'))
                                     ├── useDocumentationFrame() ◄── reads window._env_.locations.documentation,
                                     │                              ◄── handles postMessage(PAGE_HEIGHT|PAGE_CHANGE)
                                     └── DocumentationFrame  (pure iframe renderer)

           /documentation/*  ───►    RedirectDocumentation  (shared by both branches; zero MUI imports)
```

---

## Cross-cutting accessibility checklist (applies to every component above)

- [ ] No clickable `<span>` or `<div>` — use `<a>`, `<button>`, or Radix primitives.
- [ ] All icon-only buttons have an `aria-label` resolved via `t()`.
- [ ] All decorative icons have `aria-hidden="true"`.
- [ ] All interactive elements have `focus-visible:ring-2 focus-visible:ring-ring`.
- [ ] All user-visible strings come from `useTranslation('crd-forum' | 'crd-documentation')` *or* are passed in as props (never hardcoded English strings in JSX).
- [ ] All form inputs have a persistent `aria-label` even when the placeholder disappears.
- [ ] Lists use `<ul role="list">` with `<li>` children.
- [ ] Loading states use `<output>` or `role="status"` + `aria-label`.
- [ ] Submit buttons during in-flight mutations carry `aria-busy={true}` and `disabled`.
- [ ] Color is never the sole indicator of state — text and icons accompany every status cue.
