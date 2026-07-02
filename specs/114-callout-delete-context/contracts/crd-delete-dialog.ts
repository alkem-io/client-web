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

export type DeletionLinkItem = {
  id: string;
  /** Reference name / link display name, falling back to the URL. Never empty. */
  label: string;
};

/**
 * Named `…Model` (not `CalloutDeletionSummary`) to avoid colliding with the
 * CRD component of that name — `DeleteCalloutDialog.tsx` imports both.
 */
export type CalloutDeletionSummaryModel = {
  /** Total contributions inside the callout (posts, whiteboards, links, …). */
  contributionCount: number;
  /** Rich framing body kind, if the callout body is one of these. */
  richContent?: CalloutRichContentKind;
  /** Named links: framing body link + framing references, source order. */
  links: DeletionLinkItem[];
  /** Number of comments/messages on the callout. */
  commentCount: number;
};

/* ------------------------------------------------------------------ */
/* Integration mapper contract (src/main/crdPages/space/callout/)      */
/* ------------------------------------------------------------------ */

/**
 * Pure, cache-only mapping from the domain model to the summary view model.
 * MUST NOT fetch, mutate, or read anything outside `callout`.
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
 *   title, confirm, saveFailed,                       // existing, unchanged
 *   description,                                      // REWORDED neutral: "“{{title}}” will be deleted permanently. This cannot be undone."
 *                                                     // — must NOT claim contributions/comments; the content list carries the
 *                                                     // scope, so the empty-callout dialog doesn't overstate it (FR-008/US3)
 *   confirmAll,                                       // "Delete callout and all contents"
 *   contentsIntro,                                    // "This will permanently delete:" — lead-in line rendered above the
 *                                                     // content list whenever the summary has deletable content
 *   contributions_one, contributions_other,           // "{{count}} contribution" / "…contributions"
 *   including,                                        // "including a {{content}}"
 *   contentType: { whiteboard, memo, poll, mediaGallery, document },
 *   moreLinks_one, moreLinks_other,                   // "and {{count}} more link(s)"
 *   comments_one, comments_other,                     // "and {{count}} comment(s)"
 *   attachmentsNote                                   // "including attached files and links" — rendered iff contributionCount > 0 (FR-007)
 * }
 */
