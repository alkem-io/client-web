/**
 * Cross-tab utility contracts: per-actor route context + per-actor authorization predicates.
 *
 * Owned at the integration layer. Consumed by route guards and by individual
 * tab integration pages.
 */

/** User-side route context. Resolves /user/me → /user/<self> and currentUser. Owned by 096; reused here. */
export type UserPageRouteContext = {
  /**
   * Canonical public-profile URL for the resolved user (`user.profile.url`,
   * mapped through `getProfileUrl` so `/user/me` stays `/user/me`). The
   * settings shell composes its tab URLs on top of this via
   * `buildSettingsTabUrl(profileUrl, tabId)` from `@/main/routing/urlBuilders`
   * — never by hand-rolling `/user/<nameId>/...`. The URL is the canonical
   * identifier here; the underlying `nameID` is an implementation detail.
   */
  profileUrl: string | undefined;
  /** The user's database id (resolved from useUserProvider). */
  userId: string | null;
  /** The currently-authenticated user's database id. */
  currentUserId: string | null;
  loading: boolean;
};

export type UseUserPageRouteContext = () => UserPageRouteContext;

/** User Settings authorization predicate. Used by CrdUserSettingsRoutes route guard. */
export type UseCanEditUserSettings = (profileUserId: string | null) => {
  canEditSettings: boolean;
  isOwner: boolean;
  isPlatformAdmin: boolean;
  loading: boolean;
};

/** Org Settings authorization predicate. Used by CrdOrgSettingsRoutes route guard. */
export type UseCanEditOrganizationSettings = (organizationId: string | null) => {
  canEditSettings: boolean;
  hasUpdatePrivilege: boolean;
  loading: boolean;
};
