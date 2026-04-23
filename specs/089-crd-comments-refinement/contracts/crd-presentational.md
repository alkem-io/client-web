# CRD Presentational Contracts — Comments Refinement

**Feature**: 089-crd-comments-refinement
**Date**: 2026-04-21

Presentation-only contract changes. No GraphQL, domain, or routing contracts are affected. The contracts below describe the **component prop shape** and the **layout contract** between the CRD composites and their consumers (integration connectors).

All contracts honor the CRD golden rules: plain-TypeScript props, no GraphQL types, no MUI imports, `on*` handlers as props, visual-only state.

---

## 1. `CommentThread` — `CommentsContainerData` (TRIMMED)

**File**: `src/crd/components/comment/types.ts`
**Consumers**: one — `useCrdRoomComments` at `src/main/crdPages/space/hooks/useCrdRoomComments.tsx`.

### Interface after this feature

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

### Removed fields (source-breaking)

| Field | Reason |
|-------|--------|
| `canComment: boolean` | Never read by `CommentThread`. The input is rendered separately by the parent composite. |
| `onAddComment: (content: string) => void` | Never invoked by `CommentThread`. Parent composite's `<CommentInput>` uses its own `onSubmit` callback. |

### Migration note

`useCrdRoomComments.tsx` is the only call site. TypeScript will surface the two extra props at the call site at compile time; the fix is to delete those two lines. The hook's internal `canComment` variable and the `postMessage` closure are retained for the separately rendered `<CommentInput>` in the same hook.

---

## 2. `CommentThread` — rendering contract (CHANGED)

**File**: `src/crd/components/comment/CommentThread.tsx`

### New invariants

1. **Header**: shows the comment count (`comments.count`) on the left; **no sort control** on the right.
2. **Sort order (top-level)**: newest-first. Non-configurable.
3. **Sort order (replies)**: oldest-first within each top-level parent. Non-configurable.
4. **List rendering**: one-level tree — top-level items map to `<CommentItem comment={c} />`, each followed by its replies rendered as `<CommentItem comment={reply} isReply={true} />`.

### Removed
- `useState<SortOrder>` and its toggle `Button` in the header row.
- `t('comments.sortNewest')` and `t('comments.sortOldest')` lookups.

---

## 3. `CommentItem` — Reply-button visibility rule (CHANGED)

**File**: `src/crd/components/comment/CommentItem.tsx`

### New invariant

```text
Reply button renders  ⇔  !comment.isDeleted && !isReply
```

### Props (unchanged shape)

```typescript
type CommentItemProps = {
  comment: CommentData;
  onReply: (parentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onAddReaction: (commentId: string, emoji: string) => void;
  onRemoveReaction: (commentId: string, emoji: string) => void;
  currentUser?: CommentAuthor;
  isReply?: boolean;
};
```

`isReply` was previously used only to add `ml-10` indentation. Now it additionally gates the Reply button. Delete behavior is unchanged.

---

## 4. `EventDetailView` — comments-column layout contract (CHANGED)

**File**: `src/crd/components/space/timeline/EventDetailView.tsx`

### Prop shape (unchanged)

```typescript
type EventDetailViewProps = {
  event: EventDetailData;
  showComments: boolean;
  commentCount?: number;
  commentsSlot?: ReactNode;
  commentInputSlot?: ReactNode;
  onBack: () => void;
  resolveColor: (id: string) => string;
  locale?: Locale;
};
```

### Layout contract (CHANGED)

When `showComments === true`, the comments column renders in this order, top-to-bottom:

1. Header — `<h4 className="text-label uppercase text-muted-foreground">{t('calendar.details.comments')} <span>(N)</span></h4>`
2. `commentInputSlot` (only if provided) — plain `<div>` wrapper, no border, no spacing other than `gap-3` from the column.
3. Comments list — `<div className="max-h-[400px] overflow-y-auto pr-2">{commentsSlot}</div>`.

The column wrapper is `<div className="flex flex-col gap-3">`. **No** `min-h-0` or `flex-1` — the column is natural-height now.

