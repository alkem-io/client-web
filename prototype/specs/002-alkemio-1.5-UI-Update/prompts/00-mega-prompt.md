# Alkemio 1.5 UI Update — Complete Figma Make Prompt

> **Purpose**: Update the existing React + shadcn/ui prototype to match the current Alkemio platform 1:1.
> **Prototype stack**: Vite 6 + React 18 + shadcn/ui + Tailwind CSS v4 + Lucide React icons
> **Scope**: 30 pages (Page 26 skipped — not needed)
> **Verified**: June 2025 — All 7 delta-fix prompts verified against actual prototype rendered state via code trace. Phantom instructions removed. Full 31-page audit performed comparing ALL page briefs against prototype source code — 21 additional gaps found and incorporated (4 critical, 6 high, 6 medium, 5 low). See GAP-AUDIT-REPORT.md for details.

## Global Design Tokens (already correct — do NOT change)

- **Font**: Inter (all text)
- **Primary color**: #1D384A
- **Border radius**: 6px (--radius)
- **Page background**: white
- **Card background**: white

These tokens are already applied in `src/styles/theme.css`. Do not modify them.

---

## ⚠️ Global Layout Architecture Change — CRITICAL

> **Target files**: `src/app/App.tsx`, `src/app/layouts/MainLayout.tsx`, NEW `src/app/layouts/SpaceLayout.tsx`
>
> **This is the highest-priority change. Apply this BEFORE any per-page fixes.**

The prototype currently uses ONE layout (`MainLayout`) for ALL routes. `MainLayout` renders: **App Sidebar (left, 256px)** + **Header + Page Content + Footer (right)**. This means every page — including Space pages — is squeezed next to the app sidebar.

**On the actual platform, Space pages do NOT show the app-level sidebar.** When a user navigates into a space (`/space/*`), the space banner, tab bar, and content span the **full viewport width** below the header. Only the dashboard and other top-level pages show the app sidebar.

### What to do:

1. **Create a new `SpaceLayout.tsx`** (or modify `MainLayout` to be route-aware). The space layout should render:
   ```
   ┌──────────────────────────────────────────────────────────┐
   │  Header (full-width, sticky)                             │
   ├──────────────────────────────────────────────────────────┤
   │  Breadcrumb bar (full-width, light bg)                   │
   ├──────────────────────────────────────────────────────────┤
   │  Page Content (Outlet) — full viewport width             │
   ├──────────────────────────────────────────────────────────┤
   │  Footer                                                  │
   └──────────────────────────────────────────────────────────┘
   ```
   **NO app-level `<Sidebar>`** in this layout. The Header and Footer are the same as MainLayout.

2. **Add a Breadcrumb bar** between the Header and the page content in `SpaceLayout`. This is a thin horizontal strip (`h-10`, `bg-muted/30` or `bg-gray-50`, `border-b`) spanning full width with:
   - Padding to match content area (`px-6 md:px-8`)
   - Breadcrumb trail using Lucide `ChevronRight` separators: **Home** (link to `/`) → **Space Name** (current, not linked)
   - On subspace pages: **Home** → **Space Name** (link) → **Subspace Name** (current)
   - Use shadcn `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbSeparator` components
   - Text size: `text-sm`, muted color for separators

3. **Update `App.tsx` routing** to use the new layout for space routes:
   ```tsx
   {/* Pages WITH app sidebar */}
   <Route element={<MainLayout />}>
     <Route path="/" element={<Dashboard />} />
     <Route path="/spaces" element={<BrowseSpacesPage />} />
     <Route path="/templates" element={<TemplateLibraryPage />} />
     {/* ... user pages, template pages, etc. */}
   </Route>
   
   {/* Space pages WITHOUT app sidebar — full-width */}
   <Route element={<SpaceLayout />}>
     <Route path="/space/:spaceSlug" element={<SpaceHome />} />
     <Route path="/space/:spaceSlug/community" element={<SpaceCommunity />} />
     <Route path="/space/:spaceSlug/subspaces" element={<SpaceSubspaces />} />
     <Route path="/space/:spaceSlug/knowledge-base" element={<SpaceKnowledgeBase />} />
     <Route path="/space/:spaceSlug/settings" element={<SpaceSettingsPage />} />
     <Route path="/space/:spaceSlug/settings/:tab" element={<SpaceSettingsPage />} />
     <Route path="/:spaceSlug/challenges/:subspaceSlug" element={<SubspacePage />} />
   </Route>
   ```

4. **Remove the `ChatRail`** from both layouts (already covered by per-page chat removal instructions).

**Result**: The dashboard/browse/template/user pages keep the app sidebar. Space pages get the full viewport width for their banner, tabs, and content — matching the real platform.

---

## ⚠️ Global Header Cleanup — CRITICAL

> **Target file**: `src/app/components/layout/Header.tsx`
>
> **Apply these changes to the shared Header component. They affect EVERY page.**

The prototype Header has several elements that don't exist on the real platform, and is missing elements that do exist. Fix all of the following:

### Remove from Header:

1. **Language Globe switcher** — The language selector belongs in the Footer only (see Global Footer Cleanup below). Remove the Globe icon and the language dropdown from the header icon row.

2. **User name + role text** next to the profile avatar — The real platform header shows only an avatar icon, no text. Remove the displayed name and role next to the avatar.

