import React, { FC } from 'react';
import { useConfig, useHub } from '../../../../hooks';
import PageBanner from '../../../shared/components/PageHeader/PageBanner';
import { getVisualBanner } from '../../../../common/utils/visuals.utils';
import { HubVisibility } from '../../../../models/graphql-schema';
import { TranslateWithElements } from '../../../shared/i18n/TranslateWithElements';
import { Link } from '@mui/material';
import { Configuration } from '../../../../models/configuration';
import TranslationKey from '../../../../types/TranslationKey';

const getPageNoticeLabel = (
  visibility: HubVisibility,
  platform: Configuration['platform']
): [TranslationKey, {}] | undefined => {
  switch (visibility) {
    case HubVisibility.Archived: {
      return [
        'pages.hub.archived-hub-notice',
        {
          contact: { href: platform?.feedback, target: '_blank' },
        },
      ];
    }
    case HubVisibility.Demo: {
      return [
        'pages.hub.demo-hub-notice',
        {
          alkemio: { href: platform?.feedback, target: '_blank' },
        },
      ];
    }
  }
};

const HubPageBanner: FC = () => {
  const tLinks = TranslateWithElements(<Link />);
  const { displayName, context, loading, visibility } = useHub();
  const { platform } = useConfig();

  const pageNoticeLabel = platform && getPageNoticeLabel(visibility, platform);
  const pageNotice = pageNoticeLabel && tLinks(...pageNoticeLabel);

  return (
    <PageBanner
      title={displayName}
      tagline={context?.tagline}
      loading={loading}
      bannerUrl={getVisualBanner(context?.visuals)}
      entityTypeName="hub"
      pageNotice={pageNotice}
    />
  );
};

export default HubPageBanner;
