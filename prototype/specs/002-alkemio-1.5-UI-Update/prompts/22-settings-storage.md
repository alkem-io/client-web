# Page 22: Space Settings — Settings Tab — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/components/space/SpaceSettingsSettings.tsx`

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

1. **Verify the Visibility and Membership radio groups.** The component should render within the Space Settings master layout (Page 15) and display: a "Settings" title with instructional text, a Visibility section with a shadcn `RadioGroup` (Public / Private — each option with a descriptive help text in muted color), and a Membership section with a shadcn `RadioGroup` (No Application Required / Application Required / Invitation Only — each with descriptive help text). Verify the current platform's visibility options match — the prototype has "Public / Members Only / Private" which may differ from the brief's "Public / Private". Adjust to match the current platform.

2. **Verify the Allowed Actions toggle grid.** Below the membership section: 7 action rows, each with an action label (font-semibold), a description (text-muted), and a shadcn `Switch` toggle. The 7 actions are: Space Invitations, Create Posts, Video Calls, Guest Contributions, Create Subspaces, Subspace Events, and Alkemio Support. Verify these 7 actions match the current platform's permission switches — remove or add any that differ.

3. **Verify the Danger Zone section.** At the bottom: a section with a red-styled border (`border-destructive`), a "Danger Zone" heading in `text-destructive`, warning text, and a "DELETE THIS SPACE" shadcn `Button` (variant="destructive"). Clicking the delete button should open a confirmation dialog (shadcn `AlertDialog`). Verify the current platform has this delete functionality with a confirmation step.
