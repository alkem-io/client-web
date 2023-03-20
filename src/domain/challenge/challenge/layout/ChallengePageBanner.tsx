import React, { FC } from 'react';
import JourneyPageBanner from '../../../shared/components/PageHeader/JourneyPageBanner';
import { useChallenge } from '../hooks/useChallenge';
import { getVisualBanner } from '../../../common/visual/utils/visuals.utils';

const ChallengePageBanner: FC = () => {
  const { challenge, loading } = useChallenge();

  return (
    <JourneyPageBanner
      title={challenge?.profile.displayName}
      tagline={challenge?.profile.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(challenge?.profile.visuals)}
      journeyTypeName="challenge"
      showBreadcrumbs
    />
  );
};

export default ChallengePageBanner;
