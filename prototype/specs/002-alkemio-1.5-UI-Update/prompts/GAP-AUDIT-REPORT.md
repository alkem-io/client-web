# Gap Audit Report — Prototype vs. Platform

> **Date**: 2026-02-19  
> **Method**: Systematic comparison of ALL 31 page briefs (describing the real platform) against the prototype source code AND the mega-prompt instructions.  
> **Finding**: 16 gaps that were NOT captured in any prompt — ranging from critical architecture issues to missing content details.

---

## 🔴 CRITICAL — Architecture/Layout Gaps

### C1. SpaceSidebar rendered on ALL space tabs — should ONLY be on Home tab

| | Detail |
|---|---|
| **Affected** | Pages 3 (Community), 4 (Subspaces), 5 (Knowledge Base) |
| **Brief says** | Community Tab: single-column member grid. Subspaces Tab: single-column card grid. KB Tab: single-column resource grid. **NO sidebar on any of these.** |
| **Prototype does** | ALL three pages render `<SpaceSidebar spaceSlug={slug} />` in a flex row alongside main content |
| **Prompt says** | "No structural changes. Verify..." — never mentions removing sidebar |
| **Fix** | Remove `<SpaceSidebar>` from SpaceCommunity.tsx, SpaceSubspaces.tsx, SpaceKnowledgeBase.tsx. Content should fill full width below the tab bar. |

### C2. Chat variant code still in Pages 3, 4, 5

| | Detail |
|---|---|
| **Affected** | SpaceCommunity.tsx, SpaceSubspaces.tsx, SpaceKnowledgeBase.tsx |
| **Prototype does** | All three import & use: `SpaceChatPanel`, `SpaceChatDrawer`, `useDesignVariant`, `useSpaceChatDrawer`, conditional chat rendering |
| **Prompt says** | Only Page 2 (Space Home) says "Remove all chat variant code." Pages 3, 4, 5 say "Verify & Keep" with no chat removal |
| **Fix** | Add explicit chat code removal to Pages 3, 4, 5. Same pattern as Page 2 #8. |

### C3. SpaceNavigationTabs rendered inside content column, not full-width

| | Detail |
|---|---|
| **Affected** | All space tab pages (SpaceHome, SpaceCommunity, SpaceSubspaces, SpaceKnowledgeBase) |
| **Brief says** | Tab bar spans full page width directly below the banner, ABOVE the sidebar+content split |
| **Prototype does** | Each page file renders tabs INSIDE a `<div className="flex"><SpaceSidebar/><div><SpaceNavigationTabs/>...</div></div>` — tabs are constrained to the right column |
| **Prompt says** | Page 2 says "tab bar must span full page width" but doesn't address the structural issue of tabs being rendered inside individual page files alongside the sidebar |
| **Fix** | Pull SpaceHeader and SpaceNavigationTabs OUT of individual page files into a shared space shell (possibly in SpaceLayout or a new SpaceShell component that wraps the Outlet). The structure should be: SpaceHeader → SpaceNavigationTabs (full-width) → [tab content Outlet]. |

### C4. Alkemio logo missing from Header — invisible on space pages

| | Detail |
|---|---|
| **Brief says** | Header has "Alkemio logo (left)" as the first element |
| **Prototype does** | Logo is ONLY in the Sidebar component (`AlkemioLogo` import in Sidebar.tsx). The Header.tsx has NO logo — just hamburger menu + search input on the left side |
| **Impact** | When SpaceLayout removes the sidebar, the Alkemio logo disappears entirely from the page |
| **Prompt says** | Nothing about adding logo to header |
| **Fix** | Add Alkemio logo to the left side of Header.tsx (before the search input). This ensures branding is visible regardless of layout. |

---

## 🟠 HIGH — Content/Visual Mismatches

### H1. Footer content mismatch

| | Detail |
|---|---|
| **Brief says** | "© 2026 Alkemio B.V. \| Terms, Privacy, Security, Alkemio logo, Support, About, Language" |
| **Prototype does** | "Alkemio © 2026 \| Terms, Privacy, Docs, Support \| Language" |
| **Missing** | "B.V." after Alkemio, "Security" link, centered Alkemio logo image, "About" link |
| **Extra** | "Docs" link (not in the brief) |
| **Prompt says** | No mention of footer fixes anywhere |
| **Fix** | Update Footer.tsx to match: "© 2026 Alkemio B.V." · "Terms" · "Privacy" · "Security" · Alkemio logo · "Support" · "About" · Language selector |

### H2. Space banner missing Alkemio-branded badges

| | Detail |
|---|---|
| **Brief says** | "Alkemio logo badges (top-left)", "'POWERED BY ALKEMIO' badge (top-right)", "green icon badge (left below banner top)" |
| **Prototype SpaceHeader** | Only has: action buttons (top-right), title + description + member avatars (bottom). NO branded badges. |
| **Prompt says** | No mention of banner badges |
| **Fix** | Add to SpaceHeader: Alkemio logo badge cluster (top-left corner), "POWERED BY ALKEMIO" text badge (top-right, above action buttons), green verification/icon badge (left side below top). |

