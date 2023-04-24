import React, { FC } from 'react';
import JourneyPageBanner from '../../../shared/components/PageHeader/JourneyPageBanner';
import { useHub } from '../HubContext/useHub';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { VisualName } from '../../../common/visual/constants/visuals.constants';

const HubPageBanner: FC = () => {
  const { profile, loading } = useHub();
  const visual = getVisualByType(VisualName.BANNER, profile?.visuals);

  return (
    <JourneyPageBanner
      title={profile.displayName}
      tagline={profile?.tagline}
      loading={loading}
      bannerUrl={visual?.uri}
      bannerAltText={visual?.alternativeText}
      journeyTypeName="hub"
    />
  );
};

export default HubPageBanner;
