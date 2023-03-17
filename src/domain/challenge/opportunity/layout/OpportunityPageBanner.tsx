import React, { FC } from 'react';
import JourneyPageBanner from '../../../shared/components/PageHeader/JourneyPageBanner';
import { useOpportunity } from '../hooks/useOpportunity';
import { getVisualBanner } from '../../../common/visual/utils/visuals.utils';

const OpportunityPageBanner: FC = () => {
  const { opportunity, loading } = useOpportunity();

  return (
    <JourneyPageBanner
      title={opportunity?.profile.displayName}
      tagline={opportunity?.profile?.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(opportunity?.profile?.visuals)}
      journeyTypeName="opportunity"
      showBreadcrumbs
    />
  );
};

export default OpportunityPageBanner;
