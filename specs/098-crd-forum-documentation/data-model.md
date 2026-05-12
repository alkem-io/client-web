# Data Model — CRD Forum and Documentation Pages

This document specifies the in-memory data shapes the new CRD components consume and the local state they own. It is the contract between the CRD presentational layer (`src/crd/components/{forum,documentation}/`) and the integration layer (`src/main/crdPages/topLevelPages/{forum,documentation}/`). No GraphQL schema changes are introduced; all types here are plain TypeScript ports of existing GraphQL types, computed once in the data mapper and passed in as props.

---

## Part 1 — Forum

### `ForumCategoryEntry`

One entry in the category sidebar / mobile dropdown. Returned by the data mapper after merging the synthetic "All" entry with the platform's real categories.

```ts
type ForumCategoryEntry = {
  /** URL slug used in /forum/<slug>; the synthetic 'all' entry uses 'all' but the
   *  consumer maps that to the bare /forum route. */
  slug: string;
  /** Translated label, e.g. 'Show all', 'Releases', 'Need help?'. Resolved by the
   *  integration layer using the existing common.enums.discussion-category.* keys
   *  for real categories and a new key for 'All'. */
  label: string;
  /** React node already resolved with the right icon — typically the existing
   *  <DiscussionIcon category={...} /> from src/domain/communication/discussion/views/.
   *  CRD components never compute this themselves; they just render the node. */
  iconNode: ReactNode;
};
```

**Validation rules**:

- `slug` is non-empty and unique within the entries array.
- `label` is non-empty (the data mapper guarantees translation resolution).
- `iconNode` may be any ReactNode — the consumer decides what icon to render (matches Clarification Q1 / Decision 8).

### `ForumDiscussionListItemData`

One row in the discussion list. **Deliberately has no `emoji` field** (Clarification Q1 / Decision 8): the leading visual is `iconNode`.

```ts
type ForumDiscussionListItemData = {
  id: string;
  title: string;
  /** Resolved category icon node (typically <DiscussionIcon category={...} />).
   *  When the discussion's category is unknown/missing, the data mapper provides a
   *  generic message-square fallback so the row is never visually broken. */
  iconNode: ReactNode;
  author: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  /** Localized formatted date string ('Tue, 24/06/2025'). The integration layer
   *  formats with date-fns + the resolved locale; CRD components never format dates. */
  formattedDate: string;
  commentCount: number;
  /** Absolute href for the row; the integration layer reads it from
   *  discussion.profile.url (which is /forum/discussion/<nameId>). */
  href: string;
  /** Pre-composed accessible label for the row's <a> element, of the form
   *  "{title} by {author}, {date}, {N} comments". Built by the data mapper via
   *  t('list.itemAriaLabel', { title, author, date, count }) from the crd-forum
   *  namespace so plural rules (e.g. 0/1/N comments in the active locale) and
   *  locale-specific connective words ("by") are resolved in the integration
   *  layer. The CRD ForumDiscussionListItem renders it verbatim — it does not
   *  itself compose translated strings for this label. */
  ariaLabel: string;
};
```

**Validation rules**:

- `id`, `title`, `href` are non-empty (rows missing any of these are filtered out by the data mapper before reaching the list).
- `formattedDate` is a plain string already in the user's current locale.
- `commentCount` is a non-negative integer.

### `ForumSortOrder`

```ts
type ForumSortOrder = 'newest' | 'oldest';
```

The default is `'newest'`. Only those two values are surfaced in the CRD `Select` to match the prototype.

### `ForumDiscussionDetailData`

The view model for the discussion detail page.

```ts
type ForumDiscussionDetailData = {
  id: string;
  /** Same as ForumDiscussionListItemData.iconNode — used in the header. */
  iconNode: ReactNode;
  title: string;
  /** Slug used to compute the back-link href (`/forum/<categorySlug>`).
   *  Falls back to undefined → consumer renders backHref = '/forum'. */
  categorySlug: string | undefined;
  shareUrl: string;
  body: {
    /** Pre-rendered ReactNode containing the markdown body. The integration layer
     *  passes <MarkdownContent>...</MarkdownContent> from src/crd/components/common/.
     *  CRD components never call into a markdown renderer themselves. */
    contentNode: ReactNode;
  };
  author: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    /** Color used as deterministic accent for missing-avatar fallback,
     *  derived from author.id via pickColorFromId. */
    avatarColor: string;
  };
  /** Localized formatted date string for the author row. */
  formattedDate: string;
  /** Privilege-gated callbacks. Consumer omits when the viewer lacks privilege. */
  onEdit?: () => void;
  onDelete?: () => void;
};
```

