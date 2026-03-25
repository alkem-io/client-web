# Page 16: Settings — About Tab (+ Layout Tab) — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/components/space/SpaceSettingsAbout.tsx`, `src/app/components/space/SpaceSettingsLayout.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

## Changes Required

No structural changes required. The Layout settings tab (drag-drop editor) is a new feature the stakeholder wants — keep it. Verify the following:

1. **Verify the About tab form structure matches the current platform.** The `SpaceSettingsAbout.tsx` component (300 lines) renders within the Space Settings master layout. It should contain: title "About" with instructional text, Page Banner upload (1536×256px), Card Banner upload (416×256px), three rich text editor sections (What, Why, Who) using ReactQuill, a tag chip input system, a references list (Title + URL fields with "Add Reference" button), and a live SpaceCard preview on the right side. Compare the form fields against the current platform's Space Settings > About page. If the current platform omits the live preview card, keep it as an acceptable enhancement.

2. **Keep the Layout tab (`SpaceSettingsLayout.tsx`) as-is.** This is a drag-and-drop layout editor that allows space admins to customize the arrangement of sections on their space page. This is a new feature the stakeholder has explicitly requested. Do not modify or remove it. Ensure it appears in the sidebar navigation under SPACE IDENTITY → Layout, and loads correctly when the "Layout" nav item is clicked.

3. **Verify image upload zones have clear affordance.** Both banner upload areas should show: a dashed border container, an upload icon (Lucide `Upload` or `Image`), helper text with the required dimensions, and a hover state that highlights the drop zone. If a banner is already set, show the image preview with a "Change" overlay button.
