# Design Brief (Figma Make Prototype): Ecosystem Analytics — Portfolio Network Explorer

> Note: This document is intended to live alongside the broader Alkemio redesign briefs.
> If another copy exists elsewhere, treat this one as the version to use in this folder.

**Goal**: Create an interactive prototype that feels like a real analytics tool for a Portfolio Owner: selecting Spaces, generating a clustered force graph, exploring connections via filters/search/details, and optionally overlaying the graph on a map.

**Important constraint**: Data can be fake, but interactions must feel real (drag/zoom, animated clustering changes, selection highlight, details drawer, progressive loading states).

**Access & privacy principle**: The prototype should communicate that users only see Spaces and related entities they are authorized to access. Cached data is protected and scoped to the signed-in user.

**Product positioning**: This is a **standalone tool** in the *Alkemio family* (not embedded in the main platform UI). The prototype should communicate “Ecosystem Analytics by Alkemio” and provide “Open in Alkemio” deep-link actions where relevant.

---

## 1) Primary User

**Portfolio Owner** (organization/portfolio-level stakeholder): wants fast insight across multiple initiatives without deep operational work.

Key questions to support:
- Which Spaces are isolated vs strongly connected?
- Which organizations/people connect multiple Spaces?
- If I follow a connector, what other accessible Spaces should I add to the view?

---

## 2) Prototype Structure (Screens / Frames)

### 2.0 Handoff from the Alkemio Prototype (Required for Demo Flow)

For the sake of the end-to-end demo, the Alkemio prototype must provide a clear way to “launch” Ecosystem Analytics, while still reinforcing that it is a separate tool in the Alkemio family.

**Recommended pattern (best for clarity)**: a **Launch tile/link** in a Portfolio Owner–relevant surface inside the Alkemio prototype:
- Location idea A: Portfolio Owner dashboard → card: “Ecosystem Analytics”
- Location idea B: Global header “App switcher” (Alkemio / Ecosystem Analytics)
- Location idea C: Top-right **profile menu** (click avatar) → “Switch app” section (Alkemio / Ecosystem Analytics)

**Prototype behavior**:
- Clicking “Ecosystem Analytics” navigates to the Ecosystem Analytics flow (Screen A or directly Screen B).
- Add a short transitional frame (optional but nice): “Opening Ecosystem Analytics…” with subtext “A standalone tool by Alkemio”.

**Profile menu app switcher (prototype-only UI)**:
- Both prototypes should have a top-right user avatar.
- Clicking the avatar opens a menu that includes a “Switch app” group:
  - “Alkemio”
  - “Ecosystem Analytics”
- The current app is visually indicated (e.g., checkmark + subdued style).
- Selecting the other app performs the prototype handoff (navigate to the other prototype’s entry frame).
- Keep the rest of the menu minimal (e.g., user name/email, “Help”, “Sign out” as non-functional items).

**Auth for prototype** (choose one and keep it consistent):
- Option 1 (cleanest): assume SSO is seamless → skip separate login and go straight to Space Selection (Screen B), showing the signed-in user in the top bar.
- Option 2 (explicit): show a 1-step identity gate (Screen A) with “Continue as {name}” to communicate Alkemio identity reuse.

**Important**: This handoff is for prototype/demo convenience; the tool should still feel directly accessible on its own.

### Screen A — Login / Identity Gate
- Minimal login screen with “Sign in with Alkemio” primary CTA.
- Secondary text: “This is a standalone tool. Your Alkemio account controls access.”
- After sign-in, go to Space selection.

**Access note (microcopy)**:
- “You’ll only see Spaces you are a member of.”

**States**:
- Default
- Loading
- Error (auth failed)

### Screen B — Space Selection (L0 only)
- Title: “Select top-level Spaces (L0) to analyze”
- Description: “You must be a member of a Space to include it.”
- Component: searchable multi-select list (checkbox list or tokenized multi-select).
- Each Space row shows:
  - Space name
  - Privacy badge (Public/Private)
  - Role badge (Member/Lead)
  - Optional: last activity timestamp or “health” indicator (fake)

**Primary CTA**: “Generate graph”

**Caching note (microcopy)**:
- “We’ll reuse cached data when available. You can refresh anytime.”

**Secondary actions**:
- “Load last selection”
- “Clear selection”

**Empty state**:
- If no memberships: show guidance + link-styled CTA “Request access / Join a Space” (non-functional).

### Screen C — Graph Explorer (Main)
A full-screen-ish analytics layout:

**Top bar**
- Left: breadcrumb: “Ecosystem Analytics / Portfolio Network”
- Center: Search input (typeahead feel)
- Right: “Refresh data” button + “Last updated: …” timestamp + user avatar (opens profile menu with the prototype app switcher)

**Data state indicator**
- Show a small status pill near the timestamp: “Cached” / “Refreshing” / “Up to date”.

**Left panel (Controls)**
- Space scope selector: shows selected L0 Spaces as removable chips
- Cluster mode dropdown:
  - Cluster by Space (default)
  - Cluster by Organization
- Filters (toggle switches):
  - Show People
  - Show Organizations
  - Show Subspaces
  - Show only Leads (optional)
- Graph controls:
  - Zoom in / out
  - Fit to view
  - Reset layout
- Map mode controls:
  - Toggle “Show map overlay”
  - Map dropdown (4–5 presets)
  - Toggle “Pin nodes with location to map” (optional)

**Main canvas (Graph)**
- A clustered force graph that visibly moves/settles.
- Clear node differentiation:
  - Spaces (L0/L1/L2): larger nodes with label + thumbnail/image when available (fallback to initials/icon)
  - Organizations: medium nodes, distinct color + logo mark when available (fallback to initials)
  - People: smaller nodes with avatar image when available (fallback to initials)
- Edge differentiation:
  - Parent-child (Space → Subspace): thin neutral link
  - Role edges (Member/Lead): thicker or color-coded, with subtle legend

**Right panel (Details drawer)**
- Appears when a node is clicked.
- Shows:
  - Node title + type badge
  - Mini “stats” row (counts)
  - List of connected entities (tabs: Neighbors / Spaces / Orgs / People)
  - CTA: “Add connected Space to graph” (only for accessible spaces)
  - CTA: “Open in Alkemio” (link-styled; non-functional)

**Overlay / modal**
- “Loading data…” progress overlay with stepper feel:
  - Acquire
  - Transform
  - Load

**Loading variations** (for realism)
- “Loading from cache…” (fast)
- “Refreshing data…” (slower, shows stepper)
- “Limited access: some related Spaces can’t be added” (informational callout, not an error)

---

## 3) Interaction Requirements (Must Feel Real)

### Professional quality bar (must not feel “prototype-janky”)
The graph must look and behave like a finished analytics product. Design the prototype so that, at the default zoom level:
- Nodes do **not overlap** when the layout has settled.
- Clusters are **visibly separated** (clear whitespace between cluster groups).
- Clicking is reliable: every node has a generous hit area (use an invisible hit target if needed; aim for a ~32px minimum tap/click target even for small nodes).
- Relationships are readable: selection/hover makes the relevant edges unmistakable, and everything else fades.

If the full dataset makes the canvas too dense, the prototype should intentionally reduce visual complexity (see “declutter” rules below) rather than showing a messy graph.

### Graph physics + direct manipulation
- Nodes drift and settle (continuous motion for a few seconds after load or cluster change).
- Dragging a node:
  - Node follows cursor smoothly.
  - On release, the graph gently re-stabilizes.
  - Edges remain visually connected to the node throughout movement (no “detached lines”). If true free-drag cannot keep edges attached in the prototype tool, use a stateful/animated reposition interaction (variants + Smart Animate) that preserves edge-to-node attachment.

### Zoom + pan
- Mouse wheel zoom (or plus/minus buttons).
- Click-drag pan on canvas.
- “Fit to view” animates camera/viewport to include all visible nodes.

### Cluster mode switching
- Switching “Cluster by” triggers a visible re-layout animation.
- Clusters should be separated with whitespace.
- Optional: show faint cluster labels/hulls (e.g., “Space: X” or “Org: Y”).

**Declutter rules (recommended)**
- Default to an “overview” density that is readable.
- Only show always-on labels for key nodes (e.g., selected L0 spaces + selected node). Show other labels on hover.
- Reduce edge clutter by default: show all edges faintly, but emphasize only the selected node’s neighborhood.
- If needed for clarity, show people/org nodes only after they become relevant (e.g., after a filter toggle, search, or selection) rather than rendering everything at full prominence.

### Selection + highlighting
- Click node:
  - Selected node becomes emphasized.
  - 1-hop neighbors are highlighted.
  - Connected edges become thicker/higher-contrast; optionally use arrowheads/markers only on highlighted edges.
  - Non-neighbor nodes and edges fade to low opacity.
- Click empty canvas:
  - Clears selection and restores full opacity.

