import useOrganizationProvider from '@/domain/community/organization/useOrganization/useOrganization';

/**
 * Per-actor authorization predicate for the Organization vertical
 * (research §7 / FR-011). The Org shell route boundary uses this to decide
 * between rendering the editable settings or redirecting to the public
 * profile (`/organization/<orgSlug>`).
 *
 * The viewer "can edit organization settings" exactly when they have the
 * `Update` privilege on the org's authorization (the same predicate the
 * existing MUI `NonAdminRedirect` uses on the org admin route). The
 * privilege is exposed via `useOrganizationProvider().permissions.canEdit`.
 */
export type UseCanEditOrganizationSettingsResult = {
  canEditSettings: boolean;
  hasUpdatePrivilege: boolean;
  loading: boolean;
};

const useCanEditOrganizationSettings = (): UseCanEditOrganizationSettingsResult => {
  const { permissions, loading } = useOrganizationProvider();
  const hasUpdatePrivilege = permissions.canEdit;

  return {
    canEditSettings: hasUpdatePrivilege,
    hasUpdatePrivilege,
    loading,
  };
};

export default useCanEditOrganizationSettings;
