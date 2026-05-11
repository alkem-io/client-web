# Page 20: Space Settings — Templates Tab — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/components/space/SpaceSettingsTemplates.tsx`

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

1. **Verify templates are organized by category in collapsible sections.** The component should render within the Space Settings master layout (Page 15) and display: a "Templates" title with instructional text, a search `Input` + filter `Select` bar, and 5 collapsible sections using shadcn `Accordion`: Space Templates, Collaboration Tool Templates, Whiteboard Templates, Brief Templates, and Community Guidelines Templates. Each section header should show the category name, a count `Badge`, and a "+ CREATE NEW" `Button` (variant="outline"). Verify these 5 categories match the current platform's template taxonomy — adjust if the current platform uses different groupings.

2. **Verify template card structure.** Each template card should be a shadcn `Card` with: thumbnail image, template name, brief description, a category `Badge`, an enable/disable shadcn `Switch` toggle, and a `DropdownMenu` overflow (Preview, Edit, Delete, Duplicate). The cards should be in a responsive Tailwind grid within each collapsible section. Verify the current platform has Preview/Duplicate/Edit/Delete as the action set — remove any actions that don't exist in the current platform.

3. **Verify the collapsible section behavior.** Sections should use shadcn `Accordion` (not plain Collapsible) so only one section expands at a time, or verify whether the current platform allows multiple sections open simultaneously. If the current platform uses a flat list instead of collapsible sections, flag this for adjustment.
