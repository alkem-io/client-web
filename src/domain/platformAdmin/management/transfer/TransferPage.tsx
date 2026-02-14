import { AdminSection, adminTabs } from '@/domain/platformAdmin/layout/toplevel/constants';
import SpacePageBanner from '@/domain/space/layout/tabbedLayout/layout/SpacePageBanner';
import HeaderNavigationTabs from '@/domain/shared/components/PageHeader/HeaderNavigationTabs';
import HeaderNavigationTab from '@/domain/shared/components/PageHeader/HeaderNavigationTab';
import AdminBreadcrumbs from '@/main/admin/AdminBreadcrumbs';
import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import { useTranslation } from 'react-i18next';
import TransferCalloutSection from './transferCallout/TransferCalloutSection';

const currentTab = AdminSection.Transfer;

const TransferPage = () => {
  const { t } = useTranslation();

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
          <TransferCalloutSection />
        </PageContentColumn>
      </PageContent>
    </TopLevelLayout>
  );
};

export default TransferPage;
