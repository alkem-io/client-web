# Prototype Analysis: Redesign Alkemio Platform (1-1 UI Transfer)

> **Source**: `Resources/Redesign Alkemio Platform (1-1 UI Transfer)/`  
> **Live**: https://shared-pull-34306634.figma.site  
> **Analysed**: 2026-02-19  

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 6 |
| Routing | react-router / react-router-dom v7 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) + CSS custom properties |
| Component Library | shadcn/ui (Radix primitives) — 48 components in `src/app/components/ui/` |
| Animations | Motion (Framer Motion) 12.x |
| Rich Text | ReactQuill (Space Settings), react-markdown + remark-gfm |
| Carousel | react-slick |
| Drag & Drop | react-dnd + react-dnd-html5-backend |
| Charts | Recharts |
| Toasts | Sonner |
| Forms | react-hook-form |
| Icons | Lucide React |
| Fonts | Inter (prototype uses Inter, NOT Montserrat/Source Sans Pro) |

### ⚠️ Key Divergence: Fonts
The prototype uses **Inter** throughout (set in theme.css). The original platform uses **Montserrat** (headings) + **Source Sans Pro** (body). This is a pull-back item for every page.

### Design Tokens (from `theme.css`)
| Token | Value | Match? |
|-------|-------|--------|
| Primary | `#1D384A` (rgba 29,56,74) | ✅ Matches |
| Background | white | ⚠️ Original is `#F1F4F5` |
| Secondary/Muted | `rgba(241,245,249)` (slate-100) | ⚠️ Close but not exact |
| Border | slate-200 | ✅ OK |
| Border Radius | 6px | ⚠️ Original is 12px |
| Fonts | Inter | ❌ Should be Montserrat + Source Sans Pro |
| Dark mode | Full support | ✅ Bonus (original has no dark mode) |

---

## 2. Page Coverage Map

### Prototype → Brief Page Mapping

| Brief # | Brief Page | Prototype File | Status |
|---------|-----------|---------------|--------|
| 01 | Dashboard | `pages/Dashboard.tsx` + `components/dashboard/*` | ✅ BUILT |
| 02 | Space Home | `pages/SpaceHome.tsx` + `components/space/SpaceHeader,Feed,Sidebar` | ✅ BUILT |
| 03 | Community Tab | `pages/SpaceCommunity.tsx` + `components/space/SpaceMembers` | ✅ BUILT |
| 04 | Subspaces Tab | `pages/SpaceSubspaces.tsx` + `components/space/SpaceSubspacesList` | ✅ BUILT |
| 05 | Knowledge Base | `pages/SpaceKnowledgeBase.tsx` + `components/space/SpaceResourcesList` | ✅ BUILT |
| 06 | Add Post Modal | `components/space/AddPostModal.tsx` | ✅ BUILT |
| 07 | Subspace Page | `pages/SubspacePage.tsx` + `SubspaceHeader,SubspaceSidebar` | ✅ BUILT |
| 08 | User Profile | `pages/UserProfilePage.tsx` + `components/user/*` | ✅ BUILT |
| 09 | Account Settings | `pages/UserAccountPage.tsx` | ✅ BUILT |
| 10 | My Profile Settings | `pages/UserProfileSettingsPage.tsx` | ✅ BUILT |
| 11 | Membership | `pages/UserMembershipPage.tsx` | ✅ BUILT |
| 12 | Organizations | `pages/UserOrganizationsPage.tsx` | ✅ BUILT |
| 13 | Notifications | `pages/UserNotificationsPage.tsx` | ✅ BUILT |
| 14 | Create Space | `pages/CreateSpaceSelectionPage.tsx` + `CreateSpaceChatPage.tsx` | ✅ BUILT (enhanced — AI chat wizard) |
| 15 | Space Settings Master | `pages/SpaceSettingsPage.tsx` + `SpaceSettingsSidebar` | ✅ BUILT |
| 16 | Settings: About | `components/space/SpaceSettingsAbout.tsx` | ✅ BUILT |
| 17 | Settings: Layout | `components/space/SpaceSettingsLayout.tsx` | ✅ BUILT (NEW — drag-and-drop tab editor) |
| 18 | Settings: Community | `components/space/SpaceSettingsCommunity.tsx` | ✅ BUILT (797 lines) |
| 19 | Settings: Subspaces | `components/space/SpaceSettingsSubspaces.tsx` | ✅ BUILT |
| 20 | Settings: Templates | `components/space/SpaceSettingsTemplates.tsx` | ✅ BUILT |
| 21 | Settings: Storage | `components/space/SpaceSettingsStorage.tsx` | ✅ BUILT |
| 22 | Settings: Settings | `components/space/SpaceSettingsSettings.tsx` | ✅ BUILT |
| 23 | Settings: Account | `components/space/SpaceSettingsAccount.tsx` | ✅ BUILT |
| 25 | Post Detail | `components/dialogs/PostDetailDialog.tsx` | ✅ BUILT |
| 26 | Response Panel Inline | — | ❌ NOT SEPARATE (uses ResponseDetailDialog as modal overlay) |
| 27 | Response Panel Fullscreen | `components/dialogs/ResponseDetailDialog.tsx` | ✅ BUILT (modal only, no sliding panel variant) |
| 28 | Template Library | `components/template-library/TemplateLibrary.tsx` | ✅ BUILT |
| 29 | Template Pack | `components/template-library/TemplatePackDetail.tsx` | ✅ BUILT |
| 30 | Template Detail | `components/template-library/TemplateDetail.tsx` | ✅ BUILT (907 lines, type-switched previews) |
| 31 | Browse All Spaces | `pages/BrowseSpacesPage.tsx` | ✅ BUILT (1055 lines) |
| 32 | Platform Search | — | ❌ NOT BUILT (search input in Header exists but no overlay) |

