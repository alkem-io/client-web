import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import PageBanner from '../../shared/components/PageHeader/PageBanner';
import { useChallenge } from '../../../hooks';
import { getVisualBanner } from '../../../utils/visuals.utils';

const ChallengePageBanner: FC = () => {
  const { t } = useTranslation();

  const { challenge, loading } = useChallenge();

  return (
    <PageBanner
      title={challenge?.displayName}
      tagline={challenge?.context?.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(challenge?.context?.visuals)}
      showBreadcrumbs
      breadcrumbsTitle={t('pages.challenge.challenge-breadcrumbs')}
    />
  );
};

export default ChallengePageBanner;