**Validation rules**:

- `shareUrl` is a fully qualified URL (the integration layer resolves it from `window.location.origin + discussion.profile.url`).
- `categorySlug` is `undefined` only when the discussion lacks a category.
- `body.contentNode` is always provided; on loading the integration layer renders a `<Skeleton>` node.

### Category slug ↔ enum mapping (`useCategorySlug.ts`)

The integration layer owns the bidirectional map. Mirrors the legacy `DiscussionCategoryPlatform` enum in `src/domain/communication/discussion/pages/ForumPage.tsx` so all six real categories map to the same URL paths the legacy MUI Forum already uses (`/forum/releases`, `/forum/platform-functionalities`, etc.).

```ts
import { ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';

const ALL = 'all';

const slugByCategory: Record<ForumDiscussionCategory, string> = {
  [ForumDiscussionCategory.Releases]: 'releases',
  [ForumDiscussionCategory.PlatformFunctionalities]: 'platform-functionalities',
  [ForumDiscussionCategory.CommunityBuilding]: 'community-building',
  [ForumDiscussionCategory.ChallengeCentric]: 'challenge-centric',
  [ForumDiscussionCategory.Help]: 'help',
  [ForumDiscussionCategory.Other]: 'other',
};

const categoryBySlug: Record<string, ForumDiscussionCategory | undefined> =
  Object.fromEntries(
    Object.entries(slugByCategory).map(([cat, slug]) => [slug, cat as ForumDiscussionCategory])
  );
```

