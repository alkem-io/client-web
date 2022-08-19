import React, { FC, useCallback } from 'react';
import { AdminSection, adminTabs } from './constants';
import { useTranslation } from 'react-i18next';
import PageBanner from '../../shared/components/PageHeader/PageBanner';
import HeaderNavigationTabs from '../../shared/components/PageHeader/HeaderNavigationTabs';
import HeaderNavigationTab from '../../shared/components/PageHeader/HeaderNavigationTab';
import SectionSpacer from '../../shared/components/Section/SectionSpacer';

interface AdminLayoutProps {
  currentTab: AdminSection;
}

const AdminLayout: FC<AdminLayoutProps> = ({ currentTab, children }) => {
  const { t } = useTranslation();
  const getTabLabel = useCallback((section: AdminSection) => t(`common.${section}` as const), [t]);

  return (
    <>
      <PageBanner title={t('common.administration')} />
      <HeaderNavigationTabs value={currentTab}>
        {adminTabs.map(tab => {
          return (
            <HeaderNavigationTab key={tab.route} label={getTabLabel(tab.section)} value={tab.section} to={tab.route} />
          );
        })}
      </HeaderNavigationTabs>
      <SectionSpacer />

      {children}
    </>
  );
};

export default AdminLayout;
