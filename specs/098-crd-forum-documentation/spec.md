# Feature Specification: CRD Forum and Documentation Pages

**Feature Branch**: `098-crd-forum-documentation`
**Created**: 2026-05-07
**Status**: Draft
**Input**: User description: "CRD migration of the Forum and Documentation pages — render the existing platform Forum and Documentation pages through the new CRD design system (shadcn/ui + Tailwind), gated behind the existing CRD localStorage toggle, while keeping the current MUI versions as the default rendering path. Forum follows the prototype at `prototype/src/app/pages/ForumPage.tsx` and the existing UX in `src/domain/communication/discussion/pages/{ForumPage,DiscussionPage}.tsx`. Documentation has no prototype — it is an external site embedded in an iframe and must keep its current behaviour (height auto-sizing, URL syncing, legacy `/documentation` redirect) inside the new CRD shell."

## Clarifications

### Session 2026-05-08

- Q: How should the discussion list row's leading visual be sourced? → A: Use the category icon from the existing `DiscussionIcon` mapping; no per-discussion emoji concept in the data mapper. The same icon is used in the detail header. Toggle-off / toggle-on behaviour is consistent on this dimension.
- Q: When the user clicks back from a discussion to the Forum landing, what state should be preserved? → A: Component-local state for search and sort — these reset on navigation away and back, matching existing MUI behaviour. Category is preserved naturally because it lives in the URL.
- Q: How should the Forum's category navigation behave on mobile (narrow viewports)? → A: Replace the left sidebar with a category dropdown / select control placed above the discussion list. Selecting a category navigates to `/forum/<categorySlug>` exactly as the desktop sidebar does.
- Q: How should the Documentation page render its title above the iframe? → A: No header — the iframe sits directly under the CRD shell header, trusting the embedded documentation site to render its own title. Departs from the existing MUI banner; reduces vertical chrome and prevents duplicate titles.
- Q: When the user clicks the in-page "back to all discussions" link from a discussion, where do they land? → A: `/forum/<currentDiscussionCategorySlug>` — the back link uses the discussion's own category. This departs from the existing MUI behaviour (which always sends the user to `/forum`) so that returning to a category-scoped list is the default.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Browse the Forum and read a discussion in the new design (Priority: P1)

A signed-in member opts into the new design (via the Admin UI toggle or the documented localStorage flag), navigates to the Forum, sees the welcome banner, the category sidebar, and the discussion list rendered through the CRD shell, picks a category, finds a discussion via search or sort, opens it, and reads the body and existing comments — all visually consistent with the prototype but populated with real platform data.

**Why this priority**: Reading the Forum is by far the most common interaction (the vast majority of members read discussions but never create one), and it covers the full read-path of the page: list, filtering, sorting, navigation into a discussion, comments rendering. Without this, the migration delivers no value to anyone with the toggle on.

**Independent Test**: Enable the CRD toggle, sign in as a regular member, visit `/forum`, verify the banner, real categories, real discussion list, real subscription updates. Click into a discussion, verify the body, author meta, and existing replies render. No write actions needed for this test.

**Acceptance Scenarios**:

