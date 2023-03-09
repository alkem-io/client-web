import React, { FC, useCallback } from 'react';
import { AdminSection, adminTabs } from './constants';
import { useTranslation } from 'react-i18next';
import EntityPageBanner from '../../../../shared/components/PageHeader/EntityPageBanner';
import HeaderNavigationTabs from '../../../../shared/components/PageHeader/HeaderNavigationTabs';
import HeaderNavigationTab from '../../../../shared/components/PageHeader/HeaderNavigationTab';
import TopLevelDesktopLayout from '../../../ui/PageLayout/TopLevelDesktopLayout';

interface AdminLayoutProps {
  currentTab: AdminSection;
}

const AdminLayout: FC<AdminLayoutProps> = ({ currentTab, children }) => {
  const { t } = useTranslation();
  const getTabLabel = useCallback((section: AdminSection) => t(`common.${section}` as const), [t]);

  return (
    <TopLevelDesktopLayout
      heading={
        <>
          <EntityPageBanner title={t('common.administration')} entityTypeName="admin" />
          <HeaderNavigationTabs value={currentTab} defaultTab={AdminSection.Hub}>
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
      {children}
    </TopLevelDesktopLayout>
  );
};

export default AdminLayout;
