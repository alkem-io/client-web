---
description: Migrate an old MUI layout page component to the CRD design system (shadcn/ui + Tailwind)
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The input describes which old MUI page component(s) to migrate to CRD, and may include additional context about the migration scope.

The input may describe:

- **Full migration**: A page component that hasn't been migrated yet (e.g., "the Contributors page")
- **Partial migration / functional gap**: A component that is already visually present in CRD but is missing functionality compared to the old MUI version (e.g., "the search icon is rendered but doesn't open the search overlay")
- **Feature parity fix**: A specific behavior from the old layout that's not yet implemented in the CRD version (e.g., "the notification bell should show unread count badges like the MUI version")

Adapt the workflow accordingly — if the CRD component already exists, Phase 1 should compare old vs new to identify the gap rather than exploring the old component from scratch.

## Context

This skill migrates page-level components from the old MUI-based layout (`TopLevelLayout` / `TopLevelPageLayout`) to the new CRD design system (`CrdLayoutWrapper` / `CrdLayout`), or completes partial migrations where the visual component exists but functionality is missing. It follows the established migration pattern from the `/spaces` page migration (spec `039-crd-spaces-page`).

### Key References

- **Migration pattern**: `specs/039-crd-spaces-page/migration-pattern.md`
- **CRD conventions**: `src/crd/CLAUDE.md`
- **Project conventions**: `CLAUDE.md` (root)
- **Existing CRD components**: `src/crd/` (primitives, components, layouts, forms)
- **Existing CRD pages**: `src/main/crdPages/`
- **Route wiring**: `src/main/routing/TopLevelRoutes.tsx`
- **Layout wrapper**: `src/main/ui/layout/CrdLayoutWrapper.tsx`
- **Old MUI layout**: `src/main/ui/layout/TopLevelLayout.tsx`
- **Old MUI navigation**: `src/main/ui/platformNavigation/`
- **Prototype (design reference)**: `prototype/src/` (read-only, never modify)

### Architecture (3 layers)

| Layer | Location | Role |
|-------|----------|------|
| **Presentational** | `src/crd/` | Pure UI — shadcn primitives, composites, layouts. Zero MUI, zero business logic. |
| **Integration** | `src/main/crdPages/<pageName>/` | Wires CRD components to GraphQL data via data mappers and hooks. |
| **App shell** | `src/main/ui/layout/CrdLayoutWrapper.tsx` + `TopLevelRoutes.tsx` | Route-level split — CRD pages get the full CRD shell. |

## Workflow

### Phase 1: Explore the Old Component

1. **Locate the old component** based on user input. Search in:
   - `src/main/topLevelPages/`
   - `src/domain/`
   - `src/main/ui/`

2. **Read and understand** the old component tree:
   - The page component (entry point, layout wrapper usage)
   - The view component(s) (MUI components used, UI structure)
   - Data hooks (GraphQL queries, state management)
   - Any sub-components specific to this page

3. **If a CRD version already exists** (partial migration), also read:
   - The current CRD component(s) in `src/crd/` and `src/main/crdPages/`
   - Compare old vs new feature-by-feature to identify the specific gaps
   - Note what's already working and should NOT be changed

4. **Check the prototype** for a matching design reference:
   - Search `prototype/src/app/pages/` and `prototype/src/app/components/`
   - Note differences between prototype and production (mock data vs GraphQL, routing, i18n)

5. **Identify what already exists in CRD**:
   - Which primitives are already ported (`src/crd/primitives/`)
   - Which composites could be reused (`src/crd/components/`)
   - Which layout building blocks exist (`src/crd/layouts/components/`)
   - Missing primitives that need porting from prototype

6. **Check for reusable components across features**:
   - Search all of `src/crd/components/` for components that could serve this migration (even if built for a different feature)
   - Examples: an avatar badge, a card skeleton, a tag list, a filter bar — these patterns recur across pages
   - If a component exists under a feature-specific directory (e.g., `components/space/StackedAvatars.tsx`) but would be useful here, plan to **move it to `components/common/`** and update all existing imports — don't create a duplicate
   - If no exact match exists but a similar component does, note it as a starting point (e.g., "SpaceCard pattern could inform ContributorCard")

7. **Present findings to the developer**:
   - Summary of the old component structure
   - Prototype reference (if found)
   - What's reusable from existing CRD components
   - What needs to be built new
   - Any data layer considerations (new queries, mapper complexity)
   - Ask clarifying questions if needed (e.g., scope of migration, features to defer)

**STOP and wait for developer confirmation before proceeding.**

### Phase 2: Update Spec Artifacts

