import React from 'react';
import { useVirtualContributorQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import ProfilePageBanner from '../../../common/profile/ProfilePageBanner';
import { buildVCProfileSettingsUrl } from '../../../../main/routing/urlBuilders';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';

const VCPageBanner = () => {
  const { vcNameId = '' } = useUrlParams();

  const { data, loading } = useVirtualContributorQuery({
    variables: {
      id: vcNameId,
    },
  });

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
      settingsUri={hasSettingsAccess ? buildVCProfileSettingsUrl(data?.virtualContributor.nameID || '') : undefined}
      loading={loading}
    />
  );
};

export default VCPageBanner;
