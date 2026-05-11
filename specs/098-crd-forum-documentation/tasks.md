---

description: "Task list for CRD Forum and Documentation Pages"
---

# Tasks: CRD Forum and Documentation Pages

**Input**: Design documents from `/specs/098-crd-forum-documentation/`
**Prerequisites**: plan.md (✓), spec.md (✓), research.md (✓), data-model.md (✓), contracts/crd-components.md (✓), quickstart.md (✓)

**Tests**: Tests are NOT generated as separate tasks. The spec did not request TDD; the project uses Vitest for unit tests on non-trivial logic (no new non-trivial logic is introduced — all data flows reuse existing hooks). Manual validation is covered by the quickstart matrix run in Phase 6 and post-design Constitution Check.

**Organization**: Tasks are grouped by user story so each story can be completed and validated as an independent increment. US1 (read-Forum) is the natural MVP; US2 (read-Docs) is also P1 and can run in parallel with US1 if staffed; US3 (write-Forum) is P2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks).
- **[Story]**: Maps to spec.md user stories (US1, US2, US3). Setup, Foundational, and Polish phases carry no Story label.

## Path conventions

This is a single Web SPA repository. New files live under:

- `src/crd/components/forum/`, `src/crd/components/documentation/` — pure CRD presentational components.
- `src/crd/i18n/forum/`, `src/crd/i18n/documentation/` — CRD i18n namespaces.
- `src/main/crdPages/topLevelPages/forum/`, `src/main/crdPages/topLevelPages/documentation/` — integration layer.
- `src/main/routing/TopLevelRoutes.tsx`, `src/core/i18n/config.ts`, `@types/i18next.d.ts` — modified.

Legacy MUI files under `src/domain/communication/discussion/` and `src/main/documentation/` are **untouched**.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Pre-flight on the existing repo; no project initialisation needed.

- [X] T001 Confirm working tree is clean on branch `098-crd-forum-documentation` and `pnpm install` is up to date (no lockfile changes; Volta-pinned Node 24.14.0)
- [X] T002 Run baseline `pnpm lint` and `pnpm vitest run` to confirm the branch is green before any new code lands

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: i18n namespaces, plain-TS types, and the category-slug map. Both user stories load CRD strings and consume the type modules; without these, no CRD component can be authored or imported.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Create `src/crd/i18n/forum/forum.en.json` with the complete key inventory specified in `specs/098-crd-forum-documentation/data-model.md` § "Translation key inventory — `crd-forum`" (banner, categories, list, detail, dialog — read AND write keys; the dialog block is needed by US3 but is added now to keep all six locales in lockstep with one foundational source)
- [X] T004 Create `src/crd/i18n/documentation/documentation.en.json` with the complete key inventory specified in `specs/098-crd-forum-documentation/data-model.md` § "Translation key inventory — `crd-documentation`" (`frameLabel`, `loading`)
- [X] T005 Register the two new namespaces (`crd-forum`, `crd-documentation`) in `src/core/i18n/config.ts` `crdNamespaceImports` — six lazy imports per namespace (one per supported locale), exactly as specified in `specs/098-crd-forum-documentation/data-model.md` § "i18n config registration"; depends on T003 and T004
- [X] T006 Add resource-shape type augmentations for `crd-forum` and `crd-documentation` in `@types/i18next.d.ts` so `useTranslation('crd-forum')` and `useTranslation('crd-documentation')` are strongly typed; depends on T005
- [X] T007 [P] Create `src/crd/components/forum/forumTypes.ts` exporting `ForumCategoryEntry`, `ForumDiscussionListItemData`, `ForumDiscussionDetailData`, and `ForumSortOrder` exactly as specified in `specs/098-crd-forum-documentation/data-model.md` § Part 1 (no per-discussion `emoji` field per Clarification Q1)
- [X] T008 [P] Create `src/crd/components/documentation/documentationTypes.ts` exporting `DocumentationFrameProps` exactly as specified in `specs/098-crd-forum-documentation/data-model.md` § Part 2
- [X] T009 [P] Create `src/main/crdPages/topLevelPages/forum/useCategorySlug.ts` exporting the bidirectional `slugByCategory` and `categoryBySlug` maps + an `ALL` constant (`'all'`), and helper functions `slugFor(category)` and `categoryFor(slug)`. `categoryFor` returns `undefined` for the synthetic `'all'` slug AND for any unknown slug — both cases route to the unfiltered "All" view (Edge Case "Unknown category in URL" in spec.md). Mirror the legacy `DiscussionCategoryPlatform` enum exactly so URL paths stay identical to the MUI Forum

**Checkpoint**: i18n namespaces load, plain-TS prop types are importable, category ↔ slug conversion is available — user story implementation can begin.

---

## Phase 3: User Story 1 — Browse the Forum and read a discussion in the new design (Priority: P1) 🎯 MVP

**Goal**: With the CRD toggle on, opening `/forum` and `/forum/<categorySlug>` renders the Welcome banner, category sidebar, discussion list (with search + sort), and detail page through the CRD shell — fully wired to live GraphQL data and live forum/room subscriptions. Comment posting and discussion CRUD are out of scope for this story (US3) but the comment list is rendered read-only from the existing CRD comment components.