1. **Given** the CRD toggle is on and the member is signed in, **When** the member visits `/forum`, **Then** they see the welcome banner, the category sidebar populated with the real platform discussion categories plus an "All" entry, and the list of all discussions sorted newest-first, with each row showing the discussion's category icon, title, author, formatted date, and comment count.
2. **Given** the member is on the Forum landing, **When** they pick a category from the sidebar, **Then** the URL changes to `/forum/<categorySlug>`, the active category is highlighted, and the list shows only discussions in that category.
3. **Given** the member is on the Forum landing, **When** they type in the search box, **Then** the list filters per keystroke client-side by discussion title and author name (no debounce; matches the prototype); **When** they change the sort selector to "oldest", **Then** the list reorders accordingly.
4. **Given** the Forum landing is empty for the current filter, **When** the member views the page, **Then** an empty state with the prototype's "No discussions found" copy appears.
5. **Given** a discussion exists with comments, **When** the member clicks the row, **Then** the URL changes to that discussion's stable URL, the page shows the discussion's category icon + title, author row, body text, share button, and the comments list with one nesting level for replies.
6. **Given** the member is on a discussion detail page, **When** they click "back to all discussions", **Then** they return to `/forum/<currentDiscussionCategorySlug>` — the Forum landing scoped to the discussion's own category. The search query and sort order are reset to their defaults.
7. **Given** a new comment is posted in a discussion the member is viewing (by another user), **When** the room subscription fires, **Then** the new comment appears without a manual reload. Equivalently, **Given** another user posts a new discussion or edits an existing one, **When** the forum subscription fires, **Then** the list updates without reload.
8. **Given** the CRD toggle is **off**, **When** the member visits `/forum` or any discussion URL, **Then** the existing MUI Forum and Discussion pages render exactly as they do today, with no CRD-specific UI loaded.

---

### User Story 2 — Read the Documentation in the new shell (Priority: P1)

Any visitor (signed in or not) opens `/docs` (or `/docs/<sub-path>`) and sees the embedded external Documentation site rendered inside the CRD shell — header and footer — with the iframe directly under the shell header (no page banner) and all existing iframe behaviour intact: the iframe auto-resizes as the user navigates inside it, the browser URL stays in sync with the page they're on (so links can be shared), and the legacy `/documentation/...` URLs still redirect to `/docs/...`.

**Why this priority**: The Documentation page is the platform's primary self-help surface and is linked from many other places (onboarding, help menus, error pages). Breaking it during the CRD rollout would be highly visible. Although it is mostly a thin shell around an iframe, the migration must preserve every behaviour of the existing page so that no docs link, deep link, share link, or auto-sized layout regresses.

**Independent Test**: Enable the CRD toggle, navigate to `/docs`, then click around inside the embedded site. Verify (a) the page is wrapped in the CRD header/footer rather than the MUI top-level layout, (b) the iframe height grows to match its content (no internal scrollbar), (c) the address bar updates as you navigate inside the docs (so the URL is shareable), (d) opening `/documentation/some-page` redirects to `/docs/some-page`, (e) opening `/docs/some-deep-page` directly loads the iframe at that sub-path.

**Acceptance Scenarios**:

1. **Given** the CRD toggle is on, **When** the visitor opens `/docs`, **Then** the page renders inside the CRD shell with the iframe directly under the shell header (no page banner) loaded at the platform-configured documentation URL, filling the content area without an internal scrollbar.
2. **Given** the visitor is on `/docs/some-section`, **When** the page loads, **Then** the iframe loads at the `some-section` deep path of the external documentation site.
3. **Given** the visitor is reading the docs, **When** they navigate to a different page inside the iframe, **Then** the browser address bar updates to `/docs/<new-path>` (using `replace` so the back button doesn't fill with intermediate states), the page scrolls to the top, and the URL can be copied and shared.
4. **Given** the visitor is reading a page whose content grows (e.g. expandable sections), **When** the embedded page reports a new height, **Then** the iframe resizes so the whole content is visible inline.
5. **Given** the visitor opens the legacy `/documentation/foo` URL, **When** the page loads, **Then** the browser is redirected to `/docs/foo` while preserving any query string.
6. **Given** the CRD toggle is **off**, **When** the visitor opens `/docs` or `/documentation/...`, **Then** the existing MUI Documentation page renders exactly as today.
7. **Given** the platform's runtime configuration does not yet have a documentation URL available, **When** the page renders, **Then** the iframe is not mounted (matching today's behaviour) and the rest of the shell still renders without errors.

---

### User Story 3 — Initiate, edit, and delete a Forum discussion in the new design (Priority: P2)

