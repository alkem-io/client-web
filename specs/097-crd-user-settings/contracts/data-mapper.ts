/**
 * Cross-page mapper utility contracts (settings tabs).
 *
 * Mappers live in the integration layer at:
 *   src/main/crdPages/topLevelPages/userPages/settings/<tab>/<tab>Mapper.ts
 *
 * Mappers are the ONLY place GraphQL-generated types meet CRD prop types
 * (FR-005). Each mapper is a pure function (or set of pure functions) so
 * it can be unit-tested without React.
 *
 * The same `UseCanEditSettings` and `UseUserPageRouteContext` helpers are
 * referenced by sibling spec 096-crd-user-pages (the Settings gear icon on
 * the public-profile hero uses the same predicate). The two specs share
 * one implementation each; the duplicated contract documentation keeps each
 * spec self-contained for review.
 */

/**
 * The set of routes / hooks the integration layer is allowed to import.
 * This list is informative — it documents the allowed surface for review:
 *
 *   - `@/core/apollo/generated/apollo-hooks` and `@/core/apollo/generated/graphql-schema`
 *   - `@/domain/community/user/*`
 *   - `@/domain/community/userAdmin/*` (selective — only the hooks, not the MUI views)
 *   - `@/domain/community/userCurrent/*`
 *   - `@/domain/community/profile/useContributionProvider/*`
 *   - `@/main/pushNotifications/PushNotificationProvider`
 *   - `react-router-dom`
 *
 * The integration layer MUST NOT import `@mui/*`, `@emotion/*`, or any
 * MUI-only View component (`ContributorAccountView`, `UserPageBanner`, etc.).
 */

/* --------------------------- canEditSettings ----------------------------- */

/**
 * Centralizes the FR-008a predicate so every mapper agrees on it.
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
   * (owner-only) and to produce admin-specific copy when relevant.
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

/* ---------------------- Per-tab integration page shape ------------------- */

/**
 * Each per-tab CRD integration page (`Crd<Tab>Page.tsx`) follows this shape:
 *
 *   1. Read URL via `useUserPageRouteContext()`.
 *   2. Compute `canEditSettings` via `useCanEditSettings()`.
 *   3. Run the per-tab Apollo queries.
 *   4. Build callback handlers (mutations + navigation).
 *   5. Call the per-tab mapper to produce the view-prop object.
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
