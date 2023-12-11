import React, { FC } from 'react';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { Trans } from 'react-i18next';
import { Link } from '@mui/material';
import { useReleaseNotes } from '../../metadata/useReleaseNotes';

interface PlatformNewsDashboardBlockProps {}

const PlatformNewsDashboardBlock: FC<PlatformNewsDashboardBlockProps> = () => {
  const { triggerShowDialog } = useReleaseNotes();
  return (
    <Link sx={{ cursor: 'pointer' }} onClick={triggerShowDialog}>
      <PageContentBlock accent row flexWrap="wrap">
        <Trans
          i18nKey="notifications.dashboardNotification.message"
          components={{
            big: <BlockTitle />,
            small: <Caption />,
          }}
        />
      </PageContentBlock>
    </Link>
  );
};

export default PlatformNewsDashboardBlock;
