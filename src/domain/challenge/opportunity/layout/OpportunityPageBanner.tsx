import React, { FC } from 'react';
import EntityPageBanner from '../../../shared/components/PageHeader/EntityPageBanner';
import { useOpportunity } from '../hooks/useOpportunity';
import { getVisualBanner } from '../../../common/visual/utils/visuals.utils';

const OpportunityPageBanner: FC = () => {
  const { opportunity, loading } = useOpportunity();

  return (
    <EntityPageBanner
      title={opportunity?.displayName}
      tagline={opportunity?.context?.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(opportunity?.context?.visuals)}
      entityTypeName="opportunity"
      showBreadcrumbs
    />
  );
};

export default OpportunityPageBanner;
