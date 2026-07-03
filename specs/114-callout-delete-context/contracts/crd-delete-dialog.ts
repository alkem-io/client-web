/**
 * UI contract for feature 114 — Context-Aware Callout Delete Confirmation.
 *
 * These are the TypeScript prop/shape contracts that cross the CRD boundary.
 * They are the source of truth for the presentational layer (`src/crd/`) and
 * the integration mapper (`src/main/crdPages/space/callout/`). No GraphQL types
 * appear here — everything is plain TypeScript (CRD Golden Rule #4).
 *
 * This file is a design artifact (spec/contracts). The real implementations live
 * at the paths named in plan.md; keep them in sync with these shapes.
 */

/* ------------------------------------------------------------------ */
/* View model (produced by the integration mapper, consumed by CRD)   */
/* ------------------------------------------------------------------ */

export type CalloutRichContentKind = 'whiteboard' | 'memo' | 'poll' | 'mediaGallery' | 'document';

/** A nameable item to be listed — a contribution (by title) or a link/reference. */
export type DeletionListItem = {
  id: string;
  /** Entity title / reference name, falling back to the URL for links. Never empty. */
  label: string;
  /** Markdown description of the entity — rendered as a one-line clamped preview. */
  description?: string;
};

/**
 * Named `…Model` (not `CalloutDeletionSummary`) to avoid colliding with the
 * CRD component of that name — `DeleteCalloutDialog.tsx` imports both.
 */
export type CalloutDeletionSummaryModel = {
  /** Exact total of contributions inside the callout (authoritative — may exceed `contributions.length`). */
  contributionCount: number;
  /** Titled contributions (posts, whiteboards, memos, links, documents), sorted by sortOrder. */
  contributions: DeletionListItem[];
  /** Rich framing body kind, if the callout body is one of these. */
  richContent?: CalloutRichContentKind;
  /** The call-to-action button (link-framing callouts) — rendered as its own table row. */
  callToAction?: DeletionListItem;
  /** Named links: framing references, source order. */
  links: DeletionListItem[];
  /** Number of comments/messages on the callout. */
  commentCount: number;
};

/* ------------------------------------------------------------------ */
/* Integration mapper contract (src/main/crdPages/space/callout/)      */
/* ------------------------------------------------------------------ */

/**
 * Pure mapping from the domain model (as loaded by the callout's standard
 * `CalloutDetails` query — contribution title stubs included) to the summary
 * view model. MUST NOT fetch, mutate, or read anything outside `callout`.
 *
 * export function mapCalloutToDeletionSummary(
 *   callout: CalloutDetailsModelExtended,
 * ): CalloutDeletionSummaryModel;
 */

/* ------------------------------------------------------------------ */
/* CRD presentational contracts (src/crd/)                             */
/* ------------------------------------------------------------------ */

/**
 * `ConfirmationDialog` confirm-variant extension: an OPTIONAL body slot rendered
 * beneath the description. Backward-compatible — existing callers omit it.
 * The discard variant is unchanged.
 */
export type ConfirmationDialogConfirmPropsExtension = {
  /** Optional structured body rendered under `description` (e.g. a content list). */
  children?: import('react').ReactNode;
  /**
   * Show an X close control in the title bar. Closes via the cancel path (no
   * action performed); labelled with `dialogs.close`. `DeleteCalloutDialog`
   * enables it; other callers keep the default (false).
   */
  showCloseButton?: boolean;
};

/**
 * `DeleteCalloutDialog` — now context-aware.
 * `calloutTitle` is retained for the heading/description; `content` drives the
 * variable body and the scope-reflecting confirm label. When `content` is
 * omitted or has no deletable content, the dialog renders the concise form.
 */
export type DeleteCalloutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calloutTitle: string;
  content?: CalloutDeletionSummaryModel;
  onConfirm: () => void;
  loading?: boolean;
};

/**
 * `CalloutDeletionSummary` (component) — pure presentational content list.
 * Applies the display cap and "and N more" overflow; all copy from `crd-space`.
 */
export type CalloutDeletionSummaryProps = {
  summary: CalloutDeletionSummaryModel;
  /** Max named items shown before an overflow line. Default 3 (clarification 2026-07-02). */
  listCap?: number;
};

/* ------------------------------------------------------------------ */
/* i18n contract — keys added under `crd-space` › deleteCallout        */
/* (all six languages: en, nl, es, bg, de, fr — key parity enforced)   */
/* ------------------------------------------------------------------ */

/**
 * deleteCallout: {
 *   title, confirm, saveFailed,                                 // existing, unchanged
 *   description,                                                // REWORDED neutral: "“{{title}}” will be deleted permanently. This cannot be undone."
 *                                                               // — must NOT claim contributions/comments; the content table carries the
 *                                                               // scope, so the empty-callout dialog doesn't overstate it (FR-008/US3)
 *   confirmAll,                                                 // "Delete callout and all contents"
 *   headerContributions_one, headerContributions_other,         // table header: "{{count}} contribution(s) will be deleted" — exact total
 *   headerRich,                                                 // table header: "{{content}} will be deleted" (rich framing body, no contributions)
 *   headerRichContributions_one, headerRichContributions_other, // table header: "{{content}} and {{count}} contribution(s) will be deleted"
 *   headerRichPoll,                                              // "The poll and its results will be deleted" — full sentence: the compound
 *                                                               // subject needs a plural verb in most languages, so no contentType composition
 *   headerRichPollContributions_one, headerRichPollContributions_other,
 *                                                               // "The poll, its results and {{count}} contribution(s) will be deleted"
 *   contentType: { whiteboard, memo, mediaGallery, document },  // (poll has its own header keys)
 *                                                               // — definite-article terms interpolated into the headers ("The whiteboard", …);
 *                                                               // cased per language for its sentence position (en/nl/de/fr sentence-start,
 *                                                               // es/bg mid-sentence)
 *   callToAction,                                               // table row label ("Call to Action") — the row's right cell carries the
 *                                                               // action's title; reuses the platform term's existing translations
 *   moreContributions_one, moreContributions_other,             // overflow row: "{{count}} contribution(s) more..." — shown only when more
 *                                                               // than cap+1 contributions exist (exactly 4 → the 4th renders as a row);
 *                                                               // remainder = contributionCount − rows shown
 *   comments_one, comments_other,                               // table row: "{{count}} comment(s) will be deleted" — before the attachments row
 *   attachmentsNote,                                            // last table row, with a Paperclip icon: "including attached files and links"
 *                                                               // — rendered iff contributionCount > 0 (FR-007)
 *   moreLinks_one, moreLinks_other                              // links list overflow: "and {{count}} more link(s)"
 * }
 */
