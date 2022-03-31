import React, { FC } from 'react';
import AdminTabs from './AdminTabs';
import { AdminSection, adminTabs } from './constants';

interface AdminLayoutProps {
  currentTab: AdminSection;
}

const AdminLayout: FC<AdminLayoutProps> = ({ currentTab, children }) => {
  return (
    <>
      <AdminTabs tabs={adminTabs} currentTab={currentTab} aria-label="Admin tabs" />
      {children}
    </>
  );
};

export default AdminLayout;
