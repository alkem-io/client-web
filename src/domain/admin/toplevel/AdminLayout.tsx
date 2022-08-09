import React, { FC, useCallback } from 'react';
import { AdminSection, adminTabs } from './constants';
import { TabDefinition } from '../../../components/core/PageTabs/PageTabs';
import { useTranslation } from 'react-i18next';
import PageBanner from '../../shared/components/PageHeader/PageBanner';
import HeaderNavigationTabs from '../../shared/components/PageHeader/HeaderNavigationTabs';
import HeaderNavigationTab from '../../shared/components/PageHeader/HeaderNavigationTab';

interface AdminLayoutProps {
  currentTab: AdminSection;
}

const AdminLayout: FC<AdminLayoutProps> = ({ currentTab, children }) => {
  const { t } = useTranslation();
  const routePrefix = '';
  const getTabLabel = useCallback((section: AdminSection) => t(`common.${section}` as const), [t]);
  const getTabRoute = (tab: TabDefinition<string | number>) => {
    const { route } = tab;
    return `${routePrefix}${route}`;
  };

  return (
    <>
      <PageBanner title={t('common.administration')} />
      <HeaderNavigationTabs value={currentTab}>
        {adminTabs.map(tab => {
          return (
            <HeaderNavigationTab
              key={tab.route}
              label={getTabLabel(tab.section)}
              value={tab.section}
              to={getTabRoute(tab)}
            />
          );
        })}
      </HeaderNavigationTabs>

      {children}
    </>
  );
};

export default AdminLayout;
