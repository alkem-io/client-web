# Prototype Coverage Summary

> Cross-reference of all 31 page briefs against the Figma Make prototype codebase and platform screenshots.  
> Generated after completing Prototype Status + Pull-Back Notes for every page.

---

## Coverage Overview

| Status | Count | Pages |
|--------|-------|-------|
| ✅ Built | 25 | 01-08, 09-14, 15, 17-23, 25, 27-31 |
| ⚠️ Partially Built | 2 | 16 (Layout tab is entirely new), 26 (sliding panel not built — modal only) |
| ❌ Not Built | 2 | 26 (sliding panel variant), 32 (Platform Search overlay) |

**Overall: 25 of 31 pages have prototype coverage (81%)**

---

## Page-by-Page Status

| # | Page | Status | Prototype File(s) | Major Divergences |
|---|------|--------|--------------------|-------------------|
| 01 | Dashboard | ✅ Built | `pages/Dashboard.tsx`, `DashboardHero.tsx`, `RecentSpaces.tsx`, `ActivityFeed.tsx` | ✅ DECIDED: Remove hero banner |
| 02 | Space Home Tab | ✅ Built | `pages/SpaceHome.tsx`, `SpaceFeed.tsx`, `SpaceHeader.tsx` | ✅ DECIDED: Sidebar exists in both but content differs — must fix prototype sidebar to match current |
| 03 | Space Community Tab | ✅ Built | `pages/SpaceCommunity.tsx`, `SpaceMembers.tsx` (200 lines) | Mostly matches; verify role badges |
| 04 | Space Subspaces Tab | ✅ Built | `pages/SpaceSubspaces.tsx`, `SpaceSubspacesList.tsx` (230 lines) | Filter pills may not be in current |
| 05 | Space Knowledge Base | ✅ Built | `pages/SpaceKnowledgeBase.tsx`, `SpaceResourcesList.tsx` (200 lines) | ✅ DECIDED: Revert to card layout (current uses posts-as-cards) |
| 06 | Add Post Dialog | ✅ Built | `components/space/AddPostModal.tsx` (200 lines) | Extra "Post Type" selector may be new |
| 07 | Subspace Page | ✅ Built | `pages/SubspacePage.tsx`, `SubspaceHeader.tsx`, `SubspaceSidebar.tsx` | Sidebar may differ from current |
| 08 | User Profile | ✅ Built | `pages/UserProfilePage.tsx`, `UserProfileHeader.tsx`, `SpaceGridCard.tsx` | Mostly matches; verify contributions section |
| 09 | Account Page | ✅ Built | `pages/UserAccountPage.tsx` | New sections: Virtual Contributors, Template Packs |
| 10 | Notifications Drawer | ✅ Built | `components/layout/Header.tsx` (notifications dropdown) | Popover only, not full-width Sheet as specified |
| 11 | My Spaces Drawer | ✅ Built | `components/layout/Sidebar.tsx` (180 lines) | Sidebar always visible; may differ from drawer pattern |
| 12 | Explore Spaces Dialog | ✅ Built | `components/dialogs/ExploreSpacesDialog.tsx` (320 lines) | Also exists as full page (BrowseSpacesPage) |
| 13 | Profile Menu | ✅ Built | `components/layout/Header.tsx` (avatar dropdown) | Mostly matches; verify menu items |
| 14 | Create Space | ✅ Built | `components/dialogs/CreateSpaceDialog.tsx` + `pages/CreateSpaceChatPage.tsx` (831 lines) | ✅ DECIDED: Remove AI wizard, keep simple dialog |
| 15 | Space Settings Master | ✅ Built | `pages/SpaceSettingsPage.tsx` + 9 settings components (~3700 lines total) | Sidebar/tabs pattern matches |
| 16 | Settings — Layout Tab | ✅ Keep | `components/space/SpaceSettingsLayout.tsx` | ✅ DECIDED: Keep drag-drop layout editor (new feature) |
| 17 | Settings — About Tab | ✅ Built | `components/space/SpaceSettingsAbout.tsx` | Close match |
| 18 | Settings — Community Tab | ✅ Built | `components/space/SpaceSettingsCommunity.tsx` (797 lines) | Possibly over-engineered; check scope |
| 19 | Settings — Subspaces Tab | ✅ Built | `components/space/SpaceSettingsSubspaces.tsx` | Close match |
| 20 | Settings — Templates Tab | ✅ Built | `components/space/SpaceSettingsTemplates.tsx` | Close match |
| 21 | Settings — Storage Tab | ✅ Built | `components/space/SpaceSettingsStorage.tsx` | Close match; verify against screenshot |
| 22 | Profile Settings — My Profile | ✅ Built | `pages/UserProfileSettingsPage.tsx` | Close match |
| 23 | Profile Settings — My Account | ✅ Built | `pages/UserAccountPage.tsx` | Overlap with Page 09 |
| 25 | Post Detail Dialog | ✅ Built | `components/dialogs/PostDetailDialog.tsx` (250 lines) | Reactions bar; contributions grid; verify vs screenshot |
| 26 | Response Panel (Sliding) | ❌ Not Needed | — | ✅ DECIDED: Current uses full modal (not sliding panel). Page 27 covers this. Page 26 can be skipped. |
| 27 | Response Panel (Modal) | ✅ Built | `components/dialogs/ResponseDetailDialog.tsx` (270 lines) | Response navigation; peer preview strip |
| 28 | Template Library | ✅ Built | `components/template-library/TemplateLibrary.tsx` (~330 lines) | ✅ DECIDED: Include — remove methodology content from templates |
| 29 | Template Pack Detail | ✅ Built | `components/template-library/TemplatePackDetail.tsx` (~330 lines) | ✅ DECIDED: Include — remove methodology content |
| 30 | Template Detail | ✅ Built | `components/template-library/TemplateDetail.tsx` (907 lines) | ✅ DECIDED: Include — remove methodology content from preview |
| 31 | Browse All Spaces | ✅ Built | `pages/BrowseSpacesPage.tsx` (1055 lines) | ✅ DECIDED: Include as full page |
| 32 | Platform Search | ❌ Not Built | — | ✅ DECIDED: Include — needs full implementation |

