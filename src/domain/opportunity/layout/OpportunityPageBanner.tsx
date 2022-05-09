import React, { FC } from 'react';
import PageBanner from '../../shared/components/PageHeader/PageBanner';
import { useOpportunity } from '../../../hooks';
import { getVisualBanner } from '../../../common/utils/visuals.utils';

const OpportunityPageBanner: FC = () => {
  const { opportunity, loading } = useOpportunity();

  return (
    <PageBanner
      title={opportunity?.displayName}
      tagline={opportunity?.context?.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(opportunity?.context?.visuals)}
      showBreadcrumbs
    />
  );
};

export default OpportunityPageBanner;
