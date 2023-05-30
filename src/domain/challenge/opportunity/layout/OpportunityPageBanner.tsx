import React, { FC } from 'react';
import JourneyPageBanner from '../../../shared/components/PageHeader/JourneyPageBanner';
import { useOpportunity } from '../hooks/useOpportunity';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import useInnovationHubJourneyBannerRibbon from '../../../platform/InnovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';

const OpportunityPageBanner: FC = () => {
  const { opportunity, loading, hubId } = useOpportunity();
  const visual = getVisualByType(VisualName.BANNER, opportunity?.profile?.visuals);

  const ribbon = useInnovationHubJourneyBannerRibbon({
    hubId,
    journeyTypeName: 'hub',
  });

  return (
    <JourneyPageBanner
      title={opportunity?.profile.displayName}
      tagline={opportunity?.profile?.tagline}
      loading={loading}
      bannerUrl={visual?.uri}
      bannerAltText={visual?.alternativeText}
      ribbon={ribbon}
      journeyTypeName="opportunity"
      showBreadcrumbs
    />
  );
};

export default OpportunityPageBanner;
