import React, { FC } from 'react';
import PageBanner from '../../shared/components/PageHeader/PageBanner';
import { useChallenge } from '../../../hooks';
import { getVisualBanner } from '../../../common/utils/visuals.utils';

const ChallengePageBanner: FC = () => {
  const { challenge, loading } = useChallenge();

  return (
    <PageBanner
      title={challenge?.displayName}
      tagline={challenge?.context?.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(challenge?.context?.visuals)}
      showBreadcrumbs
    />
  );
};

export default ChallengePageBanner;
