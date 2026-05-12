# Page 5: Knowledge Base Tab — Figma Make Prompt

> **Action**: Delta fix — Verified against prototype visual state (code trace, June 2025)
> **Target files**: `src/app/pages/SpaceKnowledgeBase.tsx`, `src/app/components/space/SpaceResourcesList.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

**What the prototype currently renders (Knowledge Base tab):**
- SpaceResourcesList inside the standard SpaceHome layout (header + sidebar + tabs)
- Header row: "Knowledge Base" title with subtitle + "New Folder" button + "Upload File" button
- Toolbar: Search input ("Search resources...") + category filter badges (All, Reports, Planning, Guidelines inline + "More" dropdown with Design, Assets, Meeting Notes)
- Full data TABLE with 6 columns: Name (40%, file-type icon + name), Category (Badge), Uploaded By (Avatar + name), Date, Size (monospace), Actions (3-dot menu: Download, Rename, Move to Folder, Delete)
- 6 mock resource rows (Q1 Sustainability Report, Project Roadmap 2024, etc.)
- Empty state: search icon + "No resources found matching your search."

## Changes Required

1. **Replace the entire data table with a responsive card grid.** The prototype uses a shadcn `Table` component with `TableHeader`, `TableBody`, `TableRow`, `TableCell`, sortable columns, and row-level `DropdownMenu` actions. This is a major divergence from the platform. Remove the entire table and replace with a responsive card grid using `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`.

2. **Each resource card should use shadcn `Card` with this structure:**
   - Large file-type icon at the top of the card: Lucide `FileText` for documents/reports, `Link` for links, `PenTool` for whiteboards, `Image` for images/photos. Use color-coding similar to the current table icons (red for PDF, green for spreadsheet, blue for doc, purple for link, orange for image).
   - Resource name as `CardTitle` (clickable, opens the resource)
   - Short description text (1-2 lines, `line-clamp-2`, muted color)
   - Author row at the bottom: small `Avatar` with initials + "Uploaded by [Name]" + relative date ("3 days ago")
   - Clicking the card opens/navigates to the resource (no separate action buttons on the card)

3. **Remove all table-specific functionality.** Delete: `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableCell` imports and JSX, column sorting state and click handlers, sort indicator arrows, per-row `DropdownMenu` (Download, Rename, Move, Delete actions), column width percentages, `TableHead` components. None of this exists in the card layout.

4. **Simplify the action buttons.** Replace the two separate buttons ("New Folder" + "Upload File") with a single "+ Add Resource" button (`Button variant="default"` with Lucide `Plus` icon). This matches the platform's simpler approach.

5. **Simplify the category filter.** Replace the inline badge buttons + "More" dropdown pattern with either:
   - A shadcn `Select` dropdown with options: All, Documents, Links, Whiteboards
   - OR simple filter pills/`ToggleGroup` with: All | Documents | Links | Whiteboards
   Remove the granular categories (Reports, Planning, Guidelines, Design, Assets, Meeting Notes) and use broader type-based categories.

6. **Keep the search input.** The search `Input` with Lucide `Search` icon is correct. Keep it. Just ensure it filters the cards (not table rows).

7. **Add a "Show more" button** at the bottom of the card grid (`Button variant="outline"`, full-width or centered) for pagination. Remove any table-specific pagination if present.