After the developer confirms the exploration findings and answers any clarifying questions, update the existing spec artifacts in `specs/039-crd-spaces-page/`. These are incremental additions to an existing spec — do NOT create new spec directories or branches.

#### 2a. Update spec.md

Read `specs/039-crd-spaces-page/spec.md` to understand the existing format, then:

- Add or update **user stories** and **acceptance scenarios** relevant to the new page migration
- Add new **functional requirements** (use the next available FR number)
- Add relevant **edge cases**
- Update the **Prototype-to-Production Mapping** table if new component mappings are introduced
- Record any developer clarifications in the **Clarifications** section with the current date

#### 2b. Update plan.md

Read `specs/039-crd-spaces-page/plan.md` to understand the existing format, then:

- Add new **design decisions** (use the next available D number) for architectural choices specific to this migration
- Update the **Project Structure** section if new directories or files are introduced
- Update the **Scale/Scope** line in Technical Context
- Update the **Complexity Tracking** table if any new justified violations arise

#### 2c. Update supporting artifacts (if needed)

- **data-model.md**: Add new entity definitions if the migration introduces new CRD view model types
- **contracts/**: Add TypeScript interface contracts for new CRD components if the component surface is complex
- **research.md**: Add research findings if technical investigation was needed during Phase 1

#### 2d. Update tasks.md

Read `specs/039-crd-spaces-page/tasks.md` to understand the existing format, then:

- Add a new **phase** (use the next available phase number) with implementation tasks
- Use the next available **task IDs** (check the last T-number in the file)
- Mark parallel tasks with `[P]`
- Tag with the appropriate user story `[US1]`, `[US2]`, etc.
- Include **exact file paths** in task descriptions
- Add a **checkpoint** at the end of the phase
- Update the **Dependencies & Execution Order** section

**Present the spec updates to the developer for review.**

**STOP and wait for developer approval before proceeding.**

### Phase 3: Analyze Consistency

After the developer approves the spec updates, invoke `/speckit.analyze` to validate consistency across spec.md, plan.md, and tasks.md. Address any issues found before moving to implementation.

### Phase 4: Implement

**Scope**: Only implement the tasks added in Phase 2 (the new phase). Do NOT execute previously pending tasks from earlier phases — those belong to separate work streams and may be intentionally deferred.

Before starting, note the **task ID range** of the newly added phase (e.g., T088–T095). Only work on tasks within that range.

Do NOT invoke `/speckit.implement` — it processes all pending tasks in tasks.md, which would include unrelated deferred tasks from earlier phases. Instead, implement the new tasks manually:

For each task in the new phase (in dependency order):

1. **Mark the task as in-progress** (TaskUpdate)
2. **Implement** following CRD conventions:
   - No MUI imports in `src/crd/`
   - Props are plain TypeScript (no GraphQL types)
   - Event handlers are props, not internal logic
   - Styling is Tailwind only (use `cn()` for composition)
   - Icons from `lucide-react`
   - All user-visible text uses `t()` from the appropriate CRD i18n namespace
   - No `useMemo`/`useCallback`/`React.memo` (React Compiler handles it)
3. **Mark the task as completed** in both TaskUpdate and tasks.md
4. **Run verification** after completing all tasks:
   - `pnpm biome check --write` on changed files
   - `pnpm vitest run` (all tests must pass)

### CRD Component Checklist (apply to every new component in `src/crd/`)

- [ ] No MUI imports (`@mui/*`, `@emotion/*`)
- [ ] No domain/apollo/auth/routing imports
- [ ] Props are plain TypeScript (no GraphQL types)
- [ ] No barrel exports — explicit file paths only
- [ ] Event handlers (`on*`) are props, not internal logic
- [ ] State is visual only (open/close, hover, expanded)
- [ ] Styling uses only Tailwind classes + `cn()`
- [ ] Icons from `lucide-react` only
- [ ] All interactive elements have `aria-label` or visible text
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] All user-visible strings use `t()` — no hardcoded text

## Important Rules

- **Never modify files in `prototype/`** — read-only reference
- **Never modify non-English translation files** in `src/core/i18n/` — those are managed by Crowdin
- **CRD translations** (`src/crd/i18n/`) are managed manually — update all 6 language files (en, nl, es, bg, de, fr)
- **Data hooks stay untouched** — reuse existing GraphQL queries and hooks; the CRD migration is UI-only
- **Keep the old MUI page files** — don't delete them, they may still be referenced by other routes
- **Route wiring is the switch** — migration happens by moving the route from `TopLevelLayout` to `CrdLayoutWrapper` in `TopLevelRoutes.tsx`
