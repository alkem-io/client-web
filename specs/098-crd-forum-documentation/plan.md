# Implementation Plan: CRD Forum and Documentation Pages

**Branch**: `098-crd-forum-documentation` | **Date**: 2026-05-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/098-crd-forum-documentation/spec.md`

## Summary

Render the existing platform Forum and Documentation top-level pages through the CRD design system (shadcn/ui + Tailwind v4 + Radix UI), gated behind the existing `useCrdEnabled` localStorage toggle. The MUI versions stay as the default rendering path until a separate cleanup spec retires the toggle.

The work splits cleanly into two pages with very different shapes:

- **Forum** (`/forum`, `/forum/<categorySlug>`, `/forum/discussion/<nameId>`, `/forum?dialog=new`) — full UI rebuild based on `prototype/src/app/pages/ForumPage.tsx`. New CRD presentational components live under `src/crd/components/forum/`: a `ForumBanner`, a `ForumCategoryNav` (sidebar on desktop, dropdown above the list on mobile per Clarification Q3), a `ForumDiscussionList` with `ForumDiscussionListItem`, an empty state, a `ForumDiscussionDetail` card, and a presentational `ForumInitiateDiscussionDialog` shell. The detail view's comments reuse the existing `src/crd/components/comment/{CommentThread,CommentInput,CommentItem}` components introduced for callout migrations; the share button reuses `src/crd/components/common/ShareDialog.tsx` via `ShareButton`. Discussion deletion goes through the existing `src/crd/components/dialogs/ConfirmationDialog`. The integration layer at `src/main/crdPages/topLevelPages/forum/` owns Apollo queries, mutations, and subscriptions (`usePlatformDiscussionsQuery`, `usePlatformDiscussionQuery`, `useCreateDiscussionMutation`, `useDeleteDiscussionMutation`, `useUpdateDiscussionMutation`, `useRemoveMessageOnRoomMutation`, the existing `ForumDiscussionUpdatedDocument` subscription, and the existing `useSubscribeOnRoomEvents` hook). The integration layer maps GraphQL shapes to plain CRD prop types, derives the leading visual from category via the existing `DiscussionIcon` mapping (per Clarification Q1), and resolves the back-link target from the discussion's own category (per Clarification Q5). The Initiate / Update Discussion form is a Formik-based form mounted by the integration layer inside the presentational dialog's body slot — it composes the existing CRD primitives `MarkdownEditor`, `TagsInput`, `Select`, `Input` and stays out of `src/crd/`. Search/sort are component-local state and reset on detail navigation (per Clarification Q2).

- **Documentation** (`/docs/*`, plus `/documentation/*` legacy redirect) — thin CRD-shell wrapper around the existing iframe. There is no prototype; the page is purely a vertical: CRD shell header → iframe → CRD shell footer (per Clarification Q4: no page banner). New `DocumentationFrame` presentational component in `src/crd/components/documentation/` owns the iframe markup (sandbox attrs, `title`, height style). The integration layer at `src/main/crdPages/topLevelPages/documentation/` owns runtime config resolution (`useConfig`), `postMessage` handling (PAGE_HEIGHT, PAGE_CHANGE) with the same origin check as the existing MUI page, and the URL-syncing navigation. The legacy `/documentation/*` → `/docs/*` redirect is shared with the MUI path by reusing `RedirectDocumentation` as-is — it contains zero MUI imports today.

Routing is wired in `src/main/routing/TopLevelRoutes.tsx`: both CRD and MUI variants are lazy-loaded; selection is driven by `useCrdEnabled()`; the existing CRD branch wraps in `CrdLayoutWrapper` (CRD header/footer + `.crd-root` Tailwind scope), the MUI branch keeps its current `TopLevelLayout`. Two new translation namespaces (`crd-forum`, `crd-documentation`) are registered in `src/core/i18n/config.ts` and `@types/i18next.d.ts`, with all six supported languages (en, nl, es, bg, de, fr) added in this PR per CRD i18n conventions (manual / AI-assisted, not Crowdin). Long-standing translation keys already on Crowdin for the MUI page (page titles/subtitles, `common.enums.discussion-category.*`, `pages.forum.*`, `pages.documentation.*`) are reused via secondary `useTranslation()` calls from the integration layer rather than duplicated, per Assumption "Translation key reuse rule".

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 / Node ≥24.0.0 (Volta-pinned to 24.14.0); pnpm ≥10.17.1
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4) — existing CRD primitives `dialog`, `card`, `input`, `select`, `separator`, `tooltip`, `avatar`, `button`, `skeleton`; existing CRD composites `ShareDialog`/`ShareButton`, `ConfirmationDialog`, `CommentThread`/`CommentInput`/`CommentItem`, `MarkdownEditor`, `TagsInput`, `MarkdownContent` / `InlineMarkdown`; `lucide-react` (MessageSquare, Rocket, Settings, Users, Building2, HelpCircle, MoreHorizontal, Search, ArrowLeft, Plus, Share2, Pencil, Trash2, Send, Smile); Apollo Client (existing — unchanged); `react-i18next` (existing); React Compiler (`babel-plugin-react-compiler`); Formik (integration layer only; never inside `src/crd/`)
**Storage**: N/A (frontend SPA; data via existing GraphQL queries / mutations / subscriptions — no schema changes)
**Testing**: Vitest with jsdom (existing suite continues to pass)
**Target Platform**: Web SPA (Vite, localhost:3001 dev, expects backend at localhost:3000; Documentation iframe target at `window._env_.locations.documentation`)
**Project Type**: Web SPA — existing monorepo with established CRD layer
**Performance Goals**: Forum list TTI under 1 s on warm cache; iframe document height update on `PAGE_HEIGHT` postMessage processed within one animation frame; real-time end-to-end propagation of new discussions / comments under 5 s on a typical connection (SC-007); CRD chunks for these pages absent from the toggle-off bundle (SC-008).
**Constraints**: Zero `@mui/*` / `@emotion/*` in `src/crd/` and `src/main/crdPages/topLevelPages/{forum,documentation}/`; no GraphQL types / Apollo / domain / auth / `react-router-dom` / Formik imports inside `src/crd/`; React Compiler-friendly (no manual `useMemo` / `useCallback` / `React.memo`); WCAG 2.1 AA; >90% caniuse browser-support envelope (no `Array.prototype.at`, `Object.hasOwn`, `@container`, `structuredClone`); `.crd-root` CSS scoping; props-only / event-handler-as-prop in CRD layer; no barrel `index.ts` exports.
**Scale/Scope**: ~9 new CRD components (`ForumBanner`, `ForumCategoryNav`, `ForumDiscussionList`, `ForumDiscussionListItem`, `ForumDiscussionListHeader`, `ForumEmptyState`, `ForumDiscussionDetail`, `ForumInitiateDiscussionDialog`, `ForumLayout`); 1 new CRD component (`DocumentationFrame`); 1 new types file per page (`forumTypes.ts`, `documentationTypes.ts`); 2 new i18n namespace directories with 6 locale files each (12 JSON files); 2 new integration-layer page directories under `src/main/crdPages/topLevelPages/{forum,documentation}/` with page components, data hooks, and data mappers; 1 modified routing file (`TopLevelRoutes.tsx`); 1 modified i18n config (`src/core/i18n/config.ts`) + 1 modified i18next type augmentation (`@types/i18next.d.ts`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Domain-Driven Frontend Boundaries | PASS | All Apollo / domain orchestration lives in the integration layer (`src/main/crdPages/topLevelPages/{forum,documentation}/`). Existing platform mutations and subscriptions are reused exactly as the MUI Forum uses them today. CRD components in `src/crd/components/{forum,documentation}/` are pure presentation: plain TS props in, callbacks out. No new domain orchestrator is introduced — the existing GraphQL queries already are the orchestrator at the `platform.forum` level. |
| II | React 19 Concurrent UX Discipline | PASS | All new components use plain `useState` for visual flags only (dialog open, search query, sort order, comment input value, pendingDeleteId). No manual memoization (React Compiler handles it). Async submit is awaited; the integration layer surfaces busy state via `aria-busy` and `disabled` props consumed by the presentational layer. Lazy-loaded routes preserve concurrent boundaries with `Suspense` per the existing CRD page pattern. No legacy lifecycle methods are touched. |
| III | GraphQL Contract Fidelity | PASS | All GraphQL access goes through generated hooks (`usePlatformDiscussionsQuery`, `usePlatformDiscussionQuery`, `useCreateDiscussionMutation`, `useDeleteDiscussionMutation`, `useUpdateDiscussionMutation`, `useRemoveMessageOnRoomMutation`, `usePostMessageMutations`, `ForumDiscussionUpdatedDocument`). No raw `useQuery`. No schema changes (no `pnpm codegen` required). Component prop types are plain TypeScript; GraphQL types never leak into CRD prop interfaces — the data mapper at `src/main/crdPages/topLevelPages/forum/forumDataMapper.ts` is the only crossing point. |
| IV | State & Side-Effect Isolation | PASS | Component state is visual-only (open/close, expanded, comment input value, search/sort). Persistent state lives in Apollo cache; cross-page navigation via `useNavigate` lives in the integration layer; routing wraps the CRD page from outside (`TopLevelRoutes.tsx` + `CrdLayoutWrapper`). The Documentation iframe's `postMessage` listener and origin check live in the integration layer's `useDocumentationFrame` hook — the CRD `DocumentationFrame` only renders the `<iframe>` element with sandbox attrs. |
| V | Experience Quality & Safeguards | PASS | FR-039 / SC-005 enforce WCAG 2.1 AA: keyboard-navigable category nav, focus-visible rings on all rows, `aria-label` on icon-only buttons (Share, Edit, Delete, comment send), `<output>` for loading. FR-036 / FR-037 / SC-006 enforce i18n in 6 languages on day one. Subscriptions (existing) keep the list and comments live without manual reload (FR-011, FR-021). Mutation failures route through the existing global toast / error-boundary infrastructure (no new path needed; matches the MUI pattern). |
| Arch 1 | Feature directory taxonomy | PASS | New components live in `src/crd/components/forum/` and `src/crd/components/documentation/` — within the established CRD components taxonomy. Integration layers live in `src/main/crdPages/topLevelPages/forum/` and `src/main/crdPages/topLevelPages/documentation/` — mirroring `src/main/topLevelPages/` and matching the convention used by 091-crd-subspace-page and other prior migrations. Routing composition stays in `src/main/routing/TopLevelRoutes.tsx`. |
| Arch 2 | Styling standard (CRD vs MUI) | PASS | Pure CRD; zero MUI imports introduced anywhere in `src/crd/` or `src/main/crdPages/topLevelPages/{forum,documentation}/`. The legacy MUI Forum (`src/domain/communication/discussion/pages/*`) and Documentation (`src/main/documentation/*`) remain unchanged for the toggle-off path. Tailwind only inside CRD; semantic typography tokens (`text-page-title`, `text-section-title`, `text-card-title`, `text-body`, `text-control`, `text-caption`) replace raw class combos from the prototype. |
| Arch 3 | i18n pipeline | PASS | Two new namespaces (`crd-forum`, `crd-documentation`) are registered in `src/core/i18n/config.ts` `crdNamespaceImports` and `@types/i18next.d.ts`. All six supported locales are added in this PR (manual/AI-assisted per CRD `CLAUDE.md` — not Crowdin). Default `translation` namespace is NOT imported from `src/crd/`; the integration layer reuses long-standing `pages.forum.*`, `pages.documentation.*`, `common.enums.discussion-category.*` keys via a secondary `useTranslation()` call (no namespace argument) and passes resolved strings down as props. |
| Arch 4 | Build determinism | PASS | No Vite config changes. Both new pages are added as lazy-loaded chunks in `TopLevelRoutes.tsx` exactly like every prior CRD migration; the toggle-off chunk graph is unchanged for these routes. |
| Arch 5 | Import transparency | PASS | No barrel `index.ts` files introduced. All imports are explicit file paths (`@/crd/components/forum/ForumBanner`, etc.). |
| Arch 6 | SOLID / DRY | PASS | (a) **SRP**: each CRD component is single-purpose (`ForumBanner` renders the banner, `ForumCategoryNav` renders the category list, `ForumDiscussionListItem` renders one row, etc.); the integration layer's data hook, data mapper, and page component are split. (b) **OCP**: category icons are passed as React node props from the data mapper, so adding a category does not require modifying the CRD component. (c) **LSP**: discussion-list and detail-card components are substitutable for any platform forum data shape since they consume plain prop types. (d) **ISP**: the dialog accepts a `body` slot rather than form state; the CRD detail card accepts only the prop subset its visible state needs. (e) **DIP**: CRD components depend on plain TS abstractions; the integration layer adapts Apollo concretions. (f) **DRY**: the existing `CommentThread`/`CommentInput`/`CommentItem`, `ConfirmationDialog`, `ShareDialog`, `MarkdownEditor`, `TagsInput`, `pickColorFromId`, `DiscussionIcon` are reused — no duplicate primitive is introduced. |
| Eng 5 | Root cause analysis | PASS | This work introduces a new code path (CRD-rendered pages) without touching the MUI baseline. There is no defect being patched — only a parallel rendering path being added behind a toggle. No `fetchPolicy` / `nextFetchPolicy` workarounds are introduced; the data hooks reuse the exact same generated hooks the MUI Forum uses today. |

**Result**: All gates pass. No Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/098-crd-forum-documentation/
├── plan.md              # This file (/speckit.plan output)
├── spec.md              # Feature specification (with /speckit.clarify session)
├── research.md          # Phase 0: technical decisions
├── data-model.md        # Phase 1: TypeScript prop / state types
├── quickstart.md        # Phase 1: developer setup + manual test matrix
├── contracts/
│   └── crd-components.md  # Phase 1: public component contracts (props in / events out / a11y)
└── checklists/
    └── requirements.md  # Spec quality checklist (created by /speckit.specify)
```

### Source Code (repository root)

This is a single web SPA. New and modified files live within the existing established three-layer architecture (presentation / integration / routing), used by every prior CRD page migration.

```text
src/
├── crd/                                                            # Presentational design system (no MUI, no domain logic)
│   ├── components/
│   │   ├── forum/
│   │   │   ├── ForumBanner.tsx                                     # NEW — welcome banner with dotted-pattern bg + title/subtitle (props: titleNode, subtitleNode, iconNode)
│   │   │   ├── ForumCategoryNav.tsx                                # NEW — desktop sidebar (sticky list); on narrow viewports renders an embedded category dropdown via Select (Q3 clarification)
│   │   │   ├── ForumDiscussionList.tsx                             # NEW — bordered card surface that wraps a list of DiscussionListItems with role="list"; renders ForumEmptyState when items length is 0
│   │   │   ├── ForumDiscussionListItem.tsx                         # NEW — one row: category icon, title, "<author> on <date> · N comments"; <a href> for navigation; aria-label includes meta
│   │   │   ├── ForumDiscussionListHeader.tsx                       # NEW — count + Initiate Discussion button slot + search input + sort selector; props expose all interactive state outward
│   │   │   ├── ForumEmptyState.tsx                                 # NEW — MessageSquare icon + translated copy ("No discussions found", "Try adjusting…")
│   │   │   ├── ForumDiscussionDetail.tsx                           # NEW — back link + category-icon header + share + author row + body + comments slot + edit/delete actions
│   │   │   ├── ForumInitiateDiscussionDialog.tsx                   # NEW — Radix Dialog shell with Cancel/Submit footer; body is a children slot (the integration layer mounts the Formik form inside)
│   │   │   ├── ForumLayout.tsx                                     # NEW — composes banner + 12-col grid (sidebar + list area), responsive breakpoint encapsulated here
│   │   │   └── forumTypes.ts                                       # NEW — ForumCategoryEntry, ForumDiscussionListItemData, ForumDiscussionDetailData (plain TS, no GraphQL types)
│   │   └── documentation/
│   │       ├── DocumentationFrame.tsx                              # NEW — sandboxed <iframe> renderer with title + dynamic height; ref forwarded so the integration hook can update height
│   │       └── documentationTypes.ts                               # NEW — DocumentationFrameProps
│   └── i18n/
│       ├── forum/
│       │   ├── forum.en.json                                       # NEW — banner copy, categories.all, sidebar.label, list.{header,countOne,countOther,initiate,searchPlaceholder,sort.{newest,oldest},empty.{title,subtitle}}, detail.{back,share,edit,delete,deleted}, dialog.{title,fields,submit,cancel,validation.*}
│       │   ├── forum.nl.json                                       # NEW — Dutch translations
│       │   ├── forum.es.json                                       # NEW — Spanish translations
│       │   ├── forum.bg.json                                       # NEW — Bulgarian translations
│       │   ├── forum.de.json                                       # NEW — German translations
│       │   └── forum.fr.json                                       # NEW — French translations
│       └── documentation/
│           ├── documentation.en.json                               # NEW — frameLabel (iframe title), legacyRedirectMessage (sr-only)
│           ├── documentation.nl.json                               # NEW
│           ├── documentation.es.json                               # NEW
│           ├── documentation.bg.json                               # NEW
│           ├── documentation.de.json                               # NEW
│           └── documentation.fr.json                               # NEW
│
├── main/crdPages/topLevelPages/
│   ├── forum/                                                      # Integration layer for the CRD Forum
│   │   ├── CrdForumPage.tsx                                        # NEW — landing page: data via usePlatformDiscussionsQuery + subscription; resolves category from URL slug (single :categorySlug param); owns search/sort state; mounts ForumLayout + sidebar + list + dialog
│   │   ├── CrdDiscussionPage.tsx                                   # NEW — detail page: data via usePlatformDiscussionQuery + room subscription; mounts ForumDiscussionDetail with comments connector + ConfirmationDialog
│   │   ├── CrdForumRoute.tsx                                       # NEW — react-router <Routes> with: index (All view), discussion/:discussionNameId, releases/latest, single wildcard :categorySlug, *=Error404 inside CRD shell
│   │   ├── CrdLatestReleaseRedirect.tsx                            # NEW — CRD-only component for /forum/releases/latest: resolves the latest release discussion via useLatestReleaseDiscussionQuery and <Navigate replace>. Replaces the legacy LastReleaseDiscussion.tsx in the CRD branch (legacy file imports MUI DiscussionPage and cannot be reused)
│   │   ├── ForumDiscussionFormConnector.tsx                        # NEW — Formik form mounted inside ForumInitiateDiscussionDialog body slot (also reused for Update flow); uses CRD MarkdownEditor + TagsInput + Select; calls useCreateDiscussionMutation / useUpdateDiscussionMutation
│   │   ├── DiscussionCommentsConnector.tsx                         # NEW — wires src/crd/components/comment/* via the existing useCrdRoomComments hook — confirmation for comment delete uses the existing ConfirmationDialog
│   │   ├── forumDataMapper.ts                                      # NEW — maps PlatformDiscussionsQuery → ForumDiscussionListItemData[] (including the pre-composed ariaLabel via t('list.itemAriaLabel', …)); resolves category icon via DiscussionIcon mapping; resolves backHref to /forum/<categorySlug>
│   │   ├── useCategorySlug.ts                                      # NEW — bidirectional ForumDiscussionCategory ↔ slug map (mirrors the legacy DiscussionCategoryPlatform enum)
│   │   └── useForumSubscription.ts                                 # NEW — wraps the existing UseSubscriptionToSubEntity helper for ForumDiscussionUpdatedDocument
│   │
│   └── documentation/                                              # Integration layer for the CRD Documentation page
│       ├── CrdDocumentationPage.tsx                                # NEW — page component: usePageTitle, useConfig, useDocumentationFrame; mounts <DocumentationFrame> directly under the CRD shell (no banner per Q4)
│       └── useDocumentationFrame.ts                                # NEW — hook owns: src state, postMessage listener (origin check + PAGE_HEIGHT + PAGE_CHANGE), iframe ref, scrollToTop on PAGE_CHANGE
│
├── main/routing/TopLevelRoutes.tsx                                 # MODIFY — add CrdForumRoute + CrdDocumentationPage lazy imports; gate Forum and Documentation routes on useCrdEnabled()
├── main/documentation/                                             # UNTOUCHED (legacy MUI page; rendered when toggle is OFF)
│   ├── DocumentationPage.tsx                                       # UNTOUCHED
│   └── RedirectDocumentation.tsx                                   # REUSED — shared between MUI and CRD branches; contains zero MUI imports today
├── domain/communication/discussion/                                # UNTOUCHED (legacy MUI Forum tree; rendered when toggle is OFF)
│   ├── pages/{ForumPage,DiscussionPage,Discussion,LastReleaseDiscussion,LatestReleaseDiscussion}.tsx
│   ├── routing/ForumRoute.tsx
│   ├── views/*.tsx
│   ├── forms/DiscussionForm.tsx
│   ├── layout/DiscussionsLayout.tsx
│   └── models/Discussion.ts
│
├── core/apollo/generated/apollo-hooks.ts                           # REUSE — usePlatformDiscussionsQuery, usePlatformDiscussionQuery, useCreateDiscussionMutation, useUpdateDiscussionMutation, useDeleteDiscussionMutation, useRemoveMessageOnRoomMutation, refetchPlatformDiscussionsQuery, refetchPlatformDiscussionQuery, ForumDiscussionUpdatedDocument
├── core/i18n/config.ts                                             # MODIFY — add 'crd-forum' and 'crd-documentation' to crdNamespaceImports
└── @types/i18next.d.ts                                             # MODIFY — register the two new namespace resource shapes
```

**Structure Decision**: Single Web SPA, three-layer architecture already established by 039 / 041 / 042 / 086 / 087 / 091 / 094:

1. **Presentation (CRD)** — `src/crd/components/{forum,documentation}/` and `src/crd/i18n/{forum,documentation}/`. Pure, no MUI, no GraphQL, no router, no Formik.
2. **Integration (CRD pages)** — `src/main/crdPages/topLevelPages/{forum,documentation}/`. Wires generated GraphQL hooks, maps types to CRD props, owns dialog open/close + search/sort state, runs mutations, owns the iframe `postMessage` lifecycle, reuses existing `useCrdRoomComments` for comments, reuses existing `RedirectDocumentation` for the legacy URL.
3. **Routing** — `src/main/routing/TopLevelRoutes.tsx`. Selects between MUI and CRD variants via `useCrdEnabled()`; both lazy-loaded.

## Component Mapping: CRD ← MUI

| New / Modified CRD Component | Replaces (or extends) MUI Component | Notes |
|---|---|---|
| `ForumBanner.tsx` (new) | (none — visual element with no MUI counterpart on the existing page) | Welcome banner on the CRD landing only. Adopts the prototype's purple gradient + dotted SVG pattern. Replaces the existing MUI `TopLevelPageBanner` for the Forum landing path; the MUI Forum keeps using its own banner. |
| `ForumCategoryNav.tsx` (new) | `src/domain/communication/discussion/components/CategorySelector.tsx` (horizontal selector) | Vertical sidebar on desktop, embedded `Select` dropdown on mobile (Q3). Categories come in as `entries` prop from the data mapper (already resolved with translated labels and icon nodes); selecting an entry calls `onCategoryChange(slug)` outward. |
| `ForumDiscussionList.tsx` + `ForumDiscussionListItem.tsx` + `ForumDiscussionListHeader.tsx` + `ForumEmptyState.tsx` (new) | `src/domain/communication/discussion/views/DiscussionsListView.tsx` (+ surrounding MUI table) | List header (`Discussions (N)` + Initiate button slot + search + sort), list rows, and empty state. Each row is `<a href>` so middle-click / open-in-new-tab works. The "Initiate Discussion" button is rendered by the consumer and passed in as a slot, so its visibility is privilege-gated outside the CRD layer. |
| `ForumDiscussionDetail.tsx` (new) | `src/domain/communication/discussion/views/DiscussionView.tsx` | Back link + header (category icon + title + share button) + author row (avatar + name + date + edit/delete icon buttons gated by callbacks) + markdown body slot + comments slot. Edit/delete icon buttons fire `onEdit?()` / `onDelete?()` callbacks; the consumer is responsible for opening the edit dialog and the existing `ConfirmationDialog`. |
| `ForumInitiateDiscussionDialog.tsx` (new) | `src/domain/communication/discussion/views/NewDiscussionDialog.tsx` (+ `UpdateDiscussionDialog.tsx`) | Radix `Dialog` with sticky header + scrollable body slot + sticky footer (Cancel + Submit). Body content is a `children` prop — the integration layer mounts the Formik-driven `ForumDiscussionFormConnector` inside. The same shell is reused for both Initiate and Update flows by varying `mode` (`'initiate' \| 'update'`) which controls only the title and the submit-label text. |
| `DocumentationFrame.tsx` (new) | (extracts the iframe element from `src/main/documentation/DocumentationPage.tsx`) | Pure `<iframe>` renderer: `src`, sandbox attrs, title, ref-forwarding for height updates. No `postMessage` logic — that lives in `useDocumentationFrame` in the integration layer. |
| `forumTypes.ts` / `documentationTypes.ts` (new) | (no equivalent — types live inline in the MUI version) | Plain TS types for prop shapes — never GraphQL types. |

The integration-layer modules `CrdForumPage`, `CrdDiscussionPage`, `CrdForumRoute`, `ForumDiscussionFormConnector`, `DiscussionCommentsConnector`, `useDocumentationFrame`, `forumDataMapper`, `useCategorySlug`, `useForumSubscription`, `CrdDocumentationPage` mirror the legacy modules at `src/domain/communication/discussion/pages/{ForumPage,DiscussionPage}.tsx`, `src/domain/communication/discussion/routing/ForumRoute.tsx`, `src/domain/communication/discussion/forms/DiscussionForm.tsx`, and `src/main/documentation/DocumentationPage.tsx`. They reuse all of the legacy modules' Apollo hook calls, subscription helpers, and authorization checks verbatim — the only thing that changes between MUI and CRD is the rendering layer they hand off to.

## Phase 0: Outline & Research

**Status**: Complete. See [`research.md`](./research.md).

Five Phase-0 decisions were made:

1. **Form-state library inside the dialog body slot** → Formik (existing dependency) in the integration layer's `ForumDiscussionFormConnector`. The CRD presentational dialog stays form-state-agnostic via a `children` slot.
2. **Comment thread reuse** → reuse the existing `src/crd/components/comment/{CommentThread,CommentInput,CommentItem}` and the existing `useCrdRoomComments` hook. A small forum-flavored connector wires it to `room.id` from `platform.forum.discussion.comments`.
3. **Iframe height + URL syncing** → port the existing MUI page's `postMessage` protocol verbatim into a single `useDocumentationFrame` hook in the integration layer. No protocol change; same origin check; same sandbox attrs.
4. **Legacy `/documentation/*` redirect** → reuse the existing `RedirectDocumentation` component as-is in both MUI and CRD branches of the toggle. It contains zero MUI imports today.
5. **Translation key reuse** → CRD-only strings (banners, sidebar, dialog labels, empty states, accessibility labels) live in the new `crd-forum` / `crd-documentation` namespaces. Long-standing platform strings already on Crowdin (`pages.forum.title`, `pages.forum.subtitle`, `common.enums.discussion-category.*`, `pages.documentation.title`, `pages.documentation.subtitle`, `components.discussion.delete-discussion`, `components.discussion.delete-comment`) are read by the integration layer via a secondary `useTranslation()` call (default namespace) and passed down as plain string props. CRD components never import the default `translation` namespace directly.

## Phase 1: Design & Contracts

**Outputs**:

- [`data-model.md`](./data-model.md) — TypeScript prop and state shapes for all new CRD components and the integration layer's view models. Includes the CategorySlug ↔ ForumDiscussionCategory map, the `ForumDiscussionListItemData` shape (deliberately without an `emoji` field per Clarification Q1), the `ForumDiscussionDetailData` shape with `categorySlug` (used to compute backHref per Clarification Q5), the i18n key inventory for both new namespaces, and the iframe-postMessage payload types.
- [`contracts/crd-components.md`](./contracts/crd-components.md) — public contracts for `ForumBanner`, `ForumCategoryNav`, `ForumDiscussionList`, `ForumDiscussionListItem`, `ForumDiscussionListHeader`, `ForumEmptyState`, `ForumDiscussionDetail`, `ForumInitiateDiscussionDialog`, `ForumLayout`, `DocumentationFrame`. Each contract enumerates props in, events out (callbacks), rendering invariants, and accessibility requirements (WCAG 2.1 AA).
- [`quickstart.md`](./quickstart.md) — developer setup, CRD toggle steps, and a manual test matrix derived from the spec acceptance scenarios (covering toggle on/off, category filter, search, sort, dialog open via URL deep link, create, edit, delete, comment post, comment delete, real-time subscription, mobile category dropdown, Documentation iframe height + URL syncing + legacy redirect, accessibility keyboard pass).

Agent context update is applied via `.specify/scripts/bash/update-agent-context.sh claude` to record the tech-stack delta in `CLAUDE.md`.

## Post-Design Constitution Re-Check

Re-checked after data-model + contracts: **all gates still pass.** No new violations introduced by Phase 1 design.

- **Domain-Driven Boundaries (I)**: contracts confirm CRD components receive plain TS props only; the integration layer is the single boundary where Apollo and routing meet GraphQL types meet CRD prop types.
- **React 19 Concurrent (II)**: all component-internal state in the contracts is `useState` for visual flags only; no manual memoization is added.
- **GraphQL Fidelity (III)**: prop types in contracts are plain TypeScript (`ForumDiscussionListItemData`, `ForumDiscussionDetailData`, etc.); generated GraphQL types appear only inside the data mapper.
- **State Isolation (IV)**: the `useDocumentationFrame` hook is the only place touching `window.addEventListener('message', ...)` — encapsulated, removable on unmount, origin-checked.
- **Experience Quality (V)**: contracts enumerate ARIA labels, focus rings, and keyboard semantics for every interactive element; the data model's i18n key inventory covers all six languages.
- **SOLID / DRY (Arch 6)**: the `ForumInitiateDiscussionDialog` shell is reused for both Initiate and Update flows by varying `mode`; the existing CRD comment thread, share dialog, confirmation dialog, markdown editor, and tags-input primitives are reused — no new primitive is created.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. Section intentionally empty.
