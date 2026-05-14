# Tasks: Space & Subspace Header Layout — Full-Width Banner with Title Below

**Input**: Design documents from `/Users/polibon/Projects/alkemio/client-web/specs/100-space-header-layout/`
**Prerequisites**: spec.md ✓, plan.md ✓, research.md ✓, data-model.md ✓, contracts/headers.ts ✓, quickstart.md ✓

**Tests**: Not requested. The change is presentational and verified via the manual plan in `quickstart.md`. No test tasks included.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1 = full-width banner, US2 = title below, US3 = buttons right)
- All paths are absolute from the repo root, prefixed with `src/...`

## Path Conventions

- CRD presentational components: `src/crd/components/space/`
- CRD standalone preview pages: `src/crd/app/pages/`
- CRD translations: `src/crd/i18n/space/`, `src/crd/i18n/subspace/`
- Main-app integration: `src/main/crdPages/space/layout/`, `src/main/crdPages/subspace/layout/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Branch state and local dev environment.

- [ ] T001 Confirm working branch is `100-space-header-layout` and tree is clean (`git status` shows no uncommitted changes that aren't part of this work)
- [ ] T002 [P] Run `pnpm install` to ensure dependencies are current with the lockfile
- [ ] T003 [P] Start the standalone CRD preview app (`pnpm crd:dev`) in a background terminal — this is the fastest visual iteration loop for these two components

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Capture pre-change reference state needed by Success Criteria comparison.

**⚠️ CRITICAL**: T004 is the only blocker. Without baseline screenshots there is no way to verify SC-005 (zero pixel change to inner content width) and SC-007 (Space/Subspace visual parity) once the change is in.

- [ ] T004 Capture baseline screenshots of the Space page and the Subspace page at viewport widths 320px, 768px, 1024px, 1440px, 1920px, in both light and dark mode, on `develop`. Save to a local scratch dir (not committed). Use these as the "before" reference for SC-005 and SC-007 comparisons in T028/T029.

**Checkpoint**: Baseline captured. User-story phases can begin.

---

## Phase 3: User Story 1 — Full-width edge-to-edge banner (Priority: P1) 🎯 MVP

**Goal**: Banner spans the full viewport width and scales fluidly with viewport via `aspect-[6/1]`, replacing today's fixed pixel heights, on both Space and Subspace.

**Independent Test**: Open a Space page and a Subspace page at 320/768/1024/1440/1920. Banner reaches both viewport edges with no horizontal gutter. Banner height = viewport width / 6 (≈53px at 320px, ≈320px at 1920px). Inner content below the banner is byte-identical in width to the baseline screenshots from T004.

- [ ] T005 [P] [US1] In `src/crd/components/space/SpaceHeader.tsx`, change the banner `<div>` (currently `className="relative w-full h-[256px] overflow-hidden group"`, line 61) to `className="relative w-full aspect-[6/1] overflow-hidden group"`. Keep `role="img"`, `aria-label`, and the inner gradient/image markup intact.
- [ ] T006 [P] [US1] In `src/crd/components/space/SubspaceHeader.tsx`, change the banner `<div>` (currently `className="relative w-full h-52 md:h-64 overflow-hidden group"`, line 83) to `className="relative w-full aspect-[6/1] overflow-hidden group"`. Keep `role="img"`, `aria-label`, and the inner gradient/image markup intact.

**Checkpoint**: User Story 1 is shippable on its own. Banners are edge-to-edge and fluid. The existing overlay content (title, buttons, member avatars, etc.) still sits on top of the banner — that's expected and gets resolved in US2/US3.

---

## Phase 4: User Story 2 — Title and subtitle below the banner (Priority: P1)

**Goal**: Title and subtitle move into a new below-banner section, inside the existing inner content width, using theme text tokens (no more white-on-photo). The banner overlay content for title/tagline is removed. Subspace: single ~56px avatar inline with the title; layered parent-avatar pair, level badge, and member-avatar stack are removed entirely.

**Independent Test**: On both pages, title is `<h1 className="text-hero text-foreground truncate">`, subtitle is `<p className="text-body text-muted-foreground truncate">`, both inside `lg:col-start-2 / lg:col-span-10`. No overlaid title text on the banner. No member-avatar stack on the banner. For Subspace: no parent-tile avatar, no "Subspace"/"Sub-subspace" badge, single 56px avatar inline with the title.

### Implementation for User Story 2

- [ ] T007 [US2] Rewrite `src/crd/components/space/SpaceHeader.tsx` markup to add the new below-banner section per `specs/100-space-header-layout/data-model.md` (`# SpaceHeader → Markup contract`). Inside the new section, render title (`text-hero text-foreground truncate`) and optional subtitle (`text-body text-muted-foreground truncate`). Keep the `isHomeSpace` Home glyph but switch its colour from `text-primary-foreground/80` to `text-muted-foreground`. **Remove** from this file: the in-banner title/tagline overlay block (lines ~164–182), the member-avatar stack block (lines ~185–215). Leave the action-buttons block (lines ~84–162) untouched for now — US3 owns that move.
- [ ] T008 [US2] Remove unused props from `SpaceHeader` prop type in `src/crd/components/space/SpaceHeader.tsx`: drop `memberAvatars: MemberAvatar[]` and `onMemberClick?: () => void` from `SpaceHeaderProps`. Drop the `MemberAvatar` local type if it has no other use. Update the destructuring in the function signature accordingly.
- [ ] T009 [US2] In `src/main/crdPages/space/layout/CrdSpacePageLayout.tsx`, stop passing `memberAvatars` and `onMemberClick` to `<SpaceHeader>`. Remove any local computations that only fed those props.
- [ ] T010 [US2] In `src/crd/app/pages/SpacePage.tsx` (standalone preview), trim the mock props passed to `<SpaceHeader>` — drop `memberAvatars` and `onMemberClick`.
- [ ] T011 [US2] Rewrite `src/crd/components/space/SubspaceHeader.tsx` markup to add the new below-banner section per `specs/100-space-header-layout/data-model.md` (`# SubspaceHeader → Markup contract`). The title row contains: a single 56px (`size-14`) subspace avatar (using `subspaceAvatarUrl` when present, else initials over `subspaceColor`) → title (`text-hero text-foreground truncate`) → (button group placeholder kept for now until T015). Subtitle row (`text-body text-muted-foreground truncate`) below when `tagline` is set. **Remove** from this file: the two-tile layered avatar block (lines ~234–263) and its `-mt-12` overlap, the level Badge (lines ~184–194), the member-avatar stack block (lines ~196–227). Leave the in-banner action-buttons block (lines ~102–182) untouched until US3.
- [ ] T012 [US2] Remove unused props from `SubspaceHeader` prop type in `src/crd/components/space/SubspaceHeader.tsx`: drop `parentInitials: string`, `parentColor: string`, `badgeKind: 'subspace' | 'subSubspace'`, `memberAvatars: MemberAvatar[]`, `onMemberClick?: () => void`. Audit `parentName` usage — keep it only if it still feeds the banner `aria-label`; otherwise drop. Drop the `MemberAvatar` local type. Update the destructuring in the function signature accordingly.
- [ ] T013 [US2] In `src/main/crdPages/subspace/layout/CrdSubspacePageLayout.tsx`, stop passing `parentInitials`, `parentColor`, `badgeKind`, `memberAvatars`, `onMemberClick` to `<SubspaceHeader>`. Remove any local data-mapper branches in the same file (or in adjacent `dataMappers.ts` siblings) that only fed those props.
- [ ] T014 [US2] In `src/crd/app/pages/SubspacePage.tsx` (standalone preview), trim the mock props passed to `<SubspaceHeader>` — drop `parentInitials`, `parentColor`, `badgeKind`, `memberAvatars`, `onMemberClick`.

