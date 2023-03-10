import React, { FC } from 'react';
import EntityPageBanner from '../../../shared/components/PageHeader/EntityPageBanner';
import { useOpportunity } from '../hooks/useOpportunity';
import { getVisualBanner } from '../../../common/visual/utils/visuals.utils';

const OpportunityPageBanner: FC = () => {
  const { opportunity, loading } = useOpportunity();

  return (
    <EntityPageBanner
      title={opportunity?.profile.displayName}
      tagline={opportunity?.profile.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(opportunity?.profile.visuals)}
      entityTypeName="opportunity"
      showBreadcrumbs
    />
  );
};

export default OpportunityPageBanner;
