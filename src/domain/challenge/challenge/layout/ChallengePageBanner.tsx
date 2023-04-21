import React, { FC } from 'react';
import JourneyPageBanner from '../../../shared/components/PageHeader/JourneyPageBanner';
import { useChallenge } from '../hooks/useChallenge';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { VisualName } from '../../../common/visual/constants/visuals.constants';

const ChallengePageBanner: FC = () => {
  const { challenge, loading } = useChallenge();
  const visual = getVisualByType(VisualName.BANNER, challenge?.profile?.visuals);

  return (
    <JourneyPageBanner
      title={challenge?.profile.displayName}
      tagline={challenge?.profile.tagline}
      loading={loading}
      bannerUrl={visual?.uri}
      bannerAltText={visual?.alternativeText}
      journeyTypeName="challenge"
      showBreadcrumbs
    />
  );
};

export default ChallengePageBanner;