**Checkpoint**: User Stories 1 + 2 work together. Banner is edge-to-edge and fluid. Title and subtitle render below the banner in inner content width with theme tokens. Member-avatar stack, level badge, and layered parent avatar are gone. Subspace shows a single 56px avatar inline with the title. Action buttons still render on top of the banner (current behaviour) — US3 finishes the layout.

---

## Phase 5: User Story 3 — Action buttons on right of title row (Priority: P2)

**Goal**: The four action buttons (Activity, Video Call, Share, Settings — subset per permissions) leave the banner and render right-aligned inside the new below-banner title row, with their right edge aligned to the inner content's right edge.

**Independent Test**: On both pages, action buttons render at the far right of the title row, vertically centred relative to the title. Right edge aligns with the right edge of the body content below (use DevTools to confirm `x + width`). No action buttons remain overlaid on the banner. Long title truncates with ellipsis; buttons remain visible (FR-008).

### Implementation for User Story 3

- [ ] T015 [P] [US3] In `src/crd/components/space/SpaceHeader.tsx`, move the action buttons into the title row created in T007. Inside the title row's right-side cell (`shrink-0 flex items-center gap-2`), render the same four buttons (Activity / Video / Share / Settings) using `Button variant="ghost" size="icon"`, with neutral styling (drop the `text-white bg-black/20 hover:bg-black/30` classes — buttons no longer sit on a photographic background). Preserve every `aria-label`, `safeHttpUrl` guard, and `asChild={true}` link form from the existing code. **Delete** the entire banner-overlay action-buttons block (lines ~84–162 in the pre-rewrite file).
- [ ] T016 [P] [US3] In `src/crd/components/space/SubspaceHeader.tsx`, move the action buttons into the title row created in T011 (rightmost flex child, `shrink-0 flex items-center gap-2`). Render the same four buttons using `Button variant="ghost" size="icon"` with neutral styling (drop `text-white hover:bg-white/10` classes). Preserve every `aria-label`, `safeHttpUrl` guard, and `asChild={true}` link form from the existing code. **Delete** the entire banner-overlay action-buttons block (lines ~102–182 in the pre-rewrite file).

