import React, { FC } from 'react';
import { useHub } from '../../../../hooks';
import PageBanner from '../../../shared/components/PageHeader/PageBanner';
import { getVisualBanner } from '../../../../common/utils/visuals.utils';
import { HubVisibility } from '../../../../models/graphql-schema';

const HubPageBanner: FC = () => {
  const { displayName, context, loading, visibility } = useHub();

  let title = displayName;
  if (visibility && visibility !== HubVisibility.Active) {
    title = `${displayName} [${visibility.toUpperCase()}]`;
  }

  return (
    <PageBanner
      title={title}
      tagline={context?.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(context?.visuals)}
    />
  );
};

export default HubPageBanner;
