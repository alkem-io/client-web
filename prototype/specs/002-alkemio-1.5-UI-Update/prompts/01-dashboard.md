# Page 1: Dashboard — Figma Make Prompt

> **Action**: Delta fix — Verified against prototype visual state (code trace, June 2025)
> **Target files**: `src/app/components/dashboard/RecentSpaces.tsx`, `src/app/components/layout/Sidebar.tsx`, `src/app/components/layout/Header.tsx`, `src/app/components/dashboard/ActivityFeed.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

**What the prototype currently renders (Dashboard page):**
- MainLayout sidebar (left): Alkemio logo, 5 nav links (Dashboard, Browse Spaces, Template Library, Create Space, Invitations), "My Spaces" list (3 spaces), Activity View toggle
- Header (top): hamburger (mobile), search input, messages icon (conditional on variant), notifications bell, language/variant switcher, user avatar
- Dashboard content: RecentSpaces carousel (react-slick, 4 space cards), two side-by-side ActivityFeed panels, footer
- NOTE: `DashboardHero.tsx` exists as a file but is NOT imported or rendered anywhere — ignore it

## Changes Required

1. **Replace the react-slick carousel in RecentSpaces with a simple flat horizontal row.** The prototype currently uses react-slick with slider arrows, dots, and responsive breakpoints. Remove all react-slick imports, `Slider` component, and slider configuration. Render exactly 4 space cards in a static `flex gap-4` row (no scrolling, no carousel). Each card keeps its current structure: Unsplash banner image thumbnail with hover zoom, space name, and Lock icon for private spaces. Keep the "Explore all your Spaces →" link that navigates to `/spaces`.

2. **Update the left sidebar navigation items.** The prototype sidebar (`Sidebar.tsx`) currently has these nav items: Dashboard (Home icon), Browse Spaces (FolderOpen), Template Library (Library), Create Space (Plus), Invitations (Mail, badge: 2). Change the nav items to match the platform:
   - **Remove**: Dashboard, Browse Spaces, Template Library (these are not in the platform sidebar)
   - **Keep**: Invitations (Mail icon, badge count)
   - **Add**: Tips & Tricks (Lucide `Lightbulb`), My Account (Lucide `Tag`)
   - **Rename + re-icon**: "Create Space" → "Create my own Space" with Lucide `Rocket` icon (instead of Plus)
   - Keep the "MY SPACES" section with space avatars + names
   - **Add a "Virtual Contributors" section** below the Spaces list: section heading "VIRTUAL CONTRIBUTORS" (uppercase, muted, same style as "MY SPACES"), then 2-3 items each with a rounded `Avatar` + VC name (e.g. "Softmann", "The Collaboration Methodologist"). Same styling as space items.
   - Keep the Activity View toggle at the bottom

3. **Add missing header icons.** The prototype Header currently shows: Search input (desktop), Messages icon (only for variant A), Notifications bell, language/variant switcher, user avatar. Ensure the following icon order (left to right) in the right side of the header, regardless of variant:
   - Search (already present as input) — keep as-is
   - Messaging (Lucide `MessageSquare`) — ensure always visible (not conditional on variant)
   - Notifications (Lucide `Bell`) — already present
   - Spaces Grid (Lucide `LayoutGrid`) — **ADD THIS** (2×2 grid icon, `Button variant="ghost" size="icon"`)
   - Profile Avatar — already present; add a small "Beta" text badge near it

4. **Add filter dropdowns to the activity feeds.** The prototype's two ActivityFeed panels currently show only a title, a list of activity items, and a "Show more" button. Add filter dropdowns above each feed:
   - **Left column** ("Latest Activity in my Spaces"): Two dropdowns — `Select` with "Space: All Spaces" and `Select` with "My role: All roles"
   - **Right column** ("My Latest Activity"): One dropdown — `Select` with "Space: All Spaces"
   Use shadcn `Select` components. Place them in a row between the section title and the activity items list.

5. **Delete the orphan file `DashboardHero.tsx`.** This file exists at `src/app/components/dashboard/DashboardHero.tsx` but is never imported or rendered. Remove it to keep the codebase clean.