### Additional Pages NOT in Original Briefs
| Prototype Page | Description |
|---------------|-------------|
| `DesignSystemPage.tsx` | Living design system showcase |
| `SpaceChatPage.tsx` | Variant C — dedicated chat tab |
| `CreateSpaceChatPage.tsx` | AI-guided space creation wizard (831 lines!) |
| `analytics/EcosystemAnalyticsPage.tsx` | Standalone analytics dashboard |
| Messaging System (5 variants) | Full messaging hub with DM, group, space channels |

---

## 3. Divergence Analysis by Page

### LAYOUT DIVERGENCES (items that differ from current platform)

#### Dashboard (Page 01)
- **Prototype**: Hero banner CTA (DashboardHero) → NOT on current platform
- **Prototype**: react-slick carousel for Recent Spaces → Current uses simple grid
- **Prototype**: Two-column activity feeds → Current has different activity layout
- **Pull-back**: Remove hero banner, match current grid layout for Recent Spaces

#### Space Home (Page 02)
- **Prototype**: SpaceSidebar (welcome callout + subspace list) on left → Current has NO sidebar
- **Prototype**: SpaceFeed uses PostCard with 4 post types → Current has ContributeCard
- **Prototype**: Chat variants A/B/C/D/E → Current has no inline chat
- **Pull-back**: Remove sidebar, remove chat variants, match current feed layout

#### Community Tab (Page 03)  
- **Prototype**: 3-column member grid with role badges → Current similar but different card layout
- **Prototype**: Has search + role filter pills → Current similar
- **Pull-back**: Verify card layout matches current

#### Subspaces Tab (Page 04)
- **Prototype**: Filter pills (All/Active/Archived) → Current has no filters
- **Prototype**: Card layout with status badges → Current simpler
- **Pull-back**: Remove filter pills, match current card style

#### Knowledge Base (Page 05)
- **Prototype**: Full data table with sort/filter/actions → **NEW** (current KB is very different — uses card layout)
- **Pull-back**: This is a REDESIGN, not 1:1 — needs significant pull-back to match current

#### Add Post Modal (Page 06)
- **Prototype**: Large compose dialog with MarkdownEditor, attachment toggles (WB/Memo/CTA), collapsible settings → More feature-rich than current
- **Pull-back**: Match current modal structure (simpler)

