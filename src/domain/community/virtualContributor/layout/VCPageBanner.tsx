import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import { useUrlParams } from '@/core/routing/useUrlParams';
import ProfilePageBanner from '@/domain/common/profile/ProfilePageBanner';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { buildSettingsProfileUrl } from '@/main/routing/urlBuilders';

const VCPageBanner = () => {
  const { vcNameId = '' } = useUrlParams();

  const { data, loading } = useVirtualContributorQuery({ variables: { id: vcNameId } });

  const profile = data?.virtualContributor.profile;

  const vcId = data?.virtualContributor.id;

  const hasSettingsAccess = data?.virtualContributor.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Update
  );

  return (
    <ProfilePageBanner
      isVirtualContributor
      entityId={vcId}
      profile={profile}
      settingsUri={hasSettingsAccess ? buildSettingsProfileUrl(data?.virtualContributor.profile.url ?? '') : undefined}
      loading={loading}
    />
  );
};

export default VCPageBanner;
