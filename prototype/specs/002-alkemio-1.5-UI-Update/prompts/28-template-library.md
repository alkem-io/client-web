# Page 28: Template Library — Figma Make Prompt

> **Action**: Delta fix — Verified against prototype visual state (code trace, June 2025)
> **Target files**: `src/app/components/template-library/TemplateLibrary.tsx`, `src/app/pages/TemplateLibraryPage.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

**What the prototype currently renders (Template Library page):**
- Sticky header bar: "Template Library" title + subtitle + search input ("Search templates, packs, or keywords...")
- Section 1: "Template Packs" heading with count badge + subtitle, 3-column grid of PackCards (cover image h-40 with template count overlay, initials badge + name + author, description 2-line clamp, up to 3 tag badges), pagination with prev/next arrows (6 per page)
- Separator
- Section 2: "Templates" heading with count badge, category filter pills (All, Subspace, Collaboration Tool, Community Guidelines, Post, Space, Whiteboard), 4-column grid of TemplateCards (type-specific preview area h-44, type badge overlay, name + category, description 2-line clamp, optional "Part of [Pack Name]" badge), pagination with prev/next arrows (12 per page)
- NOTE: There is NO methodology content anywhere on this page — it's purely a browsable gallery

## Changes Required

1. **Replace custom category filter buttons with shadcn `ToggleGroup`.** The prototype uses custom styled `<button>` elements for the category filter pills (All, Subspace, Collaboration Tool, Community Guidelines, Post, Space, Whiteboard). Replace with a proper shadcn `ToggleGroup type="single"` component using `ToggleGroupItem` for each category. This ensures consistent selected/unselected/hover styling from the design system. Keep the same category labels.

2. **Replace prev/next arrow pagination with "Load more" buttons.** The prototype uses custom prev/next arrow pagination for both the Packs section (6 per page) and the Templates section (12 per page). Replace each with a single centered `Button variant="outline"` labeled "Load more" at the bottom of each section. This is simpler and matches the platform's progressive-disclosure pattern used elsewhere (e.g. activity feeds, post lists).

3. **Verify Template Packs section structure.** Confirm:
   - Section header: "Template Packs" with count badge in muted text + subtitle about curated sets
   - 3-column responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
   - Each PackCard: cover image/thumbnail (h-40), template count overlay on image, pack name (`CardTitle`), author name, description (2-line clamp), tag badges (up to 3)
   - Cards are clickable → navigate to `/templates/pack/:packId`
   - "Load more" button below (from change #2)

4. **Verify All Templates section structure.** Confirm:
   - `Separator` between sections
   - Section header: "Templates" with count badge
   - `ToggleGroup` filter (from change #1)
   - 4-column responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`)
   - Each TemplateCard: type-specific preview area (h-44 with visual varying by type — banner image for Space/Subspace, text rendering for Post, canvas mockup for Whiteboard, etc.), type `Badge` overlay, template name, category text, description (2-line clamp)
   - Cards are clickable → navigate to `/templates/:templateId`
   - "Load more" button below (from change #2)

5. **Verify search functionality.** The full-width `Input` with Lucide `Search` icon should filter both packs AND templates simultaneously as the user types. Confirm this filters by name, description, and tags/keywords.
