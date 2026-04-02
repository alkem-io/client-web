# Page 32: Platform Search Overlay — Figma Make Prompt

> **Action**: Full build
> **Target files**: `src/app/components/search/PlatformSearch.tsx` (new), `src/app/components/layout/Header.tsx` (wire up trigger)

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

This component does NOT exist yet. The Header already has a search input (rounded-full with a Search icon) but it is purely visual — clicking or typing does nothing. You need to build the full Platform Search overlay from scratch and wire it to the existing header search input.

## Full Build Description

### 1. Trigger — Wire up the Header search input

In `Header.tsx`, the existing search `Input` should open the Platform Search overlay when clicked or when the user starts typing. Add an `onClick` handler (and optionally a keyboard shortcut like `Cmd+K` / `Ctrl+K`) that opens the search overlay. The header input itself does NOT perform search — it only triggers the overlay.

### 2. Overlay Container

Create a near-fullscreen overlay using shadcn `Dialog` (or a custom overlay with `z-[50]` and a dimmed backdrop). The overlay should:
- Cover most of the viewport (e.g. `max-w-5xl w-full max-h-[85vh]` centered, or true fullscreen)
- Have a dimmed/blurred backdrop
- Be closable via the X button (top-right) or pressing Escape
- Trap focus inside the overlay

### 3. Search Header (top of overlay)

A full-width row at the top:
- Lucide `Search` icon (left, muted)
- shadcn `Input` — large, auto-focused, placeholder "Search Alkemio..."
- Close `Button variant="ghost" size="icon"` with Lucide `X` (right)

When the user types a query and presses Enter, the query is converted into a search tag.

### 4. Search Tags Row

Below the search input, a horizontal wrapping row of search tag pills:
- Each tag: shadcn `Badge` with the tag text + an X button to remove it (e.g. `[innovation ×]`)
- At the end of the row: a `Button variant="outline" size="sm"` labeled "+ Add tag" (or the input itself serves as the tag adder)
- Layout: `flex flex-wrap gap-2`
- Pressing Enter in the search input adds the current text as a new tag and clears the input
- Removing all tags resets to the initial empty state
- Search results update whenever tags change

### 5. Two-Column Body

Below the tags row, a two-column layout filling the remaining height:

#### 5a. Category Sidebar (left, ~200px fixed width)

A vertical list of category filters:
- **All** (selected by default) — shows count of total results
- **Spaces** — count of space results
- **Posts** — count of post results
- **Responses** — count of response results
- **Users** — count of user results
- **Organizations** — count of organization results

Each category item: clickable row with category name (left) and result count `Badge variant="secondary"` (right). The selected category has a highlighted background (`bg-accent`) or a left border indicator. Use shadcn `RadioGroup` for semantics, or a styled vertical button list.

When "All" is selected, the results pane shows grouped sections for every category. When a specific category is selected, only that category's results are shown (expanded, with more results visible).

**Scope dropdown** (conditional): When the user is inside a Space context, show a `Select` dropdown at the top of the sidebar: "Search in: All / This Space / This Subspace". This scopes the search. Only visible when a space context exists.

#### 5b. Results Pane (right, flex-1, scrollable)

The main results area. When "All" is selected, it shows multiple sections stacked vertically. When a specific category is selected, it shows only that category's results.

**Each results section contains:**
- Section header: category name + count as heading (e.g. "Spaces (12)"), separated by a `Separator`
- Results grid: 3-column card grid (`grid grid-cols-3 gap-4`) showing the first 3–6 results
- "See all [category] →" `Button variant="link"` at the bottom of each section (switches sidebar to that category)
- Per-section sort/filter: a small `Select` dropdown (e.g. "Sort: Relevance / Recent / Alphabetical") aligned right of the section header

### 6. Result Card Types (one per category)

**Space Card** (reuse from BrowseSpacesPage):
- shadcn `Card` with banner image (small, 16:9), space `Avatar` overlapping bottom-left, space name (`CardTitle`), tagline/description (`CardDescription`), member count with Lucide `Users` icon
- Clickable → navigates to Space Home

**Post Card:**
- shadcn `Card` with: post title (`CardTitle`, bold), excerpt text (2-line clamp, `CardDescription`), author row (`Avatar` small + author name + relative timestamp), and the parent space name as muted text
- Clickable → opens PostDetailDialog

**Response Card:**
- shadcn `Card` with: response title (`CardTitle`), excerpt (2-line clamp), author row (`Avatar` small + author name + timestamp), parent post title as muted link text
- Clickable → opens ResponseDetailDialog

**User Card:**
- shadcn `Card` with: user `Avatar` (large, centered or left-aligned), user display name (`CardTitle`), role or bio excerpt (`CardDescription`), location or organization as muted text
- Clickable → navigates to User Profile

**Organization Card:**
- shadcn `Card` with: organization `Avatar`/logo, organization name (`CardTitle`), description excerpt (`CardDescription`), member count
- Clickable → navigates to Organization page

### 7. Load More (per section)

Each section (when expanded via category selection) shows a `Button variant="outline"` labeled "Load more [category]" at the bottom. Clicking it appends more results. When viewing "All", the "See all →" link replaces load more.

### 8. Empty and Edge States

**Initial state** (overlay opened, no tags yet):
- Show a centered message: Lucide `Search` icon (large, muted), "Search across all of Alkemio" heading, "Type a query and press Enter to search" as muted text
- Optionally show recent searches or popular tags as clickable suggestions

**No results state** (tags entered but nothing found):
- Centered empty state: Lucide `SearchX` or `FileQuestion` icon (large, muted), "No results found" heading, "Try different search terms or remove some tags" as muted text, "Clear all tags" `Button variant="outline"`

**Loading state** (while search is in progress):
- Replace the results pane with a loading indicator: Lucide `Loader2` with `animate-spin` centered, or skeleton cards in a 3-column grid (3–6 skeleton `Card` placeholders per section)

**Single-category empty** (a specific category has 0 results):
- When viewing "All", omit that section entirely
- When that category is selected in the sidebar, show: "No [category] found" muted text centered in the results pane

### 9. Mock Data

Create mock search results with realistic Alkemio content:
- 8–12 mock spaces (reuse names/descriptions from existing mock data if available)
- 6–10 mock posts with titles, excerpts, authors
- 4–8 mock responses with titles, excerpts, parent post references
- 6–10 mock users with names, roles, avatars
- 3–5 mock organizations with names, descriptions
- Filtering by tags should narrow results (simple client-side substring match on titles/descriptions)

### 10. Keyboard Navigation

- `Cmd+K` / `Ctrl+K` opens the overlay from anywhere in the app
- `Escape` closes the overlay
- `Enter` in the search input adds a tag
- `Tab` moves focus between sidebar categories and result cards
- Arrow keys navigate the category sidebar
