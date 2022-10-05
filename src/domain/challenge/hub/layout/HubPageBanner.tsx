import React, { FC, ReactElement } from 'react';
import { useConfig, useHub } from '../../../../hooks';
import PageBanner from '../../../shared/components/PageHeader/PageBanner';
import { getVisualBanner } from '../../../../common/utils/visuals.utils';
import { HubVisibility } from '../../../../models/graphql-schema';
import { TranslateWithElements } from '../../../shared/i18n/TranslateWithElements';
import { Link } from '@mui/material';

const HubPageBanner: FC = () => {
  const tLinks = TranslateWithElements(<Link />);
  const { displayName, context, loading, visibility } = useHub();
  const { platform } = useConfig();

  let pageNotice: ReactElement | undefined;
  switch (visibility) {
    case HubVisibility.Archived: {
      pageNotice = tLinks('pages.hub.archived-hub-notice', {
        contact: { href: platform?.feedback, target: '_blank' },
      });
      break;
    }
    case HubVisibility.Demo: {
      pageNotice = tLinks('pages.hub.demo-hub-notice', {
        alkemio: { href: platform?.feedback, target: '_blank' },
      });
      break;
    }
  }

  return (
    <PageBanner
      title={displayName}
      tagline={context?.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(context?.visuals)}
      pageNotice={pageNotice}
    />
  );
};

export default HubPageBanner;
