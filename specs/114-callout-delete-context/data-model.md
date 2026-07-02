# Data Model: Context-Aware Callout Delete Confirmation

**Feature**: 114-callout-delete-context | **Date**: 2026-07-02

No backend schema or persistence changes. This document defines the **client-side view model** (a plain-TypeScript summary) that the pure mapper produces from the already-cached `CalloutDetailsModelExtended`, plus the source fields it reads.

---

## Source (read-only, already in Apollo cache)

From `CalloutDetailsModelExtended` (= `CalloutModelExtension<CalloutDetailsModel>`), populated by the `CalloutDetails` fragment:

| Source field | Type | Used for |
|---|---|---|
| `framing.type` | `CalloutFramingType` | Determine rich-content kind |
| `framing.whiteboard` | `WhiteboardDetails?` | Presence of a whiteboard body |
| `framing.memo` | `MemoModel?` | Presence of a note/memo body |
| `framing.poll` | `PollDetailsModel?` | Presence of a poll |
| `framing.mediaGallery` | `MediaGalleryModel?` | Presence of a media gallery |
| `framing.collaboraDocument` | `{ id; documentType; profile? }?` | Presence of a document |
| `framing.link` | `LinkDetails?` (`{ uri; profile.displayName }`) | Named body link |
| `framing.profile.references` | `ReferenceModel[]?` (`{ id; name; uri }`) | Named attached links/references |
| `contributions` | `(Identifiable & { sortOrder })[]` | Contribution **count** only (`.length`) |
| `comments` | `CommentsWithMessagesModel?` (`{ messagesCount }`) | Comment count |

> `contributions` carries no per-item type/title on the model, so only its length is used (Option A / Decision 2).

---

## View model (produced by the mapper, consumed by CRD)

Plain TypeScript — no GraphQL types cross into `src/crd/`.

```ts
/** Rich framing-body kinds we can name from cache. */
export type CalloutRichContentKind =
  | 'whiteboard'
  | 'memo'      // "note"
  | 'poll'
  | 'mediaGallery'
  | 'document';

/** A nameable link/reference to be listed. */
export type DeletionLinkItem = {
  id: string;
  /** Display label — reference name / link display name, falling back to the URL. */
  label: string;
};

/** Everything the delete dialog needs to describe what will be removed. */
export type CalloutDeletionSummary = {
  /** Total contributions inside the callout (posts, whiteboards, links, …). */
  contributionCount: number;
  /** Rich framing body, if the callout's own body is one of these. */
  richContent?: CalloutRichContentKind;
  /** Named links: framing body link + framing references (deduped, order stable). */
  links: DeletionLinkItem[];
  /** Number of comments/messages attached to the callout. */
  commentCount: number;
};
```

### Derived predicate

```ts
const hasDeletableContent =
  summary.contributionCount > 0 ||
  summary.richContent !== undefined ||
  summary.links.length > 0 ||
  summary.commentCount > 0;
```

Drives (a) whether the content body renders at all (FR-008) and (b) the confirm-label choice (FR-009).

---

## Mapping rules (pure, deterministic)

`mapCalloutToDeletionSummary(callout: CalloutDetailsModelExtended): CalloutDeletionSummary`

1. **contributionCount** = `callout.contributions?.length ?? 0`.
2. **richContent**:
   - `framing.whiteboard` → `'whiteboard'`
   - else `framing.memo` → `'memo'`
   - else `framing.poll` → `'poll'`
   - else `framing.mediaGallery` → `'mediaGallery'`
   - else `framing.collaboraDocument` → `'document'`
   - else `undefined`
   - (A `framing.link` body is surfaced via **links**, not `richContent`.)
3. **links**: concat of
   - `framing.link` → `{ id: framing.link.id ?? 'framing-link', label: framing.link.profile.displayName || framing.link.uri }` (only if present)
   - each `framing.profile.references[]` → `{ id, label: name || uri }`
   - Filter out empty labels; keep source order.
4. **commentCount** = `callout.comments?.messagesCount ?? 0`.

No mutation, no I/O, no `Date`/random — safe to unit-test in isolation and (incidentally) resume-safe.

---

## Rendering contract (CRD `CalloutDeletionSummary`)

Input: `summary: CalloutDeletionSummary` + a display cap (`LIST_CAP = 3`). Output (semantic `<ul role="list">`):

| Summary state | Rendered line(s) |
|---|---|
| `contributionCount > 0` | `deleteCallout.contributions` with plural count ("3 contributions") |
| `richContent` set | `deleteCallout.including` + `deleteCallout.contentType.<kind>` ("including a whiteboard") |
| `links.length ≤ 3` | one `<li>` per link (label) |
| `links.length > 3` | first 3 links + `deleteCallout.moreLinks` plural line ("and 2 more links") |
| `commentCount > 0` | `deleteCallout.comments` plural line ("and 5 comments") |
| none of the above | body omitted entirely (empty callout) |

Confirm label: `hasDeletableContent ? deleteCallout.confirmAll : deleteCallout.confirm`.

---

## Validation / invariants

- `contributionCount`, `commentCount` are non-negative integers.
- `links` labels are non-empty strings (URL fallback guarantees this when a reference has no name).
- The mapper never throws on partial data (all source fields optional-chained).
- No `__typename` branching anywhere (CRD rule): rich-content kind is derived from concrete framing body fields / `CalloutFramingType`, not `__typename`.
