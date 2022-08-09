import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import PageBanner from '../../shared/components/PageHeader/PageBanner';
import { useOpportunity } from '../../../hooks';
import { getVisualBanner } from '../../../utils/visuals.utils';

const OpportunityPageBanner: FC = () => {
  const { t } = useTranslation();

  const { opportunity, loading } = useOpportunity();

  return (
    <PageBanner
      title={opportunity?.displayName}
      tagline={opportunity?.context?.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(opportunity?.context?.visuals)}
      showBreadcrumbs
      breadcrumbsTitle={t('pages.opportunity.opportunity-breadcrumbs')}
    />
  );
};

export default OpportunityPageBanner;
