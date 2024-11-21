import { Trans, useTranslation } from 'react-i18next';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import { BlockTitle, Caption } from '@/core/ui/typography';
import React from 'react';
import DashboardBanner from '@/core/ui/content/DashboardBanner';
import useReleaseNotes from '@/domain/platform/metadata/useReleaseNotes';
import RouterLink from '@/core/ui/link/RouterLink';
import { useConfig } from '@/domain/platform/config/useConfig';
import { gutters } from '@/core/ui/grid/utils';

const IS_CLICKABLE = 'true';

const ReleaseNotesBanner = () => {
  const { t } = useTranslation();
  const { locations } = useConfig();

  const releaseNotesUrl = t('releaseNotes.url');
  const isClickable = t('releaseNotes.isClickable').toLocaleLowerCase() === IS_CLICKABLE;

  const { open, onClose } = useReleaseNotes(releaseNotesUrl);

  if (!open) {
    return null;
  }

  return (
    <DashboardBanner
      to={releaseNotesUrl}
      isLink={isClickable}
      onClose={onClose}
      containerProps={{ paddingX: gutters(), paddingY: gutters(0.5) }}
    >
      <Trans
        i18nKey="releaseNotes.title"
        components={{
          icon: <CampaignOutlinedIcon fontSize="small" sx={{ marginRight: '8px', verticalAlign: 'bottom' }} />,
          big: <BlockTitle />,
          small: <Caption />,
          terms: <RouterLink to={locations?.terms ?? ''} underline="always" />,
          privacy: <RouterLink to={locations?.privacy ?? ''} underline="always" />,
        }}
      />
    </DashboardBanner>
  );
};

export default ReleaseNotesBanner;