3. **"Switch App" section** in the profile dropdown — Remove the "Alkemio / Ecosystem Analytics" switcher and all related code. This is a dev/prototype feature.

4. **"Messaging Variant" section** in the profile dropdown — Remove the A/B/C/D/E variant switcher. This is debug UI.

5. **"Design System" link** in the profile dropdown — Remove. Dev/prototype only.

6. **All variant-conditional messaging code** — Remove `useDesignVariant` checks, `MessagingHub` conditional rendering, floating chat bubble (variant D with motion animation), and any variant-aware messaging toggle logic. The messaging icon must be ALWAYS visible (see "Add" below).

### Add to Header:

7. **Alkemio logo** on the left side (before any other element). On the real platform the logo is always visible in the header bar. Currently the logo only lives in the Sidebar — when SpaceLayout removes the sidebar, the logo disappears entirely. Add the logo as the first element in the header (left-aligned), linking to `/`.

8. **Spaces Grid icon** (`LayoutGrid`) — Add in the header icon row, between Notifications and the Profile avatar. `Button variant="ghost" size="icon"`.

9. **"Beta" text badge** on the profile avatar — Small text badge or overlay reading "Beta" (e.g., `Badge variant="secondary"` sized to ~16px font) positioned at the bottom-right of the avatar.

### Change:

10. **Search input → Search icon button** — Replace the full-width text input (`input type="text" placeholder="Search spaces..."`) with a simple Search icon button (`Button variant="ghost" size="icon"` + `Search` icon). Clicking it opens the Platform Search overlay (Page 32). The actual search input lives INSIDE the overlay, not in the header bar.

11. **Profile dropdown menu items** — Replace current contents with:
    - **MY DASHBOARD** (link to `/`)
    - **MY PROFILE** (link to user profile page)
    - **MY ACCOUNT** (link to account settings)
    - **SETTINGS** (link to settings)
    - Separator
    - **LOG OUT**
    Remove: Switch App, Messaging Variant, Design System.

### Final icon order (left → right):

```
[Alkemio Logo] ——— [Search icon] [Messaging icon] [Notifications bell] [Spaces Grid] [Profile Avatar + Beta badge]
```

All icon buttons: `Button variant="ghost" size="icon"`.

---

## ⚠️ Global Footer Cleanup

> **Target file**: `src/app/components/layout/Footer.tsx`
>
> **Apply these changes to the shared Footer component. They affect EVERY page.**

The prototype footer content doesn't match the real platform.

**Current prototype**: `Alkemio © 2026 | Terms | Privacy | Docs | Support | [Language]`

**Real platform**: `© 2026 Alkemio B.V. | Terms | Privacy | Security | [Alkemio logo] | Support | About | Language`

### Changes:

1. **Copyright text**: Change `Alkemio © 2026` → `© 2026 Alkemio B.V.` (add "B.V.")
2. **Remove**: "Docs" link (not present on real platform)
3. **Add**: "Security" link (after Privacy)
4. **Add**: Small centered Alkemio logo image (between Security and Support)
5. **Add**: "About" link (after Support)
6. **Keep**: Language selector (this is the correct location for it, NOT in the header)

---

## ⚠️ Global Space Page Shell — CRITICAL

> **Target files**: `src/app/pages/SpaceHome.tsx`, `src/app/pages/SpaceCommunity.tsx`, `src/app/pages/SpaceSubspaces.tsx`, `src/app/pages/SpaceKnowledgeBase.tsx`, `src/app/components/space/SpaceHeader.tsx`, `src/app/components/space/SpaceNavigationTabs.tsx`
>
> **This change goes hand-in-hand with the Global Layout Architecture Change. Apply together.**

### Problem

Currently, each space tab page (`SpaceHome`, `SpaceCommunity`, `SpaceSubspaces`, `SpaceKnowledgeBase`) independently renders `<SpaceHeader>` + `<SpaceNavigationTabs>` + `<SpaceSidebar>` inside its own component. This causes:

- **SpaceSidebar appears on ALL tabs** — but on the real platform, the space sidebar (description, subspaces, events) only appears on the **Home tab**. Community, Subspaces, and Knowledge Base tabs show **full-width content with no sidebar**.
- **SpaceNavigationTabs are rendered inside a flex column next to SpaceSidebar** — making them constrained to the right column instead of spanning full page width.
- **SpaceHeader + tabs are duplicated** in every page file instead of being shared.

### Solution — Create a Space Shell

Either create a `SpaceShell` wrapper component or use nested routing so that `SpaceLayout` renders:

```
Header (full-width)
Breadcrumb (full-width)
SpaceHeader banner (full-width — edge to edge)
SpaceNavigationTabs (full-width — edge to edge)
[Tab Content — Outlet] ← only this part changes per tab
Footer
```

Each tab page file (`SpaceHome.tsx`, `SpaceCommunity.tsx`, etc.) then renders ONLY its specific content — not the shared banner and tabs.

### SpaceHeader banner fixes (all space pages)

The `SpaceHeader.tsx` banner is missing Alkemio-branded elements present on the real platform:

