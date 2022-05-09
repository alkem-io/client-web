import React, { FC } from 'react';
import { useHub } from '../../../hooks';
import PageBanner from '../../shared/components/PageHeader/PageBanner';
import { getVisualBanner } from '../../../common/utils/visuals.utils';

const HubPageBanner: FC = () => {
  const { displayName, context, loading } = useHub();

  return (
    <PageBanner
      title={displayName}
      tagline={context?.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(context?.visuals)}
    />
  );
};

export default HubPageBanner;
