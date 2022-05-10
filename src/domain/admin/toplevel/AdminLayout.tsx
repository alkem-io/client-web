import React, { FC, useCallback } from 'react';
import { AdminSection, adminTabs } from './constants';
import PageTabs from '../../../components/core/PageTabs/PageTabs';
import { useTranslation } from 'react-i18next';

interface AdminLayoutProps {
  currentTab: AdminSection;
}

const AdminLayout: FC<AdminLayoutProps> = ({ currentTab, children }) => {
  const { t } = useTranslation();

  const getTabLabel = useCallback((section: AdminSection) => t(`common.${section}` as const), [t]);

  return (
    <>
      <PageTabs tabs={adminTabs} currentTab={currentTab} aria-label="Admin tabs" getTabLabel={getTabLabel} />
      {children}
    </>
  );
};

export default AdminLayout;
