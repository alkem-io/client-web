import React from 'react';
import { useVirtualContributorQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import ProfilePageBanner from '../../../common/profile/ProfilePageBanner';
import { buildVCProfileSettingsUrl } from '../../../../main/routing/urlBuilders';

const VCPageBanner = () => {
  const { vcNameId = '' } = useUrlParams();

  const { data, loading } = useVirtualContributorQuery({
    variables: {
      id: vcNameId,
    },
  });

  const profile = data?.virtualContributor.profile;

  const userId = data?.virtualContributor.id;

  // TODO: implement hasSettings priviliges
  // TBD but the current user has to be the HOST of the Account where the VC is used
  const hasSettingsAccess = false;

  return (
    <ProfilePageBanner
      isVirtualContributor
      entityId={userId}
      profile={profile}
      settingsUri={hasSettingsAccess ? buildVCProfileSettingsUrl(data?.virtualContributor.nameID || '') : undefined}
      loading={loading}
    />
  );
};

export default VCPageBanner;
