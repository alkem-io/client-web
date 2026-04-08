# Page 17: Space Settings — Layout Tab — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/components/space/SpaceSettingsLayout.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

## Changes Required

No structural changes required. This is an **entirely new feature** — the current platform does not have a "Layout" settings tab with drag-and-drop tab reordering. The stakeholder has approved keeping this as an allowed enhancement. Verify the following:

1. **Verify the Layout tab renders within the Space Settings master layout (Page 15).** The component should display inside the content area of `SpaceSettingsPage.tsx` when the "Layout" sidebar item is selected. It should show the title "Layout" with instructional text "Customize your Space's navigation tabs" at the top.

2. **Verify the 4 draggable tab cards are correctly structured.** Each card should be a shadcn `Card` containing: a Lucide `GripVertical` drag handle on the left, a tab icon (Home, Community, Subspaces, Knowledge Base), the tab name as editable text, a position label ("1st", "2nd", etc.) in muted text, and a pencil edit `Button` (variant="ghost", size="icon") on the right. Cards should stack vertically with `flex flex-col gap-3`.

3. **Verify the footer buttons are present.** The bottom of the tab should have a "Reset to Default" button (shadcn `Button` variant="outline") on the left and a "Save Changes" button (shadcn `Button` variant="default") on the right. Both should be in a flex row with `justify-between`.
