/**
 * Cross-page mapper utility contracts (public profile pages — User, Organization, VC).
 *
 * Mappers live in the integration layer at:
 *   src/main/crdPages/topLevelPages/userPages/publicProfile/publicProfileMapper.ts
 *   src/main/crdPages/topLevelPages/organizationPages/publicProfile/organizationProfileMapper.ts
 *   src/main/crdPages/topLevelPages/vcPages/publicProfile/vcProfileMapper.ts
 *
 * Mappers are the ONLY place GraphQL-generated types meet CRD prop types
 * (FR-005). Each mapper is a pure function (or set of pure functions) so
 * it can be unit-tested without React.
 */

/**
 * The set of routes / hooks the integration layer is allowed to import.
 * This list is informative — it documents the allowed surface for review:
 *
 *   - `@/core/apollo/generated/apollo-hooks` and `@/core/apollo/generated/graphql-schema`
 *   - `@/domain/community/user/*`
 *   - `@/domain/community/organization/*` (selective — only the hooks/providers, not MUI views)
 *   - `@/domain/community/virtualContributor/*` (selective — only the hooks, not MUI views)
 *   - `@/domain/community/userCurrent/*`
 *   - `@/domain/community/profile/useContributionProvider/*`
 *   - `@/main/routing/urlResolver/*`
 *   - `@/main/routing/urlBuilders` (for buildSettingsUrl)
 *   - `react-router-dom`
 *
 * The integration layer MUST NOT import `@mui/*`, `@emotion/*`, or any
 * MUI-only View component (`OrganizationPageView`, `VCProfilePageView`,
 * `UserPageBanner`, etc.).
 */

/* --------------------------- canEditSettings (User) ---------------------- */

/**
 * Centralizes the FR-008a predicate for the USER vertical so the User profile
 * (this spec) and the User Settings shell (sibling spec 097) agree on it.
 *
 * NOTE: Organization and VC profiles use their OWN per-entity authorization
 * predicates (not this hook):
 *   - Organization: `useOrganizationProvider().permissions.canEdit`
 *   - VC:           `vc.authorization.myPrivileges` includes `Update`
 *
 * Implementation lives at:
 *   src/main/crdPages/topLevelPages/userPages/useCanEditSettings.ts
 */
export type UseCanEditSettings = (params: {
  profileUserId: string | undefined;
}) => {
  canEditSettings: boolean;
  /**
   * Distinguishes the two truthy cases. Used to gate the Security tab
   * (owner-only, sibling spec 097) and to produce admin-specific copy.
   */
  isOwner: boolean;
  isPlatformAdmin: boolean;
};

/* ------------------------ useUserPageRouteContext ------------------------ */

/**
 * Resolves the profile-being-viewed user from the URL and exposes:
 *   - `userSlug`: the URL slug (`/user/:userSlug`)
 *   - `userId`: the resolved UUID (loading-aware)
 *   - `currentUserId`: the viewer's UUID (or null if anonymous)
 *   - `loading`: combined loading flag for both
 *
 * Reuses `useUserProvider` + `useCurrentUserContext` under the hood.
 *
 * Implementation lives at:
 *   src/main/crdPages/topLevelPages/userPages/useUserPageRouteContext.ts
 */
export type UseUserPageRouteContext = () => {
  userSlug: string | undefined;
  userId: string | undefined;
  currentUserId: string | null;
  loading: boolean;
};

/* ---------------------- useSendMessageHandler (shared) ------------------- */

/**
 * Shared hook used by the User AND Organization profile heroes (research §5).
 * Wraps `useSendMessageToUsersMutation` with the recipient ID baked in, so
 * the presentational hero only deals with `(messageText) => Promise<void>`.
 *
 * Implementation lives at:
 *   src/main/crdPages/topLevelPages/userPages/publicProfile/useSendMessageHandler.ts
 */
export type UseSendMessageHandler = (params: {
  recipientId: string | undefined;
}) => {
  onSendMessage: (messageText: string) => Promise<void>;
  sending: boolean;
  error: string | null;
};

/* -------------------- Per-page integration page shape ------------------- */

/**
 * Each per-page CRD integration page (`Crd<Actor>ProfilePage.tsx`) follows
 * this shape:
 *
 *   1. Read URL via the actor's URL resolver (User: `useUserPageRouteContext`;
 *      Org/VC: `useUrlResolver`).
 *   2. Compute the actor's `can*` predicate (User: `useCanEditSettings`;
 *      Org: `useOrganizationProvider().permissions.canEdit`; VC: check
 *      `vc.authorization.myPrivileges` for `Update`).
 *   3. Run the per-page Apollo queries.
 *   4. Build callback handlers (User+Org: send-message; Org+VC: navigate to
 *      MUI admin URL on Settings click).
 *   5. Call the per-page mapper to produce the view-prop object.
 *   6. Render the CRD view, passing the view-prop object.
 *
 * No business logic lives in the CRD view. No Apollo / routing imports
 * leak into the CRD view.
 */

/* ------------------------------ Test fixtures ---------------------------- */

/**
 * Each mapper test exports a small set of fixture objects shaped to the
 * generated GraphQL types. Fixtures are kept minimal — only the fields the
 * mapper consumes are populated.
 */