**Independent Test**: Enable the CRD toggle, sign in as a regular member, visit `/forum`, verify the banner + real categories + real discussion list + real subscription updates. Click into a discussion, verify body, author meta, share button, and existing comments render. With the toggle off, the legacy MUI Forum still works unchanged. Maps to spec acceptance scenarios US1#1–#8 and quickstart sections A and B.

### CRD presentational layer for US1

The eight CRD components below all live in different files and depend only on `forumTypes.ts` (T007) — they can be authored in parallel.

- [X] T010 [P] [US1] Implement `src/crd/components/forum/ForumBanner.tsx` per `contracts/crd-components.md` § 1 — props `titleNode`, `subtitleNode`, `iconNode`; purple gradient + white SVG dot pattern; `text-section-title md:text-page-title text-white`; `aria-hidden` on the icon chip
- [X] T011 [P] [US1] Implement `src/crd/components/forum/ForumLayout.tsx` per `contracts/crd-components.md` § 8 — props `ribbonNode?`, `bannerNode`, `sidebarNode`, `mainNode`; outer `flex flex-col w-full px-6 md:px-8 pb-12`; banner row at `lg:col-start-2 lg:col-span-10`; body row with sidebar at `col-span-3 lg:col-span-2 lg:col-start-2 hidden md:block` and main at `col-span-12 md:col-span-9 lg:col-span-8`
- [X] T012 [P] [US1] Implement `src/crd/components/forum/ForumCategoryNav.tsx` per `contracts/crd-components.md` § 2 — props `entries`, `activeSlug`, `onCategoryChange`, `sectionLabel`, `selectAriaLabel`; vertical sidebar on `md+` (sticky, button rows with `aria-current="page"` for the active slug); embedded Radix `Select` below `md` (Clarification Q3 / Decision 6)
- [X] T013 [P] [US1] Implement `src/crd/components/forum/ForumDiscussionListItem.tsx` per `contracts/crd-components.md` § 3 — props `data: ForumDiscussionListItemData`, `onActivate?`; `<li>` containing `<a href={data.href} aria-label={data.ariaLabel}>` with category icon + title (`text-card-title line-clamp-1`) + meta line (`text-caption`). The component renders `data.ariaLabel` verbatim — it does NOT compose the label itself (composition + plural / locale phrasing live in the data mapper, T023). Visible `focus-visible:ring`
- [X] T014 [P] [US1] Implement `src/crd/components/forum/ForumDiscussionListHeader.tsx` per `contracts/crd-components.md` § 4 — props `countLabel`, `initiateSlot?` (rendered only when supplied), `searchValue`, `searchPlaceholder`, `searchAriaLabel`, `onSearchChange`, `sortValue`, `sortAriaLabel`, `sortOptions`, `onSortChange`; two-row layout on mobile, single-row on `md+`; lucide `Search` icon inside the input; sort `<Select>` is `w-28 h-9` on desktop, full-width on mobile
- [X] T015 [P] [US1] Implement `src/crd/components/forum/ForumEmptyState.tsx` per `contracts/crd-components.md` § 5 — props `title`, `subtitle`, `iconNode?` (defaults to lucide `MessageSquare`); centered with `role="status" aria-live="polite"`
- [X] T016 [US1] Implement `src/crd/components/forum/ForumDiscussionList.tsx` per `contracts/crd-components.md` § 3 — wraps `<ul role="list">` of `ForumDiscussionListItem` rows inside a `bg-card border border-border rounded-lg shadow-sm overflow-hidden` surface; renders `emptySlot` when `items.length === 0 && !loading`; renders `loadingSlot` (or default 5-row Skeleton) when `loading`; depends on T013 and T015
- [X] T017 [P] [US1] Implement `src/crd/components/forum/ForumDiscussionDetail.tsx` per `contracts/crd-components.md` § 6 — props `data: ForumDiscussionDetailData`, `backHref`, `backLabel`, `commentsSlot`, `shareLabel`, `editLabel`, `deleteLabel`, optional `shareSlot`; renders back link, header card with `data.iconNode + data.title`, share button (slot or default `ShareButton` wired to `data.shareUrl`), author row with `pickColorFromId` avatar fallback + edit/delete icon buttons rendered only when `data.onEdit` / `data.onDelete` are defined, `data.body.contentNode`, `<Separator />`, then `commentsSlot`

### i18n parity across the five non-English locales for US1

The English source was authored in T003. These five tasks bring `forum.<lang>.json` to full parity with `forum.en.json` across all keys (read **and** write — write keys are unused by US1 components but are present in EN, so non-EN files mirror them now to avoid mid-migration translation gaps).

- [X] T018 [P] [US1] Author `src/crd/i18n/forum/forum.nl.json` mirroring all keys from `forum.en.json` in Dutch
- [X] T019 [P] [US1] Author `src/crd/i18n/forum/forum.es.json` mirroring all keys from `forum.en.json` in Spanish
- [X] T020 [P] [US1] Author `src/crd/i18n/forum/forum.bg.json` mirroring all keys from `forum.en.json` in Bulgarian
- [X] T021 [P] [US1] Author `src/crd/i18n/forum/forum.de.json` mirroring all keys from `forum.en.json` in German
- [X] T022 [P] [US1] Author `src/crd/i18n/forum/forum.fr.json` mirroring all keys from `forum.en.json` in French

