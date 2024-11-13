import React from 'react';
import { Link } from '@mui/material';
import TopLevelPageLayout from '../../ui/layout/topLevelPageLayout/TopLevelPageLayout';
import PageContentColumn from '@core/ui/content/PageContentColumn';
import { useInnovationLibraryQuery } from '@core/apollo/generated/apollo-hooks';
import DashboardInnovationPacks from '@domain/InnovationPack/DashboardInnovationPacks/DashboardInnovationPacks';
import DashboardLibraryTemplates from '@domain/InnovationPack/DashboardLibraryTemplates/DashboardLibraryTemplates';
import useInnovationPackCardProps from '@domain/InnovationPack/DashboardInnovationPacks/useInnovationPackCardProps';
import { useTranslation } from 'react-i18next';
import { TranslateWithElements } from '@domain/shared/i18n/TranslateWithElements';
import { useConfig } from '@domain/platform/config/useConfig';
import InnovationLibraryIcon from './InnovationLibraryIcon';
import BreadcrumbsItem from '@core/ui/navigation/BreadcrumbsItem';
import TopLevelPageBreadcrumbs from '../topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';

const InnovationLibraryPage = () => {
  const { data: innovationLibraryData } = useInnovationLibraryQuery();

  const innovationPacks = useInnovationPackCardProps(innovationLibraryData?.platform.library.innovationPacks);
  const templates = innovationLibraryData?.platform.library.templates;

  const { t } = useTranslation();
  const { locations } = useConfig();
  const tLinks = TranslateWithElements(<Link underline="always" target="_blank" rel="noopener noreferrer" />);
  const subtitleText = tLinks('pages.innovationLibrary.subtitle', {
    click: { href: locations?.innovationLibrary, target: '_blank' },
  });

  return (
    <TopLevelPageLayout
      title={t('pages.innovationLibrary.title')}
      subtitle={subtitleText}
      iconComponent={InnovationLibraryIcon}
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem uri="/innovation-library" iconComponent={InnovationLibraryIcon}>
            {t('pages.innovationLibrary.shortName')}
          </BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
    >
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
    </TopLevelPageLayout>
  );
};

export default InnovationLibraryPage;
