# Page 4: Subspaces Tab — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/pages/SpaceSubspaces.tsx`, `src/app/components/space/SpaceSubspacesList.tsx`

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

1. **Card layout uses a 3-column responsive grid** with subspace cards containing: banner image (16:9 aspect ratio), subspace name, short description, member count, and a row of lead avatars (shadcn `Avatar`, stacked/overlapping, 3-5 max with overflow indicator). Verify the card structure matches the `ContributeCard` pattern from the current platform.

2. **Lead avatar row placement is correct on each card.** The current platform shows lead avatars overlaid on or directly below the banner image. Verify the prototype matches this positioning rather than placing them at the card bottom.

3. **The tab label in SpaceNavigationTabs reads "WORKSPACES"** (not "SUBSPACES"). This must match the tab label fix applied on the Space Home page (Page 2). If it still says "SUBSPACES", rename it to "WORKSPACES".
