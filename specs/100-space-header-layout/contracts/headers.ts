/**
 * Phase 1 Contracts — Space & Subspace header prop types after the layout change.
 *
 * These are the authoritative prop shapes for the rewritten CRD components.
 * The actual TS types in `src/crd/components/space/SpaceHeader.tsx` and
 * `src/crd/components/space/SubspaceHeader.tsx` MUST match these contracts.
 *
 * Reference: spec.md FR-013, data-model.md.
 */

/**
 * Action buttons available on a Space header.
 * Each `show*` flag gates rendering. `href` variants render as `<a asChild>`;
 * `on*Click` variants render as `<button>` and fire the callback.
 * The two are mutually exclusive at the consumer level — the component picks
 * the link form when a safe URL is supplied.
 */
export type SpaceHeaderActions = {
  showActivity?: boolean;
  showVideoCall?: boolean;
  showShare?: boolean;
  showSettings?: boolean;
  videoCallUrl?: string;
  settingsHref?: string;
  onActivityClick?: () => void;
  onVideoCallClick?: () => void;
  onShareClick?: () => void;
  onSettingsClick?: () => void;
};

export type SpaceHeaderProps = {
  /** Space display name. Renders as `<h1>` with `text-hero` token. */
  title: string;
  /** Short tagline below the title. Renders as `<p>` with `text-body` token. */
  tagline?: string;
  /** Banner background image URL. Falls back to deterministic gradient. */
  bannerUrl?: string;
  /** Deterministic accent colour (from `pickColorFromId`). Used for the gradient fallback when `bannerUrl` is missing. */
  color?: string;
  /** Shows a small home glyph next to the title for the user's home Space. */
  isHomeSpace?: boolean;
  /** Right-aligned action buttons rendered inside the title row. */
  actions: SpaceHeaderActions;
  /** Optional outer wrapper className for composition. */
  className?: string;
};

/**
 * Subspace action buttons. Same shape as `SpaceHeaderActions` but kept as a distinct
 * type for ISP — Subspace may diverge in the future without breaking Space consumers.
 */
export type SubspaceHeaderActions = {
  showActivity?: boolean;
  showVideoCall?: boolean;
  showShare?: boolean;
  showSettings?: boolean;
  videoCallUrl?: string;
  shareUrl?: string;
  settingsHref?: string;
  onActivityClick?: () => void;
  onVideoCallClick?: () => void;
  onShareClick?: () => void;
};

export type SubspaceHeaderProps = {
  /** Subspace display name. Renders as `<h1>` with `text-hero` token. */
  title: string;
  /** Short tagline below the title. */
  tagline?: string;

  /** Subspace identity (single 56px avatar inline with the title). */
  subspaceInitials: string;
  subspaceColor: string;
  subspaceAvatarUrl?: string;

  /**
   * Parent banner image — renders as the banner background.
   * Parent identity is conveyed ONLY through this image (no parent tile, no badge).
   */
  parentBannerUrl?: string;

  /**
   * Parent name. Used by the banner `aria-label` for screen readers ("Subspace banner for X within Y").
   * If no aria-label uses it after the refactor, this prop may be removed (audit during implementation).
   */
  parentName?: string;

  /** Right-aligned action buttons rendered inside the title row. */
  actions: SubspaceHeaderActions;

  /** Optional outer wrapper className for composition. */
  className?: string;
};

/* -----------------------------------------------------------------------------
 * Props removed by this change (DO NOT add back). For each, the integration
 * layer in `src/main/crdPages/` must stop passing the value.
 * -----------------------------------------------------------------------------
 *
 * SpaceHeader:
 *   - memberAvatars: MemberAvatar[]
 *   - onMemberClick: () => void
 *
 * SubspaceHeader:
 *   - parentInitials: string
 *   - parentColor: string
 *   - badgeKind: 'subspace' | 'subSubspace'
 *   - memberAvatars: MemberAvatar[]
 *   - onMemberClick: () => void
 */
