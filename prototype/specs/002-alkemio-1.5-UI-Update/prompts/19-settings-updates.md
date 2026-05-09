# Page 19: Space Settings — Subspaces Tab — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/components/space/SpaceSettingsSubspaces.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

## Changes Required

No structural changes required. This is a 576-line component — verify against the current platform for potential over-engineering. Verify the following:

1. **Verify the Default Subspace Template section.** The component should render within the Space Settings master layout (Page 15) and display: a "Subspaces" title with instructional text "Edit the Subspaces in this Space…", a "Default Subspace Template" section with a template shadcn `Card` (thumbnail, name, description) and a "Change Default Template" shadcn `Button` (variant="outline"). Verify the current platform's template assignment flow matches — the prototype may use a card grid modal for template selection that is more complex than the current platform.

2. **Verify the subspace card grid matches the current platform.** Below the template section: a "Subspaces" header with count `Badge` and a "+ CREATE SUBSPACE" primary `Button`, a search `Input`, and a responsive Tailwind grid of subspace `Card` components (each with image, name, description, status `Badge`, and `DropdownMenu` overflow with Edit/Archive/Delete actions). Verify the current platform has Archive/Delete actions for subspaces in settings.

3. **Verify grid/list view toggle is not a new addition.** The prototype includes a grid/list view toggle and status filters. If the current platform does not have view switching or status filters in subspace settings, remove these controls to match the current platform.
