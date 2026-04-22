# Phase 1 Data Model: CRD Comments Refinement

**Feature**: 089-crd-comments-refinement
**Date**: 2026-04-21

This feature is presentation-only — no GraphQL schema changes, no database changes, no new runtime state beyond the visual-only inline reply `isReplying` flag that already exists. The "data model" captured here is the **CRD prop contract** for the comment leaf components and the slot types exposed by the CRD composites that host them.

The underlying domain `Message` model and `threadID`-based grouping logic are unchanged and documented for reference at the bottom of this file.

---

## Updated CRD types (`src/crd/components/comment/types.ts`)

### `CommentAuthor`

```typescript
export type CommentAuthor = {
  id: string;
  name: string;
  avatarUrl?: string;
};
```

No change.

### `CommentReaction` and `CommentReactionSender`

```typescript
export type CommentReactionSender = {
  id: string;
  name: string;
};

export type CommentReaction = {
  emoji: string;
  count: number;
  hasReacted: boolean;
  senders?: CommentReactionSender[];
};
```

No change.

### `CommentData`

```typescript
export type CommentData = {
  id: string;
  author: CommentAuthor;
  content: string;
  timestamp: string;        // ISO 8601
  parentId?: string;        // Tree relationship: absent → top-level; set → reply to top-level (one level only)
  isDeleted?: boolean;
  reactions: CommentReaction[];
  canDelete: boolean;
};
```

No change. The one-level invariant (R3) is enforced by rendering, not by the type: the mapper may produce a `CommentData` whose `parentId` points to a reply (a data anomaly), and `CommentThread` will simply not render it because it iterates `topLevel` and then looks up `repliesByParent` for each top-level id. Hiding the Reply button on replies prevents the anomaly from occurring client-side.

### `CommentsContainerData` (trimmed)

**Before:**
```typescript
export type CommentsContainerData = {
  comments: CommentData[];
  canComment: boolean;                               // ❌ unused — REMOVE
  currentUser?: CommentAuthor;
  loading?: boolean;
  onAddComment: (content: string) => void;           // ❌ unused — REMOVE
  onReply: (parentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onAddReaction: (commentId: string, emoji: string) => void;
  onRemoveReaction: (commentId: string, emoji: string) => void;
};
```

**After:**
```typescript
export type CommentsContainerData = {
  comments: CommentData[];
  currentUser?: CommentAuthor;
  loading?: boolean;
  onReply: (parentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onAddReaction: (commentId: string, emoji: string) => void;
  onRemoveReaction: (commentId: string, emoji: string) => void;
};
```

**Rationale**: ISP cleanup (R5). The component never rendered an input inline; the composite host (`EventDetailView`, `CalloutDetailDialog`) renders `CommentInput` separately through a sibling slot.

**Call-site impact**: One file. `src/main/crdPages/space/hooks/useCrdRoomComments.tsx:100,102` currently passes `canComment={canComment}` and `onAddComment={content => void postMessage(content)}`. Both lines are removed; the hook's local `canComment` variable and `postMessage` closure continue to be used for the separately-rendered `<CommentInput>` below.

---

## `CommentItem` props — reply affordance rule

**Prop shape is unchanged**, but the render rule for the Reply button is tightened:

```typescript
type CommentItemProps = {
  comment: CommentData;
  onReply: (parentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onAddReaction: (commentId: string, emoji: string) => void;
  onRemoveReaction: (commentId: string, emoji: string) => void;
  currentUser?: CommentAuthor;
  isReply?: boolean;        // NEW invariant: when true, Reply button MUST NOT render
};
```

**Invariant (new)**: `Reply button renders ⇔ !comment.isDeleted && !isReply`.

The Delete button remains available when `canDelete && !isDeleted`, independent of `isReply`.

---

## `CommentThread` sort rule (changed)

Top-level comments are sorted **newest-first** unconditionally:

```typescript
const sortedTopLevel = [...topLevel].sort(
  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
);
```

Replies within each `parentId` group remain **oldest-first** (unchanged):

```typescript
repliesByParent.set(
  parentId,
  [...replies].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
);
```

The `useState<SortOrder>` and the sort-toggle `Button` are removed.

---

## Composite slot contracts (unchanged — for reference)

### `EventDetailView` slots
```typescript
type EventDetailViewProps = {
  // …
  showComments: boolean;
  commentCount?: number;
  commentsSlot?: ReactNode;      // <CommentThread /> rendered by connector
  commentInputSlot?: ReactNode;  // <CommentInput /> rendered by connector, null when !canComment
  // …
};
```

The slot types do not change. What changes is the internal JSX placement: `commentInputSlot` renders **above** `commentsSlot`, and `commentsSlot` is wrapped in `max-h-[400px] overflow-y-auto pr-2` instead of `min-h-0 flex-1 overflow-y-auto pr-2`.

### `CalloutDetailDialog` slots
Same pattern: `commentsSlot` + `commentInputSlot` props remain; `commentInputSlot` moves from the sticky footer into the scroll-flow above `commentsSlot`.

---

## Upstream domain model (unchanged — reference only)

The GraphQL-backed `Message` type (`src/domain/communication/room/models/Message`) has:

- `id: string`
- `message: string`
- `timestamp: number` (epoch millis)
- `threadID?: string` — parent message id; absent for top-level
- `sender?: { id, profile }`
- `reactions: Reaction[]`

The mapper at `src/main/crdPages/space/dataMappers/commentDataMapper.ts` converts `Message[]` → `CommentData[]` and restores missing parents as placeholder `CommentData` with `isDeleted: true`. The mapper is **not** changed by this feature.

Tree construction remains a two-pass grouping inside `CommentThread`:

1. Partition by `parentId` presence → `topLevel` vs `repliesByParent` map.
2. Sort `topLevel` newest-first; sort each parent's replies oldest-first.
3. Render top-level comments; under each, render its reply list.

Top-level-only rendering is what enforces the one-level invariant visually — any `CommentData` whose `parentId` points to a non-top-level id will not render. Combined with hiding the Reply button on replies (R3), the client cannot produce such anomalies.
