# Page 25: Post Detail Dialog (Level 2) — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/components/dialogs/PostDetailDialog.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

This dialog is already built (~250 lines). It is a near-fullscreen modal (`max-w-5xl max-h-[90vh]`) that opens when a user clicks a post title from Space Home or a Subspace page. It contains a sticky header bar, scrollable post content, response/contribution cards, a comments section, and a sticky comment input.

## Changes Required

1. **Verify sticky header bar (64px).** The header must contain: a back/close arrow (left), the truncated post title (center), and Share + MoreVertical DropdownMenu + X close icons (right). All icons use `Button variant="ghost" size="icon"`. Confirm this matches.

2. **Verify post content area.** Below the header, inside a scrollable region: post title as `h1` (large, bold), author row (`Avatar` + author name + relative timestamp like "4 days ago"), then full rich text body (prose styling). Confirm structure is correct.

3. **Verify reactions bar.** Below the post body there should be emoji-style reaction indicators with counts (e.g. Lightbulb, Heart, Bookmark). These use small icon buttons with count labels. Confirm present and styled.

4. **Verify Contributions section.** A section headed "Contributions (N)" with a type filter (`ToggleGroup` or pill buttons: All / Posts / Whiteboards / Collections). Below the filter, a horizontal scrollable row of response `Card` components (4 visible on desktop). Each card shows a thumbnail/icon, title, author avatar, and date. Cards are clickable and open the ResponseDetailDialog (Level 3). A "See all responses" `Button variant="link"` appears below the row. Confirm all elements present.

5. **Verify comments section.** Visually separated from contributions by a `Separator`. Section header "Comments (N)". Each comment: `Avatar` (small) + user name + comment text + relative timestamp + "Reply" `Button variant="ghost"`. A "Load more comments" `Button variant="outline"` for pagination. Confirm layout.

6. **Verify sticky comment input.** Pinned to the bottom of the dialog: a `Textarea` placeholder "Type your comment here...", emoji picker trigger (Popover), @ mention trigger, and Send `Button variant="ghost" size="icon"`. Confirm present and sticky.

7. **Remove "Key Discussion Points" section if present.** This structured section does not exist in the current platform. If the prototype contains a "Key Discussion Points" or similar structured breakdown section between the post body and the contributions, remove it entirely.
