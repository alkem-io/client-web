import React, { FC } from 'react';
import EntityPageBanner from '../../../shared/components/PageHeader/EntityPageBanner';
import { useChallenge } from '../hooks/useChallenge';
import { getVisualBanner } from '../../../common/visual/utils/visuals.utils';

const ChallengePageBanner: FC = () => {
  const { challenge, loading } = useChallenge();

  return (
    <EntityPageBanner
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
