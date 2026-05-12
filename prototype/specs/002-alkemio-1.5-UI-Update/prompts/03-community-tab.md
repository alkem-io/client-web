# Page 3: Community Tab — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/pages/SpaceCommunity.tsx`, `src/app/components/space/SpaceMembers.tsx`

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

1. **Member card layout matches a 3-column responsive grid** (3 columns on desktop, 2 on tablet, 1 on mobile). Each card should have: large circular avatar (shadcn `Avatar`), member name (linked to profile), and a color-coded role badge (shadcn `Badge`). Verify the card design is clean and consistent with the rest of the prototype.

2. **Role filter pills match the platform's role model.** The prototype uses filter pills (All/Host/Admin/Lead/Member). Verify these role names match the Alkemio role taxonomy. The current platform uses: Facilitator, Contributor (and possibly Admin/Lead). Adjust pill labels if needed to match the actual roles.

3. **The DropdownMenu on member cards is not over-engineered.** The current prototype has a ⋮ more menu with multiple actions per member card. The current platform may have simpler actions (e.g., just "View Profile" or "Message"). Verify the menu actions are appropriate and not adding functionality that doesn't exist in the platform.
