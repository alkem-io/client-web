import useOrganizationProvider from '@/domain/community/organization/useOrganization/useOrganization';

/**
 * How much of the Org Settings shell the viewer may open.
 *
 * - `full` — every tab; the viewer holds `Update` on the organization.
 * - `community-only` — the Community tab alone; the viewer lacks `Update` but holds
 *   Platform Support's org-membership privilege on the organization's role set.
 * - `none` — nothing; the shell redirects to the public profile.
 */
export type OrgSettingsAccessMode = 'full' | 'community-only' | 'none';

/**
 * Per-actor authorization predicate for the Organization vertical. The Org
 * shell route boundary uses this to decide between rendering the editable settings or redirecting to the public
 * profile (`/organization/<orgSlug>`).
 *
 * The viewer "can edit organization settings" when they have the `Update`
 * privilege on the org's authorization (the same predicate the existing MUI
 * `NonAdminRedirect` uses on the org admin route), or when Platform Support may
 * manage the org's Community tab — in which case `accessMode` confines them to
 * that tab. Both are exposed via `useOrganizationProvider().permissions`.
 */
export type UseCanEditOrganizationSettingsResult = {
  canEditSettings: boolean;
  hasUpdatePrivilege: boolean;
  accessMode: OrgSettingsAccessMode;
  loading: boolean;
};

const useCanEditOrganizationSettings = (): UseCanEditOrganizationSettingsResult => {
  const { permissions, loading } = useOrganizationProvider();
  const hasUpdatePrivilege = permissions.canEdit;

  const accessMode: OrgSettingsAccessMode = hasUpdatePrivilege
    ? 'full'
    : permissions.canManageCommunityAsSupport
      ? 'community-only'
      : 'none';

  return {
    canEditSettings: accessMode !== 'none',
    hasUpdatePrivilege,
    accessMode,
    loading,
  };
};

export default useCanEditOrganizationSettings;
