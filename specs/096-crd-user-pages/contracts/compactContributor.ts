/**
 * CRD shared `CompactContributorCard` primitive — used cross-vertical.
 *
 * File location at implementation time:
 *   src/crd/components/common/CompactContributorCard.tsx
 *
 * Consumers:
 *   - VC profile sidebar — Host card (sibling spec component VCProfileSidebar).
 *   - Organization profile sidebar — Associates list (OrganizationProfileSidebar).
 *
 * Purely presentational. Zero `@mui/*`, `@emotion/*`, `@/core/apollo`,
 * `@/domain/*`, `react-router-dom`, or `formik` imports per FR-005 / FR-006.
 *
 * Built atop CRD primitives `card.tsx` and `avatar.tsx` only. No new dependency.
 */

export type CompactContributorCardItem = {
  id: string;
  displayName: string;
  /** When `null` the avatar renders fallback initials. */
  avatarImageUrl: string | null;
  /**
   * Optional caption rendered below the display name (e.g., role label "Admin",
   * location, or `null` to omit).
   */
  caption: string | null;
  /**
   * Click-through URL. Renders the card as an `<a href>` (NOT a programmatic
   * navigation per `src/crd/CLAUDE.md`). When `undefined`, the card is a
   * non-interactive presentational element.
   */
  href?: string;
};

export type CompactContributorCardProps = CompactContributorCardItem & {
  /**
   * Visual variant:
   *  - `compact` (default): tight spacing, single-line caption — used in the
   *    VC profile sidebar (Host card).
   *  - `spacious`: extra vertical breathing room — used in the Organization
   *    profile sidebar (Associates list).
   */
  variant?: 'compact' | 'spacious';
  /**
   * Accessible label for the entire card (typically derived from the display
   * name + caption). Required when `href` is set so the link's aria-label is
   * explicit.
   */
  ariaLabel?: string;
};