---

## Stakeholder Decisions (Confirmed)

Decisions recorded on 2026-02-19:

### Pull-Back (Remove from Prototype)

| # | Divergence | Page | Decision |
|---|-----------|------|----------|
| 1 | **Dashboard hero banner** | 01 | ✅ **REMOVE** — not in current platform |
| 2 | **Space Home left sidebar** | 02 | ✅ **FIX CONTENT** — sidebar exists in both, but prototype has generic welcome card + folder icons. Must match current: description card (teal bg + lead avatar) + "About This Space" button + subspaces (colored avatars) + Events section |
| 3 | **KB data-table layout** | 05 | ✅ **REVERT TO CARDS** — current uses posts-as-cards in tab (user prefers table but removing for consistency) |
| 4 | **AI Space Creation wizard** | 14 | ✅ **REMOVE** — keep simple dialog only |

### Keep from Prototype (New Features)

| # | Feature | Page | Decision |
|---|---------|------|----------|
| 5 | **Layout settings tab** (drag-drop) | 16 | ✅ **KEEP** — new feature, include in scope |
| 6 | **Template Library** (browsing, packs, details) | 28-30 | ✅ **INCLUDE** — but remove methodology content from each template |
| 7 | **Browse All Spaces** (full page) | 31 | ✅ **INCLUDE** as full page |

### Design Tokens (Adopt Prototype's Tokens)

