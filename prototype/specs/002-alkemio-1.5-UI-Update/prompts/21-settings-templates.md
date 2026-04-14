# Page 21: Space Settings — Storage Tab — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/components/space/SpaceSettingsStorage.tsx`

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

1. **Verify the storage usage meter is present and correctly styled.** The component should render within the Space Settings master layout (Page 15) and display: a "Storage" title with instructional text, and a storage usage section with a shadcn `Progress` bar (color-coded: green below 75%, yellow 75–90%, red above 90%) and usage text ("X GB / Y GB used"). Verify the current platform has a storage display in settings — if the current platform shows storage differently, adjust to match.

2. **Verify the documents table structure.** Below the usage meter: a search `Input` + type filter `Select` (Documents, Whiteboards, Images), a shadcn `Table` with sortable columns (Name, Type, Size, Uploaded By, Date, Actions), Lucide file-type icons per row, and a `DropdownMenu` (3-dot trigger) for row actions (Preview, Download, Delete). Pagination controls should appear below the table. Verify the current platform's table structure matches.

3. **Verify bulk selection is not over-engineered.** The prototype (398 lines) includes bulk selection with checkboxes and bulk actions. If the current platform does not support bulk file operations in storage settings, remove the `Checkbox` column and bulk action toolbar to keep the component closer to the current platform.
