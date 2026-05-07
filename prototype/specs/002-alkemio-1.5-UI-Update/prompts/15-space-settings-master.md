# Page 15: Space Settings Master Layout — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/pages/SpaceSettingsPage.tsx`, `src/app/components/space/SpaceSettingsSidebar.tsx`

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

1. **Verify the sidebar navigation groups and items match the current platform.** The prototype groups settings into: SPACE IDENTITY (About, Layout), MEMBER MANAGEMENT (Community, Subspaces), CONTENT & RESOURCES (Templates, Storage), and ADVANCED (Settings, Account). Compare against the current platform's space settings sidebar. If the current platform uses different group names or a different tab order, adjust accordingly. The sidebar should be ~200-250px wide, fixed on desktop, and use a shadcn `Sheet` for mobile.

2. **Verify the "Back to Space" navigation link exists and works.** The prototype has a "Back to Space" link at the top of the sidebar or header area. Confirm this matches the current platform's pattern for exiting settings. If the current platform also has a "Quit Settings" button, ensure both are present.

3. **Verify the content area wrapper styling.** The main content area uses `bg-card border rounded-xl p-6 md:p-8 shadow-sm min-h-[500px]`. Confirm this card-style wrapper is appropriate for the space settings content. The content should fill the remaining width to the right of the sidebar and render the active settings tab component (About, Layout, Community, Subspaces, Templates, Storage, Settings, or Account).
