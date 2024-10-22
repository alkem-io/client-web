import { Trans, useTranslation } from 'react-i18next';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import React from 'react';
import DashboardBanner from '../../../../core/ui/content/DashboardBanner';
import useReleaseNotes from '../../../../domain/platform/metadata/useReleaseNotes';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { useConfig } from '../../../../domain/platform/config/useConfig';

const URL_NOT_CLICKABLE_MARKER = 'NOT_CLICKABLE';

const ReleaseNotesBanner = () => {
  const { t } = useTranslation();
  const { locations } = useConfig();

  const releaseNotesUrl = t('releaseNotes.url');

  const { open, onClose } = useReleaseNotes(releaseNotesUrl);

  const notClickable = releaseNotesUrl.includes(URL_NOT_CLICKABLE_MARKER);

  if (!open) {
    return null;
  }

  return (
    <DashboardBanner to={releaseNotesUrl} isLink={!notClickable} onClose={onClose}>
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