**Relationship inspection (make links understandable)**
- Hover on a node previews its neighborhood: highlight the node + its direct edges lightly.
- Hover on an edge highlights the two endpoints and shows a small tooltip describing the relationship type (e.g., “Lead”, “Member”, “Parent-child”).
- In the details drawer, include a “Connection summary” line for the selected node (e.g., “Connects 3 Spaces • 12 People • 4 Orgs”).

### Search
- Typing highlights matching nodes (by display name).
- When a match exists:
  - Matches are highlighted.
  - Non-matches are dimmed.
  - Optional: auto-pan/zoom to first match.

### Filters
- Toggling node-type filters updates the canvas immediately.
- Filters should preserve selection if the selected node remains visible; otherwise selection clears.

### Map overlay mode
- When enabled:
  - A map appears behind the graph.
  - Nodes with location metadata visibly “snap” toward their geographic position (with easing), so the mode does something obvious.
  - Nodes without location remain in a small “Unlocated” cluster area or keep their force layout behavior, but are clearly indicated (e.g., different outline or a small “No location” tag in details).
- If location data is missing:
  - Nodes remain clustered normally.
  - UI displays a subtle note: “Some entities have no location set.”

**Map mode clarity rules**
- If too few entities have location, show an informational callout (not an error): “Map view is limited (most entities have no location).”
- If “Pin nodes with location to map” is enabled, show a visible pinned state (e.g., pin icon or anchored feel) and keep non-pinned nodes responsive to clustering forces.

### Permission-aware exploration (reflect the user story)
- “Add connected Space to graph” should only appear enabled when the Space is accessible.
- Inaccessible related Spaces are visible only as a disabled row with explanation copy (e.g., “Not accessible with your membership”).

### Expand graph interaction (must satisfy the Portfolio Owner story)
When a user expands the graph from the details drawer:
- Clicking “Add connected Space to graph” adds the Space and visibly introduces new nodes/edges (animated in).
- The camera/viewport gently pans/zooms to include the newly added cluster content.
- Show a brief inline loading state in the drawer (e.g., “Adding Space…”) and then a success confirmation (e.g., “Added to scope”).

---

## 3.1 Figma Make Guidance (How to Make It Feel “Real”)

This prototype is being generated in **Figma Make**, so treat the “graph” as a *designed, interactive visualization* rather than a physics simulation. The goal is to preserve the *feel* of a force graph without the messiness.

### Recommended approach: Pre-laid-out graph + stateful interactions
- Create a **Node component** with variants: Default / Hover / Selected / Dimmed.
- Use image fills where possible:
  - People nodes use avatar photos.
  - Space/Subspace nodes use a small cover image/thumbnail.
  - Provide an “image missing” fallback (initials/icon) that still looks intentional.
- Give each node a generous **invisible hit target** (bigger than the visible circle) so selection always works.
- Build **two layout variants** of the same graph:
  - Layout A: Cluster by Space
  - Layout B: Cluster by Organization
  Use **Smart Animate** between them to simulate re-clustering.
- For relationships, do not show all edges at full strength.
  - Default: edges are faint.
  - On hover: highlight just that node’s neighborhood.
  - On selection: highlight selected node + 1-hop neighbors; fade everything else.

**Critical for polish in prototypes**: ensure edges stay attached when nodes move.
- Prefer moving nodes via **layout/state changes** (variants + Smart Animate) rather than true freeform dragging if free-drag causes edges to detach.
- If you do allow “drag”, implement it as moving a grouped element (node + its connected highlighted edges) so lines visually remain connected.

### How to avoid “prototype-janky” overlap
- Keep the default dataset **smaller** than the theoretical maximum if needed (quality > quantity).
- Enforce clear cluster spacing: leave obvious whitespace between clusters.
- Show labels only for: selected node + selected L0 Spaces; everything else on hover.

### Map overlay that visibly does something
- Create two canvas variants:
  - Graph mode: clusters are grouped (overview).
  - Map mode: located nodes are repositioned to visible geo placements on the map.
- Include a small “Unlocated” mini-cluster area for entities without location.
- Add a note when coverage is limited: “Map view is limited (most entities have no location).”

### Copy/paste prompt for Figma Make

Use this as the instruction to regenerate Screen C:

> Build a professional analytics screen called “Portfolio Network” with a left control panel, a large interactive graph canvas, and a right details drawer.
> 
> The graph must be readable and polished: no overlapping nodes at rest, clusters separated by whitespace, and nodes must be reliably clickable with large invisible hit areas.
> 
> Provide two cluster modes (Space and Org) implemented as two layout variants and use Smart Animate to transition.
> 
> Interaction rules:
> - Hover a node: lightly highlight the node and its direct edges/neighbors.
> - Click a node: open the details drawer; highlight selected node + 1-hop neighbors; fade all other nodes/edges; make connected edges thicker/higher contrast.
> - Click empty canvas: clear selection and restore default.
> - If nodes can be moved/repositioned, edges must stay attached to nodes during movement (no detached lines). If needed, simulate movement using variants + Smart Animate instead of freeform drag.
> 
> Use images wherever possible:
> - People nodes use avatar photos (fallback to initials).
> - Space/Subspace nodes use a thumbnail/cover image (fallback to icon/initials).
> 
> Relationship clarity:
> - Default edges are faint.
> - On selection, show relationship types in the drawer (Member/Lead/Parent-child) and a connection summary (e.g., “Connects 3 Spaces • 12 People • 4 Orgs”).
> 
> Expand graph:
> - In the drawer, include a list of related Spaces with an “Add to graph” action for accessible Spaces and disabled rows for inaccessible ones.
> - When “Add to graph” is clicked, visibly introduce new nodes/edges (animate in) and keep the user’s context (filters + selection where possible).
> 
> Map overlay:
> - Add a toggle and a map dropdown.
> - When map overlay is enabled, reposition located nodes to plausible geo positions on the map so the mode visibly changes the layout.
> - Keep unlocated entities grouped in an “Unlocated” area and show a callout if most nodes lack location.

---

## 4) Visual Design Guidelines

- Professional analytics look: calm neutrals, clear typography, strong contrast for selected/highlighted states.
- Use subtle motion: easing, smooth transitions, no jarring jumps.
- Provide a legend for node and edge types.
- Emphasize readability: labels appear on hover and for selected nodes; avoid label clutter.

---

## 5) Fake Data Specification (Prioritize Known Data)

### Node Types (first pass)
1. **Space (L0)**
2. **Space (L1 / Subspace / Challenge)**
3. **Space (L2)**
4. **Organization**
5. **Person (User)**

Optional later node types (only if helpful in prototype):
- Virtual Contributor
- Topic/Tag

### Edge Types (first pass)
1. **Parent–Child**: Space → Subspace relationship
2. **Membership**: Person/Org → Space (member)
3. **Leadership**: Person/Org → Space (lead)

### Node metadata (for UI realism)
- All nodes: `id`, `type`, `displayName`, `url (optional)`
- Space nodes: `level (L0/L1/L2)`, `privacy (public/private)`, `lastActive (fake)`, `healthStatus (fake)`
- Person nodes: `avatar/initials`, `roleInSelectedSpaces (member/lead)`
- Org nodes: `logo/initials`, `orgType (fake)`
- Location (optional but important for map mode): `country`, `city`, `lat`, `long`

**Access metadata (for prototype logic)**
- Include a boolean on Space nodes to drive UI states: `isAccessible` (true/false)
- Include optional membership role label for display: `roleInSpace` (Member/Lead)

### Dataset size targets (for a convincing prototype)
- L0 Spaces: 3–6
- L1 Subspaces: 8–20
- L2: 10–30
- Orgs: 8–25
- People: 25–80
- Edges: enough to create a few dense clusters + some cross-links

Include deliberate patterns:
- 1–2 “bridge” organizations connecting multiple L0 spaces
- 1 isolated L0 space with minimal overlap
- A few “lead” edges that visibly stand out

---

## 6) Map Presets (Prototype)

Provide 4–5 selectable maps, e.g.:
- World
- Europe
- Netherlands (regions)
- Ireland (counties)
- (Optional) Custom/Blank grid map

Map selection should update immediately.

---

## 7) Copy (Microcopy)

- “Select Spaces you’re a member of.”
- “Generate graph” / “Refresh data”
- “Cluster by: Space / Organization”
- “Some entities have no location set.”
- “Last updated: {timestamp}”

---

## 8) What ‘Success’ Looks Like in the Prototype

A stakeholder can:
- Select 3 L0 spaces
- Watch the graph load and settle
- Switch cluster modes and see the layout reorganize
- Search for an org/person and see highlights
- Click a connector and see related spaces in the details drawer
- Toggle map overlay and switch maps

All without feeling like the UI is “static screenshots”.

---

## 9) Critical Edge Cases to Represent (Prototype States)

- No L0 memberships (empty state + guidance)
- Very large selection (show progress + keep controls usable)
- Stale cached data (timestamp is old; “Refresh data” suggested)
- Missing location data (map mode still works; callout shown)