### H3. Header icons — multiple issues

| | Detail |
|---|---|
| **Brief says** | Icon order: Search (icon), Messaging (always visible), Notifications (bell), Spaces Grid (LayoutGrid 2×2), Profile Avatar with "Beta" badge |
| **Prototype has** | Search (INPUT field, not icon), Messaging (variant-conditional, hidden for A/D/E), Notifications (bell), Globe/Language switcher, Profile avatar WITH name+role text |
| **Issues** | (a) Messaging icon is variant-conditional — should be ALWAYS visible. (b) Globe/Language switcher should NOT be in header — it's a footer element. (c) User name + role text next to avatar — brief shows icon-only avatar. (d) "Beta" text badge missing from avatar. (e) Spaces Grid (LayoutGrid) icon missing. (f) Search should be an icon button, not a text input (the input is in Platform Search overlay). |
| **Prompt says** | Page 1 #3 says "Add Spaces Grid" and "Messaging — ensure always visible" ✅ but doesn't mention removing language switcher, removing name text, adding Beta badge, or changing search from input to icon |
| **Fix** | Comprehensive Header cleanup: remove language Globe from header, remove name/role text next to avatar, add "Beta" Badge overlay on avatar, make messaging always-visible, add LayoutGrid icon, replace search input with search icon Button (opens Platform Search overlay). |

### H4. Profile dropdown menu items — contains debug/dev UI

| | Detail |
|---|---|
| **Brief says** | Profile dropdown: "MY DASHBOARD, MY PROFILE, etc." — standard user menu |
| **Prototype has** | "Switch App" (Alkemio / Ecosystem Analytics), "Messaging Variant" (A/B/C/D/E switcher), "My Account" (Profile, Design System, Settings, Log out) |
| **Issues** | (a) "Switch App" with Ecosystem Analytics — dev/prototype feature. (b) "Messaging Variant" switcher — debug UI. (c) "Design System" page link — dev/prototype feature. (d) Missing proper menu items: MY DASHBOARD, MY PROFILE, MY ACCOUNT |
| **Prompt says** | No mention of profile dropdown cleanup |
| **Fix** | Replace dropdown contents with: MY DASHBOARD (link to /), MY PROFILE (link to user profile), MY ACCOUNT (link to account settings), SETTINGS (link to settings), separator, LOG OUT. Remove: Switch App, Messaging Variant, Design System. |

### H5. SpaceNavigationTabs — labels wrong + utility icons missing

| | Detail |
|---|---|
| **Brief says** | HOME \| COMMUNITY \| WORKSPACES \| KNOWLEDGE + right-side utility icons (clock/activity, video, bell, share, settings) |
| **Prototype has** | "Home" \| "Community" \| "Subspaces" \| "Knowledge Base" — lowercase, wrong names, NO utility icons |
| **Prompt says** | Page 2 #3 mentions fixing labels and adding icons ✅ — this IS captured but worth noting the tab component is shared, so the fix applies globally |
| **Status** | PARTIALLY ADDRESSED in Page 2 prompt. But prompt should emphasize this is a component-level fix affecting all space pages. |

### H6. User Profile — prototype uses tabs, platform uses stacked sections

| | Detail |
|---|---|
| **Brief says** | Stacked sections: "Resources User Hosts", "Spaces User Leads", "Spaces User Is In" — NO tab bar |
| **Prototype has** | Tab bar with 5 tabs: All Resources / Hosted Spaces / Virtual Contributors / Leading / Member Of |
| **Prompt says** | "Tab structure vs stacked sections — keep whichever matches current platform" — unresolved |
| **Fix** | If platform has stacked sections (no tabs): remove tab bar, show all sections stacked vertically (Bio+Orgs left column, all resource/space sections right column). Keep section headers. |

---

## 🟡 MEDIUM — Component/Detail Mismatches

### M1. Space Settings missing top header bar

| | Detail |
|---|---|
| **Brief says** | "Top Header: Space name + avatar (left), 'Back to Space' + 'Quit Settings' (right)" — a dedicated bar ABOVE the sidebar+content split |
| **Prototype does** | No top header bar. Just `<SpaceSettingsSidebar>` + content area directly. "Back to Space" might be in the sidebar but not in a top bar. |
| **Prompt says** | "Verify: 'Back to Space' link present" — doesn't specify it should be a top header bar |
| **Fix** | Add a top header bar to SpaceSettingsPage: left = space avatar + space name, right = "← Back to Space" link + "Quit Settings" button. This bar sits above the sidebar+content layout. |

### M2. Header messaging variant code needs full cleanup

