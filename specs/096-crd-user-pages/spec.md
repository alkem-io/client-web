# Feature Specification: CRD User Profile Page

**Feature Branch**: `096-crd-user-pages`
**Created**: 2026-04-29
**Status**: Draft
**Input**: Migrate the public **User Profile** page (`/user/:userSlug`) from the current MUI implementation to the CRD design system (shadcn/ui + Tailwind). Use the prototype reference at `prototype/src/app/pages/UserProfilePage.tsx`. Follow the migration pattern established by spec `045-crd-space-settings` and the architectural rules in `docs/crd/migration-guide.md`. The seven **User Settings** tabs (`/user/:userSlug/settings/*`) are owned by sibling spec `097-crd-user-settings` — that spec was split out of this one so the public-profile view and the settings shell can be planned, tracked, and shipped independently. Both specs share the same `useCrdEnabled` toggle and the shared layout shell `CrdLayoutWrapper`; together they form one user-vertical release.

## Clarifications

### Session 2026-04-29

- Q: Online-presence dot on the public profile hero — derive from `lastActiveDate`, drop entirely, or wire a real presence channel? → A: **Drop entirely.** The dot is removed from the public profile hero. This keeps the migration a parity restyle (current MUI does not surface presence) and avoids implying real-time online status without an actual presence channel. `User.lastActiveDate` exists on the schema but stays unused by CRD in this iteration.
- Q: Does the public-profile Message button stay in the CRD hero? → A: **Yes — keep it.** The CRD hero exposes a Message button for any signed-in non-owner viewer. The button reuses the existing `useSendMessageToUsersMutation` via a callback prop, mirroring the current MUI `UserPageBanner.handleSendMessage` flow exactly: clicking the button opens an in-hero compose surface (or a small dialog), the user types a message, the mutation fires with `{ message, receiverIds: [userId] }`, and on success the surface closes. No new GraphQL mutation is introduced.
- Q: Public-profile resource sections — pagination strategy for users with many memberships? → A: **No pagination cap; render every item; match current MUI `TilesContributionsView` exactly.** The current MUI does not paginate — it renders every contribution inside a `ScrollableCardsLayoutContainer` (horizontal scroll). CRD ports this behavior: each resource section (Hosted Spaces, Virtual Contributors, Spaces Leading, Member Of) renders **all** its items in a CRD card grid with no "Show more" affordance, no Next/Previous controls, no infinite scroll. The grid handles overflow via standard page scrolling. The section is omitted entirely when its item count is zero (FR-015). If the data ever explodes (1000+ items), pagination becomes a separate future enhancement; for the migration scope, parity with current MUI is the rule.
- Q: Settings (gear) icon on the public-profile hero — owner-only, or also visible to platform admins on other users' profiles? → A: **Owner OR platform admin.** The Settings icon mirrors the same `canEditSettings = (currentUser.id === profileUser.id) || currentUserHasPlatformAdminPrivilege` predicate used by the sibling settings spec (`097-crd-user-settings` FR-008a) — visible for the profile owner AND for any platform-admin viewer of someone else's profile. Same icon, same destination (`/user/:userSlug/settings/profile`); for an admin, it links to the target user's settings, not their own. The Message button stays visible for the admin too, since admins can also message other users — so an admin viewing a non-self public profile sees BOTH the Settings icon and the Message button in the hero.
- Q: Tab strip overflow on small viewports — how does the 5-tab public-profile resource strip behave below `md`? → A: **Horizontal scroll.** For viewports below the `md` breakpoint, every tab remains rendered inline; the strip itself overflows and is horizontally scrollable (touch swipe, wheel, or trackpad gesture) using `overflow-x-auto no-scrollbar` (matching the prototype's existing approach on the resource strip). The active tab MUST be auto-scrolled into view on mount and on tab change so it never starts off-screen. No dropdown / hamburger / two-row wrap variant is introduced — this matches the responsive behavior of the 7-tab settings strip in sibling spec `097-crd-user-settings` so the visual identity stays consistent across the user vertical.

## User Scenarios & Testing

The public profile view is the entry point of the user vertical. Settings sit one click behind it (sibling spec `097-crd-user-settings`), reached via the **Settings (gear) icon** in the hero. Both specs are gated by the same `useCrdEnabled` toggle and ship as one user-vertical release: when CRD is enabled, the entire user vertical (this view + the seven settings tabs) renders in CRD; when CRD is disabled, the entire vertical renders in MUI. There is no half-CRD / half-MUI mix.

### User Story 1 - Public User Profile Page (Priority: P1)

Anyone with access to the platform opens `/user/:userSlug` and sees a public profile of that user, replacing the current MUI `UserProfilePage` with a CRD shell. The page presents:

- A **profile hero**: a wide banner image (using `pickColorFromId` for a deterministic gradient fallback when no banner is set), the user's avatar overlaid on the banner, the user's display name, a short location line (city + country), and — when the viewer satisfies `canEditSettings` (the profile owner OR a platform admin) — a **Settings** icon button that links to `/user/:userSlug/settings/profile` for the profile being viewed. There is no online-presence dot in this iteration (the prototype's mock dot is dropped); presence remains a future enhancement.
- A **left sidebar** (`col-span-2` on `lg+`, hidden on smaller viewports) showing two sections: an **About** block rendering the user's bio (`profile.description`, markdown) and an **Organizations** block listing the user's associated organizations as compact `OrganizationCard` rows (logo, name, role, member count) — same data the current MUI `AssociatedOrganizationsLazilyFetched` consumes.
- A **right column** (8 cols) with a sticky **resource tab strip**: All Resources, Hosted Spaces, Virtual Contributors, Leading, Member Of. The default active tab is "All Resources". Each tab filters the visible resource sections. On viewports below `md` the strip is horizontally scrollable (`overflow-x-auto no-scrollbar`); all five tabs stay inline and the active tab auto-scrolls into view.
- Below the tab strip the page renders, depending on the active tab:
  - **Resources Hosted** — a section combining the user's hosted spaces (rendered as the same reusable CRD space-card the Explore Spaces feature consumes) and the user's hosted virtual contributors (rendered as `Sparkles`-iconed cards with name, description, type badge).
  - **Spaces Leading** — spaces in which the user holds the `lead` role (host, admin, lead per `useFilteredMemberships`), rendered as space-cards.
  - **Member Of** — remaining memberships, rendered as space-cards.

If the user has no hosted resources / no leading spaces / no memberships, the corresponding section either renders an empty-state message ("No memberships yet") or is omitted, mirroring the current MUI behavior.

The page is **read-only**: there is no editing capability anywhere on the public profile. Editing happens exclusively in `/user/:userSlug/settings/*`, which is owned by sibling spec `097-crd-user-settings`.

The page also includes a **Message** button in the hero. When the viewer is signed in and is **not** the profile owner, clicking Message opens an in-hero compose surface (a small popover or inline textarea); submitting fires the existing `useSendMessageToUsersMutation` against this user as recipient — same handler shape as the current MUI `UserPageBanner.handleSendMessage`. The Message button is hidden on the user's own profile.

**Independent Test**: Toggle CRD on. Open `/user/jeroen`. Verify the hero, the bio, the organizations list, the sticky tab strip with All Resources active, and the rendered space cards. Click each tab — only the matching sections render. Confirm the Settings icon button is visible when viewing your own profile (links to `/user/<self>/settings/profile`) AND when a platform admin views another user's profile (links to `/user/<otherUser>/settings/profile`); for non-admin viewers on someone else's profile, the Settings icon is hidden. Confirm the Message button is visible on other users' profiles (for any signed-in viewer, including admins) and hidden on your own.

**Acceptance Scenarios**:

1. **Given** any signed-in user opens `/user/<otherUser>`, **When** the page renders, **Then** the CRD hero, bio, organizations sidebar, sticky tab strip (All Resources active), and the user's hosted/leading/member space sections are visible.
2. **Given** the viewer is on their own profile, **When** the hero renders, **Then** a Settings icon button is visible and a Message button is **not** visible.
3. **Given** a non-admin viewer is on someone else's profile, **When** the hero renders, **Then** the Message button is visible and the Settings icon button is **not** visible.
4. **Given** a platform-admin viewer is on someone else's profile, **When** the hero renders, **Then** **both** the Message button **and** the Settings icon button are visible; clicking the Settings icon navigates to `/user/<otherUser>/settings/profile` (the target user's settings, not the admin's own).
5. **Given** the user has no hosted resources, **When** the All Resources tab is active, **Then** the Resources Hosted section is omitted (empty section is not rendered).
6. **Given** the user has no leading spaces, **When** the Leading tab is active, **Then** an empty-state message is rendered.
7. **Given** any user opens the public profile, **When** the hero renders, **Then** **no** online-presence dot is shown (parity with current MUI).
8. **Given** CRD is disabled via the localStorage toggle, **When** the page is opened, **Then** the existing MUI `UserProfilePage` renders unchanged.

---

### Edge Cases

- **Unauthenticated viewer on a public profile**: the public profile loads as today; the Settings icon button is hidden, the Message button is hidden (no signed-in identity to send from). The settings routes (sibling spec `097-crd-user-settings`) redirect to login via the existing `NoIdentityRedirect` wrapper.
- **Public profile URL with stale `nameID`**: the existing redirect logic in `useUserProvider` resolves the canonical URL; CRD reuses the same hook.
- **Viewing your own profile via the `/me` shorthand**: `/user/me` resolves to the current user's profile page (existing `UserMeRoute` behavior), then renders the public profile. The Settings icon links to `/user/me/settings/profile`.
- **Long resource lists** (50+ hosted spaces, 50+ memberships): every item is rendered (no pagination cap, see FR-015a); the page handles overflow via standard scrolling. The sticky tab strip stays anchored as the user scrolls.
- **Message send failure**: the existing mutation error path surfaces a CRD `Toast` with the error message; the compose surface stays open so the user can retry without retyping.
- **CRD toggled off mid-session**: the design-system toggle on the sibling settings spec reloads the page; the user lands on the equivalent MUI public profile. URL stays the same; routing matches the MUI handler.

## Requirements

### Functional Requirements

#### Migration scope and routing

- **FR-001**: System MUST render the public **User Profile** page (`/user/:userSlug`) in CRD when `localStorage('alkemio-crd-enabled')` is `'true'`.
- **FR-002**: System MUST render the existing MUI `UserProfilePage` unchanged when `localStorage('alkemio-crd-enabled')` is unset or any other value (default OFF).
- **FR-003**: System MUST gate the CRD vs. MUI choice via `useCrdEnabled` and add a conditional block in `TopLevelRoutes.tsx` exactly as documented in `docs/crd/migration-guide.md` (lazy-loaded chunks for both versions; only the active chunk is fetched).
- **FR-004**: System MUST keep the existing MUI page files in `src/domain/community/user/userProfilePage/` and the wiring in `src/domain/community/user/routing/UserRoute.tsx` in place; the CRD page lives under `src/main/crdPages/userPages/profile/`.
- **FR-005**: CRD page components MUST NOT import from `@mui/*` or `@emotion/*` and MUST NOT import GraphQL-generated types directly into views; data mappers in `src/main/crdPages/userPages/profile/dataMapper.ts` are the only place GraphQL types meet CRD prop types.
- **FR-006**: CRD components in `src/crd/components/user/` (hero, organization sidebar, resource tab strip, etc.) MUST be presentational only (zero `@mui/*` imports, zero GraphQL-type imports, all behavior received as `on*` callback props per the CRD architectural rules in `src/crd/CLAUDE.md`).
- **FR-007**: System MUST resolve `/user/me` to the current user's profile exactly as the current MUI `UserMeRoute` does.
- **FR-008**: The public profile page MUST be reachable without authentication (parity with current MUI). Authentication-gated affordances inside the hero (Message button, Settings icon) follow their own gating predicates (FR-011, FR-012).

#### Public profile page (User Story 1)

- **FR-010**: The public profile hero MUST render the user's banner (or a deterministic gradient fallback computed via `pickColorFromId` from `@/crd/lib/pickColorFromId`), avatar, display name, and location line. The hero MUST NOT render an online-presence indicator (parity with current MUI; the prototype's mock dot is intentionally dropped).
- **FR-011**: The public profile hero MUST show a Settings icon button linking to `/user/:userSlug/settings/profile` (the profile being viewed) when the viewer satisfies `canEditSettings = currentUser.id === profileUser.id || hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin)` — i.e., the profile owner OR a platform admin. The icon MUST be hidden for every other viewer (non-owner non-admin signed-in viewers, anonymous viewers). For admin viewers on another user's profile, the icon MUST coexist with the Message button (FR-012) since admins can both edit and message. The destination route is owned by sibling spec `097-crd-user-settings` (which evaluates the same predicate at the settings-shell route boundary).
- **FR-012**: The public profile hero MUST show a Message button only when the viewer is signed in and is **not** the profile owner. Clicking the button opens an in-hero compose surface; submitting fires the existing `useSendMessageToUsersMutation` via a callback prop with `{ message, receiverIds: [userId] }` — exact parity with the current MUI `UserPageBanner.handleSendMessage`. The mutation lives in the integration layer (`src/main/crdPages/userPages/profile/`); the CRD hero component receives `onSendMessage(messageText: string): Promise<void>` as a prop and knows nothing about GraphQL.
- **FR-013**: The public profile MUST render five resource sections (All Resources, Hosted Spaces, Virtual Contributors, Leading, Member Of) in a sticky tab strip, with All Resources active by default. On viewports below the `md` breakpoint the strip MUST horizontally scroll (`overflow-x-auto no-scrollbar`); all five tabs MUST remain rendered inline (no dropdown / hamburger / two-row wrap variant) and the active tab MUST be auto-scrolled into view on mount and on every tab change. The same horizontal-scroll responsive behavior is shared with the 7-tab settings strip in sibling spec `097-crd-user-settings`.
- **FR-014**: The public profile MUST reuse the same CRD space-card primitive that `043-crd-search-dialog` and the planned Explore Spaces page consume. No new space-card variant is introduced.
- **FR-015**: When a section has no items, the section MUST be either omitted or replaced by a CRD empty-state message — parity with current MUI behavior.
- **FR-015a**: Each public-profile resource section MUST render **every** item the data hooks return — no pagination cap, no "Show more" affordance, no Next/Previous controls, no infinite scroll. The grid container handles overflow via standard page scrolling. This matches the current MUI `TilesContributionsView` exactly.

#### Internationalization

- **FR-100**: All user-visible strings on the CRD public profile page MUST live in `src/crd/i18n/userPages/userPages.<lang>.json` (one namespace per CRD feature, per `src/crd/CLAUDE.md`). The namespace MUST be registered in `src/core/i18n/config.ts` and `@types/i18next.d.ts`. (The sibling spec `097-crd-user-settings` owns its own `src/crd/i18n/userSettings/` namespace; the two namespaces are independent so the specs can ship independently.)
- **FR-101**: All six supported languages (en, nl, es, bg, de, fr) MUST be created and edited in the same PR that introduces or removes a key, per the CRD i18n manual workflow (no Crowdin).

#### Accessibility

- **FR-110**: Every interactive element on the CRD public profile page MUST meet WCAG 2.1 AA — semantic HTML, visible focus indicators, accessible names on icon-only buttons (Settings, Message, tab strip controls), keyboard reachability, and `aria-busy` on async-pending buttons.
- **FR-111**: The resource tab strip MUST be navigable by keyboard (Tab into the strip, Left/Right arrows between tabs, Enter to activate) — same pattern the existing CRD tabs primitive provides.

### Key Entities

- **User** — the profile being viewed. Sourced from `useUserQuery`. Key attributes consumed by CRD: `id`, `nameID`, top-level identity (`firstName`, `lastName`), `profile.{id, displayName, tagline, description, location.{city, country}, avatar, banner, references}`.
- **Membership** — an entry in `rolesUser.spaces` (and nested subspaces). Attributes used by CRD: `id`, `displayName`, `level`, role flags. Mapped to `SpaceHostedItem` for the existing tile views.
- **AssociatedOrganization** — an organization the user is a member of. Sourced via `useUserOrganizationIds` + lazy fetch. Attributes: `id`, `profile.{displayName, description, location, avatar, url}`, `verified`, `associatesCount`, role.
- **HostedResource** — a hosted space, virtual contributor, innovation pack, or innovation hub the user owns. Listed in the Resources Hosted section of the public profile.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Any signed-in viewer can open `/user/<other>`, scan the hero, bio, organizations sidebar, and at least the All Resources tab in under 5 seconds with no console errors and no failed network calls.
- **SC-002**: 100% of the URLs that resolve to a public user profile in MUI continue to resolve to the equivalent page in CRD with no broken links — verified by an automated route smoke test.
- **SC-003**: The Message and Settings affordances on the hero are visible in exactly the matrix specified by FR-011 / FR-012 (owner sees only Settings; non-admin non-owner sees only Message; platform admin viewing someone else sees both; anonymous viewer sees neither) — verified by automated tests covering each viewer category.
- **SC-004**: The lighthouse / axe accessibility audit reports zero critical or serious violations on the CRD public profile page.
- **SC-005**: Bundle size delta from this migration MUST NOT exceed +20 KB gzipped on the user-profile chunk over the prior build (lazy-loaded; verified via `pnpm analyze`).
- **SC-006**: Public-profile resource sections render correctly for users with 0 memberships, 1 membership, 50+ memberships, and a mix of L0 / L1 / L2 spaces — verified manually with seeded test fixtures.

## Assumptions

- The CRD shell (`CrdLayoutWrapper`, header, footer, dialogs) and the design-system toggle (`useCrdEnabled`) are already in place and reused without modification — established by spec `041-crd-dashboard-page` and reused by spec `045-crd-space-settings`.
- The reusable CRD space-card primitive (used on the public profile's resource sections) already exists or will be reused from `043-crd-search-dialog` / the in-flight Explore Spaces page; this spec does not introduce a new variant.
- The seven-tab User Settings shell that the Settings (gear) icon links into is owned by sibling spec `097-crd-user-settings`. Both specs ship together as a single user-vertical release; the gating predicate `useCrdEnabled` is the same for both, so the user never sees a half-CRD / half-MUI mix.
- The existing data hooks (`useUserQuery`, `useUserContributionsQuery`, `useUserOrganizationIds`, `useSendMessageToUsersMutation`) are sufficient — **no GraphQL schema change is required**.
- **The prototype is treated as a visual reference, not an authoritative spec.** Where the prototype invents a capability that does not exist on the backend (online-presence dot), CRD drops it unless explicitly clarified otherwise.
- Translations are managed manually (AI-assisted) for all six languages in the same PR; no Crowdin involvement (per `src/crd/CLAUDE.md`).
- The Message button on the public-profile hero invokes the existing `useSendMessageToUsersMutation` via a callback prop on the CRD hero component (parity with current MUI `UserPageBanner.handleSendMessage`). It does **not** route through the global Messages dialog — it is a one-shot send-message-to-this-user surface.

## Out of Scope

- **The seven User Settings tabs** (`/user/:userSlug/settings/{profile,account,membership,organizations,notifications,settings,security}`) are owned by sibling spec `097-crd-user-settings`, not this spec. This spec only covers the public profile view at `/user/:userSlug`.
- **No new backend capabilities.** This migration is a presentation-layer port. No new GraphQL types, no new mutations, no new role gating, no new permission semantics.
- **No "follow" / "connect" social affordances** on the public profile page. The prototype hints at social-network features (online dot) that do not exist; no friend / connection system is introduced.
- **No deletion of MUI files.** The current MUI page (`src/domain/community/user/userProfilePage/*`, the entry wiring in `UserRoute.tsx`) stays in place until the CRD toggle is removed globally — parity with the rule established in `docs/crd/migration-guide.md`.
- **No public profile editing.** All edits happen exclusively in the settings tabs (sibling spec).
- **No mobile-app-specific layouts.** The page is responsive (single-column on `< lg`) but no native-app shell is targeted.
- **Organization and Virtual Contributor public profile pages** — although the user described the broader "profile view pages" category as encompassing users, organizations, and VCs, this spec covers only the User profile view. Organization and VC profile-view migrations remain future specs and reuse this spec's architectural pattern (CRD shell + integration layer + presentational components).
