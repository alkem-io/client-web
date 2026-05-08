# Quickstart — CRD Forum and Documentation Pages

This guide walks a developer or QA tester through validating the feature end-to-end on a local environment.

## Prerequisites

- Local dev server running: `pnpm start` (frontend at `http://localhost:3001`, expects backend at `localhost:3000`).
- A signed-in user with one of:
  - **Regular member** — for the read-path tests.
  - **`CreateDiscussion` privilege on the platform forum** — for the write-path tests (create discussion).
  - **Platform admin** — to verify the "Releases" category gate (admins see it; others don't).
- At least 5 existing discussions across at least 2 different categories in the local backend (so search, sort, and category filter can be exercised meaningfully).
- The external Documentation site reachable at the URL configured in `window._env_.locations.documentation` (typically the staged / production docs site, or `http://localhost:3010/documentation` if running the docs repo locally per `src/main/documentation/documentation.md`).
- 6 supported locales available: `en`, `nl`, `es`, `bg`, `de`, `fr`.

## Enable the CRD design system

Open the browser console and run:

```js
localStorage.setItem('alkemio-crd-enabled', 'true');
location.reload();
```

To verify: top-level pages render with the CRD visual language (Tailwind, shadcn primitives, no MUI elevation). Toggle off with:

```js
localStorage.removeItem('alkemio-crd-enabled');
location.reload();
```

Or use the in-app toggle: **Administration → Platform Settings → Design System → CRD (New Design)**.

---

## Manual test matrix

The matrix below maps each spec acceptance scenario to a manual test step. All tests are run with the CRD toggle ON unless otherwise noted. After running through the toggle-on tests, repeat the smoke-pass with the toggle OFF to verify the legacy MUI versions are completely unaffected.

### A. Forum landing — read path (Story 1)

**A1. Banner, sidebar, list render with real data (AC #1)**

1. Navigate to `http://localhost:3001/forum`.
2. Verify the welcome banner is visible at the top with title and subtitle.
3. Verify the left sidebar lists "Show all" plus the platform's real discussion categories (`Releases`, `Platform Functionalities`, `Community Building`, `Challenge Centric`, `Need help?`, `Other` — translated to your locale).
4. Verify the discussion list shows all discussions, sorted newest first, with each row showing: a leading category icon, the title, "{author} on {date} · {N} comments".

**A2. Category filter via sidebar (AC #2)**

1. Click any category in the sidebar (e.g. "Releases").
2. Verify the URL changes to `/forum/releases`.
3. Verify the active row in the sidebar is visually highlighted (`bg-accent`).
4. Verify the list shows only discussions in that category.
5. Click "Show all" — URL returns to `/forum`, list shows everything.

**A3. Search + sort (AC #3)**

1. Type a known title fragment in the search input → list filters in real time.
2. Type a known author display name → matching discussions appear.
3. Switch the sort selector to "Oldest" → list reorders.
4. Clear the search → all discussions reappear under the active category filter.

**A4. Empty state (AC #4)**

1. Type a search query that matches nothing (e.g. `xyzqwertynonexistent`).
2. Verify the empty-state card appears with an icon, "No discussions found" title, and "Try adjusting your search or category filter" subtitle.

**A5. Discussion detail navigation (AC #5)**

1. From `/forum`, click any discussion row.
2. Verify the URL changes to `/forum/discussion/<nameId>`.
3. Verify the detail card shows the category icon + title, a share button (top right), an author row (avatar + name + date), the body content (with markdown rendered), and the comments section below.

**A6. Back-link target — category-scoped (Clarification Q5)**

1. From `/forum/help`, click into a Help discussion → URL becomes `/forum/discussion/<nameId>`.
2. Click the "See all discussions" back link in the detail card.
3. Verify the URL becomes `/forum/help` (the discussion's own category), NOT `/forum`.
4. Repeat from a Releases discussion: back link goes to `/forum/releases`.
5. Verify the search and sort are reset to defaults (search empty, sort "Newest") — Clarification Q2.

**A7. Real-time list update (AC #7)**

1. Have the Forum landing open in browser A.
2. In a second browser B (or incognito, signed in as a different user with `CreateDiscussion`), create a new discussion.
3. Verify the new row appears at the top of the list in browser A within 5 s, without manual reload.

**A8. Real-time comment update (AC #7 second clause)**

1. Have a discussion detail page open in browser A.
2. From browser B, post a comment on the same discussion.
3. Verify the new comment appears in browser A's comment list within 5 s.

**A9. Innovation Hub ribbon**

1. Visit a deployment scoped to an Innovation Hub.
2. Navigate to `/forum`.
3. Verify the "outside-of-space" ribbon is rendered above the banner.

### B. Forum mobile category navigation (Clarification Q3)

**B1. Mobile dropdown shows above the list**

1. Resize the browser below the `md` breakpoint (or use device toolbar at iPhone 12).
2. Verify the left sidebar is hidden.
3. Verify a category dropdown appears above the discussion list.
4. Tap the dropdown → verify it shows the same entries as the desktop sidebar.
5. Pick a category → URL updates to `/forum/<slug>`, list filters.

### C. Forum write path (Story 3)

**C1. Initiate Discussion button visibility (AC #1)**

1. As a user with `CreateDiscussion` on the forum, verify the "Initiate Discussion" button is visible in the list header.
2. As a user without `CreateDiscussion`, verify the button is not rendered.

**C2. Open dialog by URL deep link (AC #2)**

1. As a privileged user, navigate to `/forum?dialog=new`.
2. Verify the dialog opens with title "Create Discussion".
3. Verify all four fields are present: title input, category select, body (rich-text editor), tags input.
4. As a platform admin, open the category select — verify "Releases" is in the list.
5. As a non-admin (with `CreateDiscussion`), open the category select — verify "Releases" is NOT in the list.

**C3. Submit and navigate (AC #3)**

1. From an open dialog, fill in title (>3 chars), category (any allowed), body (>10 chars), and one tag.
2. Click Create Discussion.
3. Verify the dialog closes, and the URL changes to `/forum/discussion/<newNameId>`.
4. Verify the new discussion is visible at the top of `/forum`.

**C4. Cancel and close (AC #3 second clause)**

1. Open the dialog, change at least one field.
2. Click Cancel.
3. Verify the URL returns to `/forum` and the dialog closes; nothing is created.

**C5. Edit an existing discussion (AC #4 first clause)**

1. As the author of a discussion, open it.
2. Verify the pencil icon is visible in the author row.
3. Click the pencil → verify the edit dialog opens with title "Edit Discussion" and the form pre-filled.
4. Change the title, click Save Changes → dialog closes, the title updates on the detail page.
5. As a non-author, non-admin viewer, open the same discussion and verify the pencil icon is NOT rendered.

**C6. Delete a discussion (AC #4 second clause)**

1. As the author, click the trash icon on the discussion detail.
2. Verify the alert dialog opens asking for confirmation.
3. Click Confirm → verify the URL navigates to `/forum` and the discussion is removed from the list.
4. Repeat with Cancel — discussion is preserved.

**C7. Post a comment (AC #6)**

1. From any discussion detail, type a comment in the input at the top of the comments section.
2. Click Send → comment appears in the list, comment count increments.
3. From browser B (different user), verify the comment appears in real time on the same discussion.

**C8. Reply to a reply (AC #7)**

1. On a discussion with at least one root comment, click "Reply" on the root comment.
2. Verify an inline reply input appears beneath that comment.
3. Submit the reply → it appears as a nested reply (one level deep).
4. Click "Reply" on the nested reply itself — verify a reply input appears, but the resulting reply is rendered at the same nesting level (one level only — no further nesting per FR-018).

**C9. Delete a comment (AC #5)**

1. As the author of a comment, click delete on the comment.
2. Verify the alert dialog opens.
3. Confirm → comment is removed from the list and comment count decrements.

### D. Documentation page (Story 2)

**D1. Iframe under the CRD shell (AC #1)**

1. Navigate to `/docs`.
2. Verify the page renders inside the CRD shell (CRD header at top, CRD footer at bottom).
3. Verify the iframe sits directly below the CRD shell header — no banner, no header band, no breadcrumb (Clarification Q4).
4. Verify the iframe loads the platform-configured documentation site at the root path.

**D2. Deep-link to a sub-page (AC #2)**

1. Navigate to `/docs/space/space-overview` (or any known docs path).
2. Verify the iframe loads at the corresponding path on the external docs site.

**D3. URL syncing on iframe-internal navigation (AC #3)**

1. From `/docs`, click any link inside the iframe to navigate the docs.
2. Verify the browser address bar updates to `/docs/<new-path>` (using `replace`, so the back button does not fill with intermediate states).
3. Copy the URL, open it in a new tab — verify it deep-links into the same iframe page.
4. Verify the page scrolls to the top after each iframe-internal navigation.

**D4. Dynamic iframe height (AC #4)**

1. Navigate to a docs page with expandable sections.
2. Expand a section that grows the page height.
3. Verify the iframe's height grows to match its content (no internal scrollbar appears within the iframe area).

**D5. Legacy redirect (AC #5)**

1. Navigate to `/documentation/foo?bar=baz`.
2. Verify the URL is replaced with `/docs/foo?bar=baz` and the page loads at the same docs sub-path.
3. Repeat for `/documentation` (root) → expect `/docs`.

**D6. Empty runtime config tolerance (AC #7)**

1. Temporarily neutralize `window._env_.locations.documentation` (e.g. set it to empty string in dev tools before reload).
2. Navigate to `/docs`.
3. Verify the page renders the CRD shell without errors and the iframe is not mounted.

### E. Toggle-off smoke pass

Run with `localStorage.removeItem('alkemio-crd-enabled')` and reload.

**E1. MUI Forum is unchanged**

1. Visit `/forum`, `/forum/help`, `/forum/discussion/<nameId>`.
2. Verify the existing MUI shell, banner, layout, and components render — no Tailwind, no `.crd-root`.
3. Verify all read and write actions still work (this is just sanity — no code in `src/domain/communication/discussion/*` was modified).

**E2. MUI Documentation is unchanged**

1. Visit `/docs`.
2. Verify the legacy MUI page (with banner) renders.
3. Verify iframe height + URL syncing still works exactly as before.

**E3. Network: no CRD chunk fetched**

1. Open DevTools Network tab on a fresh session (incognito + Disable Cache).
2. Visit `/forum` and `/docs`.
3. Verify no chunks under `crd/` or `crdPages/topLevelPages/forum/` or `crdPages/topLevelPages/documentation/` are fetched (SC-008).

### F. Accessibility pass (WCAG 2.1 AA — SC-005)

**F1. Keyboard navigation — Forum landing**

1. Tab from the top of the page; verify focus visits: skip-link → header nav → category sidebar entries → Initiate Discussion button (if visible) → search input → sort selector → each discussion row in order.
2. Each focused element has a visible ring.
3. Press Enter on a category — navigation occurs.
4. Press Enter on a discussion row — detail view opens.

**F2. Keyboard navigation — Discussion detail**

1. Tab visits: back link → share button → edit (if present) → delete (if present) → comment input → existing comment list rows → Reply / Delete buttons on each comment.
2. Press Esc inside the edit dialog — dialog closes.

**F3. Screen reader announcements**

1. Run NVDA (Windows) or VoiceOver (macOS) and navigate the Forum landing.
2. Verify each discussion row is announced as "{title} by {author}, {date}, {N} comments".
3. Verify the empty state is announced (`role="status"`).
4. Verify icon-only buttons announce their `aria-label` (Share, Edit, Delete).

**F4. Color contrast**

1. Inspect the active sidebar item, the muted text in row metadata, the share/edit/delete icon buttons.
2. Verify each meets 4.5:1 contrast (or 3:1 for large text) against its background.

### G. i18n pass (SC-006)

**G1. Six languages**

1. For each of `en`, `nl`, `es`, `bg`, `de`, `fr`:
   1. Switch the language via the footer language selector.
   2. Reload `/forum`.
   3. Verify there are no untranslated keys (no raw `crd-forum:list.initiate` strings visible).
   4. Open the Initiate Discussion dialog and verify all field labels are translated.
   5. Visit a discussion detail; verify back link, share/edit/delete labels, and category icon labels are all translated.
   6. Visit `/docs` and verify the iframe `title` attribute (inspect the element) is translated.

### H. Performance smoke (SC-007)

**H1. Real-time propagation under 5 s**

1. Have two browsers open at the same Forum landing.
2. Browser A: post a new discussion.
3. Browser B: time how long it takes for the new row to appear (use `console.time`).
4. Verify well under 5 s on a typical broadband connection.

---

## Where to look when something is broken

- **List rows don't navigate**: check `data.href` is set in `forumDataMapper.ts` (resolves from `discussion.profile.url`).
- **Category icon shows generic message-square fallback**: the discussion's `category` field is missing or unmapped — check `useCategorySlug.ts` mapping.
- **Real-time updates not arriving**: check the `useForumSubscription` hook is called with the correct `forumID` (from `data.platform.forum.id`); inspect the websocket frames in DevTools.
- **Iframe not resizing**: check the embedded site's origin matches `window.location.origin`'s prefix; inspect `message` events in the Source panel; verify `useDocumentationFrame` is mounted.
- **Wrong language showing**: confirm the `crd-forum` / `crd-documentation` namespaces are registered in `src/core/i18n/config.ts` and `@types/i18next.d.ts`; check that the JSON file for the active locale exists and is valid JSON.
- **CRD chunk fetched on toggle off**: inspect `TopLevelRoutes.tsx` — verify the `useCrdEnabled` branch correctly gates both `CrdForumRoute` and `CrdDocumentationPage` imports.
- **Edit/Delete icons missing for the author**: check the integration layer is passing `data.onEdit` and `data.onDelete` based on `myPrivileges.includes(AuthorizationPrivilege.Update | Delete)` from the discussion's authorization.
