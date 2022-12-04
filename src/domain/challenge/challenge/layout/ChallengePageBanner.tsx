import React, { FC } from 'react';
import PageBanner from '../../../shared/components/PageHeader/PageBanner';
import { useChallenge } from '../hooks/useChallenge';
import { getVisualBanner } from '../../../common/visual/utils/visuals.utils';

const ChallengePageBanner: FC = () => {
  const { challenge, loading } = useChallenge();

  return (
    <PageBanner
      title={challenge?.displayName}
      tagline={challenge?.context?.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(challenge?.context?.visuals)}
      entityTypeName="challenge"
      showBreadcrumbs
    />
  );
};

export default ChallengePageBanner;
