import React, { FC } from 'react';
import JourneyPageBanner from '../../../shared/components/PageHeader/JourneyPageBanner';
import { useChallenge } from '../hooks/useChallenge';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import useInnovationHubJourneyBannerRibbon from '../../../platform/InnovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';

const ChallengePageBanner: FC = () => {
  const { challenge, loading, spaceId } = useChallenge();
  const visual = getVisualByType(VisualName.BANNER, challenge?.profile?.visuals);

  const ribbon = useInnovationHubJourneyBannerRibbon({
    spaceId,
    journeyTypeName: 'space',
  });

  return (
    <JourneyPageBanner
      title={challenge?.profile.displayName}
      tagline={challenge?.profile.tagline}
      loading={loading}
      bannerUrl={visual?.uri}
      bannerAltText={visual?.alternativeText}
      ribbon={ribbon}
      journeyTypeName="challenge"
      showBreadcrumbs
    />
  );
};

export default ChallengePageBanner;
