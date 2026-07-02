/**
 * Plain-TS view model for the context-aware callout delete confirmation
 * (feature 114). Produced by the integration-layer mapper
 * (`mapCalloutToDeletionSummary`) from cache-only data and consumed by the
 * CRD dialog components — no GraphQL types cross this boundary.
 */

/** Rich framing-body kinds nameable from cached data. */
export type CalloutRichContentKind = 'whiteboard' | 'memo' | 'poll' | 'mediaGallery' | 'document';

/** A nameable link/reference to be listed in the dialog. */
export type DeletionLinkItem = {
  id: string;
  /** Reference name / link display name, falling back to the URL. Never empty. */
  label: string;
};

/**
 * Everything the delete dialog needs to describe what will be removed.
 * Named `…Model` to avoid colliding with the `CalloutDeletionSummary`
 * component, which `DeleteCalloutDialog` imports alongside this type.
 */
export type CalloutDeletionSummaryModel = {
  /** Total contributions inside the callout (posts, whiteboards, links, …). */
  contributionCount: number;
  /** Rich framing body kind, if the callout's own body is one of these. */
  richContent?: CalloutRichContentKind;
  /** Named links: framing body link + framing references, source order. */
  links: DeletionLinkItem[];
  /** Number of comments/messages on the callout. */
  commentCount: number;
};
