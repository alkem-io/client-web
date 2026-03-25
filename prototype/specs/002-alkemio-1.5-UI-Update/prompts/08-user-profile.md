# Page 8: User Profile — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/pages/UserProfilePage.tsx`, `src/app/components/user/UserProfileHeader.tsx`, `src/app/components/user/SpaceGridCard.tsx`, `src/app/components/user/OrganizationCard.tsx`

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

1. **Profile header layout matches the current platform.** The banner should have: decorative background image, large circular avatar (shadcn `Avatar`, ~132-160px), user name, location text, and action icon buttons — Message (Lucide `Mail`) and Settings (Lucide `Settings`, visible only on own profile). Verify the avatar does NOT have an "online indicator" green dot, as this does not exist in the current platform. Remove if present.

2. **The two-column layout uses the correct split.** The current prototype uses a 12-column grid (4 left / 8 right). The current platform may use a different ratio. Verify the left column contains: bio text (markdown/prose) + Associated Organizations card grid. The right column contains: resource sections (Hosted Spaces, Virtual Contributors, Spaces Leading, Spaces Member Of) displayed as card grids using `SpaceGridCard`.

3. **The 5-tab structure (All Resources / Hosted Spaces / Virtual Contributors / Leading / Member Of) may be over-engineered.** The current platform profile page shows these as stacked sections, not tabs. If the tabs add useful organization without fabricating functionality, keep them. If they split content that should be visible at once, consider reverting to stacked sections with headings.
