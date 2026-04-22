# Phase 0 Research: CRD Comments Refinement

**Feature**: 089-crd-comments-refinement
**Date**: 2026-04-21

No unresolved `NEEDS CLARIFICATION` items. The spec was clear on user intent; five specific design decisions were validated during exploration of the current CRD and legacy-MUI code.

---

## R1 — Input placement: one modal or both?

**Decision**: Apply "input above the thread" to **both** the timeline event modal and the callout discussion modal.

**Rationale**:
- Consistency across CRD comments surfaces. A member who learns the pattern on one modal should find the same layout everywhere.
- Matches the legacy MUI `CommentsComponent.tsx` contract (`PostMessageToCommentsForm` rendered at the top, thread below). During the CRD migration, members routinely switch between legacy and CRD surfaces; mismatched placement breaks muscle memory.
- User explicitly chose "Both modals" during clarification.

**Alternatives considered**:
- *Timeline only*: Would have kept the callout's sticky-footer chat-style input. Rejected because it creates a two-pattern product and makes the refinement feel partial.
- *Sticky top on scroll*: Attractive for very long threads but adds complexity with no real win over just placing the input once in normal flow — the callout dialog is already a full-page surface with its own scroll, and the timeline modal now has a bounded-height list region instead.

**Source**:
- Legacy reference: `src/domain/communication/room/Comments/CommentsComponent.tsx:71-81` (`PostMessageToCommentsForm` rendered above `CollapsibleCommentsThread`).
- Current CRD: `src/crd/components/space/timeline/EventDetailView.tsx:191-200` (input currently rendered below thread with `border-t`); `src/crd/components/callout/CalloutDetailDialog.tsx:187,192-197` (input currently in sticky footer).

---

## R2 — Bounded-height value for the timeline event comments region

**Decision**: `max-h-[400px]` with `overflow-y-auto pr-2`, applied to the comments list wrapper inside `EventDetailView` — both the desktop two-column and the mobile single-column layouts.

**Rationale**:
- 400px comfortably accommodates ~5 top-level comments (each ~70–80px with avatar + content + reactions + actions) before the scroll kicks in. Tight enough that event details (banner + title + date + description) remain visible on a typical laptop viewport inside the 768px+ Dialog.
- Matches the order of magnitude of the legacy `CollapsibleCommentsThread` default `collapsedHeight = 250px` while giving the CRD surface slightly more breathing room, since the CRD design uses more vertical padding per comment.
- The `pr-2` gutter reserves space for the scrollbar so content text does not jitter when the bar appears.
- User chose "~400px (~5 comments) (Recommended)" during clarification.

**Alternatives considered**:
- *~320px (tighter)*: Safer on very short viewports but makes multi-comment threads feel cramped.
- *50% of dialog height via `calc()` / `dvh`*: Proportional, but unpredictable across aspect ratios and harder to reason about during QA. Fixed pixel value keeps the layout deterministic and easy to screenshot/compare.
- *Legacy collapse-and-expand pattern (250px + "Show more" button)*: Recreates the MUI `CollapsibleCommentsThread` behavior. Rejected — adds a bespoke collapse primitive to the CRD design system for a single consumer, and modern UX prefers a simple bounded scroll.

**Source**:
- `src/domain/communication/room/Comments/CollapsibleCommentsThread.tsx:5` (`DEFAULT_COLLAPSED_HEIGHT = 250`).
- `src/crd/components/space/timeline/TimelineDialog.tsx:88-89` (dialog children wrap in `min-h-0 flex-1 overflow-y-auto p-4`, which is what currently causes the comments column to stretch with event body height).

---

## R3 — Reply affordance on replies: hide vs disable

**Decision**: **Hide** the Reply button on comment items where `isReply === true`.

**Rationale**:
- The data mapper (`src/main/crdPages/space/dataMappers/commentDataMapper.ts`) groups comments by `threadID`; the CRD `CommentThread` iterates only top-level comments and renders replies nested under them. A message posted with `threadID = someReply.id` would be parented under a reply and never rendered — data loss is silent today.
- Hiding the button prevents the member from producing an action the system cannot fulfill. Disabling would still show the button and require an explanation of why it is unavailable — worse UX.
- The legacy MUI `MessageWithRepliesView` (`src/domain/communication/room/Comments/MessageWithRepliesView.tsx`) only wraps root messages; replies are rendered as plain `MessageView` children with no reply form. Hiding mirrors this exact pattern.

