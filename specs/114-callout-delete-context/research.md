# Research: Context-Aware Callout Delete Confirmation

**Feature**: 114-callout-delete-context | **Date**: 2026-07-02

All Technical Context items are known (existing repo, established patterns). No `NEEDS CLARIFICATION` markers remain after `/speckit.clarify`. This document records the design decisions that resolve the "how" of the spec.

---

## Decision 1 — Data source for the content summary (Option A)

**Decision**: Build the summary exclusively from data that arrives with the callout's **standard load** — the `CalloutDetails` fragment. Do **not** issue any query when the dialog opens. The fragment's `contributions` selection is **extended** with the contributed entities' titles and markdown descriptions (`post`/`whiteboard`/`memo`/`collaboraDocument` → `profile { displayName description }`; `link` already selects both), so they ride along with the query that already runs — one fragment extension + `pnpm codegen`, zero extra round-trips at dialog-open time.

**Rationale**: The 2026-07-02 clarification chose Option A (easily-available data, no extra fetch on open). Inspection of `src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql` (fragment `CalloutDetails`), the schema (`CalloutContribution.post/whiteboard/memo/link/collaboraDocument`, each with a non-null `profile.displayName`), and `CalloutDetailsModel.ts` confirms the following are available at delete time:

| Summary element | Source (arrives with the standard load) | Notes |
|---|---|---|
| Contribution count | `callout.contributions.length` | Exact total — the fragment fetches all contribution stubs, not a page. |
| Contribution titles + description previews | `callout.contributions[].{post,whiteboard,memo,link,collaboraDocument}.profile.{displayName,description}` | Fragment extension (title + description selections); `link` was already selected via `LinkDetailsWithAuthorization`. |
| Rich framing content type | `callout.framing.type` (`CalloutFramingType`) + `framing.whiteboard` / `.memo` / `.poll` / `.mediaGallery` / `.collaboraDocument` | Enables "including the whiteboard/note/poll/media gallery/document". |
| Framing body link | `callout.framing.link` (`{ uri, profile.displayName }`) | A named link when the callout body is a link. |
| Attached references/links | `callout.framing.profile.references[]` (`ReferenceModel`: `name`/`displayName` + `uri`) | Named links/references. |
| Comments | `callout.comments` (`CommentsWithMessagesModel`) | Optional "and N comments" line; count already cached. |

