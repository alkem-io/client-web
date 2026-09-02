# Feature Specification: CRD Innovation Hub & Innovation Hub Settings

**Feature Branch**: `102-crd-innovation-hub`
**Created**: 2026-05-28
**Status**: Draft
**Input**: User description: "./src/crd hosts the new design. Follow the directions of .src/crd/CLAUDE.md and /Users/borislavkolev/WebstormProjects/client-web/docs/crd/migration-guide.md. We need to implement the innovation hub and innovation hub settings into CRD. The pages are under the prototype: http://localhost:5173/innovation-hub/vng-innovation-hub/ & http://localhost:5173/innovation-hub/vng-innovation-hub/settings/about. We implement the new design as per prototype and guide. We use the existing functionality. Follow Solid principals. Minor UI change to note is that adding spaces to the hub is now done through a separate tab in the settings. We need to make sure we support both the old and new design following the existing logic based on a user settings designVersion and the cached/default value in LS."

## Overview

The Alkemio platform exposes per-organisation Innovation Hubs — branded public landing pages. **On every deployed environment (dev, staging, prod), the primary access path is the hub's dedicated subdomain**: visiting `demo.alkem.io` resolves the `demo` hub and lands on the hub home page; that page is the **starting page** for anyone arriving via the subdomain, exactly equivalent to opening `alkem.io/hub/demo` on the main domain. The hub subdomain is resolved server-side (the `useInnovationHub()` hook reads the subdomain from the current host in production and from the `?subdomain=` query param in local dev) and the path-based `/hub/<slug>` URL family exists in parallel as a deep-link / cross-domain reference.

The current Hub home page (rendered through the `/home` dispatcher when a subdomain is resolved AND directly via the `/hub/<slug>` route) and the Hub settings page are both implemented in the legacy MUI design. Both pages are now redesigned in the CRD (shadcn/ui + Tailwind) design system per the Figma Make prototype and must ship in parallel with the existing MUI versions, gated by the same per-user **design version** preference (`UserSettings.designVersion` with its localStorage mirror) that already drives every other CRD migration.

This spec covers two public-facing pages — **Innovation Hub Home** and **Innovation Hub Settings** — across **both** their entry points (subdomain `/`-or-`/home` AND main-domain `/hub/<slug>`), and the routing/dispatch wiring that lets either the legacy or the new version render based on the user's design preference.

## Clarifications

### Session 2026-05-28

- Q: What fills the circular thumbnail in the Settings sticky header, given the hub model has only a `BANNER_WIDE` visual and no separate avatar field? → A: Use the cropped `BANNER_WIDE` image when present; fall back to the `pickColorFromId` deterministic gradient + hub initials when no banner is set. (Standard CRD avatar-fallback pattern.)
- Q: Where does the "Browse all Spaces on Alkemio" footer CTA link to when the visitor is on a hub subdomain? → A: It links to the canonical platform host (`//<config.domain>/spaces`), so the visitor fully exits the hub's branded frame and lands on the platform-wide Spaces explorer. Matches the legacy "go to main page" behaviour and respects the CTA's purpose of escaping the hub's curated filter.
- Q: What happens when a viewer without the `Update` privilege opens `/hub/<slug>/settings` directly (typed URL, bookmark, shared link)? → A: Redirect them to the hub home page (`/hub/<slug>`) immediately on detecting the missing privilege. Fail closed — no exposure of admin-only fields, no broken save buttons. This is a behavioural improvement over the legacy MUI page, which renders the form regardless of privilege and relies on mutations failing server-side.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hub visitor sees the redesigned starting page when arriving on a hub subdomain (Priority: P1)

A person types or follows a link to an Innovation Hub subdomain (e.g. `demo.alkem.io`). The server resolves the subdomain to a configured hub, and the **starting page** the visitor lands on is that hub's home page — banner, name, tagline, description, curated Space grid — rendered through the CRD shell when their design-version preference is `2`. This is the dominant entry point for hub traffic on every deployed environment; it must render correctly on first visit, for anonymous and authenticated visitors alike.

**Why this priority**: Subdomain access is the primary discovery path for any Innovation Hub. Most hub traffic arrives this way (marketing links, organisation-internal bookmarks, partner sites). A hub whose subdomain doesn't surface its branded home page on the new design is effectively broken on the new design. Anonymous visitors land here from external links; admins land here when they sign in. It must work first.

**Independent Test**: With `localStorage('alkemio-design-version') = '2'`, visit a configured hub subdomain (in local dev: `localhost:3001/?subdomain=<existing-hub-subdomain>`; in deployed environments: `<hub-subdomain>.<env-domain>`). The browser lands on a page that renders the hub's full-width banner, the hub name + tagline below the banner, a description card, a responsive Space card grid in the hub's configured order, and a "Browse all Spaces on Alkemio" footer link — all inside the CRD shell (CRD header + CRD footer, no MUI chrome). Reload with the preference set to `1`: the legacy MUI hub home renders instead, unchanged. Visiting `/hub/<slug>` on the main domain produces the same page in the same design — the two entry points are content-equivalent.

