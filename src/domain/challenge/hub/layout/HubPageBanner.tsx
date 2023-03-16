import React, { FC } from 'react';
import JourneyPageBanner from '../../../shared/components/PageHeader/JourneyPageBanner';
import { useHub } from '../HubContext/useHub';
import { getVisualBanner } from '../../../common/visual/utils/visuals.utils';

const HubPageBanner: FC = () => {
  const { profile, loading } = useHub();

  return (
    <JourneyPageBanner
      title={profile.displayName}
      tagline={profile?.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(profile?.visuals)}
      journeyTypeName="hub"
    />
  );
};

export default HubPageBanner;
