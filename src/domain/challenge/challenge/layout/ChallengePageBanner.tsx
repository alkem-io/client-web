import React, { FC } from 'react';
import JourneyPageBanner from '../../../shared/components/PageHeader/JourneyPageBanner';
import { useChallenge } from '../hooks/useChallenge';
import { getVisualBanner } from '../../../common/visual/utils/visuals.utils';

const ChallengePageBanner: FC = () => {
  const { challenge, loading } = useChallenge();

  return (
    <JourneyPageBanner
      title={challenge?.displayName}
      tagline={challenge?.context?.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(challenge?.context?.visuals)}
      journeyTypeName="challenge"
      showBreadcrumbs
    />
  );
};

export default ChallengePageBanner;
