/**
 * Cross-tab utility contracts: per-actor route context + per-actor authorization predicates.
 *
 * Owned at the integration layer. Consumed by route guards and by individual
 * tab integration pages.
 */

/** User-side route context. Resolves /user/me → /user/<self> and currentUser. Owned by 096; reused here. */
export type UserPageRouteContext = {
  /** The user nameID from the URL (after /user/me resolution). */
  userSlug: string | null;
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
