/**
 * CRD User public-profile view contracts — synced with the shipped
 * implementation (flat-prop shape; no `user: { … }` wrapper). The User profile
 * tab strip is the shared `ProfileResourceTabStrip` (also used by the
 * Organization profile) — there is no User-specific strip type.
 *
 * File location at implementation time:
 *   src/crd/components/user/UserPageHero.tsx
 *   src/crd/components/user/UserPublicProfileView.tsx
 *   src/crd/components/user/UserProfileSidebar.tsx
 *   src/crd/components/user/UserResourceSections.tsx
 *   src/crd/components/user/SpaceGridCard.tsx
 *   src/crd/components/common/ProfileResourceTabStrip.tsx
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
 *  - `compactContributor.ts` — `CompactContributorCard` shared CRD primitive.
 *  - `data-mapper.ts` — cross-page mapper utility contracts.
 */

import type { ReactNode } from 'react';

/* ----------------------------- UserPageHero ------------------------------ */

export type UserPageHeroProps = {
  avatarImageUrl: string | null;
  /** Deterministic colour (from `pickColorFromId(userId)`) used for the avatar fallback. */
  color: string;
  displayName: string;
  /** "City, Country" — null when both empty. */
  location: string | null;
  /**
   * When true, render the Settings (gear) icon button. The component renders
   * an `<a href={settingsHref}>` directly — no `onClick` callback (Rule 3:
   * `<a href>` links are allowed without programmatic navigation).
   */
  showSettingsIcon: boolean;
  settingsHref?: string;
  /**
   * When true, render the Message button. The button opens an in-hero
   * compose Popover; submitting calls `onSendMessage` with the typed text
   * (FR-012).
   */
  showMessageButton: boolean;
  onSendMessage?: (messageText: string) => Promise<void>;
};

/* --------------------------- ResourceTabKey ----------------------------- */

/**
 * Re-exported for convenience; canonical type lives at
 * `src/crd/components/common/ProfileResourceTabStrip.tsx`. Both the User and
 * Organization tab strips render the same 3 tabs in the same order
 * (`memberOf` → `leading` → `resourcesHosted`) with `memberOf` as default.
 *
 * NOTE: an earlier 5-tab design (`allResources` / `hostedSpaces` /
 * `virtualContributors` / `leading` / `memberOf`) was dropped once Template
 * Packs and Custom Homepages were added to the Resources Hosted group — five
 * tabs with two of them being slices of a third did not scale. See FR-013.
 */
export type ResourceTabKey = 'resourcesHosted' | 'leading' | 'memberOf';

/* --------------------------- Card item types ----------------------------- */

/**
 * Item shape consumed by `SpaceGridCard` (Hosted Spaces sub-section).
 * Source of truth: `src/crd/components/user/SpaceGridCard.tsx`
 * (`SpaceGridCardData`).
 */
export type SpaceGridCardItem = {
  id: string;
  title: string;
  description: string | null;
  href: string;
  imageUrl?: string;
  /** Deterministic accent colour from `pickColorFromId(id)`. */
  color: string;
  isPrivate: boolean;
};

/**
 * Hosted Virtual Contributor item. Source of truth:
 * `src/crd/components/common/profileTypes.ts` (`VirtualContributorCardItem`).
 */
export type VirtualContributorCardItem = {
  id: string;
  displayName: string;
  description: string | null;
  /** i18n-resolved "Virtual Contributor" type label. */
  type: string;
  href: string;
};

/**
 * Generic resource card shape used by both the User profile (Template Packs +
 * Custom Homepages sub-sections under Resources Hosted) and the Organization
 * profile. Source of truth: `src/crd/components/common/profileTypes.ts`
 * (`SimpleResourceCardItem`).
 */
export type SimpleResourceCardItem = {
  id: string;
  displayName: string;
  description: string | null;
  href: string;
  avatarImageUrl: string | null;
};

/**
 * User profile sidebar's Organizations list item. Rendered via the shared
 * `CompactContributorCard` primitive (Q1 decision in analysis-interview.md):
 *  - `caption`         ← role label (e.g., "Admin", "Associate")
 *  - `secondaryCaption` ← member-count line (e.g., "24 members" — i18n-resolved)
 *
 * The mapper composes the two strings; the view passes them through unchanged.
 * Cards are pre-rendered by the integration layer (each card is a
 * `useAssociatedOrganization` consumer) and passed in via `organizationsSlot`.
 */
