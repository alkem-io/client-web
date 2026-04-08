# Page 2: Space Home — Figma Make Prompt

> **Action**: Delta fix — Verified against prototype visual state (code trace, June 2025)
> **Target files**: `src/app/App.tsx`, `src/app/layouts/MainLayout.tsx`, NEW `src/app/layouts/SpaceLayout.tsx`, `src/app/pages/SpaceHome.tsx`, `src/app/components/space/SpaceSidebar.tsx`, `src/app/components/space/SpaceNavigationTabs.tsx`, `src/app/components/space/SpaceFeed.tsx`, `src/app/components/space/SpaceHeader.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

**What the prototype currently renders (Space Home page):**
- **MainLayout wraps this page** — it renders an app-level `<Sidebar>` (256px left column with Dashboard, Browse Spaces, Template Library, Create Space, Invitations nav links) alongside the page content. **This sidebar should NOT be visible on space pages.**
- SpaceHeader: Unsplash bg (320px), dark overlay, title "Innovation Hub", description, 5 member avatars + "+24" badge, 5 action buttons in top-right (MessageCircle, FileText, Video, Share2, Settings)
- Two-column layout below header: SpaceSidebar (left, lg:w-80) + main content (right)
- SpaceSidebar: "Welcome!" callout card (bg-primary/5 tint) + "SUBSPACES" section (Folder icons + member counts)
- SpaceNavigationTabs: Home | Community | Subspaces | Knowledge Base (+ Chat tab for variants C/E) — **tabs are NOT full-width** because the app sidebar squeezes them
- **No breadcrumb** is shown between the header and the space banner
- Chat: Variant A = slide-over overlay (closed by default), Variant B = docked panel

**Correct platform layout (top → bottom):**
```
Header (full-width, no app sidebar alongside)
Breadcrumb: Home > Innovation Hub (full-width bar)
Space Banner (full-width, 320px, edge-to-edge)
Tab Bar: HOME | COMMUNITY | WORKSPACES | KNOWLEDGE [icons] (full-width)
┌─────────────┬──────────────────────────────────────────────┐
│ SpaceSidebar │  Activity Feed / Posts (main content)        │
│ (280px)      │                                              │
└─────────────┴──────────────────────────────────────────────┘
Footer
```

## Changes Required

### ⚠️ LAYOUT ARCHITECTURE (do this first)

1. **Remove the app-level Sidebar from space pages.** Create a new `SpaceLayout.tsx` layout component (or make MainLayout route-aware). SpaceLayout should render: Header (full-width) → Breadcrumb bar → Page Content (Outlet, full viewport width) → Footer. **NO `<Sidebar>` component.** Then in `App.tsx`, move all `/space/*` routes to use `<Route element={<SpaceLayout />}>` instead of `<Route element={<MainLayout />}>`. This also applies to subspace routes (`/:spaceSlug/challenges/:subspaceSlug`). Keep the dashboard, browse, templates, and user pages on `MainLayout` with the sidebar.

2. **Add a breadcrumb bar** between the Header and the page content in SpaceLayout. This is a thin horizontal strip (`h-10`, `bg-muted/30` or `bg-gray-50`, `border-b`, full-width) with:
   - Padding `px-6 md:px-8`
   - Breadcrumb trail: **Home** (link to `/`) → `ChevronRight` separator → **Space Name** (current, not linked)
   - Use shadcn `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbSeparator`
   - Text `text-sm`, muted separators

### SPACE PAGE CONTENT FIXES

3. **Space tab bar must span full page width.** With the app sidebar removed, the `SpaceNavigationTabs` should now stretch across the entire content width (edge to edge below the space banner). Fix tab labels: HOME | COMMUNITY | **WORKSPACES** | **KNOWLEDGE** (uppercase, shorter). Add right-side utility icons: `Clock`, `Video`, `Bell`, `Share2`, `Settings` — each as `Button variant="ghost" size="icon"`.

4. **Replace the SpaceSidebar "Welcome!" callout card with a space description card.** Remove bg-primary/5 card with "Welcome!" title and "View Guidelines" button. Replace with:
   - Dark teal/accent background (`bg-teal-800 text-white` or `bg-primary text-primary-foreground`)
   - Space description text + "Read more" link
   - Lead's `Avatar` + name + location below the description

5. **Add an "ABOUT THIS SPACE" button** below description card. Full-width, `Button variant="outline"` + Lucide `Info`. Uppercase text.

6. **Replace Folder icons with colored circular avatars** in subspaces list. Remove member count numbers. Add `Settings` ghost icon next to "SUBSPACES" header.

7. **Add Events section** at sidebar bottom: "EVENTS" header + `ChevronDown`, empty state muted text, "Show calendar" link + green `Plus` circle button.

8. **Remove all chat variant code.** Delete: ChatDrawer/ChatPanel from SpaceHome.tsx, useDesignVariant chat checks, Chat tab from SpaceNavigationTabs, MessageCircle button from SpaceHeader (keep FileText, Video, Share2, Settings).

9. **Verify post cards have inline comment input.** Each post card: user avatar + emoji (`Smile`) + mention (`AtSign`) + text input + send (`Send`).
