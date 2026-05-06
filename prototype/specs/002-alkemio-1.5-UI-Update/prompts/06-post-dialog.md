# Page 6: Add Post Dialog — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/components/space/AddPostModal.tsx`

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

1. **Dialog size and structure are correct.** The modal should be large (~max-w-3xl, up to 90vh height) with a shadcn `Dialog` wrapper, `DialogHeader` with title "Create a Post" and close button, scrollable `DialogContent`, and a sticky `DialogFooter` with Cancel (outline) and Post (primary) buttons. Verify the title input is styled as a borderless heading input.

2. **The attachment toggles match the platform's content types.** The prototype has toggles for Whiteboard, Memo, Call to Action, and Image. The current platform's post creation may have simpler options (Whiteboard + Collection). Verify the toggle options are not adding content types that don't exist in the platform — remove any that are fabricated.

3. **The "Save Draft" button may not exist in the current platform.** If there is a "Save Draft" button in the footer alongside Cancel and Post, verify whether the current platform supports draft saving. If not, remove the Save Draft button and keep only Cancel + Post.