**Acceptance Scenarios**:

1. **Given** the visitor is on `designVersion=2` and visits an Innovation Hub subdomain that resolves to a hub with a banner, tagline, description, and 9 selected Spaces, **When** the page loads, **Then** the hub home renders inside the CRD shell with the CRD banner, name + tagline header, description block, and a grid of 9 Space cards in the hub's configured order — no MUI chrome anywhere on the page, and no flash of the generic dashboard while the hub resolves.
2. **Given** the same hub exists, **When** the visitor instead opens `/hub/<slug>` on the main (non-subdomain) host, **Then** the **identical** CRD hub home page renders — content, layout, and behaviour are the same as the subdomain experience.
3. **Given** the visitor is signed in and has the `Update` privilege on the hub (a hub admin), **When** they view the hub home on `designVersion=2` (either via subdomain or via `/hub/<slug>`), **Then** a settings icon appears next to the hub title and links to the CRD Settings page for that hub.
4. **Given** the visitor is signed in but is NOT a hub admin, **When** they view the hub on `designVersion=2`, **Then** the settings icon is hidden — they see the public landing only.
5. **Given** a visitor is on `designVersion=1`, **When** they open the hub's subdomain OR `/hub/<slug>`, **Then** the legacy MUI hub home page renders, identical to today — no CRD code paths are loaded.
6. **Given** a visitor opens an Innovation Hub subdomain on `designVersion=2`, **When** the home-route dispatcher runs, **Then** it resolves the subdomain via the existing `useInnovationHub()` hook, detects a hub, and renders the **CRD** hub home (NOT the legacy MUI hub home and NOT the generic CRD dashboard). The fix to the current dispatcher behaviour — which today always renders the legacy MUI hub home regardless of design version — is part of this story.
7. **Given** a visitor opens the **main domain root** (`alkem.io` with no subdomain) on `designVersion=2`, **When** the home-route dispatcher runs, **Then** it resolves no hub and renders the regular CRD dashboard — the subdomain-→-hub dispatch must not regress this branch.
8. **Given** the hub has zero Spaces in its `spaceListFilter`, **When** the visitor views the hub home, **Then** the Spaces section header still shows but the grid area communicates "no Spaces yet" gracefully (no broken layout, no empty cards). The "Browse all Spaces" footer link remains.
9. **Given** the visitor clicks any Space card on the hub home, **When** the card has a public URL on its profile, **Then** the browser navigates to that Space — clicking a card never errors out, never depends on MUI routing.

---

### User Story 2 - Hub admin edits the hub's About details in the redesigned settings page (Priority: P1)

A hub admin opens the Settings page for the hub they own. They need to update the hub's display name, tagline, description (rich text), tags, banner image, and the subdomain it serves under. They land on the **About** tab by default, edit one or more fields, and save their changes. The page surfaces save state (idle → saving → saved) per section.

**Why this priority**: The Settings page is the only way for hub owners to keep their hub presentable. Without it migrated, admins on `designVersion=2` would be bounced back to the old MUI surface every time they wanted to edit a tag — a poor experience that defeats the migration goal. The About tab is the most-used tab and contains the entire profile fingerprint of the hub.

**Independent Test**: With `designVersion=2`, navigate to `/hub/<slug>/settings` as a user with admin rights — either from the settings gear on the hub home (whether reached via the subdomain or via the main-domain `/hub/<slug>` path) or by typing the URL directly. The page renders inside the CRD shell with a sticky tabbed header (avatar thumbnail + hub name + tagline at top; tabs below). The About tab is selected by default. Edit a field (e.g. the display name), save the field, observe the per-section save state transition; reload — the change persists.

**Acceptance Scenarios**:

