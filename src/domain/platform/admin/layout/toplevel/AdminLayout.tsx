import PageContent from '@/core/ui/content/PageContent';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import SpacePageBanner from '@/domain/journey/space/layout/SpacePageBanner';
import HeaderNavigationTab from '@/domain/shared/components/PageHeader/HeaderNavigationTab';
import HeaderNavigationTabs from '@/domain/shared/components/PageHeader/HeaderNavigationTabs';
import AdminBreadcrumbs from '@/main/admin/AdminBreadcrumbs';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminSection, adminTabs } from './constants';

interface AdminLayoutProps extends PropsWithChildren {
  currentTab: AdminSection;
}

const AdminLayout: FC<AdminLayoutProps> = ({ currentTab, children }) => {
  const { t } = useTranslation();

  return (
    <TopLevelLayout
      header={
        <>
          <SpacePageBanner title={t('common.administration')} />
          <HeaderNavigationTabs value={currentTab} defaultTab={AdminSection.Space}>
            {adminTabs.map(tab => {
              return (
                <HeaderNavigationTab
                  key={tab.route}
                  label={t(`common.${tab.section}` as const)}
                  value={tab.section}
                  to={tab.route}
                />
              );
            })}
          </HeaderNavigationTabs>
        </>
      }
      breadcrumbs={<AdminBreadcrumbs />}
    >
      <PageContent gridContainerProps={{ padding: 0 }}>
        <PageContentColumn columns={12}>
          <PageContentBlockSeamless>{children}</PageContentBlockSeamless>
        </PageContentColumn>
      </PageContent>
    </TopLevelLayout>
  );
};

export default AdminLayout;
