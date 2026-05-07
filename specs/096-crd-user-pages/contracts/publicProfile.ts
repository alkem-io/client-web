/**
 * CRD User public-profile view contracts.
 *
 * File location at implementation time:
 *   src/crd/components/user/UserPageHero.tsx
 *   src/crd/components/user/UserPublicProfileView.tsx
 *   src/crd/components/user/UserProfileSidebar.tsx
 *   src/crd/components/user/UserResourceTabStrip.tsx
 *   src/crd/components/user/UserResourceSections.tsx
 *
 * The recipient-agnostic compose surface (`MessagePopover`) used by
 * `UserPageHero` lives at `src/crd/components/common/MessagePopover.tsx`
 * (shared with `OrganizationPageHero` per Q2 decision in
 * `analysis-interview.md`).
 *
 * Purely presentational. Zero `@mui/*`, `@emotion/*`, `@/core/apollo`,
 * `@/domain/*`, `react-router-dom`, or `formik` imports per FR-005 / FR-006.
 *
 * Sibling contracts in this folder:
 *  - `organizationProfile.ts` — Organization profile view contracts.
 *  - `vcProfile.ts` — Virtual Contributor profile view contracts.
 *  - `compactContributor.ts` — `CompactContributorCard` shared CRD primitive
 *    (used by the User profile's Organizations sidebar list and the VC
 *    profile's Host card; NOT used by the Organization profile's Associates
 *    section, which is a square-avatar grid parity port of MUI AssociatesView).
 *  - `data-mapper.ts` — cross-page mapper utility contracts.
 *
 * The User Settings shell contracts (`UserSettingsShell`, `UserSettingsTabStrip`,
 * `UserSettingsCard`) live in sibling spec 097-crd-user-settings/contracts/shell.ts.
 */

import type { ReactNode } from 'react';

/* ----------------------------- UserPageHero ------------------------------ */

export type UserPageHeroProps = {
  avatarImageUrl: string | null;
  displayName: string;
  /** "City, Country" — null when both empty. */
  location: string | null;
  /**
   * When true, render the Settings (gear) icon button. The component itself
   * does not navigate — it calls `onClickSettings` (the canEditSettings
   * predicate is computed by the integration layer per FR-011 and the
   * matching FR-008a in sibling spec 097-crd-user-settings).
   */
  showSettingsIcon: boolean;
  onClickSettings?: () => void;
  /**
   * When true, render the Message button. The button opens an in-hero
   * compose Popover; submitting calls `onSendMessage` with the typed text
   * (FR-012).
   */
  showMessageButton: boolean;
  onSendMessage?: (messageText: string) => Promise<void>;
};

/* --------------------------- ResourceTabKey ----------------------------- */

export type ResourceTabKey = 'resourcesHosted' | 'leading' | 'memberOf';

// Note: an earlier 5-tab design (`allResources` / `hostedSpaces` /
// `virtualContributors` / `leading` / `memberOf`) was dropped once Template
// Packs and Custom Homepages were added to the Resources Hosted group — five
// tabs with two of them being slices of a third did not scale. See FR-013.

export type SpaceCardItem = {
  id: string;
  url: string;
  displayName: string;
  description: string | null;
  level: 'L0' | 'L1' | 'L2';
  bannerImageUrl: string | null;
  avatarImageUrl: string | null;
  visibility: 'public' | 'private';
};

export type VCCardItem = {
  id: string;
  url: string;
  displayName: string;
  description: string | null;
  avatarImageUrl: string | null;
};

/**
 * User profile sidebar's Organizations list item. Rendered via the shared
 * `CompactContributorCard` primitive (Q1 decision in analysis-interview.md):
 *  - `caption`         ← role label (e.g., "Admin", "Associate")
 *  - `secondaryCaption` ← member-count line (e.g., "24 members" — i18n-resolved)
 *
 * The mapper composes the two strings; the view passes them through unchanged.
 */
export type AssociatedOrganizationCard = {
  id: string;
  url: string;
  displayName: string;
  role: string;
  memberCount: number;
  avatarImageUrl: string | null;
};

export type PublicProfileResources = {
  hostedSpaces: SpaceCardItem[];
  hostedVirtualContributors: VCCardItem[];
  /** Backend field: `account.innovationPacks`. UI label: "Template Packs". */
  hostedInnovationPacks: SimpleResourceCardItem[];
  /** Backend field: `account.innovationHubs`. UI label: "Custom Homepages". */
  hostedInnovationHubs: SimpleResourceCardItem[];
  spacesLeading: SpaceCardItem[];
  spacesMember: SpaceCardItem[];
};

/**
 * Generic resource card shape used by both the User profile (Template Packs +
 * Custom Homepages sub-sections under Resources Hosted) and the Organization
 * profile (Account Resources packs + hubs lists). Same shape as the existing
 * `SimpleResourceCardItem` exported by `OrganizationResourceSections`.
 */
export type SimpleResourceCardItem = {
  id: string;
  displayName: string;
  description: string | null;
  href: string;
  avatarImageUrl: string | null;
};

