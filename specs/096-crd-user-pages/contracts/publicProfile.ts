/**
 * CRD public-profile view contracts.
 *
 * File location at implementation time:
 *   src/crd/components/user/UserPageHero.tsx
 *   src/crd/components/user/UserPageMessagePopover.tsx
 *   src/crd/components/user/UserPublicProfileView.tsx
 *   src/crd/components/user/UserProfileSidebar.tsx
 *   src/crd/components/user/UserResourceTabStrip.tsx
 *   src/crd/components/user/UserResourceSections.tsx
 *
 * Purely presentational. Zero `@mui/*`, `@emotion/*`, `@/core/apollo`,
 * `@/domain/*`, `react-router-dom`, or `formik` imports per FR-005 / FR-006.
 *
 * The settings shell contracts (`UserSettingsShell`, `UserSettingsTabStrip`,
 * `UserSettingsCard`) live in sibling spec 097-crd-user-settings/contracts/shell.ts.
 */

/* ----------------------------- UserPageHero ------------------------------ */

export type UserPageHeroProps = {
  /**
   * Banner image. When `null` the component renders a deterministic gradient
   * computed via `pickColorFromId(userId)` (FR-010).
   */
  bannerImageUrl: string | null;
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

export type ResourceTabKey =
  | 'allResources'
  | 'hostedSpaces'
  | 'virtualContributors'
  | 'leading'
  | 'memberOf';

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
  spacesLeading: SpaceCardItem[];
  spacesMember: SpaceCardItem[];
};

export type UserPublicProfileViewProps = {
  user: {
    id: string;
    slug: string;
    isOwn: boolean;
    canEditSettings: boolean;
    hero: {
      bannerImageUrl: string | null;
      avatarImageUrl: string | null;
      displayName: string;
      location: string | null;
    };
    bio: string | null;
    organizations: AssociatedOrganizationCard[];
    resources: PublicProfileResources;
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

export type UserResourceTabStripProps = {
  activeTab: ResourceTabKey;
  onSelectTab: (next: ResourceTabKey) => void;
  /**
   * Per-tab counts, used for badge rendering. The strip itself only renders
   * the count when `count !== null`. Integration layer can pass null to hide.
   */
  counts: {
    allResources: number | null;
    hostedSpaces: number | null;
    virtualContributors: number | null;
    leading: number | null;
    memberOf: number | null;
  };
};

/**
 * Tab-to-section filter contract (data-model.md):
 *
 *   `allResources`         → Resources Hosted (Spaces + VCs sub-sections) + Leading + Member of
 *   `hostedSpaces`         → Resources Hosted → Spaces sub-section only
 *   `virtualContributors`  → Resources Hosted → Virtual Contributors sub-section only
 *   `leading`              → Spaces Leading only
 *   `memberOf`             → Member of only
 *
 * Sections with zero items are omitted entirely (FR-015).
 */

/* --------------------------- UserResourceSections ------------------------ */

export type UserResourceSectionsProps = {
  activeTab: ResourceTabKey;
  resources: PublicProfileResources;
  /** i18n-resolved labels for each section heading. */
  labels: {
    resourcesHosted: string;
    spaces: string;
    virtualContributors: string;
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
  organizations: AssociatedOrganizationCard[];
  /** i18n-resolved labels. */
  labels: {
    aboutTitle: string;
    organizationsTitle: string;
    emptyBio: string;
    emptyOrganizations: string;
  };
};
