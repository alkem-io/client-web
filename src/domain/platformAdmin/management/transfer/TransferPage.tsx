import { AdminSection, adminTabs } from '@/domain/platformAdmin/layout/toplevel/constants';
import SpacePageBanner from '@/domain/space/layout/tabbedLayout/layout/SpacePageBanner';
import HeaderNavigationTabs from '@/domain/shared/components/PageHeader/HeaderNavigationTabs';
import HeaderNavigationTab from '@/domain/shared/components/PageHeader/HeaderNavigationTab';
import AdminBreadcrumbs from '@/main/admin/AdminBreadcrumbs';
import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TransferCalloutSection from './transferCallout/TransferCalloutSection';
import TransferSpaceSection from './transferSpace/TransferSpaceSection';
import { Caption } from '@/core/ui/typography';
import Gutters from '@/core/ui/grid/Gutters';

const currentTab = AdminSection.Transfer;

const TransferPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <TopLevelLayout
      header={
        <>
          <SpacePageBanner title={t('common.administration')} isAdmin />
          <HeaderNavigationTabs value={currentTab} defaultTab={AdminSection.Space}>
            {adminTabs.map(tab => (
              <HeaderNavigationTab
                key={tab.route}
                label={t(`common.${tab.section}` as const)}
                value={tab.section}
                to={tab.route}
              />
            ))}
          </HeaderNavigationTabs>
        </>
      }
      breadcrumbs={<AdminBreadcrumbs />}
    >
      <PageContent>
        <PageContentColumn columns={12}>
          <Gutters padding={0} gap={0} alignItems={'center'} flex={1}>
            <Caption sx={{ color: theme.palette.error.main }} title={t('components.deleteEntity.title')}>
              {t('components.deleteEntity.title')}
            </Caption>
          </Gutters>
          <TransferCalloutSection />
          <TransferSpaceSection />
        </PageContentColumn>
      </PageContent>
    </TopLevelLayout>
  );
};

export default TransferPage;
