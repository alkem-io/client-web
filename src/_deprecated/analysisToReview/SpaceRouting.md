# Space Domain Routing Overview

This document summarizes the routing logic for the space domain. It describes the key routing components, the structure of the paths used, and how pages and dialogs are connected within the domain.

---

## Routing Components

1. **EntityPageLayout & SpaceRoute**

   - **Purpose:** Acts as the main page container for space pages.
   - **Usage:**
     - The `SpaceRoute` (or its equivalent) renders an `EntityPageLayout` component.
     - Inside the layout, a tabbed navigation (using `SpaceTabsPlaceholder`) is provided to switch between sections (e.g., About, Dashboard, Subspaces).
   - **Paths:**
     - Base space URL (e.g., `/spaces/:spaceId`) loads the layout.
     - Sub-paths such as `/about`, `/dashboard`, and `/subspaces` are used as internal segments.

2. **SpaceAboutPage & SubspaceAboutPage**

   - **Purpose:**
     - `SpaceAboutPage` shows detailed information for a space.
     - `SubspaceAboutPage` renders similar content for subspaces.
   - **Routing & Navigation:**
     - Both pages are accessed from the corresponding tabs.
     - They rely on components like `JourneyBreadcrumbs` for navigation “breadcrumbs”.
     - They integrate back-navigation logic (using `useBackWithDefaultUrl`) to return to a parent route.
   - **Paths:**
     - Typically accessed via `/spaces/:spaceId/about` for space and similar for subspace routes.

3. **SpaceSettingsRoute (and related)**

   - **Purpose:**
     - Handles the settings section for a space.
   - **Usage:**
     - When the settings tab is selected, the settings route renders components such as `SpaceAboutDialog` (for editing information) and other admin views (e.g. SpaceAccountView).
   - **Paths:**
     - A dedicated route segment e.g. `/spaces/:spaceId/settings` directs the user to settings.

4. **Back and Dialog Navigation**
   - **Back Navigation:**
     - Hooks like `useBackWithDefaultUrl` are used in both SpaceAboutPage and SubspaceAboutPage to return to a parent URL (often the profile URL from space/about).
   - **Dialog Routing:**
     - Certain dialogs (e.g. `SpaceAboutDialog`) are opened as part of the routing flow.
     - They are rendered within a layout (often inside `StorageConfigContextProvider`) so that the “about” section overlays the page.

---

## Routing Relationships & Path Details

- **Main Layout:**
  - The main space routing component renders an `EntityPageLayout` containing common elements:
    - **Breadcrumbs:** Provided by `JourneyBreadcrumbs` that reflect the current journey path.
    - **Tabs:** Using `SpaceTabs`/`SpaceTabsPlaceholder`, different segments such as About, Dashboard, Subspaces are reachable.
- **About Section:**
  - **SpaceAboutPage:**
    - Loads data via `useSpaceAboutDetailsQuery`.
    - Displays a banner (`SpacePageBanner`) and passes control to `SpaceAboutDialog`.
    - **URL example:** `/spaces/123/about`
  - **SubspaceAboutPage:**
    - Similar structure as SpaceAboutPage but uses `useSubSpace` context.
    - **URL example:** `/spaces/123/subspace/456/about`
- **Settings & Administration:**
  - Additional routes under the space domain (or nested under admin) handle account details, licensing, and opportunity settings.
  - **URL example:** `/spaces/123/settings`
- **Navigation Flow:**
  - Links and buttons (e.g., in dialogs) use resolved URLs from space profiles.
  - The routing logic ensures that after actions (like editing or deleting), navigation occurs back to parent paths.

---

## Summary of Key Paths

- `/spaces/:spaceId/`
  → Renders the main layout with tabs.

- `/spaces/:spaceId/about`
  → Loads the SpaceAboutPage (or SubspaceAboutPage for subspaces).

- `/spaces/:spaceId/dashboard`
  → Loads the dashboard view (using components like SpaceDashboardPage).

- `/spaces/:spaceId/subspaces`
  → Displays a list of subspaces within a space.

- `/spaces/:spaceId/settings`
  → Handles all settings and administration pages.

---

## Flow Diagram (Conceptual)

1. **Route Entry**
   - User navigates to `/spaces/:spaceId`
     ↓
2. **EntityPageLayout**
   - Renders common navigation via tabs
     ↓
3. **Tab Selection**
   - About Tab → `/spaces/:spaceId/about` → SpaceAboutPage loads
   - Dashboard Tab → `/spaces/:spaceId/dashboard` → Dashboard view loads
   - Subspaces Tab → `/spaces/:spaceId/subspaces` → Subspace list loads
   - Settings Tab → `/spaces/:spaceId/settings` → Settings components load
     ↓
4. **Dialogs & Detail Views**
   - Editing triggers dialogs (e.g., SpaceAboutDialog) overlaying the main layout
   - Back-navigation returns to the parent page via hooks (e.g. `useBackWithDefaultUrl`)

---

This overview captures the essential routing logic for the space domain. The configuration ensures that both spaces and subspaces share similar navigation patterns while enabling specific actions via dialogs and settings routes.
