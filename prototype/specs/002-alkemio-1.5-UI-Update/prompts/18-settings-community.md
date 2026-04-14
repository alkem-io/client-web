# Page 18: Space Settings — Community Tab — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/components/space/SpaceSettingsCommunity.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

## Changes Required

No structural changes required. This is a 797-line component — verify it does not over-engineer beyond the current platform. Verify the following:

1. **Verify the member management table matches the current platform.** The component should render within the Space Settings master layout (Page 15) and display: a "Community" title with instructional text, a "Pending Applications & Invitations" section with a shadcn `Table` (columns: Name, Email, Date, Status, Actions), shadcn `Badge` for status (Pending/Invited/Approved), and a shadcn `DropdownMenu` (3-dot trigger) for row actions (Approve, Reject, Resend). Verify that the status values match what the current platform actually uses — the prototype may have richer statuses (Active/Pending/Invited/Suspended) than the current platform supports.

2. **Verify the collapsible sections exist and match the current platform.** Below the table, there should be 5 collapsible sections using shadcn `Accordion` or `Collapsible`: Application Form (edit link), Community Guidelines (edit/view link), Applicable Organizations (org list + "+ Add Organization" button), Virtual Contributors (VC list + "+ Add VC" button), and Member Roles & Permissions (informational). Confirm the current platform actually has all 5 sections — if any are missing in the current platform, flag them.

3. **Verify search and filter controls are not over-engineered.** The prototype has member search and status filtering in settings. Confirm the current platform has these controls. If the current platform lacks search/filter in community settings, consider simplifying to match.
