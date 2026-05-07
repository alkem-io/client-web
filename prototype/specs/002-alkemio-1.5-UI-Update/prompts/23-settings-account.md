# Page 23: Space Settings — Account Tab — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/components/space/SpaceSettingsAccount.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

## Changes Required

No structural changes required. This is a compact component (200 lines) with read-only informational sections. Verify the following:

1. **Verify the URL section.** The component should render within the Space Settings master layout (Page 15) and display: an "Account" title with instructional text "Here you find all your Spaces…", and a URL section showing the space URL as read-only text (or a disabled `Input`) with a copy-to-clipboard `Button` (variant="ghost", size="icon", Lucide `Copy` icon). Verify the current platform displays the space URL in settings.

2. **Verify the License card section.** A shadcn `Card` showing: the license name ("Free", "Plus", or "Premium") as a heading, a bullet list of license features, a capacity indicator ("2/5 spaces used") optionally with a `Progress` bar, and a "Change the Space License" `Button` (variant="outline"). Verify the current platform shows license/plan information in settings — if the current platform does not show license details, flag for review.

3. **Verify the Host section and overall read-only structure.** A Host section with: a shadcn `Avatar` (with fallback initials), the host name, a role label in muted text, and a "Change Host" `Button` (variant="outline", admin-only). Below all sections: a "Contact Alkemio" `Button` (variant="link"). All sections should be informational/read-only with no inline editing. Verify the current platform shows host/owner information in the account settings tab.