**Alternatives considered**:
- *Disable with tooltip*: Clutters the UI with a "why can't I reply?" conversation for every reply item.
- *Allow nested replies (change the data model)*: Out of scope. The backend message model permits any `threadID`, but the product decision in the legacy app is one level of nesting; CRD should not diverge.

**Source**:
- `src/crd/components/comment/CommentItem.tsx:53-62` (Reply button conditional on `!comment.isDeleted`; no `isReply` check today).
- `src/main/crdPages/space/dataMappers/commentDataMapper.ts:43-77` (placeholder handling when parent is missing; no nested-tree logic beyond one level).

---

## R4 — Sort order: preserve the toggle or make newest-first the single behavior?

**Decision**: Remove the UI sort toggle. Hard-code top-level comments to **newest-first**. Replies within a top-level thread remain **oldest-first** (chronological order).

**Rationale**:
- The legacy MUI `CommentsComponent` has no sort toggle; members have been reading threads newest-first (in effect, via Apollo's server-ordering) for years. Adding a toggle in CRD is gratuitous.
- Replies inside a single discussion are chronological for narrative reading — a classic "conversation reads top-down" pattern. The current CRD implementation already sorts replies this way inside `CommentThread` (`repliesByParent.set(parentId, [...replies].sort((a, b) => aTime - bTime))`), so nothing changes on the reply side.
- User confirmed removing the toggle during plan-mode clarification ("Both modals" scope implied this applies everywhere CRD comments render).

**Alternatives considered**:
- *Keep the toggle, default to newest*: Rejected — zero users asked for it; the control adds visual noise above the list; defaults become inconsistent if persistence is ever added.
- *Sort only by latest-activity (bump threads with new replies)*: Useful for chat but out of scope and inconsistent with the legacy pattern.

**Source**:
- `src/crd/components/comment/CommentThread.tsx:25,37-48,60-67` (the `useState<SortOrder>` + toggle button + dynamic sort comparator).
- `src/crd/i18n/space/space.en.json:348-349` (`sortNewest` / `sortOldest` keys, only referenced by the toggle).

---

## R5 — Cleanup: remove `canComment` / `onAddComment` from `CommentsContainerData`?

**Decision**: Remove both props.

**Rationale**:
- Interface Segregation Principle: the props are declared but never consumed inside `CommentThread` (the component does not render an input inline — input placement is owned by the parent composite via the `commentInputSlot` contract). Leaving dead props invites future miswiring and hides the component's actual contract.
- Single caller (`useCrdRoomComments` at `src/main/crdPages/space/hooks/useCrdRoomComments.tsx:100,102`) passes them today. The edit is a two-line removal on the call site.
- Source-breaking but blast radius is trivial: TypeScript will point at the single offending line at compile time; no runtime behavior changes.

**Alternatives considered**:
- *Leave as-is*: Violates ISP and the CRD CLAUDE.md mandate ("Event handlers are props, not internal logic — forbidden: navigating programmatically … any logic beyond calling the prop callback" — which implies the component shouldn't accept callbacks it doesn't invoke).
- *Deprecate with a JSDoc comment*: More ceremony than the cleanup deserves; the component has one call site.

**Source**:
- `src/crd/components/comment/types.ts:30-40` (interface definition).
- `src/main/crdPages/space/hooks/useCrdRoomComments.tsx:96-124` (single call site; `canComment` and `onAddComment` are read from the hook's inputs but never invoked anywhere else in the codebase).

---

## Summary of decisions

| ID | Decision | Files affected |
|----|----------|----------------|
| R1 | Input above thread on both modals | `EventDetailView.tsx`, `CalloutDetailDialog.tsx` |
| R2 | `max-h-[400px] overflow-y-auto pr-2` on timeline comments list | `EventDetailView.tsx` |
| R3 | Hide Reply button on replies | `CommentItem.tsx` |
| R4 | Newest-first only; remove toggle | `CommentThread.tsx`, 6× `space.*.json` |
| R5 | Trim `CommentsContainerData` | `types.ts`, `useCrdRoomComments.tsx` |

No unresolved questions remain.
