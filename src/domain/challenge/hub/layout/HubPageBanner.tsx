import React, { FC } from 'react';
import JourneyPageBanner from '../../../shared/components/PageHeader/JourneyPageBanner';
import { useHub } from '../HubContext/useHub';
import { getVisualBanner } from '../../../common/visual/utils/visuals.utils';

const HubPageBanner: FC = () => {
  const { displayName, context, loading } = useHub();

  return (
    <JourneyPageBanner
      title={displayName}
      tagline={context?.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(context?.visuals)}
      journeyTypeName="hub"
    />
  );
};

export default HubPageBanner;
