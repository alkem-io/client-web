# Page 9: Account Tab — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/pages/UserAccountPage.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

## Changes Required

No structural changes required. The Virtual Contributors and Template Packs sections are intentional features — keep them. Verify the following:

1. **Verify the 6-tab navigation labels match the current platform exactly.** The prototype uses: MY PROFILE | ACCOUNT | MEMBERSHIP | ORGANIZATIONS | NOTIFICATIONS | SETTINGS. Compare against the actual platform tab names (screenshot `profile settings > my account.png`). Correct any label mismatches (e.g. the platform may say "My Profile" instead of "MY PROFILE", or tabs may be in a different order). Ensure the ACCOUNT tab is visually active with the primary color indicator.

2. **Verify capacity indicators are accurate.** The prototype shows "used/total" counters on Template Packs and Custom Homepages sections (e.g. "0/5", "0/1"). Confirm the current platform displays similar capacity indicators on the Account page. If not present in the current platform, these are acceptable enhancements — keep them.

3. **Verify Hosted Spaces card plan badges.** Each space card shows a color-coded plan badge (Premium / Plus / Basic). Confirm the current platform shows plan information on hosted space cards. If the badge styles differ (e.g. current uses text labels instead of colored badges), adjust to match the current pattern while using shadcn `Badge` components.