1. **Given** an admin opens `/hub/<slug>/settings` (or `/hub/<slug>/settings/about`) on `designVersion=2` — either through the settings gear on the hub subdomain home, the settings gear on the main-domain `/hub/<slug>` home, or by typing the URL directly — **When** the page loads, **Then** the About tab is active by default, the sticky header shows the hub's avatar thumbnail, display name, and tagline, and the tab strip shows "About" and "Spaces" tabs.
2. **Given** the admin edits the **display name** field on the About tab and triggers Save, **When** the mutation succeeds, **Then** the section shows a transient "Saved" affordance, the page header reflects the new name without a full reload, and reloading the page from scratch confirms the change persisted.
3. **Given** the admin edits the **tagline** and the **description** (markdown / rich text) in the same session, **When** they save each section, **Then** each section's save state is independent — saving one section does not show "Saved" on the other, and a network failure on one section does not block the other.
4. **Given** the admin edits the **tags** (adding new tags, removing existing ones), **When** they save, **Then** the new tag set persists and re-renders, identical to the legacy tag-editing UX behaviourally.
5. **Given** the admin uploads a new **banner image**, **When** the upload completes, **Then** the new banner image is shown in the About tab preview, on the Settings sticky header thumbnail, and on the public hub home page after navigation — the upload reuses the existing visual / banner upload pipeline (no new backend contract).
6. **Given** the admin edits the **subdomain** field, **When** they save, **Then** the subdomain change persists and the hub is reachable at the new subdomain on next request (server-side validation surfaces the same way the legacy form surfaces it — duplicate/invalid subdomain shows an error message inline).
7. **Given** an admin is on `designVersion=1`, **When** they open the settings page, **Then** the legacy MUI settings page renders, unchanged.

---

### User Story 3 - Hub admin manages the Spaces shown on the hub in a dedicated Spaces tab (Priority: P1)

A hub admin wants to curate the list of Spaces shown on the hub's home page. In the new design, this is a **separate Spaces tab** in the settings — distinct from the About tab. From here they can see the current selection (with each Space's name, visibility, and host account), reorder it via drag handle, remove a Space, or add a new Space via the existing "Add Space by URL" flow.

**Why this priority**: Curating Spaces is the second key admin job. It is *the* feature that distinguishes an Innovation Hub from a vanilla landing page. Moving it to its own tab is the explicit UX change called out in the request ("adding spaces to the hub is now done through a separate tab in the settings") and is the visible structural difference between the legacy and CRD settings layouts. It must ship in the same release as the About tab to avoid splitting admin workflows across two design systems.

**Independent Test**: From the redesigned settings page, click the **Spaces** tab. The current list of Spaces renders as a table (name, visibility, host account, remove). Drag a row to reorder — the order persists on reload. Click **Add** — the existing AddSpaceByUrl dialog opens; add a Space by its URL; the new row appears in the table. Click the remove icon on a row — the Space is removed from the selection. Reload — all changes persist.

**Acceptance Scenarios**:

1. **Given** an admin is on the Settings page with `designVersion=2`, **When** they click the **Spaces** tab, **Then** the URL updates to `.../settings/spaces`, the active tab indicator moves, and the Spaces table renders with all currently selected Spaces in their current order.
2. **Given** the Spaces table is showing, **When** the admin drags a row to a new position, **Then** the new order is persisted (the same `updateInnovationHub` mutation that already handles `spaceListFilter` reordering today), the table re-renders in the new order, and a success indicator confirms the save.
3. **Given** the admin clicks the **Add** button, **When** the AddSpaceByUrl dialog opens and they paste a valid Space URL and confirm, **Then** the new Space is appended to the `spaceListFilter`, the table re-renders with the new row, and the change persists on reload.
4. **Given** the admin clicks the remove icon on a row, **When** the removal commits, **Then** the row disappears from the table immediately (optimistic) and remains absent after reload. (Per the CRD "all deletions must be confirmed" rule — see edge cases for how confirmation applies here.)
5. **Given** the admin opens the Spaces tab when the hub has zero selected Spaces, **When** the table renders, **Then** an empty state communicates that no Spaces are selected and prompts the admin to use **Add**.
6. **Given** the admin is on `designVersion=1`, **When** they open settings, **Then** the legacy combined form renders (with the spaces sub-section in the same scroll position as today) — no Spaces tab.

---

### User Story 4 - Both designs coexist; the user controls which one renders (Priority: P1)

The user can flip between the legacy and new designs from the Design Version switch in the header user menu, and the choice is remembered both server-side (`UserSettings.designVersion`) and locally (`localStorage('alkemio-design-version')`). Switching the preference and reloading must render the corresponding hub home and settings pages — the migration is opt-in until the toggle is removed.

**Why this priority**: The CRD migration policy requires both versions to remain functional throughout the migration window. Without this gating, we either lock customers out of the legacy design too early or fail to deliver the new design at all. It also covers anonymous-visitor behaviour: anonymous users follow the default (`2`) unless they've explicitly opted into legacy, so they get the new hub home naturally — but if there is no record yet, the boot path must not error.

**Independent Test**: Toggle `localStorage('alkemio-design-version')` between `1` and `2`, reloading between flips. Visit both `/hub/<slug>` and `/hub/<slug>/settings` in each mode. The CRD pages render only on `2`; the MUI pages render only on `1`. The bundle chunk for the inactive version is never fetched (check the Network tab).

**Acceptance Scenarios**:

1. **Given** the localStorage value is `'2'`, **When** the visitor opens `/hub/<slug>`, **Then** the CRD hub home page renders and the legacy `InnovationHubHomePage.tsx` chunk is never loaded by the browser.
2. **Given** the localStorage value is `'1'`, **When** the visitor opens `/hub/<slug>`, **Then** the legacy MUI hub home page renders and the new CRD page chunk is never loaded.
3. **Given** the localStorage value is unset (anonymous first-time visitor), **When** the page loads, **Then** the default (`'2'`) applies and the CRD page renders.
4. **Given** an authenticated admin flips the Design Version switch in the user menu, **When** the switch persists to the server, **Then** the page hard-reloads and the corresponding hub home / settings page renders in the chosen design.
5. **Given** the admin is on the legacy hub home and clicks the settings icon, **When** they navigate, **Then** the destination is the legacy settings page; the same click on the CRD hub home navigates to the CRD settings page. (Routing is internally consistent within each design.)
6. **Given** the visitor is on an Innovation Hub subdomain at `/home`, **When** their preference is `'2'`, **Then** the CRD-shell hub home renders (the existing `CrdHomePage` dispatcher routes to the new CRD page instead of the legacy one); when their preference is `'1'`, the legacy `HomePage` dispatcher continues to render the legacy hub home.

---

### Edge Cases

- **Hub not found / not authorized**: visiting `/hub/<unknown-slug>` on either design renders the existing 404 page — no change in behaviour, no new error surfaces.
- **Non-admin opens `/hub/<slug>/settings` directly via URL**: the page MUST redirect the visitor to the hub home page (`/hub/<slug>`) as soon as the missing `Update` privilege is detected on data load. No editable form, no "Forbidden" page, no read-only render — a clean redirect, fail-closed. This is an intentional behavioural improvement over the legacy MUI page (which renders the form regardless of privilege and relies on mutations failing server-side).
- **Subdomain rendering when there is no hub configured for that subdomain**: the existing fallback (render the regular dashboard) is preserved — the CRD dispatcher must not regress that branch. (E.g. visiting `unknown-name.alkem.io/` falls back to the generic dashboard for the active design version; it does not 404 and does not render an empty hub shell.)
- **Subdomain resolution is racy / slow**: while `useInnovationHub()` is still loading, the page MUST show a non-jarring loading state (no flash of dashboard followed by flash of hub home). The existing loading-gate pattern in `HomePage` / `CrdHomePage` is preserved — only flip to the resolved branch once `innovationHubLoading` is false.
- **Hub subdomain in local dev**: the dev environment routes the subdomain through the `?subdomain=<value>` query param rather than an actual subdomain on `localhost`. The CRD dispatch path MUST behave identically whether the subdomain came from a real host header or from the query-param fallback — both paths feed `useInnovationHub()` the same way.
- **Visitor follows a `/hub/<slug>` link while already on a different hub's subdomain**: e.g. on `acme.alkem.io` the user clicks a `/hub/demo` link. The page navigates to `acme.alkem.io/hub/demo` and the `/hub/<slug>` route renders the `demo` hub's home using the explicit slug; the subdomain-resolved hub on the current host does not interfere with the path-resolved hub. (Existing behaviour — preserved.)
- **Settings reached from inside a hub subdomain**: an admin on `acme.alkem.io` who clicks the settings gear lands on `acme.alkem.io/hub/acme/settings` (the settings URL is host-relative, built through `buildSettingsUrl(buildInnovationHubUrl(...))`). It MUST render the same CRD settings page that the admin would see on `alkem.io/hub/acme/settings`.
- **Slow / failing mutation on a per-section save in the About tab**: the saving indicator must transition back to "idle" (or surface a clear error) — it must never stay stuck on "saving" forever. The form state remains editable.
- **Removing the last Space from the Spaces tab**: confirmed via `ConfirmationDialog` per the CRD "all deletions must be confirmed" rule. After confirm, the empty-state message renders. (Per-row remove is destructive — it removes the Space from the hub's selection, not the Space entity itself, but the data the admin can't trivially recover is the curated ordering / inclusion, which is enough to warrant a confirm gate.)
- **Drag-reorder during an in-flight reorder mutation**: the second drag waits for the first or stacks behind it — no client desync between table order and server order. The existing optimistic-update pattern from the legacy `InnovationHubSpacesField` is preserved.
- **Banner upload failure**: the previous banner remains in place; an error message surfaces; the upload control returns to its idle state.
- **Description editor**: rich-text content from the legacy editor must continue to render correctly on the public home page (the home page renders the description as markdown / rich HTML, identical content shape on both sides).
- **Subdomain conflict on save**: the existing server validation surfaces an inline error on the subdomain field, just as it does on the legacy form.
- **The user lands on `/hub/<slug>/settings` without a tab segment**: the page redirects (or otherwise lands) on the About tab, matching the prototype's default-tab behaviour.
- **Anonymous visitor on the public hub home**: no settings icon, no edit affordances; all Space cards link via the cards' `href` (no auth gating beyond what the Space itself enforces).
- **The hub home page is rendered inside the legacy `TopLevelLayout` today** (it carries its own banner header). The CRD version must render inside `CrdLayoutWrapper` instead, with the banner positioned correctly under the CRD header (the prototype offsets it by `-64px` to tuck under the header — equivalent positioning is required).