#### Subspace Page (Page 07)
- **Prototype**: Has SubspaceSidebar (collapsible) with ChannelTabs → Current simpler
- **Pull-back**: Match current subspace layout

#### User Profile (Page 08)
- **Prototype**: 12-col grid (4-col sidebar + 8-col tabs) → Current may differ
- **Prototype**: 5 tabs (All Resources/Hosted Spaces/VCs/Leading/Member Of) → Current has different tabs
- **Pull-back**: Verify tab structure matches current

#### Account Settings (Pages 09-13)
- **Prototype**: 6-tab navigation (My Profile/Account/Membership/Orgs/Notifications/Settings) → Current has similar but may differ
- **Prototype Account page**: Hosted Spaces + VCs + Template Packs + Custom Homepages → Current differs
- **Pull-back**: Verify each settings tab matches current screenshots

#### Create Space (Page 14)
- **Prototype**: TWO options — Form dialog OR AI-guided chat (831-line chat wizard) → Current only has form dialog
- **Pull-back**: Keep form dialog, mark AI chat as enhancement (not pull-back)

#### Space Settings (Pages 15-23)
- **Prototype Layout tab (17)**: Drag-and-drop tab reordering with icon picker → **NEW FEATURE**
- **Prototype Community tab (18)**: Full paginated member table (797 lines) → Current simpler
- **Pull-back**: Layout tab is new, other tabs need individual review

#### Post Detail (Page 25)
- **Prototype**: Near-fullscreen dialog with sticky header, reactions bar, contributions grid, comments section → Roughly matches but more polished
- **Pull-back**: Verify matches current

#### Response Detail (Pages 26-27)
- **Prototype**: Only has MODAL variant (ResponseDetailDialog) → No sliding panel
- **Pull-back**: Page 26 (sliding panel) not implemented; Page 27 modal is built but may differ

#### Templates (Pages 28-30)
- **Prototype**: Fully built with type-switched preview renderers (Space/Subspace/Collaboration/Whiteboard/Post/Brief/Guidelines) → **ENHANCED beyond current platform**
- **Pull-back**: Templates may be entirely new (current platform may not have this level of template browsing)

#### Browse All Spaces (Page 31)
- **Prototype**: Full search/filter/sort with 25 mock spaces → Close to current but enhanced
- **Pull-back**: Verify grid layout and card structure match current

#### Platform Search (Page 32)
- **Prototype**: **NOT BUILT** — Header has search input but no overlay
- **Pull-back**: N/A — needs to be built

---

## 4. Component-Level Divergences

### shadcn Components Actually Used vs Mapped

| Brief Mapping | Actual Prototype | Match? |
|--------------|-----------------|--------|
| Paper → Card | ✅ Uses Card extensively | ✅ |
| Avatar → Avatar | ✅ Uses Avatar | ✅ |
| Chip → Badge | ✅ Uses Badge | ✅ |
| Dialog → Dialog | ✅ Uses Dialog | ✅ |
| Tabs → Tabs | ⚠️ Some pages use custom tabs (HTML buttons) | ⚠️ Mixed |
| Button → Button | ✅ Uses Button | ✅ |
| TextField → Input | ✅ Uses Input | ✅ |
| Select → Select | ✅ Uses Select | ✅ |
| Accordion → Accordion | ✅ Uses Accordion | ✅ |
| Drawer → Sheet | ✅ Uses Sheet | ✅ |
| Switch → Switch | ✅ Uses Switch | ✅ |
| Tooltip → Tooltip | ✅ Uses Tooltip | ✅ |
| Separator → Separator | Limited use | ⚠️ |
| DropdownMenu → DropdownMenu | ✅ Uses extensively | ✅ |
| ToggleGroup → custom | ⚠️ Uses custom pill buttons instead | ⚠️ |