| # | Token | Decision |
|---|-------|----------|
| 8 | **Font: Inter** | ✅ **ADOPT** — use Inter (do NOT revert to Montserrat/Source Sans Pro) |
| 9 | **Border radius: 6px** | ✅ **ADOPT** — use 6px (do NOT change to 12px) |
| 10 | **Background: white** | ✅ **ADOPT** — use white (do NOT change to #F1F4F5) |

### Build from Scratch

| # | Feature | Page | Decision |
|---|---------|------|----------|
| 11 | **Platform Search overlay** | 32 | ✅ **INCLUDE** — needs full implementation |
| 12 | **Response panel (sliding vs modal)** | 26-27 | ✅ **MODAL ONLY** — current uses big centered modal. Page 27 is correct. Page 26 (sliding panel) not needed. |

---

## May Keep (Enhancements in Prototype)

These are improvements in the prototype that are acceptable upgrades over the current UI — confirm with stakeholders:

| # | Enhancement | Page | Notes |
|---|------------|------|-------|
| 1 | SpaceCard skeleton loading state | 31 | Nice UX addition |
| 2 | Active filter chips (removable badges) | 31 | Better filter UX |
| 3 | Peer response preview strip | 27 | Useful navigation aid |
| 4 | Template type-switched previews | 28-30 | Sophisticated; may be new feature |
| 5 | Virtual Contributors sections | 09 | New feature, may keep if roadmapped |
| 6 | Sonner toast notifications | 27 | Standard pattern, acceptable |

---

## Not Built (Needs Implementation)

| # | Feature | Page | Effort Estimate |
|---|---------|------|-----------------|
| 1 | Platform Search overlay | 32 | High — needs overlay, category sidebar, 5 result types, filters, scope dropdown |
| 2 | Response sliding panel variant | 26 | Medium — Sheet component with same content as modal |

---

## Design Tokens (Final)

Stakeholder decided to **adopt the prototype's tokens** — no corrections needed:

| Token | Value | Status |
|-------|-------|--------|
| Primary color | `#1D384A` | ✅ Keep |
| Font | Inter | ✅ Keep (adopted over Montserrat/Source Sans Pro) |
| Border radius | 6px | ✅ Keep (adopted over 12px) |
| Page background | white | ✅ Keep (adopted over #F1F4F5) |
| Card background | white | ✅ Keep |

---

## Screenshot Cross-Reference Status

| Screenshot | Mapped to Page | Status |
|-----------|---------------|--------|
| Dashboard.png | 01 | Compared |
| space home tab.png | 02 | Compared |
| community tab.jpg / space community tab.png | 03 | Compared |
| space subspaces tab.png | 04 | Compared |
| Space Knowledge Base.png | 05 | Compared — MAJOR divergence (cards → table) |
| add post .png | 06 | Compared |
| profile page.png | 08 | Compared |
| account page.png | 09 | Compared |
| profile settings > my account.png | 22-23 | Compared |
| profile settings > my profile.png | 22 | Compared |
| profile settings > memberships.png | (user memberships) | Compared |
| profile settings > organisations.png | (user orgs) | Compared |
| profile settings > notifications.png | (user notifications) | Compared |
| profile settings > secruity.png | (user security) | Compared |
| profile settings > settings.png | (user settings) | Compared |
| space settings Storage Tab.jpg | 21 | Compared |
| Dialouge when Opening the post… (level 2).png | 25 | Compared |
| dialouge for viewing a response… (level 3).png | 26-27 | Compared |
| dashboard > explore all my spaces.png | 12 | Compared |
| explore spaces.png | 31 | Compared |
| post template.png | 30 | Compared |
| collaboration tool template variants.png | 30 | Compared |
| dashboard with profile menu open.png | 13 | Compared |
| create a space dialouge.png | 14 | Compared |

---

## Readiness Assessment (Post-Decisions)

### Ready for Implementation
Pages 03, 04, 06, 07, 08, 09, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 27, 28, 29, 30, 31 — **25 pages**

### Needs Divergence Fixes Before Implementation
Pages 01 (remove hero), 02 (fix sidebar content), 05 (revert table→cards), 14 (remove AI wizard) — **4 pages**

### Skipped / Not Needed
Page 26 (sliding panel) — **not needed**, current uses modal (Page 27 covers it)

### Needs Full Build
Page 32 (Platform Search overlay) — **1 page**

---

## Next Steps

1. ✅ **All decisions resolved** — no pending items
2. **Fix divergences** — Dashboard hero (Page 01), Space Home sidebar content (Page 02), KB table→cards (Page 05), AI wizard (Page 14)
3. **Remove methodology** from template pages (Pages 28-30)
4. **Build Platform Search** overlay from scratch (Page 32)
5. **Start implementation** — Begin with the 25 ready pages