**Checkpoint**: All three user stories are complete. Both headers render the final design: full-width fluid banner, below-banner title row with title left + buttons right, optional subtitle row below. Subspace's avatar is a single inline tile. Space and Subspace look identical in layout.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Tidy unused translations, run quality gates, and complete the manual verification plan.

- [ ] T017 [P] Prune orphaned i18n keys from `src/crd/i18n/space/space.{en,nl,es,bg,de,fr}.json`. Candidates to verify and remove (grep the codebase before deleting): `members.title`. Apply to all six language files. Verify no remaining references via `git grep "t('members.title')" src`.
- [ ] T018 [P] Prune orphaned i18n keys from `src/crd/i18n/subspace/subspace.{en,nl,es,bg,de,fr}.json`. Candidates to verify and remove: `badge.subspace`, `badge.subSubspace`, `a11y.parentLink`, `members.viewCommunity`. Apply to all six language files. Verify no remaining references via `git grep` for each key.
- [ ] T019 Run `pnpm lint` from the repo root. Resolve any TypeScript, Biome, or ESLint errors introduced by the change. The React Compiler rule (ESLint) must pass — confirm no manual `useMemo`/`useCallback`/`React.memo` was added.
- [ ] T020 Run `pnpm vitest run` from the repo root. Fix any test that depended on removed props (e.g. tests asserting on member-avatar markup or level-badge text). If a test only checks removed markup, delete it.
- [ ] T021 Run the full manual verification plan in `specs/100-space-header-layout/quickstart.md` — every row of every table (US1, US2, US3, a11y spot checks, removed-features regression, constitutional checks) at viewports 320/768/1024/1440/1920 in light and dark mode, on both the standalone preview app and the integration app.
- [ ] T022 Side-by-side visual review (Space vs Subspace) at three viewports (mobile, desktop, wide). Confirm SC-007: identical banner width, banner aspect ratio, title placement, subtitle placement, and action button placement.

