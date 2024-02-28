import React from 'react';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import { Trans, useTranslation } from 'react-i18next';
import DashboardBanner from '../../../../core/ui/content/DashboardBanner';

const StartingSpace = () => {
  const { t } = useTranslation();

  return (
    <DashboardBanner to={t('pages.home.sections.startingSpace.url')}>
      <Trans
        i18nKey="pages.home.sections.startingSpace.title"
        components={{
          big: <BlockTitle />,
          small: <Caption />,
        }}
      />
    </DashboardBanner>
  );
};

export default StartingSpace;
