import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

/**
 * Per-actor authorization predicate for the Virtual Contributor vertical
 * (research §7 — extended by the VC extension; FR-013). The VC shell route
 * boundary uses this to decide between rendering the editable settings or
 * redirecting to the public profile (`/vc/<vcNameId>`).
 *
 * The viewer "can edit VC settings" exactly when they have the `Update`
 * privilege on the VC's authorization (the same predicate the existing MUI
 * `VirtualContributorSettingsPage` uses to gate the admin shell).
 */
export type UseCanEditVcSettingsResult = {
  canEditSettings: boolean;
  hasUpdatePrivilege: boolean;
  loading: boolean;
};

const useCanEditVcSettings = (vcId: string | undefined): UseCanEditVcSettingsResult => {
  const { data, loading } = useVirtualContributorQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { id: vcId! },
    skip: !vcId,
  });

  const myPrivileges = data?.lookup.virtualContributor?.authorization?.myPrivileges ?? [];
  const hasUpdatePrivilege = myPrivileges.includes(AuthorizationPrivilege.Update);

  return {
    canEditSettings: hasUpdatePrivilege,
    hasUpdatePrivilege,
    loading,
  };
};

export default useCanEditVcSettings;
