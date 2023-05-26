import React from 'react';
import { Box } from '@mui/material';
import { PageTitle, Text } from '../../../../core/ui/typography';
import TopLevelDesktopLayout from '../../ui/PageLayout/TopLevelDesktopLayout';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { useInnovationLibraryQuery } from '../../../../core/apollo/generated/apollo-hooks';
import DashboardInnovationPacks from '../../../collaboration/InnovationPack/DashboardInnovationPacks/DashboardInnovationPacks';
import DashboardLibraryTemplates from '../../../collaboration/InnovationPack/DashboardLibraryTemplates/DashboardLibraryTemplates';
import useInnovationPackCardProps from '../../../collaboration/InnovationPack/DashboardInnovationPacks/useInnovationPackCardProps';
import useLibraryTemplateCardProps from '../../../collaboration/InnovationPack/DashboardLibraryTemplates/useLibraryTemplateCardProps';
import { gutters } from '../../../../core/ui/grid/utils';
import { useTranslation } from 'react-i18next';

const InnovationLibraryPage = () => {
  const { data: innovationLibraryData } = useInnovationLibraryQuery();

  const innovationPacks = useInnovationPackCardProps(innovationLibraryData?.platform.library.innovationPacks);
  const templates = useLibraryTemplateCardProps(innovationLibraryData?.platform.library.innovationPacks);

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
        <DashboardLibraryTemplates
          headerTitle={t('pages.innovationLibrary.libraryTemplates.headerTitle')}
          templates={templates}
        />
      </PageContentColumn>
    </TopLevelDesktopLayout>
  );
};

export default InnovationLibraryPage;