### Integration layer for US1

- [X] T023 [US1] Implement `src/main/crdPages/topLevelPages/forum/forumDataMapper.ts` — pure mapping module with two exports: `mapDiscussionsToListData(query: PlatformDiscussionsQuery, t, formatDate, locale): ForumDiscussionListItemData[]` and `mapDiscussionToDetailData(query: PlatformDiscussionQuery, t, formatDate, locale): ForumDiscussionDetailData`; resolves `iconNode` via the existing `<DiscussionIcon category={...} />` from `src/domain/communication/discussion/views/DiscussionIcon.tsx` (reused unchanged), resolves `formattedDate` via `date-fns` `format(timestamp, 'EEE, dd/MM/yyyy', { locale })`, resolves `categorySlug` via `slugFor()` from `useCategorySlug.ts`, resolves `shareUrl` from `window.location.origin + discussion.profile.url`, resolves `avatarColor` via `pickColorFromId(author.id)` from `@/crd/lib/pickColorFromId`, and composes the row's `ariaLabel` via `t('list.itemAriaLabel', { title, author: authorDisplayName, date: formattedDate, count: commentCount })` using a `t` bound to the `crd-forum` namespace passed in by the caller (so plural / locale phrasing are resolved here, not in the CRD component); depends on T007 and T009
- [X] T024 [US1] Implement `src/main/crdPages/topLevelPages/forum/useForumSubscription.ts` — wraps the existing `UseSubscriptionToSubEntity` helper (from `@/core/apollo/subscriptions/useSubscriptionToSubEntity`) for the existing `ForumDiscussionUpdatedDocument`; mirrors the legacy MUI Forum's `useSubscriptionToForum` block in `src/domain/communication/discussion/pages/ForumPage.tsx:33-50` verbatim
- [X] T025 [US1] Implement `src/main/crdPages/topLevelPages/forum/DiscussionCommentsConnector.tsx` — mounts the existing CRD comment thread (`src/crd/components/comment/CommentThread.tsx`) in **read-only** mode by passing the comments room data via the existing `useCrdRoomComments` hook (from `src/main/crdPages/space/hooks/useCrdRoomComments.tsx`); the comment input and per-comment Reply/Delete affordances are present in the underlying components but their post / delete callbacks remain stubbed (no-op / undefined) until US3 wires the mutations; the connector subscribes to room events via the existing `useSubscribeOnRoomEvents` so live comments appear without reload (US1 AC#7 second clause)
- [X] T026 [US1] Implement `src/main/crdPages/topLevelPages/forum/CrdForumPage.tsx` — landing page that: (a) reads `:categorySlug` from `useParams()` (single optional URL param) and resolves it via `useCategorySlug.categoryFor(slug)`; an unknown slug or the synthetic `'all'` resolves to `undefined` and the page renders the unfiltered "All" view (Edge Case "Unknown category in URL"). The URL is left unchanged in the unknown-slug case — no automatic redirect to `/forum` — so an outdated bookmarked link continues to function and the user can correct it manually, (b) calls `usePlatformDiscussionsQuery` and `useForumSubscription`, (c) reads forum-level `CreateDiscussion` via `useCurrentUserContext()` (matching legacy MUI Forum's `data.platform.forum.authorization.myPrivileges` check), (d) owns `searchQuery` and `sortOrder` as plain `useState` (defaults `''` and `'newest'`; reset on each mount per Clarification Q2 / Decision 10), (e) maps query data via `forumDataMapper`, (f) filters by category + applies search-by-title-or-author + sort client-side, (g) renders `<ForumLayout ribbonNode={useInnovationHubOutsideRibbon(...)} bannerNode={<ForumBanner ...>} sidebarNode={<ForumCategoryNav ...>} mainNode={<><ForumDiscussionListHeader initiateSlot={canCreateDiscussion ? <Button …>{t('list.initiate')}</Button> : undefined} … /><ForumDiscussionList … /></>} />`, (h) calls `usePageTitle(t('pages.titles.forum'))` from the default namespace via a secondary `useTranslation()` call; depends on T010, T011, T012, T014, T016, T015, T023, T024
- [X] T027 [US1] Implement `src/main/crdPages/topLevelPages/forum/CrdDiscussionPage.tsx` — detail page that: (a) reads `:nameId` from `useParams()`, (b) calls `usePlatformDiscussionQuery`, (c) maps via `forumDataMapper.mapDiscussionToDetailData` — leaves `data.onEdit` and `data.onDelete` as `undefined` for this story (US3 will populate), (d) computes `backHref` as `'/forum/' + categorySlug` (or `'/forum'` when the discussion lacks a category) per Clarification Q5 / Decision 9, (e) renders `<ForumDiscussionDetail data={...} backHref={backHref} backLabel={t('detail.back')} commentsSlot={<DiscussionCommentsConnector roomId={discussion.comments.id} />} shareLabel={...} editLabel={t('detail.edit')} deleteLabel={t('detail.delete')} />`, (f) wraps body content via `<MarkdownContent>{discussion.profile.description}</MarkdownContent>`; depends on T017, T023, T025
- [X] T028 [US1] Implement `src/main/crdPages/topLevelPages/forum/CrdForumRoute.tsx` — react-router `<Routes>` mirroring the legacy `src/domain/communication/discussion/routing/ForumRoute.tsx` but using a single wildcard for category (cleaner than the legacy explicit-per-category routes; matches the `useParams()` pattern adopted in T026): `index → <CrdForumPage />` (renders the "All" view), `releases/latest → <CrdLatestReleaseRedirect />` (see T028a), `discussion/:discussionNameId → <CrdDiscussionPage />`, `:categorySlug → <CrdForumPage />` (single param-driven route covering `releases`, `platform-functionalities`, `community-building`, `challenge-centric`, `help`, `other`, and any unknown slug — the page falls back to "All" for unknown slugs per T026's resolver), fallback `*` → `Error404` inside CRD shell. Route order matters: place `discussion/:discussionNameId` and `releases/latest` before the wildcard so they take precedence
- [X] T028a [P] [US1] Implement `src/main/crdPages/topLevelPages/forum/CrdLatestReleaseRedirect.tsx` — small CRD-only component for the `releases/latest` route. **Schema correction (discovered during implementation)**: the schema's `LatestReleaseDiscussion` type only exposes `id` (no `profile` field), so the originally-planned single-query approach (M4 option a) is not viable without a backend schema change (out of scope). Instead, the component **chains** queries: (i) call `useLatestReleaseDiscussionQuery` to get the latest discussion's `id`, (ii) call `usePlatformDiscussionQuery({ variables: { discussionId } })` (skipped while id is undefined) to obtain `profile.url`, (iii) once both resolve, `<Navigate to={url} replace />`. While either query is loading, render `<Loading />` from `@/crd/components/common/Loading.tsx`. If the latest-release query returns no discussion, throw so the global error boundary handles it. Replaces the legacy `LastReleaseDiscussion.tsx` for the CRD branch — the legacy file imports the MUI `DiscussionPage` and so cannot be reused as-is in the CRD shell. **No GraphQL document edits or codegen step required for this PR.**

### Routing wiring for US1

- [X] T029 [US1] Modify `src/main/routing/TopLevelRoutes.tsx`: add `const CrdForumRoute = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/topLevelPages/forum/CrdForumRoute'))`; in the JSX, gate the existing `path={`/${TopLevelRoutePath.Forum}/*`}` route on `useCrdEnabled()` — when enabled, render `<Route element={<NonIdentity><CrdLayoutWrapper /></NonIdentity>}>` containing `<Route path={`/${TopLevelRoutePath.Forum}/*`} element={<WithApmTransaction path={`/${TopLevelRoutePath.Forum}`}><Suspense fallback={<Loading />}><CrdForumRoute /></Suspense></WithApmTransaction>} />`; otherwise keep the existing MUI `ForumRoute` chain unchanged

**Checkpoint US1**: With the CRD toggle on, `/forum` and `/forum/<slug>` and `/forum/discussion/<nameId>` render through the CRD shell with live data. Spec AC US1#1–#8 verified manually via quickstart sections A and B. The MUI Forum still works when the toggle is off (toggle-off smoke pass quickstart E1).

---

## Phase 4: User Story 2 — Read the Documentation in the new shell (Priority: P1)

**Goal**: With the CRD toggle on, opening `/docs` and `/docs/<sub-path>` renders the embedded external documentation iframe inside the CRD shell, preserves all current iframe behaviours (auto-resize, URL syncing, legacy redirect), and uses no in-page banner per Clarification Q4 / Decision 7. The legacy `/documentation/*` URL still redirects to `/docs/*`.

**Independent Test**: Enable the CRD toggle, navigate to `/docs`, click around inside the iframe — verify the iframe sits directly under the CRD shell header (no banner), the iframe resizes to fit content, the address bar updates as you navigate inside it, `/documentation/foo` redirects to `/docs/foo`, and a deep link to `/docs/some-page` loads the iframe at that sub-path. With the toggle off, the legacy MUI Documentation page still works. Maps to spec acceptance scenarios US2#1–#7 and quickstart section D.

### CRD presentational layer for US2

- [X] T030 [P] [US2] Implement `src/crd/components/documentation/DocumentationFrame.tsx` per `contracts/crd-components.md` § 9 — props `src: string | undefined`, `title: string`, `iframeRef`, `initialHeight?`; returns `null` when `src` is `undefined`; otherwise renders one `<iframe>` with `src`, `title`, `sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"` (verbatim from the legacy page), `ref={iframeRef}`, `style={{ width: '100%', height: initialHeight ?? '100vh', border: 'none' }}`; no `postMessage` logic (that lives in the integration hook)

### i18n parity across the five non-English locales for US2

- [X] T031 [P] [US2] Author `src/crd/i18n/documentation/documentation.nl.json` mirroring all keys from `documentation.en.json` in Dutch
- [X] T032 [P] [US2] Author `src/crd/i18n/documentation/documentation.es.json` mirroring all keys from `documentation.en.json` in Spanish
- [X] T033 [P] [US2] Author `src/crd/i18n/documentation/documentation.bg.json` mirroring all keys from `documentation.en.json` in Bulgarian
- [X] T034 [P] [US2] Author `src/crd/i18n/documentation/documentation.de.json` mirroring all keys from `documentation.en.json` in German
- [X] T035 [P] [US2] Author `src/crd/i18n/documentation/documentation.fr.json` mirroring all keys from `documentation.en.json` in French

### Integration layer for US2

- [X] T036 [US2] Implement `src/main/crdPages/topLevelPages/documentation/useDocumentationFrame.ts` — hook that owns: (a) the iframe `src` initial state (computed once on mount from `${locations.documentation}/${docsInternalPath ?? ''}` per the legacy page's `useEffect(() => setSrc(...), [])` pattern), (b) `iframeRef = useRef<HTMLIFrameElement>(null)`, (c) `useEffect` adding a `message` listener on `window` with the same `getCurrentOriginWithoutPort()` origin check as the legacy MUI page, (d) on `PAGE_HEIGHT`: mutate `iframeRef.current.style.height = `${event.data.height}px``, (e) on `PAGE_CHANGE`: `navigate(`/${TopLevelRoutePath.Docs}${event.data.url}`, { replace: true })` and `scrollToTop()`, (f) cleanup removes the listener on unmount; returns `{ src, iframeRef }`
- [X] T037 [US2] Implement `src/main/crdPages/topLevelPages/documentation/CrdDocumentationPage.tsx` — page component that: (a) calls `usePageTitle(t('pages.titles.documentation'))` (from the default namespace via secondary `useTranslation()`), (b) reads `locations` via `useConfig()`, (c) calls `useDocumentationFrame()`, (d) when `src` is defined, renders `<DocumentationFrame src={src} title={t('frameLabel')} iframeRef={iframeRef} />` using `useTranslation('crd-documentation')` for the iframe title — no banner, no header band, no breadcrumb (Clarification Q4); (e) when `src` is `undefined` (runtime config not yet resolved), renders `<Loading />` from `@/crd/components/common/Loading.tsx` with `t('loading')` so the page area is not visually empty during the brief config-resolution window. Depends on T030 and T036

### Routing wiring for US2

- [X] T038 [US2] Modify `src/main/routing/TopLevelRoutes.tsx`: add `const CrdDocumentationPage = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/topLevelPages/documentation/CrdDocumentationPage'))`; in the JSX, gate the existing `path={`${TopLevelRoutePath.Docs}/*`}` route on `useCrdEnabled()` — when enabled, render `<Route element={<NonIdentity><CrdLayoutWrapper /></NonIdentity>}>` containing `<Route path={`${TopLevelRoutePath.Docs}/*`} element={<WithApmTransaction path={`/${TopLevelRoutePath.Docs}`}><Suspense fallback={<Loading />}><CrdDocumentationPage /></Suspense></WithApmTransaction>} />`; otherwise keep the existing MUI `<DocumentationPage />` chain unchanged. The `path={`${TopLevelRoutePath.Documentation}/*`}` legacy redirect remains wired to the existing `<RedirectDocumentation />` in BOTH branches (it has zero MUI imports per Decision 4, so it is reused as-is). This task touches the same file as T029 — sequence after T029

**Checkpoint US2**: With the CRD toggle on, `/docs/*` renders the iframe inside the CRD shell with all iframe behaviours preserved. With the toggle off, the legacy MUI Documentation page still works (quickstart E2). Spec AC US2#1–#7 verified via quickstart section D.

---

## Phase 5: User Story 3 — Initiate, edit, and delete a Forum discussion in the new design (Priority: P2)

**Goal**: With the CRD toggle on, privileged users can create a new discussion via the Initiate Discussion button (or `/forum?dialog=new`), edit their own discussion via the pencil icon, delete it via the trash icon (with `ConfirmationDialog`), post comments and replies, and delete comments. All write actions reuse existing platform mutations.

**Independent Test**: With the CRD toggle on and signed in as a member with `CreateDiscussion`, click "Initiate Discussion", fill the form, submit — new discussion appears and opens. As the author, edit the title; delete a comment via the alert dialog; delete the discussion. As a non-admin, verify "Releases" is not in the category select. Maps to spec acceptance scenarios US3#1–#7 and quickstart section C.

### CRD presentational layer for US3

- [X] T039 [US3] Implement `src/crd/components/forum/ForumInitiateDiscussionDialog.tsx` per `contracts/crd-components.md` § 7 — controlled Radix `Dialog` with sticky header (translated `title`, close X button), scrollable body slot (`children`), sticky footer (`cancelLabel` button on the left, `submitLabel` button on the right). Props: `open`, `onOpenChange`, `mode`, `title`, `submitLabel`, `cancelLabel`, `submitDisabled`, `busy`, `onSubmit`, `children`. The submit button carries `aria-busy={busy}` and `disabled={busy || submitDisabled}`. The dialog never imports Formik or Apollo

### Integration layer for US3

- [X] T040 [US3] Implement `src/main/crdPages/topLevelPages/forum/ForumDiscussionFormConnector.tsx` — Formik form (Yup schema and field structure copied from the legacy `src/domain/communication/discussion/forms/DiscussionForm.tsx`): `title` (text, required, ≤ `SMALL_TEXT_LENGTH`), `category` (Radix `Select` populated by the integration layer's filtered category list — admins see all, non-admins exclude `Releases`), `body` (CRD `MarkdownEditor` from `src/crd/forms/markdown/MarkdownEditor.tsx`, validated with the existing `MarkdownValidator`, ≤ `MARKDOWN_TEXT_LENGTH`), `tags` (CRD `TagsInput` from `src/crd/forms/tags-input.tsx`). On submit: in `'initiate'` mode call `useCreateDiscussionMutation` with `refetchQueries: [refetchPlatformDiscussionsQuery()]` and navigate to the new discussion's URL; in `'update'` mode call `useUpdateDiscussionMutation` and update the cache. Exposes `submitDisabled`, `busy`, and a `submitForm()` callable to its parent so the parent's `ForumInitiateDiscussionDialog` footer button can drive the submission
- [X] T041 [US3] Extend `CrdForumPage.tsx` (T026) to mount `<ForumInitiateDiscussionDialog>` containing `<ForumDiscussionFormConnector mode="initiate" forumId={data.platform.forum.id} availableCategories={discussionCreationCategories} />`. Read the `dialog=new` query parameter via `useSearchParams()`; open the dialog when the button is clicked OR when the query param is present **AND** the viewer has `CreateDiscussion`. When a viewer without `CreateDiscussion` lands on `/forum?dialog=new` (e.g. via a bookmarked URL or a privilege change since the link was created), the query param is ignored, the dialog stays closed, and the URL is left unchanged so the user can see they reached the Forum landing rather than encountering a silently-failing modal. Closing the dialog navigates to `/forum` (clearing the query param) without creating a discussion. The Initiate Discussion button is rendered only when `canCreateDiscussion` is true (already gated in T026)
- [X] T042 [US3] Extend `CrdDiscussionPage.tsx` (T027) to: (a) populate `data.onEdit` with `() => setIsEditOpen(true)` when the viewer has `Update` privilege on the discussion, (b) populate `data.onDelete` with `() => setPendingDeleteDiscussion(true)` when the viewer has `Delete` privilege, (c) mount `<ForumInitiateDiscussionDialog mode="update">` with a `<ForumDiscussionFormConnector mode="update" discussion={discussion} />` inside, (d) mount the existing `<ConfirmationDialog>` from `src/crd/components/dialogs/ConfirmationDialog.tsx` for `pendingDeleteDiscussion`; on confirm, call `useDeleteDiscussionMutation({ variables: { deleteData: { ID: discussion.id } }, refetchQueries: [refetchPlatformDiscussionsQuery()] })` and `navigate(backHref)`. Use the existing default-namespace key `components.discussion.delete-discussion` for the confirmation copy via secondary `useTranslation()`
- [X] T043 [US3] Extend `DiscussionCommentsConnector.tsx` (T025) to wire posting and deleting: (a) enable the `CommentInput` by passing the `onPost` callback from the existing `useCrdRoomComments` hook, (b) pass `onPostReply` and `onDeleteMessage` callbacks for per-comment Reply / Delete affordances, (c) mount the existing `<ConfirmationDialog>` for `pendingDeleteCommentId` using the default-namespace `components.discussion.delete-comment` key; the existing `useCrdRoomComments` already encapsulates `usePostMessageMutations` and `useRemoveMessageOnRoomMutation` plus the per-message authorization check, so this task wires up its outputs into props on the existing `CommentThread`/`CommentInput`/`CommentItem` components

### Routing wiring for US3

- [X] T044 [US3] Extend `CrdForumRoute.tsx` (T028) to add the `/new` route — index pattern `/forum/new` → `<CrdForumPage dialog="new" />`, mirroring the legacy `ForumRoute` `<Route path="/new" element={<ForumPage dialog="new" />} />`. The existing `?dialog=new` query-param path opened in T041 covers the canonical deep link; the `/new` segment exists only to maintain compatibility with any in-app links that still target it

**Checkpoint US3**: With the CRD toggle on, all read-and-write Forum interactions work. Spec AC US3#1–#7 verified via quickstart section C. Both privileged and non-privileged viewers see the right affordances based on their authorization.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Lint/test sweep, accessibility pass, bundle / chunk verification, prototype-fidelity visual QA, and final Constitution Check re-affirmation.

- [X] T045 [P] Run `pnpm lint` and resolve any new violations introduced under `src/crd/components/{forum,documentation}/`, `src/crd/i18n/{forum,documentation}/`, `src/main/crdPages/topLevelPages/{forum,documentation}/`, `src/main/routing/TopLevelRoutes.tsx`, `src/core/i18n/config.ts`, and `@types/i18next.d.ts`
- [X] T046 [P] Run `pnpm vitest run` and confirm all 595+ existing tests still pass (no regression introduced)
- [X] T047 [P] Grep guard: confirm zero `@mui/*` and zero `@emotion/*` imports under `src/crd/components/{forum,documentation}/` and `src/main/crdPages/topLevelPages/{forum,documentation}/` (`grep -r "@mui\|@emotion" <those four dirs>` returns nothing)
- [X] T048 [P] Grep guard: confirm zero `useMemo`, `useCallback`, or `React.memo` introduced anywhere in the new files (React Compiler handles memoization — Constitution Principle II)
- [ ] T049 [P] Visual QA pass against the prototype `prototype/src/app/pages/ForumPage.tsx` — verify banner gradient + dotted pattern, sidebar spacing + active state, list row spacing + hover state, detail card structure, dialog header/footer chrome match the prototype on Chrome, Firefox, Safari at desktop and mobile breakpoints
- [ ] T050 [P] Accessibility pass per `quickstart.md` § F: keyboard-only tab order on landing and detail pages, screen reader announcement spot-check (NVDA or VoiceOver) on discussion rows, dialog focus trap, color contrast on muted text and active sidebar item
- [ ] T051 [P] Bundle / chunk verification per `quickstart.md` § E3: with the toggle off in a fresh incognito session, confirm no chunk under `src/crd/components/{forum,documentation}/` or `src/main/crdPages/topLevelPages/{forum,documentation}/` is fetched on `/forum` or `/docs` (Network panel filter)
- [ ] T052 Run the full `quickstart.md` manual test matrix (sections A–H) end-to-end and record results in the PR description as the acceptance evidence required by Constitution Engineering Workflow §4. Additionally cover the following edge cases from spec.md that are not in the quickstart matrix: (a) **Privileges revoked while dialog is open** — open the Initiate Discussion dialog as a privileged user, then have an admin revoke `CreateDiscussion` on the forum, then submit; verify a server-side error toast surfaces via the existing global error handler and the dialog stays open with controls re-enabled. (b) **Slow rich-text editor load** — throttle the network to "Slow 3G" in DevTools, open the Initiate Discussion dialog; verify the editor renders an internal placeholder while loading and the Submit button stays disabled (or the form remains usable) until the editor is ready. (c) **Unknown category in URL** — navigate to `/forum/some-removed-category`; verify the page renders the All view (no filter) without errors
- [ ] T053 Re-affirm post-implementation Constitution Check (the same gates as `plan.md` § Constitution Check): verify no new MUI imports in CRD scope, no new memo hooks, no GraphQL types in CRD prop interfaces, no barrel exports, no default-`translation`-namespace imports inside `src/crd/`, all WCAG 2.1 AA requirements met. Document outcome in the PR description

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1, T001–T002)**: no dependencies — can start immediately on the branch.
- **Foundational (Phase 2, T003–T009)**: depends on Setup completion. Blocks all user-story work because every CRD component imports the types files (T007, T008) and every translated string requires the namespaces to be registered (T005, T006).
- **US1 (Phase 3, T010–T029)**: depends on Foundational. Independent of US2 and US3 once Foundational is done.
- **US2 (Phase 4, T030–T038)**: depends on Foundational. Independent of US1 and US3 *except* the routing wiring T038 modifies the same file as T029 — sequence T029 → T038.
- **US3 (Phase 5, T039–T044)**: depends on US1 (extends `CrdForumPage`, `CrdDiscussionPage`, `CrdForumRoute`, `DiscussionCommentsConnector`). Independent of US2.
- **Polish (Phase 6, T045–T053)**: depends on whichever user stories are in scope being complete. Lint and test tasks (T045, T046) can run after each phase as part of incremental delivery.

### Within-phase dependencies

- T005 depends on T003 + T004 (namespace registration needs the EN files to lazy-import).
- T006 depends on T005 (type augmentation depends on namespace existence).
- T016 depends on T013 + T015 (list composes item + empty state).
- T023 depends on T007 + T009 (data mapper consumes types and slug map).
- T026 depends on T010 + T011 + T012 + T014 + T015 + T016 + T023 + T024.
- T027 depends on T017 + T023 + T025.
- T028a is independent of T028 (different files; both can be authored in parallel). T028a depends only on the regenerated `apollo-hooks.ts` after the `LatestReleaseDiscussion.graphql` edit lands.
- T029 modifies the routes file; T038 also modifies it — sequence them.
- T036 depends on the docs route enum value being unchanged in `TopLevelRoutePath` (no task needed; `TopLevelRoutePath.Docs` already exists).
- T041, T042, T043, T044 depend on US1 components being in place (extend rather than replace).

### Parallel opportunities

- **Foundational**: T003 and T004 are different files → parallel. T007, T008, T009 are different files → parallel after T006.
- **US1 CRD layer**: T010, T011, T012, T013, T014, T015, T017 are all different files → all parallel after Foundational. T016 waits on T013 + T015.
- **US1 i18n locales**: T018–T022 are five different files → all parallel.
- **US2 CRD layer**: T030 has no peers → not parallel-relevant, but parallel with all of US1.
- **US2 i18n locales**: T031–T035 are five different files → all parallel.
- **Across stories**: US1 and US2 are fully independent (except for the shared routes file modification at T029/T038). With two developers, US1 and US2 can run in parallel after Foundational.

---

## Parallel example: Foundational + US1 kick-off

After T001–T009 land (Setup + Foundational), one developer can launch the entire US1 CRD layer in parallel:

```bash
# Round 1 — all CRD components except ForumDiscussionList (which depends on the items + empty state):
Task: "T010 [P] [US1] Implement src/crd/components/forum/ForumBanner.tsx"
Task: "T011 [P] [US1] Implement src/crd/components/forum/ForumLayout.tsx"
Task: "T012 [P] [US1] Implement src/crd/components/forum/ForumCategoryNav.tsx"
Task: "T013 [P] [US1] Implement src/crd/components/forum/ForumDiscussionListItem.tsx"
Task: "T014 [P] [US1] Implement src/crd/components/forum/ForumDiscussionListHeader.tsx"
Task: "T015 [P] [US1] Implement src/crd/components/forum/ForumEmptyState.tsx"
Task: "T017 [P] [US1] Implement src/crd/components/forum/ForumDiscussionDetail.tsx"

# All five non-EN locales in parallel:
Task: "T018 [P] [US1] Author src/crd/i18n/forum/forum.nl.json"
Task: "T019 [P] [US1] Author src/crd/i18n/forum/forum.es.json"
Task: "T020 [P] [US1] Author src/crd/i18n/forum/forum.bg.json"
Task: "T021 [P] [US1] Author src/crd/i18n/forum/forum.de.json"
Task: "T022 [P] [US1] Author src/crd/i18n/forum/forum.fr.json"

# Round 2 — composes and integration:
Task: "T016 [US1] Implement ForumDiscussionList.tsx"   # blocked on T013 + T015
Task: "T024 [US1] Implement useForumSubscription.ts"
Task: "T023 [US1] Implement forumDataMapper.ts"        # blocked on T007 + T009 (foundational)
Task: "T025 [US1] Implement DiscussionCommentsConnector.tsx (read-only)"
```

A second developer can build US2 in parallel (after Foundational):

```bash
Task: "T030 [P] [US2] Implement src/crd/components/documentation/DocumentationFrame.tsx"
Task: "T031 [P] [US2] Author src/crd/i18n/documentation/documentation.nl.json"
Task: "T032 [P] [US2] Author src/crd/i18n/documentation/documentation.es.json"
Task: "T033 [P] [US2] Author src/crd/i18n/documentation/documentation.bg.json"
Task: "T034 [P] [US2] Author src/crd/i18n/documentation/documentation.de.json"
Task: "T035 [P] [US2] Author src/crd/i18n/documentation/documentation.fr.json"
Task: "T036 [US2] Implement useDocumentationFrame.ts"
Task: "T037 [US2] Implement CrdDocumentationPage.tsx"
```

The two routing tasks (T029 → T038) sequence on the shared `TopLevelRoutes.tsx`.

---

## Implementation Strategy

### MVP first (US1 only)

1. **Phase 1 + 2** — Setup and Foundational (T001–T009). One developer; ~half a day.
2. **Phase 3** — User Story 1 (T010–T029). One developer in parallel waves; ~2–3 days.
3. **Stop and validate** — toggle on, run quickstart sections A and B; toggle off, run E1. If both pass, the read-Forum MVP is shippable behind the toggle.

### Incremental delivery

1. Setup + Foundational (T001–T009).
2. Add US1 (T010–T029) → toggle on → quickstart A, B → demo.
3. Add US2 (T030–T038) → toggle on → quickstart D → demo.
4. Add US3 (T039–T044) → toggle on → quickstart C → demo.
5. Polish (T045–T053).

Each story can ship independently behind the toggle without blocking the others.

### Parallel team strategy

With two developers:

1. Both complete Setup + Foundational together (or one developer; tiny phase).
2. After Foundational:
   - Developer A: US1 (T010–T029).
   - Developer B: US2 (T030–T038).
3. The routing wiring tasks (T029 then T038) are coordinated via a single PR or two sequential PRs.
4. After US1 lands, Developer A or a third developer picks up US3 (T039–T044), which extends US1 components.
5. Both developers run Polish (T045–T053) together against the merged branch.

---

## Notes

- `[P]` tasks operate on different files with no dependencies on incomplete tasks.
- `[Story]` label maps every story-phase task to US1, US2, or US3 for traceability.
- Each user story is independently completable and verifiable via the quickstart matrix.
- The branch (`098-crd-forum-documentation`) was created by `/speckit.specify`; tasks land on it via small commits (Constitution Engineering Workflow encourages small reviewable units).
- Per the project's repo convention, every commit is signed; pre-commit hooks run Biome + ESLint + the React Compiler rule.
- Tests are not added as separate tasks because no new non-trivial logic is introduced — all data fetching and mutation logic reuses existing generated hooks. If a regression suspect emerges during Polish, add unit tests under `src/main/crdPages/topLevelPages/forum/` (or `documentation/`) at that point.
- Avoid: vague tasks, same-file conflicts (T029/T038 are explicitly sequenced for this reason), cross-story dependencies that break independence (US3 → US1 is the only one and is intentional).
