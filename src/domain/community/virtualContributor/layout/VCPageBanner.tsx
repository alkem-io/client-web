import React from 'react';
import { useVirtualContributorQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import ProfilePageBanner from '../../../common/profile/ProfilePageBanner';

const VCPageBanner = () => {
  const { vcNameId = '' } = useUrlParams();

  const { data, loading } = useVirtualContributorQuery({
    variables: {
      id: vcNameId,
    },
  });

  const profile = data?.virtualContributor.profile;

  const userId = data?.virtualContributor.id;

  return (
    <ProfilePageBanner
      isVirtualContributor
      entityId={userId}
      profile={profile}
      settingsUri={undefined}
      loading={loading}
    />
  );
};

export default VCPageBanner;