export type UserPublicProfileViewProps = {
  user: {
    id: string;
    slug: string;
    isOwn: boolean;
    canEditSettings: boolean;
    hero: {
      avatarImageUrl: string | null;
      displayName: string;
      location: string | null;
    };
    bio: string | null;
    organizations: AssociatedOrganizationCard[];
    resources: PublicProfileResources;
  };

  /**
   * Per-region loading flags (FR-009). Each region renders a Skeleton while
   * its driving query is still in flight; the page does not block on all
   * queries before painting. Mapping (data-model.md "Query → region"):
   *   - `hero` / `bio`             ← useUserProvider
   *   - `organizations`            ← useUserOrganizationIds + downstream lookup
   *   - `hostedResources`          ← useUserAccountQuery
   *   - `memberships`              ← useUserContributions
   */
  loading: {
    hero: boolean;
    organizations: boolean;
    hostedResources: boolean;
    memberships: boolean;
  };

  /**
   * i18n-resolved aria-labels for the per-region skeleton `<output>` containers
   * (WCAG 2.1 AA — loading regions must be exposed to assistive tech). One
   * entry per `loading` flag; the integration layer resolves these from the
   * `crd-profilePages` `common.loading.*` namespace.
   */
  loadingLabels: {
    hero: string;
    organizations: string;
    hostedResources: string;
    memberships: string;
  };

  /** Active resource tab; integration layer manages this state. */
  activeResourceTab: ResourceTabKey;
  onSelectResourceTab: (next: ResourceTabKey) => void;

  /**
   * Hero callbacks (forwarded to `UserPageHero`):
   *  - `onClickSettings` invoked when the gear icon is clicked. Visible only
   *    when `user.canEditSettings` is true (Q3 clarification).
   *  - `onSendMessage` invoked when the in-hero compose surface submits.
   *    Visible only when the viewer is signed in AND not the owner
   *    (FR-012; admins also see it per Q3 clarification).
   */
  onClickSettings?: () => void;
  onSendMessage?: (messageText: string) => Promise<void>;
};

/* -------------------------- UserResourceTabStrip ------------------------- */

/**
 * The User profile tab strip is implemented as a thin re-export over the
 * shared `ProfileResourceTabStrip` (also used by the Organization profile).
 * Props mirror the shared API exactly: a `tabs` array of `{key, label}` plus
 * `activeTab` / `onSelectTab` / `ariaLabel` / optional `className`. There is
 * no per-tab `counts` field — an earlier draft included badge counts; that
 * shape was dropped when the shared strip was extracted, so the contract
 * here matches the shared implementation.
 */
export type UserResourceTab = {
  key: ResourceTabKey;
  label: string;
};

export type UserResourceTabStripProps = {
  tabs: UserResourceTab[];
  activeTab: ResourceTabKey;
  onSelectTab: (next: ResourceTabKey) => void;
  /** i18n-resolved aria-label for the tablist (WCAG 2.1 AA). */
  ariaLabel: string;
  className?: string;
};

/**
 * Tab-to-section filter contract (data-model.md):
 *
 *   `resourcesHosted` → 4 sub-sections in order: Spaces → Virtual Contributors
 *                       → Template Packs (`hostedInnovationPacks`) → Custom
 *                       Homepages (`hostedInnovationHubs`). Parent header
 *                       suppressed (tab label is the heading). Empty
 *                       sub-sections omitted entirely (FR-015).
 *   `leading`         → Spaces Leading only; section header suppressed; empty
 *                       caption when the list is empty.
 *   `memberOf`        → Member of only; section header suppressed; empty
 *                       caption when the list is empty.
 */

/* --------------------------- UserResourceSections ------------------------ */

export type UserResourceSectionsProps = {
  activeTab: ResourceTabKey;
  resources: PublicProfileResources;
  /** i18n-resolved labels for each section heading. */
  labels: {
    spaces: string;
    virtualContributors: string;
    /** "Template Packs" — reused from `common.innovation-packs` per FR-102. */
    templatePacks: string;
    /** "Custom Homepages" — reused from `common.customHomepages` per FR-102. */
    customHomepages: string;
    spacesLeading: string;
    memberOf: string;
    emptyMembership: string;
    emptyLeading: string;
  };
};

/* --------------------------- UserProfileSidebar -------------------------- */

export type UserProfileSidebarProps = {
  /** Markdown bio. Rendered via the existing CRD `MarkdownContent`. */
  bio: string | null;
  /**
   * Reserved profile tagsets — Keywords + Skills (FR-010a). Empty entries are
   * dropped by the mapper; the block is hidden entirely when the array is
   * empty. The `TagsetGroup` shape is shared via
   * `@/crd/components/common/profileTypes` (`{ key: string; name: string;
   * tags: string[] }`).
   */
  tagsets: { key: string; name: string; tags: string[] }[];
  /**
   * Pre-rendered organisation cards. Lazy fetching per organisation lives in
   * the integration layer (each card is a `useAssociatedOrganization`
   * consumer that produces a `CompactContributorCard`). The view just
   * renders the slot.
   */
  organizationsSlot: ReactNode | ReactNode[];
  /** True when there are no organisations to render — drives the empty state. */
  organizationsEmpty: boolean;
  /**
   * Optional references (social + non-social). The view passes the array
   * straight to `<SocialLinks>` which filters internally for known networks
   * (website / linkedin / github / bsky / youtube / email) and renders them
   * as a monochrome icon row. When no social refs are present, the section
   * is hidden entirely. The `ReferenceLink` shape is shared via
   * `@/crd/components/common/profileTypes`.
   */
  references?: { id: string; name: string; uri: string; description: string | null }[];
  /** i18n-resolved labels. */
  labels: {
    aboutTitle: string;
    organizationsTitle: string;
    socialLinksTitle: string;
    bioEmpty: string;
    organizationsEmpty: string;
  };
};