1. **Add Alkemio logo badge cluster** (top-left corner of the banner) — small Alkemio logos/icons overlaid on the banner image.
2. **Add "POWERED BY ALKEMIO" text badge** (top-right corner, above action buttons) — small pill/badge overlay.
3. **Add green verification/icon badge** (left side below top) — a small green circle icon.
4. **Remove `MessageCircle` button** from the action button row (already covered in Page 2 #8 for chat removal). Keep: `FileText`, `Video`, `Share2`, `Settings`.

### SpaceNavigationTabs fixes (all space pages)

1. **Fix tab labels**: `"Home"` → `"HOME"`, `"Community"` → `"COMMUNITY"`, `"Subspaces"` → `"WORKSPACES"`, `"Knowledge Base"` → `"KNOWLEDGE"`. All uppercase.
2. **Add right-side utility icons** to the tab bar: `Clock` (activity), `Video`, `Bell`, `Share2`, `Settings` — all as `Button variant="ghost" size="icon"`, right-aligned on the same row as the tabs.
3. **Remove Chat tab** (conditional on variants C/E). Delete all variant-conditional tab rendering code.

### SpaceSidebar placement rule

- **Home tab**: SpaceSidebar appears in a `flex` row alongside the activity feed/posts. Width ~280px.
- **Community tab**: NO SpaceSidebar. Member grid fills full width below tabs.
- **Subspaces tab**: NO SpaceSidebar. Subspace card grid fills full width below tabs.
- **Knowledge Base tab**: NO SpaceSidebar. Resource card grid fills full width below tabs.

---
---

# Page 1: Dashboard — Delta Fix (Verified against prototype code trace)

> **Target files**: `src/app/components/dashboard/RecentSpaces.tsx`, `src/app/components/layout/Sidebar.tsx`, `src/app/components/layout/Header.tsx`, `src/app/components/dashboard/ActivityFeed.tsx`
> **Prototype state**: DashboardHero.tsx exists but is NOT imported/rendered (orphan file). Dashboard renders: RecentSpaces carousel (react-slick, 4 cards) + two ActivityFeed panels. Sidebar (in MainLayout): Dashboard, Browse Spaces, Template Library, Create Space, Invitations nav items + My Spaces list + Activity View toggle.

1. **Replace the react-slick carousel in RecentSpaces with a simple flat horizontal row.** Remove all react-slick imports, `Slider` component, and slider config. Render exactly 4 space cards in a static `flex gap-4` row (no scrolling, no carousel). Keep: banner thumbnail with hover zoom, space name, Lock icon for private, "Explore all your Spaces →" link.

2. **Update left sidebar nav items** (in `Sidebar.tsx`). Currently: Dashboard (Home), Browse Spaces (FolderOpen), Template Library (Library), Create Space (Plus), Invitations (Mail). Change to:
   - **Remove**: Dashboard, Browse Spaces, Template Library
   - **Keep**: Invitations (Mail, badge count)
   - **Add**: Tips & Tricks (`Lightbulb`), My Account (`Tag`)
   - **Rename + re-icon**: "Create Space" → "Create my own Space" (`Rocket` icon)
   - Keep "MY SPACES" section with space avatars
   - **Add "VIRTUAL CONTRIBUTORS" section** below Spaces: heading + 2-3 items (`Avatar` + VC name: "Softmann", "The Collaboration Methodologist")
   - Keep Activity View toggle at bottom

3. **Header icon changes — see Global Header Cleanup section above.** That section covers ALL header fixes (logo, search icon, messaging always-visible, Spaces Grid, Beta badge, profile dropdown, language switcher removal). Verify those changes are applied as Header.tsx is referenced in this page's target files.

4. **Add filter dropdowns to activity feeds.** Currently only title + items + "Show more". Add above each feed:
   - Left: two `Select`s — "Space: All Spaces" + "My role: All roles"
   - Right: one `Select` — "Space: All Spaces"

5. **Delete orphan file** `DashboardHero.tsx` (never imported, never rendered — just cleanup).

---

# Page 2: Space Home — Delta Fix (Verified against prototype code trace)

> **Target files**: `src/app/pages/SpaceHome.tsx`, `src/app/components/space/SpaceSidebar.tsx`, `src/app/components/space/SpaceFeed.tsx`
> **Prototype state**: SpaceHeader (Unsplash bg 320px, dark overlay, "Innovation Hub", 5 member avatars, 5 action buttons incl. MessageCircle for chat). SpaceSidebar: "Welcome!" callout card (bg-primary/5, generic text, "View Guidelines" button) + Subspaces (Folder icon + member count). Tabs: Home | Community | Subspaces | Knowledge Base (+ Chat tab for variants C/E). Chat variants A-E conditional rendering. **App-level Sidebar is visible** (from MainLayout) — this is wrong.
> **Depends on**: Global Layout Architecture Change (no app sidebar) + Global Space Page Shell (shared banner + tabs). This page renders ONLY the Home tab content: SpaceSidebar (left) + Activity Feed (right).

**Correct full-width layout for this page (top → bottom):**
```
Header (full-width)
Breadcrumb: Home > Innovation Hub (full-width)
Space Banner (full-width image, 320px)
Tab Bar: HOME | COMMUNITY | WORKSPACES | KNOWLEDGE [icons] (full-width)
┌─────────────┬──────────────────────────────────────────┐
│ SpaceSidebar │  Activity Feed / Posts (main content)    │
│ (280px)      │                                          │
└─────────────┴──────────────────────────────────────────┘
Footer
```
The SpaceSidebar is the *space's own* sidebar (description card, subspaces, events) — NOT the app-level navigation sidebar.

1. **Ensure the app-level Sidebar is NOT rendered.** This page must use `SpaceLayout` (see Global Layout Architecture Change). The space banner, tab bar, and content must span the full viewport width below the header. If the MainLayout `<Sidebar>` is still visible on the left, the layout change was not applied.

2. **Ensure the breadcrumb bar is visible** between the Header and the Space Banner. It should show: **Home** (link to `/`) `>` **Innovation Hub** (current page, not linked). See Global Layout Architecture Change for breadcrumb component details.

3. **SpaceHeader banner + SpaceNavigationTabs are now in the shared Space Shell** (see Global Space Page Shell). Remove `<SpaceHeader>` and `<SpaceNavigationTabs>` imports/renders from this file — they are provided by the shell. This page should only render the sidebar+feed content below the tabs. Tab label fixes and banner badge additions are handled by the Global Space Page Shell section.

4. **Replace SpaceSidebar "Welcome!" callout with space description card.** Remove bg-primary/5 card with "Welcome!" title and "View Guidelines" button. Replace with: dark teal card (`bg-teal-800 text-white`), space description text, "Read more" link, lead's `Avatar` + name + location.

5. **Add "ABOUT THIS SPACE" button** below description card. Full-width, `Button variant="outline"` + Lucide `Info`. Uppercase text.

6. **Replace Folder icons with colored circular avatars** in subspaces list. Remove member count numbers. Add settings `Settings` ghost icon next to "SUBSPACES" header.

7. **Add Events section** at sidebar bottom: "EVENTS" header + `ChevronDown`, empty state muted text, "Show calendar" link + green `Plus` circle button.

8. **Remove all chat variant code.** Delete: ChatDrawer/ChatPanel from SpaceHome.tsx, useDesignVariant chat checks, Chat tab from SpaceNavigationTabs (handled by Global Space Page Shell #3), MessageCircle button from SpaceHeader (handled by Global Space Page Shell banner fixes #4). In this file specifically, remove chat panel/drawer imports and conditional rendering.

9. **Add "+ POST" button** at top of the feed area. Full-width or prominent placement above the activity feed, allowing users to create a new post. `Button variant="default"` + `Plus` icon + "POST" text.

10. **Verify inline comment input** on post cards: avatar + emoji (`Smile`) + mention (`AtSign`) + text input + send (`Send`).

---

# Page 3: Community Tab — Delta Fix

> **Target files**: `src/app/pages/SpaceCommunity.tsx`, `src/app/components/space/SpaceMembers.tsx`
> **Depends on**: Global Layout Architecture Change + Global Space Page Shell — must use `SpaceLayout` (no app sidebar, full-width, breadcrumb visible). SpaceHeader + SpaceNavigationTabs rendered by the shared space shell, NOT by this page.
> **Prototype state**: Renders `SpaceHeader` + `SpaceSidebar` + `SpaceNavigationTabs` + `SpaceMembers` in a flex row layout. Chat variant code (SpaceChatPanel, SpaceChatDrawer, useDesignVariant, useSpaceChatDrawer) imported and conditionally rendered. SpaceSidebar should NOT be on this page.

1. **Remove SpaceSidebar.** Delete the `<SpaceSidebar>` component and its import from this page. On the real platform, the space sidebar only appears on the Home tab. The Community tab shows a full-width member grid with NO sidebar.

2. **Remove SpaceHeader and SpaceNavigationTabs.** These are now rendered by the shared Space Shell (see Global Space Page Shell). This page should only render its own content (the member grid).

3. **Remove all chat variant code.** Delete: `SpaceChatPanel`, `SpaceChatDrawer`, `useDesignVariant`, `useSpaceChatDrawer` imports and all conditional chat rendering. Same cleanup as Page 2 #8.

4. **Full-width member grid.** With the sidebar removed, the member card grid should span the full content width. Verify:
   - 3-column responsive grid with `Avatar` + name + role `Badge`
   - Role filter pill labels match Alkemio roles (Facilitator, Contributor, etc.)
   - DropdownMenu on member cards isn't over-engineered

5. **Breadcrumb**: Home > Space Name > Community (handled by SpaceLayout).

---

# Page 4: Subspaces Tab — Delta Fix

> **Target files**: `src/app/pages/SpaceSubspaces.tsx`, `src/app/components/space/SpaceSubspacesList.tsx`
> **Depends on**: Global Layout Architecture Change + Global Space Page Shell — must use `SpaceLayout` (no app sidebar, full-width, breadcrumb visible). SpaceHeader + SpaceNavigationTabs rendered by the shared space shell, NOT by this page.
> **Prototype state**: Renders `SpaceHeader` + `SpaceSidebar` + `SpaceNavigationTabs` + `SpaceSubspacesList` in a flex row layout. Chat variant code imported and conditionally rendered. SpaceSidebar should NOT be on this page. Tab label says "Subspaces" — should be "WORKSPACES".

1. **Remove SpaceSidebar.** Delete the `<SpaceSidebar>` component and its import from this page. On the real platform, the space sidebar only appears on the Home tab. The Subspaces/Workspaces tab shows a full-width card grid with NO sidebar.

2. **Remove SpaceHeader and SpaceNavigationTabs.** These are now rendered by the shared Space Shell (see Global Space Page Shell). This page should only render its own content (the subspace card grid).

3. **Remove all chat variant code.** Delete: `SpaceChatPanel`, `SpaceChatDrawer`, `useDesignVariant`, `useSpaceChatDrawer` imports and all conditional chat rendering. Same cleanup as Page 2 #8.

4. **Full-width subspace card grid.** With the sidebar removed, the card grid should span the full content width. Verify:
   - 3-column card grid: banner image, name, description, member count, lead avatar row
   - Lead avatars positioned correctly on card
   - Tab label reads "WORKSPACES" (not "SUBSPACES") — this is handled by Global Space Page Shell tab label fixes

5. **Breadcrumb**: Home > Space Name > Workspaces (handled by SpaceLayout).

---

# Page 5: Knowledge Base Tab — Delta Fix (Verified against prototype code trace)

> **Target files**: `src/app/pages/SpaceKnowledgeBase.tsx`, `src/app/components/space/SpaceResourcesList.tsx`
> **Depends on**: Global Layout Architecture Change + Global Space Page Shell — must use `SpaceLayout` (no app sidebar, full-width, breadcrumb: Home > Space Name > Knowledge). SpaceHeader + SpaceNavigationTabs rendered by the shared space shell, NOT by this page.
> **Prototype state**: Full data TABLE with 6 columns (Name 40%, Category Badge, Uploaded By Avatar+name, Date, Size monospace, Actions 3-dot menu). Header: "Knowledge Base" + "New Folder" + "Upload File" buttons. Toolbar: search input + category filter badges (All, Reports, Planning, Guidelines + More dropdown). 6 mock rows. ALSO renders `SpaceHeader` + `SpaceSidebar` + chat variant code — all need removal.

0. **Remove SpaceSidebar, SpaceHeader, SpaceNavigationTabs, and all chat variant code.** Same as Pages 3 and 4: delete `<SpaceSidebar>`, `<SpaceHeader>`, `<SpaceNavigationTabs>` and their imports (now in shared Space Shell). Delete chat imports (`SpaceChatPanel`, `SpaceChatDrawer`, `useDesignVariant`, `useSpaceChatDrawer`) and all conditional chat rendering.

1. **Replace entire data table with responsive card grid.** Remove all Table/TableHeader/TableBody/TableRow/TableCell, sorting, DropdownMenu row actions. Use `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`.

2. **Each resource card**: large file-type icon (color-coded: red PDF, green spreadsheet, blue doc, purple link, orange image), resource name (`CardTitle`, clickable), description (1-2 lines, `line-clamp-2`), author row (`Avatar` + "Uploaded by [Name]" + relative date).

3. **Simplify action buttons.** Replace "New Folder" + "Upload File" with single "+ Add Resource" button (`Button variant="default"` + `Plus` icon).

4. **Simplify category filter.** Replace inline badges + "More" dropdown with `Select` or `ToggleGroup`: All | Documents | Links | Whiteboards.

5. **Keep search input** (`Input` + `Search` icon). Add "Show more" `Button variant="outline"` for pagination.

---

# Page 6: Add Post Dialog — Verify & Keep

> **Target files**: `src/app/components/space/AddPostModal.tsx`

No structural changes. Verify:
1. Dialog is large (~max-w-3xl, 90vh) with title input + rich text body.
2. Attachment toggles match platform content types (remove fabricated ones).
3. Remove "Save Draft" button if it doesn't exist in current platform.
4. **Template selector**: Verify presence of template pill-style selector (Brainstorm, Decision, Announcement, Feedback/Survey). If missing, add it above the title input.
5. **References section**: Verify presence of References input area (Title + URL fields + "Add Reference" button). If missing, add it below the main form.

---

# Page 7: Subspace Page — Verify & Keep

> **Target files**: `src/app/pages/SubspacePage.tsx`, `src/app/components/space/SubspaceHeader.tsx`, `src/app/components/space/SubspaceSidebar.tsx`
> **Depends on**: Global Layout Architecture Change — must use `SpaceLayout` (no app sidebar, full-width).

No structural changes beyond the global fixes. Verify:
1. **No app-level sidebar visible.** Breadcrumb bar shows: Home > Space Name > Subspace Name. Header banner + member avatars + utility icons.
2. Remove fabricated sidebar quick-action buttons ("Project Docs", "Team Roster", "Schedule"). Keep only description card + "About this Subspace" button.
3. ChannelTabs pill labels are appropriate.
4. **SubspaceSidebar collapsible behavior** (80→12px collapse) — verify this matches the current platform. If the current platform doesn't have a collapsible sidebar on subspace pages, simplify to a static-width sidebar or remove it.

---

# Page 8: User Profile — Delta Fix

> **Target files**: `src/app/pages/UserProfilePage.tsx`, `src/app/components/user/UserProfileHeader.tsx`
> **Prototype state**: Banner + Avatar + tabs (All Resources / Hosted Spaces / Virtual Contributors / Leading / Member Of) — 5 tabs with tab content below. The real platform uses stacked sections, NOT tabs.

1. **Replace tab bar with stacked sections.** Remove the `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` structure. Instead, render sections vertically:
   - **Left column** (~4 cols): Bio/About text + Organizations list
   - **Right column** (~8 cols): "Resources User Hosts" section → "Spaces User Leads" section → "Spaces User Is In" section, each with a section heading and card grid
   Keep 12-column grid layout (`grid grid-cols-12`), show both columns simultaneously instead of tab-switching.

2. **Remove online indicator dot** on the avatar if present (green dot). Not in current platform.
3. **Verify**: Banner + large `Avatar` + name + location + action icons (Mail, Settings).

---

# Page 9: Account Page — Verify & Keep

> **Target files**: `src/app/pages/UserAccountPage.tsx`

No structural changes. Virtual Contributors + Template Packs sections are intentional — keep them. Verify:
1. 6-tab labels match current platform.
2. Capacity indicators ("0/5", "0/1") are accurate.
3. Plan badges on space cards (Premium/Plus/Basic) match current.
4. **Dashed "Create New" cards** (dashed border pattern for "Create New Space" / "Create New Contributor") — remove if not present in current platform. If current platform uses a different pattern (e.g., a button instead of a card), use that pattern instead.

---

# Page 10: My Profile Settings — Verify & Keep

> **Target files**: `src/app/pages/UserProfileSettingsPage.tsx`

No structural changes. Verify:
1. Two-column layout (avatar left, form right) matches current.
2. Identity fields (First Name, Last Name, Email, Organization) match current form.
3. Sticky save button on mobile is acceptable.

---

# Page 11: Membership Tab — Verify & Keep

> **Target files**: `src/app/pages/UserMembershipPage.tsx`

No structural changes. Verify:
1. 3-column card grid matches current membership layout.
2. Role badge names match platform roles.
3. "Load More" pagination pattern matches current.
4. **Filter bar** (All / Active / Archived tabs) — remove if not present in current platform.
5. **Status badges** (Active / Archived) on cards — remove if not present in current platform.
6. **Plan text** (Premium / Plus / Basic) on cards — remove if not present in current platform.

---

# Page 12: Organizations Tab — Verify & Keep

> **Target files**: `src/app/pages/UserOrganizationsPage.tsx`

No structural changes. Verify:
1. Org card layout — **remove cover images with gradient overlay if current platform doesn't use them**. Also remove avatar overlapping the cover image if that pattern is not in current.
2. "Create Organization" dialog fields match current.
3. DropdownMenu actions (View Profile, Manage Settings, Disassociate) match current.

---

# Page 13: Notifications Tab — Verify & Keep

> **Target files**: `src/app/pages/UserNotificationsPage.tsx`

No structural changes. Verify:
1. 5 notification sections match current grouping.
2. Dual-channel toggles (In-App + Email switches) match current.
3. Column headers ("Activity", "In-App", "Email") aligned correctly.

---

# Page 14: Create Space — Delta Fix (Verified against prototype code trace)

> **Target files**: `src/app/pages/CreateSpaceSelectionPage.tsx`, `src/app/pages/CreateSpaceChatPage.tsx`, `src/app/components/dialogs/CreateSpaceDialog.tsx`, `src/app/App.tsx`, `src/app/components/layout/Sidebar.tsx`
> **Prototype state**: Route `/create-space` → SelectionPage (2 cards: "Use Form" / "Guided Creation" with AI sparkle). Route `/create-space/chat` → ChatPage (831-line AI wizard). Dialog has 3 views: selection, form, chat (expands to 95vw×90vh for chat view).

1. **Delete `CreateSpaceChatPage.tsx`** (831 lines). Remove route + imports from App.tsx.
2. **Delete `CreateSpaceSelectionPage.tsx`** (74 lines). Remove route + imports from App.tsx.
3. **Simplify `CreateSpaceDialog.tsx`**: Remove 3-view state management. Open directly to form view. Remove AI card, chat view, dialog expansion logic.
4. **Update Sidebar routing**: Change Create Space `<Link to="/create-space">` to `<button onClick>` that opens the dialog modal directly.
5. **Verify dialog form fields**: Title, URL slug (auto-generated), Tagline, Tags, Page Banner + Card Banner uploads, checkboxes (tutorials + terms), Cancel + Create buttons, optional "CHANGE TEMPLATE" ghost button.
6. **Clean up dead references** to `CreateSpaceChatPage`, `CreateSpaceSelectionPage`, `SpaceCreatorChat`, `/create-space/chat` route.

---

# Page 15: Space Settings Master Layout — Delta Fix

> **Target files**: `src/app/pages/SpaceSettingsPage.tsx`
> **Depends on**: Global Layout Architecture Change — must use `SpaceLayout` (no app sidebar). Breadcrumb: Home > Space Name > Settings.

1. **No app-level sidebar visible** — page uses SpaceLayout. The Space Settings page has its OWN settings sidebar (SPACE IDENTITY, MEMBER MANAGEMENT, etc.) — that's correct and should stay.

2. **Add top header bar** above the sidebar+content split. This bar is missing from the prototype. It should contain:
   - **Left**: Space avatar (small, circular) + Space name (bold text)
   - **Right**: "← Back to Space" link (text link, navigates back to the space home) + "Quit Settings" button
   - Full-width, thin bar (`h-12`, `border-b`, `px-6`), placed BELOW the breadcrumb but ABOVE the settings sidebar + content area.

3. **Verify**: Settings sidebar groups (SPACE IDENTITY, MEMBER MANAGEMENT, CONTENT & RESOURCES, ADVANCED) match current.
4. **Verify**: Content area wrapper styling correct.

---

# Page 16: Settings — Layout Tab — Verify & Keep (New Feature)

> **Target files**: `src/app/components/space/SpaceSettingsLayout.tsx`

New feature — keep as-is. Verify:
1. Renders within Space Settings master layout.
2. 4 draggable tab cards with grip handles, icons, names, edit buttons.
3. Footer: "Reset to Default" + "Save Changes" buttons.

---

# Page 17: Settings — About Tab — Verify & Keep

> **Target files**: `src/app/components/space/SpaceSettingsAbout.tsx`

No structural changes. Verify:
1. Form: Page Banner + Card Banner uploads, rich text editors (What/Why/Who), tag chips, references list, live preview card.
2. Image upload zones have clear affordance (dashed border, dimensions, hover state).

---

# Page 18: Settings — Community Tab — Verify & Keep

> **Target files**: `src/app/components/space/SpaceSettingsCommunity.tsx`

No structural changes (797 lines — check for over-engineering). Verify:
1. Member table: Name, Email, Date, Status, Actions columns.
2. 5 collapsible sections below table (Application Form, Guidelines, Orgs, VCs, Roles).
3. Search/filter not over-engineered beyond current.

---

# Page 19: Settings — Subspaces Tab — Verify & Keep

> **Target files**: `src/app/components/space/SpaceSettingsSubspaces.tsx`

No structural changes. Verify:
1. Default template section with template card + "Change Default Template" button.
2. Subspace card grid with search, status badges, Edit/Archive/Delete actions.
3. Remove grid/list toggle if not in current platform.

---

# Page 20: Settings — Templates Tab — Verify & Keep

> **Target files**: `src/app/components/space/SpaceSettingsTemplates.tsx`

No structural changes. Verify:
1. 5 collapsible Accordion sections by category with count badges + "+ CREATE NEW" buttons.
2. Template cards: thumbnail, name, description, category badge, enable/disable Switch, action menu.
3. Accordion behavior (single vs multiple sections open).

---

# Page 21: Settings — Storage Tab — Verify & Keep

> **Target files**: `src/app/components/space/SpaceSettingsStorage.tsx`

No structural changes. Verify:
1. Storage usage meter: Progress bar (color-coded) + "X GB / Y GB used".
2. Documents table: Name, Type, Size, Uploaded By, Date, Actions.
3. Remove bulk selection checkboxes if not in current platform.

---

# Page 22: Settings — Settings Tab — Verify & Keep

> **Target files**: `src/app/components/space/SpaceSettingsSettings.tsx`

No structural changes. Verify:
1. Visibility RadioGroup (Public/Private) + Membership RadioGroup (No Application/Application/Invitation Only).
2. 7 Allowed Actions switches match current platform permissions.
3. Danger Zone with "DELETE THIS SPACE" destructive button + AlertDialog confirmation.

---

# Page 23: Settings — Account Tab — Verify & Keep

> **Target files**: `src/app/components/space/SpaceSettingsAccount.tsx`

No structural changes. Verify:
1. URL section: read-only space URL + copy button.
2. License card: plan name, features, capacity, "Change License" button.
3. Host section: Avatar + name + role + "Change Host" button.

---

# Page 25: Post Detail Dialog (Level 2) — Verify & Keep

> **Target files**: `src/app/components/dialogs/PostDetailDialog.tsx`

No structural changes. Verify:
1. Sticky header (64px): back arrow, post title, Share + More + Close icons.
2. Post content: h1 title, author row, rich text body, reactions bar.
3. Contributions section: type filter pills, horizontal card row, "See all responses" link.
4. Comments section: avatar + name + text + time, "Load more", "Reply" links.
5. Sticky comment input at bottom.
6. **Remove "Key Discussion Points" section if present** — not in current platform.

---

# Page 27: Response Modal (Level 3) — Verify & Keep

> **Target files**: `src/app/components/dialogs/ResponseDetailDialog.tsx`

No structural changes. This is the correct response view (NOT a sliding panel). Verify:
1. Modal stacking: z-[60] on top of PostDetailDialog with dimmed backdrop.
2. Header: back arrow, Share, Close.
3. Content: title, author row, rich text body, media, tags.
4. Author controls (Edit/Delete) conditional on `isAuthor`.
5. Peer responses preview strip (horizontal scrollable cards).
6. Comments section + sticky comment input.
7. Response navigation: Previous/Next buttons + "Response 3 of 8" indicator.

---

# Page 28: Template Library — Delta Fix (Verified against prototype code trace)

> **Target files**: `src/app/components/template-library/TemplateLibrary.tsx`
> **Prototype state**: Sticky search header + "Template Packs" section (3-col grid of PackCards with covers, names, authors, tags, prev/next pagination) + Separator + "Templates" section (4-col grid with custom filter buttons, type-specific previews, prev/next pagination). NOTE: No methodology content exists on this page.

1. **Replace custom filter buttons with shadcn `ToggleGroup type="single"`** for category pills (All, Subspace, Collaboration Tool, etc.).
2. **Replace prev/next arrow pagination with "Load more" buttons** (`Button variant="outline"`, centered) at bottom of each section.
3. Verify: Template Packs section (3-col grid, PackCards clickable), All Templates section (4-col grid, TemplateCards clickable), search filters both sections.

---

# Page 29: Template Pack Detail — Delta Fix (Verified against prototype code trace)

> **Target files**: `src/app/components/template-library/TemplatePackDetail.tsx`
> **Prototype state**: Breadcrumb + pack info (64×64 thumb, title, description, metadata, tags) + Accordion sections by type + "You might also like" 3 gray placeholder boxes + Apply dialog. NOTE: No methodology content exists on this page.

1. **Replace "You might also like" placeholders with real related pack cards.** Currently 3 gray boxes. Replace with actual PackCard components from mock data (cover, name, count, clickable).
2. Verify: breadcrumb (← Template Library > Pack Name), pack header, Accordion sections by type with template grids, "Apply Entire Pack" button + space selector dialog, "Quick Apply" per-card buttons.

---

# Page 30: Template Detail — Delta Fix (Verified against prototype code trace)

> **Target files**: `src/app/components/template-library/TemplateDetail.tsx`
> **Prototype state**: 907-line page. Header (breadcrumb, type badge, title, description, author, tags, Apply/Fav/Share). Two-column 8:4 grid: Left = type-switched preview (7+ renderers: Space with tabs, Subspace with numbered stages 1→2→3→4, Post, CollabTool, Whiteboard canvas, Guidelines cards, Brief). Right = sticky MetadataPanel ("How to Use" boilerplate: always same Setup→Brainstorming→Synthesis→Action Items; About card; What's Included; Related Templates). Apply dialog.

1. **Clean SubspaceTemplatePreview stage labels.** Numbered stages (1→2→3→4) may have methodology names ("Day 1: Map", etc.). Ensure labels are generic ("Stage 1", "Phase A") not methodology-specific. Keep the pipeline/numbered visual layout.
2. **Simplify sidebar "How to Use" instructions.** Current boilerplate (Setup→Brainstorming→Synthesis→Action Items) is always identical regardless of template type. Replace with shorter type-specific descriptions (2-3 sentences) or remove entirely when no unique instructions exist.
3. Verify: 8:4 two-column grid with sticky sidebar, breadcrumb chain, header elements, all 7 preview types render correctly, "Apply to Space" dialog, Related Templates cards.

---

# Page 31: Browse All Spaces — Verify & Keep

> **Target files**: `src/app/pages/BrowseSpacesPage.tsx`

No structural changes. Verify:
1. Page header: "Explore Spaces" + subtitle.
2. Search + filter bar: Input, Sort Select, Filter DropdownMenu with checkboxes.
3. Active filter chips (removable Badges).
4. Results count: "Showing X of Y spaces".
5. SpaceCard: banner, privacy badge, avatar, name, description, leads, tags, members.
6. Responsive grid (auto-fill 280px).
7. "Load more" button.
8. Empty state: dashed card + FolderOpen icon + "Clear filters".
9. SpaceCardSkeleton loading state.

---

# Page 32: Platform Search Overlay — Full Build

> **Target files**: `src/app/components/search/PlatformSearch.tsx` (NEW), `src/app/components/layout/Header.tsx` (wire trigger)

This does NOT exist yet. Build from scratch.

### Trigger
The Header search INPUT has been replaced with a Search icon button (see Global Header Cleanup #10). Wire that icon button to open this overlay on click. Also add `Cmd+K` / `Ctrl+K` keyboard shortcut to open.

### Overlay
Near-fullscreen `Dialog` (max-w-5xl, max-h-[85vh], z-[50], dimmed backdrop). Closable via X or Escape.

### Search Header
`Search` icon + auto-focused `Input` ("Search Alkemio...") + Close button. Enter converts query to tag.

### Search Tags Row
Horizontal wrapping `Badge` pills with X to remove. Tags drive search results.

### Two-Column Body

**Category Sidebar** (~200px, left):
- All / Spaces / Posts / Responses / Users / Organizations
- Each with result count Badge
- Selected = highlighted bg
- Conditional scope dropdown when inside a Space: "Search in: All / This Space"

**Results Pane** (right, scrollable):
- "All" shows grouped sections; specific category shows expanded results
- Per-section: header + count, 3-col card grid, "See all →" link, sort Select

### Card Types
- **Space Card**: banner, avatar, name, tagline, member count
- **Post Card**: title, excerpt (2-line clamp), author row, parent space
- **Response Card**: title, excerpt, author row, parent post link
- **User Card**: avatar, name, role/bio, location
- **Organization Card**: avatar/logo, name, description, member count

### Load More
Per-section "Load more" button when category selected.

### States
- **Initial**: Search icon + "Search across all of Alkemio" + "Type a query and press Enter"
- **No results**: SearchX icon + "No results found" + "Clear all tags" button
- **Loading**: Loader2 spinner or skeleton cards
- **Single-category empty**: "No [category] found" text

### Mock Data
8-12 spaces, 6-10 posts, 4-8 responses, 6-10 users, 3-5 orgs. Client-side substring matching on tags.

### Keyboard
`Cmd+K`/`Ctrl+K` opens, `Escape` closes, `Enter` adds tag, `Tab`/arrows navigate.
