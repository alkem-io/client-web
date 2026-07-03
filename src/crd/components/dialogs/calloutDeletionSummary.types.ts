/**
 * Plain-TS view model for the context-aware callout delete confirmation
 * (feature 114). Produced by the integration-layer mapper
 * (`mapCalloutToDeletionSummary`) from data that arrives with the callout's
 * standard load and consumed by the CRD dialog components — no GraphQL types
 * cross this boundary.
 */

/** Rich framing-body kinds nameable from the loaded data. */
export type CalloutRichContentKind = 'whiteboard' | 'memo' | 'poll' | 'mediaGallery' | 'document';

/** A nameable item to be listed in the dialog — a contribution (by title) or a link/reference. */
export type DeletionListItem = {
  id: string;
  /** Entity title / reference name, falling back to the URL for links. Never empty. */
  label: string;
  /** Markdown description of the entity — rendered as a one-line clamped preview. */
  description?: string;
};

/**
 * Everything the delete dialog needs to describe what will be removed.
 * Named `…Model` to avoid colliding with the `CalloutDeletionSummary`
 * component, which `DeleteCalloutDialog` imports alongside this type.
 */
export type CalloutDeletionSummaryModel = {
  /** Exact total of contributions inside the callout (authoritative — may exceed `contributions.length`). */
  contributionCount: number;
  /** Titled contributions (posts, whiteboards, memos, links, documents), sorted by sortOrder. */
  contributions: DeletionListItem[];
  /** Rich framing body kind, if the callout's own body is one of these. */
  richContent?: CalloutRichContentKind;
  /** Named links: framing body link + framing references, source order. */
  links: DeletionListItem[];
  /** Number of comments/messages on the callout. */
  commentCount: number;
};