A member with the right privileges starts a new discussion via the "Initiate Discussion" button (or the deep-link `/forum?dialog=new`), fills in title, category, body (rich text), and tags, and submits. After submission they land on their newly created discussion. Later, the author or a platform admin edits or deletes their own discussion (or a comment) from the discussion detail view.

**Why this priority**: Write actions are essential to the Forum's purpose but used by far fewer people than the read path. They depend on existing platform privileges and existing mutations, so they're a thinner slice on top of P1 and can ship together with or shortly after the read path. They're P2, not P3, because without them the Forum is read-only for any opted-in user — which is acceptable for a short transition but not the end state.

**Independent Test**: With the CRD toggle on and signed in as a member with `CreateDiscussion` privilege on the platform forum, click "Initiate Discussion", fill in all fields, submit. Verify the new discussion appears in the list and opens its detail view. Then as the author, edit the discussion's title and confirm the change persists; delete a comment and the discussion itself, confirming via the alert dialog each time.

**Acceptance Scenarios**:

1. **Given** a member has `CreateDiscussion` privilege on the forum, **When** they view `/forum`, **Then** the "Initiate Discussion" button is visible in the list header. **Given** a member does *not* have that privilege, **When** they view `/forum`, **Then** the button is not rendered.
2. **Given** the member clicks "Initiate Discussion" (or opens `/forum?dialog=new`), **When** the dialog opens, **Then** it shows fields for title, category, rich-text body, and tags, with the category options filtered by the user's role (platform admins can post to "Releases"; everyone else cannot).
3. **Given** the dialog is open, **When** the member submits with valid input, **Then** the discussion is created via the existing platform mutation and the member is navigated to the new discussion's detail page; **When** the member cancels or closes the dialog, **Then** the URL returns to `/forum` and the dialog closes.
4. **Given** a discussion's author (or a privileged admin) is viewing the discussion detail, **When** they click the pencil icon, **Then** an edit dialog opens; **When** they click the trash icon, **Then** an alert dialog asks for confirmation before the discussion is deleted; on confirm, they are returned to `/forum` and the discussion is removed from the list.
5. **Given** the same member has the right to delete a comment, **When** they click delete on a comment, **Then** an alert dialog asks for confirmation, and on confirm the comment is removed and the comment count updates.
6. **Given** any signed-in member is viewing a discussion, **When** they type in the comment input and submit, **Then** the comment is posted via the existing room-message mutation, the comment appears in the list, and other open clients receive it via the room subscription.
7. **Given** a comment has replies (one nesting level), **When** the member clicks "Reply" on a reply, **Then** an inline reply input appears beneath that reply.

---

### Edge Cases

- **Toggle flicker**: A user reloads with the toggle on but the platform query is still loading. The CRD shell must render its skeleton/loading state without a flash of unstyled content or a fallback to the MUI layout.
- **Unknown category in URL**: A member navigates to `/forum/some-removed-category` after the platform retires it. The page should fall back to the "All" view (current MUI behaviour) rather than render an empty page with no signposting.
- **Discussion missing `profile.url`**: A discussion in the GraphQL response is missing the resolved URL. The list row must remain interactive (or be skipped gracefully) rather than crash on click.
- **Iframe `postMessage` from the wrong origin**: A page in another origin posts a `PAGE_HEIGHT` or `PAGE_CHANGE` message. The CRD Documentation page must ignore it, exactly like the current MUI page (origin-prefix check).
- **Documentation page nested in another iframe**: The page is itself embedded in an iframe (e.g., a third-party preview). The legacy redirect must not fire to avoid breaking the host frame's navigation, mirroring today's behaviour.
- **Privileges revoked while the dialog is open**: A member opens the "Initiate Discussion" dialog and their `CreateDiscussion` privilege is revoked before they submit. The submission must surface the platform's error rather than create an orphaned discussion.
- **Slow rich-text editor load**: The shared rich-text editor is heavier than the rest of the dialog. The dialog should remain usable while the editor is initialising — either by showing a placeholder or by deferring submit until the editor is ready.
- **Avatar missing for an author**: The author has no avatar uploaded. The CRD avatar fallback (deterministic colour from id, with initials) must render — no broken image, no MUI-style placeholder.
- **Deep-linked discussion under a non-canonical category path**: A user opens `/forum/help` while the discussion they navigate into has its canonical URL under a different segment. The detail page must still load and the breadcrumb back to the Forum must work.
- **Category labels and discussion category-enum strings**: All category labels must come from translations (already keyed under `common.enums.discussion-category.*` in the existing app) so the new design does not hard-code English copy.
- **Innovation Hub context**: A user viewing the Forum from inside an Innovation Hub context still sees the existing "outside-of-space" ribbon with its existing message; the CRD shell must accommodate it.

