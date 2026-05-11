# Page 13: Notifications Tab — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/pages/UserNotificationsPage.tsx`

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

1. **Verify the 5 notification sections match the current platform grouping.** The prototype groups notifications into: Space Notifications (4 items), Platform Notifications (2 items), Organization Notifications (2 items), User Notifications (5 items), and Virtual Contributor Notifications (1 item). Compare against the actual notifications settings page (screenshot `profile settings > notifications.png`). If the current platform uses different section names or groups notifications differently, adjust to match.

2. **Verify the dual-channel toggle layout (In-App + Email).** Each notification row has two shadcn `Switch` components — one for In-App and one for Email. Confirm the current platform uses the same two-column toggle pattern. If the current platform uses checkboxes instead of switches, keep switches as an acceptable shadcn improvement.

3. **Verify the column header alignment.** The prototype displays "Activity", "In-App", and "Email" as column headers above the toggle rows. Ensure these headers are right-aligned over their respective toggle columns for clean visual alignment across all 5 sections.
