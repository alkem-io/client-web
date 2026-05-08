# Page 14: Create Space — Figma Make Prompt

> **Action**: Delta fix — Verified against prototype visual state (code trace, June 2025)
> **Target files**: `src/app/pages/CreateSpaceSelectionPage.tsx`, `src/app/pages/CreateSpaceChatPage.tsx`, `src/app/components/dialogs/CreateSpaceDialog.tsx`, `src/app/App.tsx`, `src/app/components/layout/Sidebar.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

**What the prototype currently renders (Create Space flow):**
- **Route `/create-space`** → `CreateSpaceSelectionPage.tsx` (74 lines): Full-page centered layout with large "Create a New Space" title + 2 option cards in a grid:
  - Card 1: "Use Form" (FileText icon) → opens `CreateSpaceDialog` modal
  - Card 2: "Guided Creation" (MessageSquare icon + "New" sparkle badge) → navigates to `/create-space/chat`
- **Route `/create-space/chat`** → `CreateSpaceChatPage.tsx` (831 lines): AI-powered 10-step chat wizard for space creation. This is a full conversational UI that does NOT exist in the current platform.
- **`CreateSpaceDialog.tsx`**: Modal dialog with 3 views managed by state:
  - View "selection": "How would you like to start?" + same 2 cards (Use Form / Guided Creation with "AI" sparkle badge)
  - View "form": renders `CreateSpaceForm` sub-component
  - View "chat": expands to 95vw×90vh and renders `SpaceCreatorChat`

## Changes Required

1. **Delete `CreateSpaceChatPage.tsx` entirely** (831 lines). This AI-guided chat wizard does not exist in the current platform. Delete the file. Remove its route from `App.tsx` (the `<Route path="/create-space/chat" element={<CreateSpaceChatPage />} />` entry). Remove any imports of `CreateSpaceChatPage`.

2. **Delete `CreateSpaceSelectionPage.tsx` entirely** (74 lines). Since the AI wizard is removed, the selection page offering "Use Form" vs "Guided Creation" is no longer needed. Delete the file. Remove its route from `App.tsx`. Remove any imports.

3. **Simplify `CreateSpaceDialog.tsx` to show only the form view.** Remove the 3-view state management (`view: "selection" | "form" | "chat"`). The dialog should:
   - Open directly to the form (no "How would you like to start?" selection screen)
   - Remove the "Guided Creation" / AI card option
   - Remove the "chat" view and the `SpaceCreatorChat` import
   - Remove the dialog expansion logic (95vw × 90vh) that was for the chat view
   - Keep the standard dialog size for the form

4. **Update routing so "Create Space" opens the dialog.** Any sidebar link, button, or navigation that previously went to `/create-space` (the selection page) should instead trigger `CreateSpaceDialog` to open as a modal overlay. In `Sidebar.tsx`, change the Create Space nav item from a `<Link to="/create-space">` to a `<button onClick>` that sets dialog open state. The dialog can be rendered in the Sidebar or lifted to MainLayout.

5. **Verify the form fields in `CreateSpaceDialog` match the platform.** The dialog form should contain:
   - Header: "Create a new Space" + close X button
   - Form fields: Title/Name (required text input), URL slug (auto-generated from title, editable), Tagline (text input), Tags (pill-style multi-input)
   - Image uploads: Page Banner (1536×256px recommended) and Card Banner (416×256px recommended) as drag-and-drop zones with preview
   - Checkboxes: "Add Tutorials to this Space" + "I have read and accept the terms" (with clickable link)
   - Footer: Cancel button (`Button variant="outline"`) + Create button (`Button variant="default"`, disabled until form is valid)
   - Optional: "CHANGE TEMPLATE" ghost button in the header area
   
   Compare against the platform screenshot `create a space dialouge.png` and adjust any field mismatches.

6. **Clean up dead references.** After deleting the two files, search the entire codebase for remaining imports or references to `CreateSpaceChatPage`, `CreateSpaceSelectionPage`, `SpaceCreatorChat`, and the `/create-space/chat` route. Remove all of them.
