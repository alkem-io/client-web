import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import ProfilePageBanner from '@/domain/common/profile/ProfilePageBanner';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

const VCPageBanner = () => {
  const { vcId, loading: urlResolverLoading } = useUrlResolver();

  const { data, loading } = useVirtualContributorQuery({
    variables: { id: vcId! },
    skip: !vcId,
  });
  const vc = data?.lookup.virtualContributor;
  const profile = vc?.profile;
  const hasSettingsAccess = vc?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);

  return (
    <ProfilePageBanner
      isVirtualContributor
      entityId={vc?.id}
      profile={profile}
      settingsUri={hasSettingsAccess && profile?.url ? buildSettingsUrl(profile.url) : undefined}
      loading={urlResolverLoading || loading}
    />
  );
};

export default VCPageBanner;
