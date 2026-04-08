# Page 10: My Profile Tab — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/pages/UserProfileSettingsPage.tsx`

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

1. **Verify the two-column layout (avatar left, form right) matches the current platform.** The prototype places the avatar section in a fixed-width left column (w-64) with a camera overlay and "Change Avatar" button, and the form fields in a flex-1 right column. Compare against the actual profile settings page (screenshot `profile settings > my profile.png`). If the current platform uses a single-column layout with the avatar inline, adjust accordingly.

2. **Verify identity fields match the current form.** The prototype includes First Name, Last Name, Email (read-only), and Organization. Confirm these fields exist in the current platform's profile editor. If the current platform also has a "Nickname" or "Display Name" field, add it. If the current platform omits Organization, remove it.

3. **Verify the sticky save button behavior is appropriate.** The prototype has a sticky "Save Changes" button on mobile that floats at the bottom of the viewport. This is an acceptable enhancement — keep it. Ensure the desktop version shows the button at the bottom of the form (not sticky).
