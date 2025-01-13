import { useVirtualContributorQuery, useVirtualContributorUrlResolverQuery } from '@/core/apollo/generated/apollo-hooks';
import { useUrlParams } from '@/core/routing/useUrlParams';
import ProfilePageBanner from '@/domain/common/profile/ProfilePageBanner';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { buildSettingsProfileUrl } from '@/main/routing/urlBuilders';

const VCPageBanner = () => {
  const { vcNameId = '' } = useUrlParams();
  const {
    data: urlResolverData
  } = useVirtualContributorUrlResolverQuery({
    variables: { nameId: vcNameId },
    skip: !vcNameId,
  });
  const vcId = urlResolverData?.lookupByName.virtualContributor;

  const { data, loading } = useVirtualContributorQuery({
    variables: { id: vcId! },
    skip: !vcId
  });
  const vc = data?.lookup.virtualContributor;
  const profile = vc?.profile;
  const hasSettingsAccess = vc?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Update
  );

  return (
    <ProfilePageBanner
      isVirtualContributor
      entityId={vc?.id}
      profile={profile}
      settingsUri={hasSettingsAccess && profile?.url ? buildSettingsProfileUrl(profile.url) : undefined}
      loading={loading}
    />
  );
};

export default VCPageBanner;
