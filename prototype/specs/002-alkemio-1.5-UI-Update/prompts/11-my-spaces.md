# Page 11: Membership Tab — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/pages/UserMembershipPage.tsx`

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

1. **Verify the 3-column card grid matches the current membership layout.** Compare the prototype's card grid against the actual memberships page (screenshot `profile settings > memberships.png`). Each card should display: cover image, space/subspace name, description snippet, member count, and an overflow menu (shadcn `DropdownMenu` with "View Details" and "Leave" actions). Ensure the card component is visually consistent with the space cards used on the Dashboard and Browse pages.

2. **Verify role badges use correct role names.** The prototype displays role badges (e.g. "Admin", "Member", "Lead") on each membership card. Compare the role names against the current platform's membership display. Adjust if the platform uses different terminology (e.g. "Facilitator" instead of "Admin").

3. **Verify the "Load More" pagination pattern.** The prototype has a ghost-style "Load More" button at the bottom. Confirm the current platform uses the same pagination pattern (not numbered pages or infinite scroll). Keep as-is if it matches.
