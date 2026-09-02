# Implementation Plan: CRD Comments Refinement (Parity with Legacy Experience)

**Branches**:
- `089-crd-comments-refinement` (merged) — Stories US1–US4: input-on-top, newest-first, one-level replies, timeline modal bounded height.
- `090-crd-callout-inline-comments` (current) — Story US5: inline collapsible comments on list-view callouts.

**Date**: 2026-04-21 (initial) / 2026-04-23 (US5 addendum) | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/089-crd-comments-refinement/spec.md`

## Summary

Close four behavioral gaps between the CRD comments surface and the legacy MUI `CommentsComponent` that community members depend on today. (1) Move the comment input above the thread on both the timeline event modal and the callout discussion modal. (2) Hard-code newest-first ordering for top-level comments and remove the user-facing sort toggle. (3) Hide the Reply action on reply items so the UI stops advertising a capability the data model silently discards. (4) Bound the comments list inside the timeline event modal so long threads don't push the event body off-screen.

**US5 addendum (branch 090).** Add an inline, collapsible comment thread to the footer of CRD list-view callouts (`PostCard` rendered from `LazyCalloutItem`). A chevron-toggle trigger next to the existing "N comments" label expands the footer in place, revealing the comment input above and the thread below, bounded by a max-height with internal scroll. The callout detail dialog, the timeline event modal, and the legacy MUI list view are untouched.

No domain, GraphQL, routing, or dependency changes. All edits are in `src/crd/components/comment/`, two CRD page shells (`EventDetailView`, `CalloutDetailDialog`), one integration hook (`useCrdRoomComments`), the six `crd-space` locale files (two keys removed in US1–US4; two keys added in US5), plus three additional files for US5: `src/crd/components/space/PostCard.tsx`, `src/main/crdPages/space/callout/LazyCalloutItem.tsx`, and `src/main/crdPages/space/callout/CalloutCommentsConnector.tsx` (new optional `skipSubscription` prop).

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 / Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), `class-variance-authority`, `lucide-react`, Apollo Client (existing — unchanged), `react-i18next` (existing). No new dependencies.
**Storage**: N/A (presentation-only refactor; GraphQL schema and cache semantics unchanged)
**Testing**: Vitest with jsdom (existing suite must continue to pass). No new test files required; the comment connector wiring and mutation flows are already covered by upstream tests at the domain layer.
**Target Platform**: Web SPA (Vite; dev server at localhost:3001; backend at localhost:3000)
**Project Type**: Web SPA — three-layer CRD architecture (presentation / integration / domain) established by specs 039 / 042 / 086.
**Performance Goals**: No new Apollo queries, no new subscription listeners. The bounded-height region on the timeline event modal eliminates a full-thread layout cost on open (only the visible window paints).
**Constraints**: Zero MUI / Emotion imports in `src/crd/`; zero GraphQL / routing / `@/domain/*` imports in `src/crd/`; zero new translation keys (two keys removed); React Compiler compatible (no manual `useMemo` / `useCallback` / `React.memo`); WCAG 2.1 AA preserved on the bounded-scroll region (keyboard scrollable, focus traps unaffected).
**Scale/Scope**: 4 CRD presentation files touched, 1 integration file touched, 6 locale files each lose 2 keys. Net ~50 LOC removed, ~10 LOC added. No new files.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Domain-Driven Frontend Boundaries | PASS | Zero domain changes. `useCrdRoomComments` — an integration hook under `src/main/crdPages/space/hooks/` — continues to orchestrate the existing `usePostMessageMutations`, `useCommentReactionsMutations`, and `useRemoveMessageOnRoomMutation` domain façades. No new domain logic added or moved. |
| II | React 19 Concurrent UX Discipline | PASS | Removing a `useState` (sort toggle). No new manual memoization. No new lifecycle patterns. Subscription (`useSubscribeOnRoomEvents`) remains wired via the integration hook. No Suspense boundary changes. |
| III | GraphQL Contract Fidelity | PASS | No schema changes. No `pnpm codegen` run required. Continues to consume generated hooks (`useRemoveMessageOnRoomMutation`, `useCalloutContributionCommentsQuery`) via integration connectors. Generated types do not leak into CRD prop contracts (the CRD `CommentData` type is already plain TypeScript). |
| IV | State & Side-Effect Isolation | PASS | A visual-only `useState<SortOrder>` is being removed. No state is added. Persistent state remains in the Apollo cache via the existing mutations. No direct DOM manipulation. |
| V | Experience Quality & Safeguards | PASS | The new `max-h-[400px] overflow-y-auto` region is keyboard-scrollable by default (browser behavior); existing `aria-label` on the loader and `sr-only` patterns in `CommentThread` / `CommentInput` are untouched. Delete / reply / reaction flows preserve their existing a11y treatment. |
| Arch 1 | Feature directory taxonomy | PASS | All edits stay within established layers: `src/crd/components/comment/` (leaf presentation), `src/crd/components/space/timeline/` + `src/crd/components/callout/` (CRD composites), `src/main/crdPages/space/hooks/` (integration), `src/crd/i18n/space/` (translations). No new directories. |
| Arch 2 | Styling standard (CRD vs MUI) | PASS | Zero MUI / Emotion imports added. The bounded scroll region uses existing Tailwind tokens (`max-h-[400px]`, `overflow-y-auto`, `pr-2`) already present in the codebase. |
| Arch 3 | i18n pipeline | PASS | Removing `comments.sortNewest` and `comments.sortOldest` from all six locale files under `src/crd/i18n/space/`. Per the CRD CLAUDE.md, CRD translations are managed manually (not Crowdin), so editing all six files is the correct workflow. No new keys. No hard-coded copy introduced. |
| Arch 4 | Build determinism | PASS | No Vite config changes. No chunking impact (same files, fewer characters). No env/runtime config changes. |
| Arch 5 | Import transparency | PASS | All imports remain explicit file paths. No barrel `index.ts` added. Two imports (`Button` in `CommentThread`, and the sort-toggle `t()` lookup) are being removed from `CommentThread.tsx` as dead code. |
| Arch 6 | SOLID / DRY | PASS | **SRP**: `CommentThread` loses its dual role (render + sort UI) and becomes a pure render component. **OCP**: consumers decide input placement via slots, already in place. **ISP**: `CommentsContainerData` loses two unused props (`canComment`, `onAddComment`), tightening the interface to what the component actually uses. **LSP**: type change is source-breaking but only at the one call site (`useCrdRoomComments`). **DIP**: CRD components continue to receive behavior via prop callbacks; integration hook wires Apollo. **DRY**: no duplication introduced; `pr-2` + `overflow-y-auto` idiom is used consistently. |
| Eng 5 | Root cause analysis | PASS | Each refinement addresses the actual root cause: (1) Input placement is a layout-order bug — fixed by rendering slots in the correct order, not by masking with CSS. (2) Sort default: the toggle was added speculatively; it is not a bug workaround. (3) Reply button on replies advertises a non-existent capability — the mapper and `postReply` fully support only one level; fix hides the affordance rather than silently discarding data. (4) Max-height: the timeline modal was delegating scroll to the dialog shell, which caused the regression — fixed by giving the comments list its own scroll context, not by capping the dialog height. |

**Result**: All gates pass. No entries required in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/089-crd-comments-refinement/
├── plan.md               # This file (/speckit.plan output)
├── spec.md               # Feature specification
├── research.md           # Phase 0: decisions (placement, bounded-height, reply affordance, sort)
├── data-model.md         # Phase 1: updated CommentsContainerData prop interface
├── quickstart.md         # Phase 1: toggle + manual verification matrix
├── contracts/            # Phase 1: CRD composite slot contracts
│   └── crd-presentational.md
└── checklists/
    └── requirements.md   # Spec quality checklist (already complete)
```

### Source Code (repository root)

```text
src/
├── crd/                                                          # Presentation layer (shadcn/ui + Tailwind)
│   ├── components/comment/
│   │   ├── CommentThread.tsx                                     # MODIFY — drop sort toggle + state
│   │   ├── CommentItem.tsx                                       # MODIFY — hide Reply on replies
│   │   ├── CommentInput.tsx                                      # UNCHANGED
│   │   ├── CommentReactions.tsx                                  # UNCHANGED
│   │   ├── CommentEmojiPicker.tsx                                # UNCHANGED
│   │   └── types.ts                                              # MODIFY — drop `canComment` + `onAddComment`
│   ├── components/space/timeline/
│   │   └── EventDetailView.tsx                                   # MODIFY — input-on-top + max-h-[400px]
│   ├── components/callout/
│   │   └── CalloutDetailDialog.tsx                               # MODIFY — move input from sticky footer to top of thread
│   └── i18n/space/
│       ├── space.en.json                                         # MODIFY — remove 2 sort keys
│       ├── space.nl.json                                         # MODIFY — remove 2 sort keys
│       ├── space.es.json                                         # MODIFY — remove 2 sort keys
│       ├── space.bg.json                                         # MODIFY — remove 2 sort keys
│       ├── space.de.json                                         # MODIFY — remove 2 sort keys
│       └── space.fr.json                                         # MODIFY — remove 2 sort keys
│
├── main/crdPages/space/                                          # Integration layer
│   └── hooks/useCrdRoomComments.tsx                              # MODIFY — drop two unused props from CommentThread call
│
├── main/crdPages/space/dataMappers/commentDataMapper.ts          # UNCHANGED
├── main/crdPages/space/callout/CalloutCommentsConnector.tsx      # UNCHANGED
├── main/crdPages/space/timeline/CalendarCommentsConnector.tsx    # UNCHANGED
├── main/crdPages/space/timeline/EventDetailConnector.tsx         # UNCHANGED
│
└── domain/communication/room/Comments/                           # UNCHANGED (legacy MUI reference)
    └── CommentsComponent.tsx                                     # UNCHANGED — parity reference
```

**Structure Decision**: Single Web SPA, three-layer CRD architecture retained. Zero new files. Twelve modified files in US1–US4 (3 CRD comment leaves, 2 CRD composites, 1 integration hook, 6 CRD locale files). US5 adds three more modified files (`PostCard.tsx`, `LazyCalloutItem.tsx`, `CalloutCommentsConnector.tsx`) and reuses the same 6 locale files (net: 2 keys added). No domain, routing, or Apollo changes.

### US5 additions (branch 090)

```text
src/
├── crd/
│   ├── components/space/
│   │   └── PostCard.tsx                                            # MODIFY — add `commentsSlot`, `commentInputSlot`, `onCommentsExpandedChange` optional props; render <Collapsible> footer when commentsSlot is present
│   └── i18n/space/
│       └── space.{en,nl,es,bg,de,fr}.json                          # MODIFY — add `callout.expandComments` + `callout.collapseComments` keys (state-aware aria-label)
│
└── main/crdPages/space/callout/
    ├── LazyCalloutItem.tsx                                         # MODIFY — wrap PostCard in CalloutCommentsConnector; lift expanded state; pass thread + input as slots; keep dialog reachable via title/expand button
    └── CalloutCommentsConnector.tsx                                # MODIFY — accept optional `skipSubscription` prop; default to `!inView` (current dialog behavior preserved when omitted)
```

Primitives reused without change: `src/crd/primitives/collapsible.tsx` (Radix Collapsible wrapper, already present). No new primitives introduced.

## Complexity Tracking

> No Constitution violations. This section is intentionally empty.

## Phase 0: Outline & Research

**Status**: Complete. Consolidated in [`research.md`](./research.md).

No `NEEDS CLARIFICATION` items. Two design choices were resolved via user input during spec-level Q&A and are captured in `research.md`:

- **R1 — Apply input-on-top to the callout dialog too?** Yes. User chose "Both modals" during clarification. Rationale: consistency across CRD comments surfaces, muscle-memory match with legacy MUI `CommentsComponent`.
- **R2 — Max-height value for the timeline comments region?** `400px` (~5 comments visible). User chose the "~400px (Recommended)" option. Rationale: large enough to see a handful of comments without dominating the event body.
- **R3 — Why hide the Reply button on replies rather than disable it?** The Reply action on a reply creates a message whose `threadID` is another reply, which the data mapper groups under a parent-id that never appears in the top-level list. Such messages are silently omitted from the rendered tree. Hiding the affordance is the correct root-cause fix; disabling would still confuse users.
- **R4 — Keep newest-first as the sole order?** Yes. The legacy MUI `CommentsComponent` has no UI toggle; newest-first matches the legacy default and user mental model. Replies stay oldest-first (chronological) within each parent so conversations read naturally.
- **R5 — Why remove `canComment` + `onAddComment` rather than leave them deprecated?** They are zero-caller props that the component never consumed (the consumer renders `CommentInput` separately). Leaving them would be ISP noise and invite miswiring. Removing them is a minor, source-breaking change at the one call site in `useCrdRoomComments`.
- **R6 — (US5) `Collapsible` vs. `Accordion` for the inline footer?** `Collapsible`. The footer has one independent section per card (not a family with "only-one-open" semantics), the chevron must live inline with the existing "N comments" label (Accordion's built-in trigger styling would have to be overridden), and Collapsible is the lower-abstraction primitive — it composes cleanly with the existing `CardFooter` JSX without fighting it.
- **R7 — (US5) Always-mount the comments connector vs. lazy-mount on first expand?** Always-mount with `skipSubscription={!commentsExpanded}`. Chevron must be visible from first paint (FR-012), which forbids deferred-mount patterns where the slot is undefined until after first expand. `useInView` already gates the contribution query, so off-screen callouts pay nothing; on-screen callouts pay one cheap query + a passive subscription only after the user has expanded. This matches the cost profile of the dialog path while preserving input drafts and subscription state across collapse/re-expand.
- **R8 — (US5) Does the dialog remain reachable from the footer?** No. The footer's sole behavior is expand/collapse the inline thread. The detail dialog is still reachable from the callout title (main click target) and the expand button in the header. Comments are a sub-flow of the callout card; pulling them inline turns the dialog back into what it should be — the full-context detail view rather than the default comment surface.

## Phase 1: Design & Contracts

**Status**: Complete.

Outputs:
- [`contracts/crd-presentational.md`](./contracts/crd-presentational.md) — the updated prop contracts for `CommentThread` (`CommentsContainerData`), `CommentItem`, and the slot contracts for `EventDetailView` / `CalloutDetailDialog` that govern input placement and bounded-scroll regions.
- [`data-model.md`](./data-model.md) — the TypeScript shape of `CommentData`, `CommentReaction`, and the trimmed `CommentsContainerData`, including the tree-building rule (`parentId` → tree via `useMessagesTree`-equivalent grouping in the mapper).
- [`quickstart.md`](./quickstart.md) — CRD toggle setup and the manual verification matrix derived from the spec's acceptance scenarios and the user's stated verification plan.

No GraphQL `contracts/*.graphql` is required — the feature adds no endpoints, mutations, or queries.

Agent context update is applied via `.specify/scripts/bash/update-agent-context.sh claude` to record the (zero net) dependency delta in `CLAUDE.md`.

## Post-Design Constitution Re-Check

Re-checked after data-model + contracts: **all gates still pass.** No new violations introduced by Phase 1 design. The trimmed `CommentsContainerData` interface and the new bounded-scroll region both strengthen rather than weaken the Constitution posture (ISP and root-cause principles respectively).