## Requirements *(mandatory)*

### Functional Requirements

#### Public Hub Home Page

- **FR-001**: The new design MUST provide an Innovation Hub home page rendered through the CRD shell (`CrdLayoutWrapper` — CRD header + CRD footer), reachable through **both** entry points:
  - **Primary**: the hub's dedicated subdomain root, dispatched via the home route (e.g. `demo.alkem.io/` → resolves to the `demo` hub → renders the CRD hub home as the **starting page**).
  - **Secondary**: the main-domain path-based route at `/hub/<slug>`.
  The two entry points MUST render the same page (same content, same layout, same behaviour) for the same hub. There is no behavioural difference between subdomain and path access apart from the URL shown in the address bar.
- **FR-002**: The page MUST display the hub's **banner image** (full-width), **display name**, and **tagline** at the top, in the visual treatment shown in the prototype (banner full-bleed, name + tagline in an info bar tucked under the banner).
- **FR-003**: The page MUST display the hub's **description** as a rich-content block, rendering the same rich text content that the legacy page renders (no content reshaping).
- **FR-004**: The page MUST display the hub's curated Spaces — the set referenced by `InnovationHub.spaceListFilter`, in the order the admin configured in the Settings → Spaces tab — as a responsive grid of CRD Space cards (1 / 2 / 3 columns at small / medium / large viewports). The page MUST NOT show the platform-wide Space list. The rich card data (banner, leads, member count, level, tags) is sourced from the existing `DashboardSpaces` query; the home-page fragment is extended with `spaceListFilter { id }` and the integration mapper intersects + reorders. This is a deliberate departure from the legacy `InnovationHubHomePage` (which renders the unfiltered platform list) and tracks the prototype.
- **FR-005**: The page MUST hide the Settings icon from any viewer who lacks the `Update` privilege on the hub; show it (deep-linked to the CRD Settings page) to viewers who have the privilege.
- **FR-006**: The page MUST include a "Browse all Spaces on Alkemio" call-to-action that links to the **canonical platform host** (`//<config.domain>/spaces` — resolved via `useConfig().locations.domain`, identical to the legacy "go to main page" pattern). When a visitor is on a hub subdomain, clicking the CTA MUST navigate them off the subdomain to the platform-wide Spaces explorer; it MUST NOT stay subdomain-relative.
- **FR-007**: When the hub has no Spaces in its filter, the Spaces section MUST render a graceful empty state — never a broken or empty grid.
- **FR-008**: All Space cards MUST link to their respective Space URL using the existing `profile.url` on the Space (URL builder centralised, no inline path templating per the CRD URL-construction rule).

#### Settings Page — Shell

- **FR-009**: The new design MUST provide an Innovation Hub Settings page rendered through the CRD shell, reachable at `/hub/<slug>/settings` and `/hub/<slug>/settings/<tab>`. The page MUST verify the viewer holds the `Update` privilege on the resolved hub before rendering any edit affordances; on missing privilege, it MUST redirect to `/hub/<slug>` rather than render the form, surface a permission-denied page, or render in a read-only state.
- **FR-010**: The Settings page MUST have a sticky header containing the hub's identity thumbnail (a circular `w-12 h-12` graphic), display name, and tagline, and a tab strip below it. The thumbnail MUST render the cropped `BANNER_WIDE` visual when one is set; when the hub has no banner, it MUST fall back to the deterministic `pickColorFromId` gradient + hub initials (the standard CRD avatar-fallback pattern). Stock placeholder images MUST NOT be used.
- **FR-011**: The Settings page MUST expose two tabs: **About** (default) and **Spaces**. A URL with no tab segment redirects to (or renders as) the About tab.
- **FR-012**: Switching tabs MUST update the URL (deep-linkable / refreshable / shareable) and update the active tab indicator accordingly.

#### Settings — About Tab

