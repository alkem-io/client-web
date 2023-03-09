import React, { FC, useCallback } from 'react';
import { AdminSection, adminTabs } from './constants';
import { useTranslation } from 'react-i18next';
import JourneyPageBanner from '../../../../shared/components/PageHeader/JourneyPageBanner';
import HeaderNavigationTabs from '../../../../shared/components/PageHeader/HeaderNavigationTabs';
import HeaderNavigationTab from '../../../../shared/components/PageHeader/HeaderNavigationTab';
import TopLevelDesktopLayout from '../../../../../core/ui/layout/TopLevel/TopLevelDesktopLayout';

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
          <JourneyPageBanner title={t('common.administration')} journeyTypeName="admin" />
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
