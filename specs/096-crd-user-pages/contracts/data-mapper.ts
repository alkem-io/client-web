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

/* ---------------------- send-message handlers (split per recipient — F1) - */

/**
 * F1 correction (vs. earlier draft): User and Organization use DIFFERENT
 * GraphQL mutations with different input shapes:
 *   - User → `useSendMessageToUsersMutation` with `{ message, receiverIds: [userId] }`
 *   - Organization → `useSendMessageToOrganizationMutation` with `{ message, organizationId }`
 *
 * The earlier draft assumed both verticals could share one wrapper around
 * `useSendMessageToUsersMutation`; that was wrong (the operation names and
 * input shapes diverge). The implementation provides two named helpers, both
 * exposing the same external API, so the shared `MessagePopover` UI primitive
 * stays recipient-agnostic.
 *
 * Both helpers live at:
 *   src/main/crdPages/topLevelPages/common/useSendMessageHandler.ts
 *
 * Placed under `topLevelPages/common/` (not inside either vertical) so neither
 * vertical cross-imports the other — same rationale as the `MessagePopover`
 * placement under `src/crd/components/common/` (research §5).
 */
export type SendMessageHandlerResult = {
  onSendMessage: (messageText: string) => Promise<void>;
  sending: boolean;
  error: string | null;
};

export type UseSendMessageToUserHandler = (params: {
  recipientUserId: string | undefined;
}) => SendMessageHandlerResult;

export type UseSendMessageToOrganizationHandler = (params: {
  recipientOrganizationId: string | undefined;
}) => SendMessageHandlerResult;

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
 *   3. Run the per-page Apollo queries — wrapped in a `useCrd<Actor>ProfilePageData`
 *      hook so the page itself stays declarative (User/Org/VC all follow this
 *      pattern).
 *   4. Build the send-message handler when applicable (User + Org only — VC has
 *      no Message button per FR-030). Settings is rendered as an `<a href>` in
 *      the CRD hero — no callback indirection (per CRD Golden Rule 3, which
 *      allows `<a href>` links without programmatic navigation).
 *   5. Call the per-page mapper to produce the view-prop sub-objects. The User
 *      and Organization "hosted resources" sub-mapper is shared via
 *      `mapAccountHostedResources` in `topLevelPages/common/profileMapperHelpers.ts`.
 *   6. Render the CRD view, passing the view-prop sub-objects (flat shape:
 *      `{ hero, sidebar, tabStrip, sections|rightColumn|contentView, loading,
 *      loadingLabels }` — there is no `user`/`organization`/`vc` wrapper).
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
