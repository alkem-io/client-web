# Page 7: Subspace Page — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/pages/SubspacePage.tsx`, `src/app/components/space/SubspaceHeader.tsx`, `src/app/components/space/SubspaceSidebar.tsx`, `src/app/components/space/ChannelTabs.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

## Changes Required

No structural changes required. Verify the following:

1. **SubspaceHeader banner and breadcrumb are correct.** The header should have: full-width background image with dark overlay, subspace title + description overlaid, a "← Back to [Space Name]" breadcrumb link, inline member avatar row (shadcn `Avatar`, stacked), and utility icon buttons on the right (Search, Maximize, Settings, Share — all `Button variant="ghost" size="icon"`). Verify layout matches the Space Home banner pattern.

2. **SubspaceSidebar quick-action buttons are not fabricated.** The prototype has "Project Docs", "Team Roster", "Schedule" quick action buttons in the sidebar. These are new additions that do not exist in the current platform. If present, remove them — keep only the challenge/subspace description callout card (shadcn `Card`) and "About this Subspace" button (shadcn `Button variant="outline"`).

3. **ChannelTabs pill labels are appropriate.** The prototype uses channel names like "All Activity", "Strategy Docs", "Municipal Data", "Policy Drafts", "Stakeholders". These represent innovation flow stages specific to the subspace context. Verify the pill-style tabs (shadcn `ToggleGroup` or custom tabs with rounded styling) display correctly with optional count badges.
