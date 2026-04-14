# Page 12: Organizations Tab — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/pages/UserOrganizationsPage.tsx`

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

1. **Verify the organization card grid matches the current layout.** Compare against the actual organizations page (screenshot `profile settings > organisations.png`). Each card should show: organization avatar, name, location, associate count, and a verified badge where applicable. The prototype uses cover images with gradient overlays on org cards — if the current platform does NOT use cover images on org cards, remove the cover image area and use a simpler card layout with just the avatar, name, and metadata.

2. **Verify the "Create Organization" dialog fields.** The prototype's inline dialog includes: Organization Name (required), Tagline, Location, and Website. Confirm these fields match the current platform's create organization flow. Add or remove fields as needed.

3. **Verify the DropdownMenu actions match current functionality.** The prototype offers "View Profile", "Manage Settings", and "Disassociate" in the overflow menu. Confirm the current platform provides similar per-organization actions. If "Manage Settings" is not available from this page, remove it.
