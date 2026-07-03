# Data Model: Context-Aware Callout Delete Confirmation

**Feature**: 114-callout-delete-context | **Date**: 2026-07-02

No backend schema or persistence changes. The `CalloutDetails` fragment's `contributions` selection is **extended client-side** with title-only sub-selections (`post`/`whiteboard`/`memo`/`collaboraDocument` → `profile { id displayName }`; `link` was already selected), and `CalloutDetailsModel.contributions` widens to carry them. This document defines the **client-side view model** (a plain-TypeScript summary) that the pure mapper produces from `CalloutDetailsModelExtended`, plus the source fields it reads.

---

## Source (read-only, arrives with the callout's standard load)

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
| `contributions` | `CalloutContributionStub[]` (below) | Contribution **titles** + exact **count** (`.length`) |
| `comments` | `CommentsWithMessagesModel?` (`{ messagesCount }`) | Comment count |

### `CalloutContributionStub` (widened model type)

```ts
type TitledStub = { id: string; profile: { id: string; displayName: string; description?: string } };

// CalloutDetailsModel.contributions item:
Identifiable & {
  sortOrder: number;
  post?: TitledStub;
  whiteboard?: TitledStub;
  memo?: TitledStub;
  link?: LinkDetails;            // already selected (LinkDetailsWithAuthorization, incl. description)
  collaboraDocument?: TitledStub;
};
```

> Exactly one of the entity stubs is set per contribution (schema invariant). The fragment selects **titles + markdown descriptions only** (the description feeds a one-line clamped preview) — no content bodies, visuals, or authors — so the standard load stays light (Option A / Decision 2).

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

/** A nameable item (contribution or link/reference) to be listed. */
export type DeletionListItem = {
  id: string;
  /** Display label — entity title / reference name, falling back to the URL for links. */
  label: string;
  /** Markdown description of the entity — rendered as a one-line clamped preview. */
  description?: string;
};

/**
 * Everything the delete dialog needs to describe what will be removed.
 * Named `…Model` to avoid colliding with the CRD component `CalloutDeletionSummary`
 * (`DeleteCalloutDialog.tsx` imports both).
 */
export type CalloutDeletionSummaryModel = {
  /** Exact total of contributions inside the callout (authoritative — may exceed `contributions.length`). */
  contributionCount: number;
  /** Titled contributions (posts, whiteboards, memos, links, documents), sorted by sortOrder. */
  contributions: DeletionListItem[];
  /** Rich framing body, if the callout's own body is one of these. */
  richContent?: CalloutRichContentKind;
  /** Named links: framing body link + framing references (source order). */
  links: DeletionListItem[];
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

`mapCalloutToDeletionSummary(callout: CalloutDetailsModelExtended): CalloutDeletionSummaryModel`

1. **contributionCount** = `callout.contributions?.length ?? 0` (exact total, independent of how many items are nameable).
2. **contributions**: `callout.contributions` sorted by `sortOrder` ascending, each mapped to
   `{ id, label, description }` — label from `post/whiteboard/memo/collaboraDocument profile.displayName`, or `link profile.displayName || link.uri`; description from the same profile's markdown `description` (empty → `undefined`). First entity stub present wins — the schema sets exactly one. Filter out items with no usable label.
3. **richContent**:
   - `framing.whiteboard` → `'whiteboard'`
   - else `framing.memo` → `'memo'`
   - else `framing.poll` → `'poll'`
   - else `framing.mediaGallery` → `'mediaGallery'`
   - else `framing.collaboraDocument` → `'document'`
   - else `undefined`
   - (A `framing.link` body is surfaced via **links**, not `richContent`.)
4. **links**: concat of
   - `framing.link` → `{ id: framing.link.id ?? 'framing-link', label: framing.link.profile.displayName || framing.link.uri }` (only if present)
   - each `framing.profile.references[]` → `{ id, label: name || uri }`
   - Filter out empty labels; keep source order.
5. **commentCount** = `callout.comments?.messagesCount ?? 0`.

No mutation, no I/O, no `Date`/random — safe to unit-test in isolation and (incidentally) resume-safe.

---

## Rendering contract (CRD `CalloutDeletionSummary`)

Input: `summary: CalloutDeletionSummaryModel` + a display cap (`LIST_CAP = 3`). Output: a semantic `<table>` (when contributions, rich content, or comments exist) followed by a semantic `<ul>` of named links. No lead-in line. The table has an outer border (`border border-border`) in addition to the per-row separators.

**Table header** (`<thead>`, one `<th colSpan=2>` row — omitted when neither rich content nor contributions exist):

| State | Header text |
|---|---|
| `richContent` + `contributionCount > 0` | `deleteCallout.headerRichContributions` — "The whiteboard and 20 contributions will be deleted" (plural via count) |
| `richContent` only | `deleteCallout.headerRich` — "The whiteboard will be deleted" |
| `richContent === 'poll'` | dedicated keys `deleteCallout.headerRichPoll` / `headerRichPollContributions` — "The poll and its results will be deleted" / "The poll, its results and 20 contributions will be deleted" (full sentences, not contentType composition: the compound subject needs a plural verb in most supported languages) |
| `contributionCount > 0` only | `deleteCallout.headerContributions` — "20 contributions will be deleted" (exact total; plural via count) |

**Table body rows**, in order:

| Row | Rendered |
|---|---|
| First 3 contributions (one row each; all 4 when exactly 4 exist) | `<th scope="row">` title in **bold** on the left + one-line markdown `description` preview with ellipsis (`InlineMarkdown clampLines={1}`, `text-caption` size) on the right. |
| More than 4 contributions (or unnameable items) | `deleteCallout.moreContributions` plural row — "17 contributions more..." (remainder = `contributionCount − rows shown`, so unnameable items are counted too). |
| `commentCount > 0` | `deleteCallout.comments` plural row — "27 comments will be deleted" |
| `contributionCount > 0` (last row) | clip icon (`Paperclip`, `aria-hidden`) + `deleteCallout.attachmentsNote` ("including attached files and links" — attachments are not enumerable, FR-007) |

**Links** (below the table, unchanged): first 3 as `<li>`s; `links.length > 3` adds a `deleteCallout.moreLinks` plural line ("and 2 more links"). When nothing at all is deletable, the body is omitted entirely (empty callout).

Confirm label: `hasDeletableContent ? deleteCallout.confirmAll : deleteCallout.confirm`.

Title bar: an X close control (`ConfirmationDialog showCloseButton`, aria-label `dialogs.close`) closes the dialog via the cancel path — no deletion.

Dialog description: the existing `deleteCallout.description` is **reworded neutral** — "“{{title}}” will be deleted permanently. This cannot be undone." — dropping the static "along with its contributions and comments" claim. The content list (not the description) carries the scope, so the empty-callout dialog communicates only that the callout itself will be deleted (FR-008 / US3).

Long contribution titles and link labels are truncated (Tailwind `truncate` on the `<li>` label) so the dialog stays readable and the confirm/cancel actions remain reachable (spec edge case "Very long titles").

---

## Validation / invariants

- `contributionCount`, `commentCount` are non-negative integers; `contributions.length ≤ contributionCount` (the header's exact total stays authoritative for unnameable or beyond-cap items).
- `contributions` and `links` labels are non-empty strings (URL fallback guarantees this for links; unnameable contributions are filtered).
- The mapper never throws on partial data (all source fields optional-chained).
- No `__typename` branching anywhere (CRD rule): rich-content kind is derived from concrete framing body fields / `CalloutFramingType`, not `__typename`.
