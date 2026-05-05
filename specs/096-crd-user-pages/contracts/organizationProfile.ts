/**
 * CRD Organization profile view contracts.
 *
 * File location at implementation time:
 *   src/crd/components/organization/OrganizationPageHero.tsx
 *   src/crd/components/organization/OrganizationProfileSidebar.tsx
 *   src/crd/components/organization/OrganizationResourceSections.tsx
 *   src/crd/components/organization/OrganizationPublicProfileView.tsx
 *
 * Purely presentational. Zero `@mui/*`, `@emotion/*`, `@/core/apollo`,
 * `@/domain/*`, `react-router-dom`, or `formik` imports per FR-005 / FR-006.
 *
 * The shared `CompactContributorCard` contract lives in `compactContributor.ts`
 * (used by the Associates section here AND by the VC profile's Host section).
 */

import type { ReactNode } from 'react';
import type { CompactContributorCardItem } from './compactContributor';
import type { SpaceCardItem } from './publicProfile';

/* ----------------------------- OrganizationPageHero --------------------- */

export type OrganizationPageHeroProps = {
  avatarImageUrl: string | null;
  displayName: string;
  /** "City, Country" — null when both empty. */
  location: string | null;
  /** Verified badge shown when `verified === true` (FR-020). */
  verified: boolean;
  /**
   * When `null` the Settings (gear) icon is hidden. When set, the icon links
   * to this URL (which is the existing MUI admin URL via
   * `buildSettingsUrl(organization.profile.url)` per FR-021).
   */
  settingsUrl: string | null;
  /**
   * When `null` the Message button is hidden (parity for anonymous viewers).
   * When set, the button opens an in-hero compose Popover; submitting calls
   * this handler with the typed text (FR-022).
   */
  onSendMessage: ((messageText: string) => Promise<void>) | null;
};

/* --------------------- OrganizationProfileSidebar ----------------------- */

export type TagsetGroup = {
  /** i18n-resolved label (e.g., "Keywords", "Capabilities"). */
  name: string;
  tags: string[];
};

export type ReferenceLink = {
  id: string;
  name: string;
  uri: string;
  description: string | null;
};

/**
 * Parity port of current MUI `AssociatesView`. The view paginates the avatar
 * grid at 12 with a "Show more (N) / Show less" toggle (state held in the
 * view, not the mapper). When `canReadUsers === false`, the view shows the
 * existing `associates-view.sign-in` CTA copy in the section body — the
 * section header is still rendered. The mapper passes the full associates
 * list regardless of `canReadUsers`; the view is the gate.
 *
 * The shape is the existing MUI `ContributorCardSquare` prop set, NOT
 * `CompactContributorCard` — Associates is a square avatar grid, not a
 * sidebar row list.
 */
export type AssociateGridItem = {
  id: string;
  displayName: string;
  avatarImageUrl: string | null;
  /** Contributor profile URL (rendered as <a href>). */
  url: string;
};

export type AssociatesView = {
  /** All associates. View paginates at 12 with Show more / Show less. */
  associates: AssociateGridItem[];
  /** Total associate count from `metrics[Associate]` — shown in the section header. */
  totalCount: number;
  /** When false, view shows the sign-in CTA in the section body. */
  canReadUsers: boolean;
};

// SocialReferenceItem and the per-mapper `brandFor` / `splitReferences` helpers
// have been removed. Social-link rendering and the social/non-social split
// now live entirely inside the shared CRD `SocialLinks` primitive at
// `src/crd/components/common/SocialLinks.tsx`. Consumers pass raw
// `ReferenceLink[]` through; `<SocialLinks references={refs} />` renders the
// social subset with monochrome SVG icons (website / linkedin / github / bsky /
// youtube / email + generic globe fallback), and the exported
// `excludeSocialReferences(refs)` helper feeds the parallel non-social
// References section. This eliminates ~30 lines of duplicate logic across
// the three consumer pages.

