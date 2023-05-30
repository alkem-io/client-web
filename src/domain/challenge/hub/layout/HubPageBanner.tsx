import React, { FC } from 'react';
import JourneyPageBanner from '../../../shared/components/PageHeader/JourneyPageBanner';
import { useHub } from '../HubContext/useHub';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import useInnovationHubJourneyBannerRibbon from '../../../platform/InnovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';

const HubPageBanner: FC = () => {
  const { hubId, profile, loading } = useHub();
  const visual = getVisualByType(VisualName.BANNER, profile?.visuals);

  const ribbon = useInnovationHubJourneyBannerRibbon({
    hubId,
    journeyTypeName: 'hub',
  });

  return (
    <JourneyPageBanner
      title={profile.displayName}
      tagline={profile?.tagline}
      loading={loading}
      bannerUrl={visual?.uri}
      bannerAltText={visual?.alternativeText}
      ribbon={ribbon}
      journeyTypeName="hub"
    />
  );
};

export default HubPageBanner;