export type AssociatedOrganizationCard = {
  id: string;
  url: string;
  displayName: string;
  role: string;
  memberCount: number;
  avatarImageUrl: string | null;
};

/* ------------------------ UserPublicProfileView ------------------------- */

/**
 * Flat prop shape (matches `UserPublicProfileView.tsx` exactly). The view
 * composes `UserPageHero` + `UserProfileSidebar` + `ProfileResourceTabStrip`
 * + `UserResourceSections`. Each child receives its own props block; loading
 * is per-region (FR-009).
 */
export type UserPublicProfileViewProps = {
  hero: UserPageHeroProps;
  sidebar: UserProfileSidebarProps;
  tabStrip: ProfileResourceTabStripProps;
  sections: UserResourceSectionsProps;

  /**
   * Per-region loading flags (FR-009). Each region renders a Skeleton while
   * its driving query is still in flight; the page does not block on all
   * queries before painting. Mapping (data-model.md "Query → region"):
   *   - `hero` / sidebar bio       ← useUserProvider
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
};

/* ------------------------ ProfileResourceTabStrip ------------------------ */

/**
 * The User profile tab strip is the shared `ProfileResourceTabStrip` from
 * `src/crd/components/common/ProfileResourceTabStrip.tsx` (also used by the
 * Organization profile). There is no per-tab `counts`/badge field — an earlier
 * draft included badge counts; that shape was dropped when the strip was
 * extracted.
 */
export type ProfileResourceTab = {
  key: ResourceTabKey;
  label: string;
};

export type ProfileResourceTabStripProps = {
  tabs: ProfileResourceTab[];
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
 *                       Homepages (`hostedInnovationHubs`). Empty
 *                       sub-sections omitted entirely (FR-015).
 *   `leading`         → Spaces Leading only; section header suppressed; empty
 *                       caption when the list is empty.
 *   `memberOf`        → Member of only; section header suppressed; empty
 *                       caption when the list is empty.
 */

/* --------------------------- UserResourceSections ------------------------ */

export type UserResourceSectionsProps = {
  activeTab: ResourceTabKey;
  hostedSpaces: SpaceGridCardItem[];
  hostedVirtualContributors: VirtualContributorCardItem[];
  /** Backend field: `account.innovationPacks`. UI label: "Template Packs". */
  hostedInnovationPacks: SimpleResourceCardItem[];
  /** Backend field: `account.innovationHubs`. UI label: "Custom Homepages". */
  hostedInnovationHubs: SimpleResourceCardItem[];
  /** Pre-rendered membership cards (the integration page wires `useContributionProvider` per item). */
  spacesLeading: ReactNode[];
  /** Pre-rendered membership cards (the integration page wires `useContributionProvider` per item). */
  spacesMember: ReactNode[];
  labels: {
    spacesSubsection: string;
    virtualContributorsSubsection: string;
    /** "Template Packs" — reused from `common.innovation-packs` per FR-102. */
    templatePacksSubsection: string;
    /** "Custom Homepages" — reused from `common.customHomepages` per FR-102. */
    customHomepagesSubsection: string;
    spacesLeading: string;
    memberOf: string;
    emptyLeading: string;
    emptyMembership: string;
    /** sr-only labels for the SpaceGridCard privacy chip (WCAG 2.1 AA). */
    spacePrivacy: { privacyPrivate: string; privacyPublic: string };
  };
};

/* --------------------------- UserProfileSidebar -------------------------- */

/**
 * Tagset group rendered as a labelled chip row. Source of truth:
 * `src/crd/components/common/profileTypes.ts`.
 */
export type TagsetGroup = { key: string; name: string; tags: string[] };

/**
 * Reference link consumed by `SocialLinks` (sidebar). Source of truth:
 * `src/crd/components/common/profileTypes.ts`.
 */
export type ReferenceLink = { id: string; name: string; uri: string; description: string | null };

export type UserProfileSidebarProps = {
  /** Markdown bio. Rendered via the existing CRD `MarkdownContent`. */
  bio: string | null;
  /**
   * Reserved profile tagsets — Keywords + Skills (FR-010a). Empty entries are
   * dropped by the mapper; the block is hidden entirely when the array is
   * empty.
   */
  tagsets: TagsetGroup[];
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
   * is hidden entirely.
   */
  references?: ReferenceLink[];
  /** i18n-resolved labels. */
  labels: {
    aboutTitle: string;
    organizationsTitle: string;
    socialLinksTitle: string;
    bioEmpty: string;
    organizationsEmpty: string;
  };
};
