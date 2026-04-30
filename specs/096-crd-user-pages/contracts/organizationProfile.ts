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
  /**
   * Banner image. When `null` the component renders a deterministic gradient
   * computed via `pickColorFromId(organizationId)` (FR-020).
   */
  bannerImageUrl: string | null;
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

export type AssociatesView = {
  /** Compact list of associates. Mapper trims to the same set the current MUI shows. */
  associates: CompactContributorCardItem[];
  /** Total associate count from `metrics[Associate]` — shown in the section header. */
  totalCount: number;
};

export type OrganizationProfileSidebarProps = {
  /** Markdown bio. Rendered via the existing CRD `MarkdownContent`. */
  bio: string | null;
  /** Keywords + Capabilities tagsets. Empty array hides the section. */
  tagsets: TagsetGroup[];
  /** Free-form references. Empty array hides the section. */
  references: ReferenceLink[];
  /**
   * Associates section. `null` when the viewer lacks the `canReadUsers`
   * privilege (FR-023) — section omitted entirely.
   */
  associates: AssociatesView | null;
  /** i18n-resolved labels. */
  labels: {
    bioTitle: string;
    bioEmpty: string;
    referencesTitle: string;
    referencesEmpty: string;
    associatesTitle: string;
    associatesEmpty: string;
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
  spaces: SpaceCardItem[];
  innovationPacks: InnovationPackCardItem[];
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
    leadSpacesTitle: string;
    memberOfTitle: string;
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
   * Slot for any out-of-tree CRD elements (e.g., a global toast portal). Rarely
   * used; included for parity with the User profile view's children prop.
   */
  children?: ReactNode;
};
