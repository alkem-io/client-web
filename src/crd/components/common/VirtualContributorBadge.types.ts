export type VirtualContributorBadgeProps = {
  /**
   * Override for the badge text. Defaults to the localized "Virtual Contributor"
   * label (which stays in English per the platform glossary). Pass a label only
   * when the consumer needs a different string.
   */
  label?: string;
  /** `sm` (default) renders a compact badge tuned for inline list/comment rows; `md` is slightly larger. */
  size?: 'sm' | 'md';
  className?: string;
};
