# Page 31: Browse All Spaces (Explore) — Figma Make Prompt

> **Action**: Verify & keep
> **Target files**: `src/app/pages/BrowseSpacesPage.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

The Browse All Spaces page is already built (~1055 lines). It is a full-page layout with a search & filter bar, sort selector, filter dropdown with checkbox items, active filter chips, a responsive card grid, SpaceCard components (with loading skeletons), a "Load More" button with simulated network delay, and an empty state. It uses 25 mock spaces.

## Changes Required

1. **Verify page header.** Title "Explore Spaces" as a large heading, subtitle "Discover spaces and join the conversation" as muted text. Confirm present.

2. **Verify search and filter bar.** Full-width shadcn `Input` with Lucide `Search` icon and a clear button. To the right: a `Select` for sort order (Recent, Alphabetical, Members, Activity) and a `DropdownMenu` for filters with checkbox items grouped by Privacy (Public/Private) and Type (Spaces/Subspaces). Confirm present and functional.

3. **Verify active filter chips.** When filters are applied, removable `Badge` pills should appear below the search bar showing each active filter. Each chip has an X button to remove that filter. Confirm present.

4. **Verify results count.** Below the filters: "Showing X of Y spaces" as muted text. The count should update when filters are applied. Confirm present.

5. **Verify SpaceCard component.** Each card in the grid uses the same `SpaceCard` structure shared across Dashboard, Subspaces Tab, and this page. Card structure: banner image (16:9 aspect ratio), privacy `Badge` overlay (if private), space `Avatar` overlapping the banner bottom edge (negative margin), space name (`CardTitle`), description/tagline (`CardDescription`), lead organization avatars, tags as `Badge` components, member count with Lucide `Users` icon. Cards are clickable and navigate to Space Home. Confirm structure matches.

6. **Verify responsive grid.** The card grid should use responsive CSS grid (auto-fill with `minmax(280px, 1fr)`) giving approximately 4 columns on desktop, 2 on tablet, 1 on mobile. Confirm responsive behavior.

7. **Verify "Load More" button.** At the bottom of the grid: `Button variant="outline"` labeled "Load more spaces". Clicking it should append more cards to the grid (currently simulates a 600ms network delay). Confirm present.

8. **Verify empty state.** When no spaces match the current filters, show an empty state: dashed border card with a Lucide `FolderOpen` icon, explanatory text, and a "Clear filters" CTA button. Confirm present.

9. **Verify SpaceCardSkeleton.** While loading, skeleton placeholder cards should appear in the grid. Confirm loading state exists.
