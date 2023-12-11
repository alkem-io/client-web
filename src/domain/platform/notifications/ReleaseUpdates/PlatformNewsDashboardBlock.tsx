import React from 'react';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { Trans } from 'react-i18next';
import { Link } from '@mui/material';

interface PlatformNewsDashboardBlockProps {
  onOpen: () => void;
  // onClose: () => void;
}

const PlatformNewsDashboardBlock = ({ onOpen }: PlatformNewsDashboardBlockProps) => {
  return (
    <Link sx={{ cursor: 'pointer' }} onClick={onOpen}>
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
