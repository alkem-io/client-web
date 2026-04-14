---
description: Migrate an entire page from the old MUI layout to CRD by exploring all its components, setting up the page structure, then migrating each component via /migrate-page-component
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The input identifies a page to migrate — it can be a URL path (e.g., `/contributors`), a component name (e.g., `ContributorsPage`), a route path constant (e.g., `TopLevelRoutePath.Contributors`), or a natural language description.

## Context

This skill orchestrates a full page migration from MUI to CRD. It breaks down a page into its individual components/moving parts, sets up the CRD page structure, then iterates through each component invoking `/migrate-page-component` for each one.

### Key References

- **Route definitions**: `src/main/routing/TopLevelRoutes.tsx` (top-level entry, but pages may have their own sub-route components like `SpaceRoutes`, `SubspaceRoutes`, `UserRoute`, etc.)
- **Route paths**: `src/main/routing/TopLevelRoutePath.ts`
- **Migration pattern**: `specs/039-crd-spaces-page/migration-pattern.md`
- **CRD conventions**: `src/crd/CLAUDE.md`
- **Project conventions**: `CLAUDE.md` (root)
- **Existing CRD pages**: `src/main/crdPages/`
- **Prototype (design reference)**: `prototype/src/` (read-only, never modify)
- **Example completed migration**: `/spaces` page — see `src/main/crdPages/spaces/`

## Workflow

### Step 1: Identify the Page

1. **Resolve the page entry point** from the user input:
   - If a URL path: find the matching route in `TopLevelRoutes.tsx`
   - If a component name: search in `src/main/topLevelPages/`, `src/domain/`, `src/main/`
   - If a route constant: look up in `TopLevelRoutePath.ts` and trace through `TopLevelRoutes.tsx`
   - **Follow sub-routes**: The top-level route may load a route component (e.g., `SpaceRoutes`, `UserRoute`) that defines nested routes with their own pages/views. Trace through the full route tree to find the actual page component(s) being rendered.

2. **Read the page component** and trace its full component tree:
   - The route entry and any sub-route components
   - The page wrapper (e.g., `TopLevelPageLayout` usage, breadcrumbs, ribbons)
   - The main view component(s)
   - Data hooks and GraphQL queries
   - All significant sub-components rendered on the page

3. **Check what CRD work already exists** for this page:
   - Look in `src/main/crdPages/` for an existing integration
   - Check if the route is already under `CrdLayoutWrapper` in `TopLevelRoutes.tsx`
   - Check `src/crd/components/` for any composites already built for this domain
   - Check `specs/039-crd-spaces-page/tasks.md` for any related pending or completed tasks
   - If partial work exists, note exactly what's done and what remains

4. **Check the prototype** for the corresponding page:
   - Search `prototype/src/app/pages/` for a matching page
   - Note the prototype's component structure as the target design

### Step 2: Component Inventory

Present a **numbered inventory** of all components/moving parts on the page:

```
Page: /contributors (ContributorsPage)
Route: TopLevelRoutes.tsx → ContributorsPage
  (or: TopLevelRoutes.tsx → SpaceRoutes → SpaceDashboardPage)

Components:
1. [PAGE SHELL] TopLevelPageLayout wrapper (breadcrumbs, ribbon, layout)
2. [FILTER BAR] Search input + role filter buttons (All, Users, Organizations)
3. [USER CARDS] User contributor cards grid (avatar, name, tags, location)
4. [ORG CARDS] Organization contributor cards grid (avatar, name, description)
5. [PAGINATION] Load more / infinite scroll pagination
6. [EMPTY STATE] No results state when filters return nothing
7. [LOADING] Skeleton loading states

Data hooks:
- useContributors() — fetches users and organizations with filtering
- ContributorsQueries.graphql — GraphQL queries

Prototype reference:
- prototype/src/app/pages/ContributorsPage.tsx (if exists)

Already migrated:
- (list any existing CRD work, or "None")
```

For each component, note:
- Whether it has a prototype equivalent
- Whether a reusable CRD component already exists (e.g., `SpaceCard` pattern could inform `ContributorCard`)
- Whether it's a standard pattern (filter bar, pagination, empty state) vs page-specific
- **Whether it's already partially or fully migrated** (check existing CRD code)