**Edge case**: A URL slug not present in `categoryBySlug` (and not equal to `ALL`) is treated as `ALL` (the spec's edge case "Unknown category in URL").

### Forum page integration state (`CrdForumPage.tsx`)

Owns the visual-only state for the landing page.

```ts
type ForumPageLocalState = {
  /** Free-text search; resets to '' on navigation (Clarification Q2). */
  searchQuery: string;
  /** Sort order; resets to 'newest' on navigation (Clarification Q2). */
  sortOrder: ForumSortOrder;
};
```

The category selection is *not* part of local state — it is derived from `useParams<{ categorySlug?: string }>()` and reflected back to the URL on change.

### `CrdDiscussionPage` integration state

```ts
type DiscussionPageLocalState = {
  /** ID of the message the user has marked for deletion; rendered confirmation
   *  via the existing CRD ConfirmationDialog. */
  pendingDeleteCommentId: string | undefined;
  /** True iff the user has clicked the trash icon for the discussion itself. */
  pendingDeleteDiscussion: boolean;
  /** True iff the user has clicked the pencil icon to edit the discussion;
   *  the integration layer mounts <ForumInitiateDiscussionDialog mode="update">
   *  with a Formik form pre-populated with the current discussion. */
  isEditOpen: boolean;
};
```

### Translation key inventory — `crd-forum`

All keys live under the `crd-forum` namespace at `src/crd/i18n/forum/forum.<lang>.json`. All six locales (en, nl, es, bg, de, fr) carry every key.

```jsonc
{
  "banner": {
    "title": "Welcome to the Alkemio Forum",
    "subtitle": "Connect with others, ask questions, and stay updated with Alkemio's release notes"
  },
  "categories": {
    "all": "Show all",
    "sectionLabel": "Categories"
  },
  "list": {
    "headerCount_one": "Discussions ({{count}})",
    "headerCount_other": "Discussions ({{count}})",
    "initiate": "Initiate Discussion",
    "searchPlaceholder": "Search",
    "searchAriaLabel": "Search discussions",
    "itemAriaLabel_one": "{{title}} by {{author}}, {{date}}, {{count}} comment",
    "itemAriaLabel_other": "{{title}} by {{author}}, {{date}}, {{count}} comments",
    "sort": {
      "ariaLabel": "Sort discussions",
      "newest": "Newest",
      "oldest": "Oldest"
    },
    "empty": {
      "title": "No discussions found",
      "subtitle": "Try adjusting your search or category filter"
    },
    "loading": "Loading discussions"
  },
  "detail": {
    "back": "See all discussions",
    "share": "Share",
    "edit": "Edit",
    "delete": "Delete",
    "loading": "Loading discussion"
  },
  "dialog": {
    "create": {
      "title": "Create Discussion",
      "submit": "Create Discussion"
    },
    "update": {
      "title": "Edit Discussion",
      "submit": "Save Changes"
    },
    "fields": {
      "title": "Title",
      "category": "Category *",
      "tags": "Tags",
      "tagsPlaceholder": "Add tags separated by commas...",
      "body": "Share your thoughts..."
    },
    "cancel": "Cancel",
    "close": "Close"
  }
}
```

**Plural keys**: i18next plural keys (`headerCount_one` / `headerCount_other`, `itemAriaLabel_one` / `itemAriaLabel_other`) above use the standard CLDR plural categories. The English source file uses only `_one` / `_other` because English has two plural forms. Locale authors for the other five languages MUST add whichever CLDR categories their language requires (Russian / Bulgarian-style `_few` / `_many`, German singular vs. zero, etc.) — do NOT mirror the English file's plural-key shape literally if the target language has additional categories. i18next falls back to `_other` when an exact category form is missing, so adding more categories is purely additive.

Long-standing keys read from the default `translation` namespace by the integration layer (NOT duplicated into `crd-forum`):

- `pages.titles.forum`, `pages.forum.title`, `pages.forum.subtitle`, `pages.forum.shortName`
- `common.enums.discussion-category.RELEASES`, `…COMMUNITY_BUILDING`, `…PLATFORM_FUNCTIONALITIES`, `…CHALLENGE_CENTRIC`, `…HELP`, `…OTHER`
- `common.show-all` (already used by the MUI Forum's `ALL_CATEGORIES` row)
- `components.discussion.delete-discussion`, `components.discussion.delete-comment`
- `innovationHub.outsideOfSpace.forum`

The discussion-count text (e.g. "Discussions (5)") is rendered via `t('list.headerCount', { count })` from `crd-forum`, NOT via the legacy default-namespace key `components.discussions-list.title`. The two keys carry the same English copy today, but reusing the CRD-namespace key keeps with the rule that CRD-only display strings live in CRD namespaces — and it leaves the legacy key untouched for the MUI Forum (toggle-off path).

The `crd-forum` namespace is loaded lazily on demand. Per `src/crd/CLAUDE.md` § "Adding a new feature namespace", the namespace is registered in `src/core/i18n/config.ts` `crdNamespaceImports` and in `@types/i18next.d.ts`.

---

## Part 2 — Documentation

### `DocumentationFrameProps`

```ts
type DocumentationFrameProps = {
  /** Absolute URL to load (resolved by the integration layer from window._env_.locations.documentation
   *  + the path segment after /docs/). When undefined the iframe is not rendered (FR-032). */
  src: string | undefined;
  /** Translated iframe title (loaded from crd-documentation's frameLabel key, with a fallback to
   *  the long-standing pages.documentation.title). Required for accessibility. */
  title: string;
  /** Forwarded ref so the integration layer's hook can update the iframe's height
   *  in response to PAGE_HEIGHT messages. */
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  /** Initial height applied via inline style; the hook updates it dynamically.
   *  Defaults to '100vh' when not supplied. */
  initialHeight?: string;
};
```

The component renders nothing else — no banner, no toolbar (Clarification Q4 / Decision 7).

### Iframe `postMessage` protocol (preserved verbatim)

```ts
type DocumentationMessageType = 'PAGE_HEIGHT' | 'PAGE_CHANGE';

type DocumentationPageHeightMessage = {
  type: 'PAGE_HEIGHT';
  height: number;
};

type DocumentationPageChangeMessage = {
  type: 'PAGE_CHANGE';
  url: string;
};

type DocumentationMessage = DocumentationPageHeightMessage | DocumentationPageChangeMessage;
```

**Origin check** (mirrors `getCurrentOriginWithoutPort` from the MUI page): a message is processed only when `event.origin.startsWith(`${window.location.protocol}//${window.location.hostname}`)`. This rejects messages from any other origin (FR-030).

**Handling**:

- `PAGE_HEIGHT`: the hook updates the iframe ref's `style.height` to `${message.height}px`.
- `PAGE_CHANGE`: the hook calls `navigate(`/docs${message.url}`, { replace: true })` and `scrollToTop()`.

### Integration state (`useDocumentationFrame.ts`)

```ts
type DocumentationFrameHookResult = {
  src: string;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
};
```

The hook:

1. Computes `src = `${locations.documentation}/${docsInternalPath ?? ''}`` once per mount (matches the legacy page's `useEffect(() => setSrc(...), [])` pattern; src is set once and the iframe handles internal navigation thereafter).
2. Adds a `message` listener on `window`, scoped by the origin check.
3. Updates `iframeRef.current.style.height` on `PAGE_HEIGHT`.
4. Calls `navigate('/docs' + url, { replace: true })` and `scrollToTop()` on `PAGE_CHANGE`.
5. Removes the listener on unmount.

### Translation key inventory — `crd-documentation`

```jsonc
{
  "frameLabel": "Alkemio documentation",
  "loading": "Loading documentation"
}
```

Long-standing keys read from the default `translation` namespace by the integration layer (NOT duplicated into `crd-documentation`):

- `pages.titles.documentation` (browser tab title)
- `pages.documentation.title` (used as a fallback for `frameLabel` if needed)
- `pages.documentation.subtitle` (currently unused in the CRD page since there is no banner per Clarification Q4)

---

## Part 3 — Cross-cutting

### Routing wiring (`TopLevelRoutes.tsx`)

Two new lazy imports added alongside the existing MUI lazy imports:

```ts
const CrdForumRoute = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/topLevelPages/forum/CrdForumRoute')
);
const CrdDocumentationPage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/topLevelPages/documentation/CrdDocumentationPage')
);
```

Toggle-gated branches:

- For `/forum/*`: when `crdEnabled` is true, the route renders `<CrdLayoutWrapper><CrdForumRoute /></CrdLayoutWrapper>`. Otherwise the existing MUI `<ForumRoute />` chain is used.
- For `/docs/*`: when `crdEnabled` is true, the route renders `<CrdLayoutWrapper><CrdDocumentationPage /></CrdLayoutWrapper>`. Otherwise the existing MUI `<DocumentationPage />` chain is used.
- For `/documentation/*`: the existing `<RedirectDocumentation />` is reused unchanged in **both** branches (Decision 4).

Both new variants are wrapped in `Suspense` + `WithApmTransaction` + `NonIdentity` exactly as the existing MUI variants are.

### i18n config registration (`src/core/i18n/config.ts`)

Two new entries added to `crdNamespaceImports`:

```ts
'crd-forum': {
  en: () => import('@/crd/i18n/forum/forum.en.json'),
  nl: () => import('@/crd/i18n/forum/forum.nl.json'),
  es: () => import('@/crd/i18n/forum/forum.es.json'),
  bg: () => import('@/crd/i18n/forum/forum.bg.json'),
  de: () => import('@/crd/i18n/forum/forum.de.json'),
  fr: () => import('@/crd/i18n/forum/forum.fr.json'),
},
'crd-documentation': {
  en: () => import('@/crd/i18n/documentation/documentation.en.json'),
  nl: () => import('@/crd/i18n/documentation/documentation.nl.json'),
  es: () => import('@/crd/i18n/documentation/documentation.es.json'),
  bg: () => import('@/crd/i18n/documentation/documentation.bg.json'),
  de: () => import('@/crd/i18n/documentation/documentation.de.json'),
  fr: () => import('@/crd/i18n/documentation/documentation.fr.json'),
},
```

### Type augmentation (`@types/i18next.d.ts`)

Two new resource shapes registered alongside the existing CRD namespaces, matching the JSON structure above. This keeps `useTranslation('crd-forum')` and `useTranslation('crd-documentation')` strongly typed.