**Alternatives considered**:
- *Fetch a breakdown on open* — a dedicated query (like the sort dialog's `CalloutContributionsSortOrder`) fired when the dialog opens. Rejected by clarification: an extra round-trip at the moment of deletion for data the standard load can carry.
- *Count-only summary (no titles)* — cheapest (no fragment change), but hides exactly the information that makes the consequence concrete. Rejected: titles are cheap to carry (one string per contribution) and the payload rides an already-lazy per-callout details query.
- *Full per-contribution author/date* — heaviest; rejected (summary-level identification only).

## Decision 2 — Naming individual contributions (posts/whiteboards/memos/links/documents)

**Decision**: Contributions render as a **table**. The header carries the exact total composed with the rich framing body when present ("The whiteboard and 20 contributions will be deleted" / "20 contributions will be deleted" / "The whiteboard will be deleted"). Each of the first 3 contributions (`LIST_CAP`), sorted by `sortOrder`, gets a row: **bold title** on the left and a **one-line markdown description preview** with ellipsis (`InlineMarkdown clampLines={1}`) on the right. A comment-count row ("27 comments will be deleted") and a final clip-icon row with the "including attached files and links" note (attachments remain non-enumerable) close the table. No lead-in line above the table.

**Rationale**: Every contribution type carries a non-null `profile.displayName` (and a markdown `description`) in the schema, so a title+description selection per type on the `contributions` field is enough. `CalloutDetailsModel.contributions` widens from `(Identifiable & { sortOrder })[]` to carry the titled entity stubs; the details hook (`useCalloutDetails`) maps structurally (object spread), so no mapping-site change is needed. **Freshness**: every contribution create/delete path refetches `CalloutDetails` alongside `CalloutContributions` (the whiteboard/memo add connectors originally refetched only the grid query — aligned as part of this feature), and rename mutations select `profile { id displayName }` so the normalized cache propagates title changes without a refetch. The count stays authoritative from `contributions.length` even if an individual title were missing — the remainder row's arithmetic (`contributionCount − rows shown`) covers unnameable and beyond-cap items. Descriptions are user-generated markdown → rendered via `InlineMarkdown` (Golden Rule #10), never as raw text.

## Decision 3 — Where the variable body is rendered (respect Golden Rule #9)

**Decision**: Extend the shared `ConfirmationDialog` (confirm variant) with an optional `children?: ReactNode` body slot rendered beneath the description. `DeleteCalloutDialog` composes `ConfirmationDialog` and fills that slot with a new presentational `CalloutDeletionSummary`.

**Rationale**: Golden Rule #9 requires every CRD deletion to route through `ConfirmationDialog`; forking a bespoke `AlertDialog` for callouts would diverge from that invariant and the reference pattern. A body slot is the minimal, backward-compatible extension (existing callers pass no children → no visual change). The confirm variant also gains an opt-in `showCloseButton` — an X in the title bar wired to the cancel path (`dialogs.close` aria-label), enabled by `DeleteCalloutDialog`. The discard variant is untouched.

**Alternatives considered**:
- *Rebuild `DeleteCalloutDialog` directly on `AlertDialog` primitives* — violates the single-confirmation-surface convention; rejected.
- *Pass the whole body as the `description` string* — `description` is a single string rendered in `<AlertDialogDescription>`; a structured `<ul>` list with semantic markup can't be a string. Rejected.

## Decision 4 — Cap, overflow, and pluralization

**Decision**: Cap nameable items at **3** per list (clarification 2026-07-02). Contribution rows: when exactly 4 exist the 4th renders as a row; beyond that a "{{count}} contributions more..." row carries the remainder (the header keeps the exact total). Named links: an "and {{count}} more links" line carries the remainder. All counted strings use i18next plural forms (`_one`/`_other`).

**Rationale**: Matches the clarified cap and the spec's singular/plural requirement (FR-003, edge cases). Cap is a **display** concern → applied in the CRD view; the mapper passes counts + small arrays so the view can compute remainders accurately.

## Decision 5 — Confirm-button label scope

**Decision**: Derive the confirm label in `DeleteCalloutDialog`: when the summary indicates any content (`contributionCount > 0 || richContent || links.length > 0 || commentCount > 0`), use `deleteCallout.confirmAll` ("Delete callout and all contents"); otherwise the existing `deleteCallout.confirm` ("Delete"). Empty callouts also omit the content body (FR-008).

**Rationale**: Satisfies FR-009 and Story 2 while keeping empty-callout behavior concise (Story 3).

## Decision 6 — i18n placement & keys

**Decision**: Add keys under the existing `crd-space` namespace's `deleteCallout` object, in all six locale files (`space.<lang>.json`), preserving key parity (enforced by `space.parity.test.ts` + review). Rich-content type names are interpolated via a small key set (e.g. `deleteCallout.contentType.whiteboard`).

**Rationale**: Callout copy already lives in `crd-space`; the delete keys are there today. Constitution Arch #3 requires all six languages in the same change.

## Decision 7 — Accessibility & dates

**Decision**: Render the contribution summary as a semantic `<table>` (`<thead>` header row, `<th scope="row">` title cells) and the named links as a semantic `<ul>`/`<li>` list; decorative icons (`Paperclip`) are `aria-hidden`; the destructive confirm keeps its existing styling/focus handling from `ConfirmationDialog`. If any date is shown (not required by MVP since author/date aren't cached), format with `date-fns` + `resolveDateFnsLocale(i18n.language)` — never `dayjs`.

**Rationale**: CRD accessibility rules (semantic structure, icons hidden from AT) and date rule #7. MVP renders no per-item date, so `date-fns` is likely unused; the rule is noted for the optional stretch.

---

## Summary of resolved unknowns

| Unknown | Resolution |
|---|---|
| Extra fetch on open? | No — data rides the standard callout load (Option A); one `CalloutDetails` fragment extension + codegen |
| Name individual contributions? | Yes — a table: header with the exact total (composed with the rich framing body), first 3 rows of bold title + one-line description preview, comments row, clip-icon attachments row |
| How to render variable body under Golden Rule #9? | Add optional `children` slot to `ConfirmationDialog` confirm variant |
| List cap / overflow / plurals | Cap 3 per named list (4th contribution shown when exactly 4); remainders via "N contributions more..." / "and N more links"; i18next plural forms |
| Confirm label | Content-aware: `confirmAll` vs `confirm` |
| i18n | `crd-space` `deleteCallout.*`, six languages, parity-tested |
