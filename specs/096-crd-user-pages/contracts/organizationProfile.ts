/**
 * CRD Organization profile view contracts — synced with the shipped
 * implementation (flat-prop shape; no `organization: { … }` wrapper).
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
 * (used by the User profile's Organizations sidebar list and the VC profile's
 * Host section — NOT by the Organization profile's Associates section, which
 * renders a square-avatar grid).
 */

import type {
  ProfileResourceTabStripProps,
  ReferenceLink,
  ResourceTabKey,
  SimpleResourceCardItem,
  SpaceGridCardItem,
  TagsetGroup,
  VirtualContributorCardItem,
} from './publicProfile';

/* ----------------------------- OrganizationPageHero --------------------- */

export type OrganizationPageHeroProps = {
  avatarImageUrl: string | null;
  /** Deterministic colour (from `pickColorFromId(orgId)`) used for the avatar fallback. */
  color: string;
  displayName: string;
  /** "City, Country" — null when both empty. */
  location: string | null;
  /** Verified badge shown when `verified === true` (FR-020). */
  verified: boolean;
  /**
   * When `null` the Settings (gear) icon is hidden. When set, the icon links
   * to this URL (built via `buildSettingsUrl(organization.profile.url)` per
   * FR-021). The component renders an `<a href>` directly — no callback.
   */
  settingsHref: string | null;
  /**
   * When `null` the Message button is hidden (parity for anonymous viewers).
   * When set, the button opens an in-hero compose Popover; submitting calls
   * this handler with the typed text (FR-022).
   */
  onSendMessage: ((messageText: string) => Promise<void>) | null;
};

/* --------------------- OrganizationProfileSidebar ----------------------- */

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
// References section.

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
    /** Heading for the non-social "Links" section — rendered via the shared `ReferencesList`, omitted when empty (FR-023, correction 2026-06-24). `referencesEmpty` was removed in the same change. */
    referencesTitle: string;
    /**
     * Receives `totalCount` from `metrics[Associate]` and returns the localized
     * heading (e.g., "Associates (12)"). Implemented as a closure so the
     * count can be interpolated at render time.
     */
    associatesTitle: (count: number) => string;
    /** Parity reuse — i18n key `associates-view.sign-in`. */
    associatesSignInCta: string;
    /**
     * Receives `remaining` (the count of associates hidden beneath the cap)
     * and returns the toggle label (e.g., "Show more (5)"). Same closure
     * reason as `associatesTitle`. Parity reuse — i18n key
     * `associates-view.more`.
     */
    associatesShowMore: (count: number) => string;
    /** Parity reuse — i18n key `associates-view.less`. */
    associatesShowLess: string;
    /** Title for the Social sub-section (e.g., "Social"). Hidden when no social refs. */
    socialLinksTitle: string;
  };
};

/* -------------------- OrganizationResourceSections ---------------------- */

// Note: an earlier draft defined `AccountResourcesGroup`, `InnovationPackCardItem`,
// and `InnovationHubCardItem` to back a single titled "Account Resources" section
// that grouped spaces + packs + hubs into one card. That stacked-blocks layout was
// dropped in favour of the User-profile-style tabbed layout (FR-024 refined).
// Packs and Hubs are now rendered with the shared `SimpleResourceCardItem` type
// (defined in `publicProfile.ts`) — same shape, no parallel types.

import type { ReactNode } from 'react';

export type OrganizationResourceSectionsProps = {
  /** Active resource tab; integration layer manages this state. */
  activeTab: ResourceTabKey;
  /** Backend field: `account.spaces`. Empty array → sub-section omitted. */
  hostedSpaces: SpaceGridCardItem[];
  /**
   * Backend field: `account.virtualContributors`. Organisations CAN host VCs
   * (rare in production today, but supported for parity with the User profile).
   * Empty array → sub-section omitted.
   */
  hostedVirtualContributors: VirtualContributorCardItem[];
  /** Backend field: `account.innovationPacks`. UI label: "Template Packs". */
  hostedInnovationPacks: SimpleResourceCardItem[];
  /** Backend field: `account.innovationHubs`. UI label: "Custom Homepages". */
  hostedInnovationHubs: SimpleResourceCardItem[];
  /** Pre-rendered Lead Spaces tiles (each is a `MembershipCardConnector`). */
  leadSpaces: ReactNode[];
  /** Pre-rendered All Memberships tiles. */
  memberOf: ReactNode[];
  /** i18n-resolved labels — mirrors `UserResourceSectionsProps.labels`. */
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
    /** Parity reuse — i18n key `pages.user-profile.communities.noMembership`. */
    emptyMembership: string;
    /** sr-only labels for the SpaceGridCard privacy chip (WCAG 2.1 AA). */
    spacePrivacy: { privacyPrivate: string; privacyPublic: string };
  };
};

/* -------------------- OrganizationPublicProfileView --------------------- */

/**
 * Flat prop shape (matches `OrganizationPublicProfileView.tsx` exactly). The
 * view composes `OrganizationPageHero` + `OrganizationProfileSidebar` +
 * `ProfileResourceTabStrip` + `OrganizationResourceSections`. Each child
 * receives its own props block; loading is per-region (FR-009).
 *
 * NOTE: an earlier draft wrapped these under a top-level `organization: { … }`
 * object plus a separate `tabStrip: { activeTab, onSelectTab }` field. That
 * shape was rejected in favour of the flat composition shown here, which
 * matches how every CRD view component in this PR is structured.
 */
export type OrganizationPublicProfileViewProps = {
  hero: OrganizationPageHeroProps;
  sidebar: OrganizationProfileSidebarProps;
  tabStrip: ProfileResourceTabStripProps;
  rightColumn: OrganizationResourceSectionsProps;

  /**
   * Per-region loading flags (FR-009). Mapping (data-model.md "Query → region"):
   *   - `hero` / `sidebar`     ← useOrganizationProvider (single facade)
   *   - `hostedResources`      ← useOrganizationAccountQuery + useAccountResources
   *   - `memberships`          ← useFilteredMemberships(contributions, …)
   *
   * `useOrganizationProvider` resolves the org + sidebar data in one bundle;
   * the right column's hosted resources and memberships unblock independently.
   */
  loading: {
    hero: boolean;
    sidebar: boolean;
    hostedResources: boolean;
    memberships: boolean;
  };

  /**
   * i18n-resolved aria-labels for the per-region skeleton `<output>` containers
   * (WCAG 2.1 AA). One entry per `loading` flag; resolved from the
   * `crd-profilePages` `common.loading.*` namespace.
   */
  loadingLabels: {
    hero: string;
    sidebar: string;
    hostedResources: string;
    memberships: string;
  };
};