- **FR-013**: The About tab MUST allow an admin to edit the hub's **subdomain**, **display name**, **tagline**, **description** (rich text / markdown), **tags**, and **banner image**.
- **FR-014**: Each editable section MUST surface its own dirty / saving / saved state independently, so saving one section does not flicker save state on another. (Per-section inline save is the prototype's UX — see Assumptions.)
- **FR-015**: Saving an edited section MUST call the existing `updateInnovationHub` mutation with only the fields that section owns, leaving all other fields untouched on the server.
- **FR-016**: Server-side validation errors (e.g. duplicate subdomain, invalid markdown length) MUST surface inline on the offending field, not as a global error.
- **FR-017**: Field-length and format validation MUST match the validation rules already enforced on the legacy form (subdomain format, name length, markdown text length ≤ `MARKDOWN_TEXT_LENGTH`, tagline ≤ `MID_TEXT_LENGTH`). Validation MUST run client-side before the section's save mutation fires (instant feedback), with the same rejection messages surfaced inline on the offending section. Server-side validation remains the final authority for cross-entity rules (e.g. duplicate subdomain) per FR-016. No Formik / yup — validators are plain TypeScript functions, invoked from the integration hook.
- **FR-018**: Banner upload MUST reuse the existing visual-upload pipeline used by the legacy form (same storage bucket, same `VisualType.BANNER_WIDE`, same authorization). The CRD layer renders the upload affordance; the underlying upload mutation contract is unchanged.

#### Settings — Spaces Tab

- **FR-019**: The Spaces tab MUST display the hub's currently selected Spaces in a table with columns: **Name**, **Visibility**, **Host Account**, and a row-level **Remove** action.
- **FR-020**: The Spaces tab MUST allow drag-to-reorder rows, persisting the new order through the existing `updateInnovationHub` mutation (using `spaceListFilter` and the existing optimistic-update pattern).
- **FR-021**: The Spaces tab MUST expose an **Add** action that opens the existing "Add Space by URL" dialog (`AddSpaceByUrlDialog`, introduced on the parent `095-hub-add-space-url` branch). On confirm, the new Space is appended to `spaceListFilter` via the existing flow.
- **FR-022**: The row-level Remove action MUST go through a `ConfirmationDialog` (CRD "all deletions must be confirmed" rule). On confirm, the existing remove flow updates `spaceListFilter`. On cancel, no change is made.
- **FR-023**: When the table is empty, an empty state MUST display ("No Spaces selected. Use **Add** to include Spaces" or equivalent), in line with the prototype.

#### Cross-Cutting (toggle, routing, rendering)

- **FR-024**: The CRD hub home page and CRD settings page MUST render only when the user's design version preference is `2` (per the existing `useCrdEnabled()` boot-time hook). On preference `1`, the legacy MUI pages render instead.
- **FR-025**: Both the legacy and the new versions MUST be lazy-loaded; the inactive version's chunk MUST never be fetched in a given session.
- **FR-026**: Toggling the design version through the user-menu switch MUST cause the next page load to render the corresponding version (no manual cache clearing, no logout required). The existing `useDesignVersionToggle` / `useDesignVersionSync` flow is unchanged.
- **FR-027**: The home-route dispatcher MUST resolve hub-subdomain access correctly under both design versions. Specifically:
  - On every page load of the home route, the existing `useInnovationHub()` hook resolves whether the current host is a hub subdomain (server-driven in deployed environments; `?subdomain=` query param in local dev). If it resolves to a hub, the **starting page** for that session is that hub's home; if it resolves nothing, the **starting page** is the generic dashboard for the current design.
  - On `designVersion=2` AND a hub is resolved → render the new **CRD hub home** inside the CRD shell.
  - On `designVersion=2` AND no hub is resolved → render the **CRD dashboard** (existing behaviour, unchanged).
  - On `designVersion=1` AND a hub is resolved → render the **legacy MUI hub home** (existing behaviour, unchanged).
  - On `designVersion=1` AND no hub is resolved → render the **legacy MUI dashboard** (existing behaviour, unchanged).

  The current `CrdHomePage` dispatcher resolves the hub correctly but **always renders the legacy MUI hub page** for the hub-resolved branch — that hardcoded fallback to the MUI hub page is the load-bearing change for this requirement. The legacy `HomePage` dispatcher (the `designVersion=1` path) remains untouched.
- **FR-027a**: The `/hub/<slug>` path route MUST be CRD-aware on the same dispatch rule: when `designVersion=2`, render the new CRD hub home; when `designVersion=1`, render the existing legacy MUI hub home via the existing `HubRoute` / `HubLandingPage`. (The `/hub/<slug>` route is the secondary entry point — it must reach the same CRD page as the subdomain branch.)
- **FR-027b**: The `/hub/<slug>/settings` (and `/hub/<slug>/settings/<tab>`) routes MUST be CRD-aware on the same dispatch rule and MUST be reachable whether the admin is browsing the main domain OR a hub subdomain — the settings URL family is independent of which host the admin arrived through. (URLs are built via `buildSettingsUrl(buildInnovationHubUrl(...))` / equivalent; the integration layer relies on the centralised builders rather than templating paths inline.)
- **FR-028**: Anchored URL paths for the hub home and the hub settings MUST be produced through `@/main/routing/urlBuilders` (no inline string concatenation in the CRD layer).
- **FR-029**: All user-visible strings on the CRD hub pages MUST go through a CRD i18n namespace (`crd-innovationHub` is the assumed name). Strings MUST be authored in English plus the platform's full supported-language set (en, nl, es, bg, de, fr) in the same PR; CRD translations are managed manually, not via Crowdin.
- **FR-030**: Per the do-not-translate platform-terms glossary, the words **Space**, **Subspace**, **Post**, **template**, **Layout**, and **Virtual Contributor** stay in English (enforced for Dutch today; expected to extend to the other languages later) — the surrounding sentence is translated and inflected around them. The Innovation Hub feature is mostly orthogonal to the glossary but the Spaces table headings, the "Browse all Spaces" CTA, the Spaces tab label, and any "Add Space" surfaces MUST follow the rule.
- **FR-031**: The legacy MUI hub pages (`InnovationHubHomePage.tsx`, `InnovationHubSettingsPage.tsx`, the supporting `InnovationHubForm.tsx`, `InnovationHubSpacesField.tsx`, `InnovationHubProfileLayout.tsx`, the `/hub` `HubRoute.tsx`, the legacy `HomePage.tsx`) MUST remain in the codebase, untouched, until the design-version toggle is retired. Deleting them is out of scope.
- **FR-032**: The CRD components built for this feature MUST observe the CRD golden rules: no MUI imports, no GraphQL types in props, no business logic in `src/crd/`, all `on*` handlers are props, Tailwind-only styling, lucide-react icons, semantic typography tokens, WCAG 2.1 AA conformance for every interactive element.
- **FR-033**: The integration layer (`src/main/crdPages/innovationHub/`) is the only place where GraphQL data is mapped to CRD component props. CRD components MUST NOT import GraphQL hooks, generated types, or domain hooks directly.

### Key Entities *(include if feature involves data)*

- **Innovation Hub**: a branded landing surface owned by an account (user or organisation). Identified by `id` (UUID) and by a unique `subdomain`. Carries a `profile` (display name, tagline, description, banner visual, tag set), a `spaceListFilter` (the curated, ordered collection of Spaces shown on the hub), and a `spaceVisibilityFilter` (out of scope for this spec — preserved as-is from the existing model). The viewer's authorization privileges on the hub determine whether they see edit affordances and the settings entry point.
- **Hub-selected Space**: a `Space` referenced by the hub's `spaceListFilter`. The hub home page surfaces these as Space cards. The Settings → Spaces tab manages the membership and the order of this collection. Each row carries the Space's display name, visibility (ACTIVE / INACTIVE / DEMO / etc.), host account name, and identifying URL — the existing `InnovationHubSpace` fragment is the source of these fields.
- **Design Version preference**: the existing per-user `UserSettings.designVersion` (`1` = MUI / `2` = CRD) mirrored to `localStorage('alkemio-design-version')`. This entity is unchanged; the hub feature consumes the existing hook (`useCrdEnabled()`) and the existing toggle UX. Default for unset users is `2`.

## Assumptions

- **Per-field inline save in the About tab.** The prototype shows per-section saving (each field has its own Save button that transitions through `idle → saving → saved`). The legacy MUI page uses a single bottom Save button. The CRD page adopts the prototype's per-section pattern because the user request asks to "implement the new design as per prototype". The existing `updateInnovationHub` mutation accepts partial profile-data inputs, so per-section saves call the same mutation with only the relevant subset of fields — no new backend contract is needed.
- **Spaces tab auto-saves on add / remove / reorder.** The existing legacy flow commits each change immediately (via `handleSubmitSpaceListFilter`). The prototype shows an "Add" button and a separate "Save" button at the top of the tab; this is interpreted as decorative given the existing auto-save behaviour. The CRD Spaces tab drops the redundant top-level "Save" button and continues to auto-save on each action, matching the legacy semantics. A toast / inline confirmation surface still signals success.
- **Settings tabs scope.** The prototype source includes additional placeholder tabs ("Settings", "Account") marked "under development". This spec ships only the two production-ready tabs called out by the user: **About** and **Spaces**. The placeholder tabs are not part of scope.
- **Default tab.** Opening `/hub/<slug>/settings` with no tab segment lands on **About** (matches the prototype's `<Navigate to=".../about" replace />`).
- **Two URL families exist for hub settings.** `/hub/<slug>/settings` (user-facing) and `/innovation-hubs/<slug>/settings` (platform-admin entry) both currently render the same `InnovationHubSettingsPage`. This spec covers the **`/hub/<slug>/settings`** entry — the platform-admin route at `/innovation-hubs/…` is part of the platform admin surface (still MUI) and is out of scope for this migration. The same is true for the create-hub flow.
- **The hub home page is reachable via two URL families**, and **subdomain access is the primary, dominant entry point** on every deployed environment:
  - **Subdomain access** (primary): `<hub-subdomain>.<env-domain>/` (or `/home`) — the server resolves the subdomain, the home-route dispatcher (`CrdHomePage` on `designVersion=2`, `HomePage` on `designVersion=1`) detects the hub via `useInnovationHub()`, and renders the hub home as the visitor's **starting page**.
  - **Path access** (secondary): `<env-domain>/hub/<slug>` — the existing `HubRoute` matches the path and renders the same hub home.

  Both branches must be CRD-aware in the new design. The subdomain branch is the load-bearing change because the current `CrdHomePage` dispatcher always renders the legacy MUI hub home regardless of the design preference — fixing that branch is in scope. The path branch must select the CRD or legacy page through the same `useCrdEnabled()` gate.

  **The starting-page concept**: in every environment, the page a visitor lands on when arriving at a hub's subdomain root is, by definition, the hub home page for that hub. Calling this the "starting page" reflects the user's mental model — the subdomain *is* the hub, and what loads at the root *is* the hub. The CRD migration must preserve that one-to-one correspondence: `demo.alkem.io/` MUST equal `alkem.io/hub/demo` in rendered content, and on `designVersion=2` both MUST render the new CRD design.
- **Banner upload mechanics.** The CRD layer renders the upload affordance per the prototype (hover-to-reveal "Change Banner" button over the current banner preview); the underlying mutation contract reuses the existing visual / storage-bucket pipeline. No new CRD primitive for banner upload is mandated by this spec — the integration layer may either render a CRD form wrapper around the existing upload flow or build a small CRD-shaped wrapper inside `crdPages/innovationHub/`.
- **Reordering preserves the existing optimistic-update pattern** from `InnovationHubSettingsPage.tsx`'s `handleSubmitSpaceListFilter` — the integration layer keeps the same `optimisticResponse`, the same refetch on commit, and the same `useSensors` setup for keyboard accessibility.
- **Routing change for `HubRoute`.** The legacy `HubRoute` mounts the legacy `HubLandingPage` (which itself renders `InnovationHubHomePage`) and the legacy `InnovationHubSettingsPage`. The CRD layer adds a parallel CRD route surface (under `src/main/crdPages/innovationHub/routing/`) and `TopLevelRoutes.tsx` dispatches to the CRD route surface when `crdEnabled` is true.
- **No new server-side contract.** Every mutation and query the feature needs is already generated and live (`InnovationHubSettings`, `InnovationHubById`, `InnovationHub`, `UpdateInnovationHub`, the `InnovationHubSpace` fragment, visual upload). The feature is purely a UI-layer migration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A signed-in admin on the new design can find their hub, open the settings, change the display name, save it, and see the updated name reflected on the public hub home — in under 60 seconds — without ever leaving the CRD shell.
- **SC-002**: An admin can curate the Spaces shown on their hub (add a Space by URL, drag-reorder the list, remove a Space) in under 90 seconds via the new Spaces tab, with each operation committing successfully on the first attempt at a healthy network.
- **SC-003**: An anonymous visitor opening `/hub/<existing-slug>` on the new design sees the page render its banner, name, and description in the above-the-fold viewport with a Lighthouse-measured **LCP ≤ 2.5s** and **FCP ≤ 1.8s** under "Fast 3G + 4× CPU slowdown" throttling. Cumulative Layout Shift MUST be ≤ 0.1 (no banner-loaded reflow that pushes the info bar around).
- **SC-004**: Switching the design version preference and reloading produces the corresponding hub home and settings pages on the next page load 100% of the time — no stale chunk, no UI in the wrong shell, no need to clear cache.
- **SC-005**: Both legacy and new versions coexist with zero shared regressions: legacy hub admins on `designVersion=1` see exactly the page they saw before this feature shipped, with no visible or behavioural change.
- **SC-006**: The bundle delta for the new hub pages is fully lazy-loaded — visitors who never open the hub never download the new code; visitors on the legacy design never download the CRD chunks.
- **SC-007**: Every interactive element on the new hub pages meets WCAG 2.1 AA (`focus-visible:ring`, accessible name on every icon button, semantic headings, `<ul>`/`<li>` for the Space grid, table semantics for the Spaces tab) — verified by code review checklist coverage.
- **SC-008**: All user-visible strings on the new hub pages route through the CRD i18n namespace for all six supported languages (en, nl, es, bg, de, fr) at PR merge time — no hardcoded strings, no missing keys in any language file, glossary terms respected for Dutch.
