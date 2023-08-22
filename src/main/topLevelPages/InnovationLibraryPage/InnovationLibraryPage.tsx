import React from 'react';
import { Box, Link } from '@mui/material';
import { PageTitle, Text } from '../../../core/ui/typography';
import TopLevelDesktopLayout from '../../ui/layout/TopLevelDesktopLayout';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import { useInnovationLibraryQuery } from '../../../core/apollo/generated/apollo-hooks';
import DashboardInnovationPacks from '../../../domain/collaboration/InnovationPack/DashboardInnovationPacks/DashboardInnovationPacks';
import DashboardLibraryTemplates from '../../../domain/collaboration/InnovationPack/DashboardLibraryTemplates/DashboardLibraryTemplates';
import useInnovationPackCardProps from '../../../domain/collaboration/InnovationPack/DashboardInnovationPacks/useInnovationPackCardProps';
import useLibraryTemplateCardProps from '../../../domain/collaboration/InnovationPack/DashboardLibraryTemplates/useLibraryTemplateCardProps';
import { gutters } from '../../../core/ui/grid/utils';
import { useTranslation } from 'react-i18next';
import { TranslateWithElements } from '../../../domain/shared/i18n/TranslateWithElements';
import { useConfig } from '../../../domain/platform/config/useConfig';

const InnovationLibraryPage = () => {
  const { data: innovationLibraryData } = useInnovationLibraryQuery();

  const innovationPacks = useInnovationPackCardProps(innovationLibraryData?.platform.library.innovationPacks);
  const templates = useLibraryTemplateCardProps(innovationLibraryData?.platform.library.innovationPacks);

  const { t } = useTranslation();
  const { platform } = useConfig();
  const tLinks = TranslateWithElements(<Link underline="always" target="_blank" rel="noopener noreferrer" />);
  const subtitleText = tLinks('pages.innovationLibrary.subtitle', {
    click: { href: platform?.innovationLibrary, target: '_blank' },
  });

  return (
    <TopLevelDesktopLayout>
      <Box flexGrow={1}>
        <PageTitle lineHeight={gutters(2)}>{t('pages.innovationLibrary.title')}</PageTitle>
        <Text>{subtitleText}</Text>
      </Box>
      <PageContentColumn columns={12}>
        <DashboardInnovationPacks
          headerTitle={t('pages.innovationLibrary.innovationPacks.headerTitle')}
          dialogTitle={t('pages.innovationLibrary.innovationPacks.dialogTitle')}
          innovationPacks={innovationPacks}
        />
        <DashboardLibraryTemplates
          headerTitle={t('pages.innovationLibrary.libraryTemplates.headerTitle')}
          dialogTitle={t('pages.innovationLibrary.libraryTemplates.dialogTitle')}
          templates={templates}
        />
      </PageContentColumn>
    </TopLevelDesktopLayout>
  );
};

export default InnovationLibraryPage;
