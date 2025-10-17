export interface CalloutRestrictions {
  /**
   * Store media in a temporary location (required when the Callout doesn't exist yet)
   */
  temporaryLocation?: boolean;
  /**
   * Disables upload of images, videos and other rich media in the Markdown editors.
   */
  disableRichMedia?: boolean;
  /**
   * Disables comments to Callout framing
   */
  disableComments?: boolean;
  /**
   * Disables comments to Callout Contributions/Responses
   */
  disableCommentsToContributions?: boolean;
  /**
   * Disables whiteboard callouts, both in the framing and in the responses. This is here because VCs still don't support whiteboards.
   */
  disableWhiteboards?: boolean;
  /**
   * Disables memo callouts, both in the framing and in the responses. This is here because VCs still don't support Memos.
   */
  disableMemos?: boolean;
  /**
   * Disables Link callouts, both in the framing and in the responses.
   */
  disableLinks?: boolean;
  /**
   * Makes the Structured Responses Field read-only
   */
  readOnlyAllowedTypes?: boolean;
  /**
   * Makes the contributions form read-only - For now, this only applies to the Links that are added to the Callout on creation.
   * These cannot be edited when editing the callout, and cannot be used when creating/editing a callout template
   */
  readOnlyContributions?: boolean;
  /**
   * Disables the editing of the callouts framing whiteboard, because it can only be edited in real-time when they are created.
   */
  onlyRealTimeWhiteboardFraming?: boolean;
}