| | Detail |
|---|---|
| **Header.tsx** | Contains: MessagingHub conditional rendering for variants A/B/C/D, floating chat bubble for variant D (motion-animated), variant-aware messaging toggle logic |
| **Prompt says** | Page 1 #3 says "ensure always visible" for messaging icon, but doesn't say to remove ALL variant code from Header.tsx |
| **Fix** | Strip all variant-conditional messaging code from Header: remove MessagingHub, remove floating bubble, remove variant checks. Keep a simple always-visible messaging icon Button. |

### M3. Header search — input field vs icon button

| | Detail |
|---|---|
| **Brief says** | "Search icon" that "Opens Platform Search overlay" |
| **Prototype** | Full text input field (`input type="text" placeholder="Search spaces..."` with rounded-full styling, max-w-md) — a permanent visible input, NOT an icon button |
| **Prompt Page 32** | Says "Wire the existing Header search input to open the overlay" — treats it as existing input |
| **Fix** | Replace the search input with a ghost icon Button (Search icon) that triggers the Platform Search overlay. The search input lives INSIDE the overlay, not in the header. This matches the brief's header icon layout: Logo → [Search icon] [Messaging] [Bell] [Grid] [Avatar]. |

### M4. Space pages duplicate SpaceHeader + SpaceNavigationTabs per page file

| | Detail |
|---|---|
| **Current** | SpaceHome.tsx, SpaceCommunity.tsx, SpaceSubspaces.tsx, SpaceKnowledgeBase.tsx each independently render `<SpaceHeader>` + `<SpaceNavigationTabs>` |
| **Problem** | This creates duplication and makes it impossible for the tabs to be truly full-width (they're nested inside each page's container) |
| **Fix** | Create a `SpaceShell` or integrate into SpaceLayout: it renders SpaceHeader → Breadcrumb → SpaceNavigationTabs at full width, then passes tab content via nested routing (Outlet). Individual page files only render their specific content (member grid, card grid, etc.). |

### M5. Space page content width inconsistency

| | Detail |
|---|---|
| **Brief says** | Banner and tab bar = full-width (edge to edge). Below tabs, content uses a contained max-width. |
| **Prototype** | Uses `container mx-auto px-4 md:px-6` for the entire content area (including sidebar + tabs), constraining everything |
| **Fix** | Banner and tabs should be outside any container (truly full-viewport). Only the post area / member grid below tabs should be in a container. |

### M6. Add Post Dialog — missing template selector + references

| | Detail |
|---|---|
| **Brief says** | Form includes: Template selector (Brainstorm, Decision, Announcement pills) + References input (URL fields) |
| **Prototype** | Has attachment toggles but may be missing template selector pills and reference URL inputs |
| **Prompt says** | "Verify: Attachment toggles match platform content types" — doesn't mention template selector or references |
| **Fix** | Verify and add if missing: template selector (pill-style: Brainstorm, Decision, Announcement, Feedback/Survey) + References section (Title + URL inputs + "Add Reference" button). |

---

## 🔵 LOW — Minor/Informational

### L1. UserGenericSettingsPage — 6th user tab has no brief

The 6 user account tabs are: MY PROFILE, ACCOUNT, MEMBERSHIP, ORGANIZATIONS, NOTIFICATIONS, SETTINGS. Only 5 have page briefs (Pages 9-13). The 6th "SETTINGS" tab (`UserGenericSettingsPage.tsx`) has no brief to verify against.

### L2. "Explore All Spaces" — dialog vs page ambiguity

Brief notes: "current platform may have this as a DIALOG, not a page." Prototype has it as a full page (BrowseSpacesPage.tsx). Both might coexist (page at /spaces AND dialog triggered from dashboard sidebar). Not addressed in prompt.

### L3. SubspaceSidebar collapsible behavior

Brief says SubspaceSidebar "may need REMOVAL or simplification." Prompt removes quick-action buttons but keeps the collapsible sidebar. Current platform may not have a collapsible sidebar on subspace pages at all.

### L4. Organizations tab cover images

Brief: "current org cards may not have cover images." Prototype has cards with cover images + gradient overlays. Prompt says "verify" but doesn't resolve.

### L5. Account page dashed "Create New" cards

Brief: "design pattern not in current." Prototype uses dashed border cards for "Create New Space" / "Create New Contributor." Not mentioned in prompt.

---

## Summary

| Severity | Count | Key Items |
|----------|-------|-----------|
| 🔴 Critical | 4 | SpaceSidebar on wrong tabs, chat code in 3 pages, tabs not full-width, logo missing from header |
| 🟠 High | 6 | Footer mismatch, banner badges, header icons, dropdown menu, tab labels, profile tabs vs sections |
| 🟡 Medium | 6 | Settings header bar, messaging cleanup, search input vs icon, page duplication, content width, post dialog |
| 🔵 Low | 5 | Generic settings tab, explore dialog, subspace sidebar, org covers, dashed cards |

**Total: 21 gaps** — 4 critical, 6 high, 6 medium, 5 low.
