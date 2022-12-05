import React, { FC } from 'react';
import { useHub } from '../HubContext/useHub';
import { useConfig } from '../../../platform/config/useConfig';
import EntityPageBanner from '../../../shared/components/PageHeader/EntityPageBanner';
import { getVisualBanner } from '../../../common/visual/utils/visuals.utils';
import { HubVisibility } from '../../../../core/apollo/generated/graphql-schema';
import { TranslateWithElements } from '../../../shared/i18n/TranslateWithElements';
import { Link } from '@mui/material';
import { Configuration } from '../../../platform/config/configuration';
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
    <EntityPageBanner
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
