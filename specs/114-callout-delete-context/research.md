# Research: Context-Aware Callout Delete Confirmation

**Feature**: 114-callout-delete-context | **Date**: 2026-07-02

All Technical Context items are known (existing repo, established patterns). No `NEEDS CLARIFICATION` markers remain after `/speckit.clarify`. This document records the design decisions that resolve the "how" of the spec.

---

## Decision 1 — Data source for the content summary (Option A)

**Decision**: Build the summary exclusively from fields the `CalloutDetails` fragment already selects and that are exposed on `CalloutDetailsModel(Extended)`. Do **not** issue any query when the dialog opens; do **not** change the fragment or run codegen.

**Rationale**: The 2026-07-02 clarification chose Option A (easily-available data, no extra fetch). Inspection of `src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql` (fragment `CalloutDetails`) and `CalloutDetailsModel.ts` confirms the following are already in cache at delete time:

| Summary element | Source field (already cached) | Notes |
|---|---|---|
| Contribution count | `callout.contributions.length` | Already used by the connector (`contributionsCount`). Type-only; no per-item type breakdown on the model. |
| Rich framing content type | `callout.framing.type` (`CalloutFramingType`) + `framing.whiteboard` / `.memo` / `.poll` / `.mediaGallery` / `.collaboraDocument` | Enables "including a whiteboard/note/poll/media gallery/document". |
| Framing body link | `callout.framing.link` (`{ uri, profile.displayName }`) | A named link when the callout body is a link. |
| Attached references/links | `callout.framing.profile.references[]` (`ReferenceModel`: `name`/`displayName` + `uri`) | Named links/references. |
| Comments | `callout.comments` (`CommentsWithMessagesModel`) | Optional "and N comments" line; count already cached. |

**Alternatives considered**:
- *Option B (fetch a lightweight breakdown on open)* — would list posts/whiteboards by title and needs a fragment extension + codegen + a round-trip on open. Rejected by clarification (cost > marginal value).
- *Option C (full per-contribution author/date)* — heaviest; rejected.

## Decision 2 — Naming individual contributions (posts/whiteboards)

**Decision**: For the MVP, contributions are summarized by **count only** ("N contributions"). Do not attempt to name individual post/whiteboard/memo contributions.

**Rationale**: `CalloutDetailsModel.contributions` is typed `(Identifiable & { sortOrder: number })[]` — it deliberately drops per-contribution detail even though the fragment fetches `contributions.link`. Naming contributions would require either the on-demand `CalloutContributionsSortOrder` query (an extra fetch — excluded by Option A) or a TS-model change to surface the already-fetched `link`. FR-002 makes naming a **MAY**, with count as the required primary representation. Count is reliably available with zero data-layer change.

**Optional stretch (out of MVP)**: expose the already-fetched `contributions[].link` on the model type (a pure TypeScript change, still no query/codegen) to name link-type contributions. Deferred; not required to satisfy any FR.

## Decision 3 — Where the variable body is rendered (respect Golden Rule #9)

**Decision**: Extend the shared `ConfirmationDialog` (confirm variant) with an optional `children?: ReactNode` body slot rendered beneath the description. `DeleteCalloutDialog` composes `ConfirmationDialog` and fills that slot with a new presentational `CalloutDeletionSummary`.

**Rationale**: Golden Rule #9 requires every CRD deletion to route through `ConfirmationDialog`; forking a bespoke `AlertDialog` for callouts would diverge from that invariant and the reference pattern. A body slot is the minimal, backward-compatible extension (existing callers pass no children → no visual change). The discard variant is untouched.

**Alternatives considered**:
- *Rebuild `DeleteCalloutDialog` directly on `AlertDialog` primitives* — violates the single-confirmation-surface convention; rejected.
- *Pass the whole body as the `description` string* — `description` is a single string rendered in `<AlertDialogDescription>`; a structured `<ul>` list with semantic markup can't be a string. Rejected.

## Decision 4 — Cap, overflow, and pluralization

**Decision**: When a list of nameable items (links/references, or contributions in the stretch) is rendered, cap at **3** items (clarification 2026-07-02) and append an "and {{count}} more …" line for the remainder. All counted strings use i18next plural forms (`_one`/`_other`).

**Rationale**: Matches the clarified cap and the spec's singular/plural requirement (FR-003, edge cases). Cap is a **display** concern → applied in the CRD view; the mapper passes counts + small arrays so the view can compute the remainder accurately.

## Decision 5 — Confirm-button label scope

**Decision**: Derive the confirm label in `DeleteCalloutDialog`: when the summary indicates any content (`contributionCount > 0 || richContent || links.length > 0 || commentCount > 0`), use `deleteCallout.confirmAll` ("Delete callout and all contents"); otherwise the existing `deleteCallout.confirm` ("Delete"). Empty callouts also omit the content body (FR-008).

**Rationale**: Satisfies FR-009 and Story 2 while keeping empty-callout behavior concise (Story 3).

## Decision 6 — i18n placement & keys

**Decision**: Add keys under the existing `crd-space` namespace's `deleteCallout` object, in all six locale files (`space.<lang>.json`), preserving key parity (enforced by `space.parity.test.ts` + review). Rich-content type names are interpolated via a small key set (e.g. `deleteCallout.contentType.whiteboard`).

**Rationale**: Callout copy already lives in `crd-space`; the delete keys are there today. Constitution Arch #3 requires all six languages in the same change.

## Decision 7 — Accessibility & dates

**Decision**: Render the content list as a semantic `<ul role="list">` with `<li>` items; the destructive confirm keeps its existing styling/focus handling from `ConfirmationDialog`. If any date is shown (not required by MVP since author/date aren't cached), format with `date-fns` + `resolveDateFnsLocale(i18n.language)` — never `dayjs`.

**Rationale**: CRD accessibility rules (lists use `<ul>`/`<li>`) and date rule #7. MVP renders no per-item date, so `date-fns` is likely unused; the rule is noted for the optional stretch.

---

## Summary of resolved unknowns

| Unknown | Resolution |
|---|---|
| Extra fetch on open? | No — cache-only (Option A) |
| Name individual contributions? | Count only in MVP; naming deferred (optional TS-only stretch) |
| How to render variable body under Golden Rule #9? | Add optional `children` slot to `ConfirmationDialog` confirm variant |
| List cap / overflow / plurals | Cap 3, "and N more", i18next plural forms |
| Confirm label | Content-aware: `confirmAll` vs `confirm` |
| i18n | `crd-space` `deleteCallout.*`, six languages, parity-tested |