## Requirements *(mandatory)*

### Functional Requirements

#### Forum — landing (read path)

- **FR-001**: When the CRD toggle is on, the Forum landing at `/forum` and `/forum/<categorySlug>` MUST render through the CRD shell (CRD header/footer/Tailwind scope) rather than the MUI top-level layout.
- **FR-002**: The Forum landing MUST display a welcome banner with platform-supplied title and subtitle copy.
- **FR-003**: The category sidebar MUST be populated from the live platform forum category set (`platform.forum.discussionCategories`) plus a synthetic "All" entry that selects no filter.
- **FR-004**: Each category entry MUST display an icon consistent with the existing platform mapping, a translated label, and an active state matching the URL's category segment.
- **FR-005**: Selecting a category MUST navigate to `/forum/<categorySlug>` (and to `/forum` for "All") and update the active state without unmounting the page.
- **FR-005a**: On viewports below the sidebar breakpoint, the category sidebar MUST be replaced with a category dropdown / select control placed above the discussion list. The dropdown lists the same entries as the sidebar (the platform's category set plus "All") and selecting an entry has the same routing effect as FR-005.
- **FR-006**: The list area MUST display a count of currently visible discussions.
- **FR-007**: An "Initiate Discussion" button MUST be rendered in the list header **only** for users whose forum-level authorization includes `CreateDiscussion`.
- **FR-008**: The list MUST provide a free-text search input that filters by discussion title and author display name (client-side, matching the prototype) and a sort selector with at minimum "Newest" and "Oldest". Search query and sort order are page-local state and reset to defaults when the user navigates to a discussion detail and returns; category is preserved because it lives in the URL.
- **FR-009**: Each discussion list row MUST show: the discussion's category icon (from the existing `DiscussionIcon` mapping), the title, the author's display name, the formatted date, and the comment count, and MUST be a focusable interactive element (button or link) that navigates to the discussion's resolved detail URL.
- **FR-010**: When the filtered list is empty, the page MUST display an empty state with translated copy explaining how to broaden the filter.
- **FR-011**: The page MUST subscribe to the existing platform forum subscription so that newly created or updated discussions appear without a manual reload.
- **FR-012**: When the user is viewing the Forum from inside an Innovation Hub context, the existing "outside-of-space" ribbon MUST be displayed.

#### Forum — discussion detail (read path)

- **FR-013**: A discussion detail URL (`/forum/discussion/<nameId>`) MUST render the discussion's category icon + title, a share affordance (using the CRD share dialog), and a "back to all discussions" link that returns to `/forum/<currentDiscussionCategorySlug>` (the Forum landing scoped to the discussion's own category, falling back to `/forum` if the discussion has no category).
- **FR-014**: The detail page MUST show the author's avatar, display name, and the discussion's creation date.
- **FR-015**: The discussion body MUST render the platform's existing rich-text/markdown content faithfully (lists, bold, links, embeds where the existing renderer supports them).
- **FR-016**: A pencil (edit) action MUST be visible only when the viewer has the `Update` privilege on that discussion; a trash (delete) action MUST be visible only when the viewer has the `Delete` privilege.
- **FR-017**: The comments section MUST display: a comment count header, a top comment input (with affordances for at-mentioning users and adding emojis, where the platform supports them), and the threaded comment list.
- **FR-018**: Comments MUST support exactly one level of nested replies, matching the existing MUI behaviour and the prototype.
- **FR-019**: Each comment MUST expose Reply and Delete actions only where the viewer's privileges allow; Delete MUST go through an alert-dialog confirmation.
- **FR-020**: Posting a new comment, posting a reply, deleting a comment, editing the discussion, and deleting the discussion MUST all use the existing platform mutations (no new API surface).
- **FR-021**: The detail page MUST subscribe to the discussion's room events so newly posted comments from other clients appear without a manual reload.