### Extra Components in Prototype (not in brief mapping)
- `Carousel` (shadcn) — but Dashboard uses react-slick instead
- `Command` (cmdk) — available but not used in pages
- `Drawer` (vaul) — available but Sheet used instead
- `HoverCard` — available
- `Popover` — used in Settings Layout (icon picker)
- `Progress` — used in Create Space Chat
- `RadioGroup` — used in Space Settings
- `Resizable` — used in Space Chat Drawer
- `ScrollArea` — used in messaging
- `Table` — used in Knowledge Base, Community Settings
- `Textarea` — used in comments, messaging

---

## 5. Screenshot Cross-Reference

| Screenshot File | Maps To Brief | Key Observations |
|----------------|--------------|------------------|
| `Dashboard.png` / `Alkemio Dashboard Screenshot.png` | Page 01 | Current dashboard has NO hero banner, uses PageContentBlock cards |
| `space home tab.png` | Page 02 | Current has NO left sidebar, uses tab content area only |
| `community tab.jpg` / `space community tab.png` | Page 03 | Current uses card grid, similar to prototype |
| `space subspaces tab.png` | Page 04 | Current uses ContributeCard-style cards, no filter pills |
| `Space Knowledge Base.png` | Page 05 | Current KB is VERY different (not a data table) |
| `add post .png` | Page 06 | Current modal simpler than prototype |
| `profile page.png` | Page 08 | Current profile uses different layout |
| `account page.png` | Page 09 | — |
| `profile settings > my account.png` | Page 09 | Current account settings layout |
| `profile settings > my profile.png` | Page 10 | — |
| `profile settings > memberships.png` | Page 11 | — |
| `profile settings > organisations.png` | Page 12 | — |
| `profile settings > notifications.png` | Page 13 | — |
| `profile settings > secruity.png` | Page (no brief) | Security tab not in our briefs |
| `profile settings > settings.png` | Page (generic) | — |
| `create a space dialouge.png` | Page 14 | Current is simple form dialog |
| `space settings Storage Tab.jpg` | Page 21 | — |
| `Dialouge when Opening the post...` | Page 25 | Current post detail dialog |
| `dialouge for viewing a response...` | Pages 26/27 | Current response dialog |
| `dashboard > explroe alll my spaces.png` | (explore dialog) | Current explore is a dialog, not a page |
| `explroe spaces.png` | Page 31 | Current browse spaces |
| `dashboard with profile menu open.png` | (header) | Current profile dropdown |
| `post template.png` | Page 30 | Template detail |
| `collaboration tool template > post with a whiteboard.png` | Page 30 | Collab template detail |
| `collabroation tool template > post with a post.png` | Page 30 | Collab template detail |

### Major Layout Differences Found in Screenshots

1. **Dashboard**: Current platform uses PageContentBlock stacked cards, NO hero banner, NO carousel
2. **Space Home**: Current has NO sidebar — just header + tabs + content
3. **Knowledge Base**: Current uses a CARD-based layout, NOT a data table
4. **Explore Spaces**: Current has it as a DIALOG (from sidebar), prototype has it as a full PAGE
5. **Create Space**: Current is a simple dialog, prototype adds AI chat wizard

---

## 6. Recommendations

### Must Pull-Back (prototype diverges from current)
1. ❌ Remove Dashboard hero banner
2. ❌ Remove Space Home sidebar  
3. ❌ Revert Knowledge Base from table to card layout
4. ❌ Remove chat variants A-E (not in current platform)
5. ❌ Remove Subspaces filter pills
6. ❌ Fix fonts: Inter → Montserrat + Source Sans Pro
7. ❌ Fix border-radius: 6px → 12px
8. ❌ Fix background: white → #F1F4F5

### May Keep (improvements that work)
1. ✅ SpaceCard component (well-built, matches brief)
2. ✅ PostDetailDialog structure (close to current)
3. ✅ Space Settings tabs (mostly match)
4. ✅ Template Library/Pack/Detail (new feature, no pull-back needed)
5. ✅ User profile/settings structure
6. ✅ shadcn component usage patterns

### Not Built (needs implementation)
1. 🔨 Platform Search overlay (Page 32) — not in prototype
2. 🔨 Response Panel sliding variant (Page 26) — prototype only has modal