export type OrganizationProfileSidebarProps = {
  /** Markdown bio. Rendered via the existing CRD `MarkdownContent`. */
  bio: string | null;
  /**
   * Keywords + Capabilities tagsets. Empty per-tagset arrays are dropped by
   * the mapper before reaching the view; the section is hidden only when ALL
   * tagsets are empty (matches MUI `OrganizationProfileView` per-tagset filter).
   */
  tagsets: TagsetGroup[];
  /**
   * ALL references (social + non-social). The view splits internally:
   *   • References section uses `excludeSocialReferences(references)` from
   *     `@/crd/components/common/SocialLinks`.
   *   • Social section passes `references` straight to
   *     `<SocialLinks references={references} />`, which filters and
   *     brand-resolves itself.
   * Empty array hides both sub-sections.
   */
  references: ReferenceLink[];
  /**
   * Associates section — always populated. The internal `canReadUsers` flag
   * drives the view's grid-vs-sign-in-CTA branch (parity with current MUI
   * `AssociatesView`). The section header is always rendered.
   */
  associates: AssociatesView;
  /** i18n-resolved labels. */
  labels: {
    bioTitle: string;
    bioEmpty: string;
    referencesTitle: string;
    referencesEmpty: string;
    associatesTitle: string;
    /** Parity reuse — i18n key `associates-view.sign-in`. */
    associatesSignInCta: string;
    /** Parity reuse — i18n key `associates-view.more` with `{count}` interpolation. */
    associatesShowMore: string;
    /** Parity reuse — i18n key `associates-view.less`. */
    associatesShowLess: string;
    /** Title for the Social sub-section (e.g., "Social"). Hidden when no social refs. */
    socialLinksTitle: string;
  };
};

/* -------------------- OrganizationResourceSections ---------------------- */

export type InnovationPackCardItem = {
  id: string;
  url: string;
  displayName: string;
  description: string | null;
  avatarImageUrl: string | null;
};

export type InnovationHubCardItem = {
  id: string;
  url: string;
  displayName: string;
  description: string | null;
  avatarImageUrl: string | null;
};

export type AccountResourcesGroup = {
  /**
   * The view paginates `spaces` at `VISIBLE_SPACE_LIMIT = 6` with a "Show all"
   * button (state-machine in the view, NOT in the mapper) — exact parity port
   * of current MUI `AccountResourcesView`. Mapper passes ALL spaces.
   */
  spaces: SpaceCardItem[];
  /** Rendered uncapped — current MUI parity. */
  innovationPacks: InnovationPackCardItem[];
  /** Rendered uncapped — current MUI parity. */
  innovationHubs: InnovationHubCardItem[];
};

export type OrganizationResourceSectionsProps = {
  /**
   * `null` when all three account-resource lists are empty (FR-024) — the
   * Account Resources section is omitted entirely.
   */
  accountResources: AccountResourcesGroup | null;
  /** Empty array hides the Lead Spaces section. */
  leadSpaces: SpaceCardItem[];
  /**
   * The All Memberships section is ALWAYS rendered. When this array is empty,
   * the section shows the empty-state caption "No memberships yet" (FR-024).
   */
  memberOf: SpaceCardItem[];
  /** i18n-resolved labels. */
  labels: {
    accountResourcesTitle: string;
    accountResourcesSpacesSubtitle: string;
    accountResourcesInnovationPacksSubtitle: string;
    accountResourcesInnovationHubsSubtitle: string;
    /** Parity reuse — i18n key `components.dashboardNavigation.showAll`. */
    accountResourcesShowAll: string;
    leadSpacesTitle: string;
    memberOfTitle: string;
    /** Parity reuse — i18n key `pages.user-profile.communities.noMembership`. */
    memberOfEmpty: string;
  };
};

/* -------------------- OrganizationPublicProfileView --------------------- */

export type OrganizationPublicProfileViewProps = {
  organization: {
    id: string;
    slug: string;
    isOwn: boolean;
    canEdit: boolean;
    canReadUsers: boolean;
    hero: OrganizationPageHeroProps;
    sidebar: OrganizationProfileSidebarProps;
    rightColumn: OrganizationResourceSectionsProps;
  };

  /**
   * Per-region loading flags (FR-009). Mapping (data-model.md "Query → region"):
   *   - `hero` / `sidebar`        ← useOrganizationProvider (single facade)
   *   - `accountResources`        ← useOrganizationAccountQuery + useAccountResources
   *   - `memberships`             ← useFilteredMemberships(contributions, …)
   *
   * `useOrganizationProvider` resolves the org + sidebar data in one bundle;
   * the right column's Account Resources and Memberships unblock independently.
   */
  loading: {
    hero: boolean;
    sidebar: boolean;
    accountResources: boolean;
    memberships: boolean;
  };

  /**
   * Slot for any out-of-tree CRD elements (e.g., a global toast portal). Rarely
   * used; included for parity with the User profile view's children prop.
   */
  children?: ReactNode;
};
