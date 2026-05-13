/**
 * Plain prop types for the `src/crd/components/innovationPack/*` components.
 * No runtime dependencies — types only.
 */

export type InnovationPackCardData = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  /** profile.cardBanner.uri / profile.visual.uri — undefined ⇒ the component renders the `color` gradient. */
  bannerUrl?: string;
  /** pickColorFromId(pack.id) — deterministic accent for banner/avatar fallback. */
  color: string;
  /** sum of templatesSet.*Count — shown as a "{N} templates" badge. */
  templateCount: number;
  /** profile.url — the card links here. */
  url: string;
  providerName?: string;
  providerAvatarUrl?: string;
  providerUrl?: string;
};
