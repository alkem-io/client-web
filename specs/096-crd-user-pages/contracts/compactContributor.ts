/**
 * CRD shared `CompactContributorCard` primitive — used cross-vertical.
 *
 * File location at implementation time:
 *   src/crd/components/common/CompactContributorCard.tsx
 *
 * Consumers:
 *   - User profile sidebar — Organizations list (UserProfileSidebar);
 *     `caption = role`, `secondaryCaption = i18n-resolved member-count line`.
 *   - VC profile sidebar — Host card (VCProfileSidebar);
 *     `caption = null`, `secondaryCaption = null` unless current MUI surfaces
 *     a role/caption.
 *
 * NOT a consumer:
 *   - Organization profile's Associates section. Associates is a parity port of
 *     MUI `AssociatesView` — a square avatar grid (not a sidebar row list).
 *     It uses the `AssociateGridItem` shape from `organizationProfile.ts`,
 *     not `CompactContributorCard`.
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
   * Primary caption rendered below the display name (e.g., role label "Admin",
   * location, or `null` to omit).
   */
  caption: string | null;
  /**
   * Optional secondary caption rendered below `caption` (e.g., member-count
   * line "24 members" on the User profile's Organizations list). `null` to
   * omit. Added to support the User profile's Organizations sidebar without
   * introducing a third primitive.
   */
  secondaryCaption: string | null;
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
   *  - `compact` (default): tight spacing, single-line caption — used by the
   *    VC profile sidebar (Host card) and the User profile sidebar
   *    (Organizations list).
   *  - `spacious`: extra vertical breathing room — currently unused; reserved
   *    for future consumers that need a larger row.
   */
  variant?: 'compact' | 'spacious';
  /**
   * Accessible label for the entire card. Defaults to `displayName` when
   * `href` is set; supply explicitly to add caption context (e.g., "Acme Corp,
   * Admin").
   */
  ariaLabel?: string;
  /**
   * Optional badge rendered to the right of the row (e.g., member-count chip).
   * When provided, it replaces the `secondaryCaption` rendering. The icon is
   * a closed enum so the visual pattern stays under the design system.
   */
  badge?: { label: string; icon?: 'users' };
  /** Optional `className` for composition. */
  className?: string;
};
