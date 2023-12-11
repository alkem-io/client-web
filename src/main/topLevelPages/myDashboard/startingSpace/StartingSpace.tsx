import React from 'react';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from '@mui/material';

const StartingSpace = () => {
  const { t } = useTranslation();

  return (
    <Link href={t('pages.home.sections.startingSpace.url')}>
      <PageContentBlock accent row flexWrap="wrap">
        <Trans
          i18nKey="pages.home.sections.startingSpace.title"
          components={{
            big: <BlockTitle />,
            small: <Caption />,
          }}
        />
      </PageContentBlock>
    </Link>
  );
};

export default StartingSpace;
