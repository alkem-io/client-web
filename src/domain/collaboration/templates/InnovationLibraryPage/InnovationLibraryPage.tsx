import React from 'react';
import { Box } from '@mui/material';
import { PageTitle, Text } from '../../../../core/ui/typography';
import TopLevelDesktopLayout from '../../../platform/ui/PageLayout/TopLevelDesktopLayout';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { useInnovationLibraryQuery } from '../../../../core/apollo/generated/apollo-hooks';
import DashboardInnovationPacks from '../../InnovationPack/DashboardInnovationPacks/DashboardInnovationPacks';
import useInnovationPackCardProps from '../../InnovationPack/DashboardInnovationPacks/useInnovationPackCardProps';
import { gutters } from '../../../../core/ui/grid/utils';
import { useTranslation } from 'react-i18next';

const InnovationLibraryPage = () => {
  const { data: innovationLibraryData } = useInnovationLibraryQuery();

  const innovationPacks = useInnovationPackCardProps(innovationLibraryData?.platform.library.innovationPacks);

  const { t } = useTranslation();

  return (
    <TopLevelDesktopLayout>
      <Box flexGrow={1}>
        <PageTitle lineHeight={gutters(2)}>{t('pages.innovationLibrary.title')}</PageTitle>
        <Text>{t('pages.innovationLibrary.subtitle')}</Text>
      </Box>
      <PageContentColumn columns={12}>
        <DashboardInnovationPacks
          headerTitle={t('pages.innovationLibrary.innovationPacks.headerTitle')}
          innovationPacks={innovationPacks}
        />
      </PageContentColumn>
    </TopLevelDesktopLayout>
  );
};

export default InnovationLibraryPage;
