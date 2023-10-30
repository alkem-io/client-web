import React, { FC, useCallback } from 'react';
import { AdminSection, adminTabs } from './constants';
import { useTranslation } from 'react-i18next';
import SpacePageBanner from '../../../../journey/space/layout/SpacePageBanner';
import HeaderNavigationTabs from '../../../../shared/components/PageHeader/HeaderNavigationTabs';
import HeaderNavigationTab from '../../../../shared/components/PageHeader/HeaderNavigationTab';
import TopLevelLayout from '../../../../../main/ui/layout/TopLevelLayout';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';

interface AdminLayoutProps {
  currentTab: AdminSection;
}

const AdminLayout: FC<AdminLayoutProps> = ({ currentTab, children }) => {
  const { t } = useTranslation();
  const getTabLabel = useCallback((section: AdminSection) => t(`common.${section}` as const), [t]);

  return (
    <TopLevelLayout
      header={
        <>
          <SpacePageBanner title={t('common.administration')} journeyTypeName="admin" />
          <HeaderNavigationTabs value={currentTab} defaultTab={AdminSection.Space}>
            {adminTabs.map(tab => {
              return (
                <HeaderNavigationTab
                  key={tab.route}
                  label={getTabLabel(tab.section)}
                  value={tab.section}
                  to={tab.route}
                />
              );
            })}
          </HeaderNavigationTabs>
        </>
      }
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
