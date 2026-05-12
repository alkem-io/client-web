# Page 27: Response Panel — Full Overlay Modal (Level 3) — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/components/dialogs/ResponseDetailDialog.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

This dialog is already built (~270 lines). It is a centered overlay modal (Level 3) that opens ON TOP of the PostDetailDialog (Level 2) using `z-[60]`. This is the response detail view the platform uses — there is NO sliding side-panel variant. It shows the full response content, a comments thread, and navigation between responses.

## Changes Required

1. **Verify modal stacking.** The ResponseDetailDialog must open on top of the PostDetailDialog with a higher z-index (`z-[60]` or similar). The backdrop should dim the Level 2 dialog behind it. Confirm the stacking and overlay behavior.

2. **Verify modal header.** Contains: back arrow `Button variant="ghost" size="icon"` (left), Share icon button (right), Close (X) icon button (right). Confirm present.

3. **Verify response content area.** Inside a scrollable region: response title as large bold heading, author row (`Avatar` + author name + relative timestamp "2 days ago"), full rich text body (prose styling), media attachments (images, embeds), and content tags as `Badge` components. Confirm structure.

4. **Verify author controls.** If the current user is the author, Edit and Delete buttons should appear (conditional rendering based on `isAuthor`). Confirm these are conditional, not always visible.

5. **Verify peer responses preview strip.** A horizontal scrollable row of small contribution `Card` components showing other responses to the same post. This lets users browse sibling responses without closing the modal. Confirm present.

6. **Verify comments section.** Separated by a `Separator`. Section header "Comments (N)". Each comment: `Avatar` (small) + user name + comment text + timestamp + "Reply" `Button variant="ghost"`. "Load more" `Button variant="outline"` for pagination. Same pattern as PostDetailDialog comments. Confirm present.

7. **Verify sticky comment input.** Pinned to bottom: `Textarea` with placeholder, emoji picker trigger, @ mention trigger, Send button. Confirm present and sticky.

8. **Verify response navigation.** At the bottom of the modal: "← Previous" `Button variant="outline"`, a centered position indicator ("Response 3 of 8" as muted text), and "Next →" `Button variant="outline"`. This lets users step through responses without closing. Confirm present and functional.