**Checkpoint**: Change is ready for PR review.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: No dependencies.
- **Phase 2 — Foundational**: Depends on Phase 1. **Blocks** all user-story phases (the baseline screenshots are needed for the later comparisons).
- **Phase 3 — US1**: Depends on Phase 2. Independently shippable — leaves the headers in a working, intermediate state.
- **Phase 4 — US2**: Depends on Phase 3 (modifies the same banner host div). Independently shippable.
- **Phase 5 — US3**: Depends on Phase 4 (the title row created in T007/T011 is where the buttons land). Independently shippable.
- **Phase 6 — Polish**: Depends on Phases 3–5 (i18n pruning requires JSX changes complete).

### User Story Dependencies

- **US1**: Independent of US2/US3 within the codebase but conceptually a half-shipped state; works as a standalone increment.
- **US2**: Depends on US1 (same banner div hosts the change). Removes the in-banner overlay content other than action buttons.
- **US3**: Depends on US2 (uses the title row created by US2 as the button host).

### Within Each User Story

- Markup changes (component) must happen before consumer-side prop trimming, but they can land in the same task or in adjacent tasks within the same phase.
- Standalone preview page updates (`src/crd/app/pages/*`) and main-app integration updates (`src/main/crdPages/*`) are different files and can run in parallel.

### Parallel Opportunities

- **Phase 1**: T002 and T003 run in parallel.
- **Phase 3 (US1)**: T005 (SpaceHeader.tsx) and T006 (SubspaceHeader.tsx) — different files — run in parallel.
- **Phase 4 (US2)**: T007/T008/T009/T010 (Space-side) and T011/T012/T013/T014 (Subspace-side) are different file sets and can run as two parallel tracks. Within each side, the tasks share a file and run sequentially.
- **Phase 5 (US3)**: T015 (SpaceHeader.tsx) and T016 (SubspaceHeader.tsx) — different files — run in parallel.
- **Phase 6**: T017 and T018 (different i18n directories) run in parallel.

---

## Parallel Example: User Story 2

Two tracks, run by two contributors at the same time:

```bash
# Track A — Space side (one file owner)
T007: Rewrite SpaceHeader.tsx markup
T008: Trim SpaceHeader prop type
T009: Update CrdSpacePageLayout.tsx consumer
T010: Update SpacePage.tsx standalone preview

# Track B — Subspace side (other file owner, in parallel with Track A)
T011: Rewrite SubspaceHeader.tsx markup
T012: Trim SubspaceHeader prop type
T013: Update CrdSubspacePageLayout.tsx consumer
T014: Update SubspacePage.tsx standalone preview
```

Both tracks complete → Phase 4 checkpoint reached.

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 — Setup
2. Phase 2 — Foundational (capture baseline screenshots)
3. Phase 3 — US1 (banner becomes full-width and fluid)
4. **STOP and validate**: confirm banner edge-to-edge at all five viewports and inner content unchanged
5. Deploy / demo as MVP if desired (intermediate state — overlay content still on banner)

### Incremental Delivery

1. Setup + Foundational → ready
2. Add US1 → Banner is full-width and fluid → MVP
3. Add US2 → Title, subtitle, Subspace avatar move below banner; member-avatar stack, level badge, layered avatar removed → Major visual improvement
4. Add US3 → Action buttons land in the title row → Final design complete
5. Add Polish → Translations pruned, gates pass, manual QA done → Ready to merge

### Single-PR Strategy (Recommended for this change)

Given the change is tightly localised to two files and a handful of consumers, the practical path is a single PR that lands Phases 1–6 together. The story-organised tasks still serve as the work breakdown — they map directly to commit-sized chunks of the rewrite.

---

## Notes

- [P] tasks = different files, no dependencies on the same in-flight task.
- [Story] label maps each task to its user story (US1 / US2 / US3).
- Component file paths under `src/crd/components/space/` and consumer paths under `src/main/crdPages/{space,subspace}/layout/` are the **only** TypeScript files modified — every other touched file is a translation JSON or a standalone preview page.
- `pnpm codegen` is **not** required — no GraphQL is modified.
- No automated tests are added; verification is via `quickstart.md`.
- All commits on this branch must be signed (per CLAUDE.md project rule).
- Stop at any checkpoint to validate the increment independently against the relevant success criteria.
