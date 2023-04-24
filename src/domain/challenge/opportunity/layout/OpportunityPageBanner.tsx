import React, { FC } from 'react';
import JourneyPageBanner from '../../../shared/components/PageHeader/JourneyPageBanner';
import { useOpportunity } from '../hooks/useOpportunity';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { VisualName } from '../../../common/visual/constants/visuals.constants';

const OpportunityPageBanner: FC = () => {
  const { opportunity, loading } = useOpportunity();
  const visual = getVisualByType(VisualName.BANNER, opportunity?.profile?.visuals);
  return (
    <JourneyPageBanner
      title={opportunity?.profile.displayName}
      tagline={opportunity?.profile?.tagline}
      loading={loading}
      bannerUrl={visual?.uri}
      bannerAltText={visual?.alternativeText}
      journeyTypeName="opportunity"
      showBreadcrumbs
    />
  );
};

export default OpportunityPageBanner;
