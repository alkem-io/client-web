import { Trans, useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import React from 'react';
import DashboardBanner from '../../../../core/ui/content/DashboardBanner';
import useReleaseNotes from '../../../../domain/platform/metadata/useReleaseNotes';

const ReleaseNotesBanner = () => {
  const { t } = useTranslation();

  const releaseNotesUrl = t('releaseNotes.forumreleases');

  const { open, onClose } = useReleaseNotes(releaseNotesUrl);

  if (!open) {
    return null;
  }

  return (
    <DashboardBanner to={releaseNotesUrl} onClose={onClose}>
      <Trans
        i18nKey="releaseNotes.title"
        components={{
          big: <BlockTitle />,
          small: <Caption />,
        }}
      />
    </DashboardBanner>
  );
};

export default ReleaseNotesBanner;
