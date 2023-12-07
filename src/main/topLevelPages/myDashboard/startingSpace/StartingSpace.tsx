import React from 'react';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import { Link } from '@mui/material';

const StartingSpace = () => {
  const { t } = useTranslation();
  return (
    <Link href={t('pages.home.sections.startingSpace.url')}>
      <PageContentBlock accent row flexWrap="wrap">
        <BlockTitle>
          {t('pages.home.sections.startingSpace.icon')} {t('pages.home.sections.startingSpace.title')}
        </BlockTitle>
        <Caption>{t('pages.home.sections.startingSpace.description')}</Caption>
      </PageContentBlock>
    </Link>
  );
};

export default StartingSpace;