### Removed
- `border-t border-border pt-3` separator that previously lived around the (now-relocated) `commentInputSlot`.
- `min-h-0 flex-1` on the column and `flex-1` on the list wrapper.

### Responsive
- Desktop (≥768px): commentsColumn is the right column in a `flex flex-row gap-6`; `max-w-[28rem]` preserved.
- Mobile (<768px): commentsColumn is below the event body with a `border-t border-border pt-4` separator — unchanged.

---

## 5. `CalloutDetailDialog` — footer removal (CHANGED)

**File**: `src/crd/components/callout/CalloutDetailDialog.tsx`

### Prop shape (unchanged)

```typescript
type CalloutDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callout: CalloutDetailDialogData;
  commentsSlot: ReactNode;
  commentInputSlot?: ReactNode;
  contributionsSlot?: ReactNode;
  hasContributions?: boolean;
  contributionsCount?: number;
  // …
};
```

### Layout contract (CHANGED)

- `commentInputSlot` (when provided) renders **above** `commentsSlot` in the scroll-flow body (not in a sticky footer).
- The previous sticky footer block is **removed**:

  ```tsx
  // REMOVED
  {commentInputSlot && (
    <div className="shrink-0 p-4 bg-background border-t border-border z-20">
      <div className="max-w-4xl mx-auto">{commentInputSlot}</div>
    </div>
  )}
  ```

The input now flows with the thread content; scrolling the dialog scrolls input + thread together.

---

## 6. Integration-layer contract — `useCrdRoomComments` (CHANGED)

**File**: `src/main/crdPages/space/hooks/useCrdRoomComments.tsx`

### Before

```tsx
const thread = (
  <CommentThread
    loading={loading}
    comments={comments}
    canComment={canComment}                                    // REMOVE
    currentUser={currentUser}
    onAddComment={content => void postMessage(content)}        // REMOVE
    onReply={(parentId, content) => void postReply({ … })}
    onDelete={commentId => void handleDelete(commentId)}
    onAddReaction={(commentId, emoji) => void addReaction({ … })}
    onRemoveReaction={(commentId, emoji) => { /* … */ }}
  />
);
```

### After

```tsx
const thread = (
  <CommentThread
    loading={loading}
    comments={comments}
    currentUser={currentUser}
    onReply={(parentId, content) => void postReply({ … })}
    onDelete={commentId => void handleDelete(commentId)}
    onAddReaction={(commentId, emoji) => void addReaction({ … })}
    onRemoveReaction={(commentId, emoji) => { /* … */ }}
  />
);
```

The hook's return shape — `{ thread, commentInput, commentCount }` — is **unchanged**. Consumers (`CalloutCommentsConnector`, `CalendarCommentsConnector` via `EventDetailConnector`) do not need to change.

`canComment` is still computed inside the hook and used to decide whether to return a `commentInput` or `null`. That is the only remaining consumer of the value inside this file.

---

## 7. i18n keys (REMOVED)

**Files**: `src/crd/i18n/space/space.{en,nl,es,bg,de,fr}.json`

| Key | Status |
|-----|--------|
| `comments.sortNewest` | **REMOVE** — no remaining references after `CommentThread` rewrite. |
| `comments.sortOldest` | **REMOVE** — same. |

Per the CRD CLAUDE.md, CRD translations are managed manually (not Crowdin); the English source and all 5 localized files are edited directly in the same PR.

---

## Backwards compatibility

This feature is pre-release (the CRD toggle is off by default in production). Breaking the `CommentsContainerData` type is acceptable — there is exactly one call site. No migration shim, no deprecation window needed.

## Accessibility contract

Unchanged. The bounded-height scroll region is a native browser scroll container and remains keyboard-operable (Tab to focus within, arrow-keys on elements, Space/Page-Down to scroll when focus is on the list). The existing `aria-label` on the loading state (`output` element in `CommentThread`) and `aria-label` on icon-only buttons in `CommentInput` are untouched.