#### Forum — Initiate Discussion dialog

- **FR-022**: The dialog MUST open from the "Initiate Discussion" button and from the URL `/forum?dialog=new`, and closing it MUST return the URL to `/forum`.
- **FR-023**: The dialog MUST collect: title, category, body (rich text using the platform's shared editor), and tags.
- **FR-024**: The category selector MUST be filtered so that platform admins see all discussion categories and other users do not see "Releases".
- **FR-025**: On submit, the dialog MUST create the discussion through the existing mutation and navigate to the newly created discussion's detail page; on cancel or close, no discussion is created.

#### Documentation page

- **FR-026**: When the CRD toggle is on, the Documentation page at `/docs/*` MUST render through the CRD shell with the iframe placed directly under the shell header. No CRD-side page banner, title, or subtitle is rendered for this page; the embedded documentation site is responsible for showing its own title.
- **FR-027**: The page MUST embed the platform-configured external documentation site (resolved from runtime config) in an iframe whose initial source matches the path segment after `/docs/`.
- **FR-028**: The iframe MUST be sandboxed with the existing attribute set (scripts, same-origin, popups, and popups-to-escape-sandbox).
- **FR-029**: The page MUST listen for the existing two `postMessage` event types from the embedded site:
  - a height message that updates the iframe height to match its content,
  - a page-change message that updates the browser URL to `/docs/<new-path>` (with history-replace semantics) and scrolls the page to the top.
- **FR-030**: The page MUST verify the message origin against the current site's origin (without port) before acting, exactly as the current MUI page does, to avoid acting on cross-origin messages.
- **FR-031**: The legacy `/documentation/<path>` URL MUST redirect to `/docs/<path>`, preserving any query string, and MUST not fire when the page is itself embedded in another iframe.
- **FR-032**: When the runtime documentation URL is not yet resolved, the iframe MUST not be mounted; the rest of the shell MUST still render.

#### Coexistence with the existing MUI pages

- **FR-033**: When the CRD toggle is off, the existing MUI Forum (`src/domain/communication/discussion/pages/*`) and Documentation (`src/main/documentation/*`) pages MUST render unchanged, with no CRD chunk loaded.
- **FR-034**: The existing MUI page files MUST remain in the codebase untouched; this feature MUST NOT delete or modify them.
- **FR-035**: Both CRD pages MUST be lazy-loaded so that when the toggle is off, no part of the new design is fetched for these routes.

#### Translations and accessibility

- **FR-036**: All user-visible CRD strings on these pages MUST be served through translation keys, in two new translation namespaces (`crd-forum` and `crd-documentation`), following the existing CRD translation conventions for the project.
- **FR-037**: All six supported languages (English, Dutch, Spanish, Bulgarian, German, French) MUST receive the new keys in the same change set; these CRD translations are maintained directly in the repository (not via the platform's Crowdin workflow).
- **FR-038**: Where the existing MUI pages already rely on long-standing translation keys (forum/documentation page titles, subtitles, the discussion category enum labels, etc.), the CRD pages MUST adopt one consistent rule for how those keys are referenced — see Assumptions for the chosen rule.
- **FR-039**: Both pages MUST meet WCAG 2.1 AA: every interactive element is reachable and operable by keyboard with a visible focus indicator; icon-only buttons have a translated accessible label; the search input has an accessible label; the iframe retains a `title` attribute.
- **FR-040**: Author avatars without an uploaded image MUST render the CRD deterministic-colour fallback (with initials), not a broken image and not an MUI-style placeholder.

#### Cross-cutting layering rules (non-negotiable per the existing CRD migration playbook)

- **FR-041**: All new presentational components MUST live under the CRD design-system folder and contain no MUI, Emotion, GraphQL types, Apollo, routing, auth, or formik imports; behaviour is exposed exclusively through callback props, links use plain anchors, icons come from the project's icon library.
- **FR-042**: All data fetching, GraphQL-to-prop mapping, and routing wiring MUST live in an integration layer under `src/main/crdPages/topLevelPages/{forum,documentation}/` and MUST NOT import any MUI or Emotion package.
- **FR-043**: Route wiring in the top-level routes file MUST select between the CRD and MUI variants based on the existing `useCrdEnabled` hook; both variants are lazy-loaded so only one is fetched per request.
- **FR-044**: Typography across the new components MUST use the established CRD semantic typography tokens (no raw `text-sm font-bold`-style class combinations) and the migration guide's prototype-to-token mapping is the source of truth.
- **FR-045**: The detail page's share button MUST reuse the existing CRD share dialog component rather than re-implementing one.

### Key Entities

- **Forum**: The platform-level forum belonging to `platform.forum`, with its own authorization (which determines whether the viewer may initiate a discussion) and the canonical category set.
- **Discussion category**: One of the platform-defined categories (`Releases`, `Platform Functionalities`, `Community Building`, `Challenge Centric`, `Help`, `Other`) plus the synthetic "All" view; each maps to a URL slug, a translated label, and an icon.
- **Discussion**: A single forum thread with a title, an author, a creation date, a category (which determines the row/header icon via the existing `DiscussionIcon` mapping), a body (rich text), a comment count, an authorization set (governs Update/Delete privileges), and a stable URL. Subscribed via the forum subscription for live updates.
- **Comment / Reply**: A message in a discussion's room, possibly nested one level deep, with an author, a body, and a per-message authorization set (governs Delete). Subscribed via the room subscription.
- **Documentation page**: A thin page-shell wrapper around a sandboxed iframe of the externally hosted platform documentation site, identified by the path segment after `/docs/`. It carries no platform-side persisted data of its own; its only configuration is the runtime-resolved documentation URL.
- **CRD toggle**: The existing localStorage-backed setting (`alkemio-crd-enabled`) that selects which design system renders these pages. Out of scope to change, but in scope to obey.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With the CRD toggle on, 100% of the existing Forum read-path interactions (browse landing, switch category, search, sort, open a discussion, read body, read comments, receive live updates) are available and behave equivalently to the MUI version.
- **SC-002**: With the CRD toggle on, 100% of the existing Forum write-path interactions (initiate a discussion, edit own discussion, delete own discussion, post a comment, post a reply, delete a comment) are available, gated by the same privileges as the MUI version, and produce the same persisted result.
- **SC-003**: With the CRD toggle on, the Documentation page preserves all current iframe behaviours: dynamic height matching content, browser URL updating as the user navigates inside the iframe, and the legacy `/documentation/...` → `/docs/...` redirect.
- **SC-004**: With the CRD toggle off, the Forum and Documentation pages render byte-equivalent UI to today (same MUI page modules), and no CRD-specific code is fetched on those routes.
- **SC-005**: A user accessibility audit of both CRD pages passes WCAG 2.1 AA on the primary flows: keyboard-only navigation reaches every interactive element with visible focus, icon-only controls have accessible names, and the discussion list, category nav, dialog, and comment input are usable with a screen reader.
- **SC-006**: All new user-visible strings on both pages are present in the six supported languages (en, nl, es, bg, de, fr) on day one — verified by the absence of untranslated keys when each language is selected.
- **SC-007**: Real-time updates land in under 5 seconds end-to-end on a typical connection: a discussion or comment posted by user A is visible to user B (with the CRD toggle on, viewing the same forum or discussion) without B reloading.
- **SC-008**: The CRD chunks for these two pages are not present in the JavaScript fetched by a fresh visitor with the toggle off — confirmable by inspecting network activity on a clean session.
- **SC-009**: The project's existing automated quality gates pass on the change set (linting, type checking, and unit tests as run by the standard project scripts).

## Assumptions

- **CRD toggle is the only opt-in mechanism** for these pages during the migration. Toggle removal and old MUI page deletion are explicitly out of scope and will be handled by a separate cleanup spec, consistent with how every prior CRD page migration in this repository has been retired.
- **GraphQL data layer is unchanged.** No backend or schema work is part of this feature. Existing platform queries, mutations, and subscriptions for the forum, discussions, comments, authorization, and current user are reused as-is, with one minor client-side document addition: the existing `LatestReleaseDiscussion.graphql` document gains `profile { url }` alongside `id` so the CRD `releases/latest` redirect can navigate to a URL without a second roundtrip. This is a client-side query-document edit followed by `pnpm codegen`, not a backend schema change. The integration layer is the only place where GraphQL types are touched, and it converts them to plain prop shapes for the presentational components.
- **External documentation site is unchanged.** This feature is a CRD-shell wrapper around the existing iframe. The `postMessage` contract, sandbox attributes, and runtime-config resolution are preserved verbatim; the embedded site's owners do not need to ship anything for this migration.
- **Translation key reuse rule.** New CRD-only strings (banners, sidebar headings, dialog labels, empty states, accessibility labels, etc.) live in the new `crd-forum` and `crd-documentation` namespaces. Strings already maintained for the platform across many surfaces — page titles/subtitles, the discussion category enum labels (`common.enums.discussion-category.*`), and platform forum copy — are read by the CRD pages from their existing namespaces via a secondary `useTranslation` call, to avoid duplicating keys that translators already own. This is the consistent rule applied to both pages.
- **Innovation Hub ribbon.** The existing "outside-of-space" ribbon used on the MUI Forum is preserved on the CRD Forum landing as well, so members in an Innovation Hub context get the same context cue.
- **Visual fallbacks.** Author avatars and any deterministic accent areas use the project-wide `pickColorFromId` helper that other CRD pages already use, not static placeholder JPEGs.
- **No new subscriptions, no new mutations, no new privileges.** The CRD page calls the same authorization checks the MUI page does today (`CreateDiscussion`, `Update`, `Delete`, `PlatformAdmin` for the Releases category gate).
- **Comments component reuse.** The CRD comments treatment used here is the same one introduced in earlier callout-comment migrations on this codebase — comment-count header, top comment input with mention/emoji affordances, and one nesting level. No new comments primitive is introduced for the Forum.
- **Rich-text editor is shared.** The Initiate-Discussion and edit dialogs reuse the platform's existing rich-text editor; no editor is re-implemented inside CRD.
- **Browser support.** Both pages stay within the project's >90% caniuse compatibility envelope.
- **No bundle regression on toggle-off.** Lazy loading the CRD variants keeps the toggle-off bundle unchanged for these routes.

## Dependencies

- `useCrdEnabled` toggle hook and `CrdLayoutWrapper` shell — already present and used by every prior CRD page migration in this codebase.
- The shared CRD share dialog component — reused unchanged.
- The platform's existing rich-text editor — reused unchanged inside the new dialogs.
- The platform's existing forum / discussion / room GraphQL queries, mutations, and subscriptions — reused unchanged.
- Runtime configuration that supplies the external documentation URL — reused unchanged.