**STOP and ask the developer:**
- "Does this inventory look complete? Any components to add, remove, or split?"
- "Which components should be migrated vs deferred?"
- "Any priority order preference, or should I go top-down?"

**Wait for developer feedback before proceeding.**

### Step 3: Page Structure Setup

Before creating anything, **check if scaffolding already exists**:
- Does `src/main/crdPages/<pageName>/` already exist?
- Is the route already wired under `CrdLayoutWrapper`?
- Does an i18n namespace already exist?

Only create what's missing:

1. **Create the integration directory** (if needed): `src/main/crdPages/<pageName>/`
2. **Create the page entry component** (if needed): `<PageName>Page.tsx` — a shell that imports the data hook and will render CRD components (can start with a placeholder)
3. **Copy/adapt the data hook**: If the existing hook can be reused as-is, import it. If it needs adaptation, copy it to the new directory
4. **Copy the GraphQL queries**: If they're co-located with the old page, copy them to the new directory
5. **Wire the route** (if needed): Add the page under `CrdLayoutWrapper` in `TopLevelRoutes.tsx` (lazy-loaded with `lazyWithGlobalErrorHandler`)
6. **Create the i18n namespace** (if needed): Add `src/crd/i18n/<feature>/<feature>.en.json` (+ other languages) if new CRD-level translations are needed

**Present the scaffolding to the developer for review.** Clearly indicate what already existed vs what's new.

**STOP and wait for developer approval before proceeding.**

### Step 4: Migrate Components (Loop)

Iterate through the approved component list. For each component:

1. **Check if this component was already migrated** (partially or fully) before presenting the plan. If it was, note what exists and what's missing.

2. **Present the component migration description** to the developer:
   ```
   Component 3/7: [USER CARDS] User contributor cards grid
   
   Old: src/domain/community/user/UserCard.tsx (MUI Paper, Avatar, Typography)
   Prototype: prototype/src/app/components/community/ContributorCard.tsx
   Reusable: SpaceCard pattern (banner + avatar + tags) — similar structure
   Already done: None (or: "CRD card exists but missing tag rendering")
   
   Plan: Create src/crd/components/community/ContributorCard.tsx
   - Props: name, avatarUrl, tags, location, href
   - Reuse Badge, Avatar primitives
   - New i18n keys in crd-contributors namespace
   
   Ready to migrate this component? Any adjustments?
   ```

3. **Wait for developer approval or adjustments** for this specific component.

4. **Invoke `/migrate-page-component`** with the approved description. Include enough context for it to work independently:
   - The old component path and what it does
   - The prototype reference (if any)
   - The target CRD component path
   - The props interface outline
   - What already exists (if partial migration)

5. **After `/migrate-page-component` completes**, verify the component works in context and present a brief status update before moving to the next one.

6. **Repeat** for each component in the inventory.

### Step 5: Integration & Verification

After all components are migrated:

1. **Check what's already wired** before making changes.

2. **Wire everything together** in the page entry component (`src/main/crdPages/<pageName>/<PageName>Page.tsx`):
   - Import the data hook
   - Create the data mapper(s) if needed
   - Render the CRD components with mapped data

3. **Update the standalone preview app** (`src/crd/app/`):
   - Add mock data for the new page
   - Add a route in `CrdApp.tsx`

4. **Run verification**:
   - `pnpm biome check --write` on changed files
   - `pnpm vitest run` — all tests must pass
   - Navigate to the page in the browser and verify it renders correctly

5. **Present the final result** to the developer:
   - Summary of all components migrated
   - Any components that were deferred
   - Known issues or follow-up items

## Important Rules

- **Never modify files in `prototype/`** — read-only reference
- **Developer approves each step** — never batch-migrate without confirmation
- **Always check existing work first** — before creating, modifying, or scaffolding anything, verify that it hasn't already been done (partially or fully)
- **One component at a time** — each `/migrate-page-component` invocation handles one component
- **Incremental progress** — the page should be functional after each component migration (earlier components render while later ones are still placeholders)
- **Reuse over rebuild** — check existing CRD primitives and composites before creating new ones
- **Follow sub-routes** — pages may be nested behind route components (`SpaceRoutes`, `SubspaceRoutes`, `UserRoute`, etc.); trace the full route tree
- **Keep the old page files** — don't delete them until the migration is fully verified
